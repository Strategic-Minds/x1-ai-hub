import React from "react";

const STATUS_COLORS = {
  AVAILABLE: "bg-secondary text-primary",
  PARTIAL: "bg-primary/20 text-[#8A7300]",
  MISSING: "bg-destructive/10 text-destructive",
  UNVERIFIED: "bg-muted text-muted-foreground",
  DEPRECATED: "bg-muted text-muted-foreground line-through",
};

export default function CapabilityMap({ items }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-muted-foreground">No capability data.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((c) => (
        <div key={c.category} className="rounded-lg border border-border bg-white px-3 py-2">
          <div className="truncate text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{c.category}</div>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLORS[c.status] || STATUS_COLORS.UNVERIFIED}`}>{c.status}</span>
        </div>
      ))}
    </div>
  );
}