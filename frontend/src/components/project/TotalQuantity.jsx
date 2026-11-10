import { useRfqForm } from "../../context/RfqFormContext";
import { Field, Input } from "../ui/FormFields";
import { ELEVATOR_TYPES } from "../../data/constants";

export default function TotalQuantity() {
  const { form, update } = useRfqForm();

  return (
    <section>
      <h3 className="text-lg font-semibold text-brand-ink">Total quantity of elevators</h3>
      <p className="mb-6 mt-1 text-xs text-slate-400">Declare the total number of elevator cars, then allocate them into groups below.</p>

      <div className="rounded-2xl border-2 border-brand-steel bg-brand-mist p-5">
        <Field label="Total elevators" required hint="Minimum 1 · Maximum 100">
                  <Input type="number" min="1" max="100" value={form.total_qty} onChange={(e) => update("total_qty", e.target.value)} placeholder="e.g. 5" className="max-w-[160px] text-lg font-semibold" />
        </Field>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-xs font-semibold text-brand-ink">Automatic car codes by elevator type</div>
        <p className="mt-1 text-[11px] text-slate-500">Same type with different specifications remains sequential under the same prefix.</p>
        <div className="mt-3 grid gap-2 text-[11px] sm:grid-cols-2">
          {Object.entries(ELEVATOR_TYPES).map(([type, prefix]) => (
            <div key={type} className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
              <span className="text-slate-600">{type}</span>
              <span className="rounded border border-slate-200 px-2 py-0.5 font-mono font-bold text-brand-blue">{prefix}-01</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
