import React from "react";
import { LIFECYCLE_STAGES, stageIndex, stageStatus } from "@/lib/lifecycle";

// The deterministic assembly line: linear spine with a parallel validation DAG branch.
export default function AssemblyLine({ currentStage = "PLAN", compact = false }) {
  const c = stageIndex(currentStage);
  const mainStages = LIFECYCLE_STAGES.filter((s) => !s.parallel).filter((s) => s.id !== "STATIC_VALIDATION" && s.id !== "FUNCTIONAL_VALIDATION" && s.id !== "SECURITY_VALIDATION" && s.id !== "VISUAL_VALIDATION" && s.id !== "OPERATIONAL_VALIDATION");
  // The validation stage is rendered as a parallel branch
  const validationStage = LIFECYCLE_STAGES.find((s) => s.id === "VALIDATION");

  const progressPct = c <= 0 ? 0 : Math.min(100, (c / (LIFECYCLE_STAGES.length - 1)) * 100);

  return (
    <div className="w-full">
      {!compact && (
        <div className="mb-6 flex items-center justify-between">
          <span className="xa-pill-badge">Deterministic DAG</span>
          <span className="text-xs font-medium text-muted-foreground">
            Stage {c + 1} of {LIFECYCLE_STAGES.length} · {LIFECYCLE_STAGES[c]?.group}
          </span>
        </div>
      )}

      {/* Main spine */}
      <div className="relative pb-2">
        <div className="xa-line-track" />
        <div className="xa-line-progress" style={{ width: `${progressPct}%` }} />
        <div className="relative flex gap-1 sm:gap-2 overflow-x-auto pb-2">
          {mainStages.map((s) => {
            const status = stageStatus(s.id, currentStage);
            const num = stageIndex(s.id) + 1;
            return (
              <div key={s.id} className={`xa-station ${status}`}>
                <div className="xa-station-dot">{num}</div>
                <div className="xa-station-label">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Parallel validation DAG branch */}
      <div className="mt-8 rounded-2xl border border-border bg-[#FAFAFA] p-5">
        <div className="mb-4 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CCBB00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
          <h4 className="text-sm font-bold">Parallel Validation Gate — Deterministic DAG</h4>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {validationStage.parallel.map((v) => {
            const vIdx = stageIndex(v.id);
            const status = stageStatus(v.id, currentStage);
            const reached = vIdx <= c;
            return (
              <div key={v.id} className={`rounded-xl border p-3 text-center transition-all ${reached ? "border-primary bg-white" : "border-border bg-white opacity-60"}`}>
                <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full ${status === "done" ? "bg-secondary text-primary" : status === "active" ? "bg-primary text-secondary" : "bg-muted text-muted-foreground"}`}>
                  {status === "done" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  ) : status === "active" ? (
                    <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                  ) : (
                    <span className="text-xs">•</span>
                  )}
                </div>
                <div className="text-xs font-semibold">{v.label}</div>
                <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{status === "done" ? "Passed" : status === "active" ? "Running" : "Queued"}</div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          All five gates must pass before the assembly line merges into Preview Acceptance.
        </p>
      </div>
    </div>
  );
}