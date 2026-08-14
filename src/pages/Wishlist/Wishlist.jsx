import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowLeft, Check, Star } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import "./Wishlist.css";

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState([]);

  const handleMoveToBag = (product) => {
    addToCart(product, 1);
    setAddedIds((prev) => [...prev, product.id]);

    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 1500);
  };

  return (
    <main className="wishlist-page">
      <div className="wishlist-container">
        
        {/* Top Bar Navigation */}
        <div className="wishlist-header">
          <button 
            type="button" 
            className="pdp-back-btn" 
            onClick={() => navigate("/shop")}
          >
            <ArrowLeft size={14} />
            <span>Return to Shop</span>
          </button>
          <h1 className="wishlist-title">Saved Items ({wishlistCount})</h1>
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty Wishlist State */
          <div className="wishlist-empty">
            <h2>Your wishlist is empty</h2>
            <p>Save items you love to review and purchase them later.</p>
            <button className="wishlist-explore-btn" onClick={() => navigate("/shop")}>
              Explore Collection
            </button>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="wishlist-grid">
            {wishlistItems.map((product) => {
              const isAdded = addedIds.includes(product.id);

              return (
                <article className="wishlist-card" key={product.id}>
                  
                  <div className="wishlist-image-wrap">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      onClick={() => navigate(`/product/${product.id}`)}
                    />
                    
                    {/* Delete Item Button */}
                    <button 
                      className="wishlist-remove-btn"
                      onClick={() => removeFromWishlist(product.id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="wishlist-info">
                    <div className="wishlist-meta">
                      <span>{product.category}</span>
                      {product.rating && (
                        <div className="wishlist-rating">
                          <Star size={11} fill="currentColor" />
                          <span>{product.rating}</span>
                        </div>
                      )}
                    </div>

                    <h3 onClick={() => navigate(`/product/${product.id}`)}>
                      {product.name}
                    </h3>

                    <div className="wishlist-bottom">
                      <strong className="wishlist-price">
                        ${product.price}
                      </strong>

                      <button 
                        className={`wishlist-add-btn ${isAdded ? "wishlist-add-btn--added" : ""}`}
                        onClick={() => handleMoveToBag(product)}
                      >
                        {isAdded ? (
                          <>
                            <span>Added</span>
                            <Check size={13} />
                          </>
                        ) : (
                          <>
                            <span>Add to Bag</span>
                            <ShoppingBag size={13} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </article>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
