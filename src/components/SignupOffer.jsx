import React, { useEffect } from "react";
import "./SignupOffer.css";

export default function SignupOffer({ onClose }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="signup-offer"
      onMouseDown={handleOverlayClick}
    >
      <div className="signup-offer__card">

        {/* CLOSE */}

        <button
          type="button"
          className="signup-offer__close"
          onClick={onClose}
          aria-label="Close"
        >
          <span />
          <span />
        </button>


        {/* DECORATIVE NUMBER */}

        <div className="signup-offer__number">
          01
        </div>


        {/* CONTENT */}

        <div className="signup-offer__content">

          <div className="signup-offer__eyebrow">
            A LITTLE SOMETHING FOR YOU
          </div>

          <h2>
            YOUR SKIN,
            <br />
            <em>YOUR RITUAL.</em>
          </h2>

          <div className="signup-offer__line" />

          <p className="signup-offer__description">
            Join the LUMIÈRE ritual and receive
            <strong> 10% OFF </strong>
            your first order.
          </p>


          {/* FORM */}

          <form
            className="signup-offer__form"
            onSubmit={(event) => {
              event.preventDefault();
              onClose();
            }}
          >

            <div className="signup-offer__input-wrapper">

              <input
                type="email"
                placeholder="YOUR EMAIL ADDRESS"
                aria-label="Email address"
                required
              />

            </div>

            <button
              type="submit"
              className="signup-offer__submit"
            >
              <span>CLAIM MY 10% OFF</span>
              <span>→</span>
            </button>

          </form>


          <p className="signup-offer__fine-print">
            By subscribing, you agree to receive
            occasional updates from LUMIÈRE.
          </p>

        </div>


        {/* BOTTOM BRAND */}

        <div className="signup-offer__brand">
          LUMIÈRE
        </div>

      </div>
    </div>
  );
}