import React from "react";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import "../styles/footer.css";

const footerLinks = {
  Explore: [
    ["Shop", "/shop"],
    ["Our Story", "/about"],
    ["Ingredients", "/ingredients"],
    ["The Ritual", "/ritual"],
    ["Journal", "/journal"],
  ],

  Assistance: [
    ["Contact", "/contact"],
    ["FAQ", "/faq"],
    ["Shipping & Returns", "/shipping"],
    ["Track Order", "/track-order"],
  ],

  Legal: [
    ["Privacy", "/privacy"],
    ["Terms", "/terms"],
    ["Accessibility", "/accessibility"],
  ],
};

export default function Footer() {
  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="liquid-footer">

      {/* Ambient background */}

      <div className="footer-glass">

        {/* =========================================
            TOP BRAND AREA
        ========================================= */}

        <div className="footer-top">

          

          {/* Newsletter */}
{/* 
          <div className="footer-newsletter-card">

            <div className="footer-card-label">
              THE LUMIÈRE LETTER
            </div>

            <h3>
              Stay close
              <br />
              to the ritual.
            </h3>

            <form
              onSubmit={(e) =>
                e.preventDefault()
              }
              className="footer-email-form"
            >

              <input
                type="email"
                placeholder="Email address"
                aria-label="Email address"
              />

              <button
                type="submit"
                aria-label="Subscribe"
              >
                <ArrowUpRight
                  size={17}
                  strokeWidth={1.3}
                />
              </button>

            </form>

            <span className="footer-form-note">
              New rituals, launches and
              skincare stories.
            </span>

          </div> */}

        </div>


        {/* =========================================
            LARGE WORDMARK
        ========================================= */}

        <div className="footer-wordmark-wrap">

          <div className="footer-wordmark-top">

            {/* <span>
              PARIS
            </span>

            <span>
              48°51′N
            </span>

            <button
              onClick={scrollTop}
              className="footer-back-top"
            >
              BACK TO TOP

              <span className="footer-back-icon">
                <ArrowUp
                  size={13}
                  strokeWidth={1.2}
                />
              </span>
            </button> */}

          </div>

          {/* <div className="footer-wordmark">
            LUMIÈRE
          </div> */}

        </div>


        {/* =========================================
            LINKS GLASS ROW
        ========================================= */}

        <div className="footer-navigation-glass">

          {Object.entries(footerLinks).map(
            ([title, links]) => (

              <div
                className="footer-link-group"
                key={title}
              >

                <span className="footer-link-title">
                  {title}
                </span>

                <div className="footer-link-list">

                  {links.map(
                    ([label, path]) => (

                      <a
                        href={path}
                        key={label}
                      >
                        <span>
                          {label}
                        </span>

                        <ArrowUpRight
                          size={12}
                          strokeWidth={1.2}
                        />
                      </a>

                    )
                  )}

                </div>

              </div>

            )
          )}


          {/* Social */}

          <div className="footer-link-group">

            <span className="footer-link-title">
              Connect
            </span>

            <div className="footer-social-list">

              <a href="#instagram">
                <span className="social-circle">
                  IG
                </span>

                Instagram
              </a>

              <a href="#facebook">
                <span className="social-circle">
                  FB
                </span>

                Facebook
              </a>

              <a href="#pinterest">
                <span className="social-circle">
                  PI
                </span>

                Pinterest
              </a>

            </div>

          </div>

        </div>


        {/* =========================================
            BOTTOM
        ========================================= */}

        <div className="footer-bottom">

          <span>
            © 2026 LUMIÈRE
          </span>

          <span>
            MADE WITH INTENTION
          </span>

          <span>
            PARIS · EVERYWHERE
          </span>

        </div>

      </div>

    </footer>
  );
}