// src/pages/AdminThemesPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import "./AdminThemesPage.css";

export default function AdminThemesPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!user) return navigate("/login");
            if (user.role !== "admin") return navigate("/");
        }
    }, [user, loading, navigate]);

    const [themes, setThemes] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        name: "", description: "", color: "#000000", imageFile: null
    });

    const load = () => {
        api.get("/api/admin/themes")
            .then(r => setThemes(r.data))
            .catch(() => { });
    };
    useEffect(load, []);

    const openModal = (th = null) => {
        setEditing(th);
        setForm({
            name: th?.name || "",
            description: th?.description || "",
            color: th?.color || "#000000",
            imageFile: null,
        });
        setModalOpen(true);
    };
    const closeModal = () => setModalOpen(false);

    const handleSubmit = async e => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("description", form.description);
        fd.append("color", form.color);
        if (form.imageFile) fd.append("theme", form.imageFile); // field name is 'theme' for image

        try {
            if (editing) {
                await api.put(`/api/admin/themes/${editing._id || editing.id}`, fd);
            } else {
                await api.post("/api/admin/themes", fd);
            }
            closeModal();
            load();
        } catch (err) {
            alert(err.response?.data?.message || "Error");
        }
    };

    const deleteTheme = id => {
        if (!window.confirm("Delete theme?")) return;
        api.delete(`/api/admin/themes/${id}`)
            .then(load)
            .catch(() => alert("Delete failed"));
    };

    if (loading || !user || user.role !== "admin") return null;

    return (
        <div className="admin-themes px-6 py-8 max-w-5xl mx-auto space-y-6">
            <h1 className="text-5xl font-bold text-center" style={{ fontFamily: "MyFont", marginTop: "120px", marginBottom: "68px" }}>
                Manage Themes
            </h1>
            <button
                onClick={() => openModal()}
                className="px-4 py-2 bg-green-600 text-white rounded"
            >
                + Add Theme
            </button>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {themes.map(th => (
                    <div key={th._id || th.id} className="card glass p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out
            hover:scale-105 hover:shadow-lg hover:z-10">
                        <div
                            className="h-32 bg-cover bg-center rounded-md mb-2"
                            style={{ backgroundImage: `url(${"/" + th.image})` }}
                        />
                        <h2 className="font-semibold">{th.name}</h2>
                        <p className="text-sm text-gray-700">{th.description}</p>
                        <div className="flex items-center justify-between mt-4">
                            <div className="w-8 h-4 rounded mb-2" style={{ backgroundColor: th.color }} />
                            <div className="space-x-2">
                                <button onClick={() => openModal(th)} className="icon-btn">
                                    <span className="material-symbols-outlined thin" style={{ color: "#1E40AF" }}>
                                        edit
                                    </span>
                                </button>
                                <button onClick={() => deleteTheme(th._id || th.id)} className="icon-btn">
                                    <span className="material-symbols-outlined thin" style={{ color: "#DC2626" }}>
                                        delete
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {modalOpen && (
                <div className="modal-backdrop">
                    <form className="modal bg-white rounded-lg p-6" onSubmit={handleSubmit}>
                        <h2 className="text-xl font-semibold mb-4">
                            {editing ? "Edit Theme" : "New Theme"}
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

                        <label className="block mb-2">Color</label>
                        <input
                            type="color"
                            value={form.color}
                            onChange={e => setForm({ ...form, color: e.target.value })}
                            className="mb-3 w-16 h-8 p-0 border rounded"
                        />

                        <label className="block mb-2">Banner Image</label>
                        <input
                            type="file" accept="image/*"
                            onChange={e => setForm({ ...form, imageFile: e.target.files[0] })}
                            className="mb-4"
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
