import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import api from "../api/api";
import {
    clearAuthSession,
    getAuthItem,
    isRememberedSession,
    removeAuthItem,
    setAuthItem,
} from "./authStorage";

import type {
    AuthContextType,
    DashboardAssignment,
    LoginResponse,
    LoginUser,
} from "./auth.types";

const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<LoginUser | null>(null);

    const [dashboards, setDashboards] = useState<DashboardAssignment[]>([]);

    const [activeDashboard, setActiveDashboard] =
        useState<DashboardAssignment | null>(null);

    const [loading, setLoading] = useState(true);

    // Restore login information after page refresh.
    useEffect(() => {
        try {
            const savedUser = getAuthItem("user");
            const savedDashboards = getAuthItem("dashboards");
            const savedActive = getAuthItem("activeDashboard");
            const token = getAuthItem("accessToken");

            if (token && savedUser && savedDashboards) {
                const parsedUser = JSON.parse(savedUser) as LoginUser;
                const parsedDashboards = JSON.parse(
                    savedDashboards
                ) as DashboardAssignment[];

                setUser(parsedUser);
                setDashboards(parsedDashboards);

                if (savedActive) {
                    const parsedActive = JSON.parse(
                        savedActive
                    ) as DashboardAssignment;

                    const validDashboard = parsedDashboards.find(
                        (dashboard) =>
                            dashboard.dashboardKey === parsedActive.dashboardKey &&
                            dashboard.departmentId === parsedActive.departmentId &&
                            dashboard.positionId === parsedActive.positionId
                    );

                    if (validDashboard) {
                        setActiveDashboard(validDashboard);
                    } else {
                        removeAuthItem("activeDashboard");
                    }
                }
            }
        } catch {
            clearAuthSession();
        } finally {
            setLoading(false);
        }
    }, []);

    // Login API. rememberMe chooses localStorage (kept after the browser closes)
    // or sessionStorage (cleared when the browser closes).
    const login = useCallback(async (
        email: string,
        password: string,
        rememberMe = false
    ): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>(
            "/Auth/login",
            { email, password }
        );

        const data = response.data;

        // Include roles inside the authenticated user.
        const authenticatedUser: LoginUser = {
            ...data.user,
            roles: data.roles ?? [],
        };

        // Clear any previous session from both storages before saving the new one.
        clearAuthSession();

        setAuthItem("accessToken", data.accessToken, rememberMe);
        setAuthItem("refreshToken", data.refreshToken, rememberMe);
        setAuthItem("user", JSON.stringify(authenticatedUser), rememberMe);
        setAuthItem("dashboards", JSON.stringify(data.dashboards), rememberMe);

        setUser(authenticatedUser);
        setDashboards(data.dashboards);
        setActiveDashboard(null);

        return data;
    }, []);

    // Only allow dashboards returned by the authenticated API.
    const switchDashboard = useCallback(
        (dashboard: DashboardAssignment): boolean => {
            const allowedDashboard = dashboards.find(
                (item) =>
                    item.dashboardKey === dashboard.dashboardKey &&
                    item.departmentId === dashboard.departmentId &&
                    item.positionId === dashboard.positionId
            );

            if (!allowedDashboard) {
                return false;
            }

            // Keep the active dashboard in the same storage as the rest of the session.
            setAuthItem(
                "activeDashboard",
                JSON.stringify(allowedDashboard),
                isRememberedSession()
            );

            setActiveDashboard(allowedDashboard);

            return true;
        },
        [dashboards]
    );

    // Logout.
    const logout = useCallback(() => {
        clearAuthSession();

        setUser(null);
        setDashboards([]);
        setActiveDashboard(null);
    }, []);

    const value = useMemo(
        () => ({
            user,
            dashboards,
            activeDashboard,
            loading,
            login,
            switchDashboard,
            logout,
        }),
        [
            user,
            dashboards,
            activeDashboard,
            loading,
            login,
            switchDashboard,
            logout,
        ]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider."
        );
    }

    return context;
}
