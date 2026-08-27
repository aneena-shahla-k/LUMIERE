import React, { useEffect, useRef, useState, useCallback } from "react";
import { useScroll, useTransform, motion, useSpring } from "framer-motion";
import "../styles/premiumHero.css";
import SignupOffer from "./SignupOffer";

const TOTAL_FRAMES = 90;

export default function PremiumHero() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const animFrameId = useRef(null);
  const currentFrameRef = useRef(1);
  const lastDrawnFrameRef = useRef(-1);

  // High performance cache refs
  const canvasSizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const pendingFrameIndexRef = useRef(null);
  const lastDrawTimeRef = useRef(0);

  const [isReady, setIsReady] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [showSignupOffer, setShowSignupOffer] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Client-side mobile detection
  useEffect(() => {
    const isMobile = window.innerWidth < 768 || navigator.maxTouchPoints > 0;
    setIsMobileDevice(isMobile);
  }, []);

  // 1. Get raw scroll progress
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // 2. High-speed spring progress
  const smoothScrollYProgress = useSpring(scrollYProgress, {
    stiffness: 140, 
    damping: 30,    
    restDelta: 0.001
  });

  // 3. Map smoothed scroll to frame indices
  const frameIndex = useTransform(smoothScrollYProgress, [0, 1], [1, TOTAL_FRAMES]);

  /* ================================
     CANVAS SIZE SETUP (No layout thrashing)
  ================================ */
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const isMobile = window.innerWidth < 768 || navigator.maxTouchPoints > 0;
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    const displayWidth = Math.floor(rect.width) || window.innerWidth;
    const displayHeight = Math.floor(rect.height) || window.innerHeight;

    const pixelWidth = displayWidth * dpr;
    const pixelHeight = displayHeight * dpr;

    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    canvasSizeRef.current = {
      width: pixelWidth,
      height: pixelHeight,
      dpr,
    };
  }, []);

  /* ================================
     COALESCED DRAW CALLBACK
  ================================ */
  const drawCallback = useCallback(() => {
    const targetIndex = pendingFrameIndexRef.current;
    if (targetIndex === null) return;
    pendingFrameIndexRef.current = null; // Clear pending

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    // Find target image or fallback to nearest loaded frame
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

    let { width: canvasWidth, height: canvasHeight } = canvasSizeRef.current;
    if (canvasWidth === 0 || canvasHeight === 0) {
      updateCanvasDimensions();
      ({ width: canvasWidth, height: canvasHeight } = canvasSizeRef.current);
    }

    if (canvasWidth === 0 || canvasHeight === 0) return;

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

    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    
    lastDrawnFrameRef.current = targetIndex;
  }, [updateCanvasDimensions]);

  /* ================================
     RENDER INITIATION (With Mobile Lazy Load & 30fps throttle)
  ================================ */
  const renderFrame = useCallback((index) => {
    const targetIndex = Math.min(Math.max(Math.round(index), 1), TOTAL_FRAMES);

    // Skip drawing if frame hasn't changed
    if (targetIndex === lastDrawnFrameRef.current) return;

    const isMobile = window.innerWidth < 768 || navigator.maxTouchPoints > 0;

    // MOBILE LAZY LOADING: Only trigger image loads when scrolled to
    if (isMobile) {
      const imgIndex = targetIndex - 1;
      if (!imagesRef.current[imgIndex]) {
        const img = new Image();
        img.decoding = "async";
        const paddedIndex = String(targetIndex).padStart(3, "0");
        img.src = `/skin-fr/ezgif-frame-${paddedIndex}.webp`;
        
        img.onload = () => {
          // If the scroll position is still close to this frame, render it
          if (Math.abs(currentFrameRef.current - targetIndex) <= 8) {
            renderFrame(currentFrameRef.current);
          }
        };
        imagesRef.current[imgIndex] = img;
      }
    }

    // 30fps throttle on Mobile to let CPU decode images cleanly
    if (isMobile) {
      const now = performance.now();
      if (now - lastDrawTimeRef.current < 33) { 
        return; 
      }
      lastDrawTimeRef.current = now;
    }

    currentFrameRef.current = targetIndex;
    pendingFrameIndexRef.current = targetIndex;

    if (!animFrameId.current) {
      animFrameId.current = requestAnimationFrame(() => {
        animFrameId.current = null;
        drawCallback();
      });
    }
  }, [drawCallback]);

  // Preload logic: Load first frame instantly, preload others on Desktop only
  useEffect(() => {
    let isMounted = true;
    const loadedImages = new Array(TOTAL_FRAMES);
    let loadedCounter = 0;

    updateCanvasDimensions();

    const isMobile = window.innerWidth < 768 || navigator.maxTouchPoints > 0;

    // Load first frame immediately to make site ready
    const loadFirstFrame = async () => {
      const img = new Image();
      img.decoding = "async";
      img.src = `/skin-fr/ezgif-frame-001.webp`;
      img.onload = () => {
        if (!isMounted) return;
        loadedImages[0] = img;
        setIsReady(true);
        renderFrame(1);
        
        // Start background download ONLY on Desktop
        if (!isMobile) {
          preloadDesktopFrames();
        }
      };
      img.onerror = () => {
        if (!isMounted) return;
        setIsReady(true);
        if (!isMobile) {
          preloadDesktopFrames();
        }
      };
      loadedImages[0] = img;
    };

    const preloadDesktopFrames = async () => {
      const queue = Array.from({ length: TOTAL_FRAMES - 1 }, (_, i) => i + 1);
      const concurrency = 6;

      const worker = async () => {
        while (queue.length > 0 && isMounted) {
          const nextIndex = queue.shift();
          if (nextIndex !== undefined) {
            await loadSingleFrame(nextIndex);
          }
        }
      };

      const workers = Array.from({ length: concurrency }, () => worker());
      await Promise.all(workers);
    };

    const loadSingleFrame = (index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        const paddedIndex = String(index + 1).padStart(3, "0");
        img.src = `/skin-fr/ezgif-frame-${paddedIndex}.webp`;

        img.onload = () => {
          if (!isMounted) return resolve();
          img.decode()
            .then(() => {
              if (!isMounted) return;
              loadedImages[index] = img;
              loadedCounter++;
              setLoadedCount(loadedCounter);
            })
            .catch(() => {
              if (!isMounted) return;
              loadedImages[index] = img;
              loadedCounter++;
              setLoadedCount(loadedCounter);
            })
            .finally(() => {
              resolve();
            });
        };

        img.onerror = () => {
          if (!isMounted) return resolve();
          resolve();
        };
      });
    };

    imagesRef.current = loadedImages;
    loadFirstFrame();

    // Scroll listener on frameIndex
    const unsubscribe = frameIndex.on("change", (latest) => {
      renderFrame(latest);
    });

    const handleResize = () => {
      updateCanvasDimensions();
      renderFrame(currentFrameRef.current);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      isMounted = false;
      unsubscribe();
      window.removeEventListener("resize", handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [frameIndex, renderFrame, updateCanvasDimensions]);

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

  // Mobile gets instant 100% loader once Frame 1 renders; Desktop counts background load
  const loadingPercentage = isMobileDevice 
    ? (isReady ? 100 : 0)
    : Math.min(Math.round((loadedCount / 20) * 100), 100);

  return (
    <>
      <section ref={sectionRef} className="premium-hero">
        <div className="premium-hero__sticky">
          <canvas 
            ref={canvasRef} 
            className="premium-hero__canvas" 
            style={{ transform: "translate3d(0,0,0)", willChange: "transform" }}
          />

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