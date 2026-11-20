import type { KeyboardEvent } from "react";

/*
 * Input rules shared by the client and project forms.
 *
 * Each restricted field uses two layers:
 *  1. A key filter (onKeyDown) that stops a disallowed character from being typed.
 *  2. A sanitizer (onChange) that removes disallowed characters that still arrive,
 *     for example pasted or autofilled text.
 * The *Error helpers check the final value when the form is submitted.
 */

type KeyFilter = (event: KeyboardEvent<HTMLInputElement>) => void;

// Only single printable characters are filtered. Shortcuts (Ctrl, Cmd, Alt)
// and navigation keys such as Backspace or arrows always pass through.
function isPrintableKey(event: KeyboardEvent<HTMLInputElement>): boolean {
    return (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
    );
}

function allowKeys(pattern: RegExp): KeyFilter {
    return (event) => {
        if (isPrintableKey(event) && !pattern.test(event.key)) {
            event.preventDefault();
        }
    };
}

export function normalizeSpaces(value: string): string {
    return value.trim().replace(/\s+/g, " ");
}

/*
 * NAMES
 * Letters, spaces, hyphens (-) and apostrophes (').
 * A hyphen or apostrophe must sit between two letters.
 */
export const NAME_MAX_LENGTH = 50;
const NAME_CHAR = /^[\p{L} '-]$/u;
const NAME_DISALLOWED = /[^\p{L} '-]/gu;
const NAME_PATTERN = /^\p{L}+(?:[ '-]\p{L}+)*$/u;

export const nameKeyFilter = allowKeys(NAME_CHAR);

export function sanitizeName(value: string): string {
    return value.replace(NAME_DISALLOWED, "");
}

export function nameError(raw: string, label: string): string | null {
    const value = normalizeSpaces(raw);

    if (!value) {
        return `Enter the ${label} name.`;
    }

    if (value.length > NAME_MAX_LENGTH) {
        return `The ${label} name cannot exceed ${NAME_MAX_LENGTH} characters.`;
    }

    if (!NAME_PATTERN.test(value)) {
        return "Use letters only. A hyphen (-) or apostrophe (') is allowed between letters.";
    }

    return null;
}

/*
 * SUFFIX
 * Up to 5 letters with an optional period, for example Jr. or III.
 */
export const SUFFIX_MAX_LENGTH = 6;
const SUFFIX_CHAR = /^[A-Za-z.]$/;
const SUFFIX_PATTERN = /^[A-Za-z]{1,5}\.?$/;

export const suffixKeyFilter = allowKeys(SUFFIX_CHAR);

export function sanitizeSuffix(value: string): string {
    return value.replace(/[^A-Za-z.]/g, "").slice(0, SUFFIX_MAX_LENGTH);
}

export function suffixError(raw: string): string | null {
    const value = raw.trim();

    if (!value) return null;

    return SUFFIX_PATTERN.test(value)
        ? null
        : "Use up to 5 letters, with an optional period. For example, Jr. or III.";
}

/*
 * MOBILE NUMBER
 * The +63 prefix is fixed in the UI. Only the 10 digits after it are typed
 * and kept in state, for example 9171234567.
 */
export const MOBILE_DIGITS = 10;

export const mobileDigitsKeyFilter = allowKeys(/^[0-9]$/);

// Keeps digits only. Pasted "+63 917..." or "0917..." is trimmed to the 10 digits.
export function sanitizeMobileDigits(value: string): string {
    let digits = value.replace(/\D/g, "");

    if (digits.startsWith("63") && digits.length > MOBILE_DIGITS) {
        digits = digits.slice(2);
    } else if (digits.startsWith("0")) {
        digits = digits.slice(1);
    }

    return digits.slice(0, MOBILE_DIGITS);
}

// Converts a stored number such as "+639171234567" or "0917-123-4567"
// back to the 10 digits shown in the input.
export function toLocalMobile(stored: string): string {
    return sanitizeMobileDigits(stored);
}

export function mobileDigitsError(value: string): string | null {
    if (!value) return "Enter a mobile number.";

    if (!/^9\d{9}$/.test(value)) {
        return "Enter 10 digits starting with 9, e.g. 9171234567.";
    }

    return null;
}

/*
 * TELEPHONE NUMBER
 * Area code (0 + 1 or 2 digits, e.g. 02 or 032) and a 7-digit number.
 * Both are optional, but if one is filled the other is required.
 */
export const AREA_CODE_MAX_LENGTH = 3;
export const PHONE_DIGITS = 7;

export const areaCodeKeyFilter = allowKeys(/^[0-9]$/);
export const phoneKeyFilter = allowKeys(/^[0-9]$/);

export function sanitizeAreaCode(value: string): string {
    return value.replace(/\D/g, "").slice(0, AREA_CODE_MAX_LENGTH);
}

export function sanitizePhone(value: string): string {
    return value.replace(/\D/g, "").slice(0, PHONE_DIGITS);
}

export function areaCodeError(area: string, number: string): string | null {
    if (!area && !number) return null;

    if (!area) return "Enter the area code.";

    if (!/^0\d{1,2}$/.test(area)) {
        return "Area code starts with 0, e.g. 02 or 032.";
    }

    return null;
}

export function phoneError(area: string, number: string): string | null {
    if (!area && !number) return null;

    if (!number) return "Enter the telephone number.";

    if (number.length !== PHONE_DIGITS) {
        return `Enter ${PHONE_DIGITS} digits.`;
    }

    return null;
}

/*
 * DIGITS
 * Whole numbers such as capacity, floors, stops and openings.
 */
export const digitKeyFilter = allowKeys(/^[0-9]$/);

export function sanitizeDigits(value: string): string {
    return value.replace(/\D/g, "");
}
