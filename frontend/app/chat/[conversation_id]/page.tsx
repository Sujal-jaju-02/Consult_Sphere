"use client";

import * as React from "react";

import { bookAppointment, getConversations, getMessages, sendMessage } from "@/lib/chatApi";
import type { ConversationListItem, MessageItem } from "@/lib/chatTypes";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { AppointmentModal } from "@/components/AppointmentModal";

export default function ConversationPage({
  params,
}: {
  params: { conversation_id: string };
}) {
  const conversationId = params.conversation_id;

  const [userId, setUserId] = React.useState<string | null>(null);
  const [conversations, setConversations] = React.useState<ConversationListItem[]>([]);
  const [messages, setMessages] = React.useState<MessageItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const [bookingOpen, setBookingOpen] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  const activeConversation = React.useMemo(
    () => conversations.find((c) => c.id === conversationId),
    [conversations, conversationId]
  );

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
        const [convs, msgs] = await Promise.all([
          getConversations(userId),
          getMessages(conversationId),
        ]);
        if (cancelled) return;
        setConversations(convs);
        setMessages(msgs);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load conversation");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [conversationId, userId]);

  // Poll for new messages every 2 seconds
  React.useEffect(() => {
    let cancelled = false;
    const interval = setInterval(async () => {
      if (cancelled) return;
      try {
        const msgs = await getMessages(conversationId);
        if (!cancelled) setMessages(msgs);
      } catch {
        // silently fail on polling
      }
    }, 2000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [conversationId]);

  async function handleSend() {
    if (!draft.trim() || sending) return;
    const text = draft.trim();
    setDraft("");
    setSending(true);
    try {
      await sendMessage(conversationId, "user", text);
      const msgs = await getMessages(conversationId);
      setMessages(msgs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  const consultantId = activeConversation?.consultant_id || "Consultant";

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Chat</h1>
        <p className="max-w-2xl text-gray-700">Conversation with {consultantId}</p>
      </section>

      {toast ? (
        <div className="rounded-2xl border border-sage-100 bg-sage-50 px-4 py-3 text-sm text-sage-900">
          {toast}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-[320px_1fr]">
        <ChatSidebar conversations={conversations} activeConversationId={conversationId} />

        {loading ? (
          <div className="rounded-3xl border border-sage-100 bg-white/60 p-6 shadow-soft">
            <div className="text-sm text-gray-600">Loading…</div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-sage-100 bg-white/60 p-6 shadow-soft">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        ) : (
          <ChatWindow
            consultantId={consultantId}
            messages={messages}
            draft={draft}
            setDraft={setDraft}
            onSend={handleSend}
            sending={sending}
            onBook={() => setBookingOpen(true)}
          />
        )}
      </div>

      <AppointmentModal
        open={bookingOpen}
        consultantId={consultantId}
        onClose={() => setBookingOpen(false)}
        onConfirm={async ({ date, time, notes }) => {
          const uid = window.localStorage.getItem("user_id") || "guest";
          await bookAppointment({
            user_id: uid,
            consultant_id: consultantId,
            date,
            time,
            notes,
          });
          setToast(`Appointment successfully scheduled with ${consultantId}`);
          setTimeout(() => setToast(null), 4000);
        }}
      />
    </div>
  );
}
