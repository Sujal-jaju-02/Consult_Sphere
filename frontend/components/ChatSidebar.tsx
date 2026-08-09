"use client";

import * as React from "react";
import Link from "next/link";

import type { ConversationListItem } from "@/lib/chatTypes";
import { cn } from "@/lib/utils";

export function ChatSidebar({
  conversations,
  activeConversationId,
}: {
  conversations: ConversationListItem[];
  activeConversationId?: string;
}) {
  return (
    <aside className="rounded-3xl border border-sage-100 bg-white/60 shadow-soft">
      <div className="border-b border-sage-100 p-5">
        <div className="text-sm font-semibold">Chats</div>
        <div className="mt-1 text-xs text-gray-600">{conversations.length} conversations</div>
      </div>
      <div className="p-3">
        {conversations.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">No conversations yet.</div>
        ) : (
          conversations.map((c) => (
            <Link
              key={c.id}
              href={`/chat/${c.id}`}
              className={cn(
                "block w-full rounded-3xl p-4 text-left transition",
                activeConversationId === c.id
                  ? "bg-sage-50 ring-1 ring-sage-100"
                  : "hover:bg-white/70"
              )}
            >
              <div className="text-sm font-semibold text-ink">{c.consultant_id}</div>
              <div className="mt-1 line-clamp-1 text-xs text-gray-600">
                {c.last_message || "Start the conversation"}
              </div>
            </Link>
          ))
        )}
      </div>
    </aside>
  );
}
