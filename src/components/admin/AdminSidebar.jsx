import React from "react";
import { Link, useLocation } from "react-router-dom";

const NAV = [
  { num: "01", label: "Command Center", to: "/admin" },
  { num: "02", label: "Vision & Strategy", to: "/admin/strategy" },
  { num: "03", label: "Analytics & Trends", to: "/admin/analytics" },
  { num: "04", label: "Arsenal & Capabilities", to: "/admin/arsenal" },
  { num: "05", label: "Governance", to: "/admin/governance" },
  { num: "06", label: "Registries", to: "/admin/registries" },
  { num: "07", label: "Benchmarks & Logs", to: "/admin/benchmarks" },
  { num: "08", label: "Vault", to: "/admin/vault" },
];

export default function AdminSidebar({ open, onClose }) {
  const loc = useLocation();
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col transform border-r border-white/10 bg-secondary text-white transition-transform md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
          <img src="https://media.base44.com/images/public/workspaces/69b98b0a75d69ef410a89851/brands/9eb8ac0da_brand_upload_logo.png" alt="AI HUB" className="h-7 w-7 object-contain" />
          <span className="text-sm font-black tracking-tight">AI HUB · ADMIN</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((n) => {
            const active = loc.pathname === n.to;
            return (
              <Link key={n.to} to={n.to} onClick={onClose} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? "bg-primary font-bold text-black" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                <span className={`font-mono text-xs ${active ? "text-black/60" : "text-primary/70"}`}>{n.num}</span>
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <Link to="/" className="text-xs text-white/60 transition hover:text-primary">← Back to site</Link>
        </div>
      </aside>
    </>
  );
}