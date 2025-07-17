// src/pages/AdminGeneralInfoPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import "./AdminGeneralInfoPage.css";

export default function AdminGeneralInfoPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Guard admin
    useEffect(() => {
        if (!loading) {
            if (!user) return navigate("/login");
            if (user.role !== "admin") return navigate("/");
        }
    }, [user, loading, navigate]);

    // State
    const [info, setInfo] = useState(null);
    const [editingEmail, setEditingEmail] = useState(false);
    const [editingPhone, setEditingPhone] = useState(false);
    const [tempEmail, setTempEmail] = useState("");
    const [tempPhone, setTempPhone] = useState("");
    const [showAddrModal, setShowAddrModal] = useState(false);
    const [addrForm, setAddrForm] = useState({
        title: "", street: "", city: "", state: "", zip: "", country: ""
    });

    // Load info
    useEffect(() => {
        api.get("/api/admin/info")
            .then(({ data }) => {
                setInfo(data);
                setTempEmail(data.contactEmail);
                setTempPhone(data.contactPhone || "");
            })
            .catch(() => alert("Failed to load general info"));
    }, []);

    if (loading || !info) return null;

    // Helpers to send updates
    const patchField = (field, value) =>
        api.put("/api/admin/info", { [field]: value })
            .then(({ data }) => {
                setInfo(data);
                if (field === "contactEmail") {
                    setTempEmail(data.contactEmail);
                    setEditingEmail(false);
                }
                if (field === "contactPhone") {
                    setTempPhone(data.contactPhone || "");
                    setEditingPhone(false);
                }
            })
            .catch(err => alert(err.response?.data?.message || "Update failed"));

    const saveAddress = () => {
        api.put("/api/admin/info", { address: addrForm })
            .then(({ data }) => {
                setInfo(data);
                setShowAddrModal(false);
            })
            .catch(err => alert(err.response?.data?.message || "Address update failed"));
    };

    return (
        <div className="admin-info px-6 py-8 max-w-3xl mx-auto space-y-8">
            <h1 className="text-5xl text-center font-bold" style={{ fontFamily: "MyFont", marginTop: "120px", marginBottom: "68px" }}>
                General Settings
            </h1>

            {/* Email */}
            <div className="flex items-center justify-between">
                <div>
                    <span className="font-semibold">Contact Email:</span>{" "}
                    {editingEmail ? (
                        <input
                            type="email"
                            value={tempEmail}
                            onChange={e => setTempEmail(e.target.value)}
                            className="inline-input"
                        />
                    ) : (
                        <span>{info.contactEmail}</span>
                    )}
                </div>
                {editingEmail ? (
                    <div className="space-x-2">
                        <button
                            onClick={() => patchField("contactEmail", tempEmail)}
                            className="action-btn text-green-600"
                        >
                            save
                        </button>
                        <button
                            onClick={() => { setTempEmail(info.contactEmail); setEditingEmail(false); }}
                            className="action-btn"
                        >
                            cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setEditingEmail(true)}
                        className="icon-btn"
                    >
                        <span className="material-symbols-outlined thin" style={{ color: "#1E40AF" }}>
                            edit
                        </span>
                    </button>
                )}
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between">
                <div>
                    <span className="font-semibold">Contact Phone:</span>{" "}
                    {editingPhone ? (
                        <input
                            type="text"
                            value={tempPhone}
                            onChange={e => setTempPhone(e.target.value)}
                            className="inline-input"
                        />
                    ) : (
                        <span>{info.contactPhone || "—"}</span>
                    )}
                </div>
                {editingPhone ? (
                    <div className="space-x-2">
                        <button
                            onClick={() => patchField("contactPhone", tempPhone)}
                            className="action-btn text-green-600"
                        >
                            save
                        </button>
                        <button
                            onClick={() => { setTempPhone(info.contactPhone || ""); setEditingPhone(false); }}
                            className="action-btn"
                        >
                            cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setEditingPhone(true)}
                        className="icon-btn"
                    >
                        <span className="material-symbols-outlined" style={{ color: "#1E40AF" }}>
                            edit
                        </span>
                    </button>
                )}
            </div>

            {/* Address */}
            <div className="flex items-start justify-between">
                <div>
                    <span className="font-semibold">Office Address:</span>
                    <div className="address-block">
                        <p>{info.address.title}</p>
                        <p>{info.address.street}</p>
                        <p>
                            {info.address.city}
                            {info.address.state ? `, ${info.address.state}` : ""}
                            {info.address.zip ? ` ${info.address.zip}` : ""}
                        </p>
                        <p>{info.address.country}</p>
                    </div>
                </div>
                <button onClick={() => {
                    setAddrForm({ ...info.address });
                    setShowAddrModal(true);
                }}
                    className="icon-btn"
                >
                    <span className="material-symbols-outlined" style={{ color: "#1E40AF" }}>
                        edit
                    </span>
                </button>
            </div>

            {/* Address Modal */}
            {showAddrModal && (
                <div className="modal-backdrop">
                    <div className="modal glass p-6 max-w-md mx-auto">
                        <h2 className="text-xl font-semibold mb-4">Edit Address</h2>
                        {["title", "street", "city", "state", "zip", "country"].map(field => (
                            <input
                                key={field}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                value={addrForm[field]}
                                onChange={e => setAddrForm(f => ({ ...f, [field]: e.target.value }))}
                                className="modal-input mb-3"
                                required={["street", "city", "country"].includes(field)}
                            />
                        ))}
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setShowAddrModal(false)} className="action-btn">
                                Cancel
                            </button>
                            <button onClick={saveAddress} className="px-4 py-2 bg-blue-600 text-white rounded">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
