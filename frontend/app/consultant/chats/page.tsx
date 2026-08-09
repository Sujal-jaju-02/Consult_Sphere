"use client";

import * as React from "react";

import { ConsultantRoleGate } from "@/components/ConsultantRoleGate";
import { getConversationsForConsultant, sendMessage, getMessages } from "@/lib/chatApi";
import type { ConversationListItem, MessageItem } from "@/lib/chatTypes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ConsultantChatsPage() {
  const [consultantId, setConsultantId] = React.useState<string | null>(null);
  const [conversations, setConversations] = React.useState<ConversationListItem[]>([]);
  const [activeConvId, setActiveConvId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<MessageItem[]>([]);
  const [draft, setDraft] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);

  // Get consultant ID from localStorage on mount
  React.useEffect(() => {
    const id = window.localStorage.getItem("consultant_id");
    setConsultantId(id);
  }, []);

  // Fetch conversations
  React.useEffect(() => {
    if (!consultantId) return;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const convs = await getConversationsForConsultant(consultantId);
        if (!cancelled) {
          setConversations(convs);
          if (convs.length > 0 && !activeConvId) {
            setActiveConvId(convs[0].id);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load conversations");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [consultantId]);

  // Fetch messages for active conversation
  React.useEffect(() => {
    if (!activeConvId) return;

    let cancelled = false;
    (async () => {
      try {
        const msgs = await getMessages(activeConvId);
        if (!cancelled) setMessages(msgs);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load messages");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeConvId]);

  // Poll for new messages every 2 seconds
  React.useEffect(() => {
    if (!activeConvId) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      if (cancelled) return;
      try {
        const msgs = await getMessages(activeConvId);
        if (!cancelled) setMessages(msgs);
      } catch {
        // Silently fail on polling
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeConvId]);

  async function handleSend() {
    if (!draft.trim() || sending || !activeConvId) return;

    const text = draft.trim();
    setDraft("");
    setSending(true);

    try {
      await sendMessage(activeConvId, "consultant", text);
      const msgs = await getMessages(activeConvId);
      setMessages(msgs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <ConsultantRoleGate>
      <div className="space-y-6">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Client Chats</h1>
          <p className="max-w-2xl text-gray-700">Respond to users and guide them toward clear outcomes.</p>
        </section>

        {error && (
          <div className="rounded-2xl border border-coral-200 bg-coral-50 p-3 text-sm text-coral-900">
            {error}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-[320px_1fr]">
          <aside className="rounded-3xl border border-sage-100 bg-white/60 shadow-soft">
            <div className="border-b border-sage-100 p-5">
              <div className="text-sm font-semibold">Conversations</div>
              <div className="mt-1 text-xs text-gray-600">{conversations.length} active</div>
            </div>
            <div className="p-3">
              {loading ? (
                <div className="p-4 text-xs text-gray-600">Loading conversations…</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-xs text-gray-600">No conversations yet.</div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    className={cn(
                      "w-full rounded-3xl p-4 text-left transition",
                      activeConvId === c.id ? "bg-sage-50 ring-1 ring-sage-100" : "hover:bg-white/70"
                    )}
                    onClick={() => setActiveConvId(c.id)}
                  >
                    <div className="text-sm font-semibold text-ink">{c.user_id}</div>
                    <div className="mt-1 line-clamp-1 text-xs text-gray-600">
                      {c.last_message || "No messages yet"}
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="flex min-h-[520px] flex-col rounded-3xl border border-sage-100 bg-white/60 shadow-soft">
            {!activeConv ? (
              <div className="flex items-center justify-center p-6 text-sm text-gray-600">
                Select a conversation from the left
              </div>
            ) : (
              <>
                <div className="border-b border-sage-100 p-5">
                  <div className="text-sm font-semibold text-ink">{activeConv.user_id}</div>
                  <div className="mt-1 text-xs text-gray-600">
                    Last message: {activeConv.last_timestamp ? new Date(activeConv.last_timestamp).toLocaleDateString() : "Never"}
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-auto p-5">
                  {messages.length === 0 ? (
                    <div className="text-sm text-gray-600">No messages yet. Start the conversation!</div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={cn(
                          "max-w-[80%] rounded-3xl px-4 py-3 text-sm shadow-soft",
                          m.sender_type === "consultant"
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
                      placeholder="Reply to client…"
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          await handleSend();
                        }
                      }}
                      disabled={sending}
                    />
                    <Button onClick={handleSend} disabled={sending || !draft.trim()}>
                      {sending ? "Sending…" : "Send"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </ConsultantRoleGate>
  );
}
