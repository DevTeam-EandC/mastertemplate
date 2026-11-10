import { NavLink } from "react-router-dom";
import { CircleHelp, LogOut, Settings, ShieldCheck, X } from "lucide-react";
import Brand from "./Brand";
import { navItems } from "../../config/navigation";

export default function Sidebar({ user, onLogout, mobileOpen, closeMobile }) {
  return (
    <>
      <div onClick={closeMobile} className={`fixed inset-0 z-30 bg-brand-ink/40 transition lg:hidden ${mobileOpen ? "" : "pointer-events-none opacity-0"}`} />
      <aside className={`sidebar-scroll fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col bg-brand-ink px-5 py-6 transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between">
          <Brand />
          <button onClick={closeMobile} className="text-white/60 lg:hidden"><X size={19} /></button>
        </div>

        <div className="mt-11 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-blue-100/35">Workspace</div>
        <nav className="mt-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium transition ${
                  isActive ? "bg-white text-brand-ink shadow-lg" : "text-blue-100/65 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <item.icon size={17} />
              {item.name}
              {item.badge && <span className="ml-auto rounded-md bg-brand-mist px-2 py-0.5 text-[10px] font-bold text-brand-blue">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="mt-9 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-blue-100/35">Preferences</div>
        <button className="mt-3 flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium text-blue-100/65 hover:bg-white/10 hover:text-white"><Settings size={17} />Settings</button>
        <button className="flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium text-blue-100/65 hover:bg-white/10 hover:text-white"><CircleHelp size={17} />Help & support</button>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-white"><ShieldCheck size={15} className="text-brand-steel" /> Workspace tip</div>
          <p className="text-[11px] leading-5 text-blue-100/55">Keep project details complete to help your team prepare accurate quotations.</p>
        </div>

        <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-steel text-xs font-bold text-brand-ink">{user.slice(0, 1).toUpperCase()}</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-white">{user.split("@")[0]}</div>
            <div className="text-[10px] text-blue-100/45">Sales officer</div>
          </div>
          <button onClick={onLogout} title="Sign out" className="text-blue-100/50 hover:text-white"><LogOut size={16} /></button>
        </div>
      </aside>
    </>
  );
}
