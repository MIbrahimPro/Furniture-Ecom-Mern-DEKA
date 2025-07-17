// src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Load saved cart on mount
    useEffect(() => {
        const saved = localStorage.getItem("cart");
        if (saved) {
            try { setCartItems(JSON.parse(saved)); }
            catch { setCartItems([]); }
        }
    }, []);

    // Persist cart
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    // Add item or increment
    const addToCart = (item) => {
        setCartItems(prev => {
            const exists = prev.find(ci => ci.id === item.id);
            if (exists) {
                return prev.map(ci =>
                    ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    // Update quantity (delta can be negative)
    const updateQty = (id, delta) => {
        setCartItems(prev =>
            prev
                .map(ci =>
                    ci.id === id
                        ? { ...ci, quantity: Math.max(1, ci.quantity + delta) }
                        : ci
                )
                .filter(ci => ci.quantity > 0)
        );
    };

    const removeFromCart = (id) =>
        setCartItems(prev => prev.filter(ci => ci.id !== id));

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem("cart");
    };

    const totalPrice = cartItems.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                updateQty,
                removeFromCart,
                clearCart,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
