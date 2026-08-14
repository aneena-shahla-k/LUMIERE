import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

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
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { totalItemsCount } = useCart();
  const { wishlistCount } = useWishlist();

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
    document.body.style.overflow = menuOpen ? "hidden" : "";

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

    if (location.pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /*
   * =========================================
   * SEARCH HANDLERS
   * =========================================
   */

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleQuickSearch = (term) => {
    navigate(`/shop?search=${encodeURIComponent(term)}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      {/* =================================================
          NAVBAR
      ================================================= */}

      <header
        className={`site-navbar ${
          scrolled ? "site-navbar--scrolled" : ""
        }`}
      >
        <div className="navbar-glass">
          <div className="navbar-inner">

            {/* LOGO */}
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

            {/* DESKTOP NAVIGATION */}
            <nav
              className="navbar-navigation"
              aria-label="Main navigation"
            >
              {navItems.map((item) => {
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`navbar-link ${
                      active ? "navbar-link--active" : ""
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                    <span className="navbar-link-dot" />
                  </Link>
                );
              })}
            </nav>

            {/* ACTIONS */}
            <div className="navbar-actions">

              {/* SEARCH */}
              <button
                type="button"
                className="navbar-icon-button"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={17} strokeWidth={1.4} />
              </button>

              {/* WISHLIST */}
              <Link
                to="/wishlist"
                className="navbar-bag navbar-wishlist-icon"
                aria-label="Wishlist"
              >
                <Heart size={17} strokeWidth={1.4} />
                <span className="navbar-bag-count">
                  {wishlistCount}
                </span>
              </Link>

              {/* SHOPPING BAG */}
              <Link
                to="/cart"
                className="navbar-bag"
                aria-label="Shopping bag"
              >
                <ShoppingBag size={17} strokeWidth={1.4} />
                <span className="navbar-bag-count">
                  {totalItemsCount}
                </span>
              </Link>

              {/* MOBILE MENU TOGGLE */}
              <button
                type="button"
                className="navbar-menu-button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? (
                  <X size={18} strokeWidth={1.4} />
                ) : (
                  <Menu size={18} strokeWidth={1.4} />
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mobile-menu-background" />

            <motion.div
              className="mobile-menu-content"
              initial={{ y: 30 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="mobile-menu-top">
                <span>MENU</span>
                <span>LUMIÈRE</span>
              </div>

              <nav className="mobile-navigation">
                {navItems.map((item, index) => {
                  const active = isActive(item.path);

                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.45,
                      }}
                    >
                      <Link
                        to={item.path}
                        onClick={closeMenu}
                        className={`mobile-navigation-link ${
                          active ? "mobile-navigation-link--active" : ""
                        }`}
                        aria-current={active ? "page" : undefined}
                      >
                        <span className="mobile-nav-number">
                          0{index + 1}
                        </span>
                        <span className="mobile-nav-label">
                          {item.label}
                        </span>
                        <span className="mobile-nav-indicator">
                          {active ? (
                            <span>CURRENT</span>
                          ) : (
                            <ArrowUpRight size={18} strokeWidth={1.3} />
                          )}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Wishlist Link in Mobile Menu */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.45 }}
                >
                  <Link
                    to="/wishlist"
                    onClick={closeMenu}
                    className={`mobile-navigation-link ${
                      isActive("/wishlist")
                        ? "mobile-navigation-link--active"
                        : ""
                    }`}
                  >
                    <span className="mobile-nav-number">05</span>
                    <span className="mobile-nav-label">
                      Wishlist ({wishlistCount})
                    </span>
                    <span className="mobile-nav-indicator">
                      {isActive("/wishlist") ? (
                        <span>CURRENT</span>
                      ) : (
                        <ArrowUpRight size={18} strokeWidth={1.3} />
                      )}
                    </span>
                  </Link>
                </motion.div>
              </nav>

              <div className="mobile-menu-bottom">
                <Link to="/wishlist" onClick={closeMenu}>
                  Wishlist ({wishlistCount})
                </Link>
                <Link to="/contact" onClick={closeMenu}>
                  Contact
                </Link>
                <Link to="/account" onClick={closeMenu}>
                  Account
                </Link>
                <span>© 2026 LUMIÈRE</span>
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="search-panel"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="search-panel-top">
                <span>SEARCH</span>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                >
                  <X size={20} strokeWidth={1.3} />
                </button>
              </div>

              {/* SEARCH FORM */}
              <form
                onSubmit={handleSearchSubmit}
                className="search-input-wrapper"
              >
                <Search size={22} strokeWidth={1.2} />
                <input
                  autoFocus
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search the collection..."
                />
                <button
                  type="submit"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "inherit",
                  }}
                  aria-label="Submit search"
                >
                  ↵
                </button>
              </form>

              {/* SEARCH SUGGESTIONS */}
              <div className="search-suggestions">
                <span>POPULAR</span>
                <div>
                  <button
                    type="button"
                    onClick={() => handleQuickSearch("Serum")}
                  >
                    Serum
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSearch("Moisturizer")}
                  >
                    Moisturizer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSearch("Cleanser")}
                  >
                    Cleanser
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSearch("Barrier")}
                  >
                    Barrier
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
