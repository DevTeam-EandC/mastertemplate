import { useEffect, useState } from "react";
import api from "../../api/api";
import type { Department } from "../../api/users.types";

interface DepartmentForm {
    code: string;
    name: string;
    description: string;
    isActive: boolean;
}

const emptyForm: DepartmentForm = {
    code: "",
    name: "",
    description: "",
    isActive: true,
};

export default function DepartmentManagement() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [form, setForm] = useState<DepartmentForm>(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadDepartments = async () => {
        try {
            setLoading(true);
            const response = await api.get<Department[]>("/Departments");
            setDepartments(response.data);
            setError("");
        } catch {
            setError("Unable to load departments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadDepartments();
    }, []);

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            if (editingId) {
                await api.put(`/Departments/${editingId}`, {
                    name: form.name,
                    description: form.description,
                    isActive: form.isActive,
                });
            } else {
                await api.post("/Departments", {
                    code: form.code,
                    name: form.name,
                    description: form.description,
                    isActive: true,
                });
            }

            resetForm();
            await loadDepartments();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Unable to save department. Please check the information."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (department: Department) => {
        setEditingId(department.id);
        setForm({
            code: department.code,
            name: department.name,
            description: department.description ?? "",
            isActive: department.isActive,
        });
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (department: Department) => {
        const confirmed = window.confirm(
            `Delete department "${department.name}"?`
        );

        if (!confirmed) return;

        try {
            await api.delete(`/Departments/${department.id}`);
            await loadDepartments();
            setError("");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Unable to delete department. It may still have positions assigned."
            );
        }
    };

    const filteredDepartments = departments.filter((department) => {
        const term = search.toLowerCase();

        return (
            department.code.toLowerCase().includes(term) ||
            department.name.toLowerCase().includes(term)
        );
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Department Management
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Create and manage company departments.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-xl border border-gray-200 bg-white p-6"
            >
                <h2 className="text-lg font-semibold text-gray-800">
                    {editingId ? "Edit Department" : "Create Department"}
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Department Code
                        </label>
                        <input
                            required
                            minLength={2}
                            maxLength={20}
                            pattern="[A-Za-z0-9-]+"
                            disabled={!!editingId}
                            value={form.code}
                            onChange={(e) =>
                                setForm({ ...form, code: e.target.value.toUpperCase() })
                            }
                            placeholder="e.g. IT-01"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                        />
                        {editingId && (
                            <p className="mt-1 text-xs text-gray-500">
                                Department codes cannot be changed after creation.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Department Name
                        </label>
                        <input
                            required
                            minLength={2}
                            maxLength={100}
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            placeholder="e.g. Information Technology"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        maxLength={250}
                        rows={3}
                        value={form.description}
                        onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                        }
                        placeholder="Department description..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                </div>

                {editingId && (
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) =>
                                setForm({ ...form, isActive: e.target.checked })
                            }
                        />
                        Active
                    </label>
                )}

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving
                            ? "Saving..."
                            : editingId
                                ? "Update Department"
                                : "Create Department"}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Departments ({filteredDepartments.length})
                    </h2>

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search code or department..."
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                </div>

                {loading ? (
                    <p className="py-6 text-center text-gray-500">
                        Loading departments...
                    </p>
                ) : filteredDepartments.length === 0 ? (
                    <p className="py-6 text-center text-gray-500">
                        No departments found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="p-3">Code</th>
                                    <th className="p-3">Department</th>
                                    <th className="p-3">Positions</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDepartments.map((department) => (
                                    <tr key={department.id} className="border-b last:border-0">
                                        <td className="p-3 font-medium">{department.code}</td>
                                        <td className="p-3">
                                            <div className="font-medium text-gray-800">
                                                {department.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {department.description}
                                            </div>
                                        </td>
                                        <td className="p-3">{department.positionCount}</td>
                                        <td className="p-3">
                                            <span className={`rounded-full px-2 py-1 text-xs ${department.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                                }`}>
                                                {department.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleEdit(department)}
                                                    className="font-medium text-blue-600 hover:underline"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(department)}
                                                    className="font-medium text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
