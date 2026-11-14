
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
            {/* Public login */}
            <Route path="/login" element={<Login />} />

            {/* Protected pages */}
            <Route element={<RequireAuth />}>
                {/* Dashboard selector */}
                <Route
                    path="/select-dashboard"
                    element={<DashboardSelection />}
                />

                {/* No dashboard assigned */}
                <Route
                    path="/no-dashboard"
                    element={<div>No dashboard assigned. Please contact your administrator.</div>}
                />

                {/* Position-specific dashboards */}
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

                {/* Dashboard section pages */}
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
