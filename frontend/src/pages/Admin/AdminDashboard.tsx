import { Link } from "react-router-dom";
import {
    ArrowRight,
    Briefcase,
    Building2,
    ShieldCheck,
    Users,
    type LucideIcon,
} from "lucide-react";

interface AdminSection {
    title: string;
    description: string;
    icon: LucideIcon;
    to?: string;
}

const sections: AdminSection[] = [
    {
        title: "User management",
        description:
            "Create accounts, assign departments and positions, and activate or deactivate users.",
        icon: Users,
        to: "/admin/users",
    },
    {
        title: "Departments",
        description: "Maintain the company departments that users belong to.",
        icon: Building2,
        to: "/admin/departments",
    },
    {
        title: "Positions",
        description: "Define the positions available inside each department.",
        icon: Briefcase,
        to: "/admin/positions",
    },
    {
        title: "Roles",
        description: "Control which system features each role can access.",
        icon: ShieldCheck,
    },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                    Overview
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-500 md:text-base">
                    Manage users, departments, positions and access for the
                    whole company.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {sections.map((section) => {
                    const Icon = section.icon;
                    const content = (
                        <>
                            <div className="flex items-start justify-between gap-4">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <Icon size={22} aria-hidden="true" />
                                </span>

                                {section.to ? (
                                    <ArrowRight
                                        size={18}
                                        aria-hidden="true"
                                        className="mt-1 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-700"
                                    />
                                ) : (
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                        Coming soon
                                    </span>
                                )}
                            </div>

                            <h2 className="mt-5 text-lg font-semibold text-slate-900">
                                {section.title}
                            </h2>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                {section.description}
                            </p>
                        </>
                    );

                    if (!section.to) {
                        return (
                            <div
                                key={section.title}
                                aria-disabled="true"
                                className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 opacity-80"
                            >
                                {content}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={section.title}
                            to={section.to}
                            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            {content}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
