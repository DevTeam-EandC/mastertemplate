import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import {
    clearAuthSession,
    getAuthItem,
    isRememberedSession,
    setAuthItem,
} from "../auth/authStorage";

const API_BASE_URL = "http://localhost:5267/api";

const api = axios.create({
    baseURL: API_BASE_URL,
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

// Shared in-flight refresh, so several requests that fail together
// trigger only one call to /Auth/refresh. The backend rotates refresh
// tokens, so a second parallel refresh would fail.
let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
    const refreshToken = getAuthItem("refreshToken");

    if (!refreshToken) {
        throw new Error("No refresh token is stored.");
    }

    // Keep the new tokens in the same storage as the current session.
    const remember = isRememberedSession();

    // Plain axios: avoids sending the expired bearer token and the
    // response interceptor below.
    const response = await axios.post<{
        accessToken: string;
        refreshToken: string;
    }>(`${API_BASE_URL}/Auth/refresh`, { refreshToken });

    setAuthItem("accessToken", response.data.accessToken, remember);
    setAuthItem("refreshToken", response.data.refreshToken, remember);

    return response.data.accessToken;
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const original = error.config as
            | (InternalAxiosRequestConfig & { _retry?: boolean })
            | undefined;

        const isUnauthorized = error.response?.status === 401;

        // Login and refresh return 401 for bad credentials or bad tokens.
        // Those must not trigger a refresh loop.
        const isAuthEndpoint = original?.url?.startsWith("/Auth/") ?? false;

        if (!original || !isUnauthorized || isAuthEndpoint || original._retry) {
            return Promise.reject(error);
        }

        original._retry = true;

        try {
            if (!refreshInFlight) {
                refreshInFlight = refreshAccessToken().finally(() => {
                    refreshInFlight = null;
                });
            }

            const newToken = await refreshInFlight;

            original.headers.Authorization = `Bearer ${newToken}`;

            return api(original);
        } catch {
            // Refresh token is missing, revoked, expired, or the account is inactive.
            clearAuthSession();

            if (window.location.pathname !== "/login") {
                window.location.assign("/login");
            }

            return Promise.reject(error);
        }
    }
);

export default api;
