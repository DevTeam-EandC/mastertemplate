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
import NoDashboard from "./pages/NoDashboard";

import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserManagement from "./pages/Admin/UserManagement";
import CreateUser from "./pages/Admin/CreateUser";
import DepartmentManagement from "./pages/Admin/DepartmentManagement";
import PositionManagement from "./pages/Admin/PositionManagement";
import EditUser from "./pages/Admin/EditUser";

import { dashboardRoutes } from "./config/dashboardRoutes";
import ClientProfileList from "./Dashboards/Sales/AccountManager/ClientProfileList";
import ClientProfileForm from "./Dashboards/Sales/AccountManager/ClientProfileForm";
import DesignClientReferences from "./Dashboards/Design/DesignSpecialist/ClientReferences";

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
        return <Navigate to="/no-dashboard" replace />;
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
                    element={<NoDashboard />}
                />

                {/* System Admin Routes: one shared layout with logout */}
                <Route
                    path="/admin"
                    element={
                        <RequireAuth requiredRole="System Admin">
                            <AdminLayout />
                        </RequireAuth>
                    }
                >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="users/new" element={<CreateUser />} />
                    <Route path="users/:id/edit" element={<EditUser />} />
                    <Route path="departments" element={<DepartmentManagement />} />
                    <Route path="positions" element={<PositionManagement />} />
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

                {/* Sales: client profiles. Must sit before the generic section route. */}
                <Route
                    path="/Sales/AccountManager/customers"
                    element={<ClientProfileList />}
                />
                <Route
                    path="/Sales/AccountManager/customers/new"
                    element={<ClientProfileForm />}
                />
                <Route
                    path="/Sales/AccountManager/customers/:id/edit"
                    element={<ClientProfileForm />}
                />

                {/* Design: client references sent from Sales. */}
                <Route
                    path="/Design/DesignSpecialist/client-references"
                    element={<DesignClientReferences />}
                />

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
