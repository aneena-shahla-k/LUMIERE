import React, { useMemo, useState } from "react";
import "../styles/collectionSection.css";
import img from "../images/serum2.jpg";
import img1 from "../images/cleanse.jpg";
import img2 from "../images/barriercream.jpg";
import img3 from "../images/hydra.jpg";
import img4 from "../images/daily.jpg";
import img5 from "../images/milky.jpg";

const products = [
  {
    id: 1,
    category: "SERUMS",
    name: "Radiance Serum",
    subtitle: "Illuminating treatment",
    price: "₹2,490",
    image: img,
    badge: "BESTSELLER",
  },
  {
    id: 2,
    category: "CLEANSERS",
    name: "Gentle Cleanse",
    subtitle: "Daily balancing cleanser",
    price: "₹1,890",
    image: img1,
    badge: "",
  },
  {
    id: 3,
    category: "MOISTURIZERS",
    name: "Barrier Cream",
    subtitle: "Deep restorative moisture",
    price: "₹2,290",
    image: img2,
    badge: "NEW",
  },
  {
    id: 4,
    category: "SERUMS",
    name: "Hydra Concentrate",
    subtitle: "Intensive hydration treatment",
    price: "₹2,690",
    image: img3,
    badge: "",
  },
  {
    id: 5,
    category: "MOISTURIZERS",
    name: "Daily Emulsion",
    subtitle: "Lightweight daily hydration",
    price: "₹2,090",
    image: img4,
    badge: "",
  },
  {
    id: 6,
    category: "CLEANSERS",
    name: "Milky Cleanser",
    subtitle: "Soft nourishing cleanse",
    price: "₹1,790",
    image: img5,
    badge: "",
  },
];

const categories = [
  "ALL",
  "CLEANSERS",
  "SERUMS",
  "MOISTURIZERS",
];

export default function CollectionSection() {
  const [activeCategory, setActiveCategory] = useState("ALL");

  const filteredProducts = useMemo(() => {
    if (activeCategory === "ALL") {
      return products;
    }

    return products.filter(
      (product) => product.category === activeCategory
    );
  }, [activeCategory]);

  return (
    <section className="collection-section">

      {/* ==================================================
          TOP BAR
      ================================================== */}

      <div className="collection-topbar">

        <span>05</span>

        <span>THE COLLECTION</span>

        <span>CONSIDERED CARE</span>

      </div>


      {/* ==================================================
          FLOATING DECORATION
      ================================================== */}

      <div className="collection-orb collection-orb-one" />
      <div className="collection-orb collection-orb-two" />

      <div className="collection-floating-label">
        ESSENTIAL
      </div>


      {/* ==================================================
          INTRO
      ================================================== */}

      <div className="collection-intro">

        <div className="collection-intro-main">

          <span className="collection-eyebrow">
            ESSENTIALS
          </span>

          <h2>
            THE
            <br />
            COLLECTION.
          </h2>

        </div>


        <div className="collection-intro-side">

          <p>
            A focused collection of
            formulas designed to become
            part of your everyday ritual.
          </p>

          <div className="collection-line" />

          <span>
            SIMPLE FORMULAS.
            <br />
            CONSIDERED CARE.
          </span>

        </div>

      </div>


      {/* ==================================================
          CATEGORY NAV
      ================================================== */}

      <div className="collection-nav">

        <div className="collection-categories">

          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                activeCategory === category
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveCategory(category)
              }
            >
              {category}
            </button>
          ))}

        </div>


        <span className="collection-count">
          {String(filteredProducts.length).padStart(2, "0")} PRODUCTS
        </span>

      </div>


      {/* ==================================================
          PRODUCTS
      ================================================== */}

      <div className="collection-grid">

        {filteredProducts.map((product, index) => (

          <article
            className={`product-card product-card-${index + 1}`}
            key={product.id}
          >

            {/* PRODUCT IMAGE */}

            <div className="product-image-wrap">

              {product.badge && (
                <span className="product-badge">
                  {product.badge}
                </span>
              )}

              <button
                className="product-favorite"
                type="button"
                aria-label={`Save ${product.name}`}
              >
                ♡
              </button>

              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />

              <div className="product-view">
                VIEW PRODUCT
                <span>↗</span>
              </div>

            </div>


            {/* PRODUCT INFO */}

            <div className="product-info">

              <div>

                <span className="product-category">
                  {product.category}
                </span>

                <h3>
                  {product.name}
                </h3>

                <p>
                  {product.subtitle}
                </p>

              </div>


              <div className="product-buy">

                <span className="product-price">
                  {product.price}
                </span>

                <button
                  type="button"
                  className="add-button"
                >
                  ADD TO BAG
                  <span>+</span>
                </button>

              </div>

            </div>

          </article>

        ))}

      </div>

    </section>
  );
}