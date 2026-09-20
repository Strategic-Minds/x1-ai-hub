import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SectionHeader from "@/components/admin/SectionHeader";

export default function Strategy() {
  const [sessions, setSessions] = useState([]);
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const [s, p] = await Promise.all([
          base44.entities.MetaSession.list("-created_date", 50).catch(() => []),
          base44.entities.WorkPacket.list("-created_date", 100).catch(() => []),
        ]);
        setSessions(s || []);
        setPackets(p || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <SectionHeader num="02" badge="Vision & Strategy" title="Visions, Plans, Strategies & Architecture" desc="Every Meta Agent goal decomposed into strategies, simulations, architecture, and executable work packets." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Strategic Visions (Meta Sessions)</h3>
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No strategies yet. Run the Meta Agent to generate.</div>
          ) : (
            <ul className="space-y-3">
              {sessions.map((s) => (
                <li key={s.id} className="rounded-lg border border-border bg-[#FAFAFA] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{s.goal}</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase text-primary">{s.status}</span>
                  </div>
                  {s.architecture && <p className="mt-2 text-xs text-muted-foreground">{s.architecture}</p>}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(s.intent_types || []).map((t) => (
                      <span key={t} className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Execution Plans (Work Packets)</h3>
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : packets.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No work packets.</div>
          ) : (
            <ul className="space-y-2">
              {packets.slice(0, 20).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-[#FAFAFA] px-3 py-2 text-sm">
                  <span className="min-w-0 truncate font-medium">{p.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.status === "PASSED" || p.status === "COMPLETE" ? "bg-primary text-black" : "border border-border text-muted-foreground"}`}>{p.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="text-sm font-bold">Simulations</h3>
          <p className="mt-2 text-xs text-muted-foreground">Asset prediction (X1 Predict) and visual/spatial (Vision Cortex) simulators emit deterministic render + prediction receipts.</p>
          <a href="/pricing" className="mt-3 inline-block text-xs font-semibold text-secondary underline">X1 Predict · Vision Cortex</a>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="text-sm font-bold">Architecture</h3>
          <p className="mt-2 text-xs text-muted-foreground">Deterministic DAG + reconciliation heartbeat + durable job queue + immutable receipts + rollback references.</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="text-sm font-bold">Code</h3>
          <p className="mt-2 text-xs text-muted-foreground">Source-of-truth repos synced via GitHub. Every change is branch-first, validated, and receipted before release.</p>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-semibold text-secondary underline">Open GitHub</a>
        </div>
      </div>
    </div>
  );
}