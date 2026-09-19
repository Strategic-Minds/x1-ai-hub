import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SiteNav from "@/components/brand/SiteNav";
import SiteFooter from "@/components/brand/SiteFooter";
import AssemblyLine from "@/components/brand/AssemblyLine";
import { PrimaryButton, OutlineButton, PillBadge, ArrowRight } from "@/components/brand/BrandButton";
import { LIFECYCLE_STAGES, nextStage, stageIndex } from "@/lib/lifecycle";

const SEED_PROJECT = {
  name: "Roofing SaaS",
  intent: "Build me a SaaS for roofing contractors.",
  factory: "SaaS Factory",
  current_stage: "BRANCH_BUILD",
  status: "in_progress",
  progress: 52,
};

export default function Hub() {
  const [project, setProject] = useState(null);
  const [stage, setStage] = useState("BRANCH_BUILD");
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.Project.list("-created_date", 1);
        if (list && list.length) {
          setProject(list[0]);
          setStage(list[0].current_stage || "BRANCH_BUILD");
          const wp = await base44.entities.WorkPacket.filter({ project_id: list[0].id }, "-created_date", 20);
          setPackets(wp || []);
        } else {
          setProject(SEED_PROJECT);
        }
      } catch {
        setProject(SEED_PROJECT);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentIdx = stageIndex(stage);
  const next = nextStage(stage);
  const canAdvance = !!next;

  const advance = () => {
    if (!next) return;
    setStage(next.id);
    if (project?.id) {
      base44.entities.Project.update(project.id, { current_stage: next.id, progress: Math.round(((stageIndex(next.id) + 1) / LIFECYCLE_STAGES.length) * 100) }).catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-secondary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Project context bar */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-[#FAFAFA] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{project?.name || "Untitled project"}</h1>
                <PillBadge>{project?.factory || "Factory"}</PillBadge>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">“{project?.intent}”</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Phase", LIFECYCLE_STAGES[currentIdx]?.group],
              ["Step", `${currentIdx + 1}/${LIFECYCLE_STAGES.length}`],
              ["Status", project?.status || "in_progress"],
              ["Tenant", "XTREME-001"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border bg-white px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{k}</div>
                <div className="text-sm font-semibold capitalize truncate">{String(v)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Next action */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border-2 border-primary/40 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-primary">Next eligible action</div>
            <div className="mt-1 text-lg font-bold">{canAdvance ? `Advance to ${next.label}` : "Lifecycle complete — Operate & Optimize"}</div>
            <p className="mt-1 text-sm text-muted-foreground">Transition requires entitlement, connectors, inputs, validations, and approval per the state machine.</p>
          </div>
          <div className="flex gap-3">
            <OutlineButton type="button">Request approval</OutlineButton>
            <PrimaryButton type="button" onClick={advance} className={canAdvance ? "" : "opacity-50 pointer-events-none"}>
              {canAdvance ? "Advance stage" : "Complete"} <ArrowRight />
            </PrimaryButton>
          </div>
        </div>

        {/* Assembly line */}
        <div className="mb-6 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Assembly Line · Deterministic DAG</h2>
          <AssemblyLine currentStage={stage} />
        </div>

        {/* Work packets */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold">Work Packets</h2>
            {packets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No packets yet. Packets are created as the assembly line advances through each stage.
              </div>
            ) : (
              <div className="space-y-2">
                {packets.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-[#FAFAFA] px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.stage} · {p.generator || "—"}</div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${p.status === "passed" ? "bg-secondary text-primary" : p.status === "failed" ? "bg-destructive text-destructive-foreground" : p.status === "running" ? "bg-primary text-secondary" : "bg-muted text-muted-foreground"}`}>{p.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold">Connected Models</h2>
            <div className="space-y-2">
              {[["ChatGPT","Connected"],["Claude","Connected"],["Gemini","Connected"]].map(([m,s]) => (
                <div key={m} className="flex items-center justify-between rounded-lg border border-border bg-[#FAFAFA] px-4 py-3">
                  <span className="text-sm font-semibold">{m}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><span className="h-2 w-2 rounded-full bg-primary" />{s}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-secondary p-3 text-xs text-white/80">
              Secrets are never returned to model context. Policy is enforced server-side.
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}