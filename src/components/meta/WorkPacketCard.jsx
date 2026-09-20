import React, { useState } from "react";
import { ChevronDown, Lock } from "lucide-react";

const RISK_COLORS = {
  READ: "bg-muted text-muted-foreground",
  DRAFT: "bg-primary/15 text-[#8A7300]",
  BRANCH_WRITE: "bg-secondary text-primary",
  PROTECTED: "bg-destructive text-destructive-foreground",
};

export default function WorkPacketCard({ packet, index }) {
  const [open, setOpen] = useState(false);
  const split = (v) => (v ? String(v).split(/[,|\n]/).map((s) => s.trim()).filter(Boolean) : []);
  const deps = split(packet.dependencies);
  const allowed = split(packet.allowed_actions);
  const forbidden = split(packet.forbidden_actions);
  const ac = split(packet.acceptance_criteria);
  const vr = split(packet.validation_requirements);
  return (
    <div className="rounded-xl border border-border bg-white">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">{index + 1}</span>
        <span className="flex-1 font-semibold">{packet.title}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${RISK_COLORS[packet.risk_class] || RISK_COLORS.DRAFT}`}>{packet.risk_class}</span>
        {packet.risk_class === "PROTECTED" && <Lock className="h-4 w-4 text-destructive" />}
        <span className="hidden text-xs font-semibold text-muted-foreground sm:inline">{packet.recommended_executor || "BASE44"}</span>
        <ChevronDown className={`h-4 w-4 flex-none transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
          {packet.objective && <p className="mb-3 text-foreground">{packet.objective}</p>}
          {deps.length > 0 && <p className="mb-2"><strong className="text-foreground">Depends on:</strong> {deps.join(", ")}</p>}
          {allowed.length > 0 && <p className="mb-2"><strong className="text-foreground">Allowed:</strong> {allowed.join(", ")}</p>}
          {forbidden.length > 0 && <p className="mb-2"><strong className="text-foreground">Forbidden:</strong> {forbidden.join(", ")}</p>}
          {ac.length > 0 && <div className="mb-2"><strong className="text-foreground">Acceptance criteria:</strong><ul className="ml-4 list-disc">{ac.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
          {vr.length > 0 && <div className="mb-2"><strong className="text-foreground">Validation:</strong><ul className="ml-4 list-disc">{vr.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
          <p><strong className="text-foreground">Status:</strong> <span className="font-semibold">{packet.status}</span></p>
        </div>
      )}
    </div>
  );
}