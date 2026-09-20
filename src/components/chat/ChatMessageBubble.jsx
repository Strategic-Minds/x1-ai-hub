import React from "react";
import { MODEL_MAP } from "./models";

export default function ChatMessageBubble({ message }) {
  const isUser = message.role === "user";
  const model = MODEL_MAP[message.model];
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-xs font-bold ${
          isUser ? "bg-secondary text-primary" : "bg-primary text-secondary"
        }`}
      >
        {isUser ? "You" : "AI"}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? "bg-secondary text-primary-foreground" : "border border-border bg-white"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        {!isUser && model && (
          <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {model.provider} · {model.label}
          </div>
        )}
      </div>
    </div>
  );
}