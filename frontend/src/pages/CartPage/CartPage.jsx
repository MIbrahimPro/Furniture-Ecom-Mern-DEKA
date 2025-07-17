// src/pages/CartPage.jsx
import React from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";

const CartPage = () => {
    const { cartItems, updateQty, removeFromCart, totalPrice } = useCart();
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (user) {
            navigate("/checkout");
        } else {
            navigate("/login");
        }
    };

    if (loading) return null; // or a spinner

    return (
        <div className="cart-page px-4 py-8 max-w-6xl mx-auto">
            <h1 className="text-5xl font-bold text-center" style={{ fontFamily: "MyFont", marginTop: "64px", marginBottom: "48px" }}>
                Your Cart
            </h1>

            {cartItems.length === 0 ? (
                <p className="text-gray-600">Your cart is empty.</p>
            ) : (
                <div className="space-y-6">
                    {cartItems.map(item => (
                        <div key={item.id} className="cart-item backdrop-blur-lg glass p-4 rounded-lg flex flex-col md:flex-row items-center md:items-start gap-4">
                            <img
                                src={item.img}
                                alt={item.name}
                                className="w-32 h-32 object-cover rounded-md flex-shrink-0"
                            />

                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h2>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => updateQty(item.id, -1)}
                                        className="qty-btn"
                                    >−</button>
                                    <span className="text-lg">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQty(item.id, 1)}
                                        className="qty-btn"
                                    >+</button>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:underline text-sm ml-4"
                                    >
                                        <span className="material-symbols-outlined thin" style={{ color: "#bd1b1bff" }}>
                                            delete
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="text-right min-w-[120px]">
                                <p className="text-gray-600">Price</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    ${item.price.toFixed(2)}
                                </p>
                                <p className="text-gray-600 mt-2">Subtotal</p>
                                <p className="text-xl font-bold text-gray-900">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Total & Checkout */}
                    <div className="flex flex-col md:flex-row items-center justify-between mt-8">
                        <div className="text-2xl font-semibold" >
                            Total: <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="mt-4 md:mt-0 px-8 py-3 rounded-full bg-black text-white font-semibold flex items-center gap-2 transition-transform duration-150 hover:scale-105 focus:outline-none"
                        >
                            Proceed to Checkout
                            <span className="material-symbols-outlined text-xl ml-1">arrow_forward</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
