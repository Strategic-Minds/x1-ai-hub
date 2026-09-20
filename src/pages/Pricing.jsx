import React from "react";
import SiteNav from "@/components/brand/SiteNav";
import SiteFooter from "@/components/brand/SiteFooter";
import PricingCard from "@/components/brand/PricingCard";
import { PillBadge, WideLink, OutlineLink, ArrowRight } from "@/components/brand/BrandButton";

// À la carte product catalog — each product is a standalone subscription.
const PRODUCTS = [
  {
    key: "x1-predict",
    name: "X1 Predict",
    intro: "Crypto creation + asset prediction simulator",
    price: "$29",
    period: "/mo",
    cta: "Get X1 Predict",
    badge: "NEW",
    features: [
      "Token + asset prediction simulator",
      "Scenario modeling engine",
      "Backtesting against historical data",
      "Deterministic prediction receipts",
      "Exportable model artifacts",
    ],
  },
  {
    key: "xtreme-browser",
    name: "Xtreme Browser",
    intro: "Cloud browser automation + scraper system",
    price: "$99",
    period: "/mo",
    cta: "Get Xtreme Browser",
    features: [
      "Cloud browser sessions (1,000/mo included)",
      "Stealth scraper system",
      "Structured data extraction",
      "Session replay + receipts",
      "MCP tool access",
    ],
  },
  {
    key: "xtreme-comms",
    name: "Xtreme Comms",
    intro: "SMS, MMS, Voice & WhatsApp — beta",
    price: "$139",
    period: "/mo",
    cta: "Join the beta",
    badge: "BETA",
    features: [
      "SMS + MMS sending",
      "Voice (TTS + transcription)",
      "WhatsApp messaging (beta)",
      "Number provisioning",
      "Delivery receipts + audit log",
    ],
  },
  {
    key: "vision-cortex",
    name: "Vision Cortex",
    intro: "Simulation engine for visual + spatial models",
    price: "$199",
    period: "/mo",
    cta: "Get Vision Cortex",
    features: [
      "Visual + spatial simulation engine",
      "Scene + environment modeling",
      "Deterministic render receipts",
      "Exportable simulation artifacts",
      "MCP tool access",
    ],
  },
];

const BUNDLE = {
  key: "all-access",
  name: "All-Access Bundle",
  intro: "All four products, one seat",
  price: "$299",
  period: "/mo",
  cta: "Get the bundle",
  highlighted: true,
  features: [
    "Everything in X1 Predict",
    "Everything in Xtreme Browser",
    "Everything in Xtreme Comms (beta)",
    "Everything in Vision Cortex",
    "Priority support + validation receipts",
  ],
};

// Browserbase-style metered browser usage (add-on to Xtreme Browser).
const USAGE_TIERS = [
  { tier: "Starter", sessions: "1,000 / mo", overage: "$0.05 / session", note: "Included with Xtreme Browser" },
  { tier: "Scale", sessions: "25,000 / mo", overage: "$0.035 / session", note: "Volume pricing" },
  { tier: "Enterprise", sessions: "Custom", overage: "Custom volume pricing", note: "Dedicated capacity + SLA" },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 flex justify-center"><PillBadge>À la carte · Build your stack</PillBadge></div>
          <h1 className="text-3xl font-black sm:text-5xl">Pick your products. Pay for what you use.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Four standalone products — X1 Predict, Xtreme Browser, Xtreme Comms, and Vision Cortex — or take the All-Access Bundle.
            Browser usage is metered separately, Browserbase-style.
          </p>
        </div>

        {/* Product grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((p) => (
            <div key={p.key} className="relative">
              {p.badge && (
                <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                  {p.badge}
                </span>
              )}
              <PricingCard tier={p} highlighted={false} features={p.features} />
            </div>
          ))}
        </div>

        {/* All-access bundle */}
        <div className="mt-10 flex justify-center">
          <div className="w-full max-w-sm">
            <PricingCard tier={BUNDLE} highlighted features={BUNDLE.features} />
          </div>
        </div>

        {/* Metered browser usage */}
        <div className="mt-16">
          <div className="mb-6 text-center">
            <div className="mb-3 flex justify-center"><PillBadge>Browser Usage · Metered</PillBadge></div>
            <h2 className="text-2xl font-bold sm:text-3xl">Pay per session — Browserbase-style</h2>
            <p className="mt-2 text-muted-foreground">Every Xtreme Browser plan includes sessions. Go over and you pay a transparent per-session rate.</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-[#FAFAFA]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-white text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-bold">Usage tier</th>
                  <th className="px-5 py-4 font-bold">Sessions</th>
                  <th className="px-5 py-4 font-bold">Overage rate</th>
                  <th className="px-5 py-4 font-bold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {USAGE_TIERS.map((u) => (
                  <tr key={u.tier} className="border-b border-border last:border-0">
                    <td className="px-5 py-4 font-semibold">{u.tier}</td>
                    <td className="px-5 py-4">{u.sessions}</td>
                    <td className="px-5 py-4 font-semibold text-secondary">{u.overage}</td>
                    <td className="px-5 py-4 text-muted-foreground">{u.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <WideLink to="/hub">Connect Your AI <ArrowRight /></WideLink>
            <OutlineLink to="/xtreme-browser">Explore Xtreme Browser <ArrowRight /></OutlineLink>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Preview pricing for the draft packet. Production billing requires operator approval and a connected payment provider.
            Beta products (Xtreme Comms) are feature-incomplete and may change.
          </p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}