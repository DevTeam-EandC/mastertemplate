import { useEffect, useState } from "react";

import DashboardLayout from "../../../components/DashboardLayout";
import { listClientProfilesForDesign } from "../../../api/clientProfileApi";
import type { ClientProfile } from "../../../api/clientProfile.types";

const dl = "grid grid-cols-2 gap-x-6 gap-y-3 text-sm";

function Fact({ label, value }: { label: string; value: string | number | null }) {
    return (
        <div>
            <dt className="text-xs font-medium text-slate-500">{label}</dt>
            <dd className="mt-0.5 text-slate-900">{value || "—"}</dd>
        </div>
    );
}

export default function DesignClientReferences() {
    const [profiles, setProfiles] = useState<ClientProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        listClientProfilesForDesign()
            .then((data) => {
                if (!cancelled) setProfiles(data);
            })
            .catch(() => {
                if (!cancelled) setError("Unable to load client references.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

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
                    Client profiles sent by Sales. Read only.
                </p>
            </header>

            {error && (
                <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <p className="text-sm text-slate-500">Loading references…</p>
            ) : profiles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <h2 className="font-semibold text-slate-900">No references yet</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Profiles appear here once Sales sends them to design.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {profiles.map((profile) => (
                        <article
                            key={profile.id}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <header className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
                                <h2 className="text-lg font-semibold text-slate-900">{profile.clientName}</h2>
                                <p className="text-xs text-slate-500">
                                    Sent {profile.sentToDesignAtUtc ? new Date(profile.sentToDesignAtUtc).toLocaleString() : "—"}
                                </p>
                            </header>

                            <dl className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-slate-700">Client</h3>
                                    <dl className={dl}>
                                        <Fact label="Contact number" value={profile.contactNumber} />
                                        <Fact label="Email" value={profile.emailAddress} />
                                    </dl>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-slate-700">Project</h3>
                                    <dl className={dl}>
                                        <Fact label="Building type" value={profile.buildingType} />
                                        <Fact label="Project type" value={profile.projectType} />
                                        <Fact label="Sales Officer" value={profile.salesOfficerName} />
                                        <Fact label="Account Manager" value={profile.accountManagerName} />
                                        <Fact label="Lead / source" value={profile.leadSource} />
                                        <Fact label="Type of unit" value={profile.typeOfUnit} />
                                        <Fact label="Referral by" value={profile.referralBy} />
                                        <Fact label="Quotation type" value={profile.quotationType} />
                                    </dl>
                                    {profile.specialInstructions && (
                                        <p className="mt-4 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                                            {profile.specialInstructions}
                                        </p>
                                    )}
                                </div>
                            </dl>

                            <div className="mt-6">
                                <h3 className="mb-3 text-sm font-semibold text-slate-700">
                                    Elevators ({profile.numberOfElevators})
                                </h3>
                                <div className="overflow-x-auto rounded-lg border border-slate-200">
                                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                                        <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                                            <tr>
                                                <th scope="col" className="px-4 py-2">#</th>
                                                <th scope="col" className="px-4 py-2">Type</th>
                                                <th scope="col" className="px-4 py-2">Capacity</th>
                                                <th scope="col" className="px-4 py-2">Floors</th>
                                                <th scope="col" className="px-4 py-2">Stops</th>
                                                <th scope="col" className="px-4 py-2">Openings</th>
                                                <th scope="col" className="px-4 py-2">Machine room</th>
                                                <th scope="col" className="px-4 py-2">Door</th>
                                                <th scope="col" className="px-4 py-2">Control</th>
                                                <th scope="col" className="px-4 py-2">Shaft existing</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {profile.elevators.map((e, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2 tabular-nums">{index + 1}</td>
                                                    <td className="px-4 py-2">{e.elevatorType}</td>
                                                    <td className="px-4 py-2">{e.ratedCapacity}</td>
                                                    <td className="px-4 py-2 tabular-nums">{e.numberOfFloors}</td>
                                                    <td className="px-4 py-2 tabular-nums">{e.numberOfStops}</td>
                                                    <td className="px-4 py-2 tabular-nums">{e.numberOfOpenings}</td>
                                                    <td className="px-4 py-2">{e.machineRoomType}</td>
                                                    <td className="px-4 py-2">{e.typeOfDoor}</td>
                                                    <td className="px-4 py-2">{e.elevatorControlSystem}</td>
                                                    <td className="px-4 py-2">{e.shaftExisting ? "Yes" : "No"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
