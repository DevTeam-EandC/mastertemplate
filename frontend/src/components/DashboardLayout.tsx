
import { NavLink } from "react-router-dom";
import { ArrowLeftRight, LogOut } from "lucide-react";
import type { ReactNode } from "react";

import DashboardSidebar from "./DashboardSidebar";
import { useAuth } from "../auth/AuthContext";

interface DashboardLayoutProps {
    department: string;
    position: string;
    children: ReactNode;
}

export default function DashboardLayout({
    department,
    position,
    children,
}: DashboardLayoutProps) {
    const { user, logout } = useAuth();

    const dashboardKey = `${department}/${position}`;

    return (
        <div className="min-h-screen bg-slate-100">
            <DashboardSidebar dashboardKey={dashboardKey} />

            <div className="md:pl-64">
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
                    <div>
                        <p className="text-sm text-slate-500">
                            {department} Department
                        </p>
                        <h2 className="text-lg font-semibold text-slate-800">
                            {position.replace(/([A-Z])/g, " $1").trim()}
                        </h2>
                        <p className="text-xs text-slate-400">
                            {user?.firstName} {user?.lastName}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <NavLink
                            to="/select-dashboard"
                            className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                            <ArrowLeftRight size={16} />
                            Switch Dashboard
                        </NavLink>

                        <button
                            type="button"
                            onClick={logout}
                            className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </header>

                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
