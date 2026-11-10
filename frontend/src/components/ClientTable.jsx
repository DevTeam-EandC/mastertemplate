import { MoreHorizontal } from "lucide-react";
import Status from "./ui/Status";

export default function ClientTable({ clients }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left">
        <thead>
          <tr className="border-y border-slate-100 bg-slate-50/70 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <th className="px-5 py-3">Client</th>
            <th className="px-4 py-3">Project details</th>
            <th className="px-4 py-3">Sales officer</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date created</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
              <td className="px-5 py-3.5">
                <div className="text-xs font-semibold text-brand-ink">{c.name}</div>
                <div className="mt-1 text-[10px] text-slate-400">{c.id}</div>
              </td>
              <td className="px-4 py-3.5 text-xs text-slate-500">
                {c.project}
                <div className="mt-1 text-[10px] text-slate-400">{c.elevators} elevator{c.elevators > 1 ? "s" : ""}</div>
              </td>
              <td className="px-4 py-3.5 text-xs text-slate-600">{c.officer}</td>
              <td className="px-4 py-3.5"><Status value={c.status} /></td>
              <td className="px-4 py-3.5 text-xs text-slate-500">{c.date}</td>
              <td className="px-4 py-3.5 text-right">
                <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><MoreHorizontal size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {clients.length === 0 && <div className="p-10 text-center text-xs text-slate-400">No matching client records.</div>}
    </div>
  );
}
