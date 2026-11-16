import { useCallback, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";

import DashboardSidebar, { type SidebarGroup } from "./DashboardSidebar";
import { useAuth } from "../auth/AuthContext";

const adminGroups: SidebarGroup[] = [
    {
        title: "Overview",
        items: [
            {
                label: "Dashboard",
                to: "/admin/dashboard",
                icon: "layout-dashboard",
                end: true,
            },
        ],
    },
    {
        title: "People",
        items: [
            { label: "Users", to: "/admin/users", icon: "users", end: true },
            {
                label: "Create user",
                to: "/admin/users/new",
                icon: "users",
                end: true,
            },
        ],
    },
    {
        title: "Organization",
        items: [
            {
                label: "Departments",
                to: "/admin/departments",
                icon: "building-2",
            },
            { label: "Positions", to: "/admin/positions", icon: "briefcase" },
        ],
    },
];

// Shell for every System Admin page. Logout lives here only.
export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [navOpen, setNavOpen] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    const closeNav = useCallback(() => {
        setNavOpen(false);
        menuButtonRef.current?.focus();
    }, []);

    const fullName = [user?.firstName, user?.lastName]
        .filter(Boolean)
        .join(" ");
    const initials = [user?.firstName?.charAt(0), user?.lastName?.charAt(0)]
        .filter(Boolean)
        .join("")
        .toUpperCase();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <DashboardSidebar
                id="admin-sidebar"
                title="System Admin"
                subtitle="Company System"
                groups={adminGroups}
                open={navOpen}
                onClose={closeNav}
            />

            <div className="md:pl-64">
                <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            ref={menuButtonRef}
                            type="button"
                            onClick={() => setNavOpen(true)}
                            aria-label="Open navigation menu"
                            aria-controls="admin-sidebar"
                            aria-expanded={navOpen}
                            className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 md:hidden"
                        >
                            <Menu size={20} aria-hidden="true" />
                        </button>

                        <div className="min-w-0">
                            <p className="text-sm text-slate-500">
                                Company System
                            </p>
                            <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">
                                System administration
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-3 border-r border-slate-200 pr-3 sm:flex">
                            <span
                                aria-hidden="true"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white"
                            >
                                {initials || "SA"}
                            </span>

                            <div className="text-left">
                                <p className="text-sm font-medium text-slate-800">
                                    {fullName || "System Admin"}
                                </p>
                                <p className="text-xs text-slate-500">
                                    System Admin
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-blue-600"
                        >
                            <LogOut size={16} aria-hidden="true" />
                            Log out
                        </button>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
