"use client";

import * as React from "react";

import { ConsultantRoleGate } from "@/components/ConsultantRoleGate";
import { getConversationsForConsultant } from "@/lib/chatApi";
import type { ConversationListItem } from "@/lib/chatTypes";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ConsultantClientsPage() {
  const [consultantId, setConsultantId] = React.useState<string | null>(null);
  const [conversations, setConversations] = React.useState<ConversationListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Get consultant ID from localStorage
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
        if (!cancelled) setConversations(convs);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load clients");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [consultantId]);

  // Extract unique users from conversations
  const uniqueClients = React.useMemo(() => {
    const seen = new Set<string>();
    return conversations
      .filter((c) => {
        if (seen.has(c.user_id)) return false;
        seen.add(c.user_id);
        return true;
      })
      .map((c) => ({
        userId: c.user_id,
        lastMessage: c.last_message || "No messages yet",
        lastMessageTime: c.last_timestamp || c.created_at,
        conversationId: c.id,
      }));
  }, [conversations]);

  return (
    <ConsultantRoleGate>
      <div className="space-y-6">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Clients</h1>
          <p className="max-w-2xl text-gray-700">Users who contacted you and their recent messages.</p>
        </section>

        {error && (
          <div className="rounded-2xl border border-coral-200 bg-coral-50 p-3 text-sm text-coral-900">
            {error}
          </div>
        )}

        <div className="grid gap-5">
          {loading ? (
            <div className="text-sm text-gray-600">Loading clients…</div>
          ) : uniqueClients.length === 0 ? (
            <div className="rounded-2xl border border-sage-100 bg-white/60 p-6 text-sm text-gray-600">
              No clients yet. They'll appear here once they start conversations.
            </div>
          ) : (
            uniqueClients.map((client) => (
              <Card key={client.userId}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-ink">{client.userId}</div>
                      <div className="mt-1 text-sm text-gray-600 line-clamp-1">{client.lastMessage}</div>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <a href={`/consultant/chats?conv=${client.conversationId}`}>
                        Open Chat
                      </a>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </ConsultantRoleGate>
  );
}
