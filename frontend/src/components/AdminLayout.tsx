import { Outlet } from "react-router-dom";

import DashboardShell from "./DashboardShell";
import type { SidebarGroup } from "./DashboardSidebar";

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

// Shell for every System Admin page. Sidebar, sign-out and the hide/show toggle come from DashboardShell.
export default function AdminLayout() {
    return (
        <DashboardShell
            sidebarId="admin-sidebar"
            sidebarTitle="System Admin"
            sidebarSubtitle="Company System"
            groups={adminGroups}
            eyebrow="Company System"
            heading="System administration"
            roleLabel="System Admin"
            showSwitch={false}
        >
            <Outlet />
        </DashboardShell>
    );
}
