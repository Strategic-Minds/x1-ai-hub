import React, { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

const QUICK_ACTIONS = [
  "AUDIT SYSTEM", "COMPLETE SYSTEM", "AUTO FIX", "AUTO HEAL", "HARDEN SYSTEM",
  "MIGRATE SYSTEM", "DISCOVER CAPABILITIES", "BUILD MCP", "BUILD AGENT",
  "BUILD SWARM", "BUILD GENERATOR", "BUILD WORKFLOW", "BUILD TEMPLATE",
  "PACKAGE SYSTEM", "CREATE DOCUMENTATION", "PRODUCTION READINESS",
];

export default function GoalInput({ onSubmit, loading }) {
  const [goal, setGoal] = useState("");
  const submit = (text) => {
    const g = (text ?? goal).trim();
    if (!g || loading) return;
    onSubmit(g);
  };
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="What do you want to create, repair, discover, automate, migrate, audit, optimize, or complete?"
          rows={4}
          className="w-full resize-none rounded-xl border border-border bg-[#FAFAFA] px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Sparkles className="h-4 w-4 text-[#CCBB00]" /> Meta Agent
          </span>
          <button onClick={() => submit()} disabled={loading || !goal.trim()} className="xa-btn-primary disabled:opacity-50">
            {loading ? "Analyzing…" : "Analyze goal"} <ArrowRight />
          </button>
        </div>
      </div>
      <div className="mt-6">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">Quick actions</p>
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_ACTIONS.map((q) => (
            <button key={q} onClick={() => submit(q)} disabled={loading} className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary disabled:opacity-50">
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}