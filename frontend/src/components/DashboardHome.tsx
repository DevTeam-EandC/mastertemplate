
import {
    Users,
    ClipboardList,
    Clock,
    CheckCircle,
} from "lucide-react";

interface DashboardHomeProps {
    title: string;
    description: string;
    cards: {
        title: string;
        value: number;
    }[];
}

const icons = [
    Users,
    ClipboardList,
    Clock,
    CheckCircle,
];

export default function DashboardHome({
    title,
    description,
    cards,
}: DashboardHomeProps) {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    {title}
                </h1>
                <p className="mt-1 text-slate-500">{description}</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card, index) => {
                    const Icon = icons[index % icons.length];

                    return (
                        <div
                            key={card.title}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">
                                    {card.title}
                                </p>
                                <Icon className="text-blue-600" size={22} />
                            </div>

                            <p className="mt-4 text-3xl font-bold text-slate-800">
                                {card.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-800">
                    Recent Activities
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    No activities available yet.
                </p>
            </div>
        </div>
    );
}
