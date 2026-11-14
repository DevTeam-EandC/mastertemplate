
import { useEffect, useState } from "react";
import {
    Users,
    ClipboardList,
    Clock,
    CheckCircle,
} from "lucide-react";

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

const icons = [Users, ClipboardList, Clock, CheckCircle];

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
    }, [
        activeDashboard?.departmentId,
        activeDashboard?.positionId,
    ]);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    {title}
                </h1>

                <p className="mt-1 text-slate-500">{description}</p>
            </div>

            {error && (
                <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card, index) => {
                    const Icon = icons[index % icons.length];
                    const value = summary?.metrics?.[card.key] ?? 0;

                    return (
                        <div
                            key={card.key}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">
                                    {card.title}
                                </p>

                                <Icon className="text-blue-600" size={22} />
                            </div>

                            <p className="mt-4 text-3xl font-bold text-slate-800">
                                {loading ? "..." : value}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-800">
                    Recent Activities
                </h2>

                {loading ? (
                    <p className="mt-3 text-sm text-slate-500">
                        Loading activities...
                    </p>
                ) : summary?.recentActivities?.length ? (
                    <div className="mt-4 space-y-4">
                        {summary.recentActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className="border-b border-slate-100 pb-3 last:border-0"
                            >
                                <p className="font-medium text-slate-800">
                                    {activity.title}
                                </p>

                                <p className="text-sm text-slate-500">
                                    {activity.description}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    {new Date(activity.createdAtUtc).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mt-3 text-sm text-slate-500">
                        No recent activities available.
                    </p>
                )}
            </div>
        </div>
    );
}
