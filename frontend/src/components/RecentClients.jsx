import { useMemo, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import Status from "./ui/Status";
import { STATUSES } from "../data/constants";

const monthKey = (c) => {
    const d = new Date(c.created_at || c.date);
    return isNaN(d) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const monthLabel = (key) =>
    new Date(`${key}-01T00:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });

// Month is the only dropdown filter retained in Recent Clients.
const MONTH_FILTER = { key: "month", label: "Month", get: monthKey, format: monthLabel, newestFirst: true };

const valueOf = (c, f) => (f.get ? f.get(c) : c[f.key]) || "";
const initialFilters = () => ({ month: "all" });
const dash = (v) => (v ? v : "—");

function FilterSelect({ filter, value, options, onChange }) {
    return (
        <label className="block min-w-0">
            <span className="mb-1 block text-[11px] font-semibold text-slate-500">{filter.label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 focus:border-brand-steel"
            >
                <option value="all">All</option>
                {options.map((o) => (
                    <option key={o} value={o}>{filter.format ? filter.format(o) : o}</option>
                ))}
            </select>
        </label>
    );
}

export default function RecentClients({ clients, onViewAll }) {
    const [query, setQuery] = useState("");
    const [filters, setFilters] = useState(initialFilters);
    const [statusSel, setStatusSel] = useState([]);
    const [visible, setVisible] = useState(10);

    const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

    // Month options come from the data, so they always match existing records.
    const monthOptions = useMemo(() => {
        const values = [...new Set(clients.map((c) => valueOf(c, MONTH_FILTER)).filter(Boolean))].sort();
        return values.reverse();
    }, [clients]);

    const q = query.trim().toLowerCase();
    const isDigits = /^\d{1,3}$/.test(q); // 1-3 digits = match the end of the project code

    // Everything except the status tab, so each tab can show its own count.
    const base = clients.filter((c) => {
        const code = String(c.id).toLowerCase();
        const projectName = (c.project_name || c.details?.project?.project_name || "").toLowerCase();
        const matchesSearch =
            !q ||
            (isDigits ? code.endsWith(q) : code.includes(q)) ||
            c.name.toLowerCase().includes(q) ||
            projectName.includes(q);
        const matchesMonth = filters.month === "all" || valueOf(c, MONTH_FILTER) === filters.month;
        return matchesSearch && matchesMonth;
    });

    const countFor = (s) => base.filter((c) => c.status === s).length;
    const allChecked = statusSel.length === STATUSES.length;
    // No status boxes selected means show the complete matching client list.
    // Once one or more statuses are selected, show only those statuses.
    const rows = statusSel.length === 0 ? base : base.filter((c) => statusSel.includes(c.status));

    const toggleStatus = (s) => {
        setStatusSel((sel) => (sel.includes(s) ? sel.filter((x) => x !== s) : [...sel, s]));
        setVisible(10);
    };
    const toggleAll = () => {
        setStatusSel(allChecked ? [] : STATUSES);
        setVisible(10);
    };

    const anyActive = filters.month !== "all" || q || statusSel.length > 0;

    const clearAll = () => {
        setQuery("");
        setFilters(initialFilters());
        setStatusSel([]);
        setVisible(10);
    };

    return (
        <div className="space-y-4">
            {/* Search bar — its own card */}
            <div className="relative rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
                <Search size={15} className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setVisible(10); }}
                    placeholder="Search by project code (last 3 digits), client name, or project name..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-xs focus:border-brand-steel"
                />
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
                {/* Header: title and month filter */}
                <div className="flex flex-col justify-between gap-3 p-5 lg:flex-row lg:items-end">
                    <div>
                        <h3 className="text-sm font-semibold text-brand-ink">Recent clients</h3>
                        <p className="mt-1 text-[11px] text-slate-400">
                            {rows.length} record{rows.length === 1 ? "" : "s"} found
                        </p>
                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                        <div className="w-44">
                            <FilterSelect
                                filter={MONTH_FILTER}
                                value={filters.month}
                                options={monthOptions}
                                onChange={(v) => { setFilter("month", v); setVisible(10); }}
                            />
                        </div>
                        {anyActive && (
                            <button onClick={clearAll} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-brand-blue">
                                <X size={14} /> Clear all
                            </button>
                        )}
                    </div>
                </div>


                {/* Status checkboxes */}
                <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-3">
                    <span className="mr-1 text-[11px] font-semibold text-slate-500">Show</span>

                    <label className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${allChecked ? "border-brand-steel bg-brand-mist text-brand-blue" : "border-slate-200 text-slate-500"}`}>
                        <input type="checkbox" checked={allChecked} onChange={toggleAll} className="accent-brand-blue" />
                        All
                        <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-slate-500">{base.length}</span>
                    </label>

                    {STATUSES.map((s) => {
                        const checked = statusSel.includes(s);
                        return (
                            <label
                                key={s}
                                className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${checked ? "border-brand-steel bg-brand-mist text-brand-blue" : "border-slate-200 text-slate-500"}`}
                            >
                                <input type="checkbox" checked={checked} onChange={() => toggleStatus(s)} className="accent-brand-blue" />
                                {s}
                                <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-slate-500">{countFor(s)}</span>
                            </label>
                        );
                    })}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                        <thead>
                            <tr className="border-y border-slate-100 bg-slate-50/70 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                <th className="px-5 py-3">Project code</th>
                                <th className="px-4 py-3">Client</th>
                                <th className="px-4 py-3">Project</th>
                                <th className="px-4 py-3">Sales officer</th>
                                <th className="px-4 py-3">Source / Quotation</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Date created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.slice(0, visible).map((c) => (
                                <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                                    <td className="px-5 py-3.5 font-mono text-[11px] font-semibold text-brand-blue">{c.id}</td>
                                    <td className="px-4 py-3.5">
                                        <div className="text-xs font-semibold text-brand-ink">{c.name}</div>
                                        <div className="mt-1 text-[10px] text-slate-400">
                                            {c.company_name || `${c.elevators} elevator${c.elevators > 1 ? "s" : ""}`}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-slate-600">
                                        {c.project_name || c.details?.project?.project_name || c.project}
                                        <div className="mt-1 text-[10px] text-slate-400">
                                            {[c.building_type, c.project_location].filter(Boolean).join(" · ") || "—"}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-slate-600">{dash(c.officer)}</td>
                                    <td className="px-4 py-3.5 text-xs text-slate-600">
                                        {dash(c.source)}
                                        <div className="mt-1 text-[10px] text-slate-400">{dash(c.quotation_purpose)}</div>
                                    </td>
                                    <td className="px-4 py-3.5"><Status value={c.status} /></td>
                                    <td className="px-4 py-3.5 text-xs text-slate-500">{c.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {rows.length === 0 && (
                        <div className="p-10 text-center text-xs text-slate-400">No matching client records.</div>
                    )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                    {rows.length > visible ? (
                        <button onClick={() => setVisible((v) => v + 10)} className="text-xs font-semibold text-slate-500 hover:text-brand-ink">
                            Show more ({rows.length - visible} left)
                        </button>
                    ) : <span />}
                    <button onClick={onViewAll} className="text-xs font-semibold text-brand-blue hover:text-brand-navy">
                        View all clients <ArrowRight size={13} className="ml-1 inline" />
                    </button>
                </div>
            </section>
        </div>
    );
}
