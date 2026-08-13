import React from "react";
import "../styles/BrandManifesto.css";
import image from "../images/skin-manifesto.jpg";

export default function BrandManifesto() {
  return (
    <section className="brand-manifesto">

      {/* LEFT EDITORIAL TEXT */}

      <div className="brand-manifesto__content">

        <div className="brand-manifesto__eyebrow">
          OUR PHILOSOPHY
        </div>

        <h2>
          PURE
          <br />
          INGREDIENTS.
          <br />
          POWERFUL
          <br />
          RESULTS.
        </h2>

        <div className="brand-manifesto__line">
          <div />
        </div>

        <p>
          We believe skincare should feel
          as beautiful as it is effective.
          Every formula is created with
          carefully selected ingredients,
          advanced science and an
          uncompromising attention to detail.
        </p>

        <button className="brand-manifesto__link">
          <span>DISCOVER OUR STORY</span>
          <span>→</span>
        </button>

      </div>


      {/* IMAGE */}

      <div className="brand-manifesto__image-wrapper">

        <img
          src={image}
          alt="Luxury skincare"
          className="brand-manifesto__image"
        />

        <div className="brand-manifesto__image-overlay" />

      </div>


      {/* SMALL EDITORIAL LABEL */}

      <div className="brand-manifesto__side-label">
        <span>01</span>
        <span>PHILOSOPHY</span>
      </div>


      {/* BOTTOM STATEMENT */}

      <div className="brand-manifesto__bottom">

        <span>
          SCIENCE × NATURE
        </span>

        <span>
          MADE FOR YOUR SKIN
        </span>

      </div>

    </section>
  );
}