
import { Users, Building2, Briefcase, ShieldCheck } from "lucide-react";

const AdminDashboard = () => {
    const cards = [
        {
            title: "User Management",
            description: "Create and manage system users",
            icon: Users,
            link: "/admin/users",
        },
        {
            title: "Department Management",
            description: "Manage company departments",
            icon: Building2,
            link: "/admin/departments",
        },
        {
            title: "Position Management",
            description: "Manage department positions",
            icon: Briefcase,
            link: "/admin/positions",
        },
        {
            title: "Role Management",
            description: "Manage system access roles",
            icon: ShieldCheck,
            link: "/admin/roles",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    System Administration
                </h1>
                <p className="text-gray-500">
                    Manage users, departments, positions, and roles.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <a
                            key={card.title}
                            href={card.link}
                            className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
                        >
                            <Icon className="mb-4 h-8 w-8 text-blue-600" />
                            <h2 className="font-semibold text-gray-900">
                                {card.title}
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                {card.description}
                            </p>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminDashboard;
