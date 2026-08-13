import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import "../styles/productAssembly.css";


const TOTAL_FRAMES = 40;

const FRAME_FOLDER = "/product-assembly";


/* =========================================================
   FRAME PATH
========================================================= */

const getFramePath = (index) => {
  const frameNumber = String(index + 1).padStart(3, "0");

  return `${FRAME_FOLDER}/ezgif-frame-${frameNumber}.png`;
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ProductAssemblySection() {

  const sectionRef = useRef(null);

  const canvasRef = useRef(null);

  const imagesRef = useRef([]);

  const animationFrameRef = useRef(null);

  const targetFrameRef = useRef(0);

  const currentFrameRef = useRef(0);

  const loadedFramesRef = useRef(0);

  const [loading, setLoading] = useState(true);

  const [loadProgress, setLoadProgress] =
    useState(0);


  /* =======================================================
     CANVAS SIZE
  ======================================================= */

  const resizeCanvas = useCallback(() => {

    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect =
      canvas.getBoundingClientRect();

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    canvas.width =
      Math.round(rect.width * dpr);

    canvas.height =
      Math.round(rect.height * dpr);

    const context =
      canvas.getContext("2d");

    if (!context) return;

    context.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    drawFrame(
      currentFrameRef.current
    );

  }, []);


  /* =======================================================
     DRAW FRAME
  ======================================================= */

  const drawFrame = useCallback(
    (frameIndex) => {

      const canvas =
        canvasRef.current;

      if (!canvas) return;

      const context =
        canvas.getContext("2d");

      if (!context) return;


      const image =
        imagesRef.current[frameIndex];

      /*
       * Important:
       * Never call drawImage on a broken image.
       */

      if (
        !image ||
        !image.complete ||
        image.naturalWidth === 0
      ) {
        return;
      }


      const rect =
        canvas.getBoundingClientRect();

      const width = rect.width;

      const height = rect.height;


      /*
       * Clear previous frame
       */

      context.clearRect(
        0,
        0,
        width,
        height
      );


      /*
       * Calculate contain scaling
       */

      const imageRatio =
        image.naturalWidth /
        image.naturalHeight;

      const canvasRatio =
        width / height;


      let drawWidth;

      let drawHeight;


      if (
        imageRatio >
        canvasRatio
      ) {

        drawWidth = width;

        drawHeight =
          width /
          imageRatio;

      } else {

        drawHeight = height;

        drawWidth =
          height *
          imageRatio;

      }


      /*
       * Slightly smaller than full canvas.
       * This prevents the product from feeling
       * cramped against the edges.
       */

      const isMobile =
        window.innerWidth <= 700;

      const scale =
        isMobile
          ? 0.94
          : 0.88;


      drawWidth *= scale;

      drawHeight *= scale;


      const x =
        (width - drawWidth) / 2;

      const y =
        (height - drawHeight) / 2;


      /*
       * Very subtle image shadow.
       */

      context.save();

      context.shadowColor =
        "rgba(45, 38, 30, 0.12)";

      context.shadowBlur =
        isMobile ? 22 : 35;

      context.shadowOffsetY =
        isMobile ? 10 : 18;


      context.drawImage(
        image,
        x,
        y,
        drawWidth,
        drawHeight
      );

      context.restore();

    },
    []
  );


  /* =======================================================
     PRELOAD ALL FRAMES
  ======================================================= */

  useEffect(() => {

    let cancelled = false;

    const images = [];

    let loaded = 0;


    const updateProgress = () => {

      loaded += 1;

      if (cancelled) return;

      loadedFramesRef.current =
        loaded;

      setLoadProgress(
        Math.round(
          (loaded /
            TOTAL_FRAMES) *
            100
        )
      );

      if (
        loaded ===
        TOTAL_FRAMES
      ) {

        setLoading(false);

        requestAnimationFrame(() => {

          resizeCanvas();

          drawFrame(0);

        });

      }

    };


    for (
      let i = 0;
      i < TOTAL_FRAMES;
      i++
    ) {

      const image =
        new Image();

      image.decoding = "async";

      image.src =
        getFramePath(i);


      image.onload = () => {

        /*
         * Only store successfully
         * loaded images.
         */

        if (
          !cancelled
        ) {

          imagesRef.current[i] =
            image;

        }

        updateProgress();

      };


      image.onerror = () => {

        /*
         * Broken frames don't crash
         * canvas.drawImage.
         */

        console.warn(
          `Could not load frame: ${getFramePath(i)}`
        );

        imagesRef.current[i] =
          null;

        updateProgress();

      };


      images.push(image);

    }


    return () => {

      cancelled = true;

      images.forEach(
        (image) => {

          image.onload = null;

          image.onerror = null;

        }
      );

    };

  }, [
    drawFrame,
    resizeCanvas,
  ]);


  /* =======================================================
     RESIZE
  ======================================================= */

  useEffect(() => {

    const handleResize =
      () => {

        resizeCanvas();

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

  }, [resizeCanvas]);


  /* =======================================================
     SCROLL ANIMATION
  ======================================================= */

  useEffect(() => {

    if (loading) return;


    const updateScroll =
      () => {

        if (
          animationFrameRef.current
        ) {

          return;

        }


        animationFrameRef.current =
          requestAnimationFrame(() => {

            animationFrameRef.current =
              null;


            const section =
              sectionRef.current;

            if (!section) return;


            const rect =
              section.getBoundingClientRect();

            const viewportHeight =
              window.innerHeight;


            /*
             * Animation starts when
             * section reaches viewport.
             */

            const start =
              viewportHeight * 0.05;


            /*
             * Animation ends after
             * approximately one viewport
             * of scrolling.
             */

            const animationDistance =
              viewportHeight * 1.15;


            const distance =
              start -
              rect.top;


            let progress =
              distance /
              animationDistance;


            progress =
              Math.max(
                0,
                Math.min(
                  1,
                  progress
                )
              );


            /*
             * Slight easing.
             */

            const easedProgress =
              progress < 0.5
                ? 2 *
                  progress *
                  progress
                : 1 -
                  Math.pow(
                    -2 *
                      progress +
                      2,
                    2
                  ) /
                    2;


            const targetFrame =
              Math.min(
                TOTAL_FRAMES - 1,
                Math.floor(
                  easedProgress *
                    (TOTAL_FRAMES - 1)
                )
              );


            targetFrameRef.current =
              targetFrame;

          });

      };


    /*
     * Smooth frame interpolation.
     */

    const animate =
      () => {

        const current =
          currentFrameRef.current;

        const target =
          targetFrameRef.current;


        const difference =
          target - current;


        if (
          Math.abs(
            difference
          ) >
          0.05
        ) {

          currentFrameRef.current =
            current +
            difference *
              0.16;

        } else {

          currentFrameRef.current =
            target;

        }


        const frame =
          Math.round(
            currentFrameRef.current
          );


        drawFrame(frame);


        requestAnimationFrame(
          animate
        );

      };


    const animation =
      requestAnimationFrame(
        animate
      );


    window.addEventListener(
      "scroll",
      updateScroll,
      {
        passive: true,
      }
    );


    updateScroll();


    return () => {

      cancelAnimationFrame(
        animation
      );

      if (
        animationFrameRef.current
      ) {

        cancelAnimationFrame(
          animationFrameRef.current
        );

      }

      window.removeEventListener(
        "scroll",
        updateScroll
      );

    };

  }, [
    loading,
    drawFrame,
  ]);


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <section
      ref={sectionRef}
      className="product-assembly-section"
    >

      {/* ================================================
          TOP LABEL
      ================================================ */}

      <div className="assembly-top">

        <span>
          07
        </span>

        <span>
          THE OBJECT
        </span>

        <span>
          FORM / FUNCTION
        </span>

      </div>


      {/* ================================================
          EDITORIAL HEADING
      ================================================ */}

      <div className="assembly-heading">

        <span>
          THE RITUAL, REFINED.
        </span>

        <h2>
          THE FORM
          <br />
          COMES
          <br />
          TOGETHER.
        </h2>

      </div>


      {/* ================================================
          PRODUCT STAGE
      ================================================ */}

      <div className="assembly-stage">

        {/* Ambient light */}

        <div className="assembly-glow" />


        {/* Fine orbit */}

        <div className="assembly-orbit orbit-a" />

        <div className="assembly-orbit orbit-b" />


        {/* Product canvas */}

        <canvas
          ref={canvasRef}
          className="assembly-canvas"
        />


        {/* Loading */}

        {loading && (

          <div className="assembly-loader">

            <span>
              PREPARING THE OBJECT
            </span>

            <div className="loader-line">

              <div
                style={{
                  width:
                    `${loadProgress}%`,
                }}
              />

            </div>

            <small>
              {loadProgress}%
            </small>

          </div>

        )}


        {/* Scroll hint */}

        {!loading && (

          <div className="assembly-scroll-hint">

            <span>
              SCROLL TO ASSEMBLE
            </span>

            <i>
              ↓
            </i>

          </div>

        )}

      </div>


      {/* ================================================
          BOTTOM CONTENT
      ================================================ */}

      <div className="assembly-bottom">

        <div className="assembly-caption">

          <span>
            OBJECT 01
          </span>

          <p>
            A considered vessel
            for a considered formula.
          </p>

        </div>


        <div className="assembly-description">

          <p>
            Every element finds its place.
            The ritual begins when form
            and formula come together.
          </p>

        </div>


        <div className="assembly-index">

          <span>
            01
          </span>

          <span>
            / 01
          </span>

        </div>

      </div>

    </section>

  );

}