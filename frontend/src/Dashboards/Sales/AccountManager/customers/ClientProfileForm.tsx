import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import DashboardLayout from "../../../../components/DashboardLayout";

import {
    createClientProfile,
    getClientProfile,
    updateClient,
} from "../../../../api/clientProfileApi";

import type { SaveClient } from "../../../../api/clientProfile.types";

import { fieldClass, inputAria } from "../formUi";

import {
    MOBILE_DIGITS,
    mobileDigitsError,
    mobileDigitsKeyFilter,
    sanitizeMobileDigits,
    toLocalMobile,
    AREA_CODE_MAX_LENGTH,
    PHONE_DIGITS,
    areaCodeError,
    areaCodeKeyFilter,
    phoneError,
    phoneKeyFilter,
    sanitizeAreaCode,
    sanitizePhone,
    nameError,
    nameKeyFilter,
    normalizeSpaces,
    sanitizeName,
    sanitizeSuffix,
    suffixError,
    suffixKeyFilter,
    SUFFIX_MAX_LENGTH,
} from "../../../../utils/inputRules";

const HONORIFICS = [
    "Mr.",
    "Ms.",
    "Mrs.",
    "Engr.",
    "Arch.",
    "Hon.",
    "Dr.",
    "Atty.",
    "Prof.",
];

const SUFFIXES = ["Jr.", "Sr.", "III", "IV", "V"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Client-only fields. Lead source and referral are recorded on each project.
interface ClientFormState {
    honorific: string;
    lastName: string;
    firstName: string;
    middleName: string;
    suffix: string;
    mobileNumber: string; // 10 digits, without +63
    phoneArea: string;
    phoneNumber: string; // 7 digits, without area code
    emailAddress: string;
    companyName: string;
}

type FormErrors = Partial<Record<keyof ClientFormState, string>>;

// Form order. Used to focus the first invalid field on submit.
const FIELD_ORDER: (keyof ClientFormState)[] = [
    "honorific",
    "lastName",
    "firstName",
    "middleName",
    "suffix",
    "mobileNumber",
    "phoneArea",
    "phoneNumber",
    "emailAddress",
    "companyName",
];

const emptyForm = (): ClientFormState => ({
    honorific: "",
    lastName: "",
    firstName: "",
    middleName: "",
    suffix: "",
    mobileNumber: "",
    phoneArea: "",
    phoneNumber: "",
    emailAddress: "",
    companyName: "",
});

// Matches a typed suffix to the list, ignoring case and the period.
// "jr" becomes "Jr.". Other values are kept as typed.
function normalizeSuffix(value: string): string {
    const typed = value.trim();
    const bare = typed.replace(/\.$/, "").toLowerCase();

    const match = SUFFIXES.find(
        (item) => item.replace(/\.$/, "").toLowerCase() === bare
    );

    return match ?? typed;
}

// Builds the stored name, for example "Dr. Dela Cruz, Juan Lopez, Jr."
function composeClientName(form: ClientFormState): string {
    const head = `${form.honorific} ${normalizeSpaces(form.lastName)}`;
    const middle = normalizeSpaces(form.middleName);
    const middlePart = middle ? ` ${middle}` : "";
    const given = `${normalizeSpaces(form.firstName)}${middlePart}`;
    const suffix = normalizeSuffix(form.suffix);

    return suffix ? `${head}, ${given}, ${suffix}` : `${head}, ${given}`;
}

// Splits a stored name back into its parts. Names saved in another format
// go into last name, and the user is asked to complete the other parts.
function parseClientName(
    value: string
): Pick<
    ClientFormState,
    "honorific" | "lastName" | "firstName" | "middleName" | "suffix"
> {
    const [head = "", given = "", suffix = ""] = value.split(", ");
    const honorific =
        HONORIFICS.find((item) => head.startsWith(`${item} `)) ?? "";

    if (!honorific) {
        return {
            honorific: "",
            lastName: value,
            firstName: "",
            middleName: "",
            suffix: "",
        };
    }

    const words = given.split(" ").filter(Boolean);
    const firstName = words.shift() ?? "";
    const middleName = words.join(" ");

    return {
        honorific,
        lastName: head.slice(honorific.length + 1),
        firstName,
        middleName,
        suffix,
    };
}

// Splits a stored number such as "02-1234567" into area code and 7 digits.
function parsePhone(stored: string): Pick<
    ClientFormState,
    "phoneArea" | "phoneNumber"
> {
    const digits = stored.replace(/\D/g, "");

    if (digits.length > PHONE_DIGITS) {
        return {
            phoneArea: digits.slice(0, digits.length - PHONE_DIGITS),
            phoneNumber: digits.slice(-PHONE_DIGITS),
        };
    }

    return { phoneArea: "", phoneNumber: digits };
}

/*
 * FIELD WRAPPER
 * Small label above the input, red asterisk when required, error or hint
 * underneath. Local so the layout does not depend on shared form components.
 */
function Field({
    id,
    label,
    required,
    error,
    hint,
    className = "",
    children,
}: {
    id: string;
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={className}>
            <label
                htmlFor={id}
                className="mb-1.5 block text-xs font-medium text-slate-600"
            >
                {label}
                {required && (
                    <span className="ml-0.5 text-red-600" aria-hidden="true">
                        *
                    </span>
                )}
            </label>

            {children}

            {error ? (
                <p
                    id={`${id}-error`}
                    className="mt-1.5 text-xs font-medium text-red-600"
                >
                    {error}
                </p>
            ) : hint ? (
                <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}

export default function ClientProfileForm() {
    const navigate = useNavigate();
    const { id } = useParams();

    const isEdit = Boolean(id);

    const [form, setForm] = useState<ClientFormState>(emptyForm);
    const [accountManagerName, setAccountManagerName] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

    // One message is shown under the telephone row, for either input.
    const phoneFieldError = fieldErrors.phoneArea ?? fieldErrors.phoneNumber;

    /*
     * LOAD EXISTING CLIENT (edit mode)
     */
    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError("");

                if (id) {
                    const existing = await getClientProfile(id);

                    if (cancelled) return;

                    setForm({
                        ...parseClientName(existing.clientName ?? ""),
                        mobileNumber: toLocalMobile(
                            existing.mobileNumber ?? ""
                        ),
                        ...parsePhone(existing.phoneNumber ?? ""),
                        emailAddress: existing.emailAddress ?? "",
                        companyName: "",
                    });

                    setAccountManagerName(existing.accountManagerName ?? "");
                }
            } catch (err) {
                console.error("Load client form error:", err);

                if (cancelled) return;

                if (axios.isAxiosError(err) && err.response?.status === 403) {
                    setError(
                        "Only Account Managers can access this client form."
                    );
                } else if (
                    axios.isAxiosError(err) &&
                    err.response?.status === 404
                ) {
                    setError("Client profile not found.");
                } else {
                    setError("Unable to load the client profile form.");
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
     * Clears the field's error as soon as the user edits it.
     */
    const updateField = <K extends keyof ClientFormState>(
        field: K,
        value: ClientFormState[K]
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setFieldErrors((current) => {
            const next = { ...current };
            delete next[field];
            return next;
        });

        setError("");
    };

    /*
     * VALIDATION
     * Key filters and sanitizers stop most bad input while typing. These
     * checks cover the final value on submit.
     */
    const validate = (data: ClientFormState): FormErrors => {
        const errors: FormErrors = {};

        if (!data.honorific) {
            errors.honorific = "Choose an honorific.";
        } else if (!HONORIFICS.includes(data.honorific)) {
            errors.honorific = "Choose an honorific from the list.";
        }

        const lastNameError = nameError(data.lastName, "last");
        if (lastNameError) errors.lastName = lastNameError;

        const firstNameError = nameError(data.firstName, "first");
        if (firstNameError) errors.firstName = firstNameError;

        if (data.middleName.trim()) {
            const middleError = nameError(data.middleName, "middle");
            if (middleError) errors.middleName = middleError;
        }

        const suffixMessage = suffixError(data.suffix);
        if (suffixMessage) errors.suffix = suffixMessage;

        const mobileMessage = mobileDigitsError(data.mobileNumber);
        if (mobileMessage) errors.mobileNumber = mobileMessage;

        const areaMessage = areaCodeError(data.phoneArea, data.phoneNumber);
        if (areaMessage) errors.phoneArea = areaMessage;

        const phoneMessage = phoneError(data.phoneArea, data.phoneNumber);
        if (phoneMessage) errors.phoneNumber = phoneMessage;

        const email = data.emailAddress.trim();

        if (!email) {
            errors.emailAddress = "Enter an email address.";
        } else if (email.length > 255 || !EMAIL_PATTERN.test(email)) {
            errors.emailAddress = "Enter a valid email address.";
        }

        if (data.companyName.trim().length > 200) {
            errors.companyName = "Company name cannot exceed 200 characters.";
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

        const firstInvalid = FIELD_ORDER.find((field) => errors[field]);

        if (firstInvalid) {
            setError("Check the highlighted fields and try again.");
            document.getElementById(firstInvalid)?.focus();
            return;
        }

        // Company name is validated but not sent yet. The API has no field
        // for it until the backend is extended.
        const clientBody: SaveClient = {
            clientName: composeClientName(form),
            mobileNumber: `+63${form.mobileNumber}`,
            phoneNumber: form.phoneNumber
                ? `${form.phoneArea}-${form.phoneNumber}`
                : "",
            emailAddress: form.emailAddress.trim(),
        };

        try {
            setSaving(true);

            if (id) {
                await updateClient(id, clientBody);

                setSuccess("Client profile updated successfully.");
            } else {
                const saved = await createClientProfile(clientBody);

                navigate(`/Sales/AccountManager/customers/${saved.id}`, {
                    replace: true,
                });

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
                        data?.message ?? "Some client information is invalid."
                    );
                } else if (err.response?.status === 403) {
                    setError("You do not have permission to save this client.");
                } else {
                    setError(
                        data?.message ?? "Unable to save the client profile."
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
            <DashboardLayout department="Sales" position="AccountManager">
                <div role="status" className="animate-pulse space-y-4">
                    <div className="h-10 w-72 rounded-lg bg-slate-200" />
                    <div className="h-72 rounded-2xl bg-slate-100" />
                    <span className="sr-only">Loading client profile...</span>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout department="Sales" position="AccountManager">
            {/* HEADER */}
            <header className="mb-6 flex items-start gap-3">
                <button
                    type="button"
                    onClick={() => navigate("/Sales/AccountManager/customers")}
                    aria-label="Back to client profiles"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                    <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                    >
                        <path d="M16 10H4M9 5l-5 5 5 5" />
                    </svg>
                </button>

                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                        {isEdit ? "Edit client" : "Register new client"}
                    </h1>

                    <p className="mt-0.5 text-xs text-slate-500">
                        Enter the client's details. You can add leads once
                        they're registered.
                    </p>
                </div>
            </header>

            {/* ERROR */}
            {error && (
                <div
                    role="alert"
                    className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {/* SUCCESS */}
            {success && (
                <div
                    role="status"
                    className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                >
                    {success}
                </div>
            )}

            <form
                onSubmit={handleSave}
                noValidate
                className="rounded-2xl bg-white p-6 shadow-sm md:p-8"
            >
                <div className="grid gap-x-4 gap-y-5 md:grid-cols-12">
                    {/* ROW 1: NAME */}
                    <Field
                        id="honorific"
                        label="Honorific"
                        required
                        error={fieldErrors.honorific}
                        className="md:col-span-2"
                    >
                        <select
                            id="honorific"
                            className={fieldClass(Boolean(fieldErrors.honorific))}
                            value={form.honorific}
                            {...inputAria("honorific", fieldErrors.honorific)}
                            onChange={(e) =>
                                updateField("honorific", e.target.value)
                            }
                        >
                            <option value="">Select</option>
                            {HONORIFICS.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field
                        id="lastName"
                        label="Last name"
                        required
                        error={fieldErrors.lastName}
                        className="md:col-span-3"
                    >
                        <input
                            id="lastName"
                            type="text"
                            maxLength={50}
                            autoComplete="family-name"
                            className={fieldClass(Boolean(fieldErrors.lastName))}
                            placeholder="Last name"
                            value={form.lastName}
                            {...inputAria("lastName", fieldErrors.lastName)}
                            onKeyDown={nameKeyFilter}
                            onChange={(e) =>
                                updateField(
                                    "lastName",
                                    sanitizeName(e.target.value)
                                )
                            }
                        />
                    </Field>

                    <Field
                        id="firstName"
                        label="First name"
                        required
                        error={fieldErrors.firstName}
                        className="md:col-span-3"
                    >
                        <input
                            id="firstName"
                            type="text"
                            maxLength={50}
                            autoComplete="given-name"
                            className={fieldClass(Boolean(fieldErrors.firstName))}
                            placeholder="First name"
                            value={form.firstName}
                            {...inputAria("firstName", fieldErrors.firstName)}
                            onKeyDown={nameKeyFilter}
                            onChange={(e) =>
                                updateField(
                                    "firstName",
                                    sanitizeName(e.target.value)
                                )
                            }
                        />
                    </Field>

                    <Field
                        id="middleName"
                        label="Middle name"
                        error={fieldErrors.middleName}
                        className="md:col-span-2"
                    >
                        <input
                            id="middleName"
                            type="text"
                            maxLength={255}
                            autoComplete="additional-name"
                            className={fieldClass(
                                Boolean(fieldErrors.middleName)
                            )}
                            placeholder="Lopez"
                            value={form.middleName}
                            {...inputAria(
                                "middleName",
                                fieldErrors.middleName
                            )}
                            onKeyDown={nameKeyFilter}
                            onChange={(e) =>
                                updateField(
                                    "middleName",
                                    sanitizeName(e.target.value)
                                )
                            }
                        />
                    </Field>

                    <Field
                        id="suffix"
                        label="Suffix"
                        error={fieldErrors.suffix}
                        className="md:col-span-2"
                    >
                        <input
                            id="suffix"
                            type="text"
                            list="suffix-options"
                            maxLength={SUFFIX_MAX_LENGTH}
                            autoComplete="off"
                            className={fieldClass(Boolean(fieldErrors.suffix))}
                            placeholder="Jr."
                            value={form.suffix}
                            {...inputAria("suffix", fieldErrors.suffix)}
                            onKeyDown={suffixKeyFilter}
                            onChange={(e) =>
                                updateField(
                                    "suffix",
                                    sanitizeSuffix(e.target.value)
                                )
                            }
                            onBlur={(e) =>
                                updateField(
                                    "suffix",
                                    normalizeSuffix(e.target.value)
                                )
                            }
                        />
                        <datalist id="suffix-options">
                            {SUFFIXES.map((item) => (
                                <option key={item} value={item} />
                            ))}
                        </datalist>
                    </Field>

                    {/* ROW 2: CONTACT AND COMPANY */}
                    <Field
                        id="mobileNumber"
                        label="Mobile number"
                        required
                        error={fieldErrors.mobileNumber}
                        hint="10 digits after +63"
                        className="md:col-span-4"
                    >
                        <div className="relative">
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-y-0 left-0 flex select-none items-center border-r border-slate-200 px-3.5 text-[15px] font-medium text-slate-500"
                            >
                                +63
                            </span>

                            <input
                                id="mobileNumber"
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel-national"
                                // Above 10 so a pasted "+639171234567" is not
                                // cut off before the sanitizer strips the prefix.
                                maxLength={MOBILE_DIGITS + 4}
                                className={fieldClass(
                                    Boolean(fieldErrors.mobileNumber)
                                )}
                                style={{ paddingLeft: "4.25rem" }}
                                placeholder="9171234567"
                                value={form.mobileNumber}
                                {...inputAria(
                                    "mobileNumber",
                                    fieldErrors.mobileNumber
                                )}
                                onKeyDown={mobileDigitsKeyFilter}
                                onChange={(e) =>
                                    updateField(
                                        "mobileNumber",
                                        sanitizeMobileDigits(e.target.value)
                                    )
                                }
                            />
                        </div>
                    </Field>

                    <Field
                        id="phoneArea"
                        label="Telephone number"
                        error={phoneFieldError}
                        hint="Area code and 7-digit number"
                        className="md:col-span-4"
                    >
                        <div className="mt-2 flex items-center gap-2 [&_input]:mt-0">
                            <div className="w-20 shrink-0">
                                <input
                                    id="phoneArea"
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    maxLength={AREA_CODE_MAX_LENGTH}
                                    className={`${fieldClass(
                                        Boolean(fieldErrors.phoneArea)
                                    )} text-center`}
                                    placeholder="02"
                                    aria-label="Area code"
                                    value={form.phoneArea}
                                    {...inputAria("phoneArea", phoneFieldError)}
                                    onKeyDown={areaCodeKeyFilter}
                                    onChange={(e) =>
                                        updateField("phoneArea", sanitizeAreaCode(e.target.value))
                                    }
                                />
                            </div>

                            <span aria-hidden="true" className="text-slate-400">
                                -
                            </span>

                            <div className="min-w-0 flex-1">
                                <input
                                    id="phoneNumber"
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="tel-national"
                                    maxLength={PHONE_DIGITS}
                                    className={fieldClass(Boolean(fieldErrors.phoneNumber))}
                                    placeholder="1234567"
                                    aria-label="Telephone number"
                                    value={form.phoneNumber}
                                    {...inputAria("phoneArea", phoneFieldError)}
                                    onKeyDown={phoneKeyFilter}
                                    onChange={(e) =>
                                        updateField("phoneNumber", sanitizePhone(e.target.value))
                                    }
                                />
                                </div>
                            </div>
                    </Field>

                    <Field
                        id="emailAddress"
                        label="Email address"
                        required
                        error={fieldErrors.emailAddress}
                        className="md:col-span-4"
                    >
                        <input
                            id="emailAddress"
                            type="email"
                            maxLength={255}
                            autoComplete="email"
                            className={fieldClass(
                                Boolean(fieldErrors.emailAddress)
                            )}
                            placeholder="example@company.com"
                            value={form.emailAddress}
                            {...inputAria(
                                "emailAddress",
                                fieldErrors.emailAddress
                            )}
                            onChange={(e) =>
                                updateField("emailAddress", e.target.value)
                            }
                        />
                    </Field>

                    <Field
                        id="companyName"
                        label="Company name"
                        error={fieldErrors.companyName}
                        className="md:col-span-4"
                    >
                        <input
                            id="companyName"
                            type="text"
                            maxLength={200}
                            autoComplete="organization"
                            className={fieldClass(
                                Boolean(fieldErrors.companyName)
                            )}
                            placeholder="Company name (optional)"
                            value={form.companyName}
                            {...inputAria(
                                "companyName",
                                fieldErrors.companyName
                            )}
                            onChange={(e) =>
                                updateField("companyName", e.target.value)
                            }
                        />
                    </Field>

                    {/* ROW 3: ACCOUNT MANAGER */}
                    <div className="md:col-span-4">
                        <p className="mb-1.5 text-xs font-medium text-slate-600">
                            Account manager
                        </p>

                        <div className="flex h-11 items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3.5 text-[15px] text-slate-600">
                            {accountManagerName || "Assigned from your login"}
                        </div>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/Sales/AccountManager/customers")
                        }
                        disabled={saving}
                        className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-950 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        {saving
                            ? "Saving..."
                            : isEdit
                                ? "Update client"
                                : "Register client"}
                    </button>
                </div>
            </form>
        </DashboardLayout>
    );
}
