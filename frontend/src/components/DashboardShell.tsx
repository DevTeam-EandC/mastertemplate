import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowLeftRight, Menu, PanelLeft } from "lucide-react";

import DashboardSidebar, { type SidebarGroup } from "./DashboardSidebar";
import { useAuth } from "../auth/AuthContext";
import { revokeRefreshToken } from "../auth/signOut";
import ThemeToggle from "./ThemeToggle";

const SIDEBAR_STORAGE_KEY = "sidebarCollapsed";

// Remembers whether the desktop sidebar is hidden. Storage can be blocked,
// so any failure falls back to the sidebar being visible.
function readSidebarPreference(): boolean {
    try {
        return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
    } catch {
        return false;
    }
}

interface DashboardShellProps {
    sidebarId: string;
    sidebarTitle: string;
    sidebarSubtitle: string;
    groups: SidebarGroup[];
    eyebrow: string;
    heading: string;
    roleLabel: string;
    showSwitch: boolean;
    children: ReactNode;
}

// Shared page frame for every signed-in dashboard: sidebar, header, sign-out and content.
// Below md the sidebar is a drawer. From md up it can be hidden and shown again.
export default function DashboardShell({
    sidebarId,
    sidebarTitle,
    sidebarSubtitle,
    groups,
    eyebrow,
    heading,
    roleLabel,
    showSwitch,
    children,
}: DashboardShellProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [navOpen, setNavOpen] = useState(false);
    const [collapsed, setCollapsed] = useState<boolean>(readSidebarPreference);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        try {
            localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
        } catch {
            // Storage unavailable: the preference only lasts for this page view.
        }
    }, [collapsed]);

    // Close the drawer and return focus to the button that opened it.
    const closeNav = useCallback(() => {
        setNavOpen(false);
        menuButtonRef.current?.focus();
    }, []);

    const toggleSidebar = useCallback(() => {
        setCollapsed((value) => !value);
    }, []);

    const fullName = [user?.firstName, user?.lastName]
        .filter(Boolean)
        .join(" ");
    const initials = [user?.firstName?.charAt(0), user?.lastName?.charAt(0)]
        .filter(Boolean)
        .join("")
        .toUpperCase();

    const handleLogout = async () => {
        await revokeRefreshToken();
        logout();
        navigate("/login", { replace: true });
    };

    const sidebarToggleLabel = collapsed ? "Show sidebar" : "Hide sidebar";

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <DashboardSidebar
                id={sidebarId}
                title={sidebarTitle}
                subtitle={sidebarSubtitle}
                groups={groups}
                open={navOpen}
                collapsed={collapsed}
                onClose={closeNav}
                onLogout={() => void handleLogout()}
            />

            <div
                className={`transition-[padding] duration-200 ease-out motion-reduce:transition-none ${
                    collapsed ? "md:pl-0" : "md:pl-64"
                }`}
            >
                <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            ref={menuButtonRef}
                            type="button"
                            onClick={() => setNavOpen(true)}
                            aria-label="Open navigation menu"
                            aria-controls={sidebarId}
                            aria-expanded={navOpen}
                            className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 md:hidden"
                        >
                            <Menu size={20} aria-hidden="true" />
                        </button>

                        <button
                            type="button"
                            onClick={toggleSidebar}
                            aria-label={sidebarToggleLabel}
                            aria-controls={sidebarId}
                            aria-expanded={!collapsed}
                            title={sidebarToggleLabel}
                            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 md:inline-flex"
                        >
                            <PanelLeft size={18} aria-hidden="true" />
                        </button>

                        <div className="min-w-0">
                            <p className="truncate text-sm text-slate-500">{eyebrow}</p>
                            <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">
                                {heading}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <ThemeToggle />

                        {showSwitch && (
                            <NavLink
                                to="/select-dashboard"
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600"
                            >
                                <ArrowLeftRight size={16} aria-hidden="true" />
                                <span className="hidden sm:inline">Switch dashboard</span>
                                <span className="sm:hidden">Switch</span>
                            </NavLink>
                        )}

                        <div className="flex items-center gap-3 border-l border-slate-200 pl-2 sm:pl-3">
                            <span
                                aria-hidden="true"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white"
                            >
                                {initials || "?"}
                            </span>

                            <div className="hidden text-left lg:block">
                                <p className="text-sm font-medium text-slate-800">
                                    {fullName || "Signed in"}
                                </p>
                                <p className="text-xs text-slate-500">{roleLabel}</p>
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
