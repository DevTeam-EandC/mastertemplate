import axios from "axios";

import { getAuthItem } from "../auth/authStorage";

const api = axios.create({
    baseURL: "https://localhost:7287/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = getAuthItem("accessToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
