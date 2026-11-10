import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Plus, Search } from "lucide-react";
import { useClients } from "../context/ClientsContext";
import SubmissionSummary from "../components/project/SubmissionSummary";
import DetailDrawer from "../components/overview/DetailDrawer";
import { buildClients, dash, lastEditedOf, locationOf, projectNameOf, ts } from "../utils/overview";

const rowProps = (onOpen) => ({
    tabIndex: 0,
    role: "button",
    onClick: onOpen,
    onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } },
    className: "cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none",
});

export default function ProjectOverview() {
    const navigate = useNavigate();
    const { clients: records, lastSubmission, clearLastSubmission } = useClients();
    const [query, setQuery] = useState("");
    const [view, setView] = useState(null); // { type: "client", key } or { type: "project", id }

    const clients = useMemo(() => buildClients(records), [records]);
    const projects = useMemo(() => [...records].sort((a, b) => ts(b) - ts(a)), [records]);

    const q = query.trim().toLowerCase();
    const has = (...vals) => vals.some((v) => String(v || "").toLowerCase().includes(q));
    const rows = projects.filter((p) => !q || has(p.id, projectNameOf(p), p.name, locationOf(p)));

    return (
        <div className="space-y-5">
            {lastSubmission && (
                <SubmissionSummary
                    payload={lastSubmission}
                    onDismiss={clearLastSubmission}
                    onNew={() => { clearLastSubmission(); navigate("/new-client"); }}
                />
            )}

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-brand-ink">Project overview</h2>
                    <p className="mt-1 text-sm text-slate-500">Select a project to see its full details and elevator specifications.</p>
                </div>
                <button onClick={() => navigate("/new-client")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 text-xs font-semibold text-white">
                    <Plus size={16} /> Add new client
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
                <div className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:max-w-md">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by project code, project name, client, or location..."
                            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-xs focus:border-brand-steel"
                        />
                    </div>
                    <div className="text-xs font-semibold text-brand-ink">
                        {rows.length} <span className="font-normal text-slate-400">project{rows.length === 1 ? "" : "s"} found</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left">
                        <thead>
                            <tr className="border-y border-slate-100 bg-slate-50/70 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                <th className="px-5 py-3">Project code</th>
                                <th className="px-4 py-3">Project name</th>
                                <th className="px-4 py-3">Client name</th>
                                <th className="px-4 py-3">Location</th>
                                <th className="px-4 py-3">Date last edited</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((p) => (
                                <tr key={p.id} {...rowProps(() => setView({ type: "project", id: p.id }))}>
                                    <td className="px-5 py-3.5 font-mono text-[11px] font-semibold text-brand-blue">{p.id}</td>
                                    <td className="px-4 py-3.5 text-xs font-semibold text-brand-ink">{dash(projectNameOf(p))}</td>
                                    <td className="px-4 py-3.5 text-xs text-slate-600">{p.name}</td>
                                    <td className="px-4 py-3.5 text-xs text-slate-600">{dash(locationOf(p))}</td>
                                    <td className="px-4 py-3.5 text-xs text-slate-500">{lastEditedOf(p)}</td>
                                    <td className="px-4 py-3.5 text-right"><ChevronRight size={16} className="inline text-slate-400" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {rows.length === 0 && <div className="p-10 text-center text-xs text-slate-400">No matching projects.</div>}
                </div>
            </div>

            <DetailDrawer
                view={view}
                clients={clients}
                records={records}
                onClose={() => setView(null)}
                onOpen={setView}
            />
        </div>
    );
}
