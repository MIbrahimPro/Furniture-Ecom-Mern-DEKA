// src/pages/AdminOrdersPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import "./AdminOrdersPage.css";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);

    // Guard admin
    useEffect(() => {
        if (!loading) {
            if (!user) return navigate("/login");
            if (user.role !== "admin") return navigate("/");
        }
    }, [user, loading, navigate]);

    // Fetch
    const load = () => {
        api.get("/api/admin/orders")
            .then(r => setOrders(r.data))
            .catch(() => { });
    };
    useEffect(load, []);

    // Delete
    const deleteOrder = id => {
        if (!window.confirm("Delete this order?")) return;
        api.delete(`/api/admin/orders/${id}`)
            .then(load)
            .catch(() => alert("Delete failed"));
    };

    // Change status
    const updateStatus = (id, status) => {
        api.patch(`/api/admin/orders/${id}/status`, { status })
            .then(() => load())
            .catch(err => alert(err.response?.data?.message || "Update failed"));
    };

    // Accordion state
    const [open, setOpen] = useState({});

    if (loading || !user || user.role !== "admin") return null;

    return (
        <div className="admin-orders px-4 py-8 max-w-4xl mx-auto space-y-4">
            <h1 className="text-5xl text-center font-bold" style={{ fontFamily: "MyFont", marginTop: "120px", marginBottom: "68px" }}>
                Manage Orders
            </h1>

            {orders.map(o => (
                <div key={o.id} className="order-card glass p-4 rounded-lg">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setOpen(prev => ({ ...prev, [o.id]: !prev[o.id] }))}
                                className="material-symbols-outlined text-gray-700 cursor-pointer"
                                style={{ fontSize: "24px" }}
                            >
                                {open[o.id] ? "expand_less" : "expand_more"}
                            </button>
                            <span className="font-semibold">#{o.id.slice(-6)}</span>
                            <span className="text-sm text-gray-600">{o.user.username}</span>
                        </div>

                        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                            <span className="text-sm text-gray-600">
                                {new Date(o.createdAt).toLocaleDateString()}
                            </span>

                            <select
                                value={o.status}
                                onChange={e => updateStatus(o.id, e.target.value)}
                                className="status-select"
                            >
                                {STATUSES.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>

                            <button
                                onClick={() => deleteOrder(o.id)}
                                className="material-symbols-outlined text-red-600 cursor-pointer"
                                style={{ fontSize: "24px" }}
                            >
                                delete
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    {open[o.id] && (
                        <div className="mt-4 space-y-3">
                            {/* Items */}
                            <div>
                                <h3 className="font-semibold mb-1">Items:</h3>
                                {o.items.map((it, i) => (
                                    <div key={i} className="flex items-center space-x-3 mb-2">
                                        <img
                                            src={"/" + it.image}
                                            alt={it.name}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">{it.name}</p>
                                            <p className="text-sm text-gray-600">
                                                Qty: {it.quantity} × ${it.price.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Shipping */}
                            <div>
                                <h3 className="font-semibold mb-1">Shipping Address:</h3>
                                <p className="text-sm">
                                    {o.shippingAddress.street}, {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.zip}, {o.shippingAddress.country}
                                </p>
                            </div>

                            {/* Payment & Total */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                <p>
                                    <strong>Payment:</strong> {o.paymentMethod.toUpperCase()}
                                </p>
                                <p className="mt-2 sm:mt-0">
                                    <strong>Total:</strong> ${o.totalPrice.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {orders.length === 0 && (
                <p className="text-gray-600 text-center">No orders found.</p>
            )}
        </div>
    );
}
