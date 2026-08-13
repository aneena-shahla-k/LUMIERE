import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import "../styles/navbar.css";

const navItems = [
  {
    label: "Home",
    path: "/",
  },
  {
    label: "Shop",
    path: "/shop",
  },
  {
    label: "Story",
    path: "/about",
  },
  {
    label: "Ritual",
    path: "/ritual",
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const location = useLocation();

  /*
   * =========================================
   * ACTIVE PAGE
   * =========================================
   */

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };


  /*
   * =========================================
   * SCROLL STATE
   * =========================================
   */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  /*
   * =========================================
   * LOCK BODY WHEN MOBILE MENU IS OPEN
   * =========================================
   */

  useEffect(() => {
    document.body.style.overflow = menuOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);


  /*
   * =========================================
   * CLOSE MOBILE MENU
   * =========================================
   */

  const closeMenu = () => {
    setMenuOpen(false);
  };


  /*
   * =========================================
   * LOGO CLICK
   * =========================================
   */

  const handleLogoClick = () => {
    closeMenu();

    /*
     * If already on homepage,
     * smoothly scroll to top.
     */

    if (location.pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };


  return (
    <>
      {/* =================================================
          NAVBAR
      ================================================= */}

      <header
        className={`site-navbar ${
          scrolled
            ? "site-navbar--scrolled"
            : ""
        }`}
      >

        <div className="navbar-glass">

          <div className="navbar-inner">

            {/* =================================================
                LOGO
            ================================================= */}

            <Link
              to="/"
              className="navbar-logo"
              onClick={handleLogoClick}
            >

              <span className="navbar-logo-main">
                LUMIÈRE
              </span>

              <span className="navbar-logo-sub">
                PARIS · SKIN
              </span>

            </Link>


            {/* =================================================
                DESKTOP NAVIGATION
            ================================================= */}

            <nav
              className="navbar-navigation"
              aria-label="Main navigation"
            >

              {navItems.map((item) => {

                const active =
                  isActive(item.path);

                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`navbar-link ${
                      active
                        ? "navbar-link--active"
                        : ""
                    }`}
                    aria-current={
                      active
                        ? "page"
                        : undefined
                    }
                  >

                    <span>
                      {item.label}
                    </span>

                    {/* Active indicator */}

                    <span
                      className="navbar-link-dot"
                    />

                  </Link>
                );
              })}

            </nav>


            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="navbar-actions">

              {/* SEARCH */}

              <button
                type="button"
                className="navbar-icon-button"
                aria-label="Search"
                onClick={() =>
                  setSearchOpen(true)
                }
              >

                <Search
                  size={17}
                  strokeWidth={1.4}
                />

              </button>


              {/* SHOPPING BAG */}

              <Link
                to="/cart"
                className="navbar-bag"
                aria-label="Shopping bag"
              >

                <ShoppingBag
                  size={17}
                  strokeWidth={1.4}
                />

                <span className="navbar-bag-count">
                  0
                </span>

              </Link>


              {/* MOBILE MENU */}

              <button
                type="button"
                className="navbar-menu-button"
                aria-label={
                  menuOpen
                    ? "Close menu"
                    : "Open menu"
                }
                aria-expanded={menuOpen}
                onClick={() =>
                  setMenuOpen(
                    !menuOpen
                  )
                }
              >

                {menuOpen ? (
                  <X
                    size={18}
                    strokeWidth={1.4}
                  />
                ) : (
                  <Menu
                    size={18}
                    strokeWidth={1.4}
                  />
                )}

              </button>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      <AnimatePresence>

        {menuOpen && (

          <motion.div
            className="mobile-menu"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
          >

            <div className="mobile-menu-background" />


            <motion.div
              className="mobile-menu-content"
              initial={{
                y: 30,
              }}
              animate={{
                y: 0,
              }}
              exit={{
                y: 20,
              }}
              transition={{
                duration: 0.45,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
            >

              {/* MOBILE MENU TOP */}

              <div className="mobile-menu-top">

                <span>
                  MENU
                </span>

                <span>
                  LUMIÈRE
                </span>

              </div>


              {/* MOBILE NAVIGATION */}

              <nav className="mobile-navigation">

                {navItems.map(
                  (item, index) => {

                    const active =
                      isActive(item.path);

                    return (
                      <motion.div
                        key={item.label}
                        initial={{
                          opacity: 0,
                          y: 20,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay:
                            index *
                            0.05,
                          duration: 0.45,
                        }}
                      >

                        <Link
                          to={item.path}
                          onClick={
                            closeMenu
                          }
                          className={`mobile-navigation-link ${
                            active
                              ? "mobile-navigation-link--active"
                              : ""
                          }`}
                          aria-current={
                            active
                              ? "page"
                              : undefined
                          }
                        >

                          <span className="mobile-nav-number">
                            0{index + 1}
                          </span>

                          <span className="mobile-nav-label">
                            {item.label}
                          </span>

                          <span className="mobile-nav-indicator">
                            {active ? (
                              <span>
                                CURRENT
                              </span>
                            ) : (
                              <ArrowUpRight
                                size={18}
                                strokeWidth={1.3}
                              />
                            )}
                          </span>

                        </Link>

                      </motion.div>
                    );
                  }
                )}

              </nav>


              {/* MOBILE BOTTOM */}

              <div className="mobile-menu-bottom">

                <Link to="/contact">
                  Contact
                </Link>

                <Link to="/account">
                  Account
                </Link>

                <span>
                  © 2026 LUMIÈRE
                </span>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>


      {/* =====================================================
          SEARCH OVERLAY
      ===================================================== */}

      <AnimatePresence>

        {searchOpen && (

          <motion.div
            className="search-overlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
          >

            <motion.div
              className="search-panel"
              initial={{
                y: -30,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -20,
                opacity: 0,
              }}
              transition={{
                duration: 0.4,
              }}
            >

              {/* SEARCH TOP */}

              <div className="search-panel-top">

                <span>
                  SEARCH
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setSearchOpen(false)
                  }
                  aria-label="Close search"
                >

                  <X
                    size={20}
                    strokeWidth={1.3}
                  />

                </button>

              </div>


              {/* SEARCH INPUT */}

              <div className="search-input-wrapper">

                <Search
                  size={22}
                  strokeWidth={1.2}
                />

                <input
                  autoFocus
                  type="search"
                  placeholder="Search the collection..."
                />

                <span>
                  ↵
                </span>

              </div>


              {/* SEARCH SUGGESTIONS */}

              <div className="search-suggestions">

                <span>
                  POPULAR
                </span>

                <div>

                  <button type="button">
                    Serum
                  </button>

                  <button type="button">
                    Moisturizer
                  </button>

                  <button type="button">
                    Cleanser
                  </button>

                  <button type="button">
                    SPF
                  </button>

                </div>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </>
  );
}