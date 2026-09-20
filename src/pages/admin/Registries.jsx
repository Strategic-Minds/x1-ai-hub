import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SectionHeader from "@/components/admin/SectionHeader";

const CLEARANCE = { running: "FULL", idle: "STANDARD", done: "OBSERVER", blocked: "RESTRICTED" };
const CLEARANCE_COLOR = { FULL: "bg-primary text-black", STANDARD: "border border-border", OBSERVER: "border border-border text-muted-foreground", RESTRICTED: "bg-secondary text-primary" };

const ENV_SAMPLES = [
  "XTREME_SEO_GENERATOR", "GCP_JSON_KEY", "GITHUB_API_KEY", "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_URL", "VERCEL_API_KEY", "GODADDY_API_KEY",
  "XTREME_CLOUD_BROWSER_KEY", "ENGINE_API_KEY", "ENGINE_URL", "BASE44_API_KEY",
];

export default function Registries() {
  const [agents, setAgents] = useState([]);
  const [crons, setCrons] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const [a, c] = await Promise.all([
          base44.entities.SwarmAgent.list("-created_date", 200).catch(() => []),
          base44.entities.CronJob.list("-created_date", 200).catch(() => []),
        ]);
        setAgents(a || []);
        setCrons(c || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <SectionHeader num="06" badge="Registries" title="Agent Registry & System Registries" desc="Agents as employee portfolios with job title, capabilities, and authoritative clearance — plus system registries and the environment samples checklist." />

      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Agent Registry — Employee Portfolios</h3>
      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : agents.length === 0 ? (
        <div className="mb-8 rounded-2xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">No agents registered.</div>
      ) : (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => {
            const clearance = CLEARANCE[a.status] || "STANDARD";
            return (
              <div key={a.id} className="rounded-2xl border border-border bg-white p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-black text-primary">{(a.name || "A").slice(0, 1)}</div>
                    <div>
                      <div className="text-sm font-bold">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.role}</div>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${CLEARANCE_COLOR[clearance]}`}>{clearance}</span>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">Model: <span className="font-semibold text-secondary">{a.model || "automatic"}</span></div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(a.capabilities || []).map((c) => (
                    <span key={c} className="rounded border border-border bg-[#FAFAFA] px-1.5 py-0.5 text-[10px] text-muted-foreground">#{c}</span>
                  ))}
                  {(!a.capabilities || a.capabilities.length === 0) && <span className="text-[10px] text-muted-foreground">No capability tags</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">System Registry — Scheduled Jobs</h3>
          {crons.length === 0 ? <div className="py-6 text-center text-sm text-muted-foreground">No cron jobs registered.</div> : (
            <ul className="space-y-2">
              {crons.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-[#FAFAFA] px-3 py-2 text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.schedule} · {c.last_status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Environment Samples Checklist</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {ENV_SAMPLES.map((s) => (
              <li key={s} className="flex items-center gap-2 rounded-lg border border-border bg-[#FAFAFA] px-3 py-2 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                <span className="font-mono text-xs">{s}</span>
                <span className="ml-auto text-[10px] font-bold uppercase text-green-600">configured</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}