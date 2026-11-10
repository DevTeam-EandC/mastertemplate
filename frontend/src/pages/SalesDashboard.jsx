import { useNavigate } from "react-router-dom";
import { Activity, CheckCircle2, ChevronDown, ClipboardList, Plus, Users } from "lucide-react";
import { useClients } from "../context/ClientsContext";
import RecentClients from "../components/RecentClients";

export default function SalesDashboard() {
    const navigate = useNavigate();
    const { clients } = useClients();

    const count = (status) => clients.filter((c) => c.status === status).length;

    const stats = [
        { label: "Total clients", value: clients.length, delta: "+12.8%", icon: Users, tone: "bg-blue-50 text-brand-blue" },
        { label: "For reference", value: count("For reference"), delta: "Needs follow-up", icon: ClipboardList, tone: "bg-slate-100 text-slate-600" },
        { label: "For site inspection", value: count("For site inspection"), delta: "Active projects", icon: Activity, tone: "bg-violet-50 text-violet-600" },
        { label: "Completed", value: count("Completed"), delta: "Successfully closed", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
    ];

    const pipeline = [
        { name: "For quotation", count: count("For quotation"), color: "bg-brand-blue" },
        { name: "For site inspection", count: count("For site inspection"), color: "bg-brand-steel" },
        { name: "In progress", count: count("In progress"), color: "bg-violet-400" },
        { name: "Completed", count: count("Completed"), color: "bg-emerald-400" },
    ];

    return (
        
            <div className="space-y-7">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <div className="text-xs font-medium text-slate-400">
                            {new Date().toLocaleDateString("en-PH", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                                timeZone: "Asia/Manila",
                            })}
                            {" · "}
                            {new Date().toLocaleTimeString("en-PH", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true,
                                timeZone: "Asia/Manila",
                            })}
                        </div>

                        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-brand-ink">
                            {(() => {
                                const hour = Number(
                                    new Intl.DateTimeFormat("en-PH", {
                                        hour: "numeric",
                                        hour12: false,
                                        timeZone: "Asia/Manila",
                                    }).format(new Date())
                                );

                                return hour < 12
                                    ? "Good morning"
                                    : hour < 18
                                        ? "Good afternoon"
                                        : "Good evening";
                            })()}
                            <span className="text-brand-blue">.</span>
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Here’s what’s happening with your sales pipeline.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/new-client")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-900/10 hover:bg-brand-navy"
                    >
                        <Plus size={16} /> Add new client
                    </button>
                </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((s) => (
                    <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">{s.label}</span>
                            <div className={`grid h-9 w-9 place-items-center rounded-xl ${s.tone}`}><s.icon size={17} /></div>
                        </div>
                        <div className="mt-4 flex items-end justify-between">
                            <span className="text-3xl font-semibold tracking-tight text-brand-ink">{s.value.toString().padStart(2, "0")}</span>
                            <span className="pb-1 text-[10px] font-medium text-slate-400">{s.delta}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-5 xxxl:grid-cols-[1.55fr_1fr]">
                <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-brand-ink">Pipeline overview</h3>
                            <p className="mt-1 text-[11px] text-slate-400">Client project distribution</p>
                        </div>
                        <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-500">This month <ChevronDown size={12} className="ml-1 inline" /></button>
                    </div>
                    <div className="mt-7 space-y-5">
                        {pipeline.map((item) => (
                            <div key={item.name}>
                                <div className="mb-2 flex justify-between text-xs">
                                    <span className="font-medium text-slate-600">{item.name}</span>
                                    <span className="font-semibold text-brand-ink">{item.count}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${clients.length ? Math.max(5, (item.count / clients.length) * 100) : 0}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <RecentClients clients={clients} onViewAll={() => navigate("/client-overview")} />
        </div>
    );
}
