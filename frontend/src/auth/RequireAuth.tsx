import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface RequireAuthProps {
    children?: React.ReactNode;
    requiredRole?: string;
}

export default function RequireAuth({
    children,
    requiredRole,
}: RequireAuthProps) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-slate-500">Checking login...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && !user.roles?.includes(requiredRole)) {
        return <Navigate to="/no-dashboard" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
}
