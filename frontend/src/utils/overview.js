export const dash = (v) => (v === undefined || v === null || v === "" ? "—" : v);
export const yn = (v) => (v === true ? "Yes" : v === false ? "No" : dash(v));

// The full submitted form. New records keep it under details.client; other shapes keep it on details.
export const formOf = (c) => c.details?.client || c.details || {};
export const specsOf = (c) =>
    c.details?.elevator_specs || c.details?.groups || c.details?.client?.elevator_specs || [];

export const projectNameOf = (c) => c.project_name || formOf(c).project_name || "";
export const companyOf = (c) => c.company_name || formOf(c).company_name || "";
export const emailOf = (c) => c.email_address || formOf(c).email_address || "";
export const contactOf = (c) => c.contact_number || formOf(c).contact_number || "";
export const locationOf = (c) => c.project_location || formOf(c).project_location || "";

export const ts = (c) => Date.parse(c.updated_at || c.created_at || c.date) || 0;
export const fmtDate = (v) => {
    const d = new Date(v);
    return isNaN(d) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};
export const lastEditedOf = (c) => fmtDate(c.updated_at || c.created_at || c.date) || c.date || "—";

// A client can have several projects, so group saved records by email, then contact number, then name.
const clientKeyOf = (c) => (emailOf(c) || contactOf(c) || c.name || "").toLowerCase().trim();

export function buildClients(records) {
    const groups = new Map();
    for (const c of records) {
        const key = clientKeyOf(c);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(c);
    }
    return [...groups.entries()]
        .map(([key, list]) => {
            const projects = [...list].sort((a, b) => ts(b) - ts(a)); // newest first
            const latest = projects[0];
            const pick = (fn) => projects.map(fn).find(Boolean) || "";
            return {
                key,
                name: latest.name,
                company_name: pick(companyOf),
                email_address: pick(emailOf),
                contact_number: pick(contactOf),
                form: formOf(latest),
                projects,
                lastProject: latest,
            };
        })
        .sort((a, b) => ts(b.lastProject) - ts(a.lastProject));
}
