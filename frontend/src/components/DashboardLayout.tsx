    import { useMemo } from "react";
import type { ReactNode } from "react";

import DashboardShell from "./DashboardShell";
import type { SidebarGroup } from "./DashboardSidebar";
import { dashboardMenus } from "../config/dashboardMenus";

interface DashboardLayoutProps {
    department: string;
    position: string;
    children: ReactNode;
}

// Shared shell for department and executive dashboards.
// Sidebar, sign-out and the hide/show toggle come from DashboardShell.
export default function DashboardLayout({
    department,
    position,
    children,
}: DashboardLayoutProps) {
    const dashboardKey = `${department}/${position}`;
    const positionLabel = position.replace(/([A-Z])/g, " $1").trim();

    const groups = useMemo<SidebarGroup[]>(
        () =>
            (dashboardMenus[dashboardKey] ?? []).map((group) => ({
                title: group.title,
                items: group.items.map((item) => ({
                    label: item.label,
                    to: `/${dashboardKey}/${item.path}`,
                    icon: item.icon,
                    end: item.path === "dashboard",
                })),
            })),
        [dashboardKey]
    );

    return (
        <DashboardShell
            sidebarId="dashboard-sidebar"
            sidebarTitle="Company System"
            sidebarSubtitle={`${department} · ${positionLabel}`}
            groups={groups}
            eyebrow={`${department} department`}
            heading={positionLabel}
            roleLabel={positionLabel}
            showSwitch={dashboardKey !== "Sales/AccountManager"}  
        >
            {children}
        </DashboardShell>
    );
}
