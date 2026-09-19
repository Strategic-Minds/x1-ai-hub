import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SiteNav from "@/components/brand/SiteNav";
import SiteFooter from "@/components/brand/SiteFooter";
import FactoryCard from "@/components/brand/FactoryCard";
import { WideLink, OutlineLink, PillBadge, ArrowRight } from "@/components/brand/BrandButton";

const FALLBACK_FACTORIES = [
  { name: "Website Factory", category: "Web", description: "Marketing sites, landing pages, and content portals with governed generators.", icon: "layers", locked: false },
  { name: "SaaS Factory", category: "Applications", description: "Multi-tenant SaaS with auth, billing, and dashboards — routed through the full lifecycle.", icon: "chip", locked: false },
  { name: "CRM Factory", category: "Business", description: "Lead pipelines, contact management, and call attribution with approval workflows.", icon: "users", locked: false },
  { name: "Agent Factory", category: "AI", description: "Governed agents and swarms with policy-enforced tool access and receipts.", icon: "nodes", locked: true },
  { name: "SEO / AEO Factory", category: "Growth", description: "Search and answer-engine optimization generators with benchmarking.", icon: "lightbulb", locked: true },
  { name: "Connector Factory", category: "Integration", description: "OAuth connectors, MCP servers, and webhook routers with health tracking.", icon: "shield", locked: true },
];

export default function Examples() {
  const [factories, setFactories] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.FactoryDefinition.list("sort_order", 50);
        if (list && list.length) setFactories(list);
        else setFactories(FALLBACK_FACTORIES);
      } catch {
        setFactories(FALLBACK_FACTORIES);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <div className="mb-4 flex justify-center"><PillBadge>Factory Registry</PillBadge></div>
          <h1 className="text-3xl font-black sm:text-5xl">Factories & Generators</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Each factory routes intent through the deterministic assembly line. Locked factories stay visible with Upgrade to Try.</p>
        </div>

        {factories === null ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-secondary" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {factories.map((f, i) => <FactoryCard key={f.id || i} factory={f} />)}
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-border bg-[#FAFAFA] p-8 text-center">
          <h2 className="text-xl font-bold">Ready to route your first intent?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Connect your AI and watch it operate through the governed assembly line.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            <WideLink to="/hub">Connect Your AI <ArrowRight /></WideLink>
            <OutlineLink to="/pricing">View plans <ArrowRight /></OutlineLink>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}