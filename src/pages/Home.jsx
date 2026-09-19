import React, { useEffect, useState } from "react";
import SiteNav from "@/components/brand/SiteNav";
import SiteFooter from "@/components/brand/SiteFooter";
import AssemblyLine from "@/components/brand/AssemblyLine";
import FactoryCard from "@/components/brand/FactoryCard";
import { WideLink, OutlineLink, PillBadge, ArrowRight } from "@/components/brand/BrandButton";
import { LIFECYCLE_STAGES } from "@/lib/lifecycle";

const DEMO_INTENT = "Build me a SaaS for roofing contractors.";
const DEMO_FACTORY = "SaaS Factory";

const CAPABILITIES = [
  { icon: "layers", title: "Unified operations", body: "One governed connection to factories, generators, workflows, connectors, and infrastructure." },
  { icon: "nodes", title: "Deterministic routing", body: "Intent is classified and routed into the exact factory and lifecycle — no improvisation." },
  { icon: "shield", title: "Independent validation", body: "Static, functional, security, visual, and operational gates run before anything advances." },
  { icon: "lightbulb", title: "Governed approvals", body: "Protected actions require an explicit human approval reference. The LLM cannot self-authorize." },
  { icon: "chip", title: "Receipts & rollback", body: "Every meaningful mutation emits an immutable receipt, with a rollback reference captured first." },
  { icon: "users", title: "Multi-tenant isolation", body: "Tenant-scoped entitlements and data keep every workspace sealed from every other." },
];

const EXAMPLE_CATEGORIES = [
  "Websites", "SaaS", "B2B", "B2C", "Ecommerce", "Marketplaces", "Portals", "Dashboards",
  "CRM", "Agents", "Swarms", "Automations", "Workflows", "APIs", "MCP servers", "Connectors",
  "Scrapers", "Lead systems", "SEO / AEO", "Business operating systems", "Generators",
];

const FAQS = [
  { q: "What does 100% health mean?", a: "100% health means 100% of the mandatory checks required for that release passed. AI HUB does not promise software can never fail." },
  { q: "Which AI models can connect?", a: "ChatGPT, Claude, Gemini, and future compatible LLMs connect through the same MCP/API capability and policy layer." },
  { q: "Can the AI deploy to production on its own?", a: "No. Production, protected-branch merges, secret changes, payments, and customer messaging all require explicit human approval." },
  { q: "Can I explore before committing?", a: "Yes — the preview workspace lets you run the full assembly line end to end. Choose a plan only when you are ready to publish." },
];

function ValueFeature({ icon, title, body }) {
  const paths = {
    layers: <><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></>,
    nodes: <><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></>,
    shield: <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></>,
    lightbulb: <><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/></>,
    chip: <><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  };
  return (
    <article className="xa-card-value">
      <div className="vf-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CCBB00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[icon] || paths.layers}</svg>
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

export default function Home() {
  const [stage, setStage] = useState("PLAN");
  useEffect(() => {
    const id = setInterval(() => {
      setStage((prev) => {
        const i = LIFECYCLE_STAGES.findIndex((s) => s.id === prev);
        const next = LIFECYCLE_STAGES[(i + 1) % LIFECYCLE_STAGES.length];
        return next.id;
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center"><PillBadge>Deterministic Capability Operating System</PillBadge></div>
            <h1 className="text-4xl font-black leading-tight sm:text-6xl">Connect your AI.<br />Give it an operating system.</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Turn ChatGPT, Claude, Gemini, or another compatible AI into a governed operator that can use factories, generators, workflows, infrastructure, validation, and approved business capabilities.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <WideLink to="/hub">Connect Your AI <ArrowRight /></WideLink>
              <OutlineLink to="/examples">Explore Factories <ArrowRight /></OutlineLink>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">One connection. Every capability. Production-locked preview.</p>
          </div>
        </div>
      </section>

      {/* Live assembly-line demo */}
      <section className="border-b border-border bg-[#FAFAFA]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Watch intent route through the assembly line</h2>
            <p className="mt-2 text-muted-foreground">A live, deterministic flow from request to preview — no improvisation, no skipped gates.</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
                </span>
                <div>
                  <div className="text-sm font-semibold">“{DEMO_INTENT}”</div>
                  <div className="text-xs text-muted-foreground">Routed to <strong>{DEMO_FACTORY}</strong> → Discovery → Strategy → Visual Direction → Approval → Build → Validation → Preview</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Live
              </span>
            </div>
            <AssemblyLine currentStage={stage} />
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">One connection. Every capability.</h2>
            <p className="mt-2 text-muted-foreground">A governed operating system between humans, LLMs, and implementation infrastructure.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((c) => <ValueFeature key={c.title} {...c} />)}
          </div>
        </div>
      </section>

      {/* Examples gallery */}
      <section className="border-b border-border bg-[#FAFAFA]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">What you can build</h2>
            <p className="mt-2 text-muted-foreground">Categories of factories and generators — not fabricated customer deployments.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {EXAMPLE_CATEGORIES.map((cat) => (
              <span key={cat} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-secondary">{cat}</span>
            ))}
          </div>
          <div className="mt-8 text-center"><OutlineLink to="/examples">See the factories <ArrowRight /></OutlineLink></div>
        </div>
      </section>

      {/* Trust / governance */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <PillBadge>Trust & Governance</PillBadge>
              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Deterministic by design</h2>
              <p className="mt-3 text-muted-foreground">Source identity, approvals, tenant isolation, validation, receipts, and rollback are built into the operating system — not bolted on.</p>
              <ul className="mt-6 space-y-3">
                {["Source identity tracked on every packet","Tenant isolation prevents cross-tenant reads","Independent validation before release","Receipts are append-only and immutable","Rollback reference captured before risky changes","100% health = 100% of mandatory checks passed"].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CCBB00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-none"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-[#FAFAFA] p-6">
              <div className="mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CCBB00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
                <h3 className="font-bold">Security / Approval Matrix</h3>
              </div>
              <div className="space-y-2 text-sm">
                {[["Read metadata","Allow"],["Draft plan / spec","Allow"],["Write approved branch","When packet valid"],["Merge protected branch","Human approval"],["Production deploy","Human approval"],["Secret / env change","Human approval"],["Customer messaging","Human approval"]].map(([a,b]) => (
                  <div key={a} className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2">
                    <span className="font-medium">{a}</span>
                    <span className={`text-xs font-bold ${b === "Human approval" ? "text-secondary" : "text-muted-foreground"}`}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-b border-border bg-[#FAFAFA]">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">Six tiers. Governed entitlements.</h2>
          <p className="mt-2 text-muted-foreground">Locked capabilities stay visible with Upgrade to Try. Enforcement is server-side.</p>
          <div className="mt-6"><WideLink to="/pricing">View pricing <ArrowRight /></WideLink></div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">Frequently asked</h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={f.q} className="xa-faq">
                <input id={`faq-${i}`} type="checkbox" defaultChecked={i === 0} />
                <label className="faq-shell" htmlFor={`faq-${i}`}>
                  <span className="faq-head"><span className="faq-title">{f.q}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>
                  <span className="faq-answer">{f.a}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-secondary py-16 text-center text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-3xl font-black text-primary">AI talks. AI HUB finishes.</h2>
          <p className="mt-3 text-white/80">Connect your model and give it a deterministic operating system.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <WideLink to="/hub">Connect Your AI <ArrowRight /></WideLink>
            <OutlineLink to="/pricing" className="!text-primary !border-primary/40">View plans <ArrowRight /></OutlineLink>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}