
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
    // SALES DEPARTMENT
    "Sales/AccountManager": [
        {
            title: "Sales Management",
            items: [
                { label: "Dashboard", path: "dashboard", icon: "layout-dashboard" },
                { label: "Client Profiles", path: "customers", icon: "users" },
                { label: "Projects", path: "projects", icon: "folder-kanban" },
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

    // DESIGN DEPARTMENT
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
                { label: "Client References", path: "client-references", icon: "file-text" },
                { label: "My Tasks", path: "tasks", icon: "list-checks" },
                { label: "Design Files", path: "design-files", icon: "file-image" },
            ],
        },
    ],

    // IT DEPARTMENT
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

    // PURCHASING DEPARTMENT
    "Purchasing/PurchasingHead": [
        {
            title: "Purchasing Management",
            items: [
                { label: "Dashboard", path: "dashboard", icon: "layout-dashboard" },
                { label: "Purchase Requests", path: "requests", icon: "clipboard-list" },
                { label: "Suppliers", path: "suppliers", icon: "users" },
                { label: "Purchase Orders", path: "orders", icon: "file-text" },
                { label: "Purchasing Reports", path: "reports", icon: "chart-column" },
            ],
        },
    ],

    // OPERATIONS DEPARTMENT
    "Operations/OperationsHead": [
        {
            title: "Operations Management",
            items: [
                { label: "Dashboard", path: "dashboard", icon: "layout-dashboard" },
                { label: "Operation Requests", path: "requests", icon: "clipboard-list" },
                { label: "Active Operations", path: "operations", icon: "list-checks" },
                { label: "Operational Issues", path: "issues", icon: "activity" },
                { label: "Operations Reports", path: "reports", icon: "chart-column" },
            ],
        },
    ],

    // EXECUTIVE DEPARTMENT
    "Executive/President": [
        {
            title: "Executive Management",
            items: [
                {
                    label: "Company Performance",
                    path: "performance",
                    icon: "chart-line",
                },
                {
                    label: "Financial Reports",
                    path: "finance",
                    icon: "wallet",
                },
                {
                    label: "Department Performance",
                    path: "departments",
                    icon: "building-2",
                },
                {
                    label: "Employee Overview",
                    path: "employees",
                    icon: "users",
                },
                {
                    label: "Pending Approvals",
                    path: "approvals",
                    icon: "clipboard-check",
                },
                {
                    label: "Management Reports",
                    path: "reports",
                    icon: "file-chart-column",
                },
                {
                    label: "Company Announcements",
                    path: "announcements",
                    icon: "megaphone",
                },
            ],
        },
    ],
};
