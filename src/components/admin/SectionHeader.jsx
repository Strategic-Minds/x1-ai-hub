import React from "react";
import { PillBadge } from "@/components/brand/BrandButton";

export default function SectionHeader({ num, badge, title, desc }) {
  return (
    <div className="mb-8">
      {badge && <div className="mb-3"><PillBadge>{badge}</PillBadge></div>}
      <div className="flex items-center gap-3">
        {num && <span className="font-mono text-2xl font-black text-primary">{num}</span>}
        <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
      </div>
      {desc && <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{desc}</p>}
    </div>
  );
}