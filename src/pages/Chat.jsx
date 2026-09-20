import React, { useEffect, useRef, useState } from "react";
import { Menu, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SiteNav from "@/components/brand/SiteNav";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import ModelSelector from "@/components/chat/ModelSelector";
import { PillBadge } from "@/components/brand/BrandButton";

const SUGGESTIONS = [
  "Summarize the AI HUB platform in one paragraph",
  "Draft a cold outreach email for roofing contractors",
  "What factories should I use to build a SaaS?",
  "Generate ideas for lead-generation automations",
];

export default function Chat() {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState("automatic");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.ChatSession.list("-updated_date", 50);
        setSessions(list || []);
        if (list && list.length) {
          setActiveId(list[0].id);
          setModel(list[0].model || "automatic");
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    (async () => {
      try {
        const msgs = await base44.entities.ChatMessage.filter({ session_id: activeId }, "created_date", 200);
        setMessages(msgs || []);
      } catch {
        setMessages([]);
      }
    })();
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const newChat = async () => {
    try {
      const s = await base44.entities.ChatSession.create({ title: "New conversation", model });
      setSessions((prev) => [s, ...prev]);
      setActiveId(s.id);
      setMessages([]);
      setSidebarOpen(false);
    } catch {
      /* ignore */
    }
  };

  const selectSession = (id) => {
    setActiveId(id);
    const s = sessions.find((x) => x.id === id);
    if (s) setModel(s.model || "automatic");
    setSidebarOpen(false);
  };

  const deleteSession = async (id) => {
    try {
      await base44.entities.ChatMessage.deleteMany({ session_id: id });
      await base44.entities.ChatSession.delete(id);
      const next = sessions.filter((s) => s.id !== id);
      setSessions(next);
      if (activeId === id) {
        setActiveId(next.length ? next[0].id : null);
        setMessages([]);
      }
    } catch {
      /* ignore */
    }
  };

  const changeModel = async (m) => {
    setModel(m);
    if (activeId) {
      try {
        await base44.entities.ChatSession.update(activeId, { model: m });
      } catch {
        /* ignore */
      }
    }
  };

  const send = async (text) => {
    let sessionId = activeId;
    if (!sessionId) {
      try {
        const s = await base44.entities.ChatSession.create({ title: text.slice(0, 50), model });
        sessionId = s.id;
        setSessions((prev) => [s, ...prev]);
        setActiveId(s.id);
      } catch {
        return;
      }
    }
    const userMsg = { session_id: sessionId, role: "user", content: text, model };
    const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    try {
      await base44.entities.ChatMessage.create(userMsg);
      const res = await base44.functions.invoke("chatCompletion", { messages: history, model });
      const content = res?.data?.content || "Sorry, I couldn't generate a response.";
      const aiMsg = { session_id: sessionId, role: "assistant", content, model };
      setMessages((prev) => [...prev, aiMsg]);
      await base44.entities.ChatMessage.create(aiMsg);
      const update = { last_message: text.slice(0, 100) };
      if (messages.length === 0) update.title = text.slice(0, 50);
      await base44.entities.ChatSession.update(sessionId, update);
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, ...update } : s))
      );
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { session_id: sessionId, role: "assistant", content: "Error: " + (e.message || "failed"), model },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <SiteNav />
      <div className="relative flex flex-1 overflow-hidden">
        <div className={`${sidebarOpen ? "absolute inset-y-0 left-0 z-30 flex" : "hidden"} md:relative md:flex`}>
          <ChatSidebar
            sessions={sessions}
            activeId={activeId}
            onSelect={selectSession}
            onNew={newChat}
            onDelete={deleteSession}
          />
        </div>
        {sidebarOpen && (
          <div className="absolute inset-0 z-20 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open conversations"
              >
                <Menu className="h-5 w-5" />
              </button>
              <PillBadge>AI Hub Chat</PillBadge>
            </div>
            <ModelSelector value={model} onChange={changeModel} />
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#FAFAFA] px-4 py-6">
            <div className="mx-auto max-w-3xl space-y-6">
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-secondary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="mx-auto max-w-xl py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
                    <Sparkles className="h-7 w-7 text-[#CCBB00]" />
                  </div>
                  <h2 className="mt-5 text-2xl font-bold">Chat with your AI</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Pick a model above — ChatGPT, Claude, or Gemini — and start a conversation. Your chats are saved to your account.
                  </p>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-xl border border-border bg-white px-4 py-3 text-left text-sm font-medium text-foreground transition hover:border-primary"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <ChatMessageBubble key={m.id || i} message={m} />
                ))
              )}
              {sending && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary text-secondary text-xs font-bold">
                    AI
                  </div>
                  <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-muted-foreground">
                    <span className="inline-flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <ChatInput onSend={send} disabled={sending} />
        </main>
      </div>
    </div>
  );
}