import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Heart,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowUpRight,
} from "lucide-react";
import { getProductById, getSimilarProducts } from "../../data/product";
import "./ProductDetails.css";

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();

  // 1. Fetch product data
  const product = useMemo(() => {
    if (!productId) return null;
    return getProductById(productId);
  }, [productId]);

  // 2. Fetch similar products safely
  const similarProducts = useMemo(() => {
    return product ? getSimilarProducts(product.id) : [];
  }, [product]);

  // 3. Build the 4-angle gallery list.
  //    If the product has an `images` array, use it.
  //    Otherwise fall back to repeating the single `image` so the
  //    gallery UI still works without breaking anything.
  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    return [
      { src: product.image, label: "Front" },
      { src: product.image, label: "Angle" },
      { src: product.image, label: "Side" },
      { src: product.image, label: "Back" },
    ];
  }, [product]);

  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("ingredients");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // 4. Scroll to top + reset gallery whenever the URL param / product changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(0);
  }, [productId]);

  // Price computation
  const currentPrice = useMemo(() => {
    if (!product) return 0;
    if (product.sizes && product.sizes[selectedSize]) {
      return product.sizes[selectedSize].price;
    }
    return product.price;
  }, [product, selectedSize]);

  // Handle missing product fallback
  if (!product) {
    return (
      <main className="pdp-page">
        <div className="pdp-not-found">
          <span>ERROR</span>
          <h1>Product not found</h1>
          <p>ID: {productId} is not showing the product</p>
          <button onClick={() => navigate("/shop")}>
            Return to shop
          </button>
        </div>
      </main>
    );
  }

  const handleAddToCart = () => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <main className="pdp-page">
      {/* =====================================================
          BREADCRUMB
      ===================================================== */}
      <nav className="pdp-breadcrumb">
        <button
          className="pdp-breadcrumb-button"
          onClick={() => navigate("/shop")}
        >
          Shop
        </button>
        <span className="pdp-crumb-sep">/</span>
        <button
          className="pdp-breadcrumb-button"
          onClick={() => navigate("/shop")}
        >
          {product.category}
        </button>
        <span className="pdp-crumb-sep">/</span>
        <span className="pdp-crumb-current">{product.name}</span>
      </nav>

      {/* =====================================================
          MAIN LAYOUT (GALLERY & INFO)
      ===================================================== */}
      <div className="pdp-layout">
        {/* Image Section */}
        <div className="pdp-gallery">
          <div className="pdp-main-image">
            {product.bestseller && (
              <span className="product-badge">BESTSELLER</span>
            )}

            <button
              className={`wishlist ${isWishlisted ? "wishlist--active" : ""}`}
              onClick={() => setIsWishlisted(!isWishlisted)}
              aria-label="Add to wishlist"
            >
              <Heart
                size={17}
                fill={isWishlisted ? "currentColor" : "none"}
              />
            </button>

            <div className="pdp-product-image-wrap">
              <img
                src={galleryImages[activeImage]?.src}
                alt={`${product.name} - ${galleryImages[activeImage]?.label}`}
                className="pdp-product-image"
              />
            </div>
          </div>

          {/* =====================================================
              4 ANGLE VIEW THUMBNAILS
          ===================================================== */}
          {galleryImages.length > 0 && (
            <div className="pdp-thumb-row">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`pdp-thumb ${
                    activeImage === idx ? "pdp-thumb--active" : ""
                  }`}
                  onClick={() => setActiveImage(idx)}
                  aria-label={`View ${img.label} of ${product.name}`}
                  aria-pressed={activeImage === idx}
                >
                  <img src={img.src} alt={img.label} />
                  <span>{img.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="pdp-info">
          <div className="pdp-badge-row">
            {product.badges?.map((badge, idx) => (
              <span key={idx} className="pdp-tag">
                {badge}
              </span>
            ))}
          </div>

          <h1 className="pdp-title">{product.name}</h1>
          <p className="pdp-tagline">{product.tagline}</p>

          <div className="pdp-rating-row">
            <Star size={14} fill="currentColor" color="#81766a" />
            <span className="pdp-rating-num">{product.rating}</span>
            <span className="pdp-review-link">
              ({product.reviews} reviews)
            </span>
          </div>

          <div className="pdp-price-row">
            <strong>${currentPrice}</strong>
          </div>

          <p className="pdp-desc">{product.description}</p>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="pdp-selector">
              <h3>
                Size: <em>{product.sizes[selectedSize]?.label}</em>
              </h3>
              <div className="pdp-size-pills">
                {product.sizes.map((size, index) => (
                  <button
                    key={index}
                    className={`category-pill ${
                      selectedSize === index ? "category-pill--active" : ""
                    } pdp-size-pill`}
                    onClick={() => setSelectedSize(index)}
                  >
                    <span>{size.label}</span>
                    <small>{size.sub}</small>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Actions */}
          <div className="pdp-purchase-row">
            <div className="pdp-qty">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            <button className="pdp-add-btn" onClick={handleAddToCart}>
              {isAdded ? (
                <>
                  <span>ADDED TO BAG</span>
                  <Check size={16} />
                </>
              ) : (
                <>
                  <span>ADD TO BAG — ${currentPrice * quantity}</span>
                  <Plus size={16} />
                </>
              )}
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="pdp-trust-row">
            <div>
              <Truck size={16} />
              <span>Free Shipping</span>
            </div>
            <div>
              <ShieldCheck size={16} />
              <span>Dermatologically Tested</span>
            </div>
            <div>
              <RotateCcw size={16} />
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          TABS SECTION (INGREDIENTS & USAGE)
      ===================================================== */}
      <section className="pdp-tabs-section">
        <div className="pdp-tabs-nav">
          <button
            className={`pdp-tab ${
              activeTab === "ingredients" ? "pdp-tab--active" : ""
            }`}
            onClick={() => setActiveTab("ingredients")}
          >
            Key Ingredients
          </button>
          <button
            className={`pdp-tab ${
              activeTab === "usage" ? "pdp-tab--active" : ""
            }`}
            onClick={() => setActiveTab("usage")}
          >
            How to Use
          </button>
        </div>

        <div className="pdp-tab-panel">
          {activeTab === "ingredients" && (
            <div className="pdp-panel-grid">
              <div className="pdp-key-ingredients">
                {product.keyIngredients?.map((item, idx) => (
                  <div key={idx}>
                    <strong>{item.name}</strong>
                    <span>{item.note}</span>
                  </div>
                ))}
              </div>
              <h4 className="pdp-full-list-heading">Full Ingredients</h4>
              <p className="pdp-full-list">{product.fullIngredients}</p>
            </div>
          )}

          {activeTab === "usage" && (
            <ul className="pdp-steps">
              {product.howToUse?.map((step, idx) => (
                <li key={idx}>
                  <span className="pdp-step-num">0{idx + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* =====================================================
          SIMILAR PRODUCTS SECTION
      ===================================================== */}
      {/* {similarProducts.length > 0 && (
        <section className="pdp-similar">
          <div className="pdp-similar-head">
            <span className="shop-eyebrow">RECOMMENDED</span>
            <h2>You may also like</h2>
          </div>

          <div className="pdp-similar-grid">
            {similarProducts.map((simProduct) => (
              <article key={simProduct.id} className="product-card">
                <div className="pdp-similar-visual">
                  {simProduct.bestseller && (
                    <span className="product-badge">BESTSELLER</span>
                  )}
                  <img
                    src={simProduct.image}
                    alt={simProduct.name}
                    className="pdp-similar-image"
                    onClick={() => navigate(`/product/${simProduct.id}`)}
                  />
                </div>

                <div className="product-info">
                  <div className="product-meta">
                    <span>{simProduct.category}</span>
                    <div className="product-rating">
                      <Star size={12} fill="currentColor" />
                      {simProduct.rating}
                    </div>
                  </div>

                  <h2
                    onClick={() => navigate(`/product/${simProduct.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {simProduct.name}
                  </h2>

                  <div className="product-bottom">
                    <strong>${simProduct.price}</strong>
                    <button
                      className="view-product"
                      aria-label={`View ${simProduct.name}`}
                      onClick={() => navigate(`/product/${simProduct.id}`)}
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )} */}
    </main>
  );
}
