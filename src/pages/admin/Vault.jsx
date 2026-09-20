import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SectionHeader from "@/components/admin/SectionHeader";

const CONNECTORS = [
  { name: "Google Drive", url: "https://drive.google.com", status: "connected" },
  { name: "Supabase", url: "https://supabase.com/dashboard", status: "connected" },
  { name: "Gmail", url: "https://mail.google.com", status: "connected" },
  { name: "Google Sheets", url: "https://sheets.google.com", status: "connected" },
  { name: "Google Calendar", url: "https://calendar.google.com", status: "connected" },
  { name: "HubSpot (CRM)", url: "https://app.hubspot.com", status: "connected" },
  { name: "GitHub", url: "https://github.com", status: "linked" },
  { name: "Vercel", url: "https://vercel.com/dashboard", status: "linked" },
];

const SOP = [
  "1. Establish source truth (repo, branch, deployment, database, env).",
  "2. Decompose goal via Meta Agent into typed work packets.",
  "3. Execute READ/DRAFT in sandbox; gate BRANCH_WRITE/PROTECTED on approval.",
  "4. Run the validation mesh; capture immutable receipts.",
  "5. Recursive repair until all gates pass or a real blocker is escalated.",
  "6. Release only with 100% production-readiness evidence and rollback reference.",
];

export default function Vault() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const t = await base44.entities.PaperTrade.list("-created_date", 100).catch(() => []);
        setTrades(t || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openPnl = trades.filter((t) => t.status === "OPEN").reduce((s, t) => s + (t.pnl || 0), 0);
  const closedPnl = trades.filter((t) => t.status === "CLOSED").reduce((s, t) => s + (t.pnl || 0), 0);

  return (
    <div>
      <SectionHeader num="08" badge="Vault" title="MCP Vault, Paper Trading Ledger, SOP & CRM" desc="The secured system vault — MCP server, the paper-trading crypto ledger, standard operating procedure, CRM links, and the connected stack. Everything strategically linked and synced." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">MCP Server</h3>
          <p className="text-sm text-muted-foreground">Bidirectional GPT sync endpoint exposing the app's chat, tools, and data to external AI clients.</p>
          <code className="mt-3 block rounded-lg border border-border bg-[#FAFAFA] px-3 py-2 text-xs">https://ai-hub-v1.base44.app/mcp</code>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="text-xs font-semibold">Active · least-privilege tool contracts</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Standard Operating Procedure</h3>
          <ol className="space-y-1.5 text-sm text-muted-foreground">
            {SOP.map((s) => <li key={s} className="rounded-lg border border-border bg-[#FAFAFA] px-3 py-1.5">{s}</li>)}
          </ol>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Paper Trading Crypto Ledger</h3>
            <div className="flex gap-4 text-xs">
              <span>Open P/L: <strong className={openPnl >= 0 ? "text-green-600" : "text-red-600"}>${openPnl.toFixed(2)}</strong></span>
              <span>Closed P/L: <strong className={closedPnl >= 0 ? "text-green-600" : "text-red-600"}>${closedPnl.toFixed(2)}</strong></span>
            </div>
          </div>
          {loading ? <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div> : trades.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No paper trades recorded. Seed the ledger to begin.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                  <tr><th className="px-3 py-2">Symbol</th><th className="px-3 py-2">Side</th><th className="px-3 py-2">Entry</th><th className="px-3 py-2">Exit</th><th className="px-3 py-2">Qty</th><th className="px-3 py-2">P/L</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Strategy</th></tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-semibold">{t.symbol}</td>
                      <td className="px-3 py-2">{t.side}</td>
                      <td className="px-3 py-2">${t.entry_price}</td>
                      <td className="px-3 py-2">{t.exit_price ? `$${t.exit_price}` : "—"}</td>
                      <td className="px-3 py-2">{t.quantity}</td>
                      <td className={`px-3 py-2 font-semibold ${(t.pnl || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>{(t.pnl || 0) >= 0 ? "+" : ""}${(t.pnl || 0).toFixed(2)}</td>
                      <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${t.status === "CLOSED" ? "bg-secondary text-primary" : "border border-border"}`}>{t.status}</span></td>
                      <td className="px-3 py-2 text-muted-foreground">{t.strategy || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 lg:col-span-2">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Connected Stack & CRM — Strategic Links</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CONNECTORS.map((c) => (
              <a key={c.name} href={c.url} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-xl border border-border bg-[#FAFAFA] px-4 py-3 transition hover:border-primary">
                <div>
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="text-[10px] uppercase text-muted-foreground">{c.status}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-secondary"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}