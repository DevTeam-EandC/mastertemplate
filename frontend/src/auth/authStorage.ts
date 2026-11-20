// Storage for the signed-in session.
// "Remember me" on:  tokens go to localStorage and survive closing the browser.
// "Remember me" off: tokens go to sessionStorage and are cleared when the browser closes.
// The sidebar preference is not part of the session and stays in localStorage.

const SESSION_KEYS = [
    "accessToken",
    "refreshToken",
    "user",
    "dashboards",
    "activeDashboard",
] as const;

export type SessionKey = (typeof SESSION_KEYS)[number];

// Reads from localStorage first, then sessionStorage.
export function getAuthItem(key: SessionKey): string | null {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

// True when the current session was saved with "Remember me".
export function isRememberedSession(): boolean {
    return localStorage.getItem("accessToken") !== null;
}

// Writes one value to the chosen storage and removes any copy in the other one.
export function setAuthItem(
    key: SessionKey,
    value: string,
    remember: boolean
): void {
    const target = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;

    other.removeItem(key);
    target.setItem(key, value);
}

export function removeAuthItem(key: SessionKey): void {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
}

export function clearAuthSession(): void {
    for (const key of SESSION_KEYS) {
        removeAuthItem(key);
    }
}
