import { useRfqForm } from "../../context/RfqFormContext";
import { Field, Input, Select, Textarea } from "../ui/FormFields";
import { LEAD_SOURCES, QUOTATION_TYPES, SO_AM } from "../../data/constants";
import { makeCode } from "../../utils/rfq";

export default function ProjectDetails() {
    const { form, update, project_code: fullProjectCode, clientName, autoProjectCode } = useRfqForm();

  return (
    <section>
      <h3 className="text-lg font-semibold text-brand-ink">Project details</h3>
      <p className="mb-6 mt-1 text-xs text-slate-400">Project identification, sales assignment, and lead details.</p>

          <div className="mb-5 rounded-xl border border-brand-steel/40 bg-brand-mist p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-brand-blue">RFQ / Project number preview</div>
              <div className="mt-1 font-mono text-lg font-bold text-brand-ink">{fullProjectCode}</div>
              <div className="mt-1 text-[10px] text-slate-500">Auto-generated · Yearly sequence · Resets every January</div>
          </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Project priority / type" required hint="Private project type is fixed for this workflow.">
                  <Input value={form.project_type} readOnly className="bg-slate-50 text-slate-500" />
        </Field>
        <Field label="Elevator category" required>
                  <Select value={form.elevator_category} onChange={(e) => update("elevator_category", e.target.value)}>
            <option value="NE">New Elevator (NE)</option>
            <option value="ME">Modernization (ME)</option>
            <option value="RE">Replacement (RE)</option>
          </Select>
        </Field>
        <Field label="Project code / short name" required hint="Readonly · Up to 3 characters · Generated from project name or client name.">
          <div className="flex gap-2">
                      <Input value={form.project_code} readOnly placeholder="Auto" className="max-w-[120px] bg-slate-50 font-semibold uppercase" />
            <button type="button" onClick={autoProjectCode} className="rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600">Auto</button>
          </div>
        </Field>
        <Field label="Full project / building name">
          <Input
                      value={form.project_name}
            onChange={(e) => {
                update("project_name", e.target.value);
                update("project_code", makeCode(e.target.value || clientName));
            }}
            placeholder="e.g. Manlyn Vilal Residences"
          />
              </Field>
              <Field label="Project location" required>
                  <Input value={form.project_location} onChange={(e) => update("project_location", e.target.value)} placeholder="e.g. Makati City" />
              </Field>
        <Field label="Building type" required>
                  <Input value={form.building_type} onChange={(e) => update("building_type", e.target.value)} placeholder="e.g. Residential condo, commercial building" />
        </Field>
        <Field label="Sales officer" required>
          <Select
                      value={form.sales_id}
            onChange={(e) => {
                update("sales_id", e.target.value);
                update("account_manager_id", SO_AM[e.target.value] || "");
            }}
          >
            <option value="">Select Sales Officer</option>
            {Object.entries(SO_AM).map(([id, name]) => <option key={id} value={id}>{name.replace(" (AM)", "")}</option>)}
          </Select>
        </Field>
              <Field label="Account manager" hint="Auto-assigned from selected Sales Officer.">
                  <Input value={form.account_manager_id} readOnly className="bg-slate-50 text-slate-500" placeholder="Auto-assigned from Sales Officer" />
        </Field>
        <Field label="Lead / source" required>
                  <Select value={form.source} onChange={(e) => update("source", e.target.value)}>
            <option value="">Select source</option>
            {LEAD_SOURCES.map((x) => <option key={x}>{x}</option>)}
          </Select>
        </Field>
        <Field label="Type of unit">
                  <Input value={form.unit_type} onChange={(e) => update("unit_type", e.target.value)} />
        </Field>
        <Field label="Referral by">
                  <Input value={form.referral} onChange={(e) => update("referral", e.target.value)} placeholder="Name of referrer (optional)" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Special instructions / others">
                      <Textarea value={form.remarks} onChange={(e) => update("remarks", e.target.value)} placeholder="Any additional notes or requirements..." />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Quotation type" required>
            <div className="flex flex-col gap-3 sm:flex-row">
              {QUOTATION_TYPES.map((x) => (
                  <label key={x} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 text-sm ${form.quotation_purpose === x ? "border-brand-blue bg-brand-mist" : "border-slate-200"}`}>
                      <input type="radio" checked={form.quotatiquotation_purposeonType === x} onChange={() => update("quotation_purpose", x)} className="accent-brand-blue" />
                  {x}
                </label>
              ))}
            </div>
          </Field>
        </div>
      </div>
    </section>
  );
}
