// src/pages/AdminCategoriesPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import "./AdminCategoriesPage.css";

export default function AdminCategoriesPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Guard
    useEffect(() => {
        if (!loading) {
            if (!user) return navigate("/login");
            if (user.role !== "admin") return navigate("/");
        }
    }, [user, loading, navigate]);

    const [cats, setCats] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        name: "", description: "", iconFile: null
    });

    // Fetch
    const load = () => {
        api.get("/api/admin/categories")
            .then(r => {
                setCats(r.data)
            })

            .catch(() => {
                console.log("Failed to load categories");
            });
    };
    useEffect(load, []);

    const openModal = (cat = null) => {
        setEditing(cat);
        setForm({
            name: cat?.name || "",
            description: cat?.description || "",
            iconFile: null,
        });
        setModalOpen(true);
    };
    const closeModal = () => setModalOpen(false);

    const handleSubmit = async e => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("description", form.description);
        if (form.iconFile) fd.append("icon", form.iconFile); // field name is 'icon' for icon

        try {
            if (editing) {
                await api.put(`/api/admin/categories/${editing._id || editing.id}`, fd);
            } else {
                await api.post("/api/admin/categories", fd);
            }
            closeModal();
            load();
        } catch (err) {
            alert(err.response?.data?.message || "Error");
        }
    };

    const deleteCat = id => {
        if (!window.confirm("Delete category?")) return;
        api.delete(`/api/admin/categories/${id}`)
            .then(load)
            .catch(() => alert("Delete failed"));
    };

    if (loading || !user || user.role !== "admin") return null;

    return (
        <div className="admin-cats px-6 py-8 max-w-5xl mx-auto space-y-6">
            <h1 className="text-5xl text-center font-bold" style={{ fontFamily: "MyFont", marginTop: "120px", marginBottom: "68px" }}>
                Manage Categories
            </h1>
            <button
                onClick={() => openModal()}
                className="px-4 py-2 bg-green-600 text-white rounded"
            >
                + Add Category
            </button>

            <div className="grid gap-6 sm:grid-cols-2">
                {cats.map(cat => (
                    <div key={cat._id || cat.id} className="card glass p-4 rounded-lg ">
                        <img
                            src={"/" + cat.icon}
                            alt=""
                            className="w-12 h-12 object-cover mb-2"
                        />
                        <h2 className="font-semibold">{cat.name}</h2>
                        <p className="text-sm text-gray-700">{cat.description}</p>
                        <div className="mt-4 space-x-2">
                            <button onClick={() => openModal(cat)} className="icon-btn">
                                <span className="material-symbols-outlined" style={{ color: "#1E40AF" }}>
                                    edit
                                </span>
                            </button>
                            <button onClick={() => deleteCat(cat._id || cat.id)} className="icon-btn">
                                <span className="material-symbols-outlined" style={{ color: "#DC2626" }}>
                                    delete
                                </span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {modalOpen && (
                <div className="modal-backdrop">
                    <form className="modal bg-white rounded-lg p-6" onSubmit={handleSubmit}>
                        <h2 className="text-xl font-semibold mb-4">
                            {editing ? "Edit Category" : "New Category"}
                        </h2>
                        <input
                            type="text" required placeholder="Name"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="mb-3 w-full p-2 border rounded"
                        />
                        <textarea
                            placeholder="Description" rows={3}
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="mb-3 w-full p-2 border rounded"
                        />

                        <label className="block mb-2">Icon</label>
                        <input
                            type="file" accept="image/*"
                            onChange={e => setForm({ ...form, iconFile: e.target.files[0] })}
                            className="mb-3"
                        />

                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={closeModal} className="px-3 py-1">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                                {editing ? "Save" : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
