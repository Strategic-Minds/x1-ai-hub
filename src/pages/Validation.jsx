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
  const [reconciling, setReconciling] = useState(false);
  const [reconResult, setReconResult] = useState(null);

  const loadReceipts = async () => {
    const list = await base44.entities.ValidationReceipt.list("-created_date", 200);
    setReceipts(list || []);
  };

  useEffect(() => {
    (async () => {
      try {
        await loadReceipts();
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const runReconciliation = async () => {
    setReconciling(true);
    setReconResult(null);
    try {
      const res = await base44.functions.invoke("reconciler", {});
      setReconResult(res?.data || null);
      await loadReceipts();
    } catch (e) {
      setReconResult({ error: e.message });
    }
    setReconciling(false);
  };

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
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${filter === f ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary"}`}>
              {f}{f !== "ALL" ? ` (${counts[f] || 0})` : ""}
            </button>
          ))}
          <button
            onClick={runReconciliation}
            disabled={reconciling}
            className="ml-auto rounded-full bg-secondary px-4 py-1.5 text-xs font-bold text-primary transition hover:opacity-80 disabled:opacity-50"
          >
            {reconciling ? "Reconciling…" : "Run Reconciliation"}
          </button>
        </div>

        {reconResult && (
          <div className={`mb-4 rounded-xl border p-4 text-sm ${reconResult.error ? "border-destructive bg-destructive/5 text-destructive" : "border-primary/30 bg-primary/5"}`}>
            {reconResult.error ? (
              <span>Error: {reconResult.error}</span>
            ) : (
              <div className="space-y-1">
                <div className="font-bold">Reconciliation Complete</div>
                <div className="text-muted-foreground">
                  {reconResult.sessions_processed} sessions · {reconResult.receipts_updated} receipts updated · {reconResult.packets_unblocked} packets unblocked · {reconResult.packets_stuck} stuck · {reconResult.readiness_recalculated} readiness recalculated
                </div>
                {reconResult.discrepancies?.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-semibold">{reconResult.discrepancies.length} discrepancies found</summary>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {reconResult.discrepancies.slice(0, 20).map((d, i) => (
                        <li key={i} className="rounded border border-border bg-white px-2 py-1">
                          <span className="font-semibold">{d.type}</span>: {d.from || ""} → {d.to || ""} {d.packet || d.check || ""}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </div>
        )}
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