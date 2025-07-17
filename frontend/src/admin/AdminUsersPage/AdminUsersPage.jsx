// src/pages/AdminUsersPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminUsersPage.css";

const AdminUsersPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");

    // Redirect non-admins
    useEffect(() => {
        if (!loading) {
            if (!user) return navigate("/login");
            if (user.role !== "admin") return navigate("/");
        }
    }, [user, loading, navigate]);

    // Fetch all users
    useEffect(() => {
        const token = localStorage.getItem("token");
        axios
            .get("/api/admin/users", {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(({ data }) => setUsers(data))
            .catch(err => setError("Failed to load users"));
    }, []);

    const deleteUser = async (id) => {
        if (id === user.id) {
            alert("You cannot delete your own account.");
            return;
        }
        if (!window.confirm("Delete this user?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(u => u.filter(u => u.id !== id));
        } catch {
            alert("Delete failed");
        }
    };

    const changeRole = async (id, newRole) => {
        if (id === user.id) {
            alert("You cannot change your own role.");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const { data: updated } = await axios.patch(
                `/api/admin/users/${id}/role`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(u =>
                u.map(user => (user.id === id ? { ...user, role: updated.role } : user))
            );
        } catch {
            alert("Role change failed");
        }
    };

    if (loading || !user || user.role !== "admin") return null;

    return (
        <div className="admin-users-page max-w-6xl mx-auto p-6 space-y-6">
            <h1 className="text-5xl text-center font-bold " style={{ fontFamily: "MyFont", marginTop: "120px", marginBottom: "68px" }}>
                Manage Users
            </h1>
            {error && <p className="text-red-500">{error}</p>}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-whiet rounded-lg shadow">
                    <thead className="bg-gray-100">
                        <tr>
                            {["Username", "Email", "Role", "Created At", "Actions"].map(th => (
                                <th key={th} className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                                    {th}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className="border-t">
                                <td className="px-4 py-2">{u.username}</td>
                                <td className="px-4 py-2">{u.email}</td>
                                <td className="px-4 py-2">
                                    <select
                                        value={u.role}
                                        onChange={e => changeRole(u.id, e.target.value)}
                                        className="p-1 border rounded"
                                    >
                                        <option value="user">user</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </td>
                                <td className="px-4 py-2">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 space-x-2">
                                    <button
                                        onClick={() => deleteUser(u.id)}
                                        className="action-btn"
                                    >
                                        <span
                                            className="material-symbols-outlined"
                                            style={{ color: "#E53E3E" }}
                                        >
                                            delete
                                        </span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsersPage;
