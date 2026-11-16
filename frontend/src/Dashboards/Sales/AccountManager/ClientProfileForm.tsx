
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import DashboardLayout from "../../../components/DashboardLayout";

import {
    createClientProfile,
    getClientProfile,
    getClientProfileOptions,
    addProject,
    updateClient,
    updateProject,
    sendClientProfileToDesign,
} from "../../../api/clientProfileApi";

import type {
    ClientProfileOptions,
    ElevatorDetail,
    SaveClient,
    SaveProject,
} from "../../../api/clientProfile.types";

const MAX_ELEVATORS = 50;

type ClientProfileFormValues = SaveClient & SaveProject;

const emptyElevator = (): ElevatorDetail => ({
    elevatorType: "",
    ratedCapacity: "",
    numberOfFloors: 0,
    numberOfStops: 0,
    numberOfOpenings: 0,
    machineRoomType: "",
    typeOfDoor: "",
    elevatorControlSystem: "",
    shaftExisting: false,
});

const emptyForm = (): ClientProfileFormValues => ({
    clientName: "",
    contactNumber: "",
    emailAddress: "",
    leadSource: "",
    referralBy: null,

    buildingType: "",
    salesOfficerUserId: "",
    quotationType: "",
    specialInstructions: null,
    numberOfElevators: 1,
    elevators: [emptyElevator()],
});

const fieldClass =
    "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 disabled:bg-slate-100 disabled:text-slate-500";

const labelClass = "block text-sm font-medium text-slate-700";

function Section({
    id,
    title,
    description,
    children,
}: {
    id: string;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section
            aria-labelledby={id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"
        >
            <div className="mb-6">
                <h2 id={id} className="text-base font-semibold text-slate-900">
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

function ReadOnlyField({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint?: string;
}) {
    return (
        <div>
            <span className={labelClass}>{label}</span>

            <div className="mt-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                {value}
            </div>

            {hint && (
                <p className="mt-1 text-xs text-slate-500">
                    {hint}
                </p>
            )}
        </div>
    );
}

export default function ClientProfileForm() {
    const navigate = useNavigate();
    const { id } = useParams();

    const isEdit = Boolean(id);

    const [options, setOptions] =
        useState<ClientProfileOptions | null>(null);

    const [form, setForm] =
        useState<ClientProfileFormValues>(emptyForm);

    // Client ID
    const [profileId, setProfileId] =
        useState<string | null>(id ?? null);

    // Project ID
    const [projectId, setProjectId] =
        useState<string | null>(null);

    const [sentToDesign, setSentToDesign] = useState(false);
    const [accountManagerName, setAccountManagerName] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [fieldErrors, setFieldErrors] =
        useState<Record<string, string>>({});

    /*
     * LOAD FORM OPTIONS AND EXISTING CLIENT
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

                    // getClientProfile returns ClientProfile.
                    // The actual project is inside existing.projects.
                    const project = existing.projects?.[0];

                    setProfileId(existing.id);
                    setProjectId(project?.id ?? null);

                    setSentToDesign(
                        project?.isSentToDesign ?? false
                    );

                    setAccountManagerName(
                        existing.accountManagerName ?? ""
                    );

                    setForm({
                        // CLIENT INFORMATION
                        clientName: existing.clientName ?? "",
                        contactNumber: existing.contactNumber ?? "",
                        emailAddress: existing.emailAddress ?? "",
                        leadSource: existing.leadSource ?? "",
                        referralBy: existing.referralBy ?? null,

                        // PROJECT INFORMATION
                        buildingType: project?.buildingType ?? "",
                        salesOfficerUserId:
                            project?.salesOfficerUserId ?? "",
                        quotationType: project?.quotationType ?? "",
                        specialInstructions:
                            project?.specialInstructions ?? null,

                        numberOfElevators:
                            project?.numberOfElevators ?? 1,

                        elevators:
                            project?.elevators?.length
                                ? project.elevators
                                : [emptyElevator()],
                    });
                }
            } catch (err) {
                console.error("Load client profile error:", err);

                if (cancelled) return;

                if (
                    axios.isAxiosError(err) &&
                    err.response?.status === 403
                ) {
                    setError(
                        "Only Account Managers can create client profiles."
                    );
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

    const readOnly = sentToDesign;

    /*
     * KEEP ELEVATOR DETAILS IN SYNC WITH QUANTITY
     */
    const setElevatorCount = (count: number) => {
        const safe = Math.min(
            Math.max(Math.trunc(count) || 0, 0),
            MAX_ELEVATORS
        );

        setForm((current) => {
            const elevators = [...current.elevators];

            while (elevators.length < safe) {
                elevators.push(emptyElevator());
            }

            while (elevators.length > safe) {
                elevators.pop();
            }

            return {
                ...current,
                numberOfElevators: safe,
                elevators,
            };
        });
    };

    /*
     * UPDATE ONE ELEVATOR
     */
    const updateElevator = (
        index: number,
        patch: Partial<ElevatorDetail>
    ) => {
        setForm((current) => ({
            ...current,
            elevators: current.elevators.map((item, i) =>
                i === index
                    ? { ...item, ...patch }
                    : item
            ),
        }));
    };

    /*
     * VALIDATION
     */
    const validate = (
        data: ClientProfileFormValues
    ): Record<string, string> => {
        const errors: Record<string, string> = {};

        if (!data.clientName.trim()) {
            errors.clientName = "Enter the client name.";
        }

        if (!data.contactNumber.trim()) {
            errors.contactNumber = "Enter a contact number.";
        }

        if (!/^\S+@\S+\.\S+$/.test(data.emailAddress.trim())) {
            errors.emailAddress = "Enter a valid email address.";
        }

        if (!data.buildingType.trim()) {
            errors.buildingType = "Enter the building type.";
        }

        if (!data.salesOfficerUserId) {
            errors.salesOfficerUserId = "Choose a Sales Officer.";
        }

        if (!data.leadSource) {
            errors.leadSource = "Choose a lead source.";
        }

        if (!data.quotationType) {
            errors.quotationType = "Choose a quotation type.";
        }

        if (
            data.numberOfElevators < 1 ||
            data.numberOfElevators > MAX_ELEVATORS
        ) {
            errors.numberOfElevators =
                `Enter between 1 and ${MAX_ELEVATORS} elevators.`;
        }

        if (
            data.elevators.length !== data.numberOfElevators
        ) {
            errors.numberOfElevators =
                "Elevator details must match the elevator quantity.";
        }

        data.elevators.forEach((e, i) => {
            const n = i + 1;

            if (!e.elevatorType) {
                errors[`elevators.${i}.elevatorType`] =
                    `Elevator ${n}: choose a type.`;
            }

            if (!e.ratedCapacity.trim()) {
                errors[`elevators.${i}.ratedCapacity`] =
                    `Elevator ${n}: enter the rated capacity.`;
            }

            if (e.numberOfFloors < 1) {
                errors[`elevators.${i}.numberOfFloors`] =
                    `Elevator ${n}: enter the number of floors.`;
            }

            if (e.numberOfStops < 1) {
                errors[`elevators.${i}.numberOfStops`] =
                    `Elevator ${n}: enter the number of stops.`;
            }

            if (e.numberOfOpenings < 1) {
                errors[`elevators.${i}.numberOfOpenings`] =
                    `Elevator ${n}: enter the number of openings.`;
            }

            if (!e.machineRoomType) {
                errors[`elevators.${i}.machineRoomType`] =
                    `Elevator ${n}: choose a machine room type.`;
            }

            if (!e.typeOfDoor) {
                errors[`elevators.${i}.typeOfDoor`] =
                    `Elevator ${n}: choose a door type.`;
            }

            if (!e.elevatorControlSystem) {
                errors[`elevators.${i}.elevatorControlSystem`] =
                    `Elevator ${n}: choose a control system.`;
            }
        });

        return errors;
    };

    /*
     * SAVE CLIENT AND PROJECT
     */
    const handleSave = async (event: FormEvent) => {
        event.preventDefault();

        if (readOnly) return;

        const errors = validate(form);

        setFieldErrors(errors);
        setSuccess("");

        if (Object.keys(errors).length > 0) {
            setError(
                "Check the highlighted fields and try again."
            );
            return;
        }

        // CLIENT PAYLOAD
        const clientBody: SaveClient = {
            clientName: form.clientName.trim(),
            contactNumber: form.contactNumber.trim(),
            emailAddress: form.emailAddress.trim(),
            leadSource: form.leadSource,
            referralBy: form.referralBy?.trim() || null,
        };

        // PROJECT PAYLOAD
        const projectBody: SaveProject = {
            buildingType: form.buildingType.trim(),
            salesOfficerUserId: form.salesOfficerUserId,
            quotationType: form.quotationType,
            specialInstructions:
                form.specialInstructions?.trim() || null,
            numberOfElevators: form.numberOfElevators,
            elevators: form.elevators,
        };

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            /*
             * CREATE NEW CLIENT + PROJECT
             */
            if (!profileId) {
                const saved = await createClientProfile({
                    client: clientBody,
                    project: projectBody,
                });

                setProfileId(saved.clientId);
                setProjectId(saved.id);

                setSuccess(
                    "Client profile created successfully."
                );

                navigate(
                    `/Sales/AccountManager/customers/${saved.clientId}/edit`,
                    { replace: true }
                );

                return;
            }

            /*
             * UPDATE EXISTING CLIENT
             */
            await updateClient(profileId, clientBody);

            /*
             * UPDATE EXISTING PROJECT
             * OR CREATE A PROJECT IF NONE EXISTS
             */
            if (projectId) {
                await updateProject(projectId, projectBody);
            } else {
                const savedProject = await addProject(
                    profileId,
                    projectBody
                );

                setProjectId(savedProject.id);
            }

            setSuccess(
                "Client profile updated successfully."
            );
        } catch (err) {
            console.error("Save client profile error:", err);

            if (axios.isAxiosError(err)) {
                const data = err.response?.data as
                    | { message?: string }
                    | undefined;

                setError(
                    data?.message ??
                    (err.response?.status === 409
                        ? "This profile was already sent to design."
                        : "Unable to save the client profile.")
                );
            } else {
                setError("Unable to save the client profile.");
            }
        } finally {
            setSaving(false);
        }
    };

    /*
     * SEND PROJECT TO DESIGN
     */
    const handleSendToDesign = async () => {
        if (!projectId) {
            setError(
                "Save the project before sending it to Design."
            );
            return;
        }

        const confirmed = window.confirm(
            "Send this project to the Design Specialist? You will not be able to edit it afterwards."
        );

        if (!confirmed) return;

        try {
            setSending(true);
            setError("");
            setSuccess("");

            // IMPORTANT: This endpoint requires PROJECT ID.
            await sendClientProfileToDesign(projectId);

            setSentToDesign(true);

            setSuccess(
                "Project successfully sent to the Design Specialist."
            );
        } catch (err) {
            console.error("Send to Design error:", err);

            if (axios.isAxiosError(err)) {
                const data = err.response?.data as
                    | { message?: string }
                    | undefined;

                setError(
                    data?.message ??
                    "Unable to send the project to Design."
                );
            } else {
                setError(
                    "Unable to send the project to Design."
                );
            }
        } finally {
            setSending(false);
        }
    };

    /*
     * LOADING SCREEN
     */
    if (loading) {
        return (
            <DashboardLayout
                department="Sales"
                position="AccountManager"
            >
                <p className="text-sm text-slate-500">
                    Loading client profile…
                </p>
            </DashboardLayout>
        );
    }

    const elevatorCountOk =
        form.elevators.length === form.numberOfElevators;

    return (
        <DashboardLayout
            department="Sales"
            position="AccountManager"
        >
            {/* HEADER */}
            <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/Sales/AccountManager/customers"
                            )
                        }
                        className="text-sm font-medium text-slate-500 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                        ← Back to client profiles
                    </button>

                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                        {isEdit
                            ? "Edit client profile"
                            : "New client profile"}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Client, project and elevator details for
                        the Design team.
                    </p>
                </div>

                {sentToDesign && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        Sent to Design · Read only
                    </span>
                )}
            </header>

            {/* ERROR MESSAGE */}
            {error && (
                <div
                    role="alert"
                    className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {/* SUCCESS MESSAGE */}
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
                    description="Who the quotation is for."
                >
                    <div>
                        <label
                            htmlFor="clientName"
                            className={labelClass}
                        >
                            Client name
                        </label>

                        <input
                            id="clientName"
                            className={fieldClass}
                            value={form.clientName}
                            disabled={readOnly}
                            aria-invalid={Boolean(
                                fieldErrors.clientName
                            )}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    clientName: e.target.value,
                                })
                            }
                        />

                        {fieldErrors.clientName && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.clientName}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="contactNumber"
                            className={labelClass}
                        >
                            Contact number
                        </label>

                        <input
                            id="contactNumber"
                            type="tel"
                            className={fieldClass}
                            value={form.contactNumber}
                            disabled={readOnly}
                            aria-invalid={Boolean(
                                fieldErrors.contactNumber
                            )}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    contactNumber: e.target.value,
                                })
                            }
                        />

                        {fieldErrors.contactNumber && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.contactNumber}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="emailAddress"
                            className={labelClass}
                        >
                            Email address
                        </label>

                        <input
                            id="emailAddress"
                            type="email"
                            className={fieldClass}
                            value={form.emailAddress}
                            disabled={readOnly}
                            aria-invalid={Boolean(
                                fieldErrors.emailAddress
                            )}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    emailAddress: e.target.value,
                                })
                            }
                        />

                        {fieldErrors.emailAddress && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.emailAddress}
                            </p>
                        )}
                    </div>
                </Section>

                {/* PROJECT INFORMATION */}
                <Section
                    id="project-information"
                    title="Client project information"
                    description="The building, sales owner and how the lead came in."
                >
                    <div>
                        <label
                            htmlFor="buildingType"
                            className={labelClass}
                        >
                            Building type
                        </label>

                        <input
                            id="buildingType"
                            className={fieldClass}
                            value={form.buildingType}
                            disabled={readOnly}
                            aria-invalid={Boolean(
                                fieldErrors.buildingType
                            )}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    buildingType: e.target.value,
                                })
                            }
                        />

                        {fieldErrors.buildingType && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.buildingType}
                            </p>
                        )}
                    </div>

                    <ReadOnlyField
                        label="Project type"
                        value={options?.projectType ?? "Private"}
                    />

                    <div>
                        <label
                            htmlFor="salesOfficer"
                            className={labelClass}
                        >
                            Sales Officer
                        </label>

                        <select
                            id="salesOfficer"
                            className={fieldClass}
                            value={form.salesOfficerUserId}
                            disabled={readOnly}
                            aria-invalid={Boolean(
                                fieldErrors.salesOfficerUserId
                            )}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    salesOfficerUserId: e.target.value,
                                })
                            }
                        >
                            <option value="">
                                Select a Sales Officer
                            </option>

                            {options?.salesOfficers.map((o) => (
                                <option
                                    key={o.userId}
                                    value={o.userId}
                                >
                                    {o.fullName}
                                </option>
                            ))}
                        </select>

                        {fieldErrors.salesOfficerUserId && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.salesOfficerUserId}
                            </p>
                        )}
                    </div>

                    <ReadOnlyField
                        label="Account Manager"
                        value={
                            accountManagerName ||
                            "Assigned to you automatically"
                        }
                        hint="Set from your login when the profile is saved."
                    />

                    <div>
                        <label
                            htmlFor="leadSource"
                            className={labelClass}
                        >
                            Lead / source
                        </label>

                        <select
                            id="leadSource"
                            className={fieldClass}
                            value={form.leadSource}
                            disabled={readOnly}
                            aria-invalid={Boolean(
                                fieldErrors.leadSource
                            )}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    leadSource: e.target.value,
                                })
                            }
                        >
                            <option value="">
                                Select a source
                            </option>

                            {options?.leadSources.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>

                        {fieldErrors.leadSource && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.leadSource}
                            </p>
                        )}
                    </div>

                    <ReadOnlyField
                        label="Type of unit"
                        value={
                            options?.defaultTypeOfUnit ??
                            "New Unit Without Inspection"
                        }
                    />

                    <div>
                        <label
                            htmlFor="referralBy"
                            className={labelClass}
                        >
                            Referral by
                        </label>

                        <input
                            id="referralBy"
                            className={fieldClass}
                            value={form.referralBy ?? ""}
                            disabled={readOnly}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    referralBy: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="quotationType"
                            className={labelClass}
                        >
                            Quotation type
                        </label>

                        <select
                            id="quotationType"
                            className={fieldClass}
                            value={form.quotationType}
                            disabled={readOnly}
                            aria-invalid={Boolean(
                                fieldErrors.quotationType
                            )}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    quotationType: e.target.value,
                                })
                            }
                        >
                            <option value="">
                                Select a quotation type
                            </option>

                            {options?.quotationTypes.map((q) => (
                                <option key={q} value={q}>
                                    {q}
                                </option>
                            ))}
                        </select>

                        {fieldErrors.quotationType && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.quotationType}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="specialInstructions"
                            className={labelClass}
                        >
                            Special instructions / others
                        </label>

                        <textarea
                            id="specialInstructions"
                            rows={4}
                            className={fieldClass}
                            value={form.specialInstructions ?? ""}
                            disabled={readOnly}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    specialInstructions: e.target.value,
                                })
                            }
                        />
                    </div>
                </Section>

                {/* ELEVATOR QUANTITY */}
                <Section
                    id="elevator-quantity"
                    title="Quantity of elevators"
                    description="Set how many elevators this quotation covers. One detail block is created for each."
                >
                    <div>
                        <label
                            htmlFor="numberOfElevators"
                            className={labelClass}
                        >
                            Number of elevators
                        </label>

                        <input
                            id="numberOfElevators"
                            type="number"
                            min={1}
                            max={MAX_ELEVATORS}
                            className={fieldClass}
                            value={form.numberOfElevators}
                            disabled={readOnly}
                            aria-invalid={Boolean(
                                fieldErrors.numberOfElevators
                            )}
                            onChange={(e) =>
                                setElevatorCount(
                                    Number(e.target.value)
                                )
                            }
                        />

                        {fieldErrors.numberOfElevators && (
                            <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.numberOfElevators}
                            </p>
                        )}
                    </div>
                </Section>

                {/* ELEVATOR DETAILS */}
                {form.elevators.map((e, index) => {
                    const key = (name: string) =>
                        `elevators.${index}.${name}`;

                    const n = index + 1;

                    return (
                        <Section
                            key={index}
                            id={`elevator-${n}`}
                            title={`Elevator ${n}`}
                            description="Elevator inputs for this unit."
                        >
                            {/* ELEVATOR TYPE */}
                            <div>
                                <label
                                    htmlFor={`e${n}-type`}
                                    className={labelClass}
                                >
                                    Type of elevator
                                </label>

                                <select
                                    id={`e${n}-type`}
                                    className={fieldClass}
                                    value={e.elevatorType}
                                    disabled={readOnly}
                                    aria-invalid={Boolean(
                                        fieldErrors[key("elevatorType")]
                                    )}
                                    onChange={(ev) =>
                                        updateElevator(index, {
                                            elevatorType: ev.target.value,
                                        })
                                    }
                                >
                                    <option value="">
                                        Select a type
                                    </option>

                                    {options?.elevatorTypes.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>

                                {fieldErrors[key("elevatorType")] && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {fieldErrors[key("elevatorType")]}
                                    </p>
                                )}
                            </div>

                            {/* RATED CAPACITY */}
                            <div>
                                <label
                                    htmlFor={`e${n}-capacity`}
                                    className={labelClass}
                                >
                                    Rated capacity
                                </label>

                                <input
                                    id={`e${n}-capacity`}
                                    className={fieldClass}
                                    value={e.ratedCapacity}
                                    disabled={readOnly}
                                    aria-invalid={Boolean(
                                        fieldErrors[key("ratedCapacity")]
                                    )}
                                    onChange={(ev) =>
                                        updateElevator(index, {
                                            ratedCapacity: ev.target.value,
                                        })
                                    }
                                />

                                {fieldErrors[key("ratedCapacity")] && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {fieldErrors[key("ratedCapacity")]}
                                    </p>
                                )}
                            </div>

                            {/* NUMBER OF FLOORS */}
                            <div>
                                <label
                                    htmlFor={`e${n}-floors`}
                                    className={labelClass}
                                >
                                    Number of floors
                                </label>

                                <input
                                    id={`e${n}-floors`}
                                    type="number"
                                    min={1}
                                    className={fieldClass}
                                    value={e.numberOfFloors || ""}
                                    disabled={readOnly}
                                    aria-invalid={Boolean(
                                        fieldErrors[key("numberOfFloors")]
                                    )}
                                    onChange={(ev) =>
                                        updateElevator(index, {
                                            numberOfFloors: Number(
                                                ev.target.value
                                            ),
                                        })
                                    }
                                />

                                {fieldErrors[key("numberOfFloors")] && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {fieldErrors[key("numberOfFloors")]}
                                    </p>
                                )}
                            </div>

                            {/* NUMBER OF STOPS */}
                            <div>
                                <label
                                    htmlFor={`e${n}-stops`}
                                    className={labelClass}
                                >
                                    Number of stops
                                </label>

                                <input
                                    id={`e${n}-stops`}
                                    type="number"
                                    min={1}
                                    className={fieldClass}
                                    value={e.numberOfStops || ""}
                                    disabled={readOnly}
                                    aria-invalid={Boolean(
                                        fieldErrors[key("numberOfStops")]
                                    )}
                                    onChange={(ev) =>
                                        updateElevator(index, {
                                            numberOfStops: Number(
                                                ev.target.value
                                            ),
                                        })
                                    }
                                />

                                {fieldErrors[key("numberOfStops")] && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {fieldErrors[key("numberOfStops")]}
                                    </p>
                                )}
                            </div>

                            {/* NUMBER OF OPENINGS */}
                            <div>
                                <label
                                    htmlFor={`e${n}-openings`}
                                    className={labelClass}
                                >
                                    Number of openings
                                </label>

                                <input
                                    id={`e${n}-openings`}
                                    type="number"
                                    min={1}
                                    className={fieldClass}
                                    value={e.numberOfOpenings || ""}
                                    disabled={readOnly}
                                    aria-invalid={Boolean(
                                        fieldErrors[key("numberOfOpenings")]
                                    )}
                                    onChange={(ev) =>
                                        updateElevator(index, {
                                            numberOfOpenings: Number(
                                                ev.target.value
                                            ),
                                        })
                                    }
                                />

                                {fieldErrors[key("numberOfOpenings")] && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {fieldErrors[key("numberOfOpenings")]}
                                    </p>
                                )}
                            </div>

                            {/* MACHINE ROOM TYPE */}
                            <div>
                                <label
                                    htmlFor={`e${n}-machine`}
                                    className={labelClass}
                                >
                                    Machine room type
                                </label>

                                <select
                                    id={`e${n}-machine`}
                                    className={fieldClass}
                                    value={e.machineRoomType}
                                    disabled={readOnly}
                                    aria-invalid={Boolean(
                                        fieldErrors[key("machineRoomType")]
                                    )}
                                    onChange={(ev) =>
                                        updateElevator(index, {
                                            machineRoomType: ev.target.value,
                                        })
                                    }
                                >
                                    <option value="">
                                        Select a machine room type
                                    </option>

                                    {options?.machineRoomTypes.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>

                                {fieldErrors[key("machineRoomType")] && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {fieldErrors[key("machineRoomType")]}
                                    </p>
                                )}
                            </div>

                            {/* TYPE OF DOOR */}
                            <div>
                                <label
                                    htmlFor={`e${n}-door`}
                                    className={labelClass}
                                >
                                    Type of door
                                </label>

                                <select
                                    id={`e${n}-door`}
                                    className={fieldClass}
                                    value={e.typeOfDoor}
                                    disabled={readOnly}
                                    aria-invalid={Boolean(
                                        fieldErrors[key("typeOfDoor")]
                                    )}
                                    onChange={(ev) =>
                                        updateElevator(index, {
                                            typeOfDoor: ev.target.value,
                                        })
                                    }
                                >
                                    <option value="">
                                        Select a door type
                                    </option>

                                    {options?.doorTypes.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>

                                {fieldErrors[key("typeOfDoor")] && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {fieldErrors[key("typeOfDoor")]}
                                    </p>
                                )}
                            </div>

                            {/* CONTROL SYSTEM */}
                            <div>
                                <label
                                    htmlFor={`e${n}-control`}
                                    className={labelClass}
                                >
                                    Elevator control system
                                </label>

                                <select
                                    id={`e${n}-control`}
                                    className={fieldClass}
                                    value={e.elevatorControlSystem}
                                    disabled={readOnly}
                                    aria-invalid={Boolean(
                                        fieldErrors[
                                        key("elevatorControlSystem")
                                        ]
                                    )}
                                    onChange={(ev) =>
                                        updateElevator(index, {
                                            elevatorControlSystem:
                                                ev.target.value,
                                        })
                                    }
                                >
                                    <option value="">
                                        Select a control system
                                    </option>

                                    {options?.controlSystems.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>

                                {fieldErrors[
                                    key("elevatorControlSystem")
                                ] && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {
                                                fieldErrors[
                                                key("elevatorControlSystem")
                                                ]
                                            }
                                        </p>
                                    )}
                            </div>

                            {/* SHAFT EXISTING */}
                            <div>
                                <label
                                    htmlFor={`e${n}-shaft`}
                                    className={labelClass}
                                >
                                    Shaft existing
                                </label>

                                <select
                                    id={`e${n}-shaft`}
                                    className={fieldClass}
                                    value={
                                        e.shaftExisting ? "yes" : "no"
                                    }
                                    disabled={readOnly}
                                    onChange={(ev) =>
                                        updateElevator(index, {
                                            shaftExisting:
                                                ev.target.value === "yes",
                                        })
                                    }
                                >
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>
                        </Section>
                    );
                })}

                {!elevatorCountOk && (
                    <p
                        role="alert"
                        className="text-sm text-red-600"
                    >
                        The number of elevator blocks does not match
                        the quantity.
                    </p>
                )}

                {/* ACTION BUTTONS */}
                <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
                    {!readOnly && (
                        <button
                            type="submit"
                            disabled={saving || sending}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-blue-600"
                        >
                            {saving
                                ? "Saving…"
                                : "Save profile"}
                        </button>
                    )}

                    {projectId && !sentToDesign && (
                        <button
                            type="button"
                            onClick={handleSendToDesign}
                            disabled={sending || saving}
                            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            {sending
                                ? "Sending…"
                                : "Send to Design Specialist"}
                        </button>
                    )}
                </div>
            </form>
        </DashboardLayout>
    );
}
