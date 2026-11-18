
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Plus,
    Eye,
    Pencil,
    Building2,
    ArrowRight,
} from "lucide-react";

import DashboardLayout from "../../../components/DashboardLayout";
import { listMyClientProfiles } from "../../../api/clientProfileApi";
import type {
    ClientProfile,
    ProjectProfile,
} from "../../../api/clientProfile.types";

interface ProjectRow {
    project: ProjectProfile;
    client: ClientProfile;
}

export default function ProjectList() {
    const [projects, setProjects] = useState<ProjectRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadProjects() {
            try {
                setLoading(true);
                setError("");

                const clients = await listMyClientProfiles();

                const rows: ProjectRow[] = clients.flatMap((client) =>
                    (client.projects ?? []).map((project) => ({
                        project,
                        client,
                    }))
                );

                if (!cancelled) {
                    setProjects(rows);
                }
            } catch (err) {
                console.error("Failed to load projects:", err);

                if (!cancelled) {
                    setError("Unable to load projects. Please try again.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadProjects();

        return () => {
            cancelled = true;
        };
    }, []);

    const sentToDesign = projects.filter(
        ({ project }) => project.isSentToDesign
    ).length;

    const draftProjects = projects.filter(
        ({ project }) => !project.isSentToDesign
    ).length;

    return (
        <DashboardLayout department="Sales" position="AccountManager">
            <div className="space-y-6">

                {/* Header */}
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                            Projects
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage your client projects and elevator quotation details.
                        </p>
                    </div>

                    <Link
                        to="/Sales/AccountManager/customers"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
                    >
                        <Plus size={18} />
                        Create Project
                    </Link>
                </header>

                {/* Error */}
                {error && (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {/* Summary Cards */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total Projects</p>
                        <p className="mt-2 text-3xl font-semibold text-slate-900">
                            {loading ? "..." : projects.length}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Draft Projects</p>
                        <p className="mt-2 text-3xl font-semibold text-slate-900">
                            {loading ? "..." : draftProjects}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Sent to Design</p>
                        <p className="mt-2 text-3xl font-semibold text-slate-900">
                            {loading ? "..." : sentToDesign}
                        </p>
                    </div>
                </section>

                {/* Project Table */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Project List
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                All projects under your client profiles.
                            </p>
                        </div>

                        <Building2 size={20} className="text-slate-400" />
                    </div>

                    {loading ? (
                        <p className="p-6 text-sm text-slate-500">
                            Loading projects...
                        </p>
                    ) : projects.length === 0 ? (
                        <div className="p-10 text-center">
                            <h3 className="font-semibold text-slate-900">
                                No projects found
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Create a client profile and add your first project.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3">Project / Client</th>
                                        <th className="px-5 py-3">Building</th>
                                        <th className="px-5 py-3">Project Type</th>
                                        <th className="px-5 py-3">Elevators</th>
                                        <th className="px-5 py-3">Sales Officer</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {projects.map(({ project, client }) => (
                                        <tr
                                            key={project.id}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-900">
                                                    {client.clientName}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {client.emailAddress}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {project.buildingType}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {project.projectType}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {project.numberOfElevators}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {project.salesOfficerName || "Not assigned"}
                                            </td>

                                            <td className="px-5 py-4">
                                                {project.isSentToDesign ? (
                                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                                        Sent to Design
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                        Draft
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <Link
                                                        to={`/Sales/AccountManager/projects/${project.id}`}
                                                        title="View project"
                                                        className="text-blue-700 hover:text-blue-900"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>

                                                    {!project.isSentToDesign && (
                                                        <Link
                                                            to={`/Sales/AccountManager/projects/${project.id}/edit`}
                                                            title="Edit project"
                                                            className="text-slate-600 hover:text-slate-900"
                                                        >
                                                            <Pencil size={18} />
                                                        </Link>
                                                    )}

                                                    <Link
                                                        to={`/Sales/AccountManager/customers/${client.id}`}
                                                        title="View client"
                                                        className="text-slate-600 hover:text-slate-900"
                                                    >
                                                        <ArrowRight size={18} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}
