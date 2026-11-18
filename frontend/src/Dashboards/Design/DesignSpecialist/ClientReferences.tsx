
import { useEffect, useState } from "react";

import DashboardLayout from "../../../components/DashboardLayout";
import { listClientProfilesForDesign } from "../../../api/clientProfileApi";
import type { ProjectProfile } from "../../../api/clientProfile.types";

const dl = "grid grid-cols-2 gap-x-6 gap-y-3 text-sm";

function Fact({
    label,
    value,
}: {
    label: string;
    value: string | number | null | undefined;
}) {
    return (
        <div>
            <dt className="text-xs font-medium text-slate-500">
                {label}
            </dt>
            <dd className="mt-0.5 break-words text-slate-900">
                {value !== null && value !== undefined && value !== ""
                    ? value
                    : "—"}
            </dd>
        </div>
    );
}

export default function DesignClientReferences() {
    const [profiles, setProfiles] = useState<ProjectProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadProfiles() {
            try {
                setLoading(true);
                setError("");

                const data = await listClientProfilesForDesign();

                if (!cancelled) {
                    setProfiles(data);
                }
            } catch (err) {
                console.error("Failed to load design client references:", err);

                if (!cancelled) {
                    setError("Unable to load client references. Please try again.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadProfiles();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <DashboardLayout department="Design" position="DesignSpecialist">
            <header className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                    Client references
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Client projects sent by Sales. Read only.
                </p>
            </header>

            {error && (
                <div
                    role="alert"
                    className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-sm text-slate-500">
                        Loading client references...
                    </p>
                </div>
            ) : profiles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <h2 className="font-semibold text-slate-900">
                        No references yet
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Projects appear here once Sales sends them to Design.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {profiles.map((profile) => (
                        <article
                            key={profile.id}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            {/* PROJECT HEADER */}
                            <header className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        {profile.clientName}
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Project ID: {profile.id}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                        Sent to Design
                                    </span>

                                    <p className="mt-2 text-xs text-slate-500">
                                        Sent{" "}
                                        {profile.sentToDesignAtUtc
                                            ? new Date(
                                                profile.sentToDesignAtUtc
                                            ).toLocaleString()
                                            : "—"}
                                    </p>
                                </div>
                            </header>

                            {/* CLIENT AND PROJECT INFORMATION */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <section>
                                    <h3 className="mb-3 text-sm font-semibold text-slate-700">
                                        Client Information
                                    </h3>

                                    <dl className={dl}>
                                        <Fact
                                            label="Client name"
                                            value={profile.clientName}
                                        />

                                        <Fact
                                            label="Contact number"
                                            value={profile.contactNumber}
                                        />

                                        <Fact
                                            label="Email"
                                            value={profile.emailAddress}
                                        />

                                        <Fact
                                            label="Lead / source"
                                            value={profile.leadSource}
                                        />

                                        <Fact
                                            label="Referral by"
                                            value={profile.referralBy}
                                        />

                                        <Fact
                                            label="Account Manager"
                                            value={profile.accountManagerName}
                                        />
                                    </dl>
                                </section>

                                <section>
                                    <h3 className="mb-3 text-sm font-semibold text-slate-700">
                                        Project Information
                                    </h3>

                                    <dl className={dl}>
                                        <Fact
                                            label="Building type"
                                            value={profile.buildingType}
                                        />

                                        <Fact
                                            label="Project type"
                                            value={profile.projectType}
                                        />

                                        <Fact
                                            label="Sales Officer"
                                            value={profile.salesOfficerName}
                                        />

                                        <Fact
                                            label="Type of unit"
                                            value={profile.typeOfUnit}
                                        />

                                        <Fact
                                            label="Quotation type"
                                            value={profile.quotationType}
                                        />

                                        <Fact
                                            label="Number of elevators"
                                            value={profile.numberOfElevators}
                                        />
                                    </dl>

                                    {profile.specialInstructions && (
                                        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                            <h4 className="mb-1 text-xs font-semibold text-amber-800">
                                                Special Instructions
                                            </h4>

                                            <p className="whitespace-pre-line text-sm text-amber-900">
                                                {profile.specialInstructions}
                                            </p>
                                        </div>
                                    )}
                                </section>
                            </div>

                            {/* ELEVATOR DETAILS */}
                            <section className="mt-7">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="text-sm font-semibold text-slate-700">
                                        Elevator Details
                                    </h3>

                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                        {profile.elevators?.length ?? 0} Elevator(s)
                                    </span>
                                </div>

                                {(profile.elevators?.length ?? 0) === 0 ? (
                                    <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
                                        <p className="text-sm text-slate-500">
                                            No elevator details available.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                                            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                                                <tr>
                                                    <th className="whitespace-nowrap px-4 py-3">
                                                        #
                                                    </th>
                                                    <th className="whitespace-nowrap px-4 py-3">
                                                        Type
                                                    </th>
                                                    <th className="whitespace-nowrap px-4 py-3">
                                                        Capacity
                                                    </th>
                                                    <th className="whitespace-nowrap px-4 py-3">
                                                        Floors
                                                    </th>
                                                    <th className="whitespace-nowrap px-4 py-3">
                                                        Stops
                                                    </th>
                                                    <th className="whitespace-nowrap px-4 py-3">
                                                        Openings
                                                    </th>
                                                    <th className="whitespace-nowrap px-4 py-3">
                                                        Machine Room
                                                    </th>
                                                    <th className="whitespace-nowrap px-4 py-3">
                                                        Door
                                                    </th>
                                                    <th className="whitespace-nowrap px-4 py-3">
                                                        Control
                                                    </th>
                                                    <th className="whitespace-nowrap px-4 py-3">
                                                        Shaft Existing
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-100">
                                                {profile.elevators.map(
                                                    (elevator, index) => (
                                                        <tr
                                                            key={`${profile.id}-${index}`}
                                                            className="hover:bg-slate-50"
                                                        >
                                                            <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                                                                {index + 1}
                                                            </td>

                                                            <td className="whitespace-nowrap px-4 py-3">
                                                                {elevator.elevatorType}
                                                            </td>

                                                            <td className="whitespace-nowrap px-4 py-3">
                                                                {elevator.ratedCapacity}
                                                            </td>

                                                            <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                                                                {elevator.numberOfFloors}
                                                            </td>

                                                            <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                                                                {elevator.numberOfStops}
                                                            </td>

                                                            <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                                                                {elevator.numberOfOpenings}
                                                            </td>

                                                            <td className="whitespace-nowrap px-4 py-3">
                                                                {elevator.machineRoomType}
                                                            </td>

                                                            <td className="whitespace-nowrap px-4 py-3">
                                                                {elevator.typeOfDoor}
                                                            </td>

                                                            <td className="whitespace-nowrap px-4 py-3">
                                                                {elevator.elevatorControlSystem}
                                                            </td>

                                                            <td className="whitespace-nowrap px-4 py-3">
                                                                {elevator.shaftExisting
                                                                    ? "Yes"
                                                                    : "No"}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        </article>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
