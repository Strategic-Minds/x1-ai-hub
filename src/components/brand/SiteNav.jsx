import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PrimaryButton, OutlineLink, ArrowRight } from "./BrandButton";

const NAV = [
  { label: "Platform", to: "/" },
  { label: "Factories", to: "/examples" },
  { label: "Pricing", to: "/pricing" },
  { label: "Command Center", to: "/hub" },
  { label: "AI Chat", to: "/chat" },
  { label: "Meta Agent", to: "/meta-agent" },
  { label: "Validation", to: "/validation" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/workspaces/69b98b0a75d69ef410a89851/brands/9eb8ac0da_brand_upload_logo.png" alt="AI HUB logo" className="h-9 w-9 object-contain" />
          <span className="text-lg font-black tracking-tight">AI HUB</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={`xa-btn-text ${loc.pathname === n.to ? "text-secondary font-bold" : ""}`}>{n.label}</Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="xa-btn-text">Sign in</Link>
          <Link to="/hub" className="xa-btn-primary">Connect Your AI <ArrowRight /></Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="xa-btn-text text-left">{n.label}</Link>
            ))}
            <Link to="/hub" onClick={() => setOpen(false)} className="xa-btn-primary justify-center">Connect Your AI <ArrowRight /></Link>
          </div>
        </div>
      )}
    </header>
  );
}