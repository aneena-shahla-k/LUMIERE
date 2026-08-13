import React, { useMemo, useState } from "react";
import {
  Sun,
  Moon,
  Sparkles,
  Droplets,
  Shield,
  Layers3,
  Check,
  Plus,
  Minus,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import "./BuildYourRitual.css";
import img1 from "../../images/360.jpg";
import img2 from "../../images/hydra.jpg";
import img3 from "../../images/daily.jpg";
import img4 from "../../images/milky.jpg";
import img5 from "../../images/radiance.jpg";
import img6 from "../../images/serum.jpg";

const PRODUCTS = [
  {
    id: 1,
    name: "Silk Amino Cleanser",
    category: "Cleanse",
    price: 42,
    goals: ["radiance", "hydration", "barrier", "texture"],
    image:img1,
  },
  {
    id: 2,
    name: "Lumière Radiance Serum",
    category: "Treat",
    price: 68,
    goals: ["radiance", "texture"],
    image:img2,
  },
  {
    id: 3,
    name: "Élan Hydrating Essence",
    category: "Hydrate",
    price: 48,
    goals: ["hydration", "barrier", "radiance"],
    image:img3,
  },
  {
    id: 4,
    name: "Velour Barrier Cream",
    category: "Moisturize",
    price: 74,
    goals: ["hydration", "barrier"],
    image:img4,
  },
  {
    id: 5,
    name: "Aurelia Daily Shield SPF 50",
    category: "Protect",
    price: 52,
    goals: ["radiance", "barrier", "texture"],
    image:img5,
  },
  {
    id: 6,
    name: "Nocturne Renewal Treatment",
    category: "Renew",
    price: 86,
    goals: ["texture", "radiance"],
    image:img6,
  },
];

const GOALS = [
  {
    id: "radiance",
    title: "Radiance",
    description: "Brighter-looking, luminous skin",
    icon: Sparkles,
  },
  {
    id: "hydration",
    title: "Hydration",
    description: "Comfortable, replenished skin",
    icon: Droplets,
  },
  {
    id: "barrier",
    title: "Barrier",
    description: "A supported, balanced feel",
    icon: Shield,
  },
  {
    id: "texture",
    title: "Texture",
    description: "Smoother-looking skin",
    icon: Layers3,
  },
];

const ROUTINE_SIZES = [
  {
    id: "minimal",
    title: "Minimal",
    description: "Just the essentials",
    steps: 3,
  },
  {
    id: "balanced",
    title: "Balanced",
    description: "A complete everyday ritual",
    steps: 4,
  },
  {
    id: "complete",
    title: "Complete",
    description: "The full Lumière experience",
    steps: 5,
  },
];

export default function BuildYourRitual() {
  const [goal, setGoal] = useState("radiance");
  const [routineSize, setRoutineSize] = useState("balanced");
  const [time, setTime] = useState("both");
  const [budget, setBudget] = useState(150);
  const [selected, setSelected] = useState([]);

  const selectedGoal =
    GOALS.find((item) => item.id === goal) || GOALS[0];

  const selectedRoutine =
    ROUTINE_SIZES.find((item) => item.id === routineSize) ||
    ROUTINE_SIZES[1];

  /*
   * Build recommended routine.
   */
  const recommendedProducts = useMemo(() => {
    const matching = PRODUCTS.filter((product) =>
      product.goals.includes(goal)
    );

    const order = [
      "Cleanse",
      "Treat",
      "Hydrate",
      "Moisturize",
      "Protect",
      "Renew",
    ];

    const ordered = [...matching].sort(
      (a, b) =>
        order.indexOf(a.category) -
        order.indexOf(b.category)
    );

    /*
     * Always try to keep the routine useful.
     */
    return ordered.slice(0, selectedRoutine.steps);
  }, [goal, selectedRoutine.steps]);

  /*
   * If user manually selects products,
   * use those. Otherwise show recommendations.
   */
  const activeProducts = selected.length
    ? PRODUCTS.filter((product) => selected.includes(product.id))
    : recommendedProducts;

  const total = activeProducts.reduce(
    (sum, product) => sum + product.price,
    0
  );

  const toggleProduct = (id) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const changeGoal = (value) => {
    setGoal(value);
    setSelected([]);
  };

  const changeRoutineSize = (value) => {
    setRoutineSize(value);
    setSelected([]);
  };

  const resetRitual = () => {
    setGoal("radiance");
    setRoutineSize("balanced");
    setTime("both");
    setBudget(150);
    setSelected([]);
  };

  /*
   * Simple budget indicator.
   */
  const budgetStatus =
    total <= budget
      ? "Within your budget"
      : "Above your selected budget";

  return (
    <main className="ritual-page">

      <section className="ritual-builder">

        <div className="ritual-builder__header">
          <div>
            <span className="ritual-builder__eyebrow">
              PERSONALISE
            </span>

          </div>

          <button
            className="ritual-reset"
            onClick={resetRitual}
          >
            <RotateCcw size={13} />
            Reset
          </button>
        </div>

        <div className="ritual-layout">

          {/* =================================================
              LEFT CONTROLS
          ================================================= */}

          <div className="ritual-controls">

            {/* STEP 01 */}

            <div className="ritual-step">
              <div className="ritual-step__number">
                01
              </div>

              <div className="ritual-step__body">

                <span className="ritual-step__label">
                  WHAT MATTERS MOST?
                </span>

                <h3>
                  Choose your focus
                </h3>

                <div className="ritual-goals">

                  {GOALS.map((item) => {
                    const Icon = item.icon;
                    const active = goal === item.id;

                    return (
                      <button
                        key={item.id}
                        className={
                          active
                            ? "ritual-goal ritual-goal--active"
                            : "ritual-goal"
                        }
                        onClick={() =>
                          changeGoal(item.id)
                        }
                      >
                        <span className="ritual-goal__icon">
                          <Icon size={17} />
                        </span>

                        <span className="ritual-goal__text">
                          <strong>
                            {item.title}
                          </strong>

                          <small>
                            {item.description}
                          </small>
                        </span>

                        {active && (
                          <span className="ritual-check">
                            <Check size={12} />
                          </span>
                        )}
                      </button>
                    );
                  })}

                </div>
              </div>
            </div>

            {/* STEP 02 */}

            <div className="ritual-step">
              <div className="ritual-step__number">
                02
              </div>

              <div className="ritual-step__body">

                <span className="ritual-step__label">
                  HOW MUCH DO YOU WANT?
                </span>

                <h3>
                  Choose your ritual
                </h3>

                <div className="ritual-size-grid">

                  {ROUTINE_SIZES.map((item) => {
                    const active =
                      routineSize === item.id;

                    return (
                      <button
                        key={item.id}
                        className={
                          active
                            ? "ritual-size ritual-size--active"
                            : "ritual-size"
                        }
                        onClick={() =>
                          changeRoutineSize(item.id)
                        }
                      >
                        <strong>
                          {item.title}
                        </strong>

                        <small>
                          {item.description}
                        </small>

                        <span>
                          {item.steps} steps
                        </span>
                      </button>
                    );
                  })}

                </div>
              </div>
            </div>

            {/* STEP 03 */}

            <div className="ritual-step">
              <div className="ritual-step__number">
                03
              </div>

              <div className="ritual-step__body">

                <span className="ritual-step__label">
                  WHEN WILL YOU USE IT?
                </span>

                <h3>
                  Choose your rhythm
                </h3>

                <div className="ritual-time">

                  <button
                    className={
                      time === "morning"
                        ? "ritual-time__button ritual-time__button--active"
                        : "ritual-time__button"
                    }
                    onClick={() =>
                      setTime("morning")
                    }
                  >
                    <Sun size={16} />
                    Morning
                  </button>

                  <button
                    className={
                      time === "evening"
                        ? "ritual-time__button ritual-time__button--active"
                        : "ritual-time__button"
                    }
                    onClick={() =>
                      setTime("evening")
                    }
                  >
                    <Moon size={16} />
                    Evening
                  </button>

                  <button
                    className={
                      time === "both"
                        ? "ritual-time__button ritual-time__button--active"
                        : "ritual-time__button"
                    }
                    onClick={() =>
                      setTime("both")
                    }
                  >
                    <Sparkles size={16} />
                    Both
                  </button>

                </div>
              </div>
            </div>

            {/* STEP 04 */}

            <div className="ritual-step">
              <div className="ritual-step__number">
                04
              </div>

              <div className="ritual-step__body">

                <div className="ritual-budget-heading">

                  <div>
                    <span className="ritual-step__label">
                      YOUR PREFERENCE
                    </span>

                    <h3>
                      Set your budget
                    </h3>
                  </div>

                  <strong>
                    ${budget}
                  </strong>

                </div>

                <input
                  className="ritual-slider"
                  type="range"
                  min="50"
                  max="250"
                  step="10"
                  value={budget}
                  onChange={(event) =>
                    setBudget(
                      Number(event.target.value)
                    )
                  }
                />

                <div className="ritual-budget-range">
                  <span>$50</span>
                  <span>$250+</span>
                </div>

              </div>
            </div>

          </div>

          {/* =================================================
              RIGHT RESULT
          ================================================= */}

          <aside className="ritual-result">

            <div className="ritual-result__header">

              <div>
                <span>
                  YOUR PERSONAL RITUAL
                </span>

                <strong>
                  {activeProducts.length} PRODUCTS
                </strong>
              </div>

              <div className="ritual-result__match">
                <small>
                  FOCUS
                </small>

                <span>
                  {selectedGoal.title}
                </span>
              </div>

            </div>

            <div className="ritual-result__intro">

              <h3>
                A ritual made
                <br />
                <em>around you.</em>
              </h3>

              <p>
                A considered selection built around
                your focus and preferred ritual size.
              </p>

            </div>

            {/* PRODUCTS */}

            <div className="ritual-products">

              {activeProducts.map(
                (product, index) => {

                  const manuallySelected =
                    selected.includes(product.id);

                  return (
                    <div
                      className="ritual-product"
                      key={product.id}
                    >

                      <div className="ritual-product__number">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <div className="ritual-product__image">
                        <img
                          src={product.image}
                          alt={product.name}
                        />
                      </div>

                      <div className="ritual-product__details">

                        <span>
                          {product.category}
                        </span>

                        <h4>
                          {product.name}
                        </h4>

                        <strong>
                          ${product.price}
                        </strong>

                      </div>

                      <button
                        className={
                          manuallySelected
                            ? "ritual-product__button ritual-product__button--selected"
                            : "ritual-product__button"
                        }
                        onClick={() =>
                          toggleProduct(
                            product.id
                          )
                        }
                        aria-label={
                          manuallySelected
                            ? "Remove product"
                            : "Customize product"
                        }
                      >
                        {manuallySelected ? (
                          <Minus size={14} />
                        ) : (
                          <Plus size={14} />
                        )}
                      </button>

                    </div>
                  );
                }
              )}

            </div>

            {/* TOTAL */}

            <div className="ritual-result__summary">

              <div className="ritual-total">

                <span>
                  RITUAL TOTAL
                </span>

                <strong>
                  ${total}
                </strong>

              </div>

              <div
                className={
                  total <= budget
                    ? "ritual-budget-status ritual-budget-status--good"
                    : "ritual-budget-status"
                }
              >
                {total <= budget && (
                  <Check size={12} />
                )}

                {budgetStatus}
              </div>

            </div>

            {/* CTA */}

            <button className="ritual-add">

              <span>
                ADD RITUAL TO BAG
              </span>

              <ArrowRight size={17} />

            </button>

            <p className="ritual-note">
              Your selections can be changed
              anytime before adding to bag.
            </p>

          </aside>

        </div>
      </section>

      {/* =====================================================
          BOTTOM STATEMENT
      ===================================================== */}

      

    </main>
  );
}