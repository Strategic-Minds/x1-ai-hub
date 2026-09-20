import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SiteNav from "@/components/brand/SiteNav";
import SiteFooter from "@/components/brand/SiteFooter";
import { WideLink, OutlineLink, ArrowRight, PillBadge } from "@/components/brand/BrandButton";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ chats: 0, packets: 0, trades: 0, benchmarks: 0, openPnl: 0 });
  const [chats, setChats] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me().catch(() => null);
        setUser(me);
        if (!me) return;
        const [c, p, t, b] = await Promise.all([
          base44.entities.ChatSession.list("-created_date", 200).catch(() => []),
          base44.entities.WorkPacket.list("-created_date", 200).catch(() => []),
          base44.entities.PaperTrade.list("-created_date", 200).catch(() => []),
          base44.entities.Benchmark.list("-created_date", 200).catch(() => []),
        ]);
        const mine = (arr) => (arr || []).filter((x) => x.created_by_id === me.id);
        const myChats = mine(c);
        const myPackets = mine(p);
        const myTrades = mine(t);
        const myBench = mine(b);
        setChats(myChats.slice(0, 5));
        setTrades(myTrades.slice(0, 5));
        setStats({
          chats: myChats.length,
          packets: myPackets.length,
          trades: myTrades.length,
          benchmarks: myBench.length,
          openPnl: myTrades.filter((x) => x.status === "OPEN").reduce((s, x) => s + (x.pnl || 0), 0),
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-3"><PillBadge>Your Workspace</PillBadge></div>
        <h1 className="text-3xl font-black sm:text-4xl">
          Welcome back{user ? `, ${user.full_name || user.email}` : ""}.
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Your personalized command surface — chats, work packets, paper trades, and benchmarks, scoped to your account.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-white p-5"><div className="text-xs font-semibold uppercase text-muted-foreground">Chat Sessions</div><div className="mt-1 text-3xl font-black">{stats.chats}</div></div>
          <div className="rounded-xl border border-border bg-white p-5"><div className="text-xs font-semibold uppercase text-muted-foreground">Work Packets</div><div className="mt-1 text-3xl font-black">{stats.packets}</div></div>
          <div className="rounded-xl border border-border bg-white p-5"><div className="text-xs font-semibold uppercase text-muted-foreground">Paper Trades</div><div className="mt-1 text-3xl font-black">{stats.trades}</div></div>
          <div className="rounded-xl border border-border bg-white p-5"><div className="text-xs font-semibold uppercase text-muted-foreground">Open P/L</div><div className={`mt-1 text-3xl font-black ${stats.openPnl >= 0 ? "text-green-600" : "text-red-600"}`}>${stats.openPnl.toFixed(2)}</div></div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <WideLink to="/chat">New AI Chat <ArrowRight /></WideLink>
          <WideLink to="/mcp-generator">Generate MCP Tool <ArrowRight /></WideLink>
          <OutlineLink to="/meta-agent">Run Meta Agent <ArrowRight /></OutlineLink>
          <OutlineLink to="/admin">Open Admin <ArrowRight /></OutlineLink>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Recent Chats</h3>
            {loading ? <div className="py-6 text-center text-sm text-muted-foreground">Loading…</div> : chats.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No chats yet. <WideLink to="/chat">Start one <ArrowRight /></WideLink></div>
            ) : (
              <ul className="space-y-2">
                {chats.map((c) => (
                  <li key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-[#FAFAFA] px-3 py-2 text-sm">
                    <span className="min-w-0 truncate font-medium">{c.title}</span>
                    <span className="text-xs text-muted-foreground">{c.model}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Recent Paper Trades</h3>
            {loading ? <div className="py-6 text-center text-sm text-muted-foreground">Loading…</div> : trades.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No trades yet. See the <WideLink to="/admin">Vault ledger <ArrowRight /></WideLink></div>
            ) : (
              <ul className="space-y-2">
                {trades.map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded-lg border border-border bg-[#FAFAFA] px-3 py-2 text-sm">
                    <span className="font-semibold">{t.symbol}</span>
                    <span className={`font-semibold ${(t.pnl || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>{(t.pnl || 0) >= 0 ? "+" : ""}${(t.pnl || 0).toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">{t.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}