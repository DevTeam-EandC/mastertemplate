import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import {
    Activity,
    Briefcase,
    Building2,
    ChartColumn,
    ClipboardList,
    FileImage,
    FileText,
    FolderKanban,
    LayoutDashboard,
    ListChecks,
    LogOut, 
    Megaphone,
    Monitor,
    ShieldCheck,
    Users,
    Wallet,
    X,
    type LucideIcon,
} from "lucide-react";

export interface SidebarItem {
    label: string;
    to: string;
    icon: string;
    end?: boolean;
}

export interface SidebarGroup {
    title: string;
    items: SidebarItem[];
}

interface DashboardSidebarProps {
    id: string;
    title: string;
    subtitle: string;
    groups: SidebarGroup[];
    open: boolean;
    collapsed: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const iconMap: Record<string, LucideIcon> = {
    "layout-dashboard": LayoutDashboard,
    users: Users,
    "clipboard-list": ClipboardList,
    "clipboard-check": ClipboardList,
    "file-text": FileText,
    "chart-column": ChartColumn,
    "chart-line": ChartColumn,
    "file-chart-column": ChartColumn,
    "folder-kanban": FolderKanban,
    "list-checks": ListChecks,
    "file-image": FileImage,
    monitor: Monitor,
    activity: Activity,
    "building-2": Building2,
    briefcase: Briefcase,
    wallet: Wallet,
    megaphone: Megaphone,
    "shield-check": ShieldCheck,
};

// Below md the sidebar is an off-canvas drawer. From md up it is always visible.
// Open/close state lives in the parent layout; this component handles Escape,
// initial focus and the backdrop.
export default function DashboardSidebar({
    id,
    title,
    subtitle,
    groups,
    open,
    collapsed,
    onClose,
    onLogout,
}: DashboardSidebarProps) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        closeButtonRef.current?.focus();

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    const panelState = open
        ? "visible translate-x-0"
        : "invisible -translate-x-full";

    // Desktop: the sidebar can be hidden with the header toggle.
    const desktopState = collapsed
        ? "md:invisible md:-translate-x-full"
        : "md:visible md:translate-x-0";

    return (
        <>
            {open && (
                <div
                    aria-hidden="true"
                    onClick={onClose}
                    className="fixed inset-0 z-30 bg-slate-900/50 md:hidden"
                />
            )}

            <aside
                id={id}
                aria-label={`${title} navigation`}
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-white transition-[transform,visibility] duration-200 ease-out motion-reduce:transition-none ${desktopState} ${panelState}`}
            >
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-5 py-5">
                    <div className="min-w-0">
                        <p className="text-base font-semibold tracking-tight">
                            {title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-400">
                            {subtitle}
                        </p>
                    </div>

                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Close navigation menu"
                        className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-400 md:hidden"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                <nav className="flex-1 space-y-6 overflow-y-auto p-3">
                    {groups.map((group) => (
                        <div key={group.title}>
                            <p className="mb-2 px-3 text-xs font-medium text-slate-500">
                                {group.title}
                            </p>

                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const Icon = iconMap[item.icon] ?? LayoutDashboard;

                                    return (
                                        <NavLink
                                            key={item.to}
                                            to={item.to}
                                            end={item.end}
                                            onClick={onClose}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${isActive
                                                    ? "bg-blue-600 text-white"
                                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                                }`
                                            }
                                        >
                                            <Icon size={18} aria-hidden="true" />
                                            {item.label}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
                {/* Sidebar footer: Logout stays at the bottom */}
                <div className="mt-auto border-t border-slate-800 p-3">
                    <button
                        type="button"
                        onClick={onLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                    >
                        <LogOut size={18} aria-hidden="true" />
                        <span>Log out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
