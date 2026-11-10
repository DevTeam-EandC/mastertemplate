import { ClipboardList, FilePlus2, LayoutDashboard, Users } from "lucide-react";

export const navItems = [
    { name: "Sales dashboard", path: "/", icon: LayoutDashboard, title: "Sales dashboard", subtitle: "Your sales activity at a glance" },
    { name: "New client", path: "/new-client", icon: FilePlus2, badge: "NEW", title: "New client & project", subtitle: "Client, project and elevator requirements" },
    { name: "Client overview", path: "/client-overview", icon: Users, title: "Client overview", subtitle: "Every client and their projects" },
    { name: "Project overview", path: "/project-overview", icon: ClipboardList, title: "Project overview", subtitle: "Every project and its full details" },
];
