import React, { useEffect, useState, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import SiteNav from "@/components/brand/SiteNav";
import SiteFooter from "@/components/brand/SiteFooter";
import { PrimaryButton, OutlineLink, ArrowRight, PillBadge } from "@/components/brand/BrandButton";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

const GATES = ["STATIC_VALIDATION","FUNCTIONAL_VALIDATION","SECURITY_VALIDATION","VISUAL_VALIDATION","OPERATIONAL_VALIDATION"];
const GATE_LABELS = { STATIC_VALIDATION:"Static", FUNCTIONAL_VALIDATION:"Functional", SECURITY_VALIDATION:"Security", VISUAL_VALIDATION:"Visual", OPERATIONAL_VALIDATION:"Operational" };

function ScoreRing({ score }) {
  const color = score >= 80 ? "#CCBB00" : score >= 50 ? "#E6D400" : "#000000";
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14 flex items-center justify-center rounded-full" style={{ background: `conic-gradient(${color} ${score*3.6}deg, #E5E7EB 0deg)` }}>
        <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
          <span className="text-lg font-black" style={{ color }}>{score}</span>
        </div>
      </div>
    </div>
  );
}

export default function Benchmarks() {
  const [benchmarks, setBenchmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [url, setUrl] = useState("");
  const [gen, setGen] = useState("external");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      const list = await base44.entities.Benchmark.list("-created_date", 300);
      setBenchmarks(list);
    } catch { setBenchmarks([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const unsub = base44.entities.Benchmark.subscribe(() => load());
    return unsub;
  }, [load]);

  const runs = useMemo(() => {
    const map = new Map();
    for (const b of benchmarks) {
      const key = b.run_id || b.id;
      if (!map.has(key)) map.set(key, { run_id: key, target_url: b.target_url, generator: b.generator, gates: {}, created: b.created_date });
      const r = map.get(key);
      r.gates[b.metric] = b.score;
      if (b.created_date > r.created) r.created = b.created_date;
    }
    for (const r of map.values()) {
      const scores = GATES.map(g => r.gates[g] ?? 0);
      r.composite = Math.round(scores.reduce((a, c) => a + c, 0) / GATES.length);
      r.passed = GATES.filter(g => (r.gates[g] ?? 0) >= 80).length;
    }
    return [...map.values()].sort((a, b) => b.composite - a.composite);
  }, [benchmarks]);

  const leaderboard = useMemo(() => {
    const best = new Map();
    for (const r of runs) {
      const key = r.target_url || r.run_id;
      if (!best.has(key) || r.created > best.get(key).created) best.set(key, r);
    }
    return [...best.values()].sort((a, b) => b.composite - a.composite);
  }, [runs]);

  const agents = useMemo(() => {
    const map = new Map();
    for (const r of runs) {
      const g = r.generator || "unknown";
      if (!map.has(g)) map.set(g, { generator: g, runs: 0, total: 0 });
      const a = map.get(g); a.runs++; a.total += r.composite;
    }
    return [...map.values()].map(a => ({ generator: a.generator, runs: a.runs, avg: Math.round(a.total / a.runs) })).sort((a, b) => b.avg - a.avg);
  }, [runs]);

  const sel = selected ? runs.find(r => r.run_id === selected) || leaderboard[0] : leaderboard[0];
  const radarData = sel ? GATES.map(g => ({ gate: GATE_LABELS[g], score: sel.gates[g] ?? 0 })) : [];
  const agentData = agents.map(a => ({ name: a.generator, avg: a.avg, runs: a.runs }));

  const runOne = async () => {
    if (!url) return;
    setRunning(true);
    try { await base44.functions.invoke("benchmarkRunner", { url, generator: gen || "external" }); await load(); }
    catch (e) { alert(e.message); }
    setRunning(false);
  };
  const runTopAndOurs = async () => {
    setRunning(true);
    try {
      await base44.functions.invoke("benchmarkRunner", { urls: ["https://vercel.com","https://stripe.com","https://linear.app","https://notion.so","https://figma.com"], generator: "external" });
      await base44.functions.invoke("benchmarkRunner", { url: "https://ai-hub-v1.base44.app", generator: "AI HUB", target_type: "Project" });
      await load();
    } catch (e) { alert(e.message); }
    setRunning(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <PillBadge>Benchmark System</PillBadge>
            <h1 className="mt-3 font-heading text-4xl font-black tracking-tight">Quality Gate Leaderboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Deterministic, rule-based scores across the five gates — static, functional, security, visual, operational. Every run is tagged with the agent that produced it so you can see who performs best in real time.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <OutlineLink to="/hub">Command Center <ArrowRight /></OutlineLink>
            <button onClick={runTopAndOurs} disabled={running} className="xa-btn-primary disabled:opacity-50">
              {running ? "Running…" : "Benchmark top sites + ours"}
            </button>
          </div>
        </div>

        {/* Run controls */}
        <div className="mt-8 grid gap-3 rounded-2xl border border-border bg-[#FAFAFA] p-4 md:grid-cols-[1fr_220px_auto]">
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary" />
          <input value={gen} onChange={e => setGen(e.target.value)} placeholder="generator / agent" className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary" />
          <button onClick={runOne} disabled={running || !url} className="xa-btn-primary disabled:opacity-50">Run benchmark</button>
        </div>

        {/* Top 3 */}
        <h2 className="mt-10 font-heading text-xl font-bold">Top 3 verifiable systems</h2>
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading scores…</p>
        ) : leaderboard.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No runs yet. Click “Benchmark top sites + ours” to score the first batch.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {leaderboard.slice(0, 3).map((r, i) => (
              <button key={r.run_id} onClick={() => setSelected(r.run_id)} className={`xa-card-feature text-left ${sel?.run_id === r.run_id ? "ring-2 ring-primary" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="xa-pill-badge">#{i + 1}</span>
                  <ScoreRing score={r.composite} />
                </div>
                <h3 className="mt-4 truncate text-base font-bold">{r.target_url || "Unknown"}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{r.generator} · {r.passed}/5 gates passed</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {GATES.map(g => (
                    <span key={g} className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: (r.gates[g] ?? 0) >= 80 ? "#FFFBCC" : "#F4F4F5", color: (r.gates[g] ?? 0) >= 80 ? "#8A7300" : "#71717A" }}>{GATE_LABELS[g]} {r.gates[g] ?? 0}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Radar for selected */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="font-heading text-lg font-bold">Gate breakdown — {sel ? sel.target_url : "—"}</h3>
            {sel ? (
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="gate" tick={{ fontSize: 12, fill: "#4B5563" }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} />
                    <Radar dataKey="score" stroke="#CCBB00" fill="#FFEA00" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="mt-4 text-sm text-muted-foreground">Select a system to view its gate breakdown.</p>}
          </div>

          {/* Agent performance */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="font-heading text-lg font-bold">Agent performance (avg composite)</h3>
            {agentData.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No agent-tagged runs yet.</p>
            ) : (
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agentData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "#4B5563" }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#4B5563" }} width={80} />
                    <Tooltip cursor={{ fill: "#FAFAFA" }} />
                    <Bar dataKey="avg" radius={[0, 6, 6, 0]}>
                      {agentData.map((d, i) => <Cell key={i} fill={i === 0 ? "#CCBB00" : "#E5E7EB"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Full leaderboard table */}
        <h2 className="mt-10 font-heading text-xl font-bold">All scored systems</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#FAFAFA] text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-bold">#</th>
                <th className="px-4 py-3 font-bold">System</th>
                <th className="px-4 py-3 font-bold">Agent</th>
                {GATES.map(g => <th key={g} className="px-4 py-3 font-bold">{GATE_LABELS[g]}</th>)}
                <th className="px-4 py-3 font-bold">Composite</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((r, i) => (
                <tr key={r.run_id} onClick={() => setSelected(r.run_id)} className={`cursor-pointer border-t border-border ${sel?.run_id === r.run_id ? "bg-[#FFFBCC]/40" : ""}`}>
                  <td className="px-4 py-3 font-bold">{i + 1}</td>
                  <td className="px-4 py-3 max-w-[220px] truncate">{r.target_url || "—"}</td>
                  <td className="px-4 py-3">{r.generator || "—"}</td>
                  {GATES.map(g => <td key={g} className="px-4 py-3 font-semibold" style={{ color: (r.gates[g] ?? 0) >= 80 ? "#8A7300" : "#71717A" }}>{r.gates[g] ?? 0}</td>)}
                  <td className="px-4 py-3 font-black">{r.composite}</td>
                </tr>
              ))}
              {leaderboard.length === 0 && !loading && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No benchmark runs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}