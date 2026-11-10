import { useRfqForm } from "../../context/RfqFormContext";
import { Field, Input, Select } from "../ui/FormFields";
import { CAPACITIES, ELEVATOR_TYPES, MACHINE_ROOMS } from "../../data/constants";
import { groupCodes } from "../../utils/rfq";

function GroupCard({ group: g, index: i }) {
  const { form, setForm, updateGroup, duplicateGroup, removeGroup } = useRfqForm();
    const complete = !!(g.unit_type && g.elevator_type && g.rated_capacity_kg && g.num_floors && g.num_stops && g.num_openings && g.machine_room_type);
  const codes = groupCodes(g);
  const patch = (changes) =>
      setForm((f) => ({ ...f, elevator_specs: f.elevator_specs.map((x, j) => (j === i ? { ...x, ...changes } : x)) }));

  const changeType = (value) => {
    const p = ELEVATOR_TYPES[value] || "XX";
      const used = form.elevator_specs.filter((_, j) => j !== i).map((x) => x.unit_type);
    let n = 1;
    while (used.includes(`${p}-${String(n).padStart(2, "0")}`)) n++;
    patch({ elevator_type: value, unit_type: `${p}-${String(n).padStart(2, "0")}` });
  };

    const changeFloors = (v) =>
        patch({ num_floors: v, num_stops: v, num_openings: g.through_door ? Number(v) * 2 || "" : v });

  const toggleThroughDoor = (checked) =>
    patch({
        through_door: checked,
        num_openings: checked ? Number(g.num_stops || g.num_floors) * 2 || "" : g.num_stops || g.num_floors,
    });

  return (
    <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold text-brand-blue">Group #{i + 1}</h4>
          <Input value={g.unit_type} onChange={(e) => updateGroup(i, "unit_type", e.target.value.toUpperCase())} className="w-28 py-1.5 font-mono text-xs font-bold" placeholder="PE-01" />
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${complete ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{complete ? "Complete" : "Incomplete"}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => duplicateGroup(i)} className="rounded-lg border border-brand-steel px-3 py-1.5 text-[11px] font-semibold text-brand-blue">Duplicate</button>
          <button onClick={() => removeGroup(i)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-[11px] font-semibold text-rose-600">Remove</button>
        </div>
      </div>

      {Number(g.quantity) > 1 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {codes.map((c) => <span key={c} className="rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] font-bold text-brand-blue">{c}</span>)}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Quantity" required>
          <Input type="number" min="1" value={g.quantity} onChange={(e) => updateGroup(i, "quantity", e.target.value)} />
        </Field>
        <Field label="Elevator type" required>
          <Select value={g.elevator_type} onChange={(e) => changeType(e.target.value)}>
            <option value="">Select elevator type</option>
            {Object.keys(ELEVATOR_TYPES).map((x) => <option key={x}>{x}</option>)}
          </Select>
        </Field>
              <Field label="Rate capacity" required>
                  <Select value={g.rated_capacity_kg} onChange={(e) => updateGroup(i, "rated_capacity_kg", e.target.value)}>
            <option value="">Select capacity</option>
            {CAPACITIES.map((x) => <option key={x}>{x}</option>)}
          </Select>
        </Field>
        <Field label="No. of floors" required>
                  <Input type="number" min="2" value={g.num_floors} onChange={(e) => changeFloors(e.target.value)} />
        </Field>
        <Field label="No. of stops" required>
                  <Input type="number" min="2" value={g.num_stops} onChange={(e) => updateGroup(i, "num_stops", e.target.value)} />
        </Field>
        <Field label="No. of openings" required>
                  <Input type="number" min="2" value={g.num_openings} onChange={(e) => updateGroup(i, "num_openings", e.target.value)} />
        </Field>
        <Field label="Machine room" required>
                  <Select value={g.machine_room_type} onChange={(e) => updateGroup(i, "machine_room_type", e.target.value)}>
            <option value="">Select machine room</option>
            {MACHINE_ROOMS.map((x) => <option key={x}>{x}</option>)}
          </Select>
        </Field>
        <Field label="Door type" required>
          <Select value={g.door_type} onChange={(e) => updateGroup(i, "door_type", e.target.value)}>
            <option>Through</option>
            <option>90 degree</option>
          </Select>
        </Field>
        <Field label="Control system" required>
          <Select value={g.control_system} onChange={(e) => updateGroup(i, "control_system", e.target.value)}>
            <option>Simplex</option>
            <option>Group</option>
          </Select>
        </Field>
        <Field label="Shaft existing" required>
          <Select value={g.shaft_existing} onChange={(e) => updateGroup(i, "shaft_existing", e.target.value)}>
            <option>Yes</option>
            <option>No</option>
          </Select>
        </Field>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <input type="checkbox" checked={g.through_door} onChange={(e) => toggleThroughDoor(e.target.checked)} className="accent-brand-blue" /> Through-door (front & rear)
        </label>
        <label className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <input type="checkbox" checked={g.notify_department} onChange={(e) => updateGroup(i, "notify_department", e.target.checked)} className="accent-brand-blue" /> Notify designated department
        </label>
      </div>

          {g.machine_room_type === "Conventional Overhead" && (
        <div className="mt-4 max-w-sm">
          <Field label="Machine room location" required>
            <Select value={g.mr_location} onChange={(e) => updateGroup(i, "mr_location", e.target.value)}>
              <option>Directly Above Shaft</option>
              <option>Basement / Side</option>
            </Select>
          </Field>
        </div>
      )}
    </div>
  );
}

export default function ElevatorGroups() {
  const { form, total, allocated, allCodes, addGroup, recode } = useRfqForm();
  const balanced = allocated === total && total > 0;

  return (
    <section>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-lg font-semibold text-brand-ink">Elevator Groups</h3>
          <p className="mt-1 text-xs text-slate-400">Same type and specifications belong in one group. Different specifications should be separate groups.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={recode} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">Re-code</button>
          <button onClick={addGroup} className="rounded-lg border border-brand-steel px-3 py-2 text-xs font-semibold text-brand-blue">+ Add group</button>
        </div>
      </div>

      <div className="my-5 rounded-xl border border-slate-200 p-4">
        <div className={`mb-2 text-xs font-semibold ${balanced ? "text-emerald-700" : "text-amber-700"}`}>
          Allocated: {allocated} / {total || 0} {balanced ? "· Complete" : ""}
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${balanced ? "bg-emerald-500" : "bg-brand-blue"}`} style={{ width: `${total ? Math.min(100, (allocated / total) * 100) : 0}%` }} />
        </div>
      </div>

      <div className="space-y-5">
              {form.elevator_specs.map((g, i) => <GroupCard key={i} group={g} index={i} />)}
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 text-xs font-semibold text-slate-700">All car codes (preview)</div>
        <div className="flex flex-wrap gap-2">
          {allCodes.map((c, i) => <span key={`${c}-${i}`} className="rounded border border-slate-200 bg-white px-2 py-1 font-mono text-[10px] font-semibold text-brand-blue">{c}</span>)}
        </div>
      </div>
    </section>
  );
}
