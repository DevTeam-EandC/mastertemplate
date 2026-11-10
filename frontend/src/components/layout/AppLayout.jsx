import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { navItems } from "../../config/navigation";

export default function AppLayout({ user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const current = navItems.find((n) => n.path === pathname) || navItems[0];

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <Sidebar user={user} onLogout={onLogout} mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} />
      <div className="min-h-screen lg:pl-[258px]">
        <Topbar title={current.title} subtitle={current.subtitle} onMenu={() => setMobileOpen(true)} user={user} />
        <main className="mx-auto max-w-[1500px] px-5 py-7 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
