import { Bell, ChevronDown, Menu } from "lucide-react";

export default function Topbar({ title, subtitle, onMenu, user }) {
  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"><Menu size={20} /></button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-brand-ink">{title}</h1>
          <p className="hidden text-[11px] text-slate-400 sm:block">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50">
          <Bell size={17} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-400 ring-2 ring-white" />
        </button>
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="hidden items-center gap-2 sm:flex">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-mist text-xs font-bold text-brand-blue">{user.slice(0, 1).toUpperCase()}</div>
          <span className="max-w-[130px] truncate text-xs font-semibold text-brand-ink">{user.split("@")[0]}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
}
