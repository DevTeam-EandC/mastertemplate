
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail } from "lucide-react";
import axios from "axios";

import { useAuth } from "../../auth/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login, switchDashboard } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError("");
        setSubmitting(true);

        try {
            const result = await login(email, password);

            // 1. System Admin goes directly to Admin Dashboard
            if (result.roles.includes("System Admin")) {
                navigate("/admin/dashboard", { replace: true });
                return;
            }
            // 2. No available dashboards
            if (result.dashboards.length === 0) {
                navigate("/no-dashboard", { replace: true });
                return;
            }

            // 3. Multiple dashboards: let user choose
            if (result.dashboards.length > 1) {
                navigate("/select-dashboard", { replace: true });
                return;
            }

            // 4. Only one dashboard: go directly to it
            const primaryDashboard = result.dashboards[0];

            switchDashboard(primaryDashboard);

            navigate(
                `/${primaryDashboard.dashboardKey}/dashboard`,
                { replace: true }
            );

        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.message ??
                    "Invalid email or password."
                );
            } else {
                setError("Unable to log in. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <LockKeyhole size={28} />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-800">
                        Company Management System
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Sign in to access your department dashboard.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Email Address
                        </label>

                        <div className="flex items-center rounded-lg border border-slate-300 px-3">
                            <Mail size={18} className="text-slate-400" />

                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="Enter your email"
                                className="w-full border-0 bg-transparent p-3 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Password
                        </label>

                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-slate-400">
                    Authorized company personnel only.
                </p>

            </div>
        </div>
    );
}
