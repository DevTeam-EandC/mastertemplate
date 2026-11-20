/*
 * Elevator price calculation for project quotations.
 *
 * PLACEHOLDER RATES: the values below are not an approved price list.
 * Replace them with the company's real rates before quoting clients.
 * Prices are estimates calculated in the browser. They are not saved by the API.
 */

export const PRICE_CURRENCY = "PHP";

// Base price per elevator type. Keys must match the elevator types returned by
// the options API. Unknown types use DEFAULT_BASE_PRICE.
const BASE_PRICE_BY_TYPE: Record<string, number> = {
    Passenger: 500000,
    Freight: 650000,
    Hospital: 750000,
    Residential: 350000,
};

const DEFAULT_BASE_PRICE = 500000;
const PRICE_PER_KG = 150;
const PRICE_PER_FLOOR = 25000;

export interface ElevatorPriceInput {
    elevatorType: string;
    ratedCapacityKg: number;
    numberOfFloors: number;
}

/*
 * Price for one elevator:
 *   base price for the type + (capacity in kg x rate per kg)
 *   + (number of floors x rate per floor)
 * Returns null until the type, capacity and floors are all filled in.
 */
export function calculateElevatorPrice(input: ElevatorPriceInput): number | null {
    if (!input.elevatorType) return null;
    if (!(input.ratedCapacityKg > 0)) return null;
    if (!(input.numberOfFloors > 0)) return null;

    const base = BASE_PRICE_BY_TYPE[input.elevatorType] ?? DEFAULT_BASE_PRICE;

    return (
        base +
        input.ratedCapacityKg * PRICE_PER_KG +
        input.numberOfFloors * PRICE_PER_FLOOR
    );
}

export function formatPrice(amount: number): string {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: PRICE_CURRENCY,
        maximumFractionDigits: 2,
    }).format(amount);
}
