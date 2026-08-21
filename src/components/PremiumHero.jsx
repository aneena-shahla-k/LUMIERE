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
   CONFIG
-------------------------------- */

const TOTAL_FRAMES = 206;

/*
  Only these frames are required before
  the hero becomes visible.
*/
const INITIAL_FRAMES = 4;

/*
  How many frames around the current
  frame should be requested.
*/
const PRELOAD_AHEAD = 8;
const PRELOAD_BEHIND = 3;

/*
  Background loading batch.
*/
const BACKGROUND_BATCH = 4;

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
    Actual image objects.
  */
  const imagesRef = useRef(
    new Array(TOTAL_FRAMES).fill(null)
  );

  /*
    Promise for frames currently loading.
    This prevents duplicate network requests.
  */
  const loadingPromisesRef = useRef(
    new Map()
  );

  /*
    Frames that have successfully loaded.
  */
  const loadedRef = useRef(new Set());

  /*
    Current frame being displayed.
  */
  const currentFrameRef = useRef(0);

  /*
    Drawing RAF.
  */
  const drawRAFRef = useRef(null);

  /*
    Background loading state.
  */
  const backgroundStartedRef = useRef(false);
  const backgroundCursorRef = useRef(INITIAL_FRAMES);

  /*
    Last canvas size.
  */
  const canvasSizeRef = useRef({
    width: 0,
    height: 0,
    pixelRatio: 1,
  });

  const [isReady, setIsReady] = useState(false);
  const [loadedFrames, setLoadedFrames] = useState(0);
  const [showSignupOffer, setShowSignupOffer] =
    useState(false);

  /* --------------------------------
     SCROLL
  -------------------------------- */

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /*
    Only the scroll indicator uses smoothing.
    Frame selection itself stays responsive.
  */
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    mass: 0.2,
  });

  /* --------------------------------
     LOAD ONE IMAGE
  -------------------------------- */

  const loadImage = useCallback((index) => {
    if (
      index < 0 ||
      index >= TOTAL_FRAMES
    ) {
      return Promise.resolve(null);
    }

    /*
      Already loaded.
    */
    if (loadedRef.current.has(index)) {
      return Promise.resolve(
        imagesRef.current[index]
      );
    }

    /*
      Already loading.
      Return the SAME promise.
    */
    if (
      loadingPromisesRef.current.has(index)
    ) {
      return loadingPromisesRef.current.get(
        index
      );
    }

    const promise = new Promise((resolve) => {
      const image = new Image();

      image.decoding = "async";

      image.onload = async () => {
        if (
          image.naturalWidth > 0 &&
          image.naturalHeight > 0
        ) {
          imagesRef.current[index] = image;

          loadedRef.current.add(index);

          setLoadedFrames(
            loadedRef.current.size
          );

          /*
            Ask browser to decode before
            drawing when supported.
          */
          if (image.decode) {
            try {
              await image.decode();
            } catch {
              /*
                Decode failure is harmless.
              */
            }
          }

          resolve(image);
        } else {
          resolve(null);
        }

        loadingPromisesRef.current.delete(
          index
        );
      };

      image.onerror = () => {
        loadingPromisesRef.current.delete(
          index
        );

        resolve(null);
      };

      image.src = getFramePath(index);
    });

    loadingPromisesRef.current.set(
      index,
      promise
    );

    return promise;
  }, []);

  /* --------------------------------
     INITIAL LOAD
  -------------------------------- */

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      /*
        First frame is the most important.
      */
      await loadImage(0);

      if (cancelled) return;

      /*
        Show the hero as soon as the first
        frame exists.
      */
      setIsReady(true);

      /*
        Load first few frames in parallel.
      */
      const initialPromises = [];

      for (
        let i = 1;
        i < INITIAL_FRAMES;
        i++
      ) {
        initialPromises.push(
          loadImage(i)
        );
      }

      await Promise.all(initialPromises);
    };

    start();

    return () => {
      cancelled = true;
    };
  }, [loadImage]);

  /* --------------------------------
     CANVAS SETUP
  -------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });

    if (!context) return;

    contextRef.current = context;

    return () => {
      contextRef.current = null;
    };
  }, []);

  /* --------------------------------
     CANVAS RESIZE
  -------------------------------- */

  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect =
      canvas.getBoundingClientRect();

    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    if (width <= 0 || height <= 0) return;

    /*
      Mobile gets DPR 1.
      Desktop gets max DPR 2.

      This significantly reduces canvas
      rendering cost on high-DPI phones.
    */
    const isMobile =
      window.innerWidth <= 768;

    const pixelRatio = isMobile
      ? 1
      : Math.min(
          window.devicePixelRatio || 1,
          2
        );

    const canvasWidth = Math.round(
      width * pixelRatio
    );

    const canvasHeight = Math.round(
      height * pixelRatio
    );

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
     DRAW FRAME
  -------------------------------- */

  const drawFrame = useCallback(
    (requestedIndex) => {
      const canvas = canvasRef.current;
      const context = contextRef.current;

      if (!canvas || !context) return;

      let frameIndex = clamp(
        requestedIndex,
        0,
        TOTAL_FRAMES - 1
      );

      /*
        Requested frame.
      */
      let image =
        imagesRef.current[frameIndex];

      /*
        If requested frame isn't ready,
        search nearby instead of doing a
        huge 206-frame scan.
      */
      if (
        !image ||
        !image.complete ||
        image.naturalWidth <= 0
      ) {
        for (
          let offset = 1;
          offset <= 10;
          offset++
        ) {
          const forward =
            frameIndex + offset;

          const backward =
            frameIndex - offset;

          if (
            forward < TOTAL_FRAMES &&
            imagesRef.current[forward]
          ) {
            image =
              imagesRef.current[forward];

            break;
          }

          if (
            backward >= 0 &&
            imagesRef.current[backward]
          ) {
            image =
              imagesRef.current[backward];

            break;
          }
        }
      }

      if (!image) return;

      if (
        !image.complete ||
        image.naturalWidth <= 0
      ) {
        return;
      }

      updateCanvasSize();

      const {
        width,
        height,
        pixelRatio,
      } = canvasSizeRef.current;

      if (!width || !height) return;

      /*
        Clear.
      */
      context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
      );

      context.clearRect(
        0,
        0,
        width,
        height
      );

      /*
        Cover behaviour.
      */
      const imageRatio =
        image.naturalWidth /
        image.naturalHeight;

      const canvasRatio =
        width / height;

      let drawWidth;
      let drawHeight;

      if (imageRatio > canvasRatio) {
        drawHeight = height;
        drawWidth =
          height * imageRatio;
      } else {
        drawWidth = width;
        drawHeight =
          width / imageRatio;
      }

      /*
        Tiny scale to avoid visible edges.
      */
      const scale = 1.03;

      drawWidth *= scale;
      drawHeight *= scale;

      const x =
        (width - drawWidth) / 2;

      const y =
        (height - drawHeight) / 2;

      context.drawImage(
        image,
        x,
        y,
        drawWidth,
        drawHeight
      );

      currentFrameRef.current =
        frameIndex;
    },
    [updateCanvasSize]
  );

  /* --------------------------------
     FIRST DRAW
  -------------------------------- */

  useEffect(() => {
    if (!isReady) return;

    const raf =
      requestAnimationFrame(() => {
        drawFrame(0);
      });

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [isReady, drawFrame]);

  /* --------------------------------
     PRELOAD AROUND CURRENT FRAME
  -------------------------------- */

  const preloadAroundFrame =
    useCallback(
      (centerFrame) => {
        const start = Math.max(
          0,
          centerFrame - PRELOAD_BEHIND
        );

        const end = Math.min(
          TOTAL_FRAMES,
          centerFrame +
            PRELOAD_AHEAD +
            1
        );

        /*
          Current + forward frames first.
          This is more useful during normal
          downward scrolling.
        */
        for (
          let i = centerFrame;
          i < end;
          i++
        ) {
          if (
            !loadedRef.current.has(i)
          ) {
            loadImage(i);
          }
        }

        /*
          Then previous frames.
        */
        for (
          let i = centerFrame - 1;
          i >= start;
          i--
        ) {
          if (
            !loadedRef.current.has(i)
          ) {
            loadImage(i);
          }
        }
      },
      [loadImage]
    );

  /* --------------------------------
     SCROLL → FRAME
  -------------------------------- */

  useEffect(() => {
    if (!isReady) return;

    const unsubscribe =
      scrollYProgress.on(
        "change",
        (progress) => {
          const frame = Math.min(
            TOTAL_FRAMES - 1,
            Math.floor(
              clamp(
                progress,
                0,
                0.999999
              ) * TOTAL_FRAMES
            )
          );

          /*
            Request nearby frames.
          */
          preloadAroundFrame(frame);

          /*
            Don't redraw the same frame.
          */
          if (
            frame ===
            currentFrameRef.current
          ) {
            return;
          }

          /*
            Cancel previous draw.
          */
          if (drawRAFRef.current) {
            cancelAnimationFrame(
              drawRAFRef.current
            );
          }

          /*
            Draw only once per browser frame.
          */
          drawRAFRef.current =
            requestAnimationFrame(() => {
              drawRAFRef.current = null;

              drawFrame(frame);
            });
        }
      );

    return () => {
      unsubscribe();

      if (drawRAFRef.current) {
        cancelAnimationFrame(
          drawRAFRef.current
        );

        drawRAFRef.current = null;
      }
    };
  }, [
    isReady,
    scrollYProgress,
    preloadAroundFrame,
    drawFrame,
  ]);

  /* --------------------------------
     BACKGROUND LOADING
  -------------------------------- */

  useEffect(() => {
    if (!isReady) return;

    if (backgroundStartedRef.current) {
      return;
    }

    backgroundStartedRef.current = true;

    let cancelled = false;

    const loadBatch = async () => {
      if (cancelled) return;

      const start =
        backgroundCursorRef.current;

      if (start >= TOTAL_FRAMES) {
        return;
      }

      const end = Math.min(
        start + BACKGROUND_BATCH,
        TOTAL_FRAMES
      );

      backgroundCursorRef.current = end;

      const promises = [];

      for (
        let i = start;
        i < end;
        i++
      ) {
        if (
          !loadedRef.current.has(i)
        ) {
          promises.push(loadImage(i));
        }
      }

      await Promise.all(promises);

      if (cancelled) return;

      /*
        Give the browser time to breathe
        before the next batch.
      */
      setTimeout(loadBatch, 50);
    };

    /*
      Delay background loading so it doesn't
      compete with the first interaction.
    */
    const timer = setTimeout(
      loadBatch,
      1200
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isReady, loadImage]);

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

        drawFrame(
          currentFrameRef.current
        );
      }, 100);
    };

    updateCanvasSize();

    window.addEventListener(
      "resize",
      handleResize,
      { passive: true }
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
    updateCanvasSize,
    drawFrame,
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
  const images = imagesRef.current;
  const loaded = loadedRef.current;
  const loadingPromises =
    loadingPromisesRef.current;

  return () => {
    if (drawRAFRef.current) {
      cancelAnimationFrame(
        drawRAFRef.current
      );

      drawRAFRef.current = null;
    }

    images.fill(null);
    loaded.clear();
    loadingPromises.clear();
  };
}, []);
  /* --------------------------------
     LOADER
  -------------------------------- */

  const loadingPercentage =
    Math.min(
      100,
      Math.round(
        (Math.min(
          loadedFrames,
          INITIAL_FRAMES
        ) /
          INITIAL_FRAMES) *
          100
      )
    );

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
                    duration: 0.2,
                    ease: "easeOut",
                  }}
                />
              </div>

              <span>
                {loadingPercentage}%
              </span>
            </div>
          )}

          {/* CONTENT */}
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
              type="button"
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