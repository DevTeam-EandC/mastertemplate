import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

import api from "../../api/api";
import type {
    Department,
    Position,
    Role,
    CreateUserRequest,
} from "../../api/users.types";

interface AssignmentRow {
    rowId: string;
    departmentId: string;
    positionId: string;
    positions: Position[];
    loadingPositions: boolean;
}

export default function CreateUser() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
    const [primaryRowId, setPrimaryRowId] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                const [departmentResponse, roleResponse] =
                    await Promise.all([
                        api.get<Department[]>("/Departments"),
                        api.get<Role[]>("/Roles"),
                    ]);

                setDepartments(
                    departmentResponse.data.filter(d => d.isActive)
                );

                setRoles(roleResponse.data);
            } catch (err) {
                const axiosError = err as AxiosError<{ message?: string }>;
                setError(
                    axiosError.response?.data?.message ??
                    "Unable to load departments and roles."
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const addAssignment = () => {
        const rowId = crypto.randomUUID();

        setAssignments(current => [
            ...current,
            {
                rowId,
                departmentId: "",
                positionId: "",
                positions: [],
                loadingPositions: false,
            },
        ]);

        if (!primaryRowId) {
            setPrimaryRowId(rowId);
        }
    };

    const removeAssignment = (rowId: string) => {
        const remaining = assignments.filter(
            item => item.rowId !== rowId
        );

        setAssignments(remaining);

        if (primaryRowId === rowId) {
            setPrimaryRowId(remaining[0]?.rowId ?? "");
        }
    };

    const changeDepartment = async (
        rowId: string,
        departmentId: string
    ) => {
        setAssignments(current =>
            current.map(item =>
                item.rowId === rowId
                    ? {
                        ...item,
                        departmentId,
                        positionId: "",
                        positions: [],
                        loadingPositions: Boolean(departmentId),
                    }
                    : item
            )
        );

        if (!departmentId) return;

        try {
            const response = await api.get<Position[]>(
                "/Positions",
                {
                    params: {
                        departmentId,
                        activeOnly: true,
                    },
                }
            );

            setAssignments(current =>
                current.map(item =>
                    item.rowId === rowId
                        ? {
                            ...item,
                            positions: response.data.filter(p => p.isActive),
                            loadingPositions: false,
                        }
                        : item
                )
            );
        } catch {
            setAssignments(current =>
                current.map(item =>
                    item.rowId === rowId
                        ? { ...item, loadingPositions: false }
                        : item
                )
            );

            setError("Unable to load positions for the selected department.");
        }
    };

    const changePosition = (
        rowId: string,
        positionId: string
    ) => {
        setAssignments(current =>
            current.map(item =>
                item.rowId === rowId
                    ? { ...item, positionId }
                    : item
            )
        );
    };

    const toggleRole = (roleName: string) => {
        setSelectedRoles(current =>
            current.includes(roleName)
                ? current.filter(role => role !== roleName)
                : [...current, roleName]
        );
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (
            assignments.some(
                item => !item.departmentId || !item.positionId
            )
        ) {
            setError(
                "Please select a department and position for every assignment."
            );
            return;
        }

        if (assignments.length > 0 && !primaryRowId) {
            setError("Please select one primary department assignment.");
            return;
        }

        const request: CreateUserRequest = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password,
            roles: selectedRoles,
            assignments: assignments.map(item => ({
                departmentId: item.departmentId,
                positionId: item.positionId,
                isPrimary: item.rowId === primaryRowId,
            })),
        };

        try {
            setSaving(true);

            await api.post("/Users", request);

            navigate("/admin/users", {
                replace: true,
                state: {
                    successMessage: "User created successfully.",
                },
            });
        } catch (err) {
            const axiosError = err as AxiosError<{
                message?: string;
                errors?: string[];
                title?: string;
            }>;

            const data = axiosError.response?.data;

            setError(
                data?.message ??
                data?.errors?.join(", ") ??
                data?.title ??
                "Unable to create user. Please check the information and try again."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-slate-500">
                    Loading user creation form...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-5xl">

                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/users")}
                        className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                        ← Back to User Management
                    </button>

                    <h1 className="text-2xl font-bold text-slate-800">
                        Create User
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Create an employee account and assign departments,
                        positions, and system roles.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Personal Information */}
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-slate-800">
                            Personal Information
                        </h2>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    First Name *
                                </label>
                                <input
                                    required
                                    maxLength={100}
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="Enter first name"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Last Name *
                                </label>
                                <input
                                    required
                                    maxLength={100}
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="Enter last name"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Email Address *
                                </label>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="employee@company.local"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Initial Password *
                                </label>
                                <input
                                    required
                                    type="password"
                                    minLength={8}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="Minimum 8 characters"
                                />
                            </div>
                        </div>
                    </section>

                    {/* System Roles */}
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-2 text-lg font-semibold text-slate-800">
                            System Roles
                        </h2>

                        <p className="mb-5 text-sm text-slate-500">
                            Select the system permissions for this user.
                        </p>

                        {roles.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                No roles available.
                            </p>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {roles.map(role => (
                                    <label
                                        key={role.id}
                                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedRoles.includes(role.name)}
                                            onChange={() => toggleRole(role.name)}
                                            className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                        />

                                        <span className="text-sm font-medium text-slate-700">
                                            {role.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Department Assignments */}
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">
                                    Department Assignments
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Assign this employee to one or more departments.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={addAssignment}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                + Add Assignment
                            </button>
                        </div>

                        {assignments.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
                                <p className="text-sm text-slate-500">
                                    No department assignments added.
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    You can create an account without a department assignment.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {assignments.map((assignment, index) => (
                                    <div
                                        key={assignment.rowId}
                                        className="rounded-lg border border-slate-200 p-4"
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="font-semibold text-slate-700">
                                                Assignment {index + 1}
                                            </h3>

                                            <button
                                                type="button"
                                                onClick={() => removeAssignment(assignment.rowId)}
                                                className="text-sm font-medium text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                                    Department *
                                                </label>

                                                <select
                                                    required
                                                    value={assignment.departmentId}
                                                    onChange={e =>
                                                        changeDepartment(
                                                            assignment.rowId,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
                                                >
                                                    <option value="">
                                                        Select department
                                                    </option>

                                                    {departments.map(department => (
                                                        <option
                                                            key={department.id}
                                                            value={department.id}
                                                        >
                                                            {department.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                                    Position *
                                                </label>

                                                <select
                                                    required
                                                    disabled={
                                                        !assignment.departmentId ||
                                                        assignment.loadingPositions
                                                    }
                                                    value={assignment.positionId}
                                                    onChange={e =>
                                                        changePosition(
                                                            assignment.rowId,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 disabled:bg-slate-100"
                                                >
                                                    <option value="">
                                                        {assignment.loadingPositions
                                                            ? "Loading positions..."
                                                            : "Select position"}
                                                    </option>

                                                    {assignment.positions.map(position => (
                                                        <option
                                                            key={position.id}
                                                            value={position.id}
                                                        >
                                                            {position.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <label className="mt-4 flex cursor-pointer items-center gap-2">
                                            <input
                                                type="radio"
                                                name="primaryAssignment"
                                                checked={primaryRowId === assignment.rowId}
                                                onChange={() =>
                                                    setPrimaryRowId(assignment.rowId)
                                                }
                                                className="h-4 w-4 text-blue-600"
                                            />

                                            <span className="text-sm font-medium text-slate-700">
                                                Primary Department
                                            </span>

                                            {primaryRowId === assignment.rowId && (
                                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                    Primary
                                                </span>
                                            )}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}

                        <p className="mt-4 text-xs text-slate-500">
                            Only one assignment can be primary. The primary
                            assignment determines the default dashboard.
                        </p>
                    </section>

                    {/* Actions */}
                    <div className="flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/users")}
                            disabled={saving}
                            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Creating User..." : "Create User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
