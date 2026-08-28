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

const TOTAL_FRAMES = 35;

const FRAME_PATH = (frameNumber) => {
  const paddedNumber = String(frameNumber).padStart(3, "0");

  return `/skin/ezgif-frame-${paddedNumber}.webp`;
};

/* =========================================================
   HELPERS
========================================================= */

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/* =========================================================
   COMPONENT
========================================================= */

export default function PremiumHero() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);

  const imagesRef = useRef([]);
  const animationFrameRef = useRef(null);

  const currentFrameRef = useRef(1);
  const lastDrawnFrameRef = useRef(0);

  const pendingFrameRef = useRef(null);

  const canvasSizeRef = useRef({
    width: 0,
    height: 0,
    dpr: 1,
  });

  const [isReady, setIsReady] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showSignupOffer, setShowSignupOffer] =
    useState(false);

  /* =========================================================
     MOBILE DETECTION
  ========================================================= */

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkDevice();

    window.addEventListener("resize", checkDevice, {
      passive: true,
    });

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  /* =========================================================
     SCROLL
  ========================================================= */

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /*
    Full scroll range:
    0%   → frame 1
    100% → frame 35
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

  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const mobile = window.innerWidth <= 768;

    /*
      Mobile = DPR 1
      Desktop = max DPR 2
    */

    const dpr = mobile
      ? 1
      : Math.min(window.devicePixelRatio || 1, 2);

    const width = Math.max(
      1,
      Math.floor(rect.width)
    );

    const height = Math.max(
      1,
      Math.floor(rect.height)
    );

    const pixelWidth = Math.floor(width * dpr);
    const pixelHeight = Math.floor(height * dpr);

    if (
      canvas.width !== pixelWidth ||
      canvas.height !== pixelHeight
    ) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    canvasSizeRef.current = {
      width: pixelWidth,
      height: pixelHeight,
      dpr,
    };
  }, []);

  /* =========================================================
     GET LOADED IMAGE
  ========================================================= */

  const getLoadedImage = useCallback(
    (frameNumber) => {
      const image =
        imagesRef.current[frameNumber - 1];

      if (
        image &&
        image.complete &&
        image.naturalWidth > 0
      ) {
        return image;
      }

      return null;
    },
    []
  );

  /* =========================================================
     DRAW FRAME
  ========================================================= */

  const drawFrame = useCallback(
    (frameNumber) => {
      const canvas = canvasRef.current;

      if (!canvas) return;

      const context = canvas.getContext("2d", {
        alpha: false,
        desynchronized: true,
      });

      if (!context) return;

      const image = getLoadedImage(frameNumber);

      if (!image) return;

      const {
        width: canvasWidth,
        height: canvasHeight,
      } = canvasSizeRef.current;

      if (
        canvasWidth <= 0 ||
        canvasHeight <= 0
      ) {
        return;
      }

      /*
        Cover scaling.

        Slight 1.03 scale prevents tiny edges
        from appearing on different screen ratios.
      */

      const scale =
        Math.max(
          canvasWidth / image.naturalWidth,
          canvasHeight / image.naturalHeight
        ) * 1.03;

      const drawWidth =
        image.naturalWidth * scale;

      const drawHeight =
        image.naturalHeight * scale;

      const x =
        (canvasWidth - drawWidth) / 2;

      const y =
        (canvasHeight - drawHeight) / 2;

      /*
        Background
      */

      context.fillStyle = "#11100e";

      context.fillRect(
        0,
        0,
        canvasWidth,
        canvasHeight
      );

      /*
        Draw image
      */

      context.drawImage(
        image,
        x,
        y,
        drawWidth,
        drawHeight
      );

      lastDrawnFrameRef.current =
        frameNumber;
    },
    [getLoadedImage]
  );

  /* =========================================================
     REQUEST FRAME DRAW
  ========================================================= */

  const renderFrame = useCallback(
    (value) => {
      const frameNumber = clamp(
        Math.round(value),
        1,
        TOTAL_FRAMES
      );

      currentFrameRef.current =
        frameNumber;

      /*
        Don't redraw same frame.
      */

      if (
        frameNumber ===
        lastDrawnFrameRef.current
      ) {
        return;
      }

      pendingFrameRef.current =
        frameNumber;

      /*
        Already waiting for animation frame.
      */

      if (animationFrameRef.current) {
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

          if (pending === null) {
            return;
          }

          drawFrame(pending);
        });
    },
    [drawFrame]
  );

  /* =========================================================
     SCROLL → FRAME
  ========================================================= */

  useEffect(() => {
    const unsubscribe =
      frameProgress.on(
        "change",
        (latest) => {
          if (!isReady) return;

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
     PRELOAD ALL FRAMES
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const imageCache =
      new Array(TOTAL_FRAMES);

    imagesRef.current =
      imageCache;

    let loaded = 0;

    /* -------------------------------------------------------
       LOAD IMAGE
    ------------------------------------------------------- */

    const loadImage = (frameNumber) => {
      return new Promise((resolve) => {
        if (!mounted) {
          resolve(false);
          return;
        }

        const image =
          new Image();

        image.decoding = "async";

        /*
          Optional browser hint.
        */

        image.fetchPriority =
          frameNumber === 1
            ? "high"
            : "auto";

        image.src =
          FRAME_PATH(frameNumber);

        image.onload = async () => {
          if (!mounted) {
            resolve(false);
            return;
          }

          /*
            Decode before considering
            the frame ready.
          */

          try {
            if (image.decode) {
              await image.decode();
            }
          } catch {
            /*
              Ignore decode errors.
            */
          }

          if (!mounted) {
            resolve(false);
            return;
          }

          imageCache[
            frameNumber - 1
          ] = image;

          loaded += 1;

          setLoadedCount(loaded);

          resolve(true);
        };

        image.onerror = () => {
          console.error(
            `Failed to load frame: ${FRAME_PATH(
              frameNumber
            )}`
          );

          resolve(false);
        };

        imageCache[
          frameNumber - 1
        ] = image;
      });
    };

    /* -------------------------------------------------------
       LOAD ALL FRAMES
    ------------------------------------------------------- */

    const preloadFrames =
      async () => {
        /*
          Load first frame immediately.
        */

        await loadImage(1);

        if (!mounted) return;

        /*
          Show first frame as soon as it exists.
        */

        updateCanvasDimensions();

        requestAnimationFrame(() => {
          if (mounted) {
            drawFrame(1);
          }
        });

        /*
          Load remaining frames.

          4 concurrent workers gives a good balance
          between loading speed and browser responsiveness.
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
                frame === undefined
              ) {
                break;
              }

              await loadImage(frame);
            }
          };

        await Promise.all([
          worker(),
          worker(),
          worker(),
          worker(),
        ]);

        if (!mounted) return;

        /*
          All frames are ready.
        */

        setIsReady(true);

        /*
          Draw current frame.
        */

        requestAnimationFrame(() => {
          if (mounted) {
            renderFrame(
              currentFrameRef.current
            );
          }
        });
      };

    preloadFrames();

    /* =======================================================
       RESIZE
    ======================================================= */

    const handleResize = () => {
      updateCanvasDimensions();

      requestAnimationFrame(() => {
        if (mounted) {
          drawFrame(
            currentFrameRef.current
          );
        }
      });
    };

    window.addEventListener(
      "resize",
      handleResize,
      {
        passive: true,
      }
    );

    /*
      Initial canvas dimensions.
    */

    updateCanvasDimensions();

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

      imagesRef.current = [];
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
    if (!isReady) return;

    try {
      const alreadyShown =
        sessionStorage.getItem(
          "lumiere_signup_offer_shown"
        );

      if (alreadyShown) return;

      const timer =
        setTimeout(() => {
          setShowSignupOffer(true);

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
        Ignore sessionStorage errors.
      */
    }
  }, [isReady]);

  /* =========================================================
     LOADING PERCENTAGE
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
     UI
  ========================================================= */

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

          {/* CONTENT */}

          <motion.div
            className="premium-hero__content"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: isReady ? 1 : 0,
              y: isReady ? 0 : 20,
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

          {/* SCROLL INDICATOR */}

          <motion.div
            className="premium-hero__scroll"
            animate={{
              opacity: isReady ? 1 : 0,
            }}
            transition={{
              duration: 0.6,
            }}
          >
            <span>SCROLL</span>

            <div className="premium-hero__scroll-line">
              <motion.div
                style={{
                  scaleY: scrollYProgress,
                  transformOrigin: "top",
                }}
              />
            </div>
          </motion.div>

          {/* FRAME COUNTER */}

          <div className="premium-hero__counter">
            <span>
              {String(
                currentFrameRef.current
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

      {/* SIGNUP */}

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