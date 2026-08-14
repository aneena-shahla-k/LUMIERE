import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Load saved cart from localStorage or start empty
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem("lumiere_cart");
      return localData ? JSON.parse(localData) : [];
    } catch {
      return [];
    }
  });

  // Keep localStorage in sync whenever cart changes
  useEffect(() => {
    localStorage.setItem("lumiere_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add product to cart (matches size & id)
  const addToCart = (product, quantity = 1, selectedSizeIndex = 0) => {
    const sizeObj = product.sizes ? product.sizes[selectedSizeIndex] : null;
    const price = sizeObj ? sizeObj.price : product.price;
    const sizeLabel = sizeObj ? sizeObj.label : product.size || "Standard";
    const image = product.image || (product.images && product.images[0]?.src);

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.id === product.id && item.size === sizeLabel
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          subtitle: product.tagline || product.category || "",
          size: sizeLabel,
          price: price,
          quantity: quantity,
          image: image,
        },
      ];
    });
  };

  // Update item quantity
  const updateQuantity = (id, size, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id && item.size === size) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Remove item
  const removeFromCart = (id, size) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === id && item.size === size))
    );
  };

  // Clear all
  const clearCart = () => setCartItems([]);

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
