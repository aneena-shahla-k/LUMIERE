import React from "react";
import "../styles/ritualSection.css";
import image from "../images/cleanse.jpg";
import images from "../images/serum.jpg";
import images1 from "../images/moisturizer.jpg";

const ritualSteps = [
  {
    number: "01",
    label: "PREPARE",
    title: "Cleanse",
    description:
      "Begin with a clean canvas. Gently cleanse the skin and prepare it for what follows.",
    image: image,
  },
  {
    number: "02",
    label: "TREAT",
    title: "Activate",
    description:
      "Apply a few drops of concentrated serum and let the active formula become part of your ritual.",
    image: images,
  },
  {
    number: "03",
    label: "SEAL",
    title: "Restore",
    description:
      "Finish by sealing in hydration for skin that feels soft, balanced and luminous.",
    image: images1,
  },
];

export default function RitualSection() {
  return (
    <section className="ritual-section">

      {/* TOP LABEL */}
      <div className="ritual-topbar">
        <span>04</span>
        <span>THE RITUAL</span>
        <span>EVERY DAY, INTENTIONALLY</span>
      </div>


      {/* INTRO */}
      <div className="ritual-intro">

        <div className="ritual-intro-left">
          <span className="ritual-eyebrow">
            THE DAILY RITUAL
          </span>

          <h2>
            THE RITUAL
            <br />
            OF RADIANCE.
          </h2>
        </div>


        <div className="ritual-intro-right">

          <p>
            A considered routine,
            designed to bring out
            your skin's natural radiance.
          </p>

          <div className="ritual-intro-line" />

          <span>
            THREE SIMPLE STEPS.
            <br />
            ONE BEAUTIFUL RITUAL.
          </span>

        </div>

      </div>


      {/* STEPS */}
      <div className="ritual-grid">

        {ritualSteps.map((step) => (
          <article
            className="ritual-card"
            key={step.number}
          >

            {/* CARD HEADER */}
            <div className="ritual-card-header">

              <span className="ritual-number">
                {step.number}
              </span>

              <span className="ritual-label">
                {step.label}
              </span>

            </div>


            {/* IMAGE */}
            <div className="ritual-image-wrap">

              <img
                src={step.image}
                alt={step.title}
                className="ritual-image"
              />

            </div>


            {/* CONTENT */}
            <div className="ritual-card-content">

              <h3>
                {step.title}
              </h3>

              <p>
                {step.description}
              </p>

              <span className="ritual-detail">
                STEP {step.number}
              </span>

            </div>

          </article>
        ))}

      </div>


      {/* BOTTOM STATEMENT */}
      {/* <div className="ritual-bottom">

        <span className="ritual-bottom-label">
          A MOMENT FOR YOUR SKIN
        </span>

        <p>
          Beautiful skin is not rushed.
          <br />
          It is cared for, every day.
        </p>

        <span className="ritual-bottom-mark">
          SKIN × RITUAL
        </span>

      </div> */}

    </section>
  );
}