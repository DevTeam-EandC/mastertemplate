
import { useEffect, type ComponentType } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import { useAuth } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";

// Authentication Pages
import Login from "./pages/Login/Login";
import DashboardSelection from "./pages/DashboardSelection/DashboardSelection";
import DashboardSection from "./pages/DashboardSection";
import NoDashboard from "./pages/NoDashboard";

// Admin Components
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserManagement from "./pages/Admin/UserManagement";
import CreateUser from "./pages/Admin/CreateUser";
import DepartmentManagement from "./pages/Admin/DepartmentManagement";
import PositionManagement from "./pages/Admin/PositionManagement";
import EditUser from "./pages/Admin/EditUser";

// Dashboard Configuration
import { dashboardRoutes } from "./config/dashboardRoutes";

// Sales - Account Manager
import ClientProfileList from "./Dashboards/Sales/AccountManager/ClientProfileList";
import ClientProfileForm from "./Dashboards/Sales/AccountManager/customers/ClientProfileForm";
import ClientProfileView from "./Dashboards/Sales/AccountManager/ClientProfileView";
import ProjectList from "./Dashboards/Sales/AccountManager/ProjectList";
import ProjectDetailsForm from "./Dashboards/Sales/AccountManager/projects/ProjectDetailsForm";
// Design - Design Specialist
import DesignClientReferences from "./Dashboards/Design/DesignSpecialist/ClientReferences";

// Authorized Dashboard Component
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

// Application Routes
function AppRoutes() {
    return (
        <Routes>
            {/* ============================= */}
            {/* PUBLIC ROUTES */}
            {/* ============================= */}

            <Route
                path="/login"
                element={<Login />}
            />

            {/* ============================= */}
            {/* AUTHENTICATED ROUTES */}
            {/* ============================= */}

            <Route element={<RequireAuth />}>
                {/* Dashboard Selection */}
                <Route
                    path="/select-dashboard"
                    element={<DashboardSelection />}
                />

                {/* No Dashboard Assigned */}
                <Route
                    path="/no-dashboard"
                    element={<NoDashboard />}
                />

                {/* ============================= */}
                {/* SYSTEM ADMIN ROUTES */}
                {/* ============================= */}

                <Route
                    path="/admin"
                    element={
                        <RequireAuth requiredRole="System Admin">
                            <AdminLayout />
                        </RequireAuth>
                    }
                >
                    <Route
                        index
                        element={<Navigate to="dashboard" replace />}
                    />

                    <Route
                        path="dashboard"
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="users"
                        element={<UserManagement />}
                    />

                    <Route
                        path="users/new"
                        element={<CreateUser />}
                    />

                    <Route
                        path="users/:id/edit"
                        element={<EditUser />}
                    />

                    <Route
                        path="departments"
                        element={<DepartmentManagement />}
                    />

                    <Route
                        path="positions"
                        element={<PositionManagement />}
                    />
                </Route>

                {/* ============================= */}
                {/* POSITION-SPECIFIC DASHBOARDS */}
                {/* ============================= */}

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

                {/* ============================= */}
                {/* SALES - ACCOUNT MANAGER */}
                {/* ============================= */}

                {/* Customer List */}
                <Route
                    path="/Sales/AccountManager/customers"
                    element={<ClientProfileList />}
                />

                {/* Create New Client */}
                <Route
                    path="/Sales/AccountManager/customers/new"
                    element={<ClientProfileForm />}
                />

                {/* Edit Existing Client */}
                <Route
                    path="/Sales/AccountManager/customers/:id/edit"
                    element={<ClientProfileForm />}
                />

                {/* View Client Profile */}
                <Route
                    path="/Sales/AccountManager/customers/:id"
                    element={<ClientProfileView />}
                />
                <Route
                    path="/Sales/AccountManager/projects"
                    element={<ProjectList />}
                />

                {/* Add a project to a client */}
                <Route
                    path="/Sales/AccountManager/projects/new/:clientId"
                    element={<ProjectDetailsForm />}
                />

                {/* ============================= */}
                {/* DESIGN - DESIGN SPECIALIST */}
                {/* ============================= */}

                <Route
                    path="/Design/DesignSpecialist/client-references"
                    element={<DesignClientReferences />}
                />

                {/* ============================= */}
                {/* GENERIC DASHBOARD SECTION */}
                {/* ============================= */}

                <Route
                    path="/:department/:position/:page"
                    element={<DashboardSection />}
                />
            </Route>

            {/* ============================= */}
            {/* UNKNOWN ROUTES */}
            {/* ============================= */}

            <Route
                path="*"
                element={<Navigate to="/login" replace />}
            />
        </Routes>
    );
}

// Main Application
export default function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}
