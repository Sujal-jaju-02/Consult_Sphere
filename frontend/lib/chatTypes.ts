export type ConversationListItem = {
  id: string;
  user_id: string;
  consultant_id: string;
  created_at: string;
  last_message?: string | null;
  last_timestamp?: string | null;
};

export type MessageItem = {
  id: string;
  conversation_id: string;
  sender_type: "user" | "consultant" | "ai";
  message_text: string;
  timestamp: string;
};

export type StartChatResponse = {
  conversation_id: string;
};

export type AIChatResponse = {
  reply: string;
};

export type BookAppointmentResponse = {
  appointment_id: string;
};
