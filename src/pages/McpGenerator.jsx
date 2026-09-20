import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SiteNav from "@/components/brand/SiteNav";
import SiteFooter from "@/components/brand/SiteFooter";
import { PrimaryButton, PillBadge } from "@/components/brand/BrandButton";

const ENTITIES = ["PaperTrade", "ChatSession", "WorkPacket", "Benchmark", "Asset", "Prompt", "Package", "Capability", "SwarmAgent", "MetaSession", "TaxonomyNode", "CronJob"];
const OPS = ["list", "get", "filter", "create"];

export default function McpGenerator() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [entity, setEntity] = useState(ENTITIES[0]);
  const [op, setOp] = useState("list");
  const [schema, setSchema] = useState(null);
  const [fields, setFields] = useState([]);
  const [picked, setPicked] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tools, setTools] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const s = await base44.entities[entity].schema().catch(() => null);
        setSchema(s);
        setFields(s ? Object.keys(s.properties || {}) : []);
        setPicked([]);
      } catch { setSchema(null); }
    })();
  }, [entity]);

  useEffect(() => {
    (async () => {
      const all = await base44.entities.Tool.list("-created_date", 200).catch(() => []);
      setTools((all || []).filter((t) => t.type === "mcp"));
    })();
  }, [result]);

  const toggle = (f) => setPicked((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]));

  const generate = async () => {
    setError(""); setResult(null); setBusy(true);
    try {
      const res = await base44.functions.invoke("mcpGenerator", {
        name, description: desc, entity_name: entity, operation: op, allowed_fields: picked,
      });
      if (res.data?.error) setError(res.data.error);
      else setResult(res.data);
    } catch (e) {
      setError(e.message || "Generation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="mb-3"><PillBadge>MCP Generator · Hardened</PillBadge></div>
        <h1 className="text-3xl font-black sm:text-4xl">Generate a Personalized MCP Tool</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Turn any entity into a least-privilege MCP tool external AI clients can call. Validated server-side against the live schema — no unbounded input.</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tool name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="my_paper_trades" className="mt-1 w-full rounded-lg border border-border bg-[#FAFAFA] px-3 py-2 text-sm" />

            <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="List the current user's paper trades" className="mt-1 h-20 w-full rounded-lg border border-border bg-[#FAFAFA] px-3 py-2 text-sm" />

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Entity</label>
                <select value={entity} onChange={(e) => setEntity(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-[#FAFAFA] px-3 py-2 text-sm">
                  {ENTITIES.map((en) => <option key={en} value={en}>{en}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Operation</label>
                <select value={op} onChange={(e) => setOp(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-[#FAFAFA] px-3 py-2 text-sm">
                  {OPS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">Allowed fields (least-privilege — empty = all)</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {fields.map((f) => (
                <button key={f} onClick={() => toggle(f)} className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${picked.includes(f) ? "border-transparent bg-secondary text-primary" : "border-border bg-[#FAFAFA] text-muted-foreground"}`}>{f}</button>
              ))}
              {!schema && <span className="text-xs text-muted-foreground">No schema available</span>}
            </div>

            <div className="mt-6">
              <PrimaryButton onClick={generate}>{busy ? "Generating…" : "Generate & Register Tool"}</PrimaryButton>
            </div>
            {error && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Generated Spec</h3>
              {result ? (
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-[#FAFAFA] p-4 text-xs">{JSON.stringify(result.spec, null, 2)}</pre>
              ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">Fill the form and generate to see the hardened MCP tool spec.</div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Registered MCP Tools</h3>
              {tools.length === 0 ? <div className="py-6 text-center text-sm text-muted-foreground">No MCP tools registered yet.</div> : (
                <ul className="space-y-2">
                  {tools.map((t) => (
                    <li key={t.id} className="flex items-center justify-between rounded-lg border border-border bg-[#FAFAFA] px-3 py-2 text-sm">
                      <span className="font-mono text-xs">{t.key}</span>
                      <span className="text-xs text-muted-foreground">{t.endpoint}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}