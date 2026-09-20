import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SectionHeader from "@/components/admin/SectionHeader";

export default function Benchmarks() {
  const [benchmarks, setBenchmarks] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const [b, a] = await Promise.all([
          base44.entities.Benchmark.list("-created_date", 200).catch(() => []),
          base44.entities.AuditEvent.list("-created_date", 50).catch(() => []),
        ]);
        setBenchmarks(b || []);
        setAudits(a || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pass = benchmarks.filter((b) => b.status === "pass").length;
  const fail = benchmarks.filter((b) => b.status === "fail").length;
  const pending = benchmarks.filter((b) => b.status === "pending").length;

  return (
    <div>
      <SectionHeader num="07" badge="Benchmarks & Logs" title="Benchmarks, Log Systems & Stacks" desc="Independent validation results, the audit log stream, and the connected system stack inventory." />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-5"><div className="text-xs font-semibold uppercase text-muted-foreground">Total</div><div className="mt-1 text-2xl font-black">{benchmarks.length}</div></div>
        <div className="rounded-xl border border-border bg-white p-5"><div className="text-xs font-semibold uppercase text-muted-foreground">Pass</div><div className="mt-1 text-2xl font-black text-green-600">{pass}</div></div>
        <div className="rounded-xl border border-border bg-white p-5"><div className="text-xs font-semibold uppercase text-muted-foreground">Fail</div><div className="mt-1 text-2xl font-black text-red-600">{fail}</div></div>
        <div className="rounded-xl border border-border bg-white p-5"><div className="text-xs font-semibold uppercase text-muted-foreground">Pending</div><div className="mt-1 text-2xl font-black text-muted-foreground">{pending}</div></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Benchmark Results</h3>
          {loading ? <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div> : benchmarks.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">No benchmarks.</div> : (
            <ul className="space-y-2">
              {benchmarks.slice(0, 25).map((b) => (
                <li key={b.id} className="flex items-center justify-between rounded-lg border border-border bg-[#FAFAFA] px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{b.name}</div>
                    <div className="text-xs text-muted-foreground">{b.category} · {b.metric}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${b.status === "pass" ? "bg-primary text-black" : b.status === "fail" ? "bg-red-600 text-white" : "border border-border text-muted-foreground"}`}>{b.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Log System — Audit Stream</h3>
          {audits.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">No audit events.</div> : (
            <ul className="space-y-2 font-mono text-xs">
              {audits.map((e) => (
                <li key={e.id} className="rounded-lg border border-border bg-[#FAFAFA] px-3 py-2">
                  <span className="text-secondary">[{e.status || e.severity || "info"}]</span> {e.action || e.event_type || "event"} {e.target_type ? `→ ${e.target_type}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-white p-6">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">System Stack</h3>
        <div className="flex flex-wrap gap-2">
          {["Base44", "Supabase", "Google Drive", "Gmail", "Google Sheets", "Google Calendar", "HubSpot", "GitHub", "Vercel", "GoDaddy", "GCP", "Recharts", "React", "Tailwind"].map((s) => (
            <span key={s} className="rounded-full border border-border bg-[#FAFAFA] px-3 py-1 text-xs font-semibold text-muted-foreground">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}