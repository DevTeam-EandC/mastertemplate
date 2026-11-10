import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownRight, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useClients } from "../context/ClientsContext";
import { STATUSES } from "../data/constants";
import ClientTable from "../components/ClientTable";
import SubmissionSummary from "../components/project/SubmissionSummary";

export default function ProjectOverview() {
  const navigate = useNavigate();
  const { clients, lastSubmission, clearLastSubmission } = useClients();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");

  const filtered = clients.filter(
    (c) =>
      (c.name + " " + c.id).toLowerCase().includes(query.toLowerCase()) &&
      (status === "All statuses" || c.status === status)
  );

  return (
    <div className="space-y-5">
      {lastSubmission && (
        <SubmissionSummary
          payload={lastSubmission}
          onDismiss={clearLastSubmission}
          onNew={() => { clearLastSubmission(); navigate("/customer-information"); }}
        />
      )}

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-brand-ink">Project overview</h2>
          <p className="mt-1 text-sm text-slate-500">Manage your client records and elevator opportunities.</p>
        </div>
        <button onClick={() => navigate("/customer-information")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 text-xs font-semibold text-white">
          <Plus size={16} /> Add new client
        </button>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by client name or reference..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600">
          <option>All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="rounded-xl border border-slate-200 px-3 text-xs text-slate-500"><SlidersHorizontal size={15} className="mr-2 inline" />Filters</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="text-xs font-semibold text-brand-ink">{filtered.length} records <span className="font-normal text-slate-400">found</span></div>
          <button className="text-xs text-slate-400"><ArrowDownRight size={14} className="mr-1 inline" />Export</button>
        </div>
        <ClientTable clients={filtered} />
      </div>
    </div>
  );
}
