
import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { dashboardMenus } from "../config/dashboardMenus";
import { dashboardRoutes } from "../config/dashboardRoutes";
import { useAuth } from "../auth/AuthContext";

export default function DashboardSection() {
    const { department, position, page } = useParams();

    const {
        dashboards,
        switchDashboard,
    } = useAuth();

    const dashboardKey =
        department && position
            ? `${department}/${position}`
            : "";

    // Confirm this is a registered dashboard.
    const registeredDashboard = dashboardRoutes.find(
        route => route.key === dashboardKey
    );

    // Confirm this user actually has the assignment.
    const assignment = dashboards.find(
        dashboard => dashboard.dashboardKey === dashboardKey
    );

    const groups = dashboardMenus[dashboardKey] ?? [];

    const selectedItem = groups
        .flatMap(group => group.items)
        .find(item => item.path === page);

    useEffect(() => {
        if (assignment) {
            switchDashboard(assignment);
        }
    }, [
        assignment?.dashboardKey,
        assignment?.departmentId,
        assignment?.positionId,
        switchDashboard,
    ]);

    // Invalid or unassigned dashboard.
    if (
        !department ||
        !position ||
        !page ||
        !registeredDashboard ||
        !assignment
    ) {
        return <Navigate to="/no-dashboard" replace />;
    }

    // Dashboard home is handled by its own dashboard component.
    if (!selectedItem || page === "dashboard") {
        return (
            <Navigate
                to={`/${registeredDashboard.path}/dashboard`}
                replace
            />
        );
    }

    return (
        <DashboardLayout
            department={department}
            position={position}
        >
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-sm font-medium text-blue-600">
                    {department} Department
                </p>

                <h1 className="mt-2 text-2xl font-bold text-slate-800">
                    {selectedItem.label}
                </h1>

                <p className="mt-3 text-slate-500">
                    This section is ready for implementation.
                </p>
            </div>
        </DashboardLayout>
    );
}
