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
            const savedUser = localStorage.getItem("user");
            const savedDashboards = localStorage.getItem("dashboards");
            const savedActive = localStorage.getItem("activeDashboard");
            const token = localStorage.getItem("accessToken");

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
                        localStorage.removeItem("activeDashboard");
                    }
                }
            }
        } catch {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            localStorage.removeItem("dashboards");
            localStorage.removeItem("activeDashboard");
        } finally {
            setLoading(false);
        }
    }, []);

    // Login API.
    const login = async (
        email: string,
        password: string
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

        // Save authentication information.
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        localStorage.setItem(
            "user",
            JSON.stringify(authenticatedUser)
        );

        localStorage.setItem(
            "dashboards",
            JSON.stringify(data.dashboards)
        );

        localStorage.removeItem("activeDashboard");

        setUser(authenticatedUser);
        setDashboards(data.dashboards);
        setActiveDashboard(null);

        return data;
    };

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

            localStorage.setItem(
                "activeDashboard",
                JSON.stringify(allowedDashboard)
            );

            setActiveDashboard(allowedDashboard);

            return true;
        },
        [dashboards]
    );

    // Logout.
    const logout = useCallback(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("dashboards");
        localStorage.removeItem("activeDashboard");

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
