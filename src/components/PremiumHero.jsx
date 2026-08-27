import React, { useEffect, useRef, useState, useCallback } from "react";
// Added useSpring import
import { useScroll, useTransform, motion, useSpring } from "framer-motion";
import "../styles/premiumHero.css";
import SignupOffer from "./SignupOffer";

const TOTAL_FRAMES = 184;

export default function PremiumHero() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const animFrameId = useRef(null);
  const currentFrameRef = useRef(1);

  const [isReady, setIsReady] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [showSignupOffer, setShowSignupOffer] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Client-side mobile detection to prevent SSR/hydration mismatch
  useEffect(() => {
    const isMobile = window.innerWidth < 768 || navigator.maxTouchPoints > 0;
    setIsMobileDevice(isMobile);
  }, []);

  const frameStep = isMobileDevice ? 3 : 1;
  const readyThreshold = isMobileDevice ? Math.ceil(20 / frameStep) : 20;

  // 1. Get raw scroll progress
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // 2. Smooth progress with physics-based spring physics
  const smoothScrollYProgress = useSpring(scrollYProgress, {
    stiffness: 75,
    damping: 25,
    restDelta: 0.001
  });

  // 3. Map smoothed scroll to frame indices
  const frameIndex = useTransform(smoothScrollYProgress, [0, 1], [1, TOTAL_FRAMES]);

  // Clean Canvas Renderer
  const renderFrame = useCallback((index) => {
    const targetIndex = Math.min(Math.max(Math.round(index), 1), TOTAL_FRAMES);
    currentFrameRef.current = targetIndex;

    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
    }

    // Direct draw inside the RAF event loop for zero latency
    animFrameId.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d", { alpha: false });
      if (!context) return;

      // Find current or nearest available loaded frame (Zero freezing)
      let img = imagesRef.current[targetIndex - 1];

      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let dist = 1; dist < TOTAL_FRAMES; dist++) {
          const prev = imagesRef.current[targetIndex - 1 - dist];
          if (prev && prev.complete && prev.naturalWidth > 0) {
            img = prev;
            break;
          }
          const next = imagesRef.current[targetIndex - 1 + dist];
          if (next && next.complete && next.naturalWidth > 0) {
            img = next;
            break;
          }
        }
      }

      if (!img || !img.complete || img.naturalWidth === 0) return;

      const rect = canvas.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      // Cap DPR to 1 on mobile to prevent GPU fill-rate lagging
      const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

      const displayWidth = Math.floor(rect.width);
      const displayHeight = Math.floor(rect.height);

      if (displayWidth === 0 || displayHeight === 0) {
        // Safe dimensions fallback if container size hasn't calculated on mount yet
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
      } else if (
        canvas.width !== displayWidth * dpr ||
        canvas.height !== displayHeight * dpr
      ) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Cinematic Cover scale
      const scale =
        Math.max(
          canvasWidth / img.naturalWidth,
          canvasHeight / img.naturalHeight
        ) * 1.03;

      const drawWidth = img.naturalWidth * scale;
      const drawHeight = img.naturalHeight * scale;

      const offsetX = (canvasWidth - drawWidth) / 2;
      const offsetY = (canvasHeight - drawHeight) / 2;

      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    });
  }, []);

  // Preload all frames smoothly with no loop ESLint errors
  useEffect(() => {
    let isMounted = true;
    const loadedImages = new Array(TOTAL_FRAMES);
    let loadedCounter = 0;
    let readyFired = false;

    const isMobile = window.innerWidth < 768 || navigator.maxTouchPoints > 0;
    const frameStep = isMobile ? 3 : 1;

    const indicesToLoad = [];
    for (let i = 0; i < TOTAL_FRAMES; i += frameStep) {
      indicesToLoad.push(i);
    }
    if (!indicesToLoad.includes(TOTAL_FRAMES - 1)) {
      indicesToLoad.push(TOTAL_FRAMES - 1);
    }

    const readyThreshold = isMobile ? Math.ceil(20 / frameStep) : 20;

    const handleFirstFrameReady = () => {
      if (!readyFired) {
        readyFired = true;
        setIsReady(true);
        renderFrame(1);
      }
    };

    const loadImage = (index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        const paddedIndex = String(index + 1).padStart(3, "0");
        img.src = `/skin-frames/ezgif-frame-${paddedIndex}.webp`;

        img.onload = () => {
          if (!isMounted) return resolve();

          const handleLoaded = () => {
            loadedImages[index] = img;
            loadedCounter++;
            
            // Only update loading state for loader threshold
            if (loadedCounter <= readyThreshold + 5) {
              setLoadedCount(loadedCounter);
            }

            if (loadedCounter >= readyThreshold) {
              handleFirstFrameReady();
            }
            resolve();
          };

          // ONLY pre-decode on Desktop to prevent browser tab crashes on low-GB mobile devices
          if (!isMobile && typeof img.decode === 'function') {
            img.decode()
              .then(handleLoaded)
              .catch(handleLoaded); // Fallback to normal loading if decode fails
          } else {
            handleLoaded();
          }
        };

        img.onerror = () => {
          if (!isMounted) return resolve();
          loadedCounter++;
          if (loadedCounter <= readyThreshold + 5) {
            setLoadedCount(loadedCounter);
          }
          if (loadedCounter >= readyThreshold) {
            handleFirstFrameReady();
          }
          resolve();
        };
      });
    };

    const loadInitialBatch = async () => {
      const initialIndices = indicesToLoad.slice(0, readyThreshold);
      const queue = [...initialIndices];
      const concurrency = isMobile ? 3 : 5;

      const worker = async () => {
        while (queue.length > 0 && isMounted) {
          const nextIndex = queue.shift();
          if (nextIndex !== undefined) {
            await loadImage(nextIndex);
          }
        }
      };

      const workers = Array.from({ length: concurrency }, () => worker());
      await Promise.all(workers);

      // Delay remaining frames slightly so page enters smoothly
      if (isMounted) {
        setTimeout(() => {
          if (isMounted) {
            loadRemainingFrames();
          }
        }, 800);
      }
    };

    const loadRemainingFrames = async () => {
      const remainingIndices = indicesToLoad.slice(readyThreshold);
      const queue = [...remainingIndices];
      const concurrency = isMobile ? 3 : 6;

      const worker = async () => {
        while (queue.length > 0 && isMounted) {
          const nextIndex = queue.shift();
          if (nextIndex !== undefined) {
            await loadImage(nextIndex);
          }
        }
      };

      const workers = Array.from({ length: concurrency }, () => worker());
      await Promise.all(workers);
    };

    imagesRef.current = loadedImages;
    loadInitialBatch();

    // Scroll listener on frameIndex
    const unsubscribe = frameIndex.on("change", (latest) => {
      renderFrame(latest);
    });

    const handleResize = () => {
      renderFrame(currentFrameRef.current);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      isMounted = false;
      unsubscribe();
      window.removeEventListener("resize", handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [frameIndex, renderFrame]);

  // Signup Offer Popup
  useEffect(() => {
    if (!isReady) return;

    const alreadyShown = sessionStorage.getItem("lumiere_signup_offer_shown");
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setShowSignupOffer(true);
      sessionStorage.setItem("lumiere_signup_offer_shown", "true");
    }, 1500);

    return () => clearTimeout(timer);
  }, [isReady]);

  const loadingPercentage = Math.min(
    Math.round((loadedCount / readyThreshold) * 100),
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
                  style={{ width: `${loadingPercentage}%` }}
                />
              </div>
              <span>{loadingPercentage}%</span>
            </div>
          )}

          <motion.div
            className="premium-hero__content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isReady ? 1 : 0, y: isReady ? 0 : 20 }}
            transition={{ duration: 1, ease: "easeOut" }}
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
              Advanced skincare rituals made for luminous skin.
            </p>

            <button className="premium-hero__cta" type="button">
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
                  scaleY: scrollYProgress,
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