import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SectionHeader from "@/components/admin/SectionHeader";

const GUIDELINES = [
  "Inspect before modifying — establish source truth first.",
  "Separate VERIFIED facts from INFERRED assumptions.",
  "Every mutation is idempotent; every async process has retry, timeout, dead-letter, observability.",
  "Every persistent mutation captures a rollback reference first.",
  "Protected actions require explicit human approval — the LLM cannot self-authorize.",
  "Receipts are append-only and immutable.",
  "Never expose credentials or copy proprietary third-party source.",
];

const APPROVAL_MATRIX = [
  ["Read metadata", "Allow"],
  ["Draft plan / spec", "Allow"],
  ["Write approved branch", "When packet valid"],
  ["Merge protected branch", "Human approval"],
  ["Production deploy", "Human approval"],
  ["Secret / env change", "Human approval"],
  ["Customer messaging", "Human approval"],
];

export default function Governance() {
  const [taxonomy, setTaxonomy] = useState([]);
  const [manifesto, setManifesto] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const [t, prompts] = await Promise.all([
          base44.entities.TaxonomyNode.list("-created_date", 200).catch(() => []),
          base44.entities.Prompt.list("-created_date", 200).catch(() => []),
        ]);
        setTaxonomy(t || []);
        const m = (prompts || []).find((p) => p.key === "master_architect_invocation");
        setManifesto(m ? m.prompt_text : "Master Architect Invocation prompt not found in Arsenal.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <SectionHeader num="05" badge="Governance" title="Manifestos, Taxonomy, Contracts & Guidelines" desc="The governing standard, classification index, approval contracts, and operating rules that bind every agent and system." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Master Manifesto</h3>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-[#FAFAFA] p-4 text-xs text-muted-foreground">{manifesto}</pre>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Approval Contract Matrix</h3>
          <div className="space-y-2">
            {APPROVAL_MATRIX.map(([a, b]) => (
              <div key={a} className="flex items-center justify-between rounded-lg border border-border bg-[#FAFAFA] px-3 py-2 text-sm">
                <span className="font-medium">{a}</span>
                <span className={`text-xs font-bold ${b === "Human approval" ? "text-secondary" : "text-muted-foreground"}`}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Operating Guidelines</h3>
          <ul className="space-y-2">
            {GUIDELINES.map((g) => (
              <li key={g} className="flex items-start gap-2 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCBB00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-none"><path d="M20 6 9 17l-5-5" /></svg>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Taxonomy Index</h3>
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : taxonomy.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No taxonomy nodes.</div>
          ) : (
            <ul className="space-y-1.5">
              {taxonomy.slice(0, 30).map((n) => (
                <li key={n.id} className="rounded border border-border bg-[#FAFAFA] px-3 py-1.5 text-sm">
                  <span className="font-semibold">{n.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{n.domain || ""}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}