import { Copy, Plus } from "lucide-react";

import type { ClientProfileOptions } from "../../../../api/clientProfile.types";
import { digitKeyFilter, sanitizeDigits } from "../../../../utils/inputRules";
import { formatPrice } from "../../../../utils/pricing";
import { Field, fieldClass, inputAria } from "../formUi";
import {
    BUILDING_TYPE_MAX,
    INSTRUCTIONS_MAX,
    REFERRAL_MAX,
    TOTAL_MAX,
    TOTAL_MIN,
    allocatedCount,
    codePrefixFor,
    estimateTotal,
    parseCount,
    specFieldId,
    specPrice,
    validateSpec,
    type ElevatorSpec,
    type Errors,
    type ProjectFormState,
} from "./projectFormModel";

const renderOptions = (items: string[]) =>
    items.map((item) => (
        <option key={item} value={item}>
            {item}
        </option>
    ));

const smallButton =
    "inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-white";

/* STEP 1: LEAD INFORMATION */
interface LeadStepProps {
    form: ProjectFormState;
    errors: Errors;
    options: ClientProfileOptions;
    accountManager: string;
    onChange: <K extends keyof ProjectFormState>(
        field: K,
        value: ProjectFormState[K]
    ) => void;
}

export function LeadStep({
    form,
    errors,
    options,
    accountManager,
    onChange,
}: LeadStepProps) {
    return (
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-6">
            <Field
                id="buildingType"
                label="Building type *"
                error={errors.buildingType}
                span="md:col-span-3"
            >
                <input
                    id="buildingType"
                    type="text"
                    maxLength={BUILDING_TYPE_MAX}
                    className={fieldClass(Boolean(errors.buildingType))}
                    placeholder="Enter building type"
                    value={form.buildingType}
                    {...inputAria("buildingType", errors.buildingType)}
                    onChange={(e) => onChange("buildingType", e.target.value)}
                />
            </Field>

            <Field
                id="quotationType"
                label="Quotation type *"
                error={errors.quotationType}
                span="md:col-span-3"
            >
                <select
                    id="quotationType"
                    className={fieldClass(Boolean(errors.quotationType))}
                    value={form.quotationType}
                    {...inputAria("quotationType", errors.quotationType)}
                    onChange={(e) => onChange("quotationType", e.target.value)}
                >
                    <option value="">Select a quotation type</option>
                    {renderOptions(options.quotationTypes)}
                </select>
            </Field>

            <Field
                id="salesOfficerUserId"
                label="Sales officer *"
                error={errors.salesOfficerUserId}
                span="md:col-span-3"
            >
                <select
                    id="salesOfficerUserId"
                    className={fieldClass(Boolean(errors.salesOfficerUserId))}
                    value={form.salesOfficerUserId}
                    {...inputAria("salesOfficerUserId", errors.salesOfficerUserId)}
                    onChange={(e) =>
                        onChange("salesOfficerUserId", e.target.value)
                    }
                >
                    <option value="">Select a sales officer</option>
                    {options.salesOfficers.map((officer) => (
                        <option key={officer.userId} value={officer.userId}>
                            {officer.fullName}
                        </option>
                    ))}
                </select>
            </Field>

            <Field
                id="accountManager"
                label="Account manager"
                hint="Assigned automatically."
                span="md:col-span-3"
            >
                <input
                    id="accountManager"
                    type="text"
                    readOnly
                    tabIndex={-1}
                    className={`${fieldClass(false)} cursor-not-allowed bg-slate-100 text-slate-500`}
                    value={accountManager || "—"}
                />
            </Field>

            <Field
                id="leadSource"
                label="Lead source *"
                error={errors.leadSource}
                span="md:col-span-3"
            >
                <select
                    id="leadSource"
                    className={fieldClass(Boolean(errors.leadSource))}
                    value={form.leadSource}
                    {...inputAria("leadSource", errors.leadSource)}
                    onChange={(e) => onChange("leadSource", e.target.value)}
                >
                    <option value="">Select a lead source</option>
                    {renderOptions(options.leadSources)}
                </select>
            </Field>

            <Field
                id="referralBy"
                label="Referral by (optional)"
                error={errors.referralBy}
                span="md:col-span-3"
            >
                <input
                    id="referralBy"
                    type="text"
                    maxLength={REFERRAL_MAX}
                    className={fieldClass(Boolean(errors.referralBy))}
                    placeholder="Enter referral name"
                    value={form.referralBy}
                    {...inputAria("referralBy", errors.referralBy)}
                    onChange={(e) => onChange("referralBy", e.target.value)}
                />
            </Field>

            <Field
                id="specialInstructions"
                label="Special instructions (optional)"
                error={errors.specialInstructions}
                span="md:col-span-6"
            >
                <textarea
                    id="specialInstructions"
                    rows={3}
                    maxLength={INSTRUCTIONS_MAX}
                    className={fieldClass(Boolean(errors.specialInstructions), true)}
                    placeholder="Add notes for the design team"
                    value={form.specialInstructions}
                    {...inputAria("specialInstructions", errors.specialInstructions)}
                    onChange={(e) =>
                        onChange("specialInstructions", e.target.value)
                    }
                />
            </Field>
        </div>
    );
}

/* STEP 2: TOTAL QUANTITY */
interface TotalStepProps {
    total: string;
    error?: string;
    options: ClientProfileOptions;
    onChange: (value: string) => void;
}

export function TotalStep({ total, error, options, onChange }: TotalStepProps) {
    const legend = options.elevatorTypes.flatMap((type) => {
        const prefix = codePrefixFor(type);
        return prefix ? [{ type, prefix }] : [];
    });

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-slate-300 bg-slate-50 p-6">
                <div className="max-w-xs">
                    <Field
                        id="totalElevators"
                        label="Total elevators *"
                        error={error}
                        hint={`Minimum ${TOTAL_MIN} · Maximum ${TOTAL_MAX}`}
                    >
                        <input
                            id="totalElevators"
                            type="text"
                            inputMode="numeric"
                            maxLength={3}
                            placeholder="e.g. 2"
                            className={fieldClass(Boolean(error))}
                            value={total}
                            {...inputAria("totalElevators", error)}
                            onKeyDown={digitKeyFilter}
                            onChange={(e) =>
                                onChange(sanitizeDigits(e.target.value))
                            }
                        />
                    </Field>
                </div>
            </div>

            <section
                aria-labelledby="car-codes-heading"
                className="rounded-xl border border-slate-200 p-5"
            >
                <h3
                    id="car-codes-heading"
                    className="text-sm font-semibold text-slate-900"
                >
                    Automatic car codes by elevator type
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                    Same type with different specifications stays sequential
                    under the same prefix.
                </p>

                <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {legend.map(({ type, prefix }) => (
                        <li
                            key={type}
                            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700"
                        >
                            <span>{type}</span>
                            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-700">
                                {prefix}-01
                            </span>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}

/* STEP 3: ELEVATOR SPECIFICATIONS */
interface SpecsStepProps {
    specs: ElevatorSpec[];
    total: number;
    errors: Errors;
    options: ClientProfileOptions;
    codes: { key: string; code: string }[];
    onUpdate: (key: string, patch: Partial<ElevatorSpec>) => void;
    onAdd: () => void;
    onRemove: (key: string) => void;
    onDuplicate: (key: string) => void;
}

export function SpecsStep({
    specs,
    total,
    errors,
    options,
    codes,
    onUpdate,
    onAdd,
    onRemove,
    onDuplicate,
}: SpecsStepProps) {
    const allocated = allocatedCount(specs);
    const percent =
        total > 0 ? Math.min(100, Math.round((allocated / total) * 100)) : 0;
    const mismatch = allocated !== total;
    const totalPrice = estimateTotal(specs);
    const visibleCodes = codes.filter((item) => item.code !== "—");

    return (
        <div className="space-y-6">
            <div
                id="allocation-status"
                tabIndex={-1}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5 focus:outline-none"
            >
                <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium text-slate-900">
                        Elevators allocated
                    </span>
                    <span className="tabular-nums text-slate-700">
                        {allocated} / {total}
                    </span>
                </div>

                <div
                    role="progressbar"
                    aria-label="Elevators allocated"
                    aria-valuemin={0}
                    aria-valuemax={total}
                    aria-valuenow={Math.min(allocated, total)}
                    className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
                >
                    <div
                        className={`h-full rounded-full transition-[width] ${
                            mismatch ? "bg-amber-500" : "bg-blue-700"
                        }`}
                        style={{ width: `${percent}%` }}
                    />
                </div>

                {mismatch ? (
                    <p role="status" className="mt-3 text-xs text-amber-700">
                        Specs quantities must total {total}. Currently
                        allocated: {allocated}.
                    </p>
                ) : null}
            </div>

            <div className="space-y-5">
                {specs.map((spec, index) => {
                    const id = (field: keyof ElevatorSpec) =>
                        specFieldId(spec.key, field);
                    const err = (field: keyof ElevatorSpec) =>
                        errors[id(field)];
                    const complete = Object.keys(validateSpec(spec)).length === 0;
                    const price = specPrice(spec);
                    const code =
                        codes.find((item) => item.key === spec.key)?.code ??
                        "—";

                    return (
                        <article
                            key={spec.key}
                            aria-labelledby={`spec-title-${spec.key}`}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <h3
                                        id={`spec-title-${spec.key}`}
                                        className="text-sm font-semibold text-slate-900"
                                    >
                                        Specs #{index + 1}
                                    </h3>
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            complete
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        {complete ? "Complete" : "Incomplete"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onDuplicate(spec.key)}
                                        className={smallButton}
                                    >
                                        <Copy
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                        Duplicate
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onRemove(spec.key)}
                                        disabled={specs.length === 1}
                                        className={`${smallButton} text-red-600 hover:text-red-700`}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            <p className="mt-4">
                                <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-700">
                                    {code}
                                </span>
                            </p>

                            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-6">
                                <Field
                                    id={id("quantity")}
                                    label="Quantity *"
                                    error={err("quantity")}
                                    span="md:col-span-2"
                                >
                                    <input
                                        id={id("quantity")}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={3}
                                        className={fieldClass(Boolean(err("quantity")))}
                                        value={spec.quantity}
                                        {...inputAria(id("quantity"), err("quantity"))}
                                        onKeyDown={digitKeyFilter}
                                        onChange={(e) =>
                                            onUpdate(spec.key, {
                                                quantity: sanitizeDigits(e.target.value),
                                            })
                                        }
                                    />
                                </Field>

                                <Field
                                    id={id("elevatorType")}
                                    label="Elevator type *"
                                    error={err("elevatorType")}
                                    span="md:col-span-2"
                                >
                                    <select
                                        id={id("elevatorType")}
                                        className={fieldClass(Boolean(err("elevatorType")))}
                                        value={spec.elevatorType}
                                        {...inputAria(id("elevatorType"), err("elevatorType"))}
                                        onChange={(e) =>
                                            onUpdate(spec.key, {
                                                elevatorType: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Select a type</option>
                                        {renderOptions(options.elevatorTypes)}
                                    </select>
                                </Field>

                                <Field
                                    id={id("ratedCapacity")}
                                    label="Rated capacity (kg) *"
                                    error={err("ratedCapacity")}
                                    span="md:col-span-2"
                                >
                                    <input
                                        id={id("ratedCapacity")}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="e.g. 1000"
                                        className={fieldClass(Boolean(err("ratedCapacity")))}
                                        value={spec.ratedCapacity}
                                        {...inputAria(id("ratedCapacity"), err("ratedCapacity"))}
                                        onKeyDown={digitKeyFilter}
                                        onChange={(e) =>
                                            onUpdate(spec.key, {
                                                ratedCapacity: sanitizeDigits(e.target.value),
                                            })
                                        }
                                    />
                                </Field>

                                <Field
                                    id={id("numberOfFloors")}
                                    label="Number of floors *"
                                    error={err("numberOfFloors")}
                                    span="md:col-span-2"
                                >
                                    <input
                                        id={id("numberOfFloors")}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={3}
                                        placeholder="e.g. 5"
                                        className={fieldClass(Boolean(err("numberOfFloors")))}
                                        value={spec.numberOfFloors}
                                        {...inputAria(id("numberOfFloors"), err("numberOfFloors"))}
                                        onKeyDown={digitKeyFilter}
                                        onChange={(e) =>
                                            onUpdate(spec.key, {
                                                numberOfFloors: sanitizeDigits(e.target.value),
                                            })
                                        }
                                    />
                                </Field>

                                <Field
                                    id={id("numberOfStops")}
                                    label="Number of stops *"
                                    error={err("numberOfStops")}
                                    span="md:col-span-2"
                                >
                                    <input
                                        id={id("numberOfStops")}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={3}
                                        className={fieldClass(Boolean(err("numberOfStops")))}
                                        value={spec.numberOfStops}
                                        {...inputAria(id("numberOfStops"), err("numberOfStops"))}
                                        onKeyDown={digitKeyFilter}
                                        onChange={(e) =>
                                            onUpdate(spec.key, {
                                                numberOfStops: sanitizeDigits(e.target.value),
                                            })
                                        }
                                    />
                                </Field>

                                <Field
                                    id={id("numberOfOpenings")}
                                    label="Number of openings *"
                                    error={err("numberOfOpenings")}
                                    span="md:col-span-2"
                                >
                                    <input
                                        id={id("numberOfOpenings")}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={3}
                                        className={fieldClass(Boolean(err("numberOfOpenings")))}
                                        value={spec.numberOfOpenings}
                                        {...inputAria(id("numberOfOpenings"), err("numberOfOpenings"))}
                                        onKeyDown={digitKeyFilter}
                                        onChange={(e) =>
                                            onUpdate(spec.key, {
                                                numberOfOpenings: sanitizeDigits(e.target.value),
                                            })
                                        }
                                    />
                                </Field>

                                <Field
                                    id={id("machineRoomType")}
                                    label="Machine room *"
                                    error={err("machineRoomType")}
                                    span="md:col-span-2"
                                >
                                    <select
                                        id={id("machineRoomType")}
                                        className={fieldClass(Boolean(err("machineRoomType")))}
                                        value={spec.machineRoomType}
                                        {...inputAria(id("machineRoomType"), err("machineRoomType"))}
                                        onChange={(e) =>
                                            onUpdate(spec.key, {
                                                machineRoomType: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Select a type</option>
                                        {renderOptions(options.machineRoomTypes)}
                                    </select>
                                </Field>

                                <Field
                                    id={id("typeOfDoor")}
                                    label="Door type *"
                                    error={err("typeOfDoor")}
                                    span="md:col-span-2"
                                >
                                    <select
                                        id={id("typeOfDoor")}
                                        className={fieldClass(Boolean(err("typeOfDoor")))}
                                        value={spec.typeOfDoor}
                                        {...inputAria(id("typeOfDoor"), err("typeOfDoor"))}
                                        onChange={(e) =>
                                            onUpdate(spec.key, {
                                                typeOfDoor: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Select a door type</option>
                                        {renderOptions(options.doorTypes)}
                                    </select>
                                </Field>

                                <Field
                                    id={id("elevatorControlSystem")}
                                    label="Control system *"
                                    error={err("elevatorControlSystem")}
                                    span="md:col-span-2"
                                >
                                    <select
                                        id={id("elevatorControlSystem")}
                                        className={fieldClass(Boolean(err("elevatorControlSystem")))}
                                        value={spec.elevatorControlSystem}
                                        {...inputAria(id("elevatorControlSystem"), err("elevatorControlSystem"))}
                                        onChange={(e) =>
                                            onUpdate(spec.key, {
                                                elevatorControlSystem: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Select a control system</option>
                                        {renderOptions(options.controlSystems)}
                                    </select>
                                </Field>

                                <div className="flex items-end md:col-span-2">
                                    <label className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700">
                                        <input
                                            id={id("shaftExisting")}
                                            type="checkbox"
                                            checked={spec.shaftExisting}
                                            onChange={(e) =>
                                                onUpdate(spec.key, {
                                                    shaftExisting: e.target.checked,
                                                })
                                            }
                                            className="h-4 w-4 rounded border-slate-300 text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
                                        />
                                        Shaft already exists
                                    </label>
                                </div>

                                {spec.shaftExisting ? (
                                    <Field
                                        id={id("shaftDetails")}
                                        label="Shaft details *"
                                        error={err("shaftDetails")}
                                        hint="Describe the existing shaft, for example its size, height or condition."
                                        span="md:col-span-6"
                                    >
                                        <textarea
                                            id={id("shaftDetails")}
                                            rows={3}
                                            maxLength={500}
                                            placeholder="Enter shaft details"
                                            className={fieldClass(Boolean(err("shaftDetails")), true)}
                                            value={spec.shaftDetails}
                                            {...inputAria(id("shaftDetails"), err("shaftDetails"))}
                                            onChange={(e) =>
                                                onUpdate(spec.key, {
                                                    shaftDetails: e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                ) : null}

                                <p className="text-sm text-slate-700 md:col-span-6">
                                    Price per elevator:{" "}
                                    <span className="font-semibold tabular-nums text-slate-900">
                                        {price === null
                                            ? "Enter type, capacity and floors"
                                            : formatPrice(price)}
                                    </span>
                                </p>
                            </div>
                        </article>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={onAdd}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-3 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add specs
            </button>

            <section
                aria-labelledby="codes-preview-heading"
                className="rounded-xl border border-slate-200 bg-slate-50 p-5"
            >
                <h3
                    id="codes-preview-heading"
                    className="text-sm font-semibold text-slate-900"
                >
                    All car codes (preview)
                </h3>
                {visibleCodes.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {visibleCodes.map((item) => (
                            <span
                                key={item.key}
                                className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs text-slate-700"
                            >
                                {item.code}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="mt-2 text-sm text-slate-500">
                        Choose an elevator type to see its car codes.
                    </p>
                )}
                <p className="mt-3 text-xs text-slate-500">
                    Codes are worked out from the specs and are not saved.
                </p>
            </section>

            <section
                aria-labelledby="estimate-heading"
                className="rounded-xl border border-slate-200 p-5"
            >
                <h3
                    id="estimate-heading"
                    className="text-sm font-semibold text-slate-900"
                >
                    Estimate
                </h3>

                <ul className="mt-3 divide-y divide-slate-200">
                    {specs.map((spec, index) => {
                        const unit = specPrice(spec);
                        const quantity = parseCount(spec.quantity);

                        return (
                            <li
                                key={spec.key}
                                className="flex items-center justify-between gap-4 py-3 text-sm"
                            >
                                <span className="text-slate-700">
                                    Specs #{index + 1}
                                    {spec.elevatorType
                                        ? ` · ${spec.elevatorType}`
                                        : ""}
                                    {quantity > 0 ? ` × ${quantity}` : ""}
                                </span>
                                <span className="tabular-nums text-slate-900">
                                    {unit === null || quantity < 1
                                        ? "Incomplete"
                                        : formatPrice(unit * quantity)}
                                </span>
                            </li>
                        );
                    })}
                </ul>

                <div className="mt-3 flex items-center justify-between gap-4 border-t border-slate-300 pt-4">
                    <span className="text-base font-semibold text-slate-900">
                        Total estimate
                    </span>
                    <span className="text-lg font-semibold tabular-nums text-slate-900">
                        {totalPrice === null ? "—" : formatPrice(totalPrice)}
                    </span>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                    This is an estimate, not a final quotation.
                </p>
            </section>
        </div>
    );
}
