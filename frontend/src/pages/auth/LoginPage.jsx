// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./AuthPages.css";

const LoginPage = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) navigate("/");
    }, [user, navigate]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        try {
            const res = await axios.post("/api/auth/login", { email, password });
            login(res.data.token, res.data.user);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="auth-page flex items-center justify-center min-h-screen px-4">
            <form
                className="glass-form p-8 rounded-lg w-full max-w-md space-y-6"
                onSubmit={handleSubmit}
            >
                <h2 className="text-2xl font-bold text-center" style={{ fontFamily: "MyFont" }}>
                    login to DEKA
                </h2>

                {error && <p className="text-red-500">{error}</p>}

                <div>
                    <label className="block mb-1">Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block mb-1">Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white rounded hover:opacity-90 transition"
                >
                    Login
                </button>

                <p className="text-center text-sm">
                    Don’t have an account?{" "}
                    <Link to="/signup" className="text-blue-600 hover:underline">
                        Sign up
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;
