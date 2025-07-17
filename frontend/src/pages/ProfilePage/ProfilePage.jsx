import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProfilePage.css";

const ProfilePage = () => {
    const { user, loading, logout: authLogout } = useAuth();
    const navigate = useNavigate();

    // Redirect if unauthenticated
    useEffect(() => {
        if (!loading && !user) navigate("/login");
    }, [user, loading, navigate]);

    const [profile, setProfile] = useState(null);
    const [editingPhone, setEditingPhone] = useState(false);
    const [newPhone, setNewPhone] = useState("");
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);

    // Modal states
    const [showPwdModal, setShowPwdModal] = useState(false);
    const [pwdOld, setPwdOld] = useState("");
    const [pwdNew, setPwdNew] = useState("");
    const [pwdNew2, setPwdNew2] = useState("");

    // Address form state
    const emptyAddr = { title: "", street: "", city: "", state: "", zip: "", country: "" };
    const [editingAddrId, setEditingAddrId] = useState(null);
    const [addrForm, setAddrForm] = useState(emptyAddr);

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get("/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(({ data }) => {
                setProfile(data);
                setNewPhone(data.phone || "");
                setAddresses(data.addresses);
                setOrders(data.orders);
            })
            .catch(() => navigate("/login"));
    }, [navigate]);

    if (loading || !profile) return null;

    // Helpers
    const savePhone = () => {
        const token = localStorage.getItem("token");
        axios.patch("/api/users/phone", { phone: newPhone }, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(({ data }) => {
                setProfile(p => ({ ...p, phone: data.phone }));
                setEditingPhone(false);
            });
    };

    const startEditAddr = addr => {
        setEditingAddrId(addr._id);
        setAddrForm({ ...addr });
    };

    const saveAddr = () => {
        // Validate all fields are filled
        for (const key of Object.keys(addrForm)) {
            if (!addrForm[key].trim()) {
                alert("All address fields are required.");
                return;
            }
        }
        const token = localStorage.getItem("token");
        const url = editingAddrId
            ? `/api/users/addresses/${editingAddrId}`
            : "/api/users/addresses";
        const method = editingAddrId ? "put" : "post";
        axios[method](url, addrForm, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(({ data }) => {
                setAddresses(data);
                setEditingAddrId(null);
                setAddrForm(emptyAddr);
            });
    };

    const deleteAddr = id => {
        const token = localStorage.getItem("token");
        axios.delete(`/api/users/addresses/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(({ data }) => setAddresses(data));
    };

    const openPwdModal = () => setShowPwdModal(true);
    const changePwd = () => {
        if (pwdNew !== pwdNew2) return alert("Passwords must match");
        const token = localStorage.getItem("token");
        axios.patch("/api/users/password", {
            oldPassword: pwdOld,
            newPassword: pwdNew
        }, { headers: { Authorization: `Bearer ${token}` } })
            .then(() => {
                alert("Password changed");
                setShowPwdModal(false);
                setPwdOld(""); setPwdNew(""); setPwdNew2("");
            })
            .catch(err => alert(err.response?.data?.message || err.message));
    };

    const cancelOrder = orderId => {
        const token = localStorage.getItem("token");
        axios.patch(`/api/users/orders/${orderId}/cancel`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => {
                setOrders(o =>
                    o.map(ord =>
                        ord._id === orderId ? { ...ord, status: "cancelled" } : ord
                    )
                );
            })
            .catch(err => alert(err.response?.data?.message || err.message));
    };

    const logout = () => {
        authLogout();
        navigate('/login');
    };

    return (
        <div className="profile-page max-w-5xl mx-auto mt-16 p-6 space-y-10">
            {/* User Info */}
            <h1 className="text-3xl font-bold text-center" style={{ fontFamily: "MyFont", marginTop: "48px", marginBottom: "32px" }}>Profile</h1>
            <section className="glass p-6 rounded-lg space-y-4">
                <p className="text-lg"><strong>Username:</strong> {profile.username}</p>
                <p className="text-lg"><strong>Email:</strong> {profile.email}</p>
                <div className="flex items-center">
                    <strong className="text-lg">Phone:</strong>
                    {editingPhone ? (
                        <>
                            <input
                                value={newPhone}
                                onChange={e => setNewPhone(e.target.value)}
                                className="ml-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
                                type="tel"
                            />
                            <button onClick={savePhone} className="ml-2 modern-button flex items-center justify-center p-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-green-100">
                                <span className="material-symbols-outlined text-green-600">save</span>
                            </button>
                            <button onClick={() => setEditingPhone(false)} className="ml-2 modern-button flex items-center justify-center p-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-gray-100">
                                <span className="material-symbols-outlined text-gray-500">cancel</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="ml-2 text-lg">{profile.phone || "—"}</span>
                            <button onClick={() => setEditingPhone(true)} className="ml-2 modern-button flex items-center justify-center p-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-blue-100">
                                <span className="material-symbols-outlined text-blue-600">edit</span>
                            </button>
                        </>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 mt-4">
                    <button
                        onClick={openPwdModal}
                        className="px-5 py-2 modern-button flex items-center justify-center rounded-md transition-colors duration-200 ease-in-out hover:bg-blue-100 text-blue-800 font-medium"
                    >
                        <span className="material-symbols-outlined mr-2">lock</span> Change Password
                    </button>

                    <button
                        onClick={logout}
                        className="px-5 py-2 modern-button flex items-center justify-center rounded-md transition-colors duration-200 ease-in-out hover:bg-red-100 text-red-700 font-medium"
                    >
                        <span className="material-symbols-outlined mr-2">logout</span> Logout
                    </button>

                    {profile.role === "admin" && (
                        <button
                            onClick={() => navigate("/admin/users")}
                            className="px-5 py-2 modern-button bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors duration-200 ease-in-out hover:bg-blue-700 font-medium"
                        >
                            <span className="material-symbols-outlined mr-2">admin_panel_settings</span> Go to Admin Pages
                        </button>
                    )}
                </div>
            </section>

            {/* Password Modal */}
            {showPwdModal && (
                <div className="modal-backdrop">
                    <div className="modal glass p-8 rounded-lg shadow-xl">
                        <h3 className="text-2xl font-semibold mb-6 text-gray-800">Change Password</h3>
                        <input
                            type="password"
                            placeholder="Current Password"
                            value={pwdOld}
                            onChange={e => setPwdOld(e.target.value)}
                            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={pwdNew}
                            onChange={e => setPwdNew(e.target.value)}
                            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={pwdNew2}
                            onChange={e => setPwdNew2(e.target.value)}
                            className="w-full p-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex justify-end space-x-4">
                            <button onClick={() => setShowPwdModal(false)} className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 ease-in-out">Cancel</button>
                            <button onClick={changePwd} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ease-in-out">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Addresses */}
            <section className="glass p-6 rounded-lg space-y-6">
                <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "MyFont" }}>
                    Addresses
                </h2>
                <div className="space-y-4">
                    {addresses.map(addr => (
                        <div key={addr._id} className="flex items-center justify-between p-4 bg-white bg-opacity-70 rounded-lg shadow-sm">
                            <div>
                                <p className="font-semibold text-lg text-gray-900">{addr.title}</p>
                                <p className="text-gray-700">{addr.street}, {addr.city}, {addr.state} {addr.zip}, {addr.country}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => startEditAddr(addr)} className="modern-button flex items-center justify-center p-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-blue-100">
                                    <span className="material-symbols-outlined text-blue-600">edit</span>
                                </button>
                                <button onClick={() => deleteAddr(addr._id)} className="modern-button flex items-center justify-center p-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-red-100">
                                    <span className="material-symbols-outlined text-red-600">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add / Edit Form */}
                <div className="pt-6 border-t border-gray-200">
                    <h3 className="font-bold text-xl mb-4 text-gray-800">
                        {editingAddrId ? "Edit Address" : "Add New Address"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {["title", "street", "city", "state", "zip", "country"].map(field => (
                            <input
                                key={field}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                value={addrForm[field]}
                                onChange={e => setAddrForm(f => ({ ...f, [field]: e.target.value }))}
                                className="p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        ))}
                    </div>
                    <button
                        onClick={saveAddr}
                        className="px-5 py-2 modern-button flex items-center justify-center rounded-md transition-colors duration-200 ease-in-out hover:bg-green-100 text-green-700 font-medium"
                    >
                        <span className="material-symbols-outlined mr-2">save</span> {editingAddrId ? "Save Address" : "Add Address"}
                    </button>
                </div>
            </section>

            {/* Orders */}
            <section className="glass p-6 rounded-lg space-y-6">
                <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "MyFont" }}>
                    Orders
                </h2>
                {orders.length === 0 && <p className="text-gray-600">No orders yet.</p>}
                <div className="space-y-4">
                    {orders.map(o => (
                        <div key={o._id} className="border border-gray-200 rounded-lg p-5 space-y-3 bg-white bg-opacity-70 shadow-sm">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                <span className="font-semibold text-gray-800">Order: <span className="font-normal">{o._id}</span></span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${o.status === "pending" ? "bg-yellow-500 text-white" : "bg-gray-500 text-white"}`}>
                                    {o.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {o.items.map(it => (
                                    <div key={it.product} className="flex items-center space-x-4 p-2 bg-gray-50 rounded-md">
                                        <img src={`/${it.image}`} alt={it.name} className="w-12 h-12 object-contain rounded-md border border-gray-200" />
                                        <div className="flex-grow">
                                            <span className="font-medium text-gray-900">{it.name}</span>
                                            <span className="text-gray-600 block text-sm">Quantity: {it.quantity}</span>
                                        </div>
                                        <span className="font-semibold text-gray-800">${(it.price * it.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <span className="font-bold text-lg text-gray-900">Total: ${o.totalPrice.toFixed(2)}</span>
                                {o.status === "pending" && (
                                    <button
                                        onClick={() => cancelOrder(o._id)}
                                        className="px-4 py-2 modern-button flex items-center justify-center rounded-md transition-colors duration-200 ease-in-out hover:bg-red-100 text-red-700 font-medium"
                                    >
                                        <span className="material-symbols-outlined mr-2">cancel</span> Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ProfilePage;