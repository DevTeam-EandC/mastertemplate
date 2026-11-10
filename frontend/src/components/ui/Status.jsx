const STYLES = {
  "For quotation": "bg-blue-50 text-blue-700",
  "For site inspection": "bg-amber-50 text-amber-700",
  "In progress": "bg-violet-50 text-violet-700",
  Completed: "bg-emerald-50 text-emerald-700",
};

export default function Status({ value }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${STYLES[value] || "bg-slate-100 text-slate-600"}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {value}
    </span>
  );
}
