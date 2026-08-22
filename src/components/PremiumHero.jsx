import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import "../styles/premiumHero.css";
import SignupOffer from "./SignupOffer";

const TOTAL_FRAMES = 206;
const INITIAL_FRAMES = 12;
const BACKGROUND_BATCH_SIZE = 8;

const getFramePath = (index) => {
  const frameNumber = String(index + 1).padStart(3, "0");
  return `/skin-frames/ezgif-frame-${frameNumber}.webp`;
};

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

export default function PremiumHero() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);

  const imagesRef = useRef([]);
  const loadedRef = useRef(new Set());
  const loadingRef = useRef(new Set());

  const currentFrameRef = useRef(0);
  const animationFrameRef = useRef(null);
  const preloadTimerRef = useRef(null);
  const resizeTimerRef = useRef(null);

  const canvasSizeRef = useRef({
    width: 0,
    height: 0,
    dpr: 0,
  });

  const [loadedFrames, setLoadedFrames] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [showSignupOffer, setShowSignupOffer] = useState(false);

  /*
   * -----------------------------------------
   * SCROLL PROGRESS
   * -----------------------------------------
   */

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /*
   * -----------------------------------------
   * LOAD ONE IMAGE
   * -----------------------------------------
   */

  const loadImage = useCallback((index) => {
    if (
      index < 0 ||
      index >= TOTAL_FRAMES ||
      loadedRef.current.has(index) ||
      loadingRef.current.has(index)
    ) {
      return Promise.resolve(null);
    }

    loadingRef.current.add(index);

    return new Promise((resolve) => {
      const image = new Image();

      image.decoding = "async";

      image.onload = async () => {
        try {
          if (image.decode) {
            await image.decode();
          }
        } catch {
          // The image can still be used if decode fails.
        }

        loadingRef.current.delete(index);

        if (
          image.naturalWidth > 0 &&
          image.naturalHeight > 0
        ) {
          imagesRef.current[index] = image;
          loadedRef.current.add(index);

          setLoadedFrames(loadedRef.current.size);

          resolve(image);
          return;
        }

        resolve(null);
      };

      image.onerror = () => {
        loadingRef.current.delete(index);
        resolve(null);
      };

      image.src = getFramePath(index);
    });
  }, []);

  /*
   * -----------------------------------------
   * INITIAL FRAME PRELOAD
   * -----------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    const preloadInitialFrames = async () => {
      const promises = [];

      for (
        let index = 0;
        index < INITIAL_FRAMES;
        index++
      ) {
        promises.push(loadImage(index));
      }

      await Promise.all(promises);

      if (cancelled) return;

      setIsReady(true);
    };

    preloadInitialFrames();

    return () => {
      cancelled = true;
    };
  }, [loadImage]);

  /*
   * -----------------------------------------
   * CANVAS CONTEXT
   * -----------------------------------------
   */

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return null;

    if (!canvas._heroContext) {
      canvas._heroContext = canvas.getContext("2d", {
        alpha: false,
        desynchronized: true,
      });
    }

    return canvas._heroContext;
  }, []);

  /*
   * -----------------------------------------
   * RESIZE CANVAS
   * -----------------------------------------
   */

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    if (width <= 0 || height <= 0) {
      return null;
    }

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    const pixelWidth = Math.floor(width * dpr);
    const pixelHeight = Math.floor(height * dpr);

    const previous = canvasSizeRef.current;

    if (
      previous.width !== width ||
      previous.height !== height ||
      previous.dpr !== dpr
    ) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;

      canvasSizeRef.current = {
        width,
        height,
        dpr,
      };
    }

    return {
      width,
      height,
      dpr,
    };
  }, []);

  /*
   * -----------------------------------------
   * FIND BEST AVAILABLE IMAGE
   * -----------------------------------------
   */

  const getBestAvailableImage = useCallback(
    (requestedIndex) => {
      const images = imagesRef.current;

      const directImage = images[requestedIndex];

      if (
        directImage &&
        directImage.complete &&
        directImage.naturalWidth > 0
      ) {
        return directImage;
      }

      /*
       * If the exact frame isn't ready,
       * use a nearby loaded frame.
       *
       * This prevents the canvas from
       * appearing blank during fast scroll.
       */

      for (let distance = 1; distance <= 10; distance++) {
        const previousIndex =
          requestedIndex - distance;

        if (previousIndex >= 0) {
          const previousImage =
            images[previousIndex];

          if (
            previousImage &&
            previousImage.complete &&
            previousImage.naturalWidth > 0
          ) {
            return previousImage;
          }
        }

        const nextIndex =
          requestedIndex + distance;

        if (nextIndex < TOTAL_FRAMES) {
          const nextImage =
            images[nextIndex];

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

  /*
   * -----------------------------------------
   * DRAW FRAME
   * -----------------------------------------
   */

  const drawFrame = useCallback(
    (requestedFrame) => {
      const canvas = canvasRef.current;

      if (!canvas) return;

      const context = getContext();

      if (!context) return;

      const image =
        getBestAvailableImage(requestedFrame);

      if (!image) return;

      const canvasSize = resizeCanvas();

      if (!canvasSize) return;

      const {
        width,
        height,
        dpr,
      } = canvasSize;

      /*
       * Work in CSS pixels.
       */

      context.setTransform(
        dpr,
        0,
        0,
        dpr,
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
       * Cover image.
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
       * Very subtle cinematic crop.
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
    },
    [
      getContext,
      getBestAvailableImage,
      resizeCanvas,
    ]
  );

  /*
   * -----------------------------------------
   * SCHEDULE DRAW
   * -----------------------------------------
   */

  const scheduleDraw = useCallback(
    (frame) => {
      if (
        frame === currentFrameRef.current &&
        animationFrameRef.current === null
      ) {
        /*
         * Initial frame can still be drawn.
         */
      }

      currentFrameRef.current = frame;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }

      animationFrameRef.current =
        requestAnimationFrame(() => {
          animationFrameRef.current = null;

          drawFrame(frame);
        });
    },
    [drawFrame]
  );

  /*
   * -----------------------------------------
   * INITIAL CANVAS DRAW
   * -----------------------------------------
   */

  useEffect(() => {
    if (!isReady) return;

    const frame =
      requestAnimationFrame(() => {
        currentFrameRef.current = 0;
        drawFrame(0);
      });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isReady, drawFrame]);

  /*
   * -----------------------------------------
   * SCROLL → FRAME
   * -----------------------------------------
   */

  useMotionValueEvent(
    scrollYProgress,
    "change",
    (latest) => {
      if (!isReady) return;

      const progress = clamp(
        latest,
        0,
        0.999999
      );

      const frame = Math.floor(
        progress * TOTAL_FRAMES
      );

      /*
       * Don't redraw the same frame.
       */

      if (
        frame === currentFrameRef.current
      ) {
        return;
      }

      /*
       * Start drawing immediately.
       */

      scheduleDraw(frame);

      /*
       * Preload nearby frames separately.
       */

      preloadNearbyFrames(frame);
    }
  );

  /*
   * -----------------------------------------
   * BACKGROUND PRELOADING
   * -----------------------------------------
   */

  const preloadNearbyFrames = useCallback(
    (centerFrame) => {
      if (preloadTimerRef.current !== null) {
        return;
      }

      /*
       * Give the browser a small break before
       * background image loading.
       */

      preloadTimerRef.current =
        setTimeout(async () => {
          preloadTimerRef.current = null;

          const indexes = [];

          /*
           * Load forward frames first.
           */

          for (
            let i = 1;
            i <= BACKGROUND_BATCH_SIZE;
            i++
          ) {
            const index =
              centerFrame + i;

            if (
              index < TOTAL_FRAMES &&
              !loadedRef.current.has(index)
            ) {
              indexes.push(index);
            }
          }

          /*
           * Then load backward frames.
           */

          for (
            let i = 1;
            i <= BACKGROUND_BATCH_SIZE;
            i++
          ) {
            const index =
              centerFrame - i;

            if (
              index >= 0 &&
              !loadedRef.current.has(index)
            ) {
              indexes.push(index);
            }
          }

          /*
           * Only load a small number at a time.
           */

          for (const index of indexes) {
            await loadImage(index);
          }
        }, 20);
    },
    [loadImage]
  );

  /*
   * -----------------------------------------
   * CONTINUOUS BACKGROUND PRELOAD
   * -----------------------------------------
   *
   * After the first 12 frames are ready,
   * gradually load the remaining frames.
   *
   * This does NOT block scroll rendering.
   */

  useEffect(() => {
    if (!isReady) return;

    let cancelled = false;
    let nextIndex = INITIAL_FRAMES;

    const loadNextBatch = async () => {
      if (cancelled) return;

      let loadedCount = 0;

      while (
        nextIndex < TOTAL_FRAMES &&
        loadedCount < 4
      ) {
        const index = nextIndex++;

        if (
          !loadedRef.current.has(index) &&
          !loadingRef.current.has(index)
        ) {
          await loadImage(index);
          loadedCount++;
        }
      }

      if (cancelled) return;

      if (nextIndex < TOTAL_FRAMES) {
        preloadTimerRef.current =
          setTimeout(loadNextBatch, 80);
      }
    };

    preloadTimerRef.current =
      setTimeout(loadNextBatch, 100);

    return () => {
      cancelled = true;

      if (preloadTimerRef.current !== null) {
        clearTimeout(
          preloadTimerRef.current
        );

        preloadTimerRef.current = null;
      }
    };
  }, [isReady, loadImage]);

  /*
   * -----------------------------------------
   * RESIZE
   * -----------------------------------------
   */

  useEffect(() => {
    if (!isReady) return;

    const handleResize = () => {
      if (resizeTimerRef.current !== null) {
        clearTimeout(
          resizeTimerRef.current
        );
      }

      resizeTimerRef.current =
        setTimeout(() => {
          resizeTimerRef.current = null;

          resizeCanvas();

          drawFrame(
            currentFrameRef.current
          );
        }, 120);
    };

    window.addEventListener(
      "resize",
      handleResize,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );

      if (resizeTimerRef.current !== null) {
        clearTimeout(
          resizeTimerRef.current
        );
      }
    };
  }, [
    isReady,
    resizeCanvas,
    drawFrame,
  ]);

  /*
   * -----------------------------------------
   * SIGNUP OFFER
   * -----------------------------------------
   */

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

  /*
   * -----------------------------------------
   * CLEANUP
   * -----------------------------------------
   */

  useEffect(() => {
    return () => {
      if (
        animationFrameRef.current !== null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current = null;
      }

      if (
        preloadTimerRef.current !== null
      ) {
        clearTimeout(
          preloadTimerRef.current
        );

        preloadTimerRef.current = null;
      }

      if (
        resizeTimerRef.current !== null
      ) {
        clearTimeout(
          resizeTimerRef.current
        );

        resizeTimerRef.current = null;
      }
    };
  }, []);

  /*
   * -----------------------------------------
   * LOADER
   * -----------------------------------------
   */

  const loadingPercentage = Math.min(
    Math.round(
      (Math.min(
        loadedFrames,
        INITIAL_FRAMES
      ) /
        INITIAL_FRAMES) *
        100
    ),
    100
  );

  return (
    <>
      <section
        ref={sectionRef}
        className="premium-hero"
      >
        <div className="premium-hero__sticky">
          <canvas
            ref={canvasRef}
            className="premium-hero__canvas"
          />

          <div className="premium-hero__overlay" />

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
                  }}
                />
              </div>

              <span>
                {loadingPercentage}%
              </span>
            </div>
          )}

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

          <motion.div
            className="premium-hero__scroll"
            animate={{
              opacity: isReady ? 1 : 0,
            }}
          >
            <div className="premium-hero__scroll-line">
              <motion.div
                style={{
                  scaleY: scrollYProgress,
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