
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Check,
    Lock,
    X,
    FileCheck,
    Save,
    Send,
} from "lucide-react";

import { useRfqForm } from "../context/RfqFormContext";
import { FormFooter } from "../components/project/FormShell";
import CustomerDetails from "../components/project/CustomerDetails";
import ProjectDetails from "../components/project/ProjectDetails";
import TotalQuantity from "../components/project/TotalQuantity";
import ElevatorGroups from "../components/project/ElevatorGroups";
import { makeCode, validateCustomer } from "../utils/rfq";

// Fields displayed in the project information section.
const PROJECT_FIELDS = [
    "project_type",
    "elevator_category",
    "project_code",
    "project_name",
    "building_type",
    "project_location",
    "sales_id",
    "account_manager_id",
    "source",
    "unit_type",
    "referral",
    "quotation_purpose",
    "remarks",
];

const FIELD_LABELS = {
    first_name: "First Name",
    last_name: "Last Name",
    full_name: "Full Name",
    company_name: "Company Name",
    company: "Company",
    contact_person: "Contact Person",
    contact_number: "Contact Number",
    phone: "Phone Number",
    email: "Email Address",
    address: "Address",
    project_type: "Project Type",
    elevator_category: "Elevator Category",
    project_code: "Project Code",
    project_name: "Project Name",
    building_type: "Building Type",
    project_location: "Project Location",
    sales_id: "Sales Officer",
    account_manager_id: "Account Manager",
    source: "Source",
    unit_type: "Unit Type",
    referral: "Referral",
    quotation_purpose: "Quotation Purpose",
    remarks: "Remarks",
    total_qty: "Total Elevator Quantity",
    elevator_type: "Elevator Type",
    quantity: "Quantity",
    unit_type_code: "Unit Type Code",
};

function formatLabel(key) {
    return FIELD_LABELS[key] ||
        key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (Array.isArray(value)) {
        return value.length
            ? value.map((item) => formatValue(item)).join(", ")
            : "—";
    }

    if (typeof value === "object") {
        return Object.entries(value)
            .map(([key, item]) => `${formatLabel(key)}: ${formatValue(item)}`)
            .join(" · ");
    }

    return String(value);
}


function hasValue(value) {
    if (value === null || value === undefined || value === "") {
        return false;
    }

    if (Array.isArray(value)) {
        return value.length > 0;
    }

    if (typeof value === "object") {
        return Object.values(value).some(hasValue);
    }

    return true;
}


function SummaryField({ label, value }) {
    return (
        <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-brand-ink">
                {formatValue(value)}
            </p>
        </div>
    );
}

function SummarySection({ title, children }) {
    return (
        <section className="space-y-3">
            <h3 className="border-b border-slate-100 pb-2 text-sm font-bold text-brand-ink">
                {title}
            </h3>
            {children}
        </section>
    );
}

function ModalShell({ children, onClose, wide = false }) {
    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/50 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className={`relative flex max-h-[90vh] w-full flex-col ${wide ? "max-w-3xl" : "max-w-lg"
                    } overflow-hidden rounded-2xl bg-white shadow-2xl`}
            >
                {children}
            </div>
        </div>
    );
}

function Section({ number, title, summary, state, onOpen, children }) {
    const done = state === "done";
    const active = state === "active";
    const locked = state === "locked";

    return (
        <section
            className={`rounded-2xl border bg-white shadow-soft transition ${active ? "border-brand-steel" : "border-slate-100"
                }`}
        >
            <button
                type="button"
                disabled={locked}
                onClick={onOpen}
                className="flex w-full items-center gap-3 px-5 py-4 text-left disabled:cursor-not-allowed"
            >
                <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${done
                        ? "bg-emerald-50 text-emerald-600"
                        : active
                            ? "bg-brand-blue text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                >
                    {done ? (
                        <Check size={14} />
                    ) : locked ? (
                        <Lock size={12} />
                    ) : (
                        number
                    )}
                </span>

                <span className="min-w-0 flex-1">
                    <span
                        className={`block text-sm font-semibold ${locked ? "text-slate-400" : "text-brand-ink"
                            }`}
                    >
                        {title}
                    </span>

                    {done && summary && (
                        <span className="mt-0.5 block truncate text-xs text-slate-500">
                            {summary}
                        </span>
                    )}
                </span>

                {done && (
                    <span className="text-xs font-semibold text-brand-blue">
                        Edit
                    </span>
                )}
            </button>

            {active && (
                <div className="border-t border-slate-100 p-5 sm:p-7">
                    {children}
                </div>
            )}
        </section>
    );
}

export default function NewClient() {
    const navigate = useNavigate();

    const {
        form,
        update,
        clientName,
        total,
        allocated,
        project_code,
        submit,
        hasDraft,
        saveDraft,
        restoreDraft,
        dismissDraft,
        resetForm,
    } = useRfqForm();

    const [active, setActive] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [error, setError] = useState("");

    const [modal, setModal] = useState("");
    const [summary, setSummary] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Keep the page behind an open modal from scrolling.
    useEffect(() => {
        if (!modal) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [modal]);

    const validators = [
        () => validateCustomer(form),

        () =>
            !form.project_code ||
                !form.building_type?.trim() ||
                !form.sales_id ||
                !form.source ||
                !form.quotation_purpose ||
                !form.project_location
                ? "Complete the required project information and generate a project code."
                : "",

        () =>
            !total || total < 1 || total > 100
                ? "Enter a total quantity from 1 to 100."
                : "",
    ];

    const scrollTop = () =>
        window.scrollTo({ top: 0, behavior: "smooth" });

    const open = (i) => {
        setError("");
        setActive(i);
    };

    const next = () => {
        const issue = validators[active]?.();

        if (issue) {
            return setError(issue);
        }

        setError("");

        if (active === 0 && !form.project_code) {
            update("project_code", makeCode(clientName));
        }

        setCompleted((c) => Math.max(c, active + 1));
        setActive(active + 1);
        scrollTop();
    };

    // Open the confirmation modal instead of submitting immediately.
    const onSubmit = () => {
        setError("");

        const customerIssue = validateCustomer(form);

        if (customerIssue) {
            setError(customerIssue);
            setActive(0);
            scrollTop();
            return;
        }

        const projectIssue = validators[1]();

        if (projectIssue) {
            setError(projectIssue);
            setActive(1);
            scrollTop();
            return;
        }

        const quantityIssue = validators[2]();

        if (quantityIssue) {
            setError(quantityIssue);
            setActive(2);
            scrollTop();
            return;
        }

        setModal("confirm");
    };

    // Snapshot the information before submit() resets the context form.
    const confirmSubmission = () => {
        if (submitting) return;

        setSubmitting(true);
        setError("");

        const snapshot = {
            ...form,
            project_code,
            elevator_specs: (form.elevator_specs || []).map((group) => ({
                ...group,
            })),
        };

        const result = submit();

        setSubmitting(false);

        if (result.error) {
            setError(result.error);
            setModal("");
            return;
        }

        snapshot.project_code =
            result.payload?.project_code || snapshot.project_code;

        setSummary(snapshot);
        setModal("summary");
        setActive(0);
        setCompleted(0);
        scrollTop();
    };

    // Save the current information as a draft without submitting it.
    const confirmSaveDraft = () => {
        saveDraft();
        setModal("draftSaved");
    };

    // Close the result modal and show a fresh form.
    const closeResultModal = () => {
        resetForm();

        setSummary(null);
        setModal("");
        setError("");
        setActive(0);
        setCompleted(0);

        scrollTop();
    };

    const stateOf = (i) =>
        i === active
            ? "active"
            : i < completed
                ? "done"
                : i <= completed
                    ? "ready"
                    : "locked";

    const sections = [
        {
            title: "Customer information",
            summary: [clientName, form.contact_number]
                .filter(Boolean)
                .join(" · "),
            body: <CustomerDetails />,
        },
        {
            title: "Project information",
            summary: [project_code, form.building_type]
                .filter(Boolean)
                .join(" · "),
            body: <ProjectDetails />,
        },
        {
            title: "Total quantity",
            summary: `${total} elevator${total === 1 ? "" : "s"}`,
            body: <TotalQuantity />,
        },
        {
            title: "Elevator groups",
            summary: `${allocated} of ${total} allocated`,
            body: <ElevatorGroups />,
        },
    ];

    const stageLabels = ["Client", "Project", "Quantity", "Elevators"];
    const pct = Math.round(((active + 1) / sections.length) * 100);
    const last = active === sections.length - 1;


    const reviewForm = {
        ...form,
        project_code: project_code || form.project_code,
    };

    const projectEntries = PROJECT_FIELDS
        .filter((key) => hasValue(reviewForm[key]))
        .map((key) => [key, reviewForm[key]]);

    const clientEntries = Object.entries(reviewForm).filter(
        ([key, value]) =>
            !PROJECT_FIELDS.includes(key) &&
            key !== "elevator_specs" &&
            key !== "total_qty" &&
            hasValue(value)
    );

    const submittedProjectEntries = summary
        ? PROJECT_FIELDS
            .filter((key) => hasValue(summary[key]))
            .map((key) => [key, summary[key]])
        : [];

    const submittedClientEntries = summary
        ? Object.entries(summary).filter(
            ([key, value]) =>
                !PROJECT_FIELDS.includes(key) &&
                key !== "elevator_specs" &&
                key !== "total_qty" &&
                hasValue(value)
        )
        : [];


    return (
        <div className="mx-auto max-w-4xl space-y-5">
            <div className="flex items-center gap-3">
                <Link
                    to="/"
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-white"
                >
                    <ArrowLeft size={16} />
                </Link>

                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-brand-ink">
                        New client & project
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                        Fill in each section in order. Completed sections stay editable.
                    </p>
                </div>
            </div>

            {hasDraft && (
                <div className="flex flex-col justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 sm:flex-row sm:items-center">
                    <span>
                        A previous RFQ draft was found. Restore it or dismiss to start fresh.
                    </span>

                    <div className="flex gap-2">
                        <button
                            onClick={restoreDraft}
                            className="rounded-lg bg-amber-600 px-3 py-1.5 font-semibold text-white"
                        >
                            Restore
                        </button>

                        <button
                            onClick={dismissDraft}
                            className="rounded-lg border border-amber-300 px-3 py-1.5 font-semibold"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-blue">
                        Step {active + 1} of {sections.length} — {sections[active].title}
                    </span>

                    <span className="text-xs text-slate-400">{pct}%</span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-brand-blue transition-all"
                        style={{ width: `${pct}%` }}
                    />
                </div>

                <div className="mt-3 flex justify-between text-[10px]">
                    {stageLabels.map((label, i) => (
                        <button
                            key={label}
                            type="button"
                            disabled={i > completed}
                            onClick={() => open(i)}
                            className={`disabled:cursor-not-allowed ${i === active
                                ? "font-bold text-brand-blue"
                                : i < completed
                                    ? "font-semibold text-brand-ink"
                                    : "text-slate-400"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {sections.map((s, i) => (
                <Section
                    key={s.title}
                    number={i + 1}
                    title={s.title}
                    summary={s.summary}
                    state={stateOf(i)}
                    onOpen={() => open(i)}
                >
                    {s.body}

                    <FormFooter
                        error={error}
                        backLabel={i === 0 ? "Cancel" : "Previous"}
                        onBack={() =>
                            i === 0 ? navigate("/") : open(i - 1)
                        }
                        nextLabel={last ? "Submit RFQ" : "Next"}
                        onNext={last ? onSubmit : next}
                        final={last}
                    />
                </Section>
            ))}

            <p className="text-center text-[10px] text-slate-400">
                Draft and RFQ sequence are stored in this browser · No database connection
            </p>


            {/* SUBMISSION REVIEW AND CONFIRMATION MODAL */}
            {modal === "confirm" && (
                <ModalShell wide onClose={() => setModal("")}>
                    {/* Header */}
                    <div className="shrink-0 flex items-start justify-between border-b border-slate-100 p-5">
                        <div>
                            <div className="flex items-center gap-2">
                                <FileCheck size={20} className="text-brand-blue" />
                                <h3 className="text-lg font-bold text-brand-ink">
                                    Review RFQ Submission
                                </h3>
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                                Please review all the information entered in Steps 1–4
                                before confirming your submission.
                            </p>
                        </div>

                        <button
                            onClick={() => setModal("")}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Review Content */}
                    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-5">

                        {/* STEP 1: CUSTOMER INFORMATION */}
                        <SummarySection title="Step 1 — Customer Information">
                            {clientEntries.length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {clientEntries.map(([key, value]) => (
                                        <SummaryField
                                            key={key}
                                            label={formatLabel(key)}
                                            value={value}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400">
                                    No customer information entered.
                                </p>
                            )}
                        </SummarySection>

                        {/* STEP 2: PROJECT INFORMATION */}
                        <SummarySection title="Step 2 — Project Information">
                            {projectEntries.length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {projectEntries.map(([key, value]) => (
                                        <SummaryField
                                            key={key}
                                            label={formatLabel(key)}
                                            value={value}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400">
                                    No project information entered.
                                </p>
                            )}
                        </SummarySection>

                        {/* STEP 3: TOTAL QUANTITY */}
                        <SummarySection title="Step 3 — Total Elevator Quantity">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <SummaryField
                                    label="Total Elevators"
                                    value={form.total_qty}
                                />
                            </div>
                        </SummarySection>

                        {/* STEP 4: ELEVATOR GROUPS */}
                        <SummarySection title="Step 4 — Elevator Groups and Specifications">
                            <div className="space-y-4">
                                {(form.elevator_specs || []).map((group, index) => {
                                    const groupEntries = Object.entries(group).filter(
                                        ([, value]) => hasValue(value)
                                    );

                                    return (
                                        <div
                                            key={index}
                                            className="rounded-xl border border-slate-200 p-4"
                                        >
                                            <div className="mb-3 flex items-center justify-between">
                                                <h4 className="text-sm font-bold text-brand-ink">
                                                    Elevator Group {index + 1}
                                                </h4>

                                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-brand-blue">
                                                    {group.quantity || 0} units
                                                </span>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {groupEntries.map(([key, value]) => (
                                                    <SummaryField
                                                        key={key}
                                                        label={formatLabel(key)}
                                                        value={value}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}

                                {!form.elevator_specs?.length && (
                                    <p className="text-sm text-slate-400">
                                        No elevator groups entered.
                                    </p>
                                )}
                            </div>
                        </SummarySection>
                    </div>

                    {/* Footer Actions */}
                    <div className="shrink-0 flex flex-col-reverse gap-2 border-t border-slate-100 p-5 sm:flex-row sm:justify-between">
                        <button
                            type="button"
                            onClick={() => setModal("")}
                            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            Back to Form
                        </button>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={confirmSaveDraft}
                                className="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                            >
                                <Save size={16} />
                                Save as Draft
                            </button>

                            <button
                                type="button"
                                disabled={submitting}
                                onClick={confirmSubmission}
                                className="flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                            >
                                <Send size={16} />
                                {submitting ? "Submitting..." : "Confirm Submission"}
                            </button>
                        </div>
                    </div>
                </ModalShell>
            )}


            {/* SUBMITTED RFQ SUMMARY MODAL */}
            {modal === "summary" && summary && (
                <ModalShell wide onClose={closeResultModal}>
                    <div className="shrink-0 flex items-start justify-between border-b border-slate-100 p-5">
                        <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                                <FileCheck size={21} />
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-brand-ink">
                                    RFQ submitted successfully
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Review the information saved in this submission.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={closeResultModal}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-5">
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                Submission reference
                            </p>
                            <p className="mt-1 text-lg font-bold text-emerald-900">
                                {summary.project_code || "RFQ submitted"}
                            </p>
                        </div>

                        <SummarySection title="Client and contact information">
                            <div className="grid gap-3 sm:grid-cols-2">
                                {submittedClientEntries.map(([key, value]) => (
                                    <SummaryField
                                        key={key}
                                        label={formatLabel(key)}
                                        value={value}
                                    />
                                ))}
                            </div>
                        </SummarySection>

                        <SummarySection title="Project information">
                            <div className="grid gap-3 sm:grid-cols-2">
                                {submittedProjectEntries.map(([key, value]) => (
                                    <SummaryField
                                        key={key}
                                        label={formatLabel(key)}
                                        value={value}
                                    />
                                ))}
                            </div>
                        </SummarySection>

                        <SummarySection title="Elevator quantity">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <SummaryField
                                    label="Total Elevator Quantity"
                                    value={summary.total_qty}
                                />
                            </div>
                        </SummarySection>

                        <SummarySection title="Elevator groups and specifications">
                            <div className="space-y-3">
                                {(summary.elevator_specs || []).map((group, index) => (
                                    <div
                                        key={index}
                                        className="rounded-xl border border-slate-200 p-4"
                                    >
                                        <h4 className="mb-3 text-sm font-bold text-brand-ink">
                                            Elevator Group {index + 1}
                                        </h4>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {Object.entries(group).map(([key, value]) => (
                                                <SummaryField
                                                    key={key}
                                                    label={formatLabel(key)}
                                                    value={value}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {!summary.elevator_specs?.length && (
                                    <p className="text-sm text-slate-400">
                                        No elevator groups recorded.
                                    </p>
                                )}
                            </div>
                        </SummarySection>
                    </div>

                    <div className="shrink-0 flex justify-end border-t border-slate-100 p-5">
                        <button
                            onClick={closeResultModal}
                            className="rounded-xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                        >
                            Close
                        </button>
                    </div>
                </ModalShell>
            )}

            {/* DRAFT SAVED MODAL */}
            {modal === "draftSaved" && (
                <ModalShell onClose={closeResultModal}>
                    <div className="p-6 text-center">
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-600">
                            <Save size={23} />
                        </div>

                        <h3 className="mt-4 text-lg font-bold text-brand-ink">
                            Draft saved
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Your RFQ information has been saved as a draft.
                            It has not been submitted. You can restore it from
                            the draft notice when you return to this form.
                        </p>

                        <button
                            onClick={closeResultModal}
                            className="mt-5 w-full rounded-xl bg-brand-blue px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                        >
                            Close
                        </button>
                    </div>
                </ModalShell>
            )}
        </div>
    );
}
