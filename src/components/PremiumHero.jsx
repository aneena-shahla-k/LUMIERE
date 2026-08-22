import React, { useEffect, useRef, useState, useCallback } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import "../styles/premiumHero.css";
import SignupOffer from "./SignupOffer";

const TOTAL_FRAMES = 206;

export default function PremiumHero() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const animFrameId = useRef(null);
  const currentFrameRef = useRef(1);

  const [isReady, setIsReady] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [showSignupOffer, setShowSignupOffer] = useState(false);

  // Framer motion scroll tracking
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, TOTAL_FRAMES]);

  // Clean Canvas Renderer
  const renderFrame = useCallback((index) => {
    const targetIndex = Math.min(Math.max(Math.round(index), 1), TOTAL_FRAMES);
    currentFrameRef.current = targetIndex;

    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
    }

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
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const displayWidth = Math.floor(rect.width);
      const displayHeight = Math.floor(rect.height);

      if (
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
    const loadedImages = [];
    let readyFired = false;
    let loadedCounter = 0;

    const handleImageLoad = () => {
      loadedCounter++;
      // Update percentage loader for initial 25 frames only
      if (loadedCounter <= 25) {
        setLoadedCount(loadedCounter);
      }

      // Ready trigger after first 20 frames loaded
      if (loadedCounter >= 20 && !readyFired) {
        readyFired = true;
        setIsReady(true);
        renderFrame(1);
      }
    };

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const paddedIndex = String(i).padStart(3, "0");
      const img = new Image();
      img.decoding = "async";
      img.onload = handleImageLoad;
      img.src = `/skin-frames/ezgif-frame-${paddedIndex}.webp`;

      loadedImages.push(img);
    }
    imagesRef.current = loadedImages;

    // Scroll listener on frameIndex
    const unsubscribe = frameIndex.on("change", (latest) => {
      renderFrame(latest);
    });

    const handleResize = () => {
      renderFrame(currentFrameRef.current);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
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
    Math.round((loadedCount / 20) * 100),
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