import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import "../styles/premiumHero.css";
import SignupOffer from "./SignupOffer";

/* --------------------------------
   FRAME CONFIG
-------------------------------- */

const TOTAL_FRAMES = 206;

/*
  Only load a very small number of frames
  before showing the hero.
*/
const INITIAL_FRAMES = 4;

/*
  Load a small window around the current
  frame instead of ±18 frames.
*/
const NEARBY_FRAMES = 6;

/*
  How many frames to progressively load
  in the background after the hero is ready.
*/
const BACKGROUND_BATCH_SIZE = 4;


/* --------------------------------
   FRAME PATH
-------------------------------- */

const getFramePath = (index) => {
  const frameNumber = String(index + 1).padStart(3, "0");

  return `/skin-frames/ezgif-frame-${frameNumber}.webp`;
};


/* --------------------------------
   HELPERS
-------------------------------- */

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);


export default function PremiumHero() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  /*
    Image storage
  */
  const imagesRef = useRef([]);

  /*
    Prevent duplicate requests
  */
  const loadingRef = useRef(new Set());
  const loadedRef = useRef(new Set());

  /*
    Current frame
  */
  const currentFrameRef = useRef(0);

  /*
    Animation frame
  */
  const animationFrameRef = useRef(null);

  /*
    Idle callback
  */
  const idleCallbackRef = useRef(null);

  /*
    Background loading
  */
  const backgroundLoadingRef = useRef(false);
  const backgroundCursorRef = useRef(INITIAL_FRAMES);

  /*
    Canvas dimensions cache
  */
  const canvasSizeRef = useRef({
    width: 0,
    height: 0,
    pixelRatio: 1,
  });

  /*
    Last drawn frame
  */
  const lastDrawnFrameRef = useRef(-1);

  /*
    State
  */
  const [loadedFrames, setLoadedFrames] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [showSignupOffer, setShowSignupOffer] = useState(false);


  /* --------------------------------
     SCROLL
  -------------------------------- */

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });


  /*
    Slightly lighter spring than before.
    This reduces unnecessary frame changes
    during very fast scrolling.
  */
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 32,
    mass: 0.25,
  });


  /* --------------------------------
     LOAD IMAGE
  -------------------------------- */

  const loadImage = useCallback((index) => {
    if (
      index < 0 ||
      index >= TOTAL_FRAMES ||
      loadedRef.current.has(index) ||
      loadingRef.current.has(index)
    ) {
      return Promise.resolve(
        imagesRef.current[index] || null
      );
    }

    loadingRef.current.add(index);

    return new Promise((resolve) => {
      const image = new Image();

      /*
        Async decoding helps keep image decoding
        away from the critical render path.
      */
      image.decoding = "async";

      const path = getFramePath(index);

      image.onload = () => {
        /*
          Store the image immediately.

          Do NOT wait for image.decode()
          before marking it available.
        */
        if (
          image.naturalWidth > 0 &&
          image.naturalHeight > 0
        ) {
          imagesRef.current[index] = image;

          loadedRef.current.add(index);

          setLoadedFrames(
            loadedRef.current.size
          );
        }

        loadingRef.current.delete(index);

        resolve(image);
      };

      image.onerror = () => {
        loadingRef.current.delete(index);

        resolve(null);
      };

      image.src = path;
    });
  }, []);


  /* --------------------------------
     INITIAL PRELOAD
  -------------------------------- */

  useEffect(() => {
    let cancelled = false;

    const preloadInitialFrames = async () => {
      /*
        Load only the first few frames.

        Sequential loading avoids firing many
        large image requests at once.
      */
      for (
        let index = 0;
        index < INITIAL_FRAMES;
        index++
      ) {
        if (cancelled) return;

        await loadImage(index);
      }

      if (cancelled) return;

      /*
        Show the hero as soon as the first
        frames are available.
      */
      setIsReady(true);
    };

    preloadInitialFrames();

    return () => {
      cancelled = true;
    };
  }, [loadImage]);


  /* --------------------------------
     CANVAS CONTEXT
  -------------------------------- */

  useEffect(() => {
    if (!canvasRef.current) return;

    const context =
      canvasRef.current.getContext("2d", {
        alpha: true,
        desynchronized: true,
      });

    contextRef.current = context;

    return () => {
      contextRef.current = null;
    };
  }, []);


  /* --------------------------------
     UPDATE CANVAS SIZE
  -------------------------------- */

  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect =
      canvas.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    if (width <= 0 || height <= 0) return;

    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    const canvasWidth =
      Math.floor(width * pixelRatio);

    const canvasHeight =
      Math.floor(height * pixelRatio);

    if (
      canvas.width !== canvasWidth ||
      canvas.height !== canvasHeight
    ) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    canvasSizeRef.current = {
      width,
      height,
      pixelRatio,
    };
  }, []);


  /* --------------------------------
     FIND BEST AVAILABLE FRAME
  -------------------------------- */

  const getValidFrame = useCallback(
    (requestedIndex) => {
      const images = imagesRef.current;

      /*
        First try exact frame.
      */
      const requested =
        images[requestedIndex];

      if (
        requested &&
        requested.complete &&
        requested.naturalWidth > 0
      ) {
        return requested;
      }

      /*
        Search only a few nearby frames.

        This keeps fallback lookup cheap.
      */
      for (
        let distance = 1;
        distance <= NEARBY_FRAMES;
        distance++
      ) {
        const previous =
          requestedIndex - distance;

        if (previous >= 0) {
          const image =
            images[previous];

          if (
            image &&
            image.complete &&
            image.naturalWidth > 0
          ) {
            return image;
          }
        }

        const next =
          requestedIndex + distance;

        if (next < TOTAL_FRAMES) {
          const image =
            images[next];

          if (
            image &&
            image.complete &&
            image.naturalWidth > 0
          ) {
            return image;
          }
        }
      }

      /*
        Last fallback:
        search loaded frames globally.

        This is rarely reached.
      */
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const image = images[i];

        if (
          image &&
          image.complete &&
          image.naturalWidth > 0
        ) {
          return image;
        }
      }

      return null;
    },
    []
  );


  /* --------------------------------
     DRAW FRAME
  -------------------------------- */

  const drawFrame = useCallback(
    (frameIndex) => {
      const canvas = canvasRef.current;
      const context = contextRef.current;

      if (!canvas || !context) return;

      /*
        Don't redraw the same frame.
      */
      if (
        lastDrawnFrameRef.current ===
        frameIndex
      ) {
        return;
      }

      const image =
        getValidFrame(frameIndex);

      if (!image) return;

      /*
        Use cached canvas dimensions.
      */
      const {
        width,
        height,
        pixelRatio,
      } = canvasSizeRef.current;

      if (width <= 0 || height <= 0) {
        updateCanvasSize();
      }

      const currentSize =
        canvasSizeRef.current;

      const canvasWidth =
        currentSize.width;

      const canvasHeight =
        currentSize.height;

      const ratio =
        currentSize.pixelRatio;

      if (
        canvasWidth <= 0 ||
        canvasHeight <= 0
      ) {
        return;
      }

      context.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
      );

      context.clearRect(
        0,
        0,
        canvasWidth,
        canvasHeight
      );

      const imageRatio =
        image.naturalWidth /
        image.naturalHeight;

      const canvasRatio =
        canvasWidth / canvasHeight;

      let drawWidth;
      let drawHeight;

      if (imageRatio > canvasRatio) {
        drawHeight = canvasHeight;

        drawWidth =
          canvasHeight * imageRatio;
      } else {
        drawWidth = canvasWidth;

        drawHeight =
          canvasWidth / imageRatio;
      }

      /*
        Small cinematic crop.
      */
      const scale = 1.03;

      drawWidth *= scale;
      drawHeight *= scale;

      const x =
        (canvasWidth - drawWidth) / 2;

      const y =
        (canvasHeight - drawHeight) / 2;

      context.drawImage(
        image,
        x,
        y,
        drawWidth,
        drawHeight
      );

      lastDrawnFrameRef.current =
        frameIndex;
    },
    [
      getValidFrame,
      updateCanvasSize,
    ]
  );


  /* --------------------------------
     INITIAL CANVAS DRAW
  -------------------------------- */

  useEffect(() => {
    if (!isReady) return;

    updateCanvasSize();

    const frame =
      requestAnimationFrame(() => {
        drawFrame(0);
      });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [
    isReady,
    drawFrame,
    updateCanvasSize,
  ]);


  /* --------------------------------
     LOAD NEARBY FRAMES
  -------------------------------- */

  const preloadAroundFrame = useCallback(
    (centerFrame) => {
      /*
        Smaller loading window.
      */
      const start = Math.max(
        0,
        centerFrame - NEARBY_FRAMES
      );

      const end = Math.min(
        TOTAL_FRAMES,
        centerFrame + NEARBY_FRAMES + 1
      );

      /*
        Prioritize frames ahead of the user.
      */
      const indexes = [];

      for (
        let i = centerFrame;
        i < end;
        i++
      ) {
        indexes.push(i);
      }

      for (
        let i = centerFrame - 1;
        i >= start;
        i--
      ) {
        indexes.push(i);
      }

      /*
        Only start a few requests at a time.
      */
      let position = 0;

      const loadNext = () => {
        if (position >= indexes.length) {
          return;
        }

        const index =
          indexes[position++];

        if (
          !loadedRef.current.has(index) &&
          !loadingRef.current.has(index)
        ) {
          loadImage(index).finally(() => {
            scheduleNext();
          });

          return;
        }

        scheduleNext();
      };

      const scheduleNext = () => {
        if (
          typeof window !== "undefined" &&
          "requestIdleCallback" in window
        ) {
          idleCallbackRef.current =
            window.requestIdleCallback(
              loadNext,
              {
                timeout: 500,
              }
            );
        } else {
          setTimeout(
            loadNext,
            40
          );
        }
      };

      scheduleNext();
    },
    [loadImage]
  );


  /* --------------------------------
     BACKGROUND LOAD ALL FRAMES
  -------------------------------- */

  const loadRemainingFrames =
    useCallback(() => {
      if (backgroundLoadingRef.current) {
        return;
      }

      backgroundLoadingRef.current =
        true;

      const loadBatch = () => {
        const start =
          backgroundCursorRef.current;

        if (start >= TOTAL_FRAMES) {
          backgroundLoadingRef.current =
            false;

          return;
        }

        const end = Math.min(
          start + BACKGROUND_BATCH_SIZE,
          TOTAL_FRAMES
        );

        backgroundCursorRef.current =
          end;

        const promises = [];

        for (
          let i = start;
          i < end;
          i++
        ) {
          if (
            !loadedRef.current.has(i) &&
            !loadingRef.current.has(i)
          ) {
            promises.push(
              loadImage(i)
            );
          }
        }

        Promise.all(promises).finally(() => {
          /*
            Continue only when browser is idle.
          */
          if (
            typeof window !== "undefined" &&
            "requestIdleCallback" in window
          ) {
            idleCallbackRef.current =
              window.requestIdleCallback(
                loadBatch,
                {
                  timeout: 1000,
                }
              );
          } else {
            setTimeout(
              loadBatch,
              100
            );
          }
        });
      };

      loadBatch();
    }, [loadImage]);


  /* --------------------------------
     START BACKGROUND LOADING
  -------------------------------- */

  useEffect(() => {
    if (!isReady) return;

    /*
      Give the browser a moment to render
      the hero before loading the rest.
    */
    const timer = setTimeout(() => {
      loadRemainingFrames();
    }, 800);

    return () => {
      clearTimeout(timer);
    };
  }, [
    isReady,
    loadRemainingFrames,
  ]);


  /* --------------------------------
     SCROLL → FRAME
  -------------------------------- */

  useEffect(() => {
    if (!isReady) return;

    const unsubscribe =
      smoothProgress.on(
        "change",
        (progress) => {
          const frame = Math.floor(
            clamp(
              progress,
              0,
              0.999999
            ) * TOTAL_FRAMES
          );

          /*
            Request nearby frames.
          */
          preloadAroundFrame(frame);

          /*
            Avoid unnecessary redraws.
          */
          if (
            frame ===
            currentFrameRef.current
          ) {
            return;
          }

          currentFrameRef.current =
            frame;

          /*
            Cancel previous pending draw.
          */
          if (
            animationFrameRef.current
          ) {
            cancelAnimationFrame(
              animationFrameRef.current
            );
          }

          /*
            Draw only once per browser frame.
          */
          animationFrameRef.current =
            requestAnimationFrame(() => {
              drawFrame(frame);
            });
        }
      );

    return () => {
      unsubscribe();

      if (
        animationFrameRef.current
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current =
          null;
      }
    };
  }, [
    isReady,
    smoothProgress,
    drawFrame,
    preloadAroundFrame,
  ]);


  /* --------------------------------
     RESIZE
  -------------------------------- */

  useEffect(() => {
    if (!isReady) return;

    let resizeTimer;

    const handleResize = () => {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        updateCanvasSize();

        lastDrawnFrameRef.current = -1;

        drawFrame(
          currentFrameRef.current
        );
      }, 150);
    };

    window.addEventListener(
      "resize",
      handleResize,
      {
        passive: true,
      }
    );

    return () => {
      clearTimeout(resizeTimer);

      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [
    isReady,
    drawFrame,
    updateCanvasSize,
  ]);


  /* --------------------------------
     SIGNUP OFFER
  -------------------------------- */

  useEffect(() => {
    if (!isReady) return;

    const alreadyShown =
      sessionStorage.getItem(
        "lumiere_signup_offer_shown"
      );

    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setShowSignupOffer(true);

      sessionStorage.setItem(
        "lumiere_signup_offer_shown",
        "true"
      );
    }, 700);

    return () => {
      clearTimeout(timer);
    };
  }, [isReady]);


  /* --------------------------------
     CLEANUP
  -------------------------------- */

  useEffect(() => {
    return () => {
      if (
        animationFrameRef.current
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }

      if (
        idleCallbackRef.current &&
        "cancelIdleCallback" in window
      ) {
        window.cancelIdleCallback(
          idleCallbackRef.current
        );
      }
    };
  }, []);


  /* --------------------------------
     LOADING PERCENTAGE
  -------------------------------- */

  const loadingPercentage = Math.min(
    Math.round(
      (
        Math.min(
          loadedFrames,
          INITIAL_FRAMES
        ) /
          INITIAL_FRAMES
      ) * 100
    ),
    100
  );


  /* --------------------------------
     RENDER
  -------------------------------- */

  return (
    <>
      <section
        ref={sectionRef}
        className="premium-hero"
      >
        <div className="premium-hero__sticky">

          {/* CANVAS */}
          <canvas
            ref={canvasRef}
            className="premium-hero__canvas"
          />

          {/* OVERLAY */}
          <div className="premium-hero__overlay" />


          {/* LOADER */}
          {!isReady && (
            <div className="premium-hero__loader">

              <div className="premium-hero__loader-brand">
                LUMIÈRE
              </div>

              <div className="premium-hero__loader-line">
                <motion.div
                  className="premium-hero__loader-progress"
                  animate={{
                    width: `${loadingPercentage}%`,
                  }}
                  transition={{
                    duration: 0.15,
                    ease: "easeOut",
                  }}
                />
              </div>

              <span>
                {loadingPercentage}%
              </span>

            </div>
          )}


          {/* HERO CONTENT */}
          <motion.div
            className="premium-hero__content"

            initial={{
              opacity: 0,
            }}

            animate={{
              opacity: isReady ? 1 : 0,
            }}

            transition={{
              duration: 1.2,
              ease: "easeOut",
            }}
          >

            <div className="premium-hero__eyebrow">
              ADVANCED SKINCARE
            </div>

            <h1>
              THE RITUAL
              <br />
              OF RADIANCE
            </h1>

            <p>
              Where science meets purity.
              <br />
              Advanced skincare rituals
              <br />
              made for luminous skin.
            </p>

            <button
              className="premium-hero__cta"
            >
              <span>
                DISCOVER THE RITUAL
              </span>

              <span className="premium-hero__arrow">
                →
              </span>
            </button>

          </motion.div>


          {/* SCROLL INDICATOR */}
          <motion.div
            className="premium-hero__scroll"

            animate={{
              opacity: isReady ? 1 : 0,
            }}
          >

            <div className="premium-hero__scroll-line">

              <motion.div
                style={{
                  scaleY: smoothProgress,
                  transformOrigin: "top",
                }}
              />

            </div>

          </motion.div>

        </div>
      </section>


      {/* SIGNUP OFFER */}
      {showSignupOffer && (
        <SignupOffer
          onClose={() =>
            setShowSignupOffer(false)
          }
        />
      )}
    </>
  );
}