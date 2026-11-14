
import { useEffect, type ComponentType } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import { useAuth } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";

import Login from "./pages/Login/Login";
import DashboardSelection from "./pages/DashboardSelection/DashboardSelection";
import DashboardSection from "./pages/DashboardSection";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserManagement from "./pages/Admin/UserManagement";

import { dashboardRoutes } from "./config/dashboardRoutes";

export function AuthorizedDashboard({
    routeKey,
    component: Dashboard,
}: {
    routeKey: string;
    component: ComponentType;
}) {
    const {
        dashboards,
        activeDashboard,
        switchDashboard,
    } = useAuth();

    const assignment = dashboards.find(
        (dashboard) => dashboard.dashboardKey === routeKey
    );

    useEffect(() => {
        if (
            assignment &&
            activeDashboard?.dashboardKey !== assignment.dashboardKey
        ) {
            switchDashboard(assignment);
        }
    }, [
        assignment?.dashboardKey,
        assignment?.departmentId,
        assignment?.positionId,
        activeDashboard?.dashboardKey,
        switchDashboard,
    ]);

    if (!assignment) {
        return <Navigate to="/select-dashboard" replace />;
    }

    return <Dashboard />;
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Authenticated Routes */}
            <Route element={<RequireAuth />}>

                <Route
                    path="/select-dashboard"
                    element={<DashboardSelection />}
                />

                <Route
                    path="/no-dashboard"
                    element={
                        <div className="flex min-h-screen items-center justify-center">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-slate-800">
                                    No Dashboard Assigned
                                </h1>

                                <p className="mt-2 text-slate-500">
                                    Please contact your administrator.
                                </p>
                            </div>
                        </div>
                    }
                />

                {/* Admin Routes */}
                <Route path="/admin">
                    <Route
                        path="dashboard"
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="users"
                        element={<UserManagement />}
                    />
                </Route>

                {/* Position-Specific Dashboards */}
                {dashboardRoutes.map((route) => (
                    <Route
                        key={route.key}
                        path={`/${route.path}/dashboard`}
                        element={
                            <AuthorizedDashboard
                                routeKey={route.key}
                                component={route.component}
                            />
                        }
                    />
                ))}

                {/* Dashboard Section Pages */}
                <Route
                    path="/:department/:position/:page"
                    element={<DashboardSection />}
                />

            </Route>

            {/* Unknown URL */}
            <Route
                path="*"
                element={<Navigate to="/login" replace />}
            />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}
