import React, { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Heart,
  Plus,
  Star,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Shop.css";

import {
  PRODUCTS,
  CATEGORIES,
  SKIN_TYPES,
  CONCERNS,
  PRICE_OPTIONS,
} from "../../data/product";

export default function Shop() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [skinType, setSkinType] = useState("All Skin Types");
  const [concerns, setConcerns] = useState([]);
  const [price, setPrice] = useState("all");
  const [rating, setRating] = useState("all");
  const [sort, setSort] = useState("featured");

  const [mobileFilters, setMobileFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [added, setAdded] = useState([]);

  const toggleConcern = (value) => {
    setConcerns((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value]
    );
  };

  const toggleWishlist = (id) => {
    setWishlist((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const handleAdd = (id) => {
    setAdded((previous) =>
      previous.includes(id) ? previous : [...previous, id]
    );

    setTimeout(() => {
      setAdded((previous) =>
        previous.filter((item) => item !== id)
      );
    }, 1500);
  };

  const openProduct = (id) => {
    navigate(`/product/${id}`);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSkinType("All Skin Types");
    setConcerns([]);
    setPrice("all");
    setRating("all");
    setSort("featured");
  };

  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    if (category !== "All") {
      result = result.filter(
        (product) => product.category === category
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((product) => {
        return (
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        );
      });
    }

    if (skinType !== "All Skin Types") {
      result = result.filter(
        (product) =>
          product.skinTypes.includes(skinType) ||
          product.skinTypes.includes("All Skin Types")
      );
    }

    if (concerns.length) {
      result = result.filter((product) =>
        concerns.some((concern) =>
          product.concerns.includes(concern)
        )
      );
    }

    if (price === "under50") {
      result = result.filter(
        (product) => product.price < 50
      );
    }

    if (price === "50to75") {
      result = result.filter(
        (product) =>
          product.price >= 50 && product.price <= 75
      );
    }

    if (price === "over75") {
      result = result.filter(
        (product) => product.price > 75
      );
    }

    if (rating === "4.5") {
      result = result.filter(
        (product) => product.rating >= 4.5
      );
    }

    if (rating === "4.8") {
      result = result.filter(
        (product) => product.rating >= 4.8
      );
    }

    switch (sort) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;

      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;

      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;

      case "reviews":
        result.sort((a, b) => b.reviews - a.reviews);
        break;

      case "featured":
      default:
        result.sort(
          (a, b) =>
            Number(b.featured) - Number(a.featured)
        );
        break;
    }

    return result;
  }, [
    search,
    category,
    skinType,
    concerns,
    price,
    rating,
    sort,
  ]);

  const activeFilters =
    (category !== "All" ? 1 : 0) +
    (skinType !== "All Skin Types" ? 1 : 0) +
    concerns.length +
    (price !== "all" ? 1 : 0) +
    (rating !== "all" ? 1 : 0) +
    (search ? 1 : 0);

  return (
    <main className="shop-page">

      {/* =====================================================
          CATEGORY / SEARCH
      ===================================================== */}

      <section className="shop-navigation">

        <div className="category-scroll">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              className={
                category === item
                  ? "category-pill category-pill--active"
                  : "category-pill"
              }
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="shop-actions">

          <div className="glass-search">
            <Search size={17} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search collection"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            className="glass-filter-button"
            onClick={() => setMobileFilters(true)}
          >
            <SlidersHorizontal size={16} />

            <span>Filters</span>

            {activeFilters > 0 && (
              <b>{activeFilters}</b>
            )}
          </button>

        </div>
      </section>


      {/* =====================================================
          MAIN SHOP
      ===================================================== */}

      <section className="shop-catalog">

        {/* Desktop Filters */}

        <aside className="shop-filters">

          <div className="filter-heading">

            <span>REFINE</span>

            {activeFilters > 0 && (
              <button onClick={clearFilters}>
                Clear all
              </button>
            )}

          </div>


          {/* Skin Type */}

          <FilterGroup title="Skin Type">

            {SKIN_TYPES.map((item) => (
              <label
                className="filter-option"
                key={item}
              >
                <input
                  type="radio"
                  name="skinType"
                  checked={skinType === item}
                  onChange={() =>
                    setSkinType(item)
                  }
                />

                <span className="custom-radio">
                  {skinType === item && (
                    <Check size={10} />
                  )}
                </span>

                {item}
              </label>
            ))}

          </FilterGroup>


          {/* Skin Concern */}

          <FilterGroup title="Skin Concern">

            {CONCERNS.map((item) => (
              <label
                className="filter-option"
                key={item}
              >
                <input
                  type="checkbox"
                  checked={concerns.includes(item)}
                  onChange={() =>
                    toggleConcern(item)
                  }
                />

                <span className="custom-checkbox">
                  {concerns.includes(item) && (
                    <Check size={10} />
                  )}
                </span>

                {item}
              </label>
            ))}

          </FilterGroup>


          {/* Price */}

          <FilterGroup title="Price">

            {PRICE_OPTIONS.map((item) => (
              <label
                className="filter-option"
                key={item.value}
              >
                <input
                  type="radio"
                  name="price"
                  checked={price === item.value}
                  onChange={() =>
                    setPrice(item.value)
                  }
                />

                <span className="custom-radio">
                  {price === item.value && (
                    <Check size={10} />
                  )}
                </span>

                {item.label}
              </label>
            ))}

          </FilterGroup>


          {/* Rating */}

          <FilterGroup title="Minimum Rating">

            {[
              {
                label: "All ratings",
                value: "all",
              },
              {
                label: "4.5 ★ & above",
                value: "4.5",
              },
              {
                label: "4.8 ★ & above",
                value: "4.8",
              },
            ].map((item) => (
              <label
                className="filter-option"
                key={item.value}
              >
                <input
                  type="radio"
                  name="rating"
                  checked={rating === item.value}
                  onChange={() =>
                    setRating(item.value)
                  }
                />

                <span className="custom-radio">
                  {rating === item.value && (
                    <Check size={10} />
                  )}
                </span>

                {item.label}
              </label>
            ))}

          </FilterGroup>

        </aside>


        {/* =================================================
            PRODUCT CATALOG
        ================================================= */}

        <div className="catalog-content">

          <div className="catalog-toolbar">

            <span>
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "piece"
                : "pieces"}
            </span>

            <div className="sort-control">

              <span>Sort by</span>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value)
                }
              >
                <option value="featured">
                  Featured
                </option>

                <option value="reviews">
                  Best Selling
                </option>

                <option value="rating">
                  Highest Rated
                </option>

                <option value="price-low">
                  Price — Low to High
                </option>

                <option value="price-high">
                  Price — High to Low
                </option>
              </select>

              <ChevronDown size={14} />

            </div>

          </div>


          {/* Empty */}

          {filteredProducts.length === 0 ? (

            <div className="empty-state">

              <span>NO MATCHES</span>

              <h2>
                Nothing quite
                <br />
                <em>matches.</em>
              </h2>

              <p>
                Try adjusting your filters or
                exploring another part of the collection.
              </p>

              <button onClick={clearFilters}>
                Reset collection
              </button>

            </div>

          ) : (

            <div className="product-grid">

              {filteredProducts.map(
                (product, index) => (

                  <article
                    className="product-card"
                    key={product.id}
                  >

                    <div className="product-visual">

                      <span className="product-index">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>


                      {product.bestseller && (
                        <span className="product-badge">
                          BESTSELLER
                        </span>
                      )}


                      <button
                        className={
                          wishlist.includes(product.id)
                            ? "wishlist wishlist--active"
                            : "wishlist"
                        }
                        onClick={() =>
                          toggleWishlist(product.id)
                        }
                        aria-label="Add to wishlist"
                      >
                        <Heart
                          size={17}
                          fill={
                            wishlist.includes(
                              product.id
                            )
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>


                      {/* Product Image */}

                      <img
                        src={product.image}
                        alt={product.name}
                        onClick={() =>
                          openProduct(product.id)
                        }
                        style={{
                          cursor: "pointer",
                        }}
                      />


                      {/* Add */}

                      <button
                        className="product-add"
                        onClick={() =>
                          handleAdd(product.id)
                        }
                      >
                        <span>
                          {added.includes(product.id)
                            ? "ADDED"
                            : "ADD TO BAG"}
                        </span>

                        {added.includes(
                          product.id
                        ) ? (
                          <Check size={15} />
                        ) : (
                          <Plus size={16} />
                        )}
                      </button>

                    </div>


                    <div className="product-info">

                      <div className="product-meta">

                        <span>
                          {product.category}
                        </span>

                        <div className="product-rating">

                          <Star
                            size={12}
                            fill="currentColor"
                          />

                          {product.rating}

                        </div>

                      </div>


                      <h2>
                        {product.name}
                      </h2>


                      {/* <p>
                        {product.description}
                      </p> */}


                      <div className="product-bottom">

                        <strong>
                          ${product.price}
                        </strong>

                        <button
                          className="view-product"
                          aria-label={`View ${product.name}`}
                          onClick={() =>
                            openProduct(product.id)
                          }
                        >
                          <ArrowUpRight size={17} />
                        </button>

                      </div>

                    </div>

                  </article>
                )
              )}

            </div>
          )}

        </div>
      </section>


      {/* =====================================================
          MOBILE FILTER
      ===================================================== */}

      <div
        className={
          mobileFilters
            ? "mobile-filter-overlay mobile-filter-overlay--open"
            : "mobile-filter-overlay"
        }
        onClick={() =>
          setMobileFilters(false)
        }
      />


      <aside
        className={
          mobileFilters
            ? "mobile-filter-sheet mobile-filter-sheet--open"
            : "mobile-filter-sheet"
        }
      >

        <div className="mobile-filter-header">

          <div>
            <span>REFINE</span>
            <h2>Collection</h2>
          </div>

          <button
            onClick={() =>
              setMobileFilters(false)
            }
          >
            <X size={20} />
          </button>

        </div>


        <div className="mobile-filter-body">

          <FilterGroup title="Skin Type">

            {SKIN_TYPES.map((item) => (
              <label
                className="filter-option"
                key={item}
              >
                <input
                  type="radio"
                  name="mobileSkinType"
                  checked={skinType === item}
                  onChange={() =>
                    setSkinType(item)
                  }
                />

                <span className="custom-radio">
                  {skinType === item && (
                    <Check size={10} />
                  )}
                </span>

                {item}
              </label>
            ))}

          </FilterGroup>


          <FilterGroup title="Skin Concern">

            {CONCERNS.map((item) => (
              <label
                className="filter-option"
                key={item}
              >
                <input
                  type="checkbox"
                  checked={concerns.includes(item)}
                  onChange={() =>
                    toggleConcern(item)
                  }
                />

                <span className="custom-checkbox">
                  {concerns.includes(item) && (
                    <Check size={10} />
                  )}
                </span>

                {item}
              </label>
            ))}

          </FilterGroup>


          <FilterGroup title="Price">

            {PRICE_OPTIONS.map((item) => (
              <label
                className="filter-option"
                key={item.value}
              >
                <input
                  type="radio"
                  name="mobilePrice"
                  checked={price === item.value}
                  onChange={() =>
                    setPrice(item.value)
                  }
                />

                <span className="custom-radio">
                  {price === item.value && (
                    <Check size={10} />
                  )}
                </span>

                {item.label}
              </label>
            ))}

          </FilterGroup>

        </div>


        <div className="mobile-filter-footer">

          <button
            className="mobile-clear"
            onClick={clearFilters}
          >
            Clear
          </button>

          <button
            className="mobile-apply"
            onClick={() =>
              setMobileFilters(false)
            }
          >
            View {filteredProducts.length} Products
            <ArrowUpRight size={17} />
          </button>

        </div>

      </aside>

    </main>
  );
}


/* =========================================================
   FILTER GROUP
========================================================= */

function FilterGroup({ title, children }) {
  return (
    <div className="filter-group">

      <h3>{title}</h3>

      <div className="filter-options">
        {children}
      </div>

    </div>
  );
}