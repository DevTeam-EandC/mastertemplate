import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRfqForm } from "../../context/RfqFormContext";

const STAGES = ["Customer", "Project"];

/** Page frame shared by the Customer information and Project information pages. */
export function FormShell({ step, title, description, backTo, children }) {
  const { hasDraft, restoreDraft, dismissDraft } = useRfqForm();
  const pct = Math.round(((step + 1) / STAGES.length) * 100);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <Link to={backTo} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-white"><ArrowLeft size={16} /></Link>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-brand-ink">New client & project</h2>
          <p className="mt-0.5 text-xs text-slate-400">Elevator RFQ · Customer and project intake</p>
        </div>
      </div>

      {hasDraft && (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 sm:flex-row sm:items-center">
          <span>A previous RFQ draft was found. Restore it or dismiss to start fresh.</span>
          <div className="flex gap-2">
            <button onClick={restoreDraft} className="rounded-lg bg-amber-600 px-3 py-1.5 font-semibold text-white">Restore</button>
            <button onClick={dismissDraft} className="rounded-lg border border-amber-300 px-3 py-1.5 font-semibold">Dismiss</button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft sm:p-7">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-brand-blue">Step {step + 1} of {STAGES.length} — {title}</span>
          <span className="text-xs text-slate-400">{pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-blue transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex justify-between text-[10px] text-slate-400">
          {STAGES.map((x, i) => (
            <span key={x} className={i === step ? "font-bold text-brand-blue" : i < step ? "font-semibold text-brand-ink" : ""}>{x}</span>
          ))}
        </div>
        <div className="my-7 border-t border-slate-100" />
        <h3 className="text-lg font-semibold text-brand-ink">{title}</h3>
        <p className="mb-6 mt-1 text-xs text-slate-400">{description}</p>
        {children}
      </div>

      <p className="text-center text-[10px] text-slate-400">Draft and RFQ sequence are stored in this browser · No database connection · RFQ format: P-NE-MV-2026-001</p>
    </div>
  );
}

export function FormFooter({ error, backLabel, onBack, nextLabel, onNext, final = false }) {
  const { saveDraft } = useRfqForm();
  return (
    <>
      {error && <div className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-xs text-rose-600">{error}</div>}
      <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
        <button onClick={onBack} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600">{backLabel}</button>
        <div className="flex items-center gap-2">
          <button onClick={saveDraft} className="rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50">Save draft</button>
          <button onClick={onNext} className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-900/10 hover:bg-brand-navy">
            {nextLabel}
            {final ? <Check size={15} /> : <ArrowRight size={15} />}
          </button>
        </div>
      </div>
    </>
  );
}
