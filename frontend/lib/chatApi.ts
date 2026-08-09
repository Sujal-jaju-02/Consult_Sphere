import type {
  AIChatResponse,
  BookAppointmentResponse,
  ConversationListItem,
  MessageItem,
  StartChatResponse,
} from "@/lib/chatTypes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: string };
    return data?.detail || "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function startChat(userId: string, consultantId: string): Promise<StartChatResponse> {
  const res = await fetch(`${API_BASE_URL}/chat/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, consultant_id: consultantId }),
  });

  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as StartChatResponse;
}

export async function getConversations(userId: string): Promise<ConversationListItem[]> {
  const res = await fetch(`${API_BASE_URL}/chat/conversations/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as ConversationListItem[];
}

export async function getMessages(conversationId: string): Promise<MessageItem[]> {
  const res = await fetch(`${API_BASE_URL}/chat/messages/${encodeURIComponent(conversationId)}`);
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as MessageItem[];
}

export async function sendMessage(
  conversationId: string,
  senderType: "user" | "consultant" | "ai",
  message: string
): Promise<{ message_id: string }> {
  const res = await fetch(`${API_BASE_URL}/chat/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_id: conversationId,
      sender_type: senderType,
      message,
    }),
  });

  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as { message_id: string };
}

export async function aiChat(message: string): Promise<AIChatResponse> {
  const res = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as AIChatResponse;
}

export async function bookAppointment(input: {
  user_id: string;
  consultant_id: string;
  date: string;
  time: string;
  notes: string;
}): Promise<BookAppointmentResponse> {
  const res = await fetch(`${API_BASE_URL}/appointments/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as BookAppointmentResponse;
}

export async function getConversationsForConsultant(
  consultantId: string
): Promise<ConversationListItem[]> {
  const res = await fetch(
    `${API_BASE_URL}/chat/conversations-for-consultant/${encodeURIComponent(consultantId)}`
  );
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as ConversationListItem[];
}

export async function getAppointmentsForConsultant(
  consultantId: string
): Promise<any[]> {
  const res = await fetch(
    `${API_BASE_URL}/appointments/consultant/${encodeURIComponent(consultantId)}`
  );
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as any[];
}
