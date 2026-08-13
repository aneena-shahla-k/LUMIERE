import React, { useEffect, useRef } from "react";
import { useScroll, useSpring } from "framer-motion";
import "./BottleScrollAnimation.css";

const TOTAL_FRAMES = 85;

const getFramePath = (index) => {
  const frameNumber = String(index + 1).padStart(3, "0");
  return `/bottle-frames/ezgif-frame-${frameNumber}.png`;
};

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export default function BottleScrollAnimation() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);

  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const requestRef = useRef(null);

  /* =========================================
     SCROLL PROGRESS
     ========================================= */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.25,
  });

  /* =========================================
     FIND VALID FRAME
     ========================================= */
  const getValidFrame = (index) => {
    const images = imagesRef.current;
    if (!images.length) return null;

    const requested = images[index];
    if (requested && requested.complete && requested.naturalWidth > 0) {
      return requested;
    }

    for (let i = index - 1; i >= 0; i--) {
      const image = images[i];
      if (image && image.complete && image.naturalWidth > 0) return image;
    }

    for (let i = index + 1; i < images.length; i++) {
      const image = images[i];
      if (image && image.complete && image.naturalWidth > 0) return image;
    }

    return null;
  };

  /* =========================================
     DRAW FRAME (EXACT CONTAIN & RESPONSIVE FIT)
     ========================================= */
  const drawFrame = (frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const image = getValidFrame(frameIndex);
    if (!image) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width <= 0 || height <= 0) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const canvasWidth = Math.floor(width * pixelRatio);
    const canvasHeight = Math.floor(height * pixelRatio);

    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);

    /* Aspect Ratio Calculation */
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const canvasRatio = width / height;

    let drawWidth;
    let drawHeight;

    if (imageRatio > canvasRatio) {
      drawWidth = width;
      drawHeight = width / imageRatio;
    } else {
      drawHeight = height;
      drawWidth = height * imageRatio;
    }

    /* Screen Size Scaling */
    const isMobile = window.innerWidth <= 600;
    const isTablet = window.innerWidth <= 900;

    const scale = isMobile ? 0.72 : 0.85;
    drawWidth *= scale;
    drawHeight *= scale;

    /* Responsive Positioning (Prevents Off-screen Cutting) */
    let x;
    if (isMobile) {
      // Mobile-il exact center-bound
      x = width / 2 - drawWidth / 2;
    } else if (isTablet) {
      // Tablet view
      x = width * 0.60 - drawWidth / 2;
    } else {
      // Desktop right side alignment
      x = width * 0.65 - drawWidth / 2;
    }

    const y = height / 2 - drawHeight / 2;

    if (image.complete && image.naturalWidth > 0) {
      context.drawImage(image, x, y, drawWidth, drawHeight);
    }
  };

  /* =========================================
     PRELOAD FRAMES (INSTANT FIRST FRAME DISPLAY)
     ========================================= */
  useEffect(() => {
    let cancelled = false;

    const loadFrame = (index) => {
      return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve({ index, image });
        image.onerror = () => resolve({ index, image: null });
        image.src = getFramePath(index);
      });
    };

    const preload = async () => {
      const images = new Array(TOTAL_FRAMES);

      /* Load 1st Frame immediately so it shows without delay */
      const firstFrame = await loadFrame(0);
      if (!cancelled && firstFrame.image) {
        images[0] = firstFrame.image;
        imagesRef.current = images;
        drawFrame(0);
      }

      /* Load remaining frames in batches */
      const BATCH_SIZE = 10;
      for (let start = 0; start < TOTAL_FRAMES; start += BATCH_SIZE) {
        if (cancelled) return;

        const batch = [];
        for (
          let i = start;
          i < Math.min(start + BATCH_SIZE, TOTAL_FRAMES);
          i++
        ) {
          batch.push(loadFrame(i));
        }

        const results = await Promise.all(batch);
        results.forEach((result) => {
          images[result.index] = result.image;
        });
      }

      if (cancelled) return;
      imagesRef.current = images;
      drawFrame(currentFrameRef.current);
    };

    preload();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================
     SCROLL LISTENER
     ========================================= */
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (progress) => {
      const frame = Math.floor(
        clamp(progress, 0, 0.999999) * TOTAL_FRAMES
      );

      if (frame === currentFrameRef.current) return;

      currentFrameRef.current = frame;

      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }

      requestRef.current = requestAnimationFrame(() => {
        drawFrame(frame);
      });
    });

    return () => {
      unsubscribe();
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [smoothProgress]);

  /* =========================================
     RESIZE HANDLER
     ========================================= */
  useEffect(() => {
    const handleResize = () => {
      drawFrame(currentFrameRef.current);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section ref={sectionRef} className="bottle-animation">
      <div className="bottle-animation__sticky">
        <canvas ref={canvasRef} className="bottle-animation__canvas" />

        <div className="bottle-animation__content">
          <div className="bottle-animation__eyebrow">THE RITUAL</div>
          <h2>
            The future of
            <br />
            <em>luminous skin</em>
            <br />
            begins here.
          </h2>
          <p>
            Discover the ritual behind
            <br />
            luminous skin.
          </p>
        </div>
      </div>
    </section>
  );
}
