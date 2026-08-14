import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./components/Shop/Shop";
import About from "./pages/About";
import Ritual from "./pages/Ritual";
import ProductDetails from "./components/Shop/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist/Wishlist"; // <-- Import Wishlist Page
import ScrollToTop from "./components/ScrollToTop";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext"; // <-- Import Wishlist Provider

import "./App.css";

export default function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="app">
            <Navbar />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:productId" element={<ProductDetails />} />
                <Route path="/about" element={<About />} />
                <Route path="/ritual" element={<Ritual />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} /> {/* <-- Wishlist Route */}
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
  );
}
