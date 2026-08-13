import React, { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import "./LumiereEdit.css";
import img1 from "../images/natural1.jpg";
import img2 from "../images/natural2.jpg";
import img3 from "../images/natural3.jpg";
import img4 from "../images/natural4.jpg";
import img5 from "../images/natural5.jpg";
import img6 from "../images/natural6.jpg";


const edits = [
  {
    number: "01",
    title: "Morning Glow",
    subtitle: "Awaken your radiance",
    description:
      "A fresh ritual for luminous, energized skin.",
    ingredients: "Vitamin C · Antioxidants · SPF",
    image:img1,
  },
  {
    number: "02",
    title: "Deep Hydration",
    subtitle: "Quench & restore",
    description:
      "A comforting ritual designed to replenish moisture.",
    ingredients: "Hyaluronic Acid · Ceramides · Squalane",
    image: img2,
  },
  {
    number: "03",
    title: "Night Reset",
    subtitle: "Let your skin recover",
    description:
      "An evening ritual created for calm, renewed skin.",
    ingredients: "Peptides · Botanicals · Barrier Care",
    image: img3,
  },
  {
    number: "04",
    title: "Barrier Ritual",
    subtitle: "Comfort your skin",
    description:
      "A gentle ritual for restoring and protecting the skin barrier.",
    ingredients: "Ceramides · Squalane · Panthenol",
    image: img4,
  },
  {
    number: "05",
    title: "Clarifying Care",
    subtitle: "Reset the surface",
    description:
      "Lightweight formulas for a fresh, balanced complexion.",
    ingredients: "Niacinamide · Zinc · Botanical Extracts",
    image: img5,
  },
  {
    number: "06",
    title: "Weekend Radiance",
    subtitle: "Your glow ritual",
    description:
      "A slow beauty ritual for skin that looks beautifully rested.",
    ingredients: "Peptides · Oils · Antioxidants",
    image: img6,
  },
];

export default function LumiereEdit() {
  const sliderRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);

  const updateActiveIndex = () => {
    if (!sliderRef.current) return;

    const slider = sliderRef.current;
    const cards = slider.querySelectorAll(
      ".lumiere-edit-card"
    );

    if (!cards.length) return;

    const scrollLeft = slider.scrollLeft;
    const cardWidth = cards[0].offsetWidth + 22;

    const index = Math.round(
      scrollLeft / cardWidth
    );

    setActiveIndex(
      Math.min(
        Math.max(index, 0),
        edits.length - 1
      )
    );
  };

  const scrollCards = (direction) => {
    if (!sliderRef.current) return;

    const cards =
      sliderRef.current.querySelectorAll(
        ".lumiere-edit-card"
      );

    if (!cards.length) return;

    const cardWidth =
      cards[0].offsetWidth + 22;

    sliderRef.current.scrollBy({
      left: direction * cardWidth,
      behavior: "smooth",
    });
  };

  const handleMouseDown = (e) => {
    if (!sliderRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX);
    setScrollStart(
      sliderRef.current.scrollLeft
    );
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !sliderRef.current)
      return;

    e.preventDefault();

    const distance =
      e.pageX - startX;

    sliderRef.current.scrollLeft =
      scrollStart - distance;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    updateActiveIndex();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      updateActiveIndex();
    }
  };

  const handleWheel = (e) => {
    if (!sliderRef.current) return;

    if (
      Math.abs(e.deltaY) >
      Math.abs(e.deltaX)
    ) {
      e.preventDefault();

      sliderRef.current.scrollLeft +=
        e.deltaY;
    }
  };

  return (
    <section className="lumiere-edit">

      <div className="lumiere-edit-inner">

        {/* =========================================
            LEFT INTRO
        ========================================= */}

        <div className="lumiere-edit-intro">

          <div className="lumiere-edit-eyebrow">
            THE LUMIÈRE EDIT
          </div>

          <h2>
            Find the ritual
            <br />
            your skin is
            <br />
            <em>asking for.</em>
          </h2>

          <p>
            Curated formulas, thoughtful textures
            and rituals designed around the way
            your skin feels today.
          </p>

          <button
            className="lumiere-edit-explore"
            onClick={() => {
              window.location.href =
                "/ritual";
            }}
          >
            <span>
              EXPLORE THE EDIT
            </span>

            <ArrowUpRight
              size={15}
              strokeWidth={1.2}
            />
          </button>

          {/* Progress */}

          <div className="lumiere-edit-progress">

            <div className="lumiere-edit-progress-count">
              <span>
                {String(activeIndex + 1).padStart(
                  2,
                  "0"
                )}
              </span>

              <span className="progress-divider">
                /
              </span>

              <span>
                {String(edits.length).padStart(
                  2,
                  "0"
                )}
              </span>
            </div>

            <div className="lumiere-edit-progress-line">
              <span
                style={{
                  width: `${
                    ((activeIndex + 1) /
                      edits.length) *
                    100
                  }%`,
                }}
              />
            </div>

          </div>

        </div>


        {/* =========================================
            RIGHT CAROUSEL
        ========================================= */}

        <div className="lumiere-edit-carousel">

          {/* Controls */}

          <div className="lumiere-edit-controls">

            <button
              type="button"
              onClick={() =>
                scrollCards(-1)
              }
              aria-label="Previous ritual"
            >
              <ArrowLeft
                size={16}
                strokeWidth={1.2}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                scrollCards(1)
              }
              aria-label="Next ritual"
            >
              <ArrowRight
                size={16}
                strokeWidth={1.2}
              />
            </button>

          </div>


          {/* Cards */}

          <div
            ref={sliderRef}
            className={`lumiere-edit-track ${
              isDragging
                ? "is-dragging"
                : ""
            }`}
            onScroll={updateActiveIndex}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
          >

            {edits.map((edit) => (

              <article
                className="lumiere-edit-card"
                key={edit.number}
              >

                {/* Image */}

                <div className="lumiere-edit-image-wrap">

                  <img
                    src={edit.image}
                    alt={edit.title}
                    draggable="false"
                  />

                  <div className="lumiere-edit-image-number">
                    {edit.number}
                  </div>

                  <button
                    className="lumiere-edit-card-arrow"
                    aria-label={`Explore ${edit.title}`}
                  >
                    <ArrowUpRight
                      size={17}
                      strokeWidth={1.2}
                    />
                  </button>

                </div>


                {/* Content */}

                <div className="lumiere-edit-card-content">

                  <div className="lumiere-edit-card-top">

                    <span>
                      RITUAL
                    </span>

                    <span>
                      {edit.number}
                    </span>

                  </div>

                  <h3>
                    {edit.title}
                  </h3>

                  <h4>
                    {edit.subtitle}
                  </h4>

                  <p>
                    {edit.description}
                  </p>

                  <div className="lumiere-edit-ingredients">
                    {edit.ingredients}
                  </div>

                  <button className="lumiere-edit-discover">
                    DISCOVER RITUAL

                    <ArrowRight
                      size={14}
                      strokeWidth={1.2}
                    />
                  </button>

                </div>

              </article>

            ))}

          </div>

        </div>

      </div>

    </section>
  );
}