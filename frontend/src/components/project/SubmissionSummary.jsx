    import { CheckCircle2 } from "lucide-react";

export default function SubmissionSummary({ payload, onNew, onDismiss }) {
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
      a.download = `elevator-rfq-${payload.project_code}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={34} /></div>
        <h2 className="mt-4 text-xl font-semibold text-brand-ink">RFQ submitted successfully</h2>
        <p className="mt-1 text-xs text-slate-500">Frontend prototype · No database connection</p>
        <div className="mt-3 font-mono text-lg font-bold text-brand-blue">{payload.project_code}</div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={exportJson} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600">Export JSON</button>
          <button onClick={() => navigator.clipboard?.writeText(payload.project_code)} className="rounded-xl border border-brand-steel px-4 py-2.5 text-xs font-semibold text-brand-blue">Copy Project Code</button>
          <button onClick={onNew} className="rounded-xl bg-brand-blue px-4 py-2.5 text-xs font-semibold text-white">Start new form</button>
          <button onClick={onDismiss} className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50">Dismiss</button>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
        <h3 className="mb-3 text-sm font-semibold text-brand-ink">Submission summary</h3>
        <div className="grid gap-2 text-xs sm:grid-cols-2">
          <p>Client: {payload.client.full_name}</p>
          <p>Contact: {payload.client.contact_number}</p>
          <p>Project: {payload.project.project_name || payload.project.building_type}</p>
          <p>Quotation: {payload.project.quotation_type}</p>
          <p>Total elevators: {payload.total_elevators}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {payload.all_car_codes.map((c, i) => (
            <span key={i} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px]">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
