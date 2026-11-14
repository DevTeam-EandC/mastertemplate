import { useEffect, useState } from "react";
import api from "../../api/api";
import type { Department, Position } from "../../api/users.types";

interface PositionForm {
    name: string;
    description: string;
    departmentId: string;
    isActive: boolean;
}

const emptyForm: PositionForm = {
    name: "",
    description: "",
    departmentId: "",
    isActive: true,
};

export default function PositionManagement() {
    const [positions, setPositions] = useState<Position[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [form, setForm] = useState<PositionForm>(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filterDepartment, setFilterDepartment] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);

            const [departmentResponse, positionResponse] = await Promise.all([
                api.get<Department[]>("/Departments"),
                api.get<Position[]>("/Positions"),
            ]);

            setDepartments(departmentResponse.data);
            setPositions(positionResponse.data);
            setError("");
        } catch {
            setError("Unable to load departments or positions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
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
                await api.put(`/Positions/${editingId}`, {
                    name: form.name,
                    description: form.description,
                    departmentId: form.departmentId,
                    isActive: form.isActive,
                });
            } else {
                await api.post("/Positions", {
                    name: form.name,
                    description: form.description,
                    departmentId: form.departmentId,
                });
            }

            resetForm();
            await loadData();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Unable to save position. Check that the department is active and the position name is unique within it."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (position: Position) => {
        setEditingId(position.id);
        setForm({
            name: position.name,
            description: position.description ?? "",
            departmentId: position.departmentId,
            isActive: position.isActive,
        });
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (position: Position) => {
        const confirmed = window.confirm(
            `Delete position "${position.name}"?`
        );

        if (!confirmed) return;

        try {
            await api.delete(`/Positions/${position.id}`);
            await loadData();
            setError("");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Unable to delete this position. It may be assigned to a user."
            );
        }
    };

    const filteredPositions = positions.filter((position) => {
        return (
            !filterDepartment ||
            position.departmentId === filterDepartment
        );
    });

    const activeDepartments = departments.filter((d) => d.isActive);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Position Management
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Create and manage positions within each department.
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
                    {editingId ? "Edit Position" : "Create Position"}
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Position Name
                        </label>
                        <input
                            required
                            minLength={2}
                            maxLength={100}
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            placeholder="e.g. IT Manager"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Department
                        </label>
                        <select
                            required
                            value={form.departmentId}
                            onChange={(e) =>
                                setForm({ ...form, departmentId: e.target.value })
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        >
                            <option value="">Select department</option>
                            {activeDepartments.map((department) => (
                                <option key={department.id} value={department.id}>
                                    {department.code} - {department.name}
                                </option>
                            ))}
                        </select>
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
                        placeholder="Position description..."
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
                        disabled={saving || activeDepartments.length === 0}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving
                            ? "Saving..."
                            : editingId
                                ? "Update Position"
                                : "Create Position"}
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

                {activeDepartments.length === 0 && (
                    <p className="text-sm text-amber-700">
                        Create or activate a department before adding positions.
                    </p>
                )}
            </form>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Positions ({filteredPositions.length})
                    </h2>

                    <select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                        <option value="">All Departments</option>
                        {departments.map((department) => (
                            <option key={department.id} value={department.id}>
                                {department.code} - {department.name}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <p className="py-6 text-center text-gray-500">
                        Loading positions...
                    </p>
                ) : filteredPositions.length === 0 ? (
                    <p className="py-6 text-center text-gray-500">
                        No positions found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="p-3">Position</th>
                                    <th className="p-3">Department</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPositions.map((position) => (
                                    <tr key={position.id} className="border-b last:border-0">
                                        <td className="p-3">
                                            <div className="font-medium text-gray-800">
                                                {position.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {position.description}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            {position.departmentCode} - {position.departmentName}
                                        </td>
                                        <td className="p-3">
                                            <span className={`rounded-full px-2 py-1 text-xs ${position.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                                }`}>
                                                {position.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleEdit(position)}
                                                    className="font-medium text-blue-600 hover:underline"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(position)}
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
