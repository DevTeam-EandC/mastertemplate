
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, FolderKanban, Pencil, Eye } from "lucide-react";

import DashboardLayout from "../../../components/DashboardLayout";
import { getClientProfile } from "../../../api/clientProfileApi";
import type { ClientProfile } from "../../../api/clientProfile.types";

export default function ClientProfileView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [client, setClient] = useState<ClientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadClient() {
            if (!id) {
                setError("Client ID is missing.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const data = await getClientProfile(id);
                setClient(data);
            } catch (err) {
                console.error(err);
                setError("Unable to load client profile.");
            } finally {
                setLoading(false);
            }
        }

        loadClient();
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout department="Sales" position="AccountManager">
                <div className="p-6">Loading client profile...</div>
            </DashboardLayout>
        );
    }

    if (error || !client) {
        return (
            <DashboardLayout department="Sales" position="AccountManager">
                <div className="p-6">
                    <p className="text-red-600">
                        {error || "Client not found."}
                    </p>
                    <button
                        onClick={() =>
                            navigate("/Sales/AccountManager/customers")
                        }
                        className="mt-4 text-blue-600"
                    >
                        Back to Clients
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout department="Sales" position="AccountManager">
            <div className="p-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <button
                            onClick={() =>
                                navigate("/Sales/AccountManager/customers")
                            }
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-3"
                        >
                            <ArrowLeft size={16} />
                            Back to Clients
                        </button>

                        <h1 className="text-2xl font-bold text-gray-800">
                            {client.clientName}
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Client Profile
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate(
                                `/Sales/AccountManager/customers/${client.id}/edit`
                            )
                        }
                        className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        <Pencil size={16} />
                        Edit Client
                    </button>
                </div>

                {/* Client Information */}
                <section className="bg-white border rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-5">
                        Client Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Info label="Client Name" value={client.clientName} />
                        <Info label="Contact Number" value={client.contactNumber} />
                        <Info label="Email Address" value={client.emailAddress} />
                        <Info label="Lead Source" value={client.leadSource} />
                        <Info label="Referral By" value={client.referralBy || "—"} />
                        <Info label="Account Manager" value={client.accountManagerName} />
                    </div>
                </section>

                {/* Projects */}
                <section className="bg-white border rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                        <div>
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <FolderKanban size={20} />
                                Projects
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {client.projects?.length || 0} project(s)
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                navigate(
                                    `/Sales/AccountManager/projects/new/${client.id}`
                                )
                            }
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Plus size={16} />
                            Add Project
                        </button>
                    </div>

                    {client.projects?.length ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-gray-500">
                                        <th className="py-3 pr-4">Building Type</th>
                                        <th className="py-3 pr-4">Sales Officer</th>
                                        <th className="py-3 pr-4">Elevators</th>
                                        <th className="py-3 pr-4">Status</th>
                                        <th className="py-3 text-right">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {client.projects.map((project) => (
                                        <tr key={project.id} className="border-b last:border-0">
                                            <td className="py-4 pr-4 font-medium">
                                                {project.buildingType}
                                            </td>

                                            <td className="py-4 pr-4">
                                                {project.salesOfficerName}
                                            </td>

                                            <td className="py-4 pr-4">
                                                {project.numberOfElevators}
                                            </td>

                                            <td className="py-4 pr-4">
                                                <span className={`px-2 py-1 rounded-full text-xs ${project.isSentToDesign
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                    }`}>
                                                    {project.isSentToDesign
                                                        ? "Sent to Design"
                                                        : "Draft"}
                                                </span>
                                            </td>

                                            <td className="py-4 text-right">
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/Sales/AccountManager/projects/${project.id}`
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-10 border border-dashed rounded-lg">
                            <FolderKanban
                                size={32}
                                className="mx-auto text-gray-400 mb-3"
                            />
                            <p className="font-medium text-gray-700">
                                No projects yet
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Add a project to this client to get started.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="font-medium text-gray-800 break-words">{value}</p>
        </div>
    );
}
