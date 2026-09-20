import React, { useState } from "react";
import { Send } from "lucide-react";

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="border-t border-border bg-white p-4">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Message AI HUB…"
          rows={1}
          className="max-h-40 min-h-[48px] flex-1 resize-none rounded-xl border border-border bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition focus:border-primary"
        />
        <button
          onClick={submit}
          disabled={disabled || !text.trim()}
          className="xa-btn-primary flex-none disabled:opacity-50"
        >
          <Send />
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground">
        AI HUB can make mistakes. Verify important information.
      </p>
    </div>
  );
}