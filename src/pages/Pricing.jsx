import React, { useState } from "react";
import SiteNav from "@/components/brand/SiteNav";
import SiteFooter from "@/components/brand/SiteFooter";
import PricingCard from "@/components/brand/PricingCard";
import { PillBadge } from "@/components/brand/BrandButton";

const TIERS = [
  { key: "trial", name: "7-Day Trial", intro: "Explore the full assembly line", price: "$0", period: "/7 days", cta: "Start trial", features: ["1 website project","One representative feature per category","Full preview workspace","No protected actions","No card required"] },
  { key: "creator", name: "Creator", intro: "For solo builders", price: "$49", period: "/mo", cta: "Choose Creator", features: ["Unlimited draft projects","Governed generators","MCP tool access","Approvals required for protected actions","Email support"] },
  { key: "builder", name: "Builder", intro: "For growing teams", price: "$149", period: "/mo", cta: "Choose Builder", features: ["Everything in Creator","Multiple factories","Connector registry","Validation receipts","Rollback references"] },
  { key: "pro", name: "Pro", intro: "For active operators", price: "$499", period: "/mo", cta: "Choose Pro", features: ["Everything in Builder","Parallel validation DAG","Agent & swarm registry","Priority support","Usage analytics"] },
  { key: "agency", name: "Agency", intro: "Done-for-you growth", price: "$1499", period: "/mo", cta: "Choose Agency", features: ["Everything in Pro","Managed growth service","Approval workflows","Multi-tenant isolation","Dedicated success manager"], highlighted: true },
  { key: "enterprise", name: "Enterprise", intro: "Custom governance at scale", price: "Custom", period: "", cta: "Contact sales", features: ["Everything in Agency","SSO / OIDC","Custom policy matrix","Audit event export","SLA & onboarding"] },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <div className="mb-4 flex justify-center"><PillBadge>Preview Pricing</PillBadge></div>
          <h1 className="text-3xl font-black sm:text-5xl">Six tiers. Governed entitlements.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Locked capabilities stay visible with Upgrade to Try. Entitlement enforcement is server-side — the LLM cannot bypass it.</p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="xa-tabs">
            <label><input type="radio" name="bill" checked={!annual} onChange={() => setAnnual(false)} /><span>Monthly</span></label>
            <label><input type="radio" name="bill" checked={annual} onChange={() => setAnnual(true)} /><span>Annual <small className="ml-1 text-xs text-muted-foreground">Save 2 mo</small></span></label>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TIERS.map((t) => {
            const price = annual && t.price.startsWith("$") && t.price !== "$0" ? `$${Math.round(Number(t.price.slice(1)) * 10)}` : t.price;
            const period = annual && t.price.startsWith("$") && t.price !== "$0" ? "/yr" : t.period;
            return <PricingCard key={t.key} tier={{ ...t, price, period }} highlighted={t.highlighted} features={t.features} />;
          })}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Preview pricing for the draft packet. Production billing requires operator approval and a connected payment provider.
        </p>
      </div>
      <SiteFooter />
    </div>
  );
}