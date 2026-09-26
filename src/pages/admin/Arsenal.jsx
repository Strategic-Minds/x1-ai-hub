import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SectionHeader from "@/components/admin/SectionHeader";

const TABS = [
  { key: "assets", label: "Assets", entity: "Asset" },
  { key: "prompts", label: "Prompts", entity: "Prompt" },
  { key: "packages", label: "Packages", entity: "Package" },
  { key: "capabilities", label: "Capabilities", entity: "Capability" },
  { key: "tools", label: "Tools", entity: "Tool" },
];

const EXECUTOR_CAPABILITIES = {
  BASE44: ["app_build", "entity_operations", "frontend_render", "backend_function", "workflow_automation", "user_auth", "file_upload", "integration_invoke"],
  CODEX: ["code_generation", "code_review", "refactoring", "test_generation", "documentation"],
  GITHUB_AGENT: ["repo_clone", "branch_create", "pull_request", "merge_branch", "issue_management"],
  VERCEL: ["deployment", "edge_function", "domain_config", "env_management", "cron_deploy"],
  SUPABASE: ["database_query", "auth_management", "storage_operations", "realtime_subscription", "migration_run"],
  RAILWAY: ["backend_hosting", "database_hosting", "env_management"],
  XTREME_CLOUD_BROWSER: ["web_browsing", "web_scraping", "form_automation", "screenshot_capture"],
  XTREME_COMMUNICATIONS: ["email_send", "sms_send", "push_notification", "social_post"],
  XTREME_SEO_GENERATOR: ["seo_content", "meta_tags", "sitemap_generation", "schema_markup", "aeo_optimization"],
  VISION_CORTEX: ["visual_analysis", "screenshot_comparison", "layout_validation", "accessibility_audit"],
  EXTERNAL_MCP: ["external_tool_call", "custom_protocol"],
  HUMAN: ["manual_review", "approval", "decision_making", "creative_direction"],
};

export default function Arsenal() {
  const [tab, setTab] = useState("assets");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);
  const [wiringMap, setWiringMap] = useState({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const ent = TABS.find((t) => t.key === tab).entity;
        const res = await base44.entities[ent].list("-created_date", 200).catch(() => []);
        setItems(res || []);
        // Build wiring map when on capabilities tab
        if (tab === "capabilities") {
          const capByKey = {};
          for (const c of (res || [])) capByKey[c.key] = c;
          const wMap = {};
          for (const [executor, caps] of Object.entries(EXECUTOR_CAPABILITIES)) {
            const wired = caps.filter((k) => capByKey[k] && capByKey[k].enabled);
            const missing = caps.filter((k) => !capByKey[k] || !capByKey[k].enabled);
            wMap[executor] = { wired: wired.length, total: caps.length, missing, status: missing.length === 0 ? "fully_wired" : wired.length > 0 ? "partial" : "unwired" };
          }
          setWiringMap(wMap);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [tab]);

  const runDispatch = async () => {
    setDispatching(true);
    setDispatchResult(null);
    try {
      const res = await base44.functions.invoke("capabilityDispatcher", {});
      setDispatchResult(res?.data || null);
      // Reload capabilities
      const res2 = await base44.entities.Capability.list("-created_date", 200).catch(() => []);
      setItems(res2 || []);
    } catch (e) {
      setDispatchResult({ error: e.message });
    }
    setDispatching(false);
  };

  return (
    <div>
      <SectionHeader num="04" badge="Arsenal & Capabilities" title="Brand Lines, Capabilities, Tools, Templates & Generators" desc="The full deterministic, versioned registry — categorized tiles and tabular constructs. Everything the system and its agents can use." />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${tab === t.key ? "border-transparent bg-secondary text-primary" : "border-border bg-white text-muted-foreground hover:border-primary"}`}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">No {tab} registered.</div>
      ) : (
        <>
          {tab === "capabilities" && (
            <div className="mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Executor → Capability Wiring</h3>
                <button
                  onClick={runDispatch}
                  disabled={dispatching}
                  className="rounded-full bg-secondary px-4 py-1.5 text-xs font-bold text-primary transition hover:opacity-80 disabled:opacity-50"
                >
                  {dispatching ? "Dispatching…" : "Run Capability Dispatch"}
                </button>
              </div>
              {dispatchResult && (
                <div className={`rounded-xl border p-4 text-sm ${dispatchResult.error ? "border-destructive bg-destructive/5 text-destructive" : "border-primary/30 bg-primary/5"}`}>
                  {dispatchResult.error ? (
                    <span>Error: {dispatchResult.error}</span>
                  ) : (
                    <span>
                      <strong>Dispatch Complete:</strong> {dispatchResult.packets_processed} packets processed · {dispatchResult.wired} wired · {dispatchResult.dispatched} dispatched · {dispatchResult.blocked} blocked · {dispatchResult.agents_assigned} agents assigned
                    </span>
                  )}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(wiringMap).map(([executor, info]) => (
                  <div key={executor} className="rounded-xl border border-border bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{executor}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        info.status === "fully_wired" ? "bg-primary text-black" :
                        info.status === "partial" ? "bg-secondary text-primary" :
                        "bg-destructive/10 text-destructive"
                      }`}>{info.status === "fully_wired" ? "WIRED" : info.status === "partial" ? "PARTIAL" : "UNWIRED"}</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {info.wired}/{info.total} capabilities available
                    </div>
                    {info.missing.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {info.missing.slice(0, 5).map((m) => (
                          <span key={m} className="rounded border border-destructive/30 bg-destructive/5 px-1.5 py-0.5 text-[9px] text-destructive">{m}</span>
                        ))}
                        {info.missing.length > 5 && <span className="text-[9px] text-muted-foreground">+{info.missing.length - 5} more</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="overflow-hidden rounded-2xl border border-border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-[#FAFAFA] text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-bold">Name</th>
                  <th className="px-4 py-3 font-bold">Category</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Description</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-border last:border-0 hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3 font-semibold">{it.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{it.category || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        it.validation_status === "VERIFIED" ? "bg-primary text-black" :
                        it.enabled === false ? "bg-muted text-muted-foreground" :
                        "border border-border text-muted-foreground"
                      }`}>{it.validation_status || (it.enabled === false ? "disabled" : "curated")}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{it.description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}