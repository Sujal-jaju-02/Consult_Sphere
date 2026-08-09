"use client";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import type { Consultant } from "@/lib/types";
import { startChat } from "@/lib/chatApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function ConsultantCard({ consultant }: { consultant: Consultant }) {
  const router = useRouter();
  const [starting, setStarting] = React.useState(false);
  const [chatError, setChatError] = React.useState<string | null>(null);

  async function handleStartChat() {
    setStarting(true);
    setChatError(null);
    try {
      const userId = window.localStorage.getItem("user_id") || "guest";
      const res = await startChat(userId, consultant.name);
      router.push(`/chat/${res.conversation_id}`);
    } catch (e) {
      setChatError(e instanceof Error ? e.message : "Failed to start chat");
      setStarting(false);
    }
  }

  return (
    <Card className="group transition hover:shadow-lift">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold tracking-tight text-ink">
              {consultant.name}
            </div>
            <div className="mt-2">
              <Badge>{consultant.domain}</Badge>
            </div>
          </div>
          <div className="rounded-2xl bg-sage-50 px-3 py-2 text-xs font-medium text-sage-700 ring-1 ring-sage-100">
            Score {consultant.final_score.toFixed(3)}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="text-sm text-gray-700">
            <span className="font-medium">Experience:</span> {consultant.experience} years
          </div>
        </div>

        {chatError && (
          <div className="mt-3 text-xs text-red-600">{chatError}</div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button
          variant="outline"
          className="w-full justify-center gap-2 group-hover:bg-white"
          onClick={handleStartChat}
          disabled={starting}
        >
          <MessageCircle className="h-4 w-4" />
          {starting ? "Opening…" : "Start Chat"}
        </Button>
      </CardFooter>
    </Card>
  );
}
