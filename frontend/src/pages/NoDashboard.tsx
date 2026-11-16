import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { revokeRefreshToken } from "../auth/signOut";

// Shown to a signed-in user who has no dashboard assignment. Lets them sign out.
export default function NoDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await revokeRefreshToken();
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
            <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <h1 className="text-xl font-semibold text-slate-900">
                    No dashboard assigned
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Please contact your administrator to get access to a department dashboard.
                </p>
                <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                    <LogOut size={16} aria-hidden="true" />
                    Log out
                </button>
            </div>
        </div>
    );
}
