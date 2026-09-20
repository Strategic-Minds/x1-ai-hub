import React from "react";

export default function StatCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-2 text-3xl font-black ${accent || ""}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}