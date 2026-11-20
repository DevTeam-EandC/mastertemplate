import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import DashboardLayout from "../../../../components/DashboardLayout";

import {
    addProject,
    getClientProfile,
    getClientProfileOptions,
} from "../../../../api/clientProfileApi";

import type {
    ClientProfileOptions,
    SaveProject,
} from "../../../../api/clientProfile.types";

import { normalizeSpaces } from "../../../../utils/inputRules";

import {
    allocatedCount,
    carCodePreview,
    emptyProject,
    newSpec,
    nextSpecKey,
    parseCount,
    toElevatorDetails,
    validateLead,
    validateSpecs,
    validateTotal,
    withoutErrors,
    type ElevatorSpec,
    type Errors,
    type ProjectFormState,
    type StepNumber,
} from "./projectFormModel";

import ProjectStepper, {
    STEPS,
    StepCard,
    btnPrimary,
    btnSecondary,
} from "./ProjectStepper";

import { LeadStep, SpecsStep, TotalStep } from "./ProjectFormSteps";

const STEP_ERROR_MESSAGE = "Check the highlighted fields and try again.";

// Element to focus for the first error. The allocation error has no field of its own.
function errorFocusTarget(found: Errors): string | null {
    const first = Object.keys(found)[0];

    if (!first) return null;

    return first === "allocation" ? "allocation-status" : first;
}

export default function ProjectDetailsForm() {
    const navigate = useNavigate();
    const { clientId } = useParams<{ clientId: string }>();

    const [options, setOptions] = useState<ClientProfileOptions | null>(null);
    const [clientName, setClientName] = useState("");
    const [accountManager, setAccountManager] = useState("");

    const [step, setStep] = useState<StepNumber>(1);
    const [form, setForm] = useState<ProjectFormState>(emptyProject);
    const [totalText, setTotalText] = useState("");
    const [specs, setSpecs] = useState<ElevatorSpec[]>(() => [newSpec()]);

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Errors>({});

    // Element id to focus after the next render, such as a step heading or an invalid field.
    const [focusTarget, setFocusTarget] = useState<string | null>(null);

    useEffect(() => {
        if (!focusTarget) return;

        document.getElementById(focusTarget)?.focus();
        setFocusTarget(null);
    }, [focusTarget, step]);

    /*
     * LOAD OPTIONS AND CLIENT
     */
    useEffect(() => {
        if (!clientId) {
            setLoadError("Client ID is missing.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setLoadError("");

                const [opts, client] = await Promise.all([
                    getClientProfileOptions(),
                    getClientProfile(clientId as string),
                ]);

                if (cancelled) return;

                setOptions(opts);
                setClientName(client.clientName ?? "");
                setAccountManager(client.accountManagerName ?? "");
            } catch (err) {
                console.error("Load project form error:", err);

                if (cancelled) return;

                if (axios.isAxiosError(err) && err.response?.status === 403) {
                    setLoadError("Only Account Managers can add projects.");
                } else if (
                    axios.isAxiosError(err) &&
                    err.response?.status === 404
                ) {
                    setLoadError("Client profile not found.");
                } else {
                    setLoadError("Unable to load the project form.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, [clientId]);

    /*
     * FIELD UPDATES
     * Changing a field clears its own error.
     */
    const updateProject = <K extends keyof ProjectFormState>(
        field: K,
        value: ProjectFormState[K]
    ) => {
        setForm((current) => ({ ...current, [field]: value }));
        setFieldErrors((current) =>
            withoutErrors(current, (key) => key === field)
        );
        setError("");
    };

    const updateTotal = (value: string) => {
        setTotalText(value);
        setFieldErrors((current) =>
            withoutErrors(current, (key) => key === "totalElevators")
        );
        setError("");
    };

    // Changing any spec, or the allocation, clears the allocation error too.
    const clearSpecErrors = (key: string) =>
        setFieldErrors((current) =>
            withoutErrors(
                current,
                (errorKey) =>
                    errorKey.startsWith(`spec-${key}-`) ||
                    errorKey === "allocation"
            )
        );

    const updateSpec = (key: string, patch: Partial<ElevatorSpec>) => {
        setSpecs((current) =>
            current.map((spec) =>
                spec.key === key ? { ...spec, ...patch } : spec
            )
        );
        clearSpecErrors(key);
        setError("");
    };

    const addSpec = () => {
        setSpecs((current) => [...current, newSpec()]);
        setFieldErrors((current) =>
            withoutErrors(current, (key) => key === "allocation")
        );
    };

    const removeSpec = (key: string) => {
        setSpecs((current) => current.filter((spec) => spec.key !== key));
        clearSpecErrors(key);
    };

    const duplicateSpec = (key: string) => {
        const copyKey = nextSpecKey();

        setSpecs((current) => {
            const index = current.findIndex((spec) => spec.key === key);

            if (index < 0) return current;

            const copy = { ...current[index], key: copyKey };

            return [
                ...current.slice(0, index + 1),
                copy,
                ...current.slice(index + 1),
            ];
        });
        setFieldErrors((current) =>
            withoutErrors(current, (errorKey) => errorKey === "allocation")
        );
    };

    /*
     * STEP NAVIGATION
     * Going back keeps entered data. Going forward validates the current step first.
     */
    const goToStep = (target: StepNumber) => {
        setError("");
        setFieldErrors({});
        setStep(target);
        setFocusTarget(`step-${target}-heading`);
    };

    // Moves to a step that has errors and focuses the first invalid field.
    const showStepErrors = (target: StepNumber, found: Errors) => {
        setStep(target);
        setFieldErrors(found);
        setError(STEP_ERROR_MESSAGE);
        setFocusTarget(errorFocusTarget(found));
    };

    const handleNext = () => {
        if (step === 1) {
            const found = validateLead(form);

            if (Object.keys(found).length > 0) {
                setFieldErrors(found);
                setError(STEP_ERROR_MESSAGE);
                setFocusTarget(errorFocusTarget(found));
                return;
            }

            goToStep(2);
            return;
        }

        if (step === 2) {
            const found = validateTotal(totalText);

            if (Object.keys(found).length > 0) {
                setFieldErrors(found);
                setError(STEP_ERROR_MESSAGE);
                setFocusTarget(errorFocusTarget(found));
                return;
            }

            // A single empty spec starts with the full total, so the first set
            // of specs is ready to adjust.
            setSpecs((current) =>
                current.length === 1 && parseCount(current[0].quantity) === 0
                    ? [{ ...current[0], quantity: totalText }]
                    : current
            );

            goToStep(3);
        }
    };

    /*
     * SAVE PROJECT
     * Runs on the last step. Earlier steps are re-checked so that a
     * later edit cannot leave an invalid field behind.
     */
    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!clientId || saving) return;

        if (step < 3) {
            handleNext();
            return;
        }

        const leadErrors = validateLead(form);

        if (Object.keys(leadErrors).length > 0) {
            showStepErrors(1, leadErrors);
            return;
        }

        const totalErrors = validateTotal(totalText);

        if (Object.keys(totalErrors).length > 0) {
            showStepErrors(2, totalErrors);
            return;
        }

        const total = parseCount(totalText);
        const specErrors = validateSpecs(specs, total);

        if (Object.keys(specErrors).length > 0) {
            showStepErrors(3, specErrors);
            return;
        }

        // The API stores one entry per elevator, so numberOfElevators
        // equals the number of entries built from the specs.
        const body: SaveProject = {
            buildingType: normalizeSpaces(form.buildingType),
            salesOfficerUserId: form.salesOfficerUserId,
            quotationType: form.quotationType,
            leadSource: form.leadSource,
            referralBy: form.referralBy.trim() || null,
            specialInstructions: form.specialInstructions.trim() || null,
            numberOfElevators: total,
            elevators: toElevatorDetails(specs),
        };

        try {
            setSaving(true);
            setError("");

            await addProject(clientId, body);

            navigate(`/Sales/AccountManager/customers/${clientId}`, {
                replace: true,
            });
        } catch (err) {
            console.error("Save project error:", err);

            if (axios.isAxiosError(err)) {
                const data = err.response?.data as
                    | { message?: string }
                    | undefined;

                if (err.response?.status === 400) {
                    setError(
                        data?.message ?? "Some project information is invalid."
                    );
                } else if (err.response?.status === 403) {
                    setError("You do not have permission to add this project.");
                } else {
                    setError(data?.message ?? "Unable to save the project.");
                }
            } else {
                setError("Unable to save the project.");
            }
        } finally {
            setSaving(false);
        }
    };

    const backToClient = () =>
        navigate(`/Sales/AccountManager/customers/${clientId ?? ""}`);

    /*
     * LOADING AND LOAD ERRORS
     */
    if (loading) {
        return (
            <DashboardLayout department="Sales" position="AccountManager">
                <p className="text-sm text-slate-500">Loading project form...</p>
            </DashboardLayout>
        );
    }

    if (loadError || !options) {
        return (
            <DashboardLayout department="Sales" position="AccountManager">
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {loadError || "Unable to load the project form."}
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/Sales/AccountManager/customers")}
                    className="mt-4 text-sm font-medium text-blue-700 hover:text-blue-900"
                >
                    Back to client profiles
                </button>
            </DashboardLayout>
        );
    }

    const total = parseCount(totalText);
    const codes = carCodePreview(specs);
    const meta = STEPS[step - 1];
    const isLastStep = step === 3;
    const allocated = allocatedCount(specs);

    const footer = (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 md:px-8">
            <button
                type="button"
                onClick={() =>
                    step === 1 ? backToClient() : goToStep((step - 1) as StepNumber)
                }
                disabled={saving}
                className={btnSecondary}
            >
                {step === 1 ? "Cancel" : "Previous"}
            </button>

            <button
                type="submit"
                disabled={saving || (step === 3 && allocated === 0)}
                className={btnPrimary}
            >
                {isLastStep
                    ? saving
                        ? "Saving..."
                        : "Save project"
                    : "Next"}
            </button>
        </div>
    );

    return (
        <DashboardLayout department="Sales" position="AccountManager">
            {/* HEADER */}
            <header className="mb-6">
                <button
                    type="button"
                    onClick={backToClient}
                    className="text-sm font-medium text-slate-500 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                    ← Back to client profile
                </button>

                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                    New project
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    {clientName
                        ? `Client: ${clientName}`
                        : "Add a project to this client."}
                </p>
            </header>

            <ProjectStepper current={step} onSelect={goToStep} />

            {error && (
                <div
                    role="alert"
                    className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleSave} noValidate>
                <StepCard
                    number={step}
                    heading={meta.heading}
                    description={meta.description}
                    footer={footer}
                >
                    {step === 1 && (
                        <LeadStep
                            form={form}
                            errors={fieldErrors}
                            options={options}
                            accountManager={accountManager}
                            onChange={updateProject}
                        />
                    )}

                    {step === 2 && (
                        <TotalStep
                            total={totalText}
                            error={fieldErrors.totalElevators}
                            options={options}
                            onChange={updateTotal}
                        />
                    )}

                    {step === 3 && (
                        <SpecsStep
                            specs={specs}
                            total={total}
                            errors={fieldErrors}
                            options={options}
                            codes={codes}
                            onUpdate={updateSpec}
                            onAdd={addSpec}
                            onRemove={removeSpec}
                            onDuplicate={duplicateSpec}
                        />
                    )}
                </StepCard>
            </form>
        </DashboardLayout>
    );
}
