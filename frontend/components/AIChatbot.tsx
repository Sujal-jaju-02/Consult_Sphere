"use client";

import * as React from "react";

import { aiChat } from "@/lib/chatApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChatMsg = { role: "user" | "assistant"; text: string };

export function AIChatbot() {
  const [messages, setMessages] = React.useState<ChatMsg[]>([]);
  const [draft, setDraft] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, loading]);

  return (
    <div className="flex min-h-[560px] flex-col rounded-3xl border border-sage-100 bg-white/60 shadow-soft">
      <div className="border-b border-sage-100 p-5">
        <div className="text-sm font-semibold text-ink">AI Consultant</div>
        <div className="mt-1 text-xs text-gray-600">Structured, practical advice.</div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-auto p-5">
        {messages.length === 0 ? (
          <div className="text-sm text-gray-600">Ask anything to get started.</div>
        ) : null}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={cn(
              "max-w-[85%] rounded-3xl px-4 py-3 text-sm shadow-soft whitespace-pre-wrap",
              m.role === "user" ? "ml-auto bg-sage-600 text-white" : "bg-white/70 text-gray-800"
            )}
          >
            {m.text}
          </div>
        ))}

        {loading ? (
          <div className="max-w-[60%] rounded-3xl bg-white/70 px-4 py-3 text-sm text-gray-800 shadow-soft">
            Thinking…
          </div>
        ) : null}
      </div>

      <div className="border-t border-sage-100 p-4">
        <div className="flex items-center gap-3">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your question…"
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!draft.trim() || loading) return;
                const text = draft.trim();
                setDraft("");
                setMessages((prev) => [...prev, { role: "user", text }]);
                setLoading(true);
                try {
                  const res = await aiChat(text);
                  setMessages((prev) => [...prev, { role: "assistant", text: res.reply }]);
                } catch (err) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: "assistant",
                      text: err instanceof Error ? err.message : "AI request failed",
                    },
                  ]);
                } finally {
                  setLoading(false);
                }
              }
            }}
          />
          <Button
            className="h-12 px-6"
            disabled={!draft.trim() || loading}
            onClick={async () => {
              if (!draft.trim() || loading) return;
              const text = draft.trim();
              setDraft("");
              setMessages((prev) => [...prev, { role: "user", text }]);
              setLoading(true);
              try {
                const res = await aiChat(text);
                setMessages((prev) => [...prev, { role: "assistant", text: res.reply }]);
              } catch (err) {
                setMessages((prev) => [
                  ...prev,
                  { role: "assistant", text: err instanceof Error ? err.message : "AI request failed" },
                ]);
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
