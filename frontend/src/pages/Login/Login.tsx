import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import axios from "axios";

import { useAuth } from "../../auth/AuthContext";
import {
    clearRememberedLogin,
    getRememberedLogin,
    saveRememberedLogin,
} from "../../auth/rememberedLogin";

export default function Login() {
    const navigate = useNavigate();
    const { login, switchDashboard } = useAuth();

    // Read the saved login once, when the page first renders.
    const [savedLogin] = useState(getRememberedLogin);
    const [email, setEmail] = useState(savedLogin?.email ?? "");
    const [password, setPassword] = useState(savedLogin?.password ?? "");
    const [revealed, setRevealed] = useState(false);
    const [rememberMe, setRememberMe] = useState(savedLogin !== null);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError("");
        setSubmitting(true);

        try {
            const result = await login(email, password, rememberMe);

            // Save the credentials only after a successful sign-in, and only if
            // Remember me is checked. Unchecking it forgets them.
            if (rememberMe) {
                saveRememberedLogin(email, password);
            } else {
                clearRememberedLogin();
            }

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

            navigate(`/${primaryDashboard.dashboardKey}/dashboard`, {
                replace: true,
            });
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

    const inputClass =
        "block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300";

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
            <div className="w-full max-w-sm">
                <header className="mb-8 text-center">
                    <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <LockKeyhole size={24} aria-hidden="true" />
                    </div>

                    <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                        Elisha and Charles Solutions, Inc.
                    </h1>

                    <p className="mt-1.5 text-sm text-slate-500">
                        Sign in to access your department dashboard.
                    </p>
                </header>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="login-email"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Email Address
                            </label>

                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                autoComplete="username"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="Enter your email"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="login-password"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    id="login-password"
                                    name="password"
                                    type={revealed ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Enter your password"
                                    className={`${inputClass} pr-11`}
                                />

                                <button
                                    type="button"
                                    aria-label="Hold to show password"
                                    title="Hold to show password"
                                    onPointerDown={(e) => {
                                        if (e.pointerType === "mouse" && e.button !== 0) return;
                                        setRevealed(true);
                                    }}
                                    onPointerUp={() => setRevealed(false)}
                                    onPointerLeave={() => setRevealed(false)}
                                    onPointerCancel={() => setRevealed(false)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onContextMenu={(e) => e.preventDefault()}
                                    onKeyDown={(e) => {
                                        if ((e.key === " " || e.key === "Enter") && !e.repeat) setRevealed(true);
                                    }}
                                    onKeyUp={(e) => {
                                        if (e.key === " " || e.key === "Enter") setRevealed(false);
                                    }}
                                    onBlur={() => setRevealed(false)}
                                    style={{ touchAction: "none", userSelect: "none", WebkitUserSelect: "none" }}
                                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-500 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-300"
                                >
                                    {!revealed ? (
                                        <EyeOff size={18} aria-hidden="true" />
                                    ) : (
                                        <Eye size={18} aria-hidden="true" />
                                    )}
                                </button>

                            </div>
                        </div>

                        <div className="flex items-center">
                            <label
                                htmlFor="login-remember"
                                className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-600"
                            >
                                <input
                                    id="login-remember"
                                    name="rememberMe"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(event) => setRememberMe(event.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-300"
                                />
                                Remember me
                            </label>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs text-slate-500">
                    Authorized company personnel only.
                </p>
            </div>
        </div>
    );
}
