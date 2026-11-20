// Light/dark theme preference.
// The choice is saved in localStorage under "theme". When nothing is saved,
// the operating system preference is used.
// The "dark" class on <html> switches the palette (see index.css).

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

export function getStoredTheme(): Theme | null {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value === "light" || value === "dark" ? value : null;
    } catch {
        return null;
    }
}

export function getSystemTheme(): Theme {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

export function getInitialTheme(): Theme {
    return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: Theme): void {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
}

export function saveTheme(theme: Theme): void {
    try {
        localStorage.setItem(STORAGE_KEY, theme);
    } catch {
        // Storage unavailable: the choice lasts for this page view only.
    }
}

// Applies the saved or system theme before React renders, so a dark-mode
// reload does not flash light first.
applyTheme(getInitialTheme());
