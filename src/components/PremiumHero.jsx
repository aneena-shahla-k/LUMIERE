import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";

import "../styles/premiumHero.css";
import SignupOffer from "./SignupOffer";

/* =========================================================
   CONFIG
========================================================= */

const TOTAL_FRAMES = 76;

const FRAME_PATH = (frameNumber) => {
  const paddedNumber = String(frameNumber).padStart(3, "0");

  return `/skinnn/ezgif-frame-${paddedNumber}.webp`;
};

/* =========================================================
   HELPERS
========================================================= */

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/* =========================================================
   PREMIUM HERO
========================================================= */

export default function PremiumHero() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);

  /* -------------------------------------------------------
     IMAGE CACHE
  ------------------------------------------------------- */

  const imagesRef = useRef([]);

  /* -------------------------------------------------------
     CANVAS CONTEXT
  ------------------------------------------------------- */

  const contextRef = useRef(null);

  /* -------------------------------------------------------
     CANVAS SIZE
  ------------------------------------------------------- */

  const canvasSizeRef = useRef({
    width: 0,
    height: 0,
    dpr: 1,
  });

  /* -------------------------------------------------------
     ANIMATION STATE
  ------------------------------------------------------- */

  const animationFrameRef = useRef(null);

  const pendingFrameRef = useRef(null);

  const currentFrameRef = useRef(1);

  const lastDrawnValueRef = useRef(-1);

  /* -------------------------------------------------------
     REACT STATE
  ------------------------------------------------------- */

  const [isReady, setIsReady] = useState(false);

  const [loadedCount, setLoadedCount] =
    useState(0);

  const [showSignupOffer, setShowSignupOffer] =
    useState(false);

  /* =========================================================
     SCROLL PROGRESS
  ========================================================= */

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /*
    IMPORTANT:

    Do NOT round here.

    Scroll can produce:

    10.1
    10.2
    10.3
    10.4

    instead of only:

    10
    11
    12
  */

  const frameProgress = useTransform(
    scrollYProgress,
    [0, 1],
    [1, TOTAL_FRAMES],
    {
      clamp: true,
    }
  );

  /* =========================================================
     CANVAS DIMENSIONS
  ========================================================= */

  const updateCanvasDimensions =
    useCallback(() => {
      const canvas =
        canvasRef.current;

      if (!canvas) return;

      const rect =
        canvas.getBoundingClientRect();

      const isMobile =
        window.innerWidth <= 768;

      /*
        Mobile:
        DPR 1

        Desktop:
        maximum DPR 2
      */

      const dpr = isMobile
        ? 1
        : Math.min(
            window.devicePixelRatio || 1,
            2
          );

      const width =
        Math.max(
          1,
          Math.floor(rect.width)
        );

      const height =
        Math.max(
          1,
          Math.floor(rect.height)
        );

      const pixelWidth =
        Math.floor(
          width * dpr
        );

      const pixelHeight =
        Math.floor(
          height * dpr
        );

      if (
        canvas.width !==
          pixelWidth ||
        canvas.height !==
          pixelHeight
      ) {
        canvas.width =
          pixelWidth;

        canvas.height =
          pixelHeight;
      }

      canvasSizeRef.current = {
        width: pixelWidth,
        height: pixelHeight,
        dpr,
      };

      /*
        Create context only once.
      */

      if (!contextRef.current) {
        contextRef.current =
          canvas.getContext(
            "2d",
            {
              alpha: false,
              desynchronized: true,
            }
          );
      }
    }, []);

  /* =========================================================
     DRAW SINGLE IMAGE
  ========================================================= */

  const drawImage = useCallback(
    (
      context,
      image,
      alpha,
      canvasWidth,
      canvasHeight
    ) => {
      if (
        !image ||
        !image.complete ||
        image.naturalWidth <= 0
      ) {
        return;
      }

      /*
        COVER
      */

      const scale =
        Math.max(
          canvasWidth /
            image.naturalWidth,

          canvasHeight /
            image.naturalHeight
        ) * 1.03;

      const drawWidth =
        image.naturalWidth *
        scale;

      const drawHeight =
        image.naturalHeight *
        scale;

      const x =
        (canvasWidth -
          drawWidth) /
        2;

      const y =
        (canvasHeight -
          drawHeight) /
        2;

      context.globalAlpha =
        alpha;

      context.drawImage(
        image,
        x,
        y,
        drawWidth,
        drawHeight
      );
    },
    []
  );

  /* =========================================================
     DRAW FRAME
  ========================================================= */

  const drawFrame = useCallback(
  (frameValue) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;

    if (!canvas || !context) return;

    const {
      width: canvasWidth,
      height: canvasHeight,
    } = canvasSizeRef.current;

    if (canvasWidth <= 0 || canvasHeight <= 0) {
      return;
    }

    const value = clamp(
      frameValue,
      1,
      TOTAL_FRAMES
    );

    const frameNumber = Math.round(value);

    const image =
      imagesRef.current[frameNumber - 1];

    /*
      If requested frame isn't ready,
      DON'T clear the canvas.
    */

    if (
      !image ||
      !image.complete ||
      image.naturalWidth <= 0
    ) {
      return;
    }

    /*
      Clear only AFTER we know
      the new image is ready.
    */

    context.globalAlpha = 1;

    context.fillStyle = "#11100e";

    context.fillRect(
      0,
      0,
      canvasWidth,
      canvasHeight
    );

    /*
      Draw the complete frame.
    */

    drawImage(
      context,
      image,
      1,
      canvasWidth,
      canvasHeight
    );

    context.globalAlpha = 1;

    lastDrawnValueRef.current =
      frameNumber;
  },
  [drawImage]
);
  /* =========================================================
     REQUEST RENDER
  ========================================================= */

  const renderFrame = useCallback(
    (value) => {
      const frameValue =
        clamp(
          value,
          1,
          TOTAL_FRAMES
        );

      currentFrameRef.current =
        frameValue;

      pendingFrameRef.current =
        frameValue;

      /*
        Don't create multiple
        animation frames.
      */

      if (
        animationFrameRef.current
      ) {
        return;
      }

      animationFrameRef.current =
        requestAnimationFrame(() => {
          animationFrameRef.current =
            null;

          const pending =
            pendingFrameRef.current;

          pendingFrameRef.current =
            null;

          if (
            pending === null
          ) {
            return;
          }

          /*
            Avoid unnecessary
            duplicate drawing.
          */

          if (
            Math.abs(
              pending -
                lastDrawnValueRef.current
            ) < 0.001
          ) {
            return;
          }

          drawFrame(pending);
        });
    },
    [drawFrame]
  );

  /* =========================================================
     SCROLL LISTENER
  ========================================================= */

  useEffect(() => {
    const unsubscribe =
      frameProgress.on(
        "change",
        (latest) => {
          if (!isReady) {
            return;
          }

          renderFrame(latest);
        }
      );

    return unsubscribe;
  }, [
    frameProgress,
    renderFrame,
    isReady,
  ]);

  /* =========================================================
     PRELOAD ALL 35 FRAMES
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    /*
      Reset
    */

    imagesRef.current =
      new Array(TOTAL_FRAMES);

    let loaded = 0;

    setLoadedCount(0);
    setIsReady(false);

    /* -------------------------------------------------------
       LOAD ONE IMAGE
    ------------------------------------------------------- */

    const loadImage =
      (frameNumber) => {
        return new Promise(
          (resolve) => {
            if (!mounted) {
              resolve(false);
              return;
            }

            const image =
              new Image();

            /*
              Decode asynchronously
            */

            image.decoding =
              "async";

            /*
              First frame gets
              higher priority.
            */

            if (
              frameNumber === 1
            ) {
              image.fetchPriority =
                "high";
            }

            image.onload =
              async () => {
                if (!mounted) {
                  resolve(false);
                  return;
                }

                /*
                  Decode image before
                  storing it.
                */

                try {
                  if (
                    image.decode
                  ) {
                    await image.decode();
                  }
                } catch {
                  /*
                    Browser can still
                    draw the image.
                  */
                }

                if (!mounted) {
                  resolve(false);
                  return;
                }

                imagesRef.current[
                  frameNumber - 1
                ] = image;

                loaded += 1;

                setLoadedCount(
                  loaded
                );

                /*
                  If current frame is
                  close to this image,
                  redraw.
                */

                if (
                  Math.abs(
                    currentFrameRef.current -
                      frameNumber
                  ) <= 1
                ) {
                  renderFrame(
                    currentFrameRef.current
                  );
                }

                resolve(true);
              };

            image.onerror =
              () => {
                console.error(
                  `Failed to load: ${FRAME_PATH(
                    frameNumber
                  )}`
                );

                resolve(false);
              };

            /*
              IMPORTANT:

              Set src after handlers.
            */

            image.src =
              FRAME_PATH(
                frameNumber
              );
          }
        );
      };

    /* -------------------------------------------------------
       PRELOAD
    ------------------------------------------------------- */

    const preload =
      async () => {
        /*
          FIRST FRAME
        */

        await loadImage(1);

        if (!mounted) return;

        /*
          Setup canvas
        */

        updateCanvasDimensions();

        /*
          Draw first frame
        */

        requestAnimationFrame(
          () => {
            if (!mounted) return;

            drawFrame(1);
          }
        );

        /*
          Remaining frames

          4 workers = good balance
        */

        const queue = [];

        for (
          let i = 2;
          i <= TOTAL_FRAMES;
          i++
        ) {
          queue.push(i);
        }

        const worker =
          async () => {
            while (
              mounted &&
              queue.length > 0
            ) {
              const frame =
                queue.shift();

              if (
                frame ===
                undefined
              ) {
                break;
              }

              await loadImage(
                frame
              );
            }
          };

        await Promise.all([
          worker(),
          worker(),
          worker(),
          worker(),
        ]);

        if (!mounted) {
          return;
        }

        /*
          ALL FRAMES READY
        */

        setIsReady(true);

        /*
          Draw current position
        */

        requestAnimationFrame(
          () => {
            if (!mounted) return;

            renderFrame(
              currentFrameRef.current
            );
          }
        );
      };

    preload();

    /* =======================================================
       RESIZE
    ======================================================= */

    const handleResize =
      () => {
        updateCanvasDimensions();

        requestAnimationFrame(
          () => {
            if (!mounted) return;

            drawFrame(
              currentFrameRef.current
            );
          }
        );
      };

    window.addEventListener(
      "resize",
      handleResize,
      {
        passive: true,
      }
    );

    /*
      Initial setup
    */

    updateCanvasDimensions();

    /* =======================================================
       CLEANUP
    ======================================================= */

    return () => {
      mounted = false;

      window.removeEventListener(
        "resize",
        handleResize
      );

      if (
        animationFrameRef.current
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current =
          null;
      }

      pendingFrameRef.current =
        null;

      imagesRef.current = [];

      contextRef.current =
        null;
    };
  }, [
    drawFrame,
    renderFrame,
    updateCanvasDimensions,
  ]);

  /* =========================================================
     SIGNUP OFFER
  ========================================================= */

  useEffect(() => {
    if (!isReady) {
      return;
    }

    try {
      const alreadyShown =
        sessionStorage.getItem(
          "lumiere_signup_offer_shown"
        );

      if (alreadyShown) {
        return;
      }

      const timer =
        setTimeout(() => {
          setShowSignupOffer(
            true
          );

          sessionStorage.setItem(
            "lumiere_signup_offer_shown",
            "true"
          );
        }, 1500);

      return () => {
        clearTimeout(timer);
      };
    } catch {
      /*
        Ignore storage errors.
      */
    }
  }, [isReady]);

  /* =========================================================
     LOADING %
  ========================================================= */

  const loadingPercentage =
    Math.min(
      100,
      Math.round(
        (loadedCount /
          TOTAL_FRAMES) *
          100
      )
    );

  /* =========================================================
     DISPLAY FRAME
  ========================================================= */

  const displayFrame =
    Math.min(
      TOTAL_FRAMES,
      Math.max(
        1,
        Math.round(
          currentFrameRef.current
        )
      )
    );

  /* =========================================================
     UI
  ========================================================= */

  return (
    <>
      <section
        ref={sectionRef}
        className="premium-hero"
      >
        <div className="premium-hero__sticky">

          {/* =================================================
              CANVAS
          ================================================= */}

          <canvas
            ref={canvasRef}
            className="premium-hero__canvas"
          />

          {/* =================================================
              OVERLAY
          ================================================= */}

          <div className="premium-hero__overlay" />

          {/* =================================================
              LOADER
          ================================================= */}

          {!isReady && (
            <div className="premium-hero__loader">

              <div className="premium-hero__loader-brand">
                LUMIÈRE
              </div>

              <div className="premium-hero__loader-line">
                <motion.div
                  className="premium-hero__loader-progress"
                  initial={{
                    width: "0%",
                  }}
                  animate={{
                    width: `${loadingPercentage}%`,
                  }}
                  transition={{
                    duration: 0.15,
                    ease: "linear",
                  }}
                />
              </div>

              <span>
                {loadingPercentage}%
              </span>

            </div>
          )}

          {/* =================================================
              CONTENT
          ================================================= */}

          <motion.div
            className="premium-hero__content"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: isReady
                ? 1
                : 0,

              y: isReady
                ? 0
                : 20,
            }}
            transition={{
              duration: 1,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
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
              Advanced skincare rituals made
              for luminous skin.
            </p>

            <button
              type="button"
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

          {/* =================================================
              SCROLL INDICATOR
          ================================================= */}

          <motion.div
            className="premium-hero__scroll"
            animate={{
              opacity: isReady
                ? 1
                : 0,
            }}
            transition={{
              duration: 0.6,
            }}
          >

            <span>
              SCROLL
            </span>

            <div className="premium-hero__scroll-line">
              <motion.div
                style={{
                  scaleY:
                    scrollYProgress,
                  transformOrigin:
                    "top",
                }}
              />
            </div>

          </motion.div>

          {/* =================================================
              FRAME COUNTER
          ================================================= */}

          <div className="premium-hero__counter">

            <span>
              {String(
                displayFrame
              ).padStart(2, "0")}
            </span>

            <span className="premium-hero__counter-divider">
              /
            </span>

            <span>
              {String(
                TOTAL_FRAMES
              ).padStart(2, "0")}
            </span>

          </div>

        </div>
      </section>

      {/* =====================================================
          SIGNUP
      ===================================================== */}

      {showSignupOffer && (
        <SignupOffer
          onClose={() =>
            setShowSignupOffer(
              false
            )
          }
        />
      )}
    </>
  );
}