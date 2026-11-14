
export interface DashboardMenuItem {
    label: string;
    path: string;
    icon: string;
}

export interface DashboardMenuGroup {
    title: string;
    items: DashboardMenuItem[];
}

export const dashboardMenus: Record<string, DashboardMenuGroup[]> = {
    "Sales/AccountManager": [
        {
            title: "Sales Management",
            items: [
                { label: "Dashboard", path: "dashboard", icon: "layout-dashboard" },
                { label: "My Customers", path: "customers", icon: "users" },
                { label: "Sales Activities", path: "activities", icon: "clipboard-list" },
                { label: "Quotations", path: "quotations", icon: "file-text" },
                { label: "Sales Reports", path: "reports", icon: "chart-column" },
            ],
        },
    ],

    "Sales/SalesOfficer": [
        {
            title: "Sales Operations",
            items: [
                { label: "Dashboard", path: "dashboard", icon: "layout-dashboard" },
                { label: "My Activities", path: "activities", icon: "clipboard-list" },
                { label: "Customer Follow-ups", path: "follow-ups", icon: "users" },
                { label: "Sales Records", path: "sales-records", icon: "file-text" },
            ],
        },
    ],

    "Design/DepartmentHead": [
        {
            title: "Design Management",
            items: [
                { label: "Dashboard", path: "dashboard", icon: "layout-dashboard" },
                { label: "Employees", path: "employees", icon: "users" },
                { label: "Design Projects", path: "projects", icon: "folder-kanban" },
                { label: "Task Management", path: "tasks", icon: "list-checks" },
                { label: "Department Reports", path: "reports", icon: "chart-column" },
            ],
        },
    ],

    "Design/DesignSpecialist": [
        {
            title: "My Workspace",
            items: [
                { label: "Dashboard", path: "dashboard", icon: "layout-dashboard" },
                { label: "My Projects", path: "projects", icon: "folder-kanban" },
                { label: "My Tasks", path: "tasks", icon: "list-checks" },
                { label: "Design Files", path: "design-files", icon: "file-image" },
            ],
        },
    ],

    "IT/DepartmentHead": [
        {
            title: "IT Management",
            items: [
                { label: "Dashboard", path: "dashboard", icon: "layout-dashboard" },
                { label: "IT Employees", path: "employees", icon: "users" },
                { label: "IT Tasks", path: "tasks", icon: "list-checks" },
                { label: "IT Requests", path: "requests", icon: "clipboard-list" },
                { label: "Equipment", path: "equipment", icon: "monitor" },
                { label: "IT Reports", path: "reports", icon: "chart-column" },
            ],
        },
    ],

    "IT/ITLead": [
        {
            title: "IT Operations",
            items: [
                { label: "Dashboard", path: "dashboard", icon: "layout-dashboard" },
                { label: "Team Tasks", path: "tasks", icon: "list-checks" },
                { label: "Technical Requests", path: "requests", icon: "clipboard-list" },
                { label: "System Monitoring", path: "monitoring", icon: "activity" },
            ],
        },
    ],
};
