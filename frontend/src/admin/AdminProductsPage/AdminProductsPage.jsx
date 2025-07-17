import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import "./AdminProductsPage.css";

export default function AdminProductsPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Guard: only admin
    useEffect(() => {
        if (!loading) {
            if (!user) return navigate("/login");
            if (user.role !== "admin") return navigate("/");
        }
    }, [user, loading, navigate]);

    // State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [themes, setThemes] = useState([]);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null); // product or null
    const emptyForm = {
        name: "", description: "", price: "", category: "", theme: "",
        brand: "", color: "#000000", dimensions: { width: "", height: "", depth: "" },
        weight: "", images: [], newFiles: []
    };
    const [form, setForm] = useState(emptyForm);

    // Load data
    const loadAll = () => {
        api.get("/api/admin/products").then(r => setProducts(r.data));
        api.get("/api/admin/categories").then(r => setCategories(r.data));
        api.get("/api/admin/themes").then(r => setThemes(r.data));
    };
    useEffect(loadAll, []);

    // Open modal for new/edit
    const openModal = (prod = null) => {
        if (prod) {
            setEditing(prod);
            setForm({
                name: prod.name,
                description: prod.description,
                price: prod.price,
                category: prod.category._id, // full object
                theme: prod.theme._id, // full object
                brand: prod.brand || "",
                color: prod.color || "#000000",
                dimensions: {
                    width: prod.dimensions.width,
                    height: prod.dimensions.height,
                    depth: prod.dimensions.depth
                },
                weight: prod.weight || "",
                images: [...prod.images], // array of web paths
                newFiles: []
            });
        } else {
            setEditing(null);
            setForm(emptyForm);
        }
        setShowModal(true);
    };
    const closeModal = () => setShowModal(false);

    // Delete product
    const deleteProduct = id => {
        if (!window.confirm("Delete this product?")) return;
        api.delete(`/api/admin/products/${id}`)
            .then(loadAll)
            .catch(() => alert("Delete failed"));
    };

    // Remove one image
    const removeImage = (filename) => {
        if (form.images.length <= 1) return alert("At least one image required");
        api.delete(`/api/admin/products/${editing.id}/images/${filename}`)
            .then(({ data }) => setForm(f => ({ ...f, images: data.images })))
            .catch(() => alert("Failed to remove image"));
    };

    // Handle form submit (create or update non-image fields)
    const handleSubmit = (e) => {
        e.preventDefault();

        // 1) build FormData
        const fd = new FormData();

        // 2) append text fields
        fd.append("name", form.name);
        fd.append("description", form.description);
        fd.append("price", form.price);
        fd.append("category", form.category);
        fd.append("theme", form.theme);
        fd.append("brand", form.brand);
        fd.append("color", form.color);
        fd.append("dimensions", JSON.stringify(form.dimensions));
        if (form.weight) {
            fd.append("weight", form.weight);
        }

        // 3) “tell” the backend about your existing images
        //    (so it can replace prod.images with exactly this list + any new ones)
        fd.append("images", JSON.stringify(form.images));

        // 4) append any brand‑new files
        form.newFiles.forEach(file => {
            fd.append("images", file);
        });

        // debug
        console.log("Submitting product (FormData):", fd);

        const request = editing
            ? api.put(`/api/admin/products/${editing.id}`, fd)
            : api.post("/api/admin/products", fd);

        request
            .then(() => {
                closeModal();
                loadAll();
            })
            .catch(err => alert(err.response?.data?.message || "Error"));
    };

    if (loading || !user || user.role !== "admin") return null;

    return (
        <div className="admin-products px-6 py-8 max-w-7xl mx-auto space-y-6">
            <h1 className="text-5xl text-center font-bold" style={{ fontFamily: "MyFont", marginTop: "120px", marginBottom: "68px" }}>
                Manage Products
            </h1>
            <button
                onClick={() => openModal()}
                className="px-4 py-2 bg-green-600 text-white rounded"
            >
                + Add Product
            </button>

            {/* Products Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map(p => (
                    <div key={p.id} className="card glass p-4 rounded-lg flex flex-col">
                        {/* Image carousel */}
                        <Carousel images={p.images} interval={4000} />

                        <h2 className="mt-2 font-semibold"><b>Name:</b> {p.name}</h2>
                        <p className="text-gray-700"><b>Description:</b> {p.description}</p>
                        <p className="text-gray-600">{p.brand && <><b>Brand:</b> {p.brand}</>}</p>
                        <p className="text-gray-600"><b>Price:</b> ${p.price.toFixed(2)}</p>
                        <p className="text-gray-600"><b>Category:</b> {p.category.name}</p>
                        <p className="text-gray-600"><b>Theme:</b> {p.theme.name}</p>
                        <p className="text-gray-600"><b>Dimensions:</b> {p.dimensions.width} x {p.dimensions.height} x {p.dimensions.depth} cm</p>
                        <p className="text-gray-600"><b>Weight:</b> {p.weight} g</p>
                        {p.color &&
                            <div className="text-gray-600 flex items-center h-8 gap-5"><b>Color:</b><div
                                className="w-6 h-6 rounded "
                                style={{ backgroundColor: p.color }}
                            ></div></div>
                        }
                        <div className="mt-auto flex space-x-2 pt-4">
                            <button onClick={() => openModal(p)} className="icon-btn">
                                <span className="material-symbols-outlined" style={{ color: "#1E40AF" }}>
                                    edit
                                </span>
                            </button>
                            <button onClick={() => deleteProduct(p.id)} className="icon-btn">
                                <span className="material-symbols-outlined" style={{ color: "#DC2626" }}>
                                    delete
                                </span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-backdrop">
                    <form className="modal bg-white p-6 max-w-md mx-auto" onSubmit={handleSubmit}>
                        <h2 className="text-xl font-semibold mb-4">
                            {editing ? "Edit Product" : "New Product"}
                        </h2>

                        {/* Basic fields */}
                        {[
                            { label: "Name", key: "name", type: "text" },
                            { label: "Description", key: "description", type: "textarea" },
                            { label: "Price", key: "price", type: "number" },
                            { label: "Brand", key: "brand", type: "text" },
                        ].map(fld =>
                            fld.type === "textarea" ? (
                                <textarea
                                    key={fld.key}
                                    placeholder={fld.label}
                                    value={form[fld.key]}
                                    onChange={e => setForm({ ...form, [fld.key]: e.target.value })}
                                    className="mb-3 w-full p-2 border rounded"
                                    rows={3}
                                />
                            ) : (
                                <input
                                    key={fld.key}
                                    type={fld.type}
                                    required={["name", "description", "price"].includes(fld.key)}
                                    placeholder={fld.label}
                                    value={form[fld.key]}
                                    onChange={e => setForm({ ...form, [fld.key]: e.target.value })}
                                    className="mb-3 w-full p-2 border rounded"
                                />
                            )
                        )}

                        {/* Category & Theme */}
                        <select
                            required
                            value={form.category}
                            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                            className="mb-3 w-full p-2 border rounded"
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>

                        <select
                            required
                            value={form.theme}
                            onChange={e => setForm(f => ({ ...f, theme: e.target.value }))}
                            className="mb-3 w-full p-2 border rounded"
                        >
                            <option value="">Select Theme</option>
                            {themes.map(t => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                            ))}
                        </select>

                        {/* Color picker */}
                        <div className="mb-3 flex items-center gap-2">
                            <label>Color:</label>
                            <input
                                type="color"
                                value={form.color}
                                onChange={e => setForm({ ...form, color: e.target.value })}
                            />
                        </div>

                        {/* Dimensions */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {["width", "height", "depth"].map(dim => (
                                <input
                                    key={dim}
                                    type="number" min="0"
                                    placeholder={dim}
                                    value={form.dimensions[dim]}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            dimensions: {
                                                ...form.dimensions,
                                                [dim]: e.target.value
                                            }
                                        })
                                    }
                                    className="p-2 border rounded"
                                />
                            ))}
                        </div>

                        {/* Weight */}
                        <input
                            type="number"
                            placeholder="Weight (g)"
                            value={form.weight}
                            onChange={e => setForm({ ...form, weight: e.target.value })}
                            className="mb-3 w-full p-2 border rounded"
                        />

                        {/* Existing Images */}
                        {editing && (
                            <div className="mb-3">
                                <p className="font-semibold mb-1">Images:</p>
                                <div className="flex gap-2 overflow-x-auto">
                                    {form.images.map((img, i) => {
                                        const fn = img.split("/").pop();
                                        return (
                                            <div key={i} className="relative">
                                                <img src={"/" + img} alt="" className="w-16 h-16 object-cover rounded" />
                                                <button
                                                    type="button"
                                                    disabled={form.images.length <= 1}
                                                    onClick={() => removeImage(fn)}
                                                    className="absolute top-0 right-0 bg-white rounded-full p-1 disabled:opacity-50"
                                                >
                                                    <span className="material-symbols-outlined" style={{ color: "#E53E3E" }}>
                                                        close
                                                    </span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Upload new images */}
                        <div className="mb-4">
                            <label className="block mb-1">Upload Images:</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={e => setForm({ ...form, newFiles: Array.from(e.target.files) })}
                            />
                        </div>

                        {/* Actions */}
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




function Carousel({ images, interval = 3000 }) {
    const [activeIdx, setActiveIdx] = useState(0);
    const len = images.length;

    // Auto‑advance
    useEffect(() => {
        if (len <= 1) return;
        const timer = setInterval(() => {
            setActiveIdx(i => (i + 1) % len);
        }, interval);
        return () => clearInterval(timer);
    }, [len, interval]);

    const prev = () => setActiveIdx(i => (i - 1 + len) % len);
    const next = () => setActiveIdx(i => (i + 1) % len);

    return (
        <div className="carousel">
            {images.map((img, i) => (
                <img
                    key={i}
                    src={`/${img}`}
                    alt=""
                    className={`carousel-img ${i === activeIdx ? "active" : ""}`}
                />
            ))}

            {len > 1 && (
                <>
                    <button className="carousel-arrow carousel-arrow--left" onClick={prev}>
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button className="carousel-arrow carousel-arrow--right" onClick={next}>
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </>
            )}

            {len > 1 && (
                <div className="carousel-dots">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            className={`dot ${i === activeIdx ? "active" : ""}`}
                            onClick={() => setActiveIdx(i)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}