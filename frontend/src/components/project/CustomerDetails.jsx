import { useRfqForm } from "../../context/RfqFormContext";
import { Field, Input, Select } from "../ui/FormFields";
import { HONORIFICS, SUFFIXES } from "../../data/constants";

export default function CustomerDetails() {
  const { form, update } = useRfqForm();

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Client honorifics" required>
        <Select value={form.honorific} onChange={(e) => update("honorific", e.target.value)}>
          <option value="">Select honorific</option>
          {HONORIFICS.map((x) => <option key={x}>{x}</option>)}
        </Select>
      </Field>
      <Field label="Last name" required>
        <Input value={form.last_name} onChange={(e) => update("last_name", e.target.value)} placeholder="Enter last name" />
      </Field>
      <Field label="First name" required>
        <Input value={form.first_name} onChange={(e) => update("first_name", e.target.value)} placeholder="Enter first name" />
      </Field>
      <Field label="Middle name">
        <Input value={form.middle_name} onChange={(e) => update("middle_name", e.target.value)} placeholder="Enter middle name" />
          </Field>
          <Field label="Client suffix">
              <Select value={form.suffix} onChange={(e) => update("suffix", e.target.value)}>
                  <option value="">Select suffix</option>
                  {SUFFIXES.map((x) => <option key={x}>{x}</option>)}
              </Select>
          </Field>
      <Field label="Contact number" required>
        <Input type="tel" value={form.contact_number} onChange={(e) => update("contact_number", e.target.value)} placeholder="e.g. 09171234567" />
      </Field>
      <Field label="Email address" required>
        <Input type="email" value={form.email_address} onChange={(e) => update("email_address", e.target.value)} placeholder="client@email.com" />
          </Field>
          <Field label="Company Name">
              <Input value={form.company_name} onChange={(e) => update("company_name", e.target.value)} placeholder="Enter Company name" />
          </Field>
    </div>
  );
}
