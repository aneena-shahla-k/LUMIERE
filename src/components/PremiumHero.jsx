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

  const lastMobileDrawTimeRef = useRef(0);

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
     SCROLL PROGRESS
     
     IMPORTANT:
     NO useSpring here.

     Direct scroll progress means the final frame reaches
     the actual end of the sticky section without trailing
     spring movement.
  ========================================================= */

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /*
    Direct 1 → TOTAL_FRAMES mapping.

    The animation is made slow by the section height in CSS,
    NOT by delaying the scroll value with a spring.
  */

const frameProgress = useTransform(
  scrollYProgress,
  [0, 0.92],
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

    const mobile =
      window.innerWidth <= 768;

    /*
      Mobile uses DPR 1 for better performance.
      Desktop max DPR 2.
    */

    const dpr = mobile
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
      Math.floor(width * dpr);

    const pixelHeight =
      Math.floor(height * dpr);

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
     GET NEAREST LOADED IMAGE
  ========================================================= */

  const getLoadedImage = useCallback(
    (frameNumber) => {
      const exactImage =
        imagesRef.current[
          frameNumber - 1
        ];

      if (
        exactImage &&
        exactImage.complete &&
        exactImage.naturalWidth > 0
      ) {
        return exactImage;
      }

      /*
        Find nearest already-loaded frame.

        This prevents blank frames while the user scrolls
        faster than images can load.
      */

      for (
        let distance = 1;
        distance < TOTAL_FRAMES;
        distance++
      ) {
        const previousFrame =
          frameNumber - distance;

        if (previousFrame >= 1) {
          const previousImage =
            imagesRef.current[
              previousFrame - 1
            ];

          if (
            previousImage &&
            previousImage.complete &&
            previousImage.naturalWidth > 0
          ) {
            return previousImage;
          }
        }

        const nextFrame =
          frameNumber + distance;

        if (
          nextFrame <= TOTAL_FRAMES
        ) {
          const nextImage =
            imagesRef.current[
              nextFrame - 1
            ];

          if (
            nextImage &&
            nextImage.complete &&
            nextImage.naturalWidth > 0
          ) {
            return nextImage;
          }
        }
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

      const context =
        canvas.getContext("2d", {
          alpha: false,
          desynchronized: true,
        });

      if (!context) return;

      const image =
        getLoadedImage(frameNumber);

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
        Premium cinematic cover.

        Slight 1.03 scale prevents tiny edges
        from appearing on different screen ratios.
      */

      const scale =
        Math.max(
          canvasWidth /
            image.naturalWidth,

          canvasHeight /
            image.naturalHeight
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
        Background first.
      */

      context.fillStyle = "#11100e";

      context.fillRect(
        0,
        0,
        canvasWidth,
        canvasHeight
      );

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
        Same frame = nothing to do.
      */

      if (
        frameNumber ===
        lastDrawnFrameRef.current
      ) {
        return;
      }

      /*
        Mobile canvas drawing is limited to roughly
        30fps. This keeps scrolling responsive.
      */

      if (
        window.innerWidth <= 768
      ) {
        const now =
          performance.now();

        if (
          now -
            lastMobileDrawTimeRef.current <
          30
        ) {
          return;
        }

        lastMobileDrawTimeRef.current =
          now;
      }

      pendingFrameRef.current =
        frameNumber;

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

          drawFrame(pending);
        });
    },
    [drawFrame]
  );

  /* =========================================================
     FRAME PROGRESS LISTENER
  ========================================================= */

  useEffect(() => {
    const unsubscribe =
      frameProgress.on(
        "change",
        (latest) => {
          renderFrame(latest);
        }
      );

    return unsubscribe;
  }, [
    frameProgress,
    renderFrame,
  ]);

  /* =========================================================
     IMAGE PRELOADING
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const imageCache =
      new Array(TOTAL_FRAMES);

    imagesRef.current =
      imageCache;

    let loaded = 0;

    /* -------------------------------------------------------
       LOAD ONE IMAGE
    ------------------------------------------------------- */

    const loadImage = (frameNumber) => {
      return new Promise((resolve) => {
        if (!mounted) {
          resolve();
          return;
        }

        const image =
          new Image();

        image.decoding = "async";

        image.src =
          FRAME_PATH(frameNumber);

        image.onload = async () => {
          if (!mounted) {
            resolve();
            return;
          }

          /*
            Decode if possible.
          */

          try {
            if (image.decode) {
              await image.decode();
            }
          } catch {
            /*
              Ignore decode errors.
              Browser can still draw the image.
            */
          }

          if (!mounted) {
            resolve();
            return;
          }

          imageCache[
            frameNumber - 1
          ] = image;

          loaded += 1;

          setLoadedCount(loaded);

          /*
            If this is the currently visible frame,
            redraw immediately.
          */

          if (
            Math.abs(
              currentFrameRef.current -
                frameNumber
            ) <= 2
          ) {
            renderFrame(
              currentFrameRef.current
            );
          }

          resolve();
        };

        image.onerror = () => {
          resolve();
        };

        imageCache[
          frameNumber - 1
        ] = image;
      });
    };

    /* -------------------------------------------------------
       INITIAL FRAME
    ------------------------------------------------------- */

    const startLoading =
      async () => {
        /*
          Load first frame immediately.
        */

        await loadImage(1);

        if (!mounted) return;

        /*
          First frame is enough to remove loader.
        */

        setIsReady(true);

        /*
          Make sure first frame is visible.
        */

        requestAnimationFrame(() => {
          renderFrame(1);
        });

        /*
          Mobile:
          load nearby frames only.

          Desktop:
          progressively load everything.
        */

        if (
          window.innerWidth <= 768
        ) {
          /*
            Mobile initial window.
          */

          const mobileFrames =
            [];

          for (
            let i = 2;
            i <=
              Math.min(
                TOTAL_FRAMES,
                12
              );
            i++
          ) {
            mobileFrames.push(i);
          }

          for (
            const frame of mobileFrames
          ) {
            if (!mounted) break;

            await loadImage(frame);
          }

          /*
            Continue loading remaining
            frames slowly in the background.
          */

          const remaining =
            [];

          for (
            let i = 13;
            i <= TOTAL_FRAMES;
            i++
          ) {
            remaining.push(i);
          }

          const loadBackground =
            async () => {
              for (
                const frame of remaining
              ) {
                if (!mounted) break;

                await loadImage(frame);

                /*
                  Small yield prevents the browser
                  from getting blocked.
                */

                await new Promise(
                  (resolve) =>
                    setTimeout(
                      resolve,
                      8
                    )
                );
              }
            };

          loadBackground();
        } else {
          /*
            Desktop:
            controlled concurrent loading.
          */

          const queue =
            [];

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

          /*
            Five concurrent workers.
          */

          await Promise.all([
            worker(),
            worker(),
            worker(),
            worker(),
            worker(),
          ]);
        }
      };

    startLoading();

    /* =======================================================
       RESIZE
    ======================================================= */

    const handleResize = () => {
      updateCanvasDimensions();

      requestAnimationFrame(() => {
        renderFrame(
          currentFrameRef.current
        );
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
      Initial canvas size.
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

      imagesRef.current =
        [];
    };
  }, [
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
    isMobile
      ? isReady
        ? 100
        : 0
      : Math.min(
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
                    duration: 0.2,
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
              ease: [0.22, 1, 0.36, 1],
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