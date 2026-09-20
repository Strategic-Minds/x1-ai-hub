import React, { useEffect, useState } from "react";
import SiteNav from "@/components/brand/SiteNav";
import SiteFooter from "@/components/brand/SiteFooter";
import { PillBadge, WideLink, OutlineLink, ArrowRight } from "@/components/brand/BrandButton";

const CAPABILITIES = [
  { icon: "globe", title: "Cloud browser sessions", body: "Headless and headed cloud browsers you drive from code, agents, or MCP tools." },
  { icon: "scrape", title: "Stealth scraper system", body: "Anti-bot evasion, retries, and structured extraction — no fragile selectors." },
  { icon: "receipt", title: "Session receipts", body: "Every session emits an immutable receipt: inputs, outputs, duration, artifacts." },
  { icon: "replay", title: "Replay + debugging", body: "Replay any session step-by-step and inspect the exact DOM at each action." },
  { icon: "mcp", title: "MCP tool access", body: "Expose browser + scraper as typed MCP tools your AI can call deterministically." },
  { icon: "queue", title: "Durable job queue", body: "Idempotent, leased, retried jobs with dead-letter handling — built for thousands." },
];

const ICONS = {
  globe: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  scrape: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></>,
  receipt: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M8 7h8M8 11h8M8 15h5"/></>,
  replay: <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></>,
  mcp: <><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/></>,
  queue: <><path d="M3 6h18M3 12h18M3 18h18"/></>,
};

function Capability({ icon, title, body }) {
  return (
    <article className="xa-card-feature">
      <div className="xf-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ICONS[icon] || ICONS.globe}</svg>
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

export default function XtremeBrowser() {
  const [waitlist, setWaitlist] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setWaitlist((n) => n + Math.floor(Math.random() * 3)), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center"><PillBadge>Xtreme Browser · Beta</PillBadge></div>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">Cloud browser automation.<br />Built for agents, not for breaking.</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              A deterministic cloud browser + scraper system with session receipts, replay, durable job queues, and MCP tool access — so your AI can browse, scrape, and extract without improvising.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <WideLink to="/hub">Get Xtreme Browser <ArrowRight /></WideLink>
              <OutlineLink to="/pricing">See pricing <ArrowRight /></OutlineLink>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{waitlist.toLocaleString()} builders on the beta waitlist</p>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">What coders and AI builders love</h2>
            <p className="mt-2 text-muted-foreground">Deterministic, observable, and built to hold up under thousands of concurrent sessions.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((c) => <Capability key={c.title} {...c} />)}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border bg-[#FAFAFA]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <PillBadge>Deterministic by design</PillBadge>
              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">From request to receipt — no skipped gates</h2>
              <p className="mt-3 text-muted-foreground">Every browser session is a durable job: idempotent, leased, retried, and dead-lettered on failure. The output is an immutable receipt your validator can audit.</p>
              <ul className="mt-6 space-y-3">
                {["Idempotency keys prevent duplicate work","Leases + timeouts prevent runaway sessions","Dead-letter queue for unrecoverable jobs","Replay any session step-by-step","MCP tools expose typed browser actions"].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CCBB00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-none"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6 font-mono text-xs leading-relaxed text-muted-foreground shadow-sm">
              <div className="mb-3 text-[11px] uppercase tracking-wide text-secondary">session.receipt.json</div>
              <pre className="whitespace-pre-wrap">{`{
  "session_id": "xb_8f3a...",
  "status": "SUCCEEDED",
  "url": "https://example.com",
  "actions": 14,
  "duration_ms": 4218,
  "extracted": { "items": 42 },
  "idempotency_key": "ix_2c1...",
  "receipt_id": "rc_9bd...",
  "validator": "independent",
  "rollback_ref": "rb_7e2..."
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16 text-center text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-3xl font-black text-primary">Browse the web like infrastructure.</h2>
          <p className="mt-3 text-white/80">Add Xtreme Browser to your stack and give your agents a deterministic cloud browser.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <WideLink to="/hub">Get Xtreme Browser <ArrowRight /></WideLink>
            <OutlineLink to="/pricing" className="!text-primary !border-primary/40">View pricing <ArrowRight /></OutlineLink>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}