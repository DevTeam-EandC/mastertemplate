import { Building2 } from "lucide-react";

export default function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white"><Building2 size={21} /></div>
      {!compact && (
        <div>
          <div className="text-[17px] font-bold tracking-tight text-white">
            Elisha and Charles Solutions, Inc<span className="text-brand-steel">.</span>
          </div>
          <div className="text-[10px] font-medium uppercase tracking-[.2em] text-blue-200/70">Your Elevator and Escalator Company</div>
        </div>
      )}
    </div>
  );
}
