import React from "react";
import { MODELS } from "./models";

export default function ModelSelector({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-primary"
    >
      {MODELS.map((m) => (
        <option key={m.id} value={m.id}>
          {m.provider} · {m.label}
        </option>
      ))}
    </select>
  );
}