
import { NavLink } from "react-router-dom";
import {
    Activity,
    ChartColumn,
    ClipboardList,
    FileImage,
    FileText,
    FolderKanban,
    LayoutDashboard,
    ListChecks,
    Monitor,
    Users,
    type LucideIcon,
} from "lucide-react";

import { dashboardMenus } from "../config/dashboardMenus";

interface DashboardSidebarProps {
    dashboardKey: string;
}

const iconMap: Record<string, LucideIcon> = {
    "layout-dashboard": LayoutDashboard,
    users: Users,
    "clipboard-list": ClipboardList,
    "file-text": FileText,
    "chart-column": ChartColumn,
    "folder-kanban": FolderKanban,
    "list-checks": ListChecks,
    "file-image": FileImage,
    monitor: Monitor,
    activity: Activity,
};

export default function DashboardSidebar({
    dashboardKey,
}: DashboardSidebarProps) {
    const groups = dashboardMenus[dashboardKey] ?? [];

    return (
        <aside className="fixed left-0 top-0 hidden h-screen w-64 overflow-y-auto bg-slate-950 text-white md:block">
            <div className="border-b border-slate-800 p-6">
                <h1 className="text-xl font-bold">Company System</h1>
                <p className="mt-1 text-sm text-slate-400">
                    {dashboardKey.replace("/", " / ")}
                </p>
            </div>

            <nav className="space-y-6 p-4">
                {groups.map((group) => (
                    <div key={group.title}>
                        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {group.title}
                        </p>

                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = iconMap[item.icon] ?? LayoutDashboard;
                                const to = `/${dashboardKey}/${item.path}`;

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={to}
                                        end={item.path === "dashboard"}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${isActive
                                                ? "bg-blue-600 text-white"
                                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                            }`
                                        }
                                    >
                                        <Icon size={18} />
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
        </aside>
    );
}
