
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
    Search,
    Plus,
    Users,
    Pencil,
    Power,
    RefreshCw,
} from "lucide-react";

import api from "../../api/api";
import type { UserResponse } from "../../api/users.types";

interface SummaryCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
}

const SummaryCard = ({ title, value, icon }: SummaryCardProps) => (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5">
        <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            {icon}
        </div>

        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

export default function UserManagement() {
    const navigate = useNavigate();

    const [users, setUsers] = useState<UserResponse[]>([]);
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("all");
    const [status, setStatus] = useState("all");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Load users
    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get<UserResponse[]>("/users");

            setUsers(response.data ?? []);
        } catch (err: unknown) {
            console.error("Failed to load users:", err);

            if (axios.isAxiosError(err)) {
                const statusCode = err.response?.status;
                const responseData = err.response?.data as
                    | { message?: string }
                    | undefined;

                console.error("HTTP Status:", statusCode);
                console.error("API Response:", responseData);

                switch (statusCode) {
                    case 401:
                        setError(
                            "Unauthorized. Your session may have expired. Please log out and log in again."
                        );
                        break;

                    case 403:
                        setError(
                            "Access denied. Your account does not have System Admin permission."
                        );
                        break;

                    case 404:
                        setError(
                            "The users API endpoint was not found. Please check your API route."
                        );
                        break;

                    case 500:
                        setError(
                            "The server encountered an error while loading users."
                        );
                        break;

                    default:
                        setError(
                            responseData?.message ||
                            `Unable to load users. Status: ${statusCode ?? "Network Error"
                            }`
                        );
                }
            } else {
                setError(
                    "An unexpected error occurred while loading users."
                );
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    // Get departments
    const departments = useMemo(() => {
        const names = users.flatMap((user) =>
            (user.departmentAssignments ?? []).map(
                (assignment) => assignment.departmentName
            )
        );

        return [...new Set(names)].sort();
    }, [users]);

    // Filter users
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const searchText = search.trim().toLowerCase();

            const matchesSearch =
                user.fullName.toLowerCase().includes(searchText) ||
                user.email.toLowerCase().includes(searchText);

            const matchesDepartment =
                department === "all" ||
                (user.departmentAssignments ?? []).some(
                    (assignment) =>
                        assignment.departmentName === department
                );

            const matchesStatus =
                status === "all" ||
                (status === "active" && user.isActive) ||
                (status === "inactive" && !user.isActive);

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesStatus
            );
        });
    }, [users, search, department, status]);

    // Activate / deactivate user
    const updateStatus = async (user: UserResponse) => {
        const action = user.isActive ? "deactivate" : "activate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${user.fullName}?`
        );

        if (!confirmed) return;

        try {
            setUpdatingId(user.id);

            await api.patch(
                `/users/${user.id}/status`,
                !user.isActive
            );

            setUsers((currentUsers) =>
                currentUsers.map((item) =>
                    item.id === user.id
                        ? {
                            ...item,
                            isActive: !item.isActive,
                        }
                        : item
                )
            );
        } catch (err: unknown) {
            console.error("Failed to update user status:", err);

            if (axios.isAxiosError(err)) {
                const statusCode = err.response?.status;
                const responseData = err.response?.data as
                    | { message?: string }
                    | undefined;

                if (statusCode === 401) {
                    window.alert(
                        "Your session has expired. Please log in again."
                    );
                } else if (statusCode === 403) {
                    window.alert(
                        "You do not have permission to update this user."
                    );
                } else {
                    window.alert(
                        responseData?.message ||
                        "Unable to update user status."
                    );
                }
            } else {
                window.alert("An unexpected error occurred.");
            }
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        User Management
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage company users, departments, positions, and access.
                    </p>
                </div>

                <button
                    onClick={() => navigate("/admin/users/new")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus size={18} />
                    Create User
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryCard
                    title="Total Users"
                    value={users.length}
                    icon={<Users size={22} />}
                />

                <SummaryCard
                    title="Active Users"
                    value={users.filter((user) => user.isActive).length}
                    icon={<Power size={22} />}
                />

                <SummaryCard
                    title="Inactive Users"
                    value={users.filter((user) => !user.isActive).length}
                    icon={<Users size={22} />}
                />
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

                    {/* Search */}
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-3 text-gray-400"
                        />

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search name or email..."
                            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Department Filter */}
                    <select
                        value={department}
                        onChange={(event) =>
                            setDepartment(event.target.value)
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                    >
                        <option value="all">All Departments</option>

                        {departments.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={status}
                        onChange={(event) =>
                            setStatus(event.target.value)
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

                {/* Table Header */}
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <h2 className="font-semibold text-gray-900">
                        Company Users ({filteredUsers.length})
                    </h2>

                    <button
                        onClick={() => void loadUsers()}
                        disabled={loading}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="p-10 text-center text-gray-500">
                        Loading users...
                    </div>

                ) : error ? (

                    /* Error */
                    <div className="p-8 text-center">
                        <p className="text-sm text-red-600">
                            {error}
                        </p>

                        <button
                            onClick={() => void loadUsers()}
                            className="mt-3 text-sm font-medium text-blue-600 hover:underline"
                        >
                            Try again
                        </button>
                    </div>

                ) : filteredUsers.length === 0 ? (

                    /* Empty */
                    <div className="p-10 text-center text-gray-500">
                        No users found.
                    </div>

                ) : (

                    /* Data Table */
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">

                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-5 py-4">User</th>
                                    <th className="px-5 py-4">
                                        Department / Position
                                    </th>
                                    <th className="px-5 py-4">Roles</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50"
                                    >

                                        {/* User */}
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-gray-900">
                                                {user.fullName}
                                            </p>

                                            <p className="text-gray-500">
                                                {user.email}
                                            </p>
                                        </td>

                                        {/* Departments */}
                                        <td className="px-5 py-4">
                                            {!user.departmentAssignments?.length ? (
                                                <span className="text-gray-400">
                                                    No department
                                                </span>
                                            ) : (
                                                <div className="space-y-2">
                                                    {user.departmentAssignments.map(
                                                        (assignment) => (
                                                            <div key={assignment.id}>
                                                                <p className="font-medium text-gray-800">
                                                                    {assignment.departmentName}

                                                                    {assignment.isPrimary && (
                                                                        <span className="ml-2 text-xs text-blue-600">
                                                                            Primary
                                                                        </span>
                                                                    )}
                                                                </p>

                                                                <p className="text-xs text-gray-500">
                                                                    {assignment.positionName}
                                                                </p>

                                                                {!assignment.isActive && (
                                                                    <span className="text-xs text-red-500">
                                                                        Inactive assignment
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                        {/* Roles */}
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles?.length ? (
                                                    user.roles.map((role) => (
                                                        <span
                                                            key={role}
                                                            className="rounded-full bg-purple-50 px-2.5 py-1 text-xs text-purple-700"
                                                        >
                                                            {role}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400">
                                                        No roles
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.isActive
                                                        ? "bg-green-50 text-green-700"
                                                        : "bg-red-50 text-red-700"
                                                    }`}
                                            >
                                                {user.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">

                                                <button
                                                    type="button"
                                                    title="Edit user"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/users/${user.id}/edit`
                                                        )
                                                    }
                                                    className="rounded-lg border p-2 text-gray-600 hover:bg-gray-100"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title={
                                                        user.isActive
                                                            ? "Deactivate"
                                                            : "Activate"
                                                    }
                                                    disabled={
                                                        updatingId === user.id
                                                    }
                                                    onClick={() =>
                                                        void updateStatus(user)
                                                    }
                                                    className="rounded-lg border p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                                >
                                                    <Power size={16} />
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
