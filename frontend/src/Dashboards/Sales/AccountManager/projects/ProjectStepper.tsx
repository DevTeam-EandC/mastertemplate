import type { ReactNode } from "react";
import { Check } from "lucide-react";
import type { StepNumber } from "./projectFormModel";

export const btnSecondary =
    "rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

export const btnPrimary =
    "rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

export const STEPS: {
    number: StepNumber;
    label: string;
    heading: string;
    description: string;
}[] = [
    {
        number: 1,
        label: "Lead information",
        heading: "Lead information",
        description:
            "Lead identification, sales assignment, and source details.",
    },
    {
        number: 2,
        label: "Total quantity",
        heading: "Total quantity of elevators",
        description:
            "Declare the total number of elevators, then allocate them into elevator specifications in the next step.",
    },
    {
        number: 3,
        label: "Elevator specifications",
        heading: "Elevator specifications",
        description:
            "Elevators with the same type and specifications share one set of specs. Different specifications need separate sets.",
    },
];

interface ProjectStepperProps {
    current: StepNumber;
    // Only completed steps can be reopened from the stepper.
    onSelect: (step: StepNumber) => void;
}

export default function ProjectStepper({
    current,
    onSelect,
}: ProjectStepperProps) {
    return (
        <nav aria-label="Project form steps" className="mb-6">
            <ol className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {STEPS.map((step) => {
                    const isCurrent = step.number === current;
                    const isDone = step.number < current;

                    const itemClass = [
                        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                        isCurrent
                            ? "border-blue-700 bg-white shadow-sm"
                            : "border-slate-200 bg-slate-50",
                    ].join(" ");

                    const content = (
                        <>
                            <span
                                aria-hidden="true"
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                    isCurrent || isDone
                                        ? "bg-blue-700 text-white"
                                        : "bg-slate-200 text-slate-600"
                                }`}
                            >
                                {isDone ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    step.number
                                )}
                            </span>
                            <span
                                className={
                                    isCurrent
                                        ? "font-semibold text-slate-900"
                                        : "font-medium text-slate-600"
                                }
                            >
                                {step.label}
                            </span>
                        </>
                    );

                    return (
                        <li key={step.number}>
                            {isDone ? (
                                <button
                                    type="button"
                                    onClick={() => onSelect(step.number)}
                                    className={`${itemClass} hover:border-slate-300 focus-visible:outline-2 focus-visible:outline-blue-600`}
                                >
                                    {content}
                                </button>
                            ) : (
                                <div
                                    aria-current={isCurrent ? "step" : undefined}
                                    className={itemClass}
                                >
                                    {content}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

interface StepCardProps {
    number: StepNumber;
    heading: string;
    description: string;
    footer: ReactNode;
    children: ReactNode;
}

export function StepCard({
    number,
    heading,
    description,
    footer,
    children,
}: StepCardProps) {
    const step = STEPS[number - 1];

    return (
        <section
            aria-labelledby={`step-${number}-heading`}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
            <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4">
                <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-900 text-xs font-semibold text-white"
                >
                    {number}
                </span>
                <span className="text-sm font-semibold text-slate-900">
                    {step.label}
                </span>
                <span className="ml-auto text-xs text-slate-500">
                    Step {number} of {STEPS.length}
                </span>
            </div>

            <div className="p-6 md:p-8">
                <div className="mb-6 border-b border-slate-100 pb-5">
                    <h2
                        id={`step-${number}-heading`}
                        tabIndex={-1}
                        className="text-lg font-semibold text-slate-900 focus:outline-none"
                    >
                        {heading}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                </div>

                {children}
            </div>

            {footer}
        </section>
    );
}
