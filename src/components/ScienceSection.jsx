import React from "react";
import "../styles/scienceSection.css";
import img from "../images/ingredients.jpg";

const ingredients = [
  {
    number: "01",
    name: "HYALURONIC ACID",
    description: "Deep hydration",
  },
  {
    number: "02",
    name: "NIACINAMIDE",
    description: "Barrier support",
  },
  {
    number: "03",
    name: "PEPTIDES",
    description: "Firming care",
  },
];

export default function ScienceSection() {
  return (
    <section className="formulation-section">

      {/* TOP BAR */}
      <div className="formulation-top">
        <span>03</span>
        <span>FORMULATION</span>
        <span>MADE FOR YOUR SKIN</span>
      </div>

      {/* MAIN CONTENT */}
      <div className="formulation-main">

        {/* LEFT */}
        <div className="formulation-copy">

          <div className="formulation-eyebrow">
            THE FORMULA
          </div>

          <h2>
            WHAT GOES
            <br />
            INTO YOUR
            <br />
            SKINCARE.
          </h2>

          <div className="formulation-rule" />

          <p>
            Carefully selected ingredients,
            thoughtfully formulated to support
            healthy-looking skin.
          </p>

          <p className="formulation-small">
            Nothing unnecessary.
            Everything intentional.
          </p>

        </div>


        {/* RIGHT IMAGE */}
        <div className="formulation-visual">

          <div className="formulation-image">
            <img
              src={img}
              alt="Skincare ingredients"
            />
          </div>

          <div className="formulation-image-caption">
            <span>FORMULA 01</span>
            <span>ACTIVE ESSENTIALS</span>
          </div>

        </div>

      </div>


      {/* INGREDIENT LIST */}
      <div className="ingredient-list">

        {ingredients.map((ingredient) => (
          <div
            className="ingredient-item"
            key={ingredient.number}
          >

            <span className="ingredient-number">
              {ingredient.number}
            </span>

            <div className="ingredient-name">
              <strong>{ingredient.name}</strong>
              <span>{ingredient.description}</span>
            </div>

            <span className="ingredient-arrow">
              ↗
            </span>

          </div>
        ))}

      </div>


      {/* FOOTER */}
      <div className="formulation-footer">
        <span>SCIENCE × NATURE</span>
        <span>FORMULATED WITH INTENTION</span>
      </div>

    </section>
  );
}