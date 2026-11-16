import { Link } from "react-router-dom";
import {
    Building2,
    ClipboardList,
    FileText,
    Megaphone,
    TrendingUp,
    Users,
    Wallet,
    type LucideIcon,
} from "lucide-react";

import DashboardLayout from "../../../components/DashboardLayout";

interface ExecutiveModule {
    title: string;
    description: string;
    icon: LucideIcon;
    path: string;
}

// Paths must match the Executive/President entries in config/dashboardMenus.ts.
const modules: ExecutiveModule[] = [
    {
        title: "Company performance",
        description: "Track overall company performance against targets.",
        icon: TrendingUp,
        path: "performance",
    },
    {
        title: "Financial reports",
        description: "Review company financial summaries and reports.",
        icon: Wallet,
        path: "finance",
    },
    {
        title: "Department performance",
        description: "Compare the performance of every department.",
        icon: Building2,
        path: "departments",
    },
    {
        title: "Employee overview",
        description: "View workforce information and employee statistics.",
        icon: Users,
        path: "employees",
    },
    {
        title: "Pending approvals",
        description: "Review requests that need executive approval.",
        icon: ClipboardList,
        path: "approvals",
    },
    {
        title: "Management reports",
        description: "Open company-wide management reports.",
        icon: FileText,
        path: "reports",
    },
    {
        title: "Company announcements",
        description: "Read important company announcements.",
        icon: Megaphone,
        path: "announcements",
    },
];

const summary = [
    { title: "Total employees", value: "—", icon: Users },
    { title: "Departments", value: "10", icon: Building2 },
    { title: "Company revenue", value: "—", icon: Wallet },
    { title: "Pending approvals", value: "—", icon: ClipboardList },
];

export default function ExecutivePresidentDashboard() {
    return (
        <DashboardLayout department="Executive" position="President">
            <div className="space-y-8">
                <header>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                        President dashboard
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500 md:text-base">
                        Company-wide overview and executive management.
                    </p>
                </header>

                <section
                    aria-label="Key figures"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {summary.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-medium text-slate-500">
                                        {item.title}
                                    </p>
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                        <Icon size={18} aria-hidden="true" />
                                    </span>
                                </div>
                                <p className="mt-4 text-3xl font-semibold tabular-nums text-slate-900">
                                    {item.value}
                                </p>
                            </div>
                        );
                    })}
                </section>

                <section aria-labelledby="executive-modules-heading">
                    <div className="mb-4">
                        <h2
                            id="executive-modules-heading"
                            className="text-lg font-semibold text-slate-900"
                        >
                            Executive management
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Open a module to review company information and
                            manage approvals.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {modules.map((module) => {
                            const Icon = module.icon;

                            return (
                                <Link
                                    key={module.path}
                                    to={`/Executive/President/${module.path}`}
                                    className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                        <Icon size={20} aria-hidden="true" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block font-semibold text-slate-900 group-hover:text-blue-800">
                                            {module.title}
                                        </span>
                                        <span className="mt-1 block text-sm leading-relaxed text-slate-500">
                                            {module.description}
                                        </span>
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                    <h2 className="font-semibold text-blue-900">
                        About these figures
                    </h2>
                    <p className="mt-2 text-sm text-blue-800">
                        Figures show as placeholders until company records are
                        connected.
                    </p>
                </section>
            </div>
        </DashboardLayout>
    );
}
