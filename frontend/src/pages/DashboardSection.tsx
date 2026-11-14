
import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import { dashboardMenus } from "../config/dashboardMenus";
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

    const assignment = dashboards.find(
        (dashboard) => dashboard.dashboardKey === dashboardKey
    );

    const groups = dashboardMenus[dashboardKey] ?? [];

    const selectedItem = groups
        .flatMap((group) => group.items)
        .find((item) => item.path === page);

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

    if (!department || !position || !page || !assignment) {
        return <Navigate to="/select-dashboard" replace />;
    }

    if (!selectedItem || page === "dashboard") {
        return <Navigate to={`/${dashboardKey}/dashboard`} replace />;
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
