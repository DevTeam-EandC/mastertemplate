
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import DashboardLayout from "../../../../components/DashboardLayout";

import {
    createClientProfile,
    getClientProfile,
    getClientProfileOptions,
    updateClient,
} from "../../../../api/clientProfileApi";

import type {
    ClientProfileOptions,
    SaveClient,
} from "../../../../api/clientProfile.types";

const fieldClass =
    "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 disabled:bg-slate-100 disabled:text-slate-500";

const labelClass = "block text-sm font-medium text-slate-700";

const emptyForm = (): SaveClient => ({
    clientName: "",
    contactNumber: "",
    emailAddress: "",
    leadSource: "",
    referralBy: null,
});

function Section({
    id,
    title,
    description,
    children,
}: {
    id: string;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section
            aria-labelledby={id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"
        >
            <div className="mb-6">
                <h2
                    id={id}
                    className="text-base font-semibold text-slate-900"
                >
                    {title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    {description}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {children}
            </div>
        </section>
    );
}

export default function ClientProfileForm() {
    const navigate = useNavigate();
    const { id } = useParams();

    const isEdit = Boolean(id);

    const [options, setOptions] =
        useState<ClientProfileOptions | null>(null);

    const [form, setForm] = useState<SaveClient>(emptyForm);

    const [accountManagerName, setAccountManagerName] =
        useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [fieldErrors, setFieldErrors] =
        useState<Record<string, string>>({});

    /*
     * LOAD OPTIONS AND EXISTING CLIENT
     */
    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError("");

                const opts = await getClientProfileOptions();

                if (cancelled) return;

                setOptions(opts);

                if (id) {
                    const existing = await getClientProfile(id);

                    if (cancelled) return;

                    setForm({
                        clientName: existing.clientName ?? "",
                        contactNumber: existing.contactNumber ?? "",
                        emailAddress: existing.emailAddress ?? "",
                        leadSource: existing.leadSource ?? "",
                        referralBy: existing.referralBy ?? null,
                    });

                    setAccountManagerName(
                        existing.accountManagerName ?? ""
                    );
                }
            } catch (err) {
                console.error("Load client form error:", err);

                if (cancelled) return;

                if (
                    axios.isAxiosError(err) &&
                    err.response?.status === 403
                ) {
                    setError(
                        "Only Account Managers can access this client form."
                    );
                } else if (
                    axios.isAxiosError(err) &&
                    err.response?.status === 404
                ) {
                    setError("Client profile not found.");
                } else {
                    setError(
                        "Unable to load the client profile form."
                    );
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
    }, [id]);

    /*
     * UPDATE FORM FIELD
     */
    const updateField = <K extends keyof SaveClient>(
        field: K,
        value: SaveClient[K]
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setFieldErrors((current) => ({
            ...current,
            [field]: "",
        }));

        setError("");
    };

    /*
     * VALIDATION
     * Matches SaveClientDto data annotations.
     */
    const validate = (data: SaveClient): Record<string, string> => {
        const errors: Record<string, string> = {};

        if (!data.clientName.trim()) {
            errors.clientName = "Enter the client name.";
        } else if (data.clientName.trim().length > 200) {
            errors.clientName = "Client name cannot exceed 200 characters.";
        }

        if (!data.contactNumber.trim()) {
            errors.contactNumber = "Enter a contact number.";
        } else if (data.contactNumber.trim().length > 50) {
            errors.contactNumber =
                "Contact number cannot exceed 50 characters.";
        }

        const email = data.emailAddress.trim();

        if (!email) {
            errors.emailAddress = "Enter an email address.";
        } else if (
            email.length > 255 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            errors.emailAddress = "Enter a valid email address.";
        }

        if (!data.leadSource) {
            errors.leadSource = "Choose a lead source.";
        } else if (data.leadSource.length > 50) {
            errors.leadSource = "Lead source cannot exceed 50 characters.";
        }

        if ((data.referralBy?.trim().length ?? 0) > 200) {
            errors.referralBy =
                "Referral name cannot exceed 200 characters.";
        }

        return errors;
    };

    /*
     * SAVE CLIENT
     */
    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const errors = validate(form);

        setFieldErrors(errors);
        setSuccess("");
        setError("");

        if (Object.keys(errors).length > 0) {
            setError("Check the highlighted fields and try again.");
            return;
        }

        const clientBody: SaveClient = {
            clientName: form.clientName.trim(),
            contactNumber: form.contactNumber.trim(),
            emailAddress: form.emailAddress.trim(),
            leadSource: form.leadSource,
            referralBy: form.referralBy?.trim() || null,
        };

        try {
            setSaving(true);

            if (id) {
                await updateClient(id, clientBody);

                setSuccess("Client profile updated successfully.");
            } else {
                const saved = await createClientProfile(clientBody);

                setSuccess("Client profile created successfully.");

                navigate(
                    `/Sales/AccountManager/customers/${saved.id}`,
                    { replace: true }
                );

                return;
            }
        } catch (err) {
            console.error("Save client error:", err);

            if (axios.isAxiosError(err)) {
                const data = err.response?.data as
                    | { message?: string }
                    | undefined;

                if (err.response?.status === 409) {
                    setError(
                        data?.message ??
                        "This client already exists. Open the existing client profile to add a project."
                    );
                } else if (err.response?.status === 400) {
                    setError(
                        data?.message ??
                        "Some client information is invalid."
                    );
                } else if (err.response?.status === 403) {
                    setError(
                        "You do not have permission to save this client."
                    );
                } else {
                    setError(
                        data?.message ??
                        "Unable to save the client profile."
                    );
                }
            } else {
                setError("Unable to save the client profile.");
            }
        } finally {
            setSaving(false);
        }
    };

    /*
     * LOADING
     */
    if (loading) {
        return (
            <DashboardLayout
                department="Sales"
                position="AccountManager"
            >
                <p className="text-sm text-slate-500">
                    Loading client profile...
                </p>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            department="Sales"
            position="AccountManager"
        >
            {/* HEADER */}
            <header className="mb-8">
                <button
                    type="button"
                    onClick={() =>
                        navigate("/Sales/AccountManager/customers")
                    }
                    className="text-sm font-medium text-slate-500 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                    ← Back to client profiles
                </button>

                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                    {isEdit ? "Edit client profile" : "New client profile"}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Register and manage client information. Projects
                    can be added separately after saving.
                </p>
            </header>

            {/* ERROR */}
            {error && (
                <div
                    role="alert"
                    className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {/* SUCCESS */}
            {success && (
                <div
                    role="status"
                    className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                >
                    {success}
                </div>
            )}

            <form
                onSubmit={handleSave}
                noValidate
                className="space-y-6"
            >
                {/* CLIENT INFORMATION */}
                <Section
                    id="client-information"
                    title="Client information"
                    description="Enter the client's contact and identification details."
                >
                    {/* CLIENT NAME */}
                    <div>
                        <label
                            htmlFor="clientName"
                            className={labelClass}
                        >
                            Client name *
                        </label>

                        <input
                            id="clientName"
                            type="text"
                            maxLength={200}
                            className={fieldClass}
                            placeholder="Enter client or company name"
                            value={form.clientName}
                            aria-invalid={Boolean(fieldErrors.clientName)}
                            onChange={(e) =>
                                updateField("clientName", e.target.value)
                            }
                        />

                        {fieldErrors.clientName && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.clientName}
                            </p>
                        )}
                    </div>

                    {/* CONTACT NUMBER */}
                    <div>
                        <label
                            htmlFor="contactNumber"
                            className={labelClass}
                        >
                            Contact number *
                        </label>

                        <input
                            id="contactNumber"
                            type="tel"
                            maxLength={50}
                            className={fieldClass}
                            placeholder="Enter contact number"
                            value={form.contactNumber}
                            aria-invalid={Boolean(fieldErrors.contactNumber)}
                            onChange={(e) =>
                                updateField("contactNumber", e.target.value)
                            }
                        />

                        {fieldErrors.contactNumber && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.contactNumber}
                            </p>
                        )}
                    </div>

                    {/* EMAIL */}
                    <div className="md:col-span-2">
                        <label
                            htmlFor="emailAddress"
                            className={labelClass}
                        >
                            Email address *
                        </label>

                        <input
                            id="emailAddress"
                            type="email"
                            maxLength={255}
                            className={fieldClass}
                            placeholder="example@company.com"
                            value={form.emailAddress}
                            aria-invalid={Boolean(fieldErrors.emailAddress)}
                            onChange={(e) =>
                                updateField("emailAddress", e.target.value)
                            }
                        />

                        {fieldErrors.emailAddress && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.emailAddress}
                            </p>
                        )}
                    </div>
                </Section>

                {/* LEAD INFORMATION */}
                <Section
                    id="lead-information"
                    title="Lead information"
                    description="Record how the client was referred to your company."
                >
                    {/* LEAD SOURCE */}
                    <div>
                        <label
                            htmlFor="leadSource"
                            className={labelClass}
                        >
                            Lead source *
                        </label>

                        <select
                            id="leadSource"
                            className={fieldClass}
                            value={form.leadSource}
                            aria-invalid={Boolean(fieldErrors.leadSource)}
                            onChange={(e) =>
                                updateField("leadSource", e.target.value)
                            }
                        >
                            <option value="">
                                Select a lead source
                            </option>

                            {options?.leadSources.map((source) => (
                                <option key={source} value={source}>
                                    {source}
                                </option>
                            ))}
                        </select>

                        {fieldErrors.leadSource && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.leadSource}
                            </p>
                        )}
                    </div>

                    {/* REFERRAL */}
                    <div>
                        <label
                            htmlFor="referralBy"
                            className={labelClass}
                        >
                            Referral by
                        </label>

                        <input
                            id="referralBy"
                            type="text"
                            maxLength={200}
                            className={fieldClass}
                            placeholder="Enter referral name (optional)"
                            value={form.referralBy ?? ""}
                            aria-invalid={Boolean(fieldErrors.referralBy)}
                            onChange={(e) =>
                                updateField(
                                    "referralBy",
                                    e.target.value || null
                                )
                            }
                        />

                        {fieldErrors.referralBy && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.referralBy}
                            </p>
                        )}
                    </div>

                    {/* ACCOUNT MANAGER */}
                    <div className="md:col-span-2">
                        <label className={labelClass}>
                            Account Manager
                        </label>

                        <div className="mt-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                            {accountManagerName ||
                                "Automatically assigned from your login"}
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                            The logged-in Account Manager is assigned
                            automatically by the backend.
                        </p>
                    </div>
                </Section>

                {/* ACTIONS */}
                <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/Sales/AccountManager/customers")
                        }
                        disabled={saving}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        {saving
                            ? "Saving..."
                            : isEdit
                                ? "Update client"
                                : "Save client"}
                    </button>
                </div>
            </form>
        </DashboardLayout>
    );
}
