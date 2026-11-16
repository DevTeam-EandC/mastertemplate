import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import DashboardLayout from "../../../components/DashboardLayout";
import { listMyClientProfiles } from "../../../api/clientProfileApi";
import type { ClientProfile } from "../../../api/clientProfile.types";

export default function ClientProfileList() {
    const [profiles, setProfiles] = useState<ClientProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        listMyClientProfiles()
            .then((data) => {
                if (!cancelled) setProfiles(data);
            })
            .catch(() => {
                if (!cancelled) setError("Unable to load client profiles.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <DashboardLayout department="Sales" position="AccountManager">
            <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                        Client profiles
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Profiles you have created for clients and elevator quotations.
                    </p>
                </div>

                <Link
                    to="/Sales/AccountManager/customers/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                    <Plus size={18} aria-hidden="true" />
                    New client profile
                </Link>
            </header>

            {error && (
                <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <p className="text-sm text-slate-500">Loading profiles…</p>
            ) : profiles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <h2 className="font-semibold text-slate-900">No client profiles yet</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Create a profile to start a quotation for a client.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <tr>
                                <th scope="col" className="px-5 py-3">Client</th>
                                <th scope="col" className="px-5 py-3">Building</th>
                                <th scope="col" className="px-5 py-3">Elevators</th>
                                <th scope="col" className="px-5 py-3">Sales Officer</th>
                                <th scope="col" className="px-5 py-3">Status</th>
                                <th scope="col" className="px-5 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {profiles.map((profile) => (
                                <tr key={profile.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-4 font-medium text-slate-900">{profile.clientName}</td>
                                    <td className="px-5 py-4 text-slate-600">{profile.buildingType}</td>
                                    <td className="px-5 py-4 tabular-nums text-slate-600">{profile.numberOfElevators}</td>
                                    <td className="px-5 py-4 text-slate-600">{profile.salesOfficerName}</td>
                                    <td className="px-5 py-4">
                                        {profile.isSentToDesign ? (
                                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                                Sent to design
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                Draft
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <Link
                                            to={`/Sales/AccountManager/customers/${profile.id}/edit`}
                                            className="font-medium text-blue-700 hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-blue-600"
                                        >
                                            {profile.isSentToDesign ? "View" : "Edit"}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
}
