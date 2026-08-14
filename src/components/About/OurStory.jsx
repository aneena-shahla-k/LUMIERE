import React from "react";
import { motion } from "framer-motion";
import {ArrowUpRight,Sparkles} from "lucide-react";
import "./OurStory.css";
import skin from "../../images/skin1.jpg";
import land from "../../images/calm3.jpg";
import not from "../../images/natural.jpg";


function Paisley({ className }) {
  return (
    <svg
      viewBox="0 0 100 140"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M52 6C28 6 12 26 12 52c0 30 24 44 42 70 10-16 26-19 26-42 0-19-16-24-16-39
           0-14 13-18 13-18S64 6 52 6Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="46" cy="98" r="3.4" fill="currentColor" />
    </svg>
  );
}

function Eyebrow({ en, hi }) {
  return (
    <span className="story-eyebrow">
      <span className="story-eyebrow__en">{en}</span>
      {hi && <span className="story-eyebrow__hi">{hi}</span>}
    </span>
  );
}

export default function OurStory() {
  return (
    <main className="our-story">
      <section className="story-hero">
        <motion.div
          className="story-hero__content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Eyebrow en="OUR STORY" hi="हमारी कहानी" />

          <h1> Beauty,<br />handed down,<br />
            <em>re-imagined.</em>
          </h1>

          <p>
            LUMIÈRE began on a kitchen shelf — turmeric, sandalwood,
            rose water — remedies our grandmothers trusted long before
            they had a name for skincare. We simply carried them
            forward.
          </p>

          <div className="story-thread-rule" />
        </motion.div>

        <motion.div
          className="story-hero__image"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1.2,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="story-image-glow" />

          <img src={skin} alt="LUMIÈRE skincare" />

          <Paisley className="story-paisley story-paisley--hero" />

          <div className="story-hero__badge">
            <Sparkles size={14} strokeWidth={1.2} />

            <span>
              MADE WITH
              <br />
              INTENTION
            </span>
          </div>
        </motion.div>
      </section>

      {/* =====================================================
          INTRODUCTION
      ===================================================== */}

      <section className="story-introduction">
        <div className="story-intro-label">
          <span className="story-devnum">०१</span>
          <Eyebrow en="OUR ROOTS" hi="हमारी जड़ें" />
        </div>

        <div className="story-intro-content">
          <motion.h2
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            It started in
            <br />
            <em>my grandmother's kitchen.</em>
          </motion.h2>

          <motion.div
            className="story-intro-text"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <p>
              Long before "self-care" was a word, she kept a small steel
              tin of turmeric, a jar of besan and a bottle of rose water
              on the shelf — one for every occasion, every mood, every
              season.
            </p>

            <p>
              LUMIÈRE is our attempt to keep that tin open. Old rituals,
              still true, made for the way we actually live today.
            </p>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          LARGE VISUAL
      ===================================================== */}

      <section className="story-visual">
        <div className="story-visual__image">
          <img src={land} alt="Skincare ritual" />

          <div className="story-visual__card">
            <span className="story-devnum">०२</span>

            <h3>
              Slow,
              <br />
              on purpose.
            </h3>

            <p>
              No twelve steps. No rush. Just formulas worth sitting
              with for a few extra minutes each day.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          INGREDIENT STORY
      ===================================================== */}

      <section className="ingredient-story">
        <div className="ingredient-story__image">
          <img src={not} alt="Natural skincare ingredients" />
          <Paisley className="story-paisley story-paisley--ingredient" />
        </div>

        <div className="ingredient-story__content">
          <Eyebrow en="THE FORMULA" hi="हमारा नुस्खा" />

          <h2>
            Nature,
            <br />
            refined by
            <br />
            <em>tradition.</em>
          </h2>

          <p>
            We start with what grew in our own backyards — haldi,
            chandan, gulab, neem — then refine each into a formula
            precise enough for daily, real-world skin.
          </p>

          <div className="ingredient-line">
            <div>
              <strong>NATURE</strong>
              <em className="ingredient-hi">प्रकृति</em>
              <span>→</span>
            </div>

            <div>
              <strong>TRADITION</strong>
              <em className="ingredient-hi">परंपरा</em>
              <span>→</span>
            </div>

            <div>
              <strong>BALANCE</strong>
              <em className="ingredient-hi">संतुलन</em>
            </div>
          </div>
        </div>
      </section>

      

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="story-final">
        <div className="story-final__inner">
          <Eyebrow en="DISCOVER LUMIÈRE"  />

          <h2>
            Begin your
            <br />
            <em>ritual.</em>
          </h2>

          <a href="/shop" className="story-shop-button">
            <span>EXPLORE THE COLLECTION</span>

            <span className="story-shop-arrow">
              <ArrowUpRight size={17} strokeWidth={1.2} />
            </span>
          </a>
        </div>
      </section>
    </main>
  );
}
