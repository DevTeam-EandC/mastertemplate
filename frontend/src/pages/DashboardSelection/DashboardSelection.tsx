
import { useNavigate } from "react-router-dom";
import {
    BriefcaseBusiness,
    Palette,
    Monitor,
    ArrowRight,
} from "lucide-react";

import { useAuth } from "../../auth/AuthContext";
import type { DashboardAssignment } from "../../auth/auth.types";

const departmentIcons: Record<string, typeof BriefcaseBusiness> = {
    SALES: BriefcaseBusiness,
    DESIGN: Palette,
    IT: Monitor,
};

export default function DashboardSelection() {
    const navigate = useNavigate();

    const {
        user,
        dashboards,
        switchDashboard,
    } = useAuth();

    const handleSelect = (dashboard: DashboardAssignment) => {
        const success = switchDashboard(dashboard);

        if (!success) {
            return;
        }

        navigate(`/${dashboard.dashboardKey}/dashboard`);
    };

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <p className="text-sm font-medium text-blue-600">
                        Company Management System
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-800">
                        Welcome, {user?.firstName}
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Select a department and position to continue.
                    </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {dashboards.map((dashboard) => {
                        const Icon =
                            departmentIcons[dashboard.departmentCode] ??
                            BriefcaseBusiness;

                        return (
                            <button
                                key={`${dashboard.departmentId}-${dashboard.positionId}`}
                                type="button"
                                onClick={() => handleSelect(dashboard)}
                                className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-md"
                            >
                                <div className="mb-5 flex items-center justify-between">
                                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                                        <Icon size={26} />
                                    </div>

                                    <ArrowRight
                                        size={20}
                                        className="text-slate-400"
                                    />
                                </div>

                                <h2 className="text-xl font-bold text-slate-800">
                                    {dashboard.departmentName}
                                </h2>

                                <p className="mt-1 text-slate-500">
                                    {dashboard.positionName}
                                </p>

                                {dashboard.isPrimary && (
                                    <span className="mt-4 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                        Primary Department
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {dashboards.length === 0 && (
                    <div className="rounded-xl bg-white p-8 text-center">
                        <h2 className="font-semibold text-slate-800">
                            No department assignments
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Please contact your System Administrator.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
