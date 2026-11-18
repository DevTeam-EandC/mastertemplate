
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    Menu,
    X,
    UserRound,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

export default function AccountManagerSidebar() {
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const linkClass = (active: boolean) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`;

    const customerActive = location.pathname.includes("/customers");
    const projectActive = location.pathname.includes("/projects");

    const navigation = (
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
            {!collapsed && (
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Main Menu
                </p>
            )}

            <NavLink
                to="/Sales/AccountManager/dashboard"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                    linkClass(isActive || location.pathname.endsWith("/AccountManager"))
                }
                title="Dashboard"
            >
                <LayoutDashboard size={20} />
                {!collapsed && <span>Dashboard</span>}
            </NavLink>

            <NavLink
                to="/Sales/AccountManager/customers"
                onClick={() => setMobileOpen(false)}
                className={() => linkClass(customerActive)}
                title="Customers"
            >
                <Users size={20} />
                {!collapsed && <span>Customers</span>}
            </NavLink>

            <NavLink
                to="/Sales/AccountManager/projects"
                onClick={() => setMobileOpen(false)}
                className={() => linkClass(projectActive)}
                title="Projects"
            >
                <FolderKanban size={20} />
                {!collapsed && <span>Projects</span>}
            </NavLink>
        </nav>
    );

    const sidebarContent = (
        <>
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
                {!collapsed && (
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">ECSIS</h1>
                        <p className="text-xs text-gray-500">Sales Department</p>
                    </div>
                )}

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                    aria-label="Close sidebar"
                >
                    <X size={20} />
                </button>
            </div>

            {!collapsed && (
                <div className="px-5 py-5 border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserRound className="text-blue-600" size={21} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">
                                Account Manager
                            </p>
                            <p className="text-xs text-gray-500">Sales</p>
                        </div>
                    </div>
                </div>
            )}

            {navigation}

            <div className="p-4 border-t border-gray-200 shrink-0">
                {!collapsed && (
                    <p className="text-xs text-gray-400 text-center">
                        ECSIS Company Workflow System
                    </p>
                )}
            </div>
        </>
    );

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
                aria-label="Open sidebar"
            >
                <Menu size={22} />
            </button>

            {/* Desktop sidebar */}
            <aside
                className={`hidden lg:flex flex-col h-screen sticky top-0 shrink-0 bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? "w-20" : "w-64"
                    }`}
            >
                {sidebarContent}
            </aside>

            {/* Mobile sidebar */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <aside className="w-72 max-w-[85vw] h-full flex flex-col bg-white shadow-xl">
                        {sidebarContent}
                    </aside>

                    <button
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 bg-black/40"
                        aria-label="Close sidebar overlay"
                    />
                </div>
            )}
        </>
    );
}
