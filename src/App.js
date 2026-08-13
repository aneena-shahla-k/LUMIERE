import React from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./components/Shop/Shop";
import About from "./pages/About";
import Ritual from "./pages/Ritual";
// import Contact from "./pages/Contact";
// import Cart from "./pages/Cart/Cart";
import "./App.css";
import ProductDetails from "./components/Shop/ProductDetails";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/shop" element={<Shop />}/>
                <Route path="/product/:productId" element={<ProductDetails />}/>
            <Route path="/about" element={<About />}/>
            <Route path="/ritual" element={<Ritual />}/>
            {/* <Route path="/contact" element={<Contact />}/> */}
            {/* <Route path="/cart"  element={<Cart />}
            /> */}
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}