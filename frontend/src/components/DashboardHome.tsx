import { useEffect, useState } from "react";
import { Users, ClipboardList, Clock, CheckCircle, type LucideIcon } from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { getDashboardSummary } from "../api/dashboardApi";
import type { DashboardSummaryResponse } from "../api/dashboard.types";

interface DashboardHomeProps {
    title: string;
    description: string;
    cards: {
        key: string;
        title: string;
    }[];
}

const icons: LucideIcon[] = [Users, ClipboardList, Clock, CheckCircle];

export default function DashboardHome({
    title,
    description,
    cards,
}: DashboardHomeProps) {
    const { activeDashboard } = useAuth();

    const [summary, setSummary] =
        useState<DashboardSummaryResponse | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadSummary() {
            if (!activeDashboard) {
                setSummary(null);
                setError("Please select a department dashboard.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                const data = await getDashboardSummary(
                    activeDashboard.departmentId,
                    activeDashboard.positionId
                );

                if (!cancelled) {
                    setSummary(data);
                }
            } catch {
                if (!cancelled) {
                    setError("Unable to load dashboard information.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadSummary();

        return () => {
            cancelled = true;
        };
    }, [activeDashboard?.departmentId, activeDashboard?.positionId]);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                    {title}
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-500 md:text-base">
                    {description}
                </p>
            </header>

            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            <section
                aria-label="Key figures"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
                {cards.map((card, index) => {
                    const Icon = icons[index % icons.length];
                    const value = summary?.metrics?.[card.key] ?? 0;

                    return (
                        <div
                            key={card.key}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-medium text-slate-500">
                                    {card.title}
                                </p>

                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                    <Icon size={18} aria-hidden="true" />
                                </span>
                            </div>

                            <p className="mt-4 text-3xl font-semibold tabular-nums text-slate-900">
                                {loading ? (
                                    <span
                                        aria-label="Loading"
                                        className="inline-block h-8 w-16 animate-pulse rounded bg-slate-200 motion-reduce:animate-none"
                                    />
                                ) : (
                                    value
                                )}
                            </p>
                        </div>
                    );
                })}
            </section>

            <section
                aria-labelledby="recent-activities-heading"
                className="rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
                <div className="border-b border-slate-100 px-5 py-4 md:px-6">
                    <h2
                        id="recent-activities-heading"
                        className="text-base font-semibold text-slate-900"
                    >
                        Recent activity
                    </h2>
                </div>

                <div className="px-5 py-2 md:px-6">
                    {loading ? (
                        <p className="py-6 text-sm text-slate-500">
                            Loading activity…
                        </p>
                    ) : summary?.recentActivities?.length ? (
                        <ul className="divide-y divide-slate-100">
                            {summary.recentActivities.map((activity) => (
                                <li key={activity.id} className="py-4">
                                    <p className="font-medium text-slate-800">
                                        {activity.title}
                                    </p>
                                    <p className="mt-0.5 text-sm text-slate-500">
                                        {activity.description}
                                    </p>
                                    <time
                                        dateTime={activity.createdAtUtc}
                                        className="mt-1 block text-xs text-slate-400"
                                    >
                                        {new Date(activity.createdAtUtc).toLocaleString()}
                                    </time>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="py-6 text-sm text-slate-500">
                            No recent activity yet.
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}
