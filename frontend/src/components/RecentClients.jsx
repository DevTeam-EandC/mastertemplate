import { useMemo, useState } from "react";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";
import Status from "./ui/Status";
import { STATUSES } from "../data/constants";

const monthKey = (c) => {
    const d = new Date(c.created_at || c.date);
    return isNaN(d) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const monthLabel = (key) =>
    new Date(`${key}-01T00:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });

// One entry per filter dropdown. `key` is the field on the saved client record.
const MONTH_FILTER = { key: "month", label: "Month", get: monthKey, format: monthLabel, newestFirst: true };
const DETAIL_FILTERS = [
    { key: "building_type", label: "Building type" },
    { key: "project_type", label: "Project type" },
    { key: "elevator_category", label: "Elevator category" },
    { key: "officer", label: "Sales officer" },
    { key: "source", label: "Lead source" },
    { key: "unit_type", label: "Unit type" },
    { key: "quotation_purpose", label: "Quotation purpose" },
    { key: "project_location", label: "Project location" },
];
const ALL_FILTERS = [MONTH_FILTER, ...DETAIL_FILTERS];

const valueOf = (c, f) => (f.get ? f.get(c) : c[f.key]) || "";
const initialFilters = () => Object.fromEntries(ALL_FILTERS.map((f) => [f.key, "all"]));
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
    const [clientName, setClientName] = useState("");
    const [filters, setFilters] = useState(initialFilters);
    const [statusSel, setStatusSel] = useState(STATUSES);
    const [showFilters, setShowFilters] = useState(false);
    const [visible, setVisible] = useState(10);

    const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

    // Dropdown options come from the data, so they always match what exists.
    const options = useMemo(
        () =>
            Object.fromEntries(
                ALL_FILTERS.map((f) => {
                    const vals = [...new Set(clients.map((c) => valueOf(c, f)).filter(Boolean))].sort();
                    if (f.newestFirst) vals.reverse();
                    return [f.key, vals];
                })
            ),
        [clients]
    );
    const names = useMemo(() => [...new Set(clients.map((c) => c.name))].sort(), [clients]);

    const q = query.trim().toLowerCase();
    const isDigits = /^\d{1,3}$/.test(q); // 1-3 digits = match the end of the project code
    const cn = clientName.trim().toLowerCase();

    // Everything except the status tab, so each tab can show its own count.
    const base = clients.filter((c) => {
        const code = String(c.id).toLowerCase();
        const projectName = (c.project_name || c.details?.project?.project_name || "").toLowerCase();
        const matchesSearch =
            !q ||
            (isDigits ? code.endsWith(q) : code.includes(q)) ||
            c.name.toLowerCase().includes(q) ||
            projectName.includes(q);
        const matchesName = !cn || c.name.toLowerCase().includes(cn);
        const matchesFilters = ALL_FILTERS.every((f) => filters[f.key] === "all" || valueOf(c, f) === filters[f.key]);
        return matchesSearch && matchesName && matchesFilters;
    });

    const countFor = (s) => base.filter((c) => c.status === s).length;
    const allChecked = statusSel.length === STATUSES.length;
    const rows = allChecked ? base : base.filter((c) => statusSel.includes(c.status));

    const toggleStatus = (s) => {
        setStatusSel((sel) => (sel.includes(s) ? sel.filter((x) => x !== s) : [...sel, s]));
        setVisible(10);
    };
    const toggleAll = () => {
        setStatusSel(allChecked ? [] : STATUSES);
        setVisible(10);
    };

    const activeFilters = ALL_FILTERS.filter((f) => filters[f.key] !== "all").length + (cn ? 1 : 0);
    const detailFilterCount = DETAIL_FILTERS.filter((f) => filters[f.key] !== "all").length + (cn ? 1 : 0);
    const anyActive = activeFilters > 0 || q || !allChecked;

    const clearAll = () => {
        setQuery("");
        setClientName("");
        setFilters(initialFilters());
        setStatusSel(STATUSES);
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
                {/* Header: title, month filter, more-filters toggle */}
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
                                options={options.month}
                                onChange={(v) => setFilter("month", v)}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters((s) => !s)}
                            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${showFilters || detailFilterCount ? "border-brand-steel bg-brand-mist text-brand-blue" : "border-slate-200 text-slate-600"}`}
                        >
                            <SlidersHorizontal size={14} /> More filters
                            {detailFilterCount > 0 && (
                                <span className="rounded-full bg-brand-blue px-1.5 py-0.5 text-[10px] text-white">{detailFilterCount}</span>
                            )}
                        </button>
                        {anyActive && (
                            <button onClick={clearAll} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-brand-blue">
                                <X size={14} /> Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Client name + project detail filters */}
                {showFilters && (
                    <div className="grid gap-3 border-t border-slate-100 bg-slate-50/60 p-5 sm:grid-cols-2 lg:grid-cols-4">
                        <label className="block min-w-0">
                            <span className="mb-1 block text-[11px] font-semibold text-slate-500">Client name</span>
                            <input
                                list="recent-client-names"
                                value={clientName}
                                onChange={(e) => { setClientName(e.target.value); setVisible(10); }}
                                placeholder="Type or pick a client"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-brand-steel"
                            />
                            <datalist id="recent-client-names">
                                {names.map((n) => <option key={n} value={n} />)}
                            </datalist>
                        </label>
                        {DETAIL_FILTERS.map((f) => (
                            <FilterSelect
                                key={f.key}
                                filter={f}
                                value={filters[f.key]}
                                options={options[f.key]}
                                onChange={(v) => { setFilter(f.key, v); setVisible(10); }}
                            />
                        ))}
                    </div>
                )}

          
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
