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

export default function Arsenal() {
  const [tab, setTab] = useState("assets");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const ent = TABS.find((t) => t.key === tab).entity;
        const res = await base44.entities[ent].list("-created_date", 200).catch(() => []);
        setItems(res || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [tab]);

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
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${it.validation_status === "VERIFIED" ? "bg-primary text-black" : "border border-border text-muted-foreground"}`}>{it.validation_status || it.enabled === false ? "disabled" : "curated"}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{it.description || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}