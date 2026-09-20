import React from "react";
import { ArrowDown } from "lucide-react";

export default function DependencyGraph({ packets }) {
  if (!packets || packets.length === 0) {
    return <p className="text-sm text-muted-foreground">No work packets.</p>;
  }
  return (
    <div>
      {packets.map((p, i) => (
        <div key={p.id || i}>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
            <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">{i + 1}</span>
            <span className="flex-1 text-sm font-medium">{p.title}</span>
            <span className="text-[10px] font-bold uppercase text-muted-foreground">{p.risk_class}</span>
          </div>
          {i < packets.length - 1 && (
            <div className="flex justify-center py-0.5"><ArrowDown className="h-4 w-4 text-muted-foreground/40" /></div>
          )}
        </div>
      ))}
    </div>
  );
}