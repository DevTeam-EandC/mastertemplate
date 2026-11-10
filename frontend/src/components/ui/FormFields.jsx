export function Field({ label, required, children, hint }) {
  return (
    <label className="block min-w-1">
      <span className="mb-1.5 flex items-center gap-1 text-[12px] font-semibold text-slate-600">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-brand-ink placeholder:text-slate-400 transition focus:border-brand-steel focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50 ${className}`}
      {...props}
    />
  );
}

export function Select({ children, className = "", ...props }) {
  return (
    <select
      className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-brand-ink transition focus:border-brand-steel focus:ring-4 focus:ring-blue-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea(props) {
  return (
    <textarea
      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-brand-ink placeholder:text-slate-400 transition focus:border-brand-steel focus:ring-4 focus:ring-blue-50"
      rows="3"
      {...props}
    />
  );
}
