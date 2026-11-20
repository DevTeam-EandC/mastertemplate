import type { ElevatorDetail } from "../../../../api/clientProfile.types";
import { normalizeSpaces } from "../../../../utils/inputRules";
import { calculateElevatorPrice } from "../../../../utils/pricing";

/*
 * Project form model: field state, validation for each step, and the mapping
 * from elevator specs to the one-row-per-elevator shape the API stores.
 */

export const BUILDING_TYPE_MAX = 100;
export const REFERRAL_MAX = 200;
export const INSTRUCTIONS_MAX = 1000;
export const SHAFT_MAX = 500;
export const TOTAL_MIN = 1;
export const TOTAL_MAX = 100;

export type StepNumber = 1 | 2 | 3;

// Keyed by field id, for example "buildingType", "totalElevators" or "spec-2-ratedCapacity".
export type Errors = Record<string, string>;

// Project-level fields. Lead information lives here, not on the client.
export interface ProjectFormState {
    buildingType: string;
    salesOfficerUserId: string;
    quotationType: string;
    leadSource: string;
    referralBy: string;
    specialInstructions: string;
}

// A set of identical elevators. Quantity is how many elevators share these specs.
// Numbers are kept as digit strings while typing.
export interface ElevatorSpec {
    key: string;
    quantity: string;
    elevatorType: string;
    ratedCapacity: string;
    numberOfFloors: string;
    numberOfStops: string;
    numberOfOpenings: string;
    machineRoomType: string;
    typeOfDoor: string;
    elevatorControlSystem: string;
    shaftExisting: boolean;
    shaftDetails: string;
}

// Car code prefix per elevator type. Keys must match the elevator types from the options API.
const CODE_PREFIX_BY_TYPE: Partial<Record<string, string>> = {
    Passenger: "PE",
    Freight: "FE",
    Hospital: "HE",
    Residential: "RE",
};

export function codePrefixFor(type: string): string | null {
    return CODE_PREFIX_BY_TYPE[type] ?? null;
}

let specCounter = 0;

export function nextSpecKey(): string {
    specCounter += 1;
    return String(specCounter);
}

export function newSpec(quantity = ""): ElevatorSpec {
    return {
        key: nextSpecKey(),
        quantity,
        elevatorType: "",
        ratedCapacity: "",
        numberOfFloors: "",
        numberOfStops: "",
        numberOfOpenings: "",
        machineRoomType: "",
        typeOfDoor: "",
        elevatorControlSystem: "",
        shaftExisting: false,
        shaftDetails: "",
    };
}

export const emptyProject = (): ProjectFormState => ({
    buildingType: "",
    salesOfficerUserId: "",
    quotationType: "",
    leadSource: "",
    referralBy: "",
    specialInstructions: "",
});

export function specFieldId(key: string, field: keyof ElevatorSpec): string {
    return `spec-${key}-${field}`;
}

export function withoutErrors(
    errors: Errors,
    match: (key: string) => boolean
): Errors {
    return Object.fromEntries(
        Object.entries(errors).filter(([key]) => !match(key))
    );
}

// Whole-number text to a count. Empty or invalid text counts as 0.
export function parseCount(value: string): number {
    const count = Number(value);
    return Number.isFinite(count) ? count : 0;
}

export function allocatedCount(specs: ElevatorSpec[]): number {
    return specs.reduce((sum, spec) => sum + parseCount(spec.quantity), 0);
}

/*
 * PRICING
 * Price for one elevator built from a spec, or null until the type,
 * capacity and floors are filled in.
 */
export function specPrice(spec: ElevatorSpec): number | null {
    return calculateElevatorPrice({
        elevatorType: spec.elevatorType,
        ratedCapacityKg: Number(spec.ratedCapacity),
        numberOfFloors: Number(spec.numberOfFloors),
    });
}

// Estimated total across all specs. Null until every spec is priced.
export function estimateTotal(specs: ElevatorSpec[]): number | null {
    if (specs.length === 0) return null;

    let total = 0;

    for (const spec of specs) {
        const unit = specPrice(spec);
        const quantity = parseCount(spec.quantity);

        if (unit === null || quantity < 1) return null;

        total += unit * quantity;
    }

    return total;
}

/*
 * VALIDATION
 */
export function validateLead(form: ProjectFormState): Errors {
    const errors: Errors = {};
    const buildingType = normalizeSpaces(form.buildingType);

    if (!buildingType) {
        errors.buildingType = "Enter the building type.";
    } else if (buildingType.length > BUILDING_TYPE_MAX) {
        errors.buildingType = `Building type cannot exceed ${BUILDING_TYPE_MAX} characters.`;
    }

    if (!form.salesOfficerUserId) {
        errors.salesOfficerUserId = "Choose a sales officer.";
    }

    if (!form.quotationType) {
        errors.quotationType = "Choose a quotation type.";
    }

    if (!form.leadSource) {
        errors.leadSource = "Choose a lead source.";
    }

    if (form.referralBy.trim().length > REFERRAL_MAX) {
        errors.referralBy = `Referral name cannot exceed ${REFERRAL_MAX} characters.`;
    }

    if (form.specialInstructions.trim().length > INSTRUCTIONS_MAX) {
        errors.specialInstructions = `Special instructions cannot exceed ${INSTRUCTIONS_MAX} characters.`;
    }

    return errors;
}

export function validateTotal(value: string): Errors {
    if (!value) {
        return { totalElevators: "Enter the total number of elevators." };
    }

    const count = parseCount(value);

    if (count < TOTAL_MIN || count > TOTAL_MAX) {
        return {
            totalElevators: `Enter between ${TOTAL_MIN} and ${TOTAL_MAX} elevators.`,
        };
    }

    return {};
}

export function validateSpec(spec: ElevatorSpec): Errors {
    const errors: Errors = {};
    const id = (field: keyof ElevatorSpec) => specFieldId(spec.key, field);

    if (parseCount(spec.quantity) < 1) {
        errors[id("quantity")] = "Enter at least 1 elevator.";
    }

    if (!spec.elevatorType) {
        errors[id("elevatorType")] = "Choose an elevator type.";
    }

    if (!spec.ratedCapacity || Number(spec.ratedCapacity) <= 0) {
        errors[id("ratedCapacity")] = "Enter the rated capacity in kg.";
    }

    if (!spec.numberOfFloors || Number(spec.numberOfFloors) < 1) {
        errors[id("numberOfFloors")] = "Enter at least 1 floor.";
    }

    if (spec.numberOfStops === "") {
        errors[id("numberOfStops")] = "Enter the number of stops.";
    }

    if (spec.numberOfOpenings === "") {
        errors[id("numberOfOpenings")] = "Enter the number of openings.";
    }

    if (!spec.machineRoomType) {
        errors[id("machineRoomType")] = "Choose a machine room type.";
    }

    if (!spec.typeOfDoor) {
        errors[id("typeOfDoor")] = "Choose a door type.";
    }

    if (!spec.elevatorControlSystem) {
        errors[id("elevatorControlSystem")] = "Choose a control system.";
    }

    if (spec.shaftExisting) {
        const details = normalizeSpaces(spec.shaftDetails);

        if (!details) {
            errors[id("shaftDetails")] = "Describe the existing shaft.";
        } else if (details.length > SHAFT_MAX) {
            errors[id("shaftDetails")] = `Shaft details cannot exceed ${SHAFT_MAX} characters.`;
        }
    }

    return errors;
}

export function validateSpecs(specs: ElevatorSpec[], total: number): Errors {
    if (specs.length === 0) {
        return { allocation: "Add at least one elevator specification." };
    }

    const errors: Errors = {};

    for (const spec of specs) {
        Object.assign(errors, validateSpec(spec));
    }

    const allocated = allocatedCount(specs);

    if (allocated !== total) {
        errors.allocation = `Specs quantities must total ${total}. Currently allocated: ${allocated}.`;
    }

    return errors;
}

/*
 * SAVE MAPPING
 * The API stores one entry per elevator, so each spec expands into
 * `quantity` identical entries. The count must equal numberOfElevators.
 */
export function toElevatorDetails(specs: ElevatorSpec[]): ElevatorDetail[] {
    return specs.flatMap((spec) => {
        const detail: ElevatorDetail = {
            elevatorType: spec.elevatorType,
            ratedCapacity: spec.ratedCapacity,
            numberOfFloors: Number(spec.numberOfFloors),
            numberOfStops: Number(spec.numberOfStops),
            numberOfOpenings: Number(spec.numberOfOpenings),
            machineRoomType: spec.machineRoomType,
            typeOfDoor: spec.typeOfDoor,
            elevatorControlSystem: spec.elevatorControlSystem,
            shaftExisting: spec.shaftExisting,
            shaftDetails: spec.shaftExisting
                ? normalizeSpaces(spec.shaftDetails)
                : null,
        };

        return Array.from({ length: parseCount(spec.quantity) }, () => ({
            ...detail,
        }));
    });
}

/*
 * CAR CODE PREVIEW
 * Codes run in order under each prefix, so specs of the same type stay
 * sequential. Nothing here is saved.
 */
const formatCode = (prefix: string, n: number) =>
    `${prefix}-${String(n).padStart(2, "0")}`;

export function carCodePreview(
    specs: ElevatorSpec[]
): { key: string; code: string }[] {
    const nextByPrefix = new Map<string, number>();

    return specs.map((spec) => {
        const quantity = parseCount(spec.quantity);
        const prefix = codePrefixFor(spec.elevatorType);

        if (!prefix || quantity < 1) {
            return { key: spec.key, code: "—" };
        }

        const start = (nextByPrefix.get(prefix) ?? 0) + 1;
        const end = start + quantity - 1;
        nextByPrefix.set(prefix, end);

        const first = formatCode(prefix, start);

        return {
            key: spec.key,
            code: quantity === 1 ? first : `${first} – ${formatCode(prefix, end)}`,
        };
    });
}
