import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import "../styles/premiumHero.css";
import SignupOffer from "./SignupOffer";

const TOTAL_FRAMES = 206;
const INITIAL_FRAMES = 12;
const NEARBY_FRAMES = 18;

const getFramePath = (index) => {
  const frameNumber = String(index + 1).padStart(3, "0");
  return `/skin-frames/ezgif-frame-${frameNumber}.webp`;
};

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

export default function PremiumHero() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  const imagesRef = useRef([]);
  const loadingRef = useRef(new Set());
  const loadedRef = useRef(new Set());

  const currentFrameRef = useRef(0);
  const animationFrameRef = useRef(null);
  const idleCallbackRef = useRef(null);

  const [loadedFrames, setLoadedFrames] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [showSignupOffer, setShowSignupOffer] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.2,
  });

  /*
   * -----------------------------------------
   * LOAD IMAGE
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
      const path = getFramePath(index);

      image.decoding = "async";

      image.onload = async () => {
        try {
          if (image.decode) {
            await image.decode();
          }
        } catch {
          // Image can still be usable after decode failure.
        }

        loadingRef.current.delete(index);

        if (
          image.naturalWidth > 0 &&
          image.naturalHeight > 0
        ) {
          imagesRef.current[index] = image;
          loadedRef.current.add(index);

          setLoadedFrames(
            loadedRef.current.size
          );

          resolve(image);
          return;
        }

        resolve(null);
      };

      image.onerror = () => {
        loadingRef.current.delete(index);
        resolve(null);
      };

      image.src = path;
    });
  }, []);

  /*
   * -----------------------------------------
   * INITIAL PRELOAD
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

  useEffect(() => {
    if (!canvasRef.current) return;

    contextRef.current =
      canvasRef.current.getContext("2d", {
        alpha: true,
        desynchronized: true,
      });

    return () => {
      contextRef.current = null;
    };
  }, []);

  /*
   * -----------------------------------------
   * FIND BEST AVAILABLE FRAME
   * -----------------------------------------
   */

  const getValidFrame = useCallback(
    (requestedIndex) => {
      const images = imagesRef.current;

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
       * Search nearby frames first.
       */

      for (
        let distance = 1;
        distance <= 12;
        distance++
      ) {
        const previous =
          requestedIndex - distance;

        if (previous >= 0) {
          const image = images[previous];

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
          const image = images[next];

          if (
            image &&
            image.complete &&
            image.naturalWidth > 0
          ) {
            return image;
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
    (frameIndex) => {
      const canvas = canvasRef.current;
      const context = contextRef.current;

      if (!canvas || !context) return;

      const image =
        getValidFrame(frameIndex);

      if (!image) return;

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
       * Very small crop for cinematic coverage.
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
    [getValidFrame]
  );

  /*
   * -----------------------------------------
   * INITIAL DRAW
   * -----------------------------------------
   */

  useEffect(() => {
    if (!isReady) return;

    const frame =
      requestAnimationFrame(() => {
        drawFrame(0);
      });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isReady, drawFrame]);

  /*
   * -----------------------------------------
   * LOAD NEARBY FRAMES
   * -----------------------------------------
   */

  const preloadAroundFrame = useCallback(
    (centerFrame) => {
      const start = Math.max(
        0,
        centerFrame - NEARBY_FRAMES
      );

      const end = Math.min(
        TOTAL_FRAMES,
        centerFrame + NEARBY_FRAMES
      );

      const indexes = [];

      /*
       * Prioritize frames after the
       * current frame because the user
       * normally scrolls forward.
       */

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
          typeof window !==
          "undefined" &&
          "requestIdleCallback" in window
        ) {
          idleCallbackRef.current =
            window.requestIdleCallback(
              loadNext,
              { timeout: 1000 }
            );
        } else {
          setTimeout(loadNext, 30);
        }
      };

      scheduleNext();
    },
    [loadImage]
  );

  /*
   * -----------------------------------------
   * SCROLL → FRAME
   * -----------------------------------------
   */

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
           * Start loading frames around
           * the user's current position.
           */

          preloadAroundFrame(frame);

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
    preloadAroundFrame,
  ]);

  /*
   * -----------------------------------------
   * RESIZE
   * -----------------------------------------
   */

  useEffect(() => {
    if (!isReady) return;

    let resizeTimer;

    const handleResize = () => {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        drawFrame(
          currentFrameRef.current
        );
      }, 100);
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      clearTimeout(resizeTimer);

      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [isReady, drawFrame]);

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