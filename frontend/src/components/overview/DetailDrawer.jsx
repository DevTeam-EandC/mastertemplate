import { useEffect } from "react";
import { ChevronRight, X } from "lucide-react";
import Status from "../ui/Status";
import {
    companyOf, contactOf, dash, emailOf, formOf, fmtDate, lastEditedOf,
    locationOf, projectNameOf, specsOf, yn,
} from "../../utils/overview";

const CATEGORY_LABELS = { NE: "New Elevator", ME: "Modernization", RE: "Replacement" };

function Info({ label, value }) {
    return (
        <div className="min-w-0">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</dt>
            <dd className="mt-1 break-words text-xs text-brand-ink">{dash(value)}</dd>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section>
            <h4 className="mb-3 text-sm font-semibold text-brand-ink">{title}</h4>
            {children}
        </section>
    );
}

function ClientDetail({ client, onOpen }) {
    const f = client.form;
    return (
        <>
            <Section title="Client information">
                <dl className="grid gap-4 sm:grid-cols-2">
                    <Info label="Full name" value={client.name} />
                    <Info label="Company name" value={client.company_name} />
                    <Info label="Email address" value={client.email_address} />
                    <Info label="Contact number" value={client.contact_number} />
                    <Info label="Honorific" value={f.honorific} />
                    <Info label="Suffix" value={f.suffix} />
                    <Info label="First name" value={f.first_name} />
                    <Info label="Middle name" value={f.middle_name} />
                    <Info label="Last name" value={f.last_name} />
                    <Info label="Total projects" value={client.projects.length} />
                    <Info label="Last project date" value={lastEditedOf(client.lastProject)} />
                </dl>
            </Section>

            <Section title={`Projects (${client.projects.length})`}>
                <div className="space-y-2">
                    {client.projects.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => onOpen({ type: "project", id: p.id })}
                            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-brand-steel hover:bg-slate-50"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="font-mono text-[11px] font-semibold text-brand-blue">{p.id}</div>
                                <div className="mt-0.5 truncate text-xs font-semibold text-brand-ink">{dash(projectNameOf(p))}</div>
                                <div className="mt-0.5 text-[10px] text-slate-400">
                                    {dash(locationOf(p))} · Last edited {lastEditedOf(p)}
                                </div>
                            </div>
                            <Status value={p.status} />
                            <ChevronRight size={16} className="shrink-0 text-slate-400" />
                        </button>
                    ))}
                </div>
            </Section>
        </>
    );
}

function SpecCard({ spec: s, index }) {
    return (
        <div className="rounded-xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-blue">Group #{index + 1}</span>
                <span className="font-mono text-[11px] font-bold text-brand-ink">{dash(s.unit_type ?? s.unit_type_no)}</span>
            </div>
            <dl className="grid gap-3 sm:grid-cols-3">
                <Info label="Quantity" value={s.quantity} />
                <Info label="Elevator type" value={s.elevator_type} />
                <Info label="Rated capacity" value={s.rated_capacity_kg ?? s.capacity} />
                <Info label="No. of floors" value={s.num_floors ?? s.no_floors} />
                <Info label="No. of stops" value={s.num_stops ?? s.no_stops} />
                <Info label="No. of openings" value={s.num_openings ?? s.no_openings} />
                <Info label="Machine room" value={s.machine_room_type ?? s.machine_room} />
                <Info label="Door type" value={s.door_type} />
                <Info label="Control system" value={s.control_system} />
                <Info label="Shaft existing" value={yn(s.shaft_existing)} />
                <Info label="Through-door" value={yn(s.through_door)} />
                <Info label="Notify department" value={yn(s.notify_department)} />
                {s.mr_location && <Info label="Machine room location" value={s.mr_location} />}
            </dl>
            {Array.isArray(s.car_codes) && s.car_codes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.car_codes.map((c) => (
                        <span key={c} className="rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] font-bold text-brand-blue">{c}</span>
                    ))}
                </div>
            )}
        </div>
    );
}

function ProjectDetail({ project, client, onOpen }) {
    const f = formOf(project);
    const specs = specsOf(project);
    return (
        <>
            <Section title="Project information">
                <dl className="grid gap-4 sm:grid-cols-2">
                    <Info label="Project code" value={project.id} />
                    <div className="min-w-0">
                        <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Status</dt>
                        <dd className="mt-1"><Status value={project.status} /></dd>
                    </div>
                    <Info label="Project name" value={projectNameOf(project)} />
                    <Info label="Project location" value={locationOf(project)} />
                    <Info label="Building type" value={project.building_type || f.building_type} />
                    <Info label="Project type" value={project.project_type || f.project_type} />
                    <Info label="Elevator category" value={CATEGORY_LABELS[project.elevator_category || f.elevator_category] || project.elevator_category || f.elevator_category} />
                    <Info label="Unit type" value={project.unit_type || f.unit_type} />
                    <Info label="Lead source" value={project.source || f.source} />
                    <Info label="Referral" value={f.referral} />
                    <Info label="Sales officer" value={String(project.officer || "").replace(" (AM)", "")} />
                    <Info label="Account manager" value={String(f.account_manager_id || "").replace(" (AM)", "")} />
                    <Info label="Quotation purpose" value={project.quotation_purpose || f.quotation_purpose} />
                    <Info label="Total elevators" value={project.elevators} />
                    <Info label="Date created" value={fmtDate(project.created_at || project.date) || project.date} />
                    <Info label="Date last edited" value={lastEditedOf(project)} />
                </dl>
                {f.remarks && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Special instructions / remarks</div>
                        <p className="mt-1 whitespace-pre-wrap text-xs text-slate-600">{f.remarks}</p>
                    </div>
                )}
            </Section>

            {client && (
                <Section title="Client">
                    <button
                        onClick={() => onOpen({ type: "client", key: client.key })}
                        className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-brand-steel hover:bg-slate-50"
                    >
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-brand-ink">{client.name}</div>
                            <div className="mt-0.5 text-[10px] text-slate-400">
                                {[client.company_name, client.email_address, client.contact_number].filter(Boolean).join(" · ") || "—"}
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-400">{client.projects.length} project{client.projects.length === 1 ? "" : "s"}</span>
                        <ChevronRight size={16} className="shrink-0 text-slate-400" />
                    </button>
                </Section>
            )}

            <Section title={`Elevator specifications (${specs.length})`}>
                {specs.length === 0 ? (
                    <p className="text-xs text-slate-400">No elevator specifications were saved for this project.</p>
                ) : (
                    <div className="space-y-3">{specs.map((s, i) => <SpecCard key={i} spec={s} index={i} />)}</div>
                )}
            </Section>
        </>
    );
}

export default function DetailDrawer({ view, clients, records, onClose, onOpen }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    if (!view) return null;

    const client = view.type === "client" ? clients.find((c) => c.key === view.key) : null;
    const project = view.type === "project" ? records.find((r) => r.id === view.id) : null;
    const projectClient = project ? clients.find((c) => c.projects.some((p) => p.id === project.id)) : null;
    if (!client && !project) return null;

    const title = client ? client.name : projectNameOf(project) || project.id;
    const subtitle = client
        ? client.company_name || client.email_address || "Client"
        : `${project.id} · ${project.name}`;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-brand-ink/40" onClick={onClose} />
            <aside className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
                    <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-[.18em] text-brand-blue">{client ? "Client" : "Project"}</div>
                        <h3 className="mt-1 truncate text-lg font-semibold tracking-tight text-brand-ink">{title}</h3>
                        <p className="mt-0.5 truncate text-xs text-slate-400">{subtitle}</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close"><X size={18} /></button>
                </div>
                <div className="flex-1 space-y-7 overflow-y-auto p-6">
                    {client ? (
                        <ClientDetail client={client} onOpen={onOpen} />
                    ) : (
                        <ProjectDetail project={project} client={projectClient} onOpen={onOpen} />
                    )}
                </div>
            </aside>
        </div>
    );
}
