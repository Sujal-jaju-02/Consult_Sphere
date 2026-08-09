"use client";

import * as React from "react";

import { getConversations } from "@/lib/chatApi";
import type { ConversationListItem } from "@/lib/chatTypes";
import { ChatSidebar } from "@/components/ChatSidebar";

export default function ChatIndexPage() {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [conversations, setConversations] = React.useState<ConversationListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const id = window.localStorage.getItem("user_id") || "guest";
    setUserId(id);
  }, []);

  React.useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const convs = await getConversations(userId);
        if (!cancelled) setConversations(convs);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load conversations");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Chat</h1>
        <p className="max-w-2xl text-gray-700">Your consultant conversations.</p>
      </section>

      <div className="grid gap-5 md:grid-cols-[320px_1fr]">
        <ChatSidebar conversations={conversations} />
        <div className="rounded-3xl border border-sage-100 bg-white/60 p-6 shadow-soft">
          {loading ? (
            <div className="text-sm text-gray-600">Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : (
            <div className="text-sm text-gray-700">Select a conversation from the left.</div>
          )}
        </div>
      </div>
    </div>
  );
}
