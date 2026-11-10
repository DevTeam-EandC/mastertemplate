import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, CheckCircle2, ChevronDown, ClipboardList, Plus, Users } from "lucide-react";
import { useClients } from "../context/ClientsContext";
import RecentClients from "../components/RecentClients";
import { formOf } from "../utils/overview";

const TZ = "Asia/Manila";
const REFERENCE = "For Reference";
const SITE_INSPECTION = "For Site Inspection";

// What the client asked for on the form. Older records without it fall back to their status.
const purposeOf = (c) => {
    const p = c.quotation_purpose || formOf(c).quotation_purpose;
    if (p) return p;
    if (c.status === "For site inspection") return SITE_INSPECTION;
    if (c.status === "For quotation") return REFERENCE;
    return "";
};

// Lives in its own component so the ticking clock doesn't re-render the whole dashboard.
function Greeting() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const hour =
        Number(new Intl.DateTimeFormat("en-PH", { hour: "numeric", hour12: false, timeZone: TZ }).format(now)) % 24;
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    return (
        <div>
            <div className="text-xs font-medium text-slate-400">
                {now.toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: TZ })}
                {" · "}
                {now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: TZ })}
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-brand-ink">
                {greeting}<span className="text-brand-blue">.</span>
            </h2>
            <p className="mt-1 text-sm text-slate-500">Here’s what’s happening with your sales pipeline.</p>
        </div>
    );
}

export default function SalesDashboard() {
    const navigate = useNavigate();
    const { clients } = useClients();

    const countPurpose = (purpose) => clients.filter((c) => purposeOf(c) === purpose).length;
    const countStatus = (status) => clients.filter((c) => c.status === status).length;

    const stats = [
        { label: "Total clients", value: clients.length, delta: "+12.8%", icon: Users, tone: "bg-blue-50 text-brand-blue" },
        { label: "For reference", value: countPurpose(REFERENCE), delta: "Needs follow-up", icon: ClipboardList, tone: "bg-slate-100 text-slate-600" },
        { label: "For site inspection", value: countPurpose(SITE_INSPECTION), delta: "Awaiting inspection", icon: Activity, tone: "bg-violet-50 text-violet-600" },
        { label: "Completed", value: countStatus("Completed"), delta: "Successfully closed", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
    ];

    const pipeline = [
        { name: "For reference", count: countPurpose(REFERENCE), color: "bg-brand-blue" },
        { name: "For site inspection", count: countPurpose(SITE_INSPECTION), color: "bg-brand-steel" },
        { name: "In progress", count: countStatus("In progress"), color: "bg-violet-400" },
        { name: "Completed", count: countStatus("Completed"), color: "bg-emerald-400" },
    ];

    return (
        <div className="space-y-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <Greeting />
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
                        <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-500">
                            This month <ChevronDown size={12} className="ml-1 inline" />
                        </button>
                    </div>
                    <div className="mt-7 space-y-5">
                        {pipeline.map((item) => (
                            <div key={item.name}>
                                <div className="mb-2 flex justify-between text-xs">
                                    <span className="font-medium text-slate-600">{item.name}</span>
                                    <span className="font-semibold text-brand-ink">{item.count}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className={`h-full rounded-full ${item.color}`}
                                        style={{ width: `${clients.length ? Math.max(5, (item.count / clients.length) * 100) : 0}%` }}
                                    />
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
