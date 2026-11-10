import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { useRfqForm } from "../context/RfqFormContext";
import { FormFooter } from "../components/project/FormShell";
import CustomerDetails from "../components/project/CustomerDetails";
import ProjectDetails from "../components/project/ProjectDetails";
import TotalQuantity from "../components/project/TotalQuantity";
import ElevatorGroups from "../components/project/ElevatorGroups";
import { makeCode, validateCustomer } from "../utils/rfq";

function Section({ number, title, summary, state, onOpen, children }) {
    const done = state === "done";
    const active = state === "active";
    const locked = state === "locked";
    return (
        <section className={`rounded-2xl border bg-white shadow-soft transition ${active ? "border-brand-steel" : "border-slate-100"}`}>
            <button type="button" disabled={locked} onClick={onOpen} className="flex w-full items-center gap-3 px-5 py-4 text-left disabled:cursor-not-allowed">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${done ? "bg-emerald-50 text-emerald-600" : active ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-400"}`}>
                    {done ? <Check size={14} /> : locked ? <Lock size={12} /> : number}
                </span>
                <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-semibold ${locked ? "text-slate-400" : "text-brand-ink"}`}>{title}</span>
                    {done && summary && <span className="mt-0.5 block truncate text-xs text-slate-500">{summary}</span>}
                </span>
                {done && <span className="text-xs font-semibold text-brand-blue">Edit</span>}
            </button>
            {active && <div className="border-t border-slate-100 p-5 sm:p-7">{children}</div>}
        </section>
    );
}

export default function NewClient() {
    const navigate = useNavigate();
    const {
        form, update, clientName, total, allocated, project_code,
        submit, hasDraft, restoreDraft, dismissDraft,
    } = useRfqForm();

    const [active, setActive] = useState(0);     // section currently open
    const [completed, setCompleted] = useState(0); // how many sections are finished
    const [error, setError] = useState("");

    const validators = [
        () => validateCustomer(form),
        () =>
            !form.project_code || !form.building_type.trim() || !form.sales_id || !form.source || !form.quotation_purpose || !form.project_location
                ? "Complete the required project information and generate a project code."
                : "",
        () => (!total || total < 1 || total > 100 ? "Enter a total quantity from 1 to 100." : ""),
    ];

    const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    const open = (i) => { setError(""); setActive(i); };

    const next = () => {
        const issue = validators[active]?.();
        if (issue) return setError(issue);
        setError("");
        if (active === 0 && !form.project_code) update("project_code", makeCode(clientName));
        setCompleted((c) => Math.max(c, active + 1));
        setActive(active + 1);
        scrollTop();
    };

    const onSubmit = () => {
        const result = submit();
        if (result.error) return setError(result.error);
        navigate("/project-overview");
        scrollTop();
    };

    const stateOf = (i) => (i === active ? "active" : i < completed ? "done" : i <= completed ? "ready" : "locked");

    const sections = [
        { title: "Customer information", summary: [clientName, form.contact_number].filter(Boolean).join(" · "), body: <CustomerDetails /> },
        { title: "Project information", summary: [project_code, form.building_type].filter(Boolean).join(" · "), body: <ProjectDetails /> },
        { title: "Total quantity", summary: `${total} elevator${total === 1 ? "" : "s"}`, body: <TotalQuantity /> },
        { title: "Elevator groups", summary: `${allocated} of ${total} allocated`, body: <ElevatorGroups /> },
    ];
    const stageLabels = ["Client", "Project", "Quantity", "Elevators"];
    const pct = Math.round(((active + 1) / sections.length) * 100);
    const last = active === sections.length - 1;

    return (
        <div className="mx-auto max-w-4xl space-y-5">
            <div className="flex items-center gap-3">
                <Link to="/" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-white"><ArrowLeft size={16} /></Link>
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-brand-ink">New client & project</h2>
                    <p className="mt-0.5 text-xs text-slate-400">Fill in each section in order. Completed sections stay editable.</p>
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

            <div>
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand-blue">
                            Step {active + 1} of {sections.length} — {sections[active].title}
                        </span>
                        <span className="text-xs text-slate-400">{pct}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-brand-blue transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-3 flex justify-between text-[10px]">
                        {stageLabels.map((label, i) => (
                            <button
                                key={label}
                                type="button"
                                disabled={i > completed}
                                onClick={() => open(i)}
                                className={`disabled:cursor-not-allowed ${i === active ? "font-bold text-brand-blue" : i < completed ? "font-semibold text-brand-ink" : "text-slate-400"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {sections.map((s, i) => (
                <Section key={s.title} number={i + 1} title={s.title} summary={s.summary} state={stateOf(i)} onOpen={() => open(i)}>
                    {s.body}
                    <FormFooter
                        error={error}
                        backLabel={i === 0 ? "Cancel" : "Previous"}
                        onBack={() => (i === 0 ? navigate("/") : open(i - 1))}
                        nextLabel={last ? "Submit RFQ" : "Next"}
                        onNext={last ? onSubmit : next}
                        final={last}
                    />
                </Section>
            ))}

            <p className="text-center text-[10px] text-slate-400">Draft and RFQ sequence are stored in this browser · No database connection</p>
        </div>
    );
}
