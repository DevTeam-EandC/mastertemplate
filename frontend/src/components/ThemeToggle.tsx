import { useState } from "react";
import { Moon, Sun } from "lucide-react";

import { applyTheme, getInitialTheme, saveTheme, type Theme } from "../theme/theme";

interface ThemeToggleProps {
    className?: string;
}

// Switches between light and dark. The icon shows the mode the button switches to.
export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    const isDark = theme === "dark";
    const label = isDark ? "Switch to light mode" : "Switch to dark mode";

    const handleToggle = () => {
        const next: Theme = isDark ? "light" : "dark";
        applyTheme(next);
        saveTheme(next);
        setTheme(next);
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
            aria-label={label}
            title={label}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 ${className}`}
        >
            {isDark ? (
                <Sun size={18} aria-hidden="true" />
            ) : (
                <Moon size={18} aria-hidden="true" />
            )}
        </button>
    );
}
