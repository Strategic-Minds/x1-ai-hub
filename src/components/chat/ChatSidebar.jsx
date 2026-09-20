import React from "react";
import { Plus, MessageSquare, Trash2 } from "lucide-react";

export default function ChatSidebar({ sessions, activeId, onSelect, onNew, onDelete }) {
  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-[#FAFAFA]">
      <div className="p-4">
        <button onClick={onNew} className="xa-btn-primary w-full justify-center">
          <Plus /> New chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {sessions.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            No conversations yet. Start a new chat.
          </p>
        ) : (
          <ul className="space-y-1">
            {sessions.map((s) => (
              <li key={s.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(s.id)}
                  onKeyDown={(e) => e.key === "Enter" && onSelect(s.id)}
                  className={`group flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    activeId === s.id ? "bg-secondary text-primary" : "text-foreground hover:bg-white"
                  }`}
                >
                  <MessageSquare className="h-4 w-4 flex-none opacity-60" />
                  <span className="flex-1 truncate font-medium">{s.title || "New conversation"}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(s.id);
                    }}
                    className="flex-none opacity-0 transition group-hover:opacity-100"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}