import React, { useEffect, useRef, useState } from "react";
import "../styles/product360Section.css";

const TOTAL_FRAMES = 36;
const getFramePath = (index) => {
  const frame = String(index + 1).padStart(3, "0");
  return `/product360/product-${frame}.png`;
};

const hotspots = [
  {
    id: 1,
    title: "PRECISION DROPPER",
    text: "Designed for controlled, effortless application.",
    x: "30%",
    y: "30%",
  },
  {
    id: 2,
    title: "PURE GLASS",
    text: "A sculpted vessel created to preserve the ritual.",
    x: "70%",
    y: "39%",
  },
  {
    id: 3,
    title: "ACTIVE FORMULA",
    text: "Concentrated skincare designed for daily refinement.",
    x: "65%",
    y: "72%",
  },
];

export default function Product360Section() {
  const [frame, setFrame] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startFrame = useRef(0);
  /*
   * Preload all product frames
   */
  useEffect(() => {
    const images = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const image = new Image();
      image.src = getFramePath(i);

      images.push(image);
    }

    return () => {
      images.length = 0;
    };
  }, []);

  /*
   * Slow automatic rotation
   */
  useEffect(() => {
    if (isDragging) return;

    const interval = setInterval(() => {
      setFrame((current) => {
        return (current + 1) % TOTAL_FRAMES;
      });
    }, 110);

    return () => clearInterval(interval);
  }, [isDragging]);

  /*
   * Drag start
   */
  const handlePointerDown = (event) => {
    setIsDragging(true);

    startX.current = event.clientX;
    startFrame.current = frame;

    event.currentTarget.setPointerCapture?.(
      event.pointerId
    );
  };

  /*
   * Drag movement
   */
  const handlePointerMove = (event) => {
    if (!isDragging) return;

    const delta = event.clientX - startX.current;

    const sensitivity = 7;

    const movement =
      Math.floor(delta / sensitivity);

    let nextFrame =
      startFrame.current + movement;

    nextFrame =
      ((nextFrame % TOTAL_FRAMES) +
        TOTAL_FRAMES) %
      TOTAL_FRAMES;

    setFrame(nextFrame);
  };

  /*
   * Drag end
   */
  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <section className="product360-section">

      {/* -----------------------------------------------
          TOP META
      ------------------------------------------------ */}

      <div className="product360-top">

        <span>07</span>

        <span>THE OBJECT</span>

        <span>FORM / FUNCTION</span>

      </div>


      {/* -----------------------------------------------
          HEADER
      ------------------------------------------------ */}

      <div className="product360-heading">

        <span>
          THE RITUAL, REFINED.
        </span>

        <h2>
          BEAUTY
          <br />
          IN EVERY
          <br />
          DETAIL.
        </h2>

      </div>


      {/* -----------------------------------------------
          PRODUCT STAGE
      ------------------------------------------------ */}

      <div
        className={`product360-stage ${
          isDragging ? "dragging" : ""
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => {
          if (isDragging) {
            setIsDragging(false);
          }
        }}
      >

        {/* Ambient glow */}

        <div className="product360-glow" />

        {/* Orbit */}

        <div className="product360-orbit orbit-one" />
        <div className="product360-orbit orbit-two" />
        <div className="product360-orbit orbit-three" />


        {/* Product */}

        <div className="product360-product">

          <img
            src={getFramePath(frame)}
            alt="360 degree product"
            draggable="false"
          />

        </div>


        {/* Hotspots */}

        {hotspots.map((hotspot) => (

          <div
            key={hotspot.id}
            className="product-hotspot"
            style={{
              left: hotspot.x,
              top: hotspot.y,
            }}
          >

            <button
              type="button"
              className="hotspot-button"
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();

                setActiveHotspot(
                  activeHotspot === hotspot.id
                    ? null
                    : hotspot.id
                );
              }}
            >
              <span />
            </button>


            {activeHotspot === hotspot.id && (

              <div className="hotspot-card">

                <small>
                  0{hotspot.id}
                </small>

                <strong>
                  {hotspot.title}
                </strong>

                <p>
                  {hotspot.text}
                </p>

              </div>

            )}

          </div>

        ))}


        {/* Drag instruction */}

        <div className="product360-instruction">

          <div className="drag-icon">
            ← →
          </div>

          <span>
            DRAG TO EXPLORE
          </span>

          <small>
            360°
          </small>

        </div>


        {/* Frame counter */}

        <div className="product360-counter">

          {String(frame + 1).padStart(2, "0")}

          <span>/</span>

          {String(TOTAL_FRAMES).padStart(2, "0")}

        </div>

      </div>


      {/* -----------------------------------------------
          BOTTOM CONTENT
      ------------------------------------------------ */}

      <div className="product360-bottom">

        <div className="product360-caption">

          <span>
            OBJECT 01
          </span>

          <p>
            A considered vessel for a
            considered formula.
          </p>

        </div>


        <div className="product360-copy">

          <p>
            Every curve, surface and detail
            has been designed to make the
            daily ritual feel extraordinary.
          </p>

        </div>


        <div className="product360-link">

          EXPLORE THE FORM

          <span>↗</span>

        </div>

      </div>

    </section>
  );
}