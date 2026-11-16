import { useNavigate } from "react-router-dom";
import {
    BriefcaseBusiness,
    Palette,
    Monitor,
    ArrowRight,
    LogOut,
    type LucideIcon,
} from "lucide-react";

import { useAuth } from "../../auth/AuthContext";
import type { DashboardAssignment } from "../../auth/auth.types";
import { revokeRefreshToken } from "../../auth/signOut";

const departmentIcons: Record<string, LucideIcon> = {
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
        logout,
    } = useAuth();

    const handleLogout = async () => {
        await revokeRefreshToken();
        logout();
        navigate("/login", { replace: true });
    };

    const handleSelect = (dashboard: DashboardAssignment) => {
        const success = switchDashboard(dashboard);

        if (!success) {
            return;
        }

        navigate(`/${dashboard.dashboardKey}/dashboard`);
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="mx-auto w-full max-w-5xl px-4 py-10 md:px-8 md:py-14">
                <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-slate-500">
                            Company Management System
                        </p>

                        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                            Welcome, {user?.firstName}
                        </h1>

                        <p className="mt-2 text-sm text-slate-500 md:text-base">
                            Choose a department and position to continue.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void handleLogout()}
                        aria-label="Log out"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                        <LogOut size={16} aria-hidden="true" />
                        Log out
                    </button>
                </header>

                {dashboards.length > 0 ? (
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {dashboards.map((dashboard) => {
                            const Icon =
                                departmentIcons[dashboard.departmentCode] ??
                                BriefcaseBusiness;

                            return (
                                <li key={`${dashboard.departmentId}-${dashboard.positionId}`}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(dashboard)}
                                        className="group flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                                <Icon size={22} aria-hidden="true" />
                                            </span>

                                            <ArrowRight
                                                size={18}
                                                aria-hidden="true"
                                                className="mt-1 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-700"
                                            />
                                        </div>

                                        <h2 className="mt-5 text-lg font-semibold text-slate-900">
                                            {dashboard.departmentName}
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {dashboard.positionName}
                                        </p>

                                        {dashboard.isPrimary && (
                                            <span className="mt-auto self-start pt-4">
                                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                                    Primary department
                                                </span>
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <h2 className="font-semibold text-slate-900">
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
