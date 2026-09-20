import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SiteNav from "@/components/brand/SiteNav";
import SiteFooter from "@/components/brand/SiteFooter";
import GoalInput from "@/components/meta/GoalInput";
import ResultView from "@/components/meta/ResultView";
import { PillBadge } from "@/components/brand/BrandButton";

export default function MetaAgent() {
  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.MetaSession.list("-updated_date", 30);
        setSessions(list || []);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const loadSession = async (id) => {
    setError("");
    try {
      const session = await base44.entities.MetaSession.get(id);
      const packets = await base44.entities.WorkPacket.filter({ session_id: id }, "created_date", 50);
      const receipts = await base44.entities.ValidationReceipt.filter({ session_id: id }, "created_date", 100);
      const approvals = await base44.entities.ApprovalRequest.filter({ session_id: id }, "created_date", 50);
      const jobs = await base44.entities.DiscoveryJob.filter({ session_id: id }, "created_date", 50);
      const links = packets.length
        ? await base44.entities.WorkPacketAsset.filter({ work_packet_id: { $in: packets.map((p) => p.id) } }, "created_date", 100)
        : [];
      setActive(session);
      setData({ packets: packets || [], receipts: receipts || [], approvals: approvals || [], jobs: jobs || [], links: links || [] });
    } catch (e) {
      setError(e.message);
    }
  };

  const submit = async (goal) => {
    setAnalyzing(true);
    setError("");
    try {
      const res = await base44.functions.invoke("metaAgentAnalyze", { goal });
      const sid = res?.data?.session_id;
      const list = await base44.entities.MetaSession.list("-updated_date", 30);
      setSessions(list || []);
      if (sid) await loadSession(sid);
    } catch (e) {
      setError(e.message);
    }
    setAnalyzing(false);
  };

  const newGoal = () => { setActive(null); setData(null); };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <PillBadge>XTREME Meta Agent</PillBadge>
          <h1 className="text-2xl font-black">Deterministic Intent → Work Packet Router</h1>
        </div>
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="order-2 lg:order-1">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Sessions</h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions yet. Submit a goal to begin.</p>
            ) : (
              <ul className="space-y-1">
                {sessions.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => loadSession(s.id)}
                      className={`w-full truncate rounded-lg border px-3 py-2 text-left text-sm transition ${active?.id === s.id ? "border-primary bg-primary/5 font-semibold" : "border-border bg-white hover:border-primary"}`}
                    >
                      {s.goal?.slice(0, 40) || "Untitled"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
          <div className="order-1 lg:order-2">
            {analyzing ? (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-white">
                <div className="text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-border border-t-secondary" />
                  <p className="mt-4 text-sm font-semibold text-muted-foreground">Analyzing goal, searching Arsenal, generating work packets…</p>
                </div>
              </div>
            ) : !active ? (
              <GoalInput onSubmit={submit} loading={analyzing} />
            ) : (
              <ResultView session={active} data={data} onNew={newGoal} />
            )}
            {error && <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}