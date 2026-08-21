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
const INITIAL_FRAMES = 12;
const NEARBY_PRELOAD_WINDOW = 12;
const BACKGROUND_BATCH_SIZE = 6;

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

  const imagesRef = useRef(new Array(TOTAL_FRAMES).fill(null));
  const loadingRef = useRef(new Set());
  const loadedRef = useRef(new Set());

  const currentFrameRef = useRef(0);
  const animationFrameRef = useRef(null);
  const idleCallbackRef = useRef(null);

  const backgroundLoadingRef = useRef(false);
  const backgroundCursorRef = useRef(INITIAL_FRAMES);
  const lastDrawnFrameRef = useRef(-1);

  const [loadedFrames, setLoadedFrames] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [showSignupOffer, setShowSignupOffer] = useState(false);

  /* --------------------------------
     SCROLL & SPRING
  -------------------------------- */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.2,
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
      return Promise.resolve(imagesRef.current[index] || null);
    }

    loadingRef.current.add(index);

    return new Promise((resolve) => {
      const image = new Image();
      image.decoding = "async";
      const path = getFramePath(index);

      image.onload = () => {
        if (image.naturalWidth > 0 && image.naturalHeight > 0) {
          imagesRef.current[index] = image;
          loadedRef.current.add(index);
          setLoadedFrames(loadedRef.current.size);
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
      for (let index = 0; index < INITIAL_FRAMES; index++) {
        if (cancelled) return;
        await loadImage(index);
      }

      if (!cancelled) {
        setIsReady(true);
      }
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

    const context = canvasRef.current.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    contextRef.current = context;

    return () => {
      contextRef.current = null;
    };
  }, []);

  /* --------------------------------
     NEAREST VALID FRAME FINDER
  -------------------------------- */
  const getValidFrame = useCallback((requestedIndex) => {
    const images = imagesRef.current;

    if (images[requestedIndex]?.complete && images[requestedIndex]?.naturalWidth > 0) {
      return images[requestedIndex];
    }

    let closestIndex = -1;
    let minDistance = Infinity;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = images[i];
      if (img && img.complete && img.naturalWidth > 0) {
        const dist = Math.abs(i - requestedIndex);
        if (dist < minDistance) {
          minDistance = dist;
          closestIndex = i;
        }
      }
    }

    return closestIndex !== -1 ? images[closestIndex] : null;
  }, []);

  /* --------------------------------
     DRAW FRAME
  -------------------------------- */
  const drawFrame = useCallback(
    (frameIndex) => {
      const canvas = canvasRef.current;
      const context = contextRef.current;

      if (!canvas || !context) return;

      const image = getValidFrame(frameIndex);
      if (!image) return;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (width <= 0 || height <= 0) return;

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const targetCanvasWidth = Math.floor(width * pixelRatio);
      const targetCanvasHeight = Math.floor(height * pixelRatio);

      if (canvas.width !== targetCanvasWidth || canvas.height !== targetCanvasHeight) {
        canvas.width = targetCanvasWidth;
        canvas.height = targetCanvasHeight;
      }

      context.save();
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      const imageRatio = image.naturalWidth / image.naturalHeight;
      const canvasRatio = width / height;

      let drawWidth;
      let drawHeight;

      if (imageRatio > canvasRatio) {
        drawHeight = height;
        drawWidth = height * imageRatio;
      } else {
        drawWidth = width;
        drawHeight = width / imageRatio;
      }

      const scale = 1.03;
      drawWidth *= scale;
      drawHeight *= scale;

      const x = (width - drawWidth) / 2;
      const y = (height - drawHeight) / 2;

      context.drawImage(image, x, y, drawWidth, drawHeight);
      context.restore();

      lastDrawnFrameRef.current = frameIndex;
    },
    [getValidFrame]
  );

  /* --------------------------------
     INITIAL CANVAS DRAW
  -------------------------------- */
  useEffect(() => {
    if (!isReady) return;

    const frame = requestAnimationFrame(() => {
      drawFrame(0);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isReady, drawFrame]);

  /* --------------------------------
     PRELOAD NEARBY WINDOW
  -------------------------------- */
  const preloadAroundFrame = useCallback(
    (centerFrame) => {
      const start = Math.max(0, centerFrame - NEARBY_PRELOAD_WINDOW);
      const end = Math.min(TOTAL_FRAMES, centerFrame + NEARBY_PRELOAD_WINDOW + 1);

      for (let i = centerFrame; i < end; i++) {
        if (!loadedRef.current.has(i) && !loadingRef.current.has(i)) {
          loadImage(i);
        }
      }

      for (let i = centerFrame - 1; i >= start; i--) {
        if (!loadedRef.current.has(i) && !loadingRef.current.has(i)) {
          loadImage(i);
        }
      }
    },
    [loadImage]
  );

  /* --------------------------------
     BACKGROUND LOAD ALL FRAMES
  -------------------------------- */
  const loadRemainingFrames = useCallback(() => {
    if (backgroundLoadingRef.current) return;
    backgroundLoadingRef.current = true;

    const loadBatch = () => {
      const start = backgroundCursorRef.current;
      if (start >= TOTAL_FRAMES) {
        backgroundLoadingRef.current = false;
        return;
      }

      const end = Math.min(start + BACKGROUND_BATCH_SIZE, TOTAL_FRAMES);
      backgroundCursorRef.current = end;

      const promises = [];
      for (let i = start; i < end; i++) {
        if (!loadedRef.current.has(i) && !loadingRef.current.has(i)) {
          promises.push(loadImage(i));
        }
      }

      Promise.all(promises).finally(() => {
        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
          idleCallbackRef.current = window.requestIdleCallback(loadBatch, { timeout: 800 });
        } else {
          setTimeout(loadBatch, 60);
        }
      });
    };

    loadBatch();
  }, [loadImage]);

  useEffect(() => {
    if (!isReady) return;

    const timer = setTimeout(() => {
      loadRemainingFrames();
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [isReady, loadRemainingFrames]);

  /* --------------------------------
     SCROLL LISTENER
  -------------------------------- */
  useEffect(() => {
    if (!isReady) return;

    const unsubscribe = smoothProgress.on("change", (progress) => {
      const frame = Math.floor(clamp(progress, 0, 0.999999) * TOTAL_FRAMES);

      preloadAroundFrame(frame);

      if (frame === currentFrameRef.current) return;
      currentFrameRef.current = frame;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        drawFrame(frame);
      });
    });

    return () => {
      unsubscribe();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isReady, smoothProgress, drawFrame, preloadAroundFrame]);

  /* --------------------------------
     RESIZE LISTENER
  -------------------------------- */
  useEffect(() => {
    if (!isReady) return;

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        lastDrawnFrameRef.current = -1;
        drawFrame(currentFrameRef.current);
      }, 100);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [isReady, drawFrame]);

  /* --------------------------------
     SIGNUP OFFER
  -------------------------------- */
  useEffect(() => {
    if (!isReady) return;

    const alreadyShown = sessionStorage.getItem("lumiere_signup_offer_shown");
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setShowSignupOffer(true);
      sessionStorage.setItem("lumiere_signup_offer_shown", "true");
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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (idleCallbackRef.current && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackRef.current);
      }
    };
  }, []);

  const loadingPercentage = Math.min(
    Math.round((Math.min(loadedFrames, INITIAL_FRAMES) / INITIAL_FRAMES) * 100),
    100
  );

  return (
    <>
      <section ref={sectionRef} className="premium-hero">
        <div className="premium-hero__sticky">
          <canvas ref={canvasRef} className="premium-hero__canvas" />
          <div className="premium-hero__overlay" />

          {!isReady && (
            <div className="premium-hero__loader">
              <div className="premium-hero__loader-brand">LUMIÈRE</div>
              <div className="premium-hero__loader-line">
                <motion.div
                  className="premium-hero__loader-progress"
                  animate={{ width: `${loadingPercentage}%` }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                />
              </div>
              <span>{loadingPercentage}%</span>
            </div>
          )}

          <motion.div
            className="premium-hero__content"
            initial={{ opacity: 0 }}
            animate={{ opacity: isReady ? 1 : 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div className="premium-hero__eyebrow">ADVANCED SKINCARE</div>
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
            <button className="premium-hero__cta">
              <span>DISCOVER THE RITUAL</span>
              <span className="premium-hero__arrow">→</span>
            </button>
          </motion.div>

          <motion.div
            className="premium-hero__scroll"
            animate={{ opacity: isReady ? 1 : 0 }}
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
        <SignupOffer onClose={() => setShowSignupOffer(false)} />
      )}
    </>
  );
}