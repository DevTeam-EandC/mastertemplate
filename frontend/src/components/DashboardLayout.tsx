
import { NavLink } from "react-router-dom";
import { LayoutDashboard, LogOut, ArrowLeftRight } from "lucide-react";
import type { ReactNode } from "react";

interface DashboardLayoutProps {
  department: string;
  position: string;
  children: ReactNode;
}

export default function DashboardLayout({
  department,
  position,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 bg-slate-950 text-white md:block">
        <div className="border-b border-slate-800 p-6">
          <h1 className="text-xl font-bold">Company System</h1>
          <p className="mt-1 text-sm text-slate-400">
            Management Portal
          </p>
        </div>

        <nav className="space-y-2 p-4">
          <NavLink
            to={`/${department}/${position}/dashboard`}
            className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/select-dashboard"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeftRight size={18} />
            Switch Dashboard
          </NavLink>
        </nav>

        <div className="absolute bottom-0 w-full border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("activeDashboard");
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-white px-6 py-4">
          <div>
            <p className="text-sm text-slate-500">
              {department} Department
            </p>
            <h2 className="text-lg font-semibold text-slate-800">
              {position}
            </h2>
          </div>

          <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
            Active Dashboard
          </span>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
