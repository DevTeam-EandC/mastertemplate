import api from "../api/api";
import { getAuthItem } from "./authStorage";

// Revokes the stored refresh token on the server. The caller still clears the
// local session when this fails, so a network error or an expired access token
// never leaves the user signed in on this device.
export async function revokeRefreshToken(): Promise<void> {
    const refreshToken = getAuthItem("refreshToken");

    if (!refreshToken) {
        return;
    }

    try {
        await api.post("/Auth/logout", { refreshToken });
    } catch {
        // Best effort only. The local session is cleared by the caller.
    }
}
