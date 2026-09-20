import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SiteNav from "@/components/brand/SiteNav";
import SiteFooter from "@/components/brand/SiteFooter";
import { PillBadge } from "@/components/brand/BrandButton";

const FILTERS = ["ALL", "PASS", "FAIL", "BLOCKED", "PENDING", "MISSING_EVIDENCE"];

export default function Validation() {
  const [receipts, setReceipts] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.ValidationReceipt.list("-created_date", 200);
        setReceipts(list || []);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const shown = filter === "ALL" ? receipts : receipts.filter((r) => r.status === filter);
  const counts = FILTERS.reduce((acc, f) => { if (f !== "ALL") acc[f] = receipts.filter((r) => r.status === f).length; return acc; }, {});

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <PillBadge>Validation Center</PillBadge>
          <h1 className="text-2xl font-black">Independent Validation Receipts</h1>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${filter === f ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary"}`}>
              {f}{f !== "ALL" ? ` (${counts[f] || 0})` : ""}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-secondary" /></div>
        ) : shown.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No validation receipts yet. Run the Meta Agent to generate a validation plan.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[#FAFAFA] text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Check</th>
                  <th className="px-4 py-3">Expected</th>
                  <th className="px-4 py-3">Actual</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Validator</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold">{r.check_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.expected || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.actual || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${r.status === "PASS" ? "bg-secondary text-primary" : r.status === "FAIL" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.validator || "independent"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}