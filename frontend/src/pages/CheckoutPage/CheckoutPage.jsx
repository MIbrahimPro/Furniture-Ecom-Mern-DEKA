// src/pages/CheckoutPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CheckoutPage.css";

const PAYMENT_METHODS = [
    { key: "card", label: "Card", icon: "credit_card", color: "#1F8EF1" },
    { key: "paypal", label: "PayPal", icon: "account_balance_wallet", color: "#003087" },
    { key: "cod", label: "COD", icon: "local_shipping", color: "#E67E22" },
];

export default function CheckoutPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const { cartItems, totalPrice, clearCart } = useCart();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddr, setSelectedAddr] = useState("");
    const [newAddress, setNewAddress] = useState({
        title: "", street: "", city: "", state: "", zip: "", country: ""
    });

    const [payment, setPayment] = useState("card");
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState("");

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !user) navigate("/login");
    }, [user, loading, navigate]);

    // Fetch profile to get addresses
    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get("/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(({ data }) => {
                setAddresses(data.addresses);
                if (data.addresses.length) setSelectedAddr(data.addresses[0]._id);
            })
            .catch(() => { }); // handle if needed
    }, []);

    const handlePlaceOrder = async () => {
        setError("");
        setPlacing(true);

        // build address payload
        const addrPayload = selectedAddr
            ? addresses.find(a => a._id === selectedAddr)
            : newAddress;

        const body = {
            items: cartItems.map(ci => ({
                productId: ci.id,
                quantity: ci.quantity
            })),
            address: addrPayload,
            paymentMethod: payment
        };

        try {
            const token = localStorage.getItem("token");
            await axios.post("/api/orders", body, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            clearCart();
            navigate("/profile"); // or success page
        } catch (err) {
            setError(err.response?.data?.message || "Order failed");
        } finally {
            setPlacing(false);
        }
    };

    if (loading || !user) return null;

    return (
        <div className="checkout-page max-w-4xl mx-auto p-6 space-y-10">
            <h1 className="text-3xl font-bold" style={{ fontFamily: "MyFont" }}>
                Checkout
            </h1>

            {/* Cart Summary */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Your Cart</h2>
                {cartItems.map(ci => (
                    <div key={ci.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src={ci.img} alt={ci.name} className="w-16 h-16 object-cover rounded" />
                            <div>
                                <p className="font-medium">{ci.name}</p>
                                <p className="text-sm text-gray-600">Qty: {ci.quantity}</p>
                            </div>
                        </div>
                        <p className="font-semibold">${(ci.price * ci.quantity).toFixed(2)}</p>
                    </div>
                ))}
                <div className="flex justify-between pt-4 border-t">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-bold">${totalPrice.toFixed(2)}</span>
                </div>
            </section>

            {/* Address Selection */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Shipping Address</h2>
                {addresses.length > 0 && (
                    <select
                        value={selectedAddr}
                        onChange={e => setSelectedAddr(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        {addresses.map(a => (
                            <option key={a._id} value={a._id}>
                                {a.title}: {a.street}, {a.city}
                            </option>
                        ))}
                        <option value="">Enter New Address</option>
                    </select>
                )}

                {!selectedAddr && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {["title", "street", "city", "state", "zip", "country"].map(field => (
                            <input
                                key={field}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                value={newAddress[field]}
                                onChange={e => setNewAddress(prev => ({
                                    ...prev, [field]: e.target.value
                                }))}
                                className="p-2 border rounded"
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Payment Method */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Payment Method</h2>
                <div className="flex gap-4 flex-wrap">
                    {PAYMENT_METHODS.map(m => (
                        <button
                            key={m.key}
                            onClick={() => setPayment(m.key)}
                            className={`payment-pill ${payment === m.key ? "selected" : ""}`}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{ color: m.color }}
                            >
                                {m.icon}
                            </span>
                            <span>{m.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            {error && <p className="text-red-500">{error}</p>}

            {/* Place Order */}
            <button
                onClick={handlePlaceOrder}
                disabled={placing || (!selectedAddr && Object.values(newAddress).some(v => !v))}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded hover:opacity-90 transition"
            >
                {placing ? "Placing Order…" : "Place Order"}
            </button>
        </div>
    );
}
