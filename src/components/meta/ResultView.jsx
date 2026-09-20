import React from "react";
import { Search, FileText, CheckCircle2, AlertTriangle, Shield, ArrowRight, Network, ListChecks } from "lucide-react";
import WorkPacketCard from "./WorkPacketCard";
import DependencyGraph from "./DependencyGraph";
import ReadinessScore from "./ReadinessScore";
import CapabilityMap from "./CapabilityMap";
import { PillBadge } from "@/components/brand/BrandButton";

function Section({ icon, title, children }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{icon}{title}</h3>
      {children}
    </div>
  );
}

export default function ResultView({ session, data, onNew }) {
  const { packets = [], receipts = [], approvals = [], jobs = [], links = [] } = data || {};
  let bd = {};
  try { bd = session.readiness_breakdown ? JSON.parse(session.readiness_breakdown) : {}; } catch { bd = {}; }
  const capItems = [];
  const seen = new Set();
  links.forEach((l) => { const c = (l.asset_type || "asset").toUpperCase(); if (!seen.has(c)) { seen.add(c); capItems.push({ category: c, status: "AVAILABLE" }); } });
  jobs.forEach((j) => { capItems.push({ category: (j.query || "gap").slice(0, 18).toUpperCase(), status: j.category || "MISSING" }); });
  if (capItems.length === 0) capItems.push({ category: "AI", status: "UNVERIFIED" });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PillBadge>Analysis Complete · {session.status}</PillBadge>
        <button onClick={onNew} className="xa-btn-outline">New goal <ArrowRight /></button>
      </div>

      <Section icon={<Search className="h-4 w-4 text-[#CCBB00]" />} title="Your Goal">
        <p className="font-semibold text-foreground">{session.goal}</p>
      </Section>

      <Section icon={<FileText className="h-4 w-4 text-[#CCBB00]" />} title="What I Understood">
        <p className="text-sm text-muted-foreground">{session.summary || "—"}</p>
      </Section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Section icon={<Network className="h-4 w-4 text-[#CCBB00]" />} title="System Type">
          <div className="flex flex-wrap gap-2">
            {(session.system_types || []).map((t) => <span key={t} className="rounded-full border border-border bg-[#FAFAFA] px-3 py-1 text-xs font-semibold">{t}</span>)}
          </div>
        </Section>
        <Section icon={<ListChecks className="h-4 w-4 text-[#CCBB00]" />} title="Intent">
          <div className="flex flex-wrap gap-2">
            {(session.intent_types || []).map((t) => <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">{t}</span>)}
          </div>
        </Section>
      </div>

      {session.architecture && (
        <Section icon={<Network className="h-4 w-4 text-[#CCBB00]" />} title="Recommended Architecture">
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{session.architecture}</p>
        </Section>
      )}

      <Section icon={<CheckCircle2 className="h-4 w-4 text-[#CCBB00]" />} title="Matched Arsenal Assets">
        {links.length === 0 ? <p className="text-sm text-muted-foreground">No direct matches in the Arsenal.</p> : (
          <ul className="space-y-2">
            {links.map((l, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#8A7300]">{l.asset_type}</span>
                <span className="font-semibold">{l.asset_name || l.asset_id}</span>
                <span className="text-muted-foreground">— {l.reason || l.relationship}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section icon={<AlertTriangle className="h-4 w-4 text-[#CCBB00]" />} title="Capability Gaps">
        {jobs.length === 0 ? <p className="text-sm text-muted-foreground">No gaps detected — Arsenal covers the request.</p> : (
          <ul className="space-y-2">
            {jobs.map((j) => (
              <li key={j.id} className="flex items-center justify-between rounded-lg border border-border bg-[#FAFAFA] px-3 py-2 text-sm">
                <span><strong>{j.query}</strong> <span className="text-muted-foreground">— {j.reason}</span></span>
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">{j.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section icon={<Network className="h-4 w-4 text-[#CCBB00]" />} title="Capability Map">
        <CapabilityMap items={capItems} />
      </Section>

      <Section icon={<ListChecks className="h-4 w-4 text-[#CCBB00]" />} title={`Work Packets (${packets.length})`}>
        <div className="space-y-2">
          {packets.map((p, i) => <WorkPacketCard key={p.id || i} packet={p} index={i} />)}
        </div>
      </Section>

      <Section icon={<Network className="h-4 w-4 text-[#CCBB00]" />} title="Dependency Graph">
        <DependencyGraph packets={packets} />
      </Section>

      <Section icon={<ListChecks className="h-4 w-4 text-[#CCBB00]" />} title={`Validation Plan (${receipts.length})`}>
        {receipts.length === 0 ? <p className="text-sm text-muted-foreground">No validation checks.</p> : (
          <ul className="space-y-1 text-sm">
            {receipts.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-[#FAFAFA] px-3 py-2">
                <span className="font-semibold">{r.check_name}</span>
                <span className="hidden text-muted-foreground sm:inline">{r.expected}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${r.status === "PASS" ? "bg-secondary text-primary" : r.status === "FAIL" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"}`}>{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section icon={<Shield className="h-4 w-4 text-[#CCBB00]" />} title={`Risk / Approval Items (${approvals.length})`}>
        {approvals.length === 0 ? <p className="text-sm text-muted-foreground">No protected actions — nothing requires approval.</p> : (
          <ul className="space-y-2">
            {approvals.map((ap) => (
              <li key={ap.id} className="flex items-center justify-between rounded-lg border-2 border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
                <span><strong>{ap.action}</strong> <span className="text-muted-foreground">— {ap.reason}</span></span>
                <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase text-destructive-foreground">{ap.risk_class}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <ReadinessScore score={session.readiness_score || 0} breakdown={bd} />

      <Section icon={<ArrowRight className="h-4 w-4 text-[#CCBB00]" />} title="Next Action">
        <p className="text-sm font-semibold text-foreground">{session.next_action || "Review the work packets and approve protected actions to proceed."}</p>
      </Section>
    </div>
  );
}