import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  motion,
  useScroll,
  useSpring,
} from "framer-motion";

import "../styles/premiumHero.css";
import SignupOffer from "./SignupOffer";

const TOTAL_FRAMES = 225;

// Load only these frames before showing the hero
const INITIAL_FRAMES = 12;

const getFramePath = (index) => {
  const frameNumber = String(index + 1).padStart(3, "0");

  return `/hero/ezgif-frame-${frameNumber}.webp`;
};

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export default function PremiumHero() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);

  const imagesRef = useRef([]);

  const currentFrameRef = useRef(0);
  const animationFrameRef = useRef(null);

  const [loadedFrames, setLoadedFrames] = useState(0);
  const [isReady, setIsReady] = useState(false);

  /*
   * -----------------------------------------
   * SIGNUP POPUP
   * -----------------------------------------
   */

  const [showSignupOffer, setShowSignupOffer] =
    useState(false);

  /*
   * -----------------------------------------
   * SCROLL
   * -----------------------------------------
   */

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(
    scrollYProgress,
    {
      stiffness: 100,
      damping: 30,
      mass: 0.2,
    }
  );

  /*
   * -----------------------------------------
   * LOAD SINGLE IMAGE
   * -----------------------------------------
   */

  const loadImage = useCallback((index) => {
    return new Promise((resolve) => {
      const image = new Image();

      const path = getFramePath(index);

      image.onload = () => {
        if (
          image.naturalWidth > 0 &&
          image.naturalHeight > 0
        ) {
          resolve({
            index,
            image,
            success: true,
          });
        } else {
          resolve({
            index,
            image: null,
            success: false,
            path,
          });
        }
      };

      image.onerror = () => {
        console.warn(
          `Hero frame failed to load: ${path}`
        );

        resolve({
          index,
          image: null,
          success: false,
          path,
        });
      };

      image.src = path;
    });
  }, []);

  /*
   * -----------------------------------------
   * INITIAL FRAME PRELOAD
   * -----------------------------------------
   *
   * First 12 frames load first.
   * Once they are ready, hero appears.
   *
   * -----------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    const loadInitialFrames = async () => {
      const initialBatch = [];

      for (
        let index = 0;
        index < INITIAL_FRAMES;
        index++
      ) {
        initialBatch.push(
          loadImage(index)
        );
      }

      const results =
        await Promise.all(initialBatch);

      if (cancelled) {
        return;
      }

      results.forEach((result) => {
        if (!result) {
          return;
        }

        imagesRef.current[result.index] =
          result.image;

        if (result.success) {
          setLoadedFrames(
            (previous) =>
              previous + 1
          );
        }
      });

      /*
       * Hero is ready after
       * initial frames are loaded.
       */

      setIsReady(true);
    };

    loadInitialFrames();

    return () => {
      cancelled = true;
    };
  }, [loadImage]);

  /*
   * -----------------------------------------
   * BACKGROUND LOAD REMAINING FRAMES
   * -----------------------------------------
   */

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let cancelled = false;

    const loadRemainingFrames = async () => {
      const BATCH_SIZE = 12;

      for (
        let start = INITIAL_FRAMES;
        start < TOTAL_FRAMES;
        start += BATCH_SIZE
      ) {
        if (cancelled) {
          return;
        }

        const batch = [];

        for (
          let index = start;
          index <
          Math.min(
            start + BATCH_SIZE,
            TOTAL_FRAMES
          );
          index++
        ) {
          batch.push(
            loadImage(index)
          );
        }

        const results =
          await Promise.all(batch);

        if (cancelled) {
          return;
        }

        results.forEach((result) => {
          if (!result) {
            return;
          }

          imagesRef.current[result.index] =
            result.image;

          if (result.success) {
            setLoadedFrames(
              (previous) =>
                previous + 1
            );
          }
        });

        /*
         * Give the browser
         * a small breathing room.
         */

        await new Promise((resolve) => {
          setTimeout(resolve, 10);
        });
      }
    };

    loadRemainingFrames();

    return () => {
      cancelled = true;
    };
  }, [isReady, loadImage]);

  /*
   * -----------------------------------------
   * SHOW SIGNUP OFFER - FIRST TIME ONLY
   * -----------------------------------------
   *
   * sessionStorage prevents the popup
   * from appearing again during the
   * same browser session.
   *
   * -----------------------------------------
   */

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const alreadyShown =
      sessionStorage.getItem(
        "lumiere_signup_offer_shown"
      );

    /*
     * If popup has already been shown,
     * don't show it again.
     */

    if (alreadyShown) {
      return;
    }

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

  /*
   * -----------------------------------------
   * CLOSE SIGNUP OFFER
   * -----------------------------------------
   */

  const closeSignupOffer = () => {
    setShowSignupOffer(false);
  };

  /*
   * -----------------------------------------
   * FIND VALID FRAME
   * -----------------------------------------
   */

  const getValidFrame = useCallback(
    (requestedIndex) => {
      const images = imagesRef.current;

      if (!images.length) {
        return null;
      }

      /*
       * Requested frame
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
       * Search backwards
       */

      for (
        let i = requestedIndex - 1;
        i >= 0;
        i--
      ) {
        const image = images[i];

        if (
          image &&
          image.complete &&
          image.naturalWidth > 0
        ) {
          return image;
        }
      }

      /*
       * Search forwards
       */

      for (
        let i = requestedIndex + 1;
        i < images.length;
        i++
      ) {
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

  /*
   * -----------------------------------------
   * DRAW FRAME
   * -----------------------------------------
   */

  const drawFrame = useCallback(
    (frameIndex) => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const image =
        getValidFrame(frameIndex);

      if (!image) {
        return;
      }

      const context =
        canvas.getContext("2d");

      if (!context) {
        return;
      }

      const rect =
        canvas.getBoundingClientRect();

      const width = rect.width;
      const height = rect.height;

      if (
        width <= 0 ||
        height <= 0
      ) {
        return;
      }

      /*
       * -------------------------------------
       * DEVICE PIXEL RATIO
       * -------------------------------------
       */

      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      const canvasWidth =
        Math.floor(
          width * pixelRatio
        );

      const canvasHeight =
        Math.floor(
          height * pixelRatio
        );

      if (
        canvas.width !== canvasWidth ||
        canvas.height !== canvasHeight
      ) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
      }

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
       * -------------------------------------
       * CINEMATIC COVER
       * -------------------------------------
       */

      const imageRatio =
        image.naturalWidth /
        image.naturalHeight;

      const canvasRatio =
        width / height;

      let drawWidth;
      let drawHeight;

      if (
        imageRatio > canvasRatio
      ) {
        drawHeight = height;

        drawWidth =
          height * imageRatio;
      } else {
        drawWidth = width;

        drawHeight =
          width / imageRatio;
      }

      /*
       * Slight cinematic crop.
       */

      const scale = 1.03;

      drawWidth *= scale;
      drawHeight *= scale;

      const x =
        (width - drawWidth) / 2;

      const y =
        (height - drawHeight) / 2;

      /*
       * -------------------------------------
       * FINAL SAFETY CHECK
       * -------------------------------------
       */

      if (
        image.complete &&
        image.naturalWidth > 0
      ) {
        context.drawImage(
          image,
          x,
          y,
          drawWidth,
          drawHeight
        );
      }
    },
    [getValidFrame]
  );

  /*
   * -----------------------------------------
   * INITIAL FRAME
   * -----------------------------------------
   */

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const frameRequest =
      requestAnimationFrame(() => {
        drawFrame(0);
      });

    return () => {
      cancelAnimationFrame(
        frameRequest
      );
    };
  }, [isReady, drawFrame]);

  /*
   * -----------------------------------------
   * RESIZE
   * -----------------------------------------
   */

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const handleResize = () => {
      drawFrame(
        currentFrameRef.current
      );
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [isReady, drawFrame]);

  /*
   * -----------------------------------------
   * SCROLL → FRAME
   * -----------------------------------------
   */

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const unsubscribe =
      smoothProgress.on(
        "change",
        (progress) => {
          const frame =
            Math.floor(
              clamp(
                progress,
                0,
                0.999999
              ) * TOTAL_FRAMES
            );

          if (
            frame ===
            currentFrameRef.current
          ) {
            return;
          }

          currentFrameRef.current =
            frame;

          if (
            animationFrameRef.current
          ) {
            cancelAnimationFrame(
              animationFrameRef.current
            );
          }

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

        animationFrameRef.current = null;
      }
    };
  }, [
    isReady,
    smoothProgress,
    drawFrame,
  ]);

  /*
   * -----------------------------------------
   * LOADING
   * -----------------------------------------
   */

  const loadingPercentage =
    Math.round(
      (loadedFrames /
        TOTAL_FRAMES) *
        100
    );

  return (
    <>
      <section
        ref={sectionRef}
        className="premium-hero"
      >
        <div className="premium-hero__sticky">

          {/* FRAME SEQUENCE */}

          <canvas
            ref={canvasRef}
            className="premium-hero__canvas"
          />

          {/* CINEMATIC OVERLAY */}

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
                    width:
                      `${Math.min(
                        loadingPercentage,
                        100
                      )}%`,
                  }}

                  transition={{
                    duration: 0.2,
                  }}
                />

              </div>

              <span>
                {Math.min(
                  loadingPercentage,
                  100
                )}
                %
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
              opacity:
                isReady ? 1 : 0,
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

          {/* SCROLL */}

          <motion.div
            className="premium-hero__scroll"

            animate={{
              opacity:
                isReady ? 1 : 0,
            }}
          >

            <div className="premium-hero__scroll-line">

              <motion.div
                style={{
                  scaleY:
                    smoothProgress,
                  transformOrigin:
                    "top",
                }}
              />

            </div>

          </motion.div>
        </div>
      </section>

      {/* SIGNUP OFFER */}

      {showSignupOffer && (
        <SignupOffer
          onClose={closeSignupOffer}
        />
      )}
    </>
  );
}