import React from "react";
import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[#FAFAFA]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src="https://media.base44.com/images/public/workspaces/69b98b0a75d69ef410a89851/brands/9eb8ac0da_brand_upload_logo.png" alt="AI App Factory" className="h-8 w-8 object-contain" />
              <span className="text-base font-black">AI App Factory</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Connect your AI. Give it an operating system.</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/" className="xa-btn-text">Overview</Link></li>
              <li><Link to="/examples" className="xa-btn-text">Factories</Link></li>
              <li><Link to="/hub" className="xa-btn-text">Command Center</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Governance</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/pricing" className="xa-btn-text">Pricing & Entitlements</Link></li>
              <li><span className="xa-btn-text">Approvals & Rollback</span></li>
              <li><span className="xa-btn-text">Validation Receipts</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Status</h4>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs font-semibold">Production Locked · Preview</span>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} AI App Factory · Xtreme Systems. Deterministic capability operating system. Packet v1.0.0-draft.
        </div>
      </div>
    </footer>
  );
}