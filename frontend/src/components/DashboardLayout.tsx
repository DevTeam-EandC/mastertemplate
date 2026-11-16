import { useCallback, useRef, useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { ArrowLeftRight, Menu } from "lucide-react";

import DashboardSidebar, { type SidebarGroup } from "./DashboardSidebar";
import { useAuth } from "../auth/AuthContext";
import { dashboardMenus } from "../config/dashboardMenus";

interface DashboardLayoutProps {
    department: string;
    position: string;
    children: ReactNode;
}

// Shared shell for department and executive dashboards.
// Department users can switch dashboards but cannot log out from here.
export default function DashboardLayout({
    department,
    position,
    children,
}: DashboardLayoutProps) {
    const { user } = useAuth();
    const [navOpen, setNavOpen] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    const dashboardKey = `${department}/${position}`;
    const positionLabel = position.replace(/([A-Z])/g, " $1").trim();
    const fullName = [user?.firstName, user?.lastName]
        .filter(Boolean)
        .join(" ");
    const initials = [user?.firstName?.charAt(0), user?.lastName?.charAt(0)]
        .filter(Boolean)
        .join("")
        .toUpperCase();

    const groups: SidebarGroup[] = (dashboardMenus[dashboardKey] ?? []).map(
        (group) => ({
            title: group.title,
            items: group.items.map((item) => ({
                label: item.label,
                to: `/${dashboardKey}/${item.path}`,
                icon: item.icon,
                end: item.path === "dashboard",
            })),
        })
    );

    // Close the drawer and return focus to the button that opened it.
    const closeNav = useCallback(() => {
        setNavOpen(false);
        menuButtonRef.current?.focus();
    }, []);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <DashboardSidebar
                id="dashboard-sidebar"
                title="Company System"
                subtitle={`${department} · ${positionLabel}`}
                groups={groups}
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
                            aria-controls="dashboard-sidebar"
                            aria-expanded={navOpen}
                            className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 md:hidden"
                        >
                            <Menu size={20} aria-hidden="true" />
                        </button>

                        <div className="min-w-0">
                            <p className="truncate text-sm text-slate-500">
                                {department} department
                            </p>
                            <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">
                                {positionLabel}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <NavLink
                            to="/select-dashboard"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600"
                        >
                            <ArrowLeftRight size={16} aria-hidden="true" />
                            <span className="hidden sm:inline">Switch dashboard</span>
                            <span className="sm:hidden">Switch</span>
                        </NavLink>

                        <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
                            <span
                                aria-hidden="true"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white"
                            >
                                {initials || "?"}
                            </span>

                            <div className="hidden text-left md:block">
                                <p className="text-sm font-medium text-slate-800">
                                    {fullName || "Signed in"}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {positionLabel}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
