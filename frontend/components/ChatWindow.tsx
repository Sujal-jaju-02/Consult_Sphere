"use client";

import * as React from "react";

import type { MessageItem } from "@/lib/chatTypes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatWindow({
  consultantId,
  messages,
  draft,
  setDraft,
  onSend,
  onBook,
  sending,
}: {
  consultantId: string;
  messages: MessageItem[];
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => Promise<void>;
  onBook: () => void;
  sending: boolean;
}) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  return (
    <section className="flex min-h-[520px] flex-col rounded-3xl border border-sage-100 bg-white/60 shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-sage-100 p-5">
        <div>
          <div className="text-sm font-semibold text-ink">{consultantId}</div>
          <div className="mt-1 text-xs text-gray-600">Direct consultant chat</div>
        </div>
        <Button variant="outline" onClick={onBook}>
          Book Appointment
        </Button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-auto p-5">
        {messages.length === 0 ? (
          <div className="text-sm text-gray-600">Say hello to start.</div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[80%] rounded-3xl px-4 py-3 text-sm shadow-soft",
                m.sender_type === "user"
                  ? "ml-auto bg-sage-600 text-white"
                  : "bg-white/70 text-gray-800"
              )}
            >
              {m.message_text}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-sage-100 p-4">
        <div className="flex items-center gap-3">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                await onSend();
              }
            }}
          />
          <Button className="h-12 px-6" onClick={onSend} disabled={sending || !draft.trim()}>
            {sending ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>
    </section>
  );
}
