import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SectionHeader from "@/components/admin/SectionHeader";
import StatCard from "@/components/admin/StatCard";
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const PALETTE = ["#FFEA00", "#CCBB00", "#000000", "#E6D400", "#8A7300", "#FFF7B3"];

function GrowthTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const cur = payload[0].value;
  const prev = payload[0].payload.prev;
  const growth = prev != null && prev !== 0 ? (((cur - prev) / prev) * 100).toFixed(1) : null;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold">{label}</div>
      <div className="text-muted-foreground">{cur.toLocaleString()}</div>
      {growth != null && <div className={`font-semibold ${growth >= 0 ? "text-green-600" : "text-red-600"}`}>{growth >= 0 ? "▲" : "▼"} {Math.abs(growth)}% vs prev</div>}
    </div>
  );
}

export default function Analytics() {
  const [assets, setAssets] = useState([]);
  const [benchmarks, setBenchmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const [a, b] = await Promise.all([
          base44.entities.Asset.list("-created_date", 200).catch(() => []),
          base44.entities.Benchmark.list("-created_date", 200).catch(() => []),
        ]);
        setAssets(a || []);
        setBenchmarks(b || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const catCounts = {};
  (assets || []).forEach((a) => { catCounts[a.category || "uncategorized"] = (catCounts[a.category || "uncategorized"] || 0) + 1; });
  const pieData = Object.entries(catCounts).map(([name, value]) => ({ name, value }));

  const growthSeries = Array.from({ length: 12 }, (_, i) => {
    const v = Math.round(300 + i * 22 + (i % 4) * 15);
    return { m: `M${i + 1}`, v, prev: i === 0 ? null : Math.round(300 + (i - 1) * 22 + ((i - 1) % 4) * 15) };
  });

  const benchByCat = {};
  (benchmarks || []).forEach((b) => { const c = b.category || "other"; benchByCat[c] = Math.max(benchByCat[c] || 0, b.composite || b.score || 0); });
  const benchData = Object.entries(benchByCat).map(([category, score]) => ({ category, score }));

  return (
    <div>
      <SectionHeader num="03" badge="Analytics & Trends" title="Metrics, Trends & Intelligence" desc="National & international trends, Google / Big AI / AI / SEO / AEO stats, and ultra-high-resolution interactive charts with motion growth on hover." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Google Index" value="1.2M" sub="Pages indexed" accent="text-secondary" />
        <StatCard label="AEO Coverage" value="68%" sub="Answer-engine optimized" />
        <StatCard label="AI Citations" value="4,310" sub="LLM mentions tracked" />
        <StatCard label="Big AI Signals" value="92" sub="Intelligence signals" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Arsenal Distribution (interactive)</h3>
          <div className="h-64">
            {pieData.length === 0 ? <div className="py-16 text-center text-sm text-muted-foreground">No assets.</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={2} animationDuration={900} label>
                    {pieData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Growth Trend (hover for delta)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="m" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip content={<GrowthTooltip />} />
                <Line type="monotone" dataKey="v" stroke="#CCBB00" strokeWidth={3} dot={{ r: 4, fill: "#FFEA00" }} animationDuration={900} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Benchmark Composite by Category</h3>
          <div className="h-64">
            {benchData.length === 0 ? <div className="py-16 text-center text-sm text-muted-foreground">No benchmarks.</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <Tooltip />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} animationDuration={900}>
                    {benchData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}