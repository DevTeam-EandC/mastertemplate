
import type { ComponentType } from "react";

import SalesAccountManager from "../Dashboards/Sales/AccountManager/Dashboard";
import SalesOfficer from "../Dashboards/Sales/SalesOfficer/Dashboard";

import DesignDepartmentHead from "../Dashboards/Design/DepartmentHead/Dashboard";
import DesignSpecialist from "../Dashboards/Design/DesignSpecialist/Dashboard";

import ITDepartmentHead from "../Dashboards/IT/DepartmentHead/Dashboard";
import ITLead from "../Dashboards/IT/ITLead/Dashboard";

export interface DashboardRoute {
    key: string;
    path: string;
    department: string;
    position: string;
    component: ComponentType;
}

export const dashboardRoutes: DashboardRoute[] = [
    {
        key: "Sales/AccountManager",
        path: "Sales/AccountManager",
        department: "Sales",
        position: "AccountManager",
        component: SalesAccountManager,
    },
    {
        key: "Sales/SalesOfficer",
        path: "Sales/SalesOfficer",
        department: "Sales",
        position: "SalesOfficer",
        component: SalesOfficer,
    },
    {
        key: "Design/DepartmentHead",
        path: "Design/DepartmentHead",
        department: "Design",
        position: "DepartmentHead",
        component: DesignDepartmentHead,
    },
    {
        key: "Design/DesignSpecialist",
        path: "Design/DesignSpecialist",
        department: "Design",
        position: "DesignSpecialist",
        component: DesignSpecialist,
    },
    {
        key: "IT/DepartmentHead",
        path: "IT/DepartmentHead",
        department: "IT",
        position: "DepartmentHead",
        component: ITDepartmentHead,
    },
    {
        key: "IT/ITLead",
        path: "IT/ITLead",
        department: "IT",
        position: "ITLead",
        component: ITLead,
    },
];
