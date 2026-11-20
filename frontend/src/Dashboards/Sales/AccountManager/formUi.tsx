import type { ReactNode } from "react";

// Shared form layout and field styles for the client and project forms.

export const labelClass = "block text-sm font-medium text-slate-700";

export function fieldClass(hasError: boolean, multiline = false): string {
    return [
        "mt-2 block w-full rounded-xl border bg-white px-3.5 text-[15px] text-slate-900 shadow-sm placeholder:text-slate-400",
        multiline ? "min-h-24 py-2.5" : "h-11",
        "transition-colors hover:border-slate-400",
        "focus:outline-none focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/30",
        "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
        hasError ? "border-red-500 ring-1 ring-red-500/30" : "border-slate-300",
    ].join(" ");
}

// Accessibility attributes for a control that may show an error.
export function inputAria(id: string, error?: string) {
    return {
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? `${id}-error` : undefined,
    };
}

export function FormSection({
    id,
    title,
    description,
    children,
}: {
    id: string;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section
            aria-labelledby={id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
            <header className="mb-6 border-b border-slate-100 pb-5">
                <h2 id={id} className="text-lg font-semibold text-slate-900">
                    {title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
            </header>

            <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-6">
                {children}
            </div>
        </section>
    );
}

export function Field({
    id,
    label,
    error,
    hint,
    span = "md:col-span-2",
    children,
}: {
    id: string;
    label: string;
    error?: string;
    hint?: string;
    span?: string;
    children: ReactNode;
}) {
    return (
        <div className={span}>
            <label htmlFor={id} className={labelClass}>
                {label}
            </label>

            {children}

            {hint && !error ? (
                <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
            ) : null}

            {error ? (
                <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
