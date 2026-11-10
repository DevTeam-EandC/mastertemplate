import { ClipboardList, FilePlus2, LayoutDashboard, Users } from "lucide-react";

export const navItems = [
  { name: "Sales dashboard", path: "/", icon: LayoutDashboard, title: "Sales dashboard", subtitle: "Your sales activity at a glance" },
    { name: "New client", path: "/new-client", icon: Users, badge: "NEW", title: "New client & project", subtitle: "Client, project and elevator requirements" },
  { name: "Project overview", path: "/project-overview", icon: ClipboardList, title: "Project overview", subtitle: "Your complete client and project directory" },
];
