
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    listMyClientProfiles,
} from "../../api/clientProfileApi";

import type {
    ClientProfile,
} from "../../api/clientProfile.types";

export default function ClientProfiles() {
    const [clients, setClients] = useState<ClientProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedClient, setExpandedClient] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadClients() {
            try {
                setLoading(true);
                setError("");

                const data = await listMyClientProfiles();

                if (!cancelled) {
                    setClients(data);
                }
            } catch (err: unknown) {
                console.error("CLIENT PROFILES ERROR:", err);

                if (!cancelled) {
                    setError(
                        "Unable to load client profiles. Check the API connection and your Account Manager access."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadClients();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                Loading client profiles...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Client Profiles
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage your clients and their projects.
                    </p>
                </div>

                <Link
                    to="/sales/client-profiles/create"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    + Register Client
                </Link>
            </div>

            {clients.length === 0 ? (
                <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
                    No client profiles found.
                </div>
            ) : (
                <div className="space-y-4">
                    {clients.map((client) => {
                        const isExpanded = expandedClient === client.id;

                        return (
                            <div
                                key={client.id}
                                className="overflow-hidden rounded-lg border bg-white shadow-sm"
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setExpandedClient(
                                            isExpanded ? null : client.id
                                        )
                                    }
                                    className="flex w-full flex-wrap items-center justify-between gap-4 p-5 text-left hover:bg-gray-50"
                                >
                                    <div>
                                        <h2 className="font-semibold text-gray-800">
                                            {client.clientName}
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            {client.contactNumber} · {client.emailAddress}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Lead source: {client.leadSource}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                                            {client.projects?.length ?? 0} Projects
                                        </span>

                                        <span className="text-gray-500">
                                            {isExpanded ? "▲" : "▼"}
                                        </span>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="border-t bg-gray-50 p-5">
                                        {client.projects?.length ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead>
                                                        <tr className="border-b text-gray-500">
                                                            <th className="p-3">Building Type</th>
                                                            <th className="p-3">Sales Officer</th>
                                                            <th className="p-3">Elevators</th>
                                                            <th className="p-3">Design Status</th>
                                                            <th className="p-3">Action</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {client.projects.map((project) => (
                                                            <tr
                                                                key={project.id}
                                                                className="border-b last:border-0"
                                                            >
                                                                <td className="p-3">
                                                                    {project.buildingType}
                                                                </td>

                                                                <td className="p-3">
                                                                    {project.salesOfficerName}
                                                                </td>

                                                                <td className="p-3">
                                                                    {project.numberOfElevators}
                                                                </td>

                                                                <td className="p-3">
                                                                    {project.isSentToDesign ? (
                                                                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                                                                            Sent to Design
                                                                        </span>
                                                                    ) : (
                                                                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                                                                            Draft
                                                                        </span>
                                                                    )}
                                                                </td>

                                                                <td className="p-3">
                                                                    <Link
                                                                        to={`/sales/client-profiles/projects/${project.id}`}
                                                                        className="text-blue-600 hover:underline"
                                                                    >
                                                                        View Project
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                This client has no projects yet.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
