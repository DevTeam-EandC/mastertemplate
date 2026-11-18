
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

        async function loadProfiles() {
            try {
                setLoading(true);
                setError("");

                const data = await listMyClientProfiles();

                if (!cancelled) {
                    setProfiles(data);
                }
            } catch (err) {
                console.error("Failed to load client profiles:", err);

                if (!cancelled) {
                    setError("Unable to load client profiles. Please try again.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadProfiles();

        return () => {
            cancelled = true;
        };
    }, []);

    // Calculate the total number of projects across all clients.
    const totalProjects = profiles.reduce(
        (total, client) => total + (client.projects?.length ?? 0),
        0
    );

    return (
        <DashboardLayout department="Sales" position="AccountManager">
            <div className="space-y-6">

                {/* Page Header */}
                <header className="flex flex-wrap items-end justify-between gap-4">
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
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
                    >
                        <Plus size={18} aria-hidden="true" />
                        New client profile
                    </Link>
                </header>

                {/* Error Message */}
                {error && (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <p className="text-sm text-slate-500">
                        Loading client profiles...
                    </p>
                ) : profiles.length === 0 ? (
                    /* Empty State */
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <h2 className="font-semibold text-slate-900">
                            No client profiles yet
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Create a profile to start a quotation for a client.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Client and Project Counts */}
                        <div className="text-sm text-slate-500">
                            {profiles.length} client(s) · {totalProjects} project(s)
                        </div>

                        {/* Client Table */}
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">

                                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3">Client</th>
                                        <th className="px-5 py-3">Building</th>
                                        <th className="px-5 py-3">Elevators</th>
                                        <th className="px-5 py-3">Sales Officer</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {profiles.map((client) => {
                                        const projects = client.projects ?? [];

                                        const totalElevators = projects.reduce(
                                            (total, project) =>
                                                total + project.numberOfElevators,
                                            0
                                        );

                                        const buildingTypes = [
                                            ...new Set(
                                                projects.map((project) => project.buildingType)
                                            ),
                                        ];

                                        const salesOfficers = [
                                            ...new Set(
                                                projects
                                                    .map((project) => project.salesOfficerName)
                                                    .filter(Boolean)
                                            ),
                                        ];

                                        const hasSentProject = projects.some(
                                            (project) => project.isSentToDesign
                                        );

                                        return (
                                            <tr
                                                key={client.id}
                                                className="hover:bg-slate-50"
                                            >
                                                {/* Client */}
                                                <td className="px-5 py-4">
                                                    <div className="font-medium text-slate-900">
                                                        {client.clientName}
                                                    </div>

                                                    <div className="mt-1 text-xs text-slate-500">
                                                        {client.emailAddress}
                                                    </div>
                                                </td>

                                                {/* Building */}
                                                <td className="px-5 py-4 text-slate-600">
                                                    {buildingTypes.length > 0
                                                        ? buildingTypes.join(", ")
                                                        : "No project yet"}
                                                </td>

                                                {/* Elevators */}
                                                <td className="px-5 py-4 tabular-nums text-slate-600">
                                                    {totalElevators}
                                                </td>

                                                {/* Sales Officer */}
                                                <td className="px-5 py-4 text-slate-600">
                                                    {salesOfficers.length > 0
                                                        ? salesOfficers.join(", ")
                                                        : "Not assigned"}
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4">
                                                    {projects.length === 0 ? (
                                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                            No project
                                                        </span>
                                                    ) : hasSentProject ? (
                                                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                                            Sent to design
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                            Draft
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4 text-right">
                                                    <Link
                                                        to={`/Sales/AccountManager/customers/${client.id}`}
                                                        className="font-medium text-blue-700 hover:text-blue-900"
                                                    >
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
