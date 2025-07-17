// src/utils/api.js
import axios from 'axios';
export const api = axios.create(
    { baseURL: "http://localhost:5000" }
);
api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // If we're sending FormData, configure it properly for multer
    if (config.data instanceof FormData) {
        // Don't set Content-Type - let browser handle it
        delete config.headers['Content-Type'];
        // Prevent axios from trying to JSON stringify the FormData
        config.transformRequest = [(data) => data];
        // Ensure proper boundary handling
        config.maxBodyLength = Infinity;
        config.maxContentLength = Infinity;
    }

    return config;
});
