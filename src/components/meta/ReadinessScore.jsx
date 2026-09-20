import React from "react";

export default function ReadinessScore({ score, breakdown }) {
  const pct = Math.min(100, Math.max(0, score || 0));
  let bd = {};
  try { bd = breakdown && typeof breakdown === "string" ? JSON.parse(breakdown) : (breakdown || {}); } catch { bd = {}; }
  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Project Readiness</h3>
      <div className="flex items-center gap-6">
        <div className="relative h-24 w-24 flex-none">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="#FFEA00" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 264} 264`} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-black">{Math.round(pct)}</div>
        </div>
        <div className="flex-1 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Verified score</span><span className="font-bold">{bd.verified_score ?? pct}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Unverified points</span><span className="font-bold">{bd.unverified_points ?? 0}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Failed points</span><span className="font-bold text-destructive">{bd.failed_points ?? 0}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Blockers</span><span className="font-bold">{(bd.blockers || []).length}</span></div>
        </div>
      </div>
      {bd.blockers && bd.blockers.length > 0 && (
        <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
          {bd.blockers.map((b, i) => <li key={i} className="flex gap-2"><span className="text-destructive">●</span>{b}</li>)}
        </ul>
      )}
    </div>
  );
}