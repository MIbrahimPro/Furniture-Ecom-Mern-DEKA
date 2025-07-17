// src/context/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        axios
            .get("/api/users/me", {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(({ data }) => {
                setUser(data);
                setLoading(false);
            })
            .catch(() => {
                localStorage.removeItem("token");
                setUser(null);
                setLoading(false);
            });
    }, []);

    const login = (tokenValue, userData) => {
        localStorage.setItem("token", tokenValue);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
