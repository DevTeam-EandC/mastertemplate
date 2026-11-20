// The last successful login saved by "Remember me".
// Stored in localStorage so it survives logout and closing the browser.
// It uses its own key, not one of the session keys in authStorage.ts,
// so logout does not remove it.
//
// Security: the password is stored in plain text. Any script running on this
// site, or anyone with access to this browser profile, can read it.

const STORAGE_KEY = "rememberedLogin";

export interface RememberedLogin {
    email: string;
    password: string;
}

// Returns the saved login, or null when nothing is saved or the stored value is invalid.
export function getRememberedLogin(): RememberedLogin | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as Partial<RememberedLogin>;

        if (typeof parsed.email !== "string" || typeof parsed.password !== "string") {
            return null;
        }

        return { email: parsed.email, password: parsed.password };
    } catch {
        return null;
    }
}

export function saveRememberedLogin(email: string, password: string): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, password }));
    } catch {
        // Storage unavailable: the login is not remembered for next time.
    }
}

export function clearRememberedLogin(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Storage unavailable: there is nothing saved to clear.
    }
}
