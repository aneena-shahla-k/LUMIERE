import React from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "../../context/CartContext";
import "./Cart.css";

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, totalItemsCount } = useCart();

  // Calculations based on actual cart items
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 10;
  const total = subtotal + shipping;

  return (
    <main className="cart-page">
      <div className="cart-container">
        
        {/* Top Header */}
        <div className="cart-header">
          <button 
            type="button" 
            className="pdp-back-btn" 
            onClick={() => navigate("/shop")}
          >
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </button>
          <h1 className="cart-title">Your Bag ({totalItemsCount})</h1>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="cart-empty">
            <h2>Your shopping bag is empty</h2>
            <p>Looks like you haven't added any luxury essentials to your bag yet.</p>
            <button className="cart-checkout-btn" onClick={() => navigate("/shop")}>
              Explore Collection
            </button>
          </div>
        ) : (
          /* Cart Content Layout */
          <div className="cart-layout">
            
            {/* Items List */}
            <div className="cart-items-list">
              {cartItems.map((item, idx) => (
                <div key={`${item.id}-${item.size}-${idx}`} className="cart-item">
                  
                  <div className="cart-item-img-wrap">
                    <img src={item.image} alt={item.name} />
                  </div>

                  <div className="cart-item-info">
                    <div className="cart-item-top">
                      <div>
                        <h3>{item.name}</h3>
                        {item.size && <p className="cart-item-size">Size: {item.size}</p>}
                      </div>
                      <span className="cart-item-price">${item.price * item.quantity}</span>
                    </div>

                    <div className="cart-item-bottom">
                      {/* Quantity Controller */}
                      <div className="pdp-qty cart-qty-ctrl">
                        <button 
                          onClick={() => updateQuantity(item.id, item.size, -1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.size, 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button 
                        className="cart-remove-btn" 
                        onClick={() => removeFromCart(item.id, item.size)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                        <span>Remove</span>
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>

            {/* Order Summary */}
            <aside className="cart-summary">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>

              <div className="summary-row">
                <span>Estimated Shipping</span>
                <strong>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</strong>
              </div>

              {shipping > 0 && (
                <p className="free-shipping-note">
                  Add <strong>${(100 - subtotal).toFixed(2)}</strong> more to unlock Free Worldwide Shipping.
                </p>
              )}

              <div className="summary-divider" />

              <div className="summary-row summary-total">
                <span>Total</span>
                <strong>${total.toFixed(2)}</strong>
              </div>

              <button className="cart-checkout-btn">
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <div className="cart-trust-badges">
                <div>
                  <Truck size={15} />
                  <span>Complimentary samples with all orders</span>
                </div>
                <div>
                  <ShieldCheck size={15} />
                  <span>Secure 256-bit SSL encrypted checkout</span>
                </div>
              </div>

            </aside>

          </div>
        )}

      </div>
    </main>
  );
}
