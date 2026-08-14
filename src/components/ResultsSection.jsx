import React, { useRef, useState } from "react";
import "../styles/resultsSection.css";
import after from "../images/after.jpg";
import before from "../images/before.jpg";

export default function ResultsSection() {
  const [position, setPosition] = useState(52);
  const [isDragging, setIsDragging] = useState(false);

  const sliderRef = useRef(null);

  const updatePosition = (clientX) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();

    let value =
      ((clientX - rect.left) / rect.width) * 100;

    value = Math.max(8, Math.min(92, value));

    setPosition(value);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;

    updatePosition(event.clientX);
  };

  return (
    <section className="results-section">
      <div className="results-intro">
        <div className="results-title">
          <span className="results-eyebrow">
            SKIN, OVER TIME
          </span>
          <h2>
            RESULTS
            <br />
            YOU CAN
            <br />
            SEE.
          </h2>

        </div>


        <div className="results-description">

          <p>
            Thoughtful formulas meet consistent
            care. The result is skin that looks
            healthier, calmer and more luminous.
          </p>

          <div className="results-line" />

          <span>
            REAL SKIN.
            <br />
            REAL ROUTINES.
          </span>

        </div>

      </div>


      {/* ==================================================
          BEFORE / AFTER
      ================================================== */}

      <div
        className={`results-comparison ${
          isDragging ? "is-dragging" : ""
        }`}
        ref={sliderRef}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setIsDragging(false)}
        onPointerLeave={() => setIsDragging(false)}
      >

        {/* AFTER */}
        <div className="results-image results-after">
          <img src={after} alt="Skin after skincare routine"/>
          <span className="results-image-label">AFTER</span>
        </div>

        {/* BEFORE */}
        <div className="results-before" style={{width: `${position}%`}} >
          <div className="results-image">
            <img src={before} alt="Skin before skincare routine"/>
            <span className="results-image-label">BEFORE</span>
          </div>
        </div>

        



        {/* HANDLE */}

        <button
          type="button"
          className="results-handle"
          style={{
            left: `${position}%`,
          }}
          aria-label="Drag to compare before and after"
          onPointerDown={(event) => {
            event.preventDefault();

            setIsDragging(true);

            event.currentTarget.setPointerCapture?.(
              event.pointerId
            );
          }}
        >

          <span className="handle-line" />

          <span className="handle-circle">
            <span>←</span>
            <span>→</span>
          </span>

          <span className="handle-line" />

        </button>

      </div>


      {/* ==================================================
          RESULT DETAILS
      ================================================== */}

      <div className="results-details">
        <div className="results-detail">
          <span className="result-number">
            01
          </span>
          <div>
            <strong>
              HYDRATION
            </strong>

            <p>
              Skin appears visibly plumper
              and more supple.
            </p>
          </div>

        </div>


        <div className="results-detail">

          <span className="result-number">
            02
          </span>

          <div>
            <strong>
              LUMINOSITY
            </strong>

            <p>
              A more even-looking,
              naturally radiant complexion.
            </p>
          </div>

        </div>


        <div className="results-detail">

          <span className="result-number">
            03
          </span>

          <div>
            <strong>
              BALANCE
            </strong>

            <p>
              Skin feels calmer,
              softer and better cared for.
            </p>
          </div>

        </div>

      </div>


    </section>
  );
}