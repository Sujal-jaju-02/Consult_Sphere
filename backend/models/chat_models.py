from pydantic import BaseModel


class ChatStartRequest(BaseModel):
    user_id: str
    consultant_id: str


class ChatStartResponse(BaseModel):
    conversation_id: str


class SendMessageRequest(BaseModel):
    conversation_id: str
    sender_type: str
    message: str


class ConversationListItem(BaseModel):
    id: str
    user_id: str
    consultant_id: str
    created_at: str
    last_message: str | None = None
    last_timestamp: str | None = None


class MessageItem(BaseModel):
    id: str
    conversation_id: str
    sender_type: str
    message_text: str
    timestamp: str
