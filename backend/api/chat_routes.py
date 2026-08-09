import datetime as dt
import uuid

from fastapi import APIRouter, HTTPException

from backend.db import fetch_all, fetch_one, get_conn
from backend.models.chat_models import (
    ChatStartRequest,
    ChatStartResponse,
    ConversationListItem,
    MessageItem,
    SendMessageRequest,
)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/start", response_model=ChatStartResponse)
def start_chat(req: ChatStartRequest) -> ChatStartResponse:
    user_id = (req.user_id or "").strip()
    consultant_id = (req.consultant_id or "").strip()
    if not user_id or not consultant_id:
        raise HTTPException(status_code=400, detail="user_id and consultant_id are required")

    conn = get_conn()
    try:
        existing = fetch_one(
            conn,
            "SELECT id FROM conversations WHERE user_id = ? AND consultant_id = ? ORDER BY created_at DESC LIMIT 1",
            (user_id, consultant_id),
        )
        if existing is not None:
            return ChatStartResponse(conversation_id=str(existing["id"]))

        conversation_id = str(uuid.uuid4())
        created_at = dt.datetime.utcnow().isoformat()
        conn.execute(
            "INSERT INTO conversations(id, user_id, consultant_id, created_at) VALUES(?, ?, ?, ?)",
            (conversation_id, user_id, consultant_id, created_at),
        )
        conn.commit()
        return ChatStartResponse(conversation_id=conversation_id)
    finally:
        conn.close()


@router.get("/conversations/{user_id}", response_model=list[ConversationListItem])
def list_conversations(user_id: str) -> list[ConversationListItem]:
    user_id = (user_id or "").strip()
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    conn = get_conn()
    try:
        rows = fetch_all(
            conn,
            """
            SELECT c.id, c.user_id, c.consultant_id, c.created_at,
                   m.message_text AS last_message,
                   m.timestamp AS last_timestamp
            FROM conversations c
            LEFT JOIN (
              SELECT conversation_id, message_text, timestamp
              FROM messages
              WHERE (conversation_id, timestamp) IN (
                SELECT conversation_id, MAX(timestamp)
                FROM messages
                GROUP BY conversation_id
              )
            ) m ON m.conversation_id = c.id
            WHERE c.user_id = ?
            ORDER BY COALESCE(m.timestamp, c.created_at) DESC
            """,
            (user_id,),
        )

        return [
            ConversationListItem(
                id=str(r["id"]),
                user_id=str(r["user_id"]),
                consultant_id=str(r["consultant_id"]),
                created_at=str(r["created_at"]),
                last_message=None if r["last_message"] is None else str(r["last_message"]),
                last_timestamp=None if r["last_timestamp"] is None else str(r["last_timestamp"]),
            )
            for r in rows
        ]
    finally:
        conn.close()


@router.get("/messages/{conversation_id}", response_model=list[MessageItem])
def list_messages(conversation_id: str) -> list[MessageItem]:
    conversation_id = (conversation_id or "").strip()
    if not conversation_id:
        raise HTTPException(status_code=400, detail="conversation_id is required")

    conn = get_conn()
    try:
        conv = fetch_one(conn, "SELECT id FROM conversations WHERE id = ?", (conversation_id,))
        if conv is None:
            raise HTTPException(status_code=404, detail="conversation not found")

        rows = fetch_all(
            conn,
            "SELECT id, conversation_id, sender_type, message_text, timestamp FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC",
            (conversation_id,),
        )
        return [
            MessageItem(
                id=str(r["id"]),
                conversation_id=str(r["conversation_id"]),
                sender_type=str(r["sender_type"]),
                message_text=str(r["message_text"]),
                timestamp=str(r["timestamp"]),
            )
            for r in rows
        ]
    finally:
        conn.close()


@router.post("/send")
def send_message(req: SendMessageRequest) -> dict[str, str]:
    conversation_id = (req.conversation_id or "").strip()
    sender_type = (req.sender_type or "").strip().lower()
    message = (req.message or "").strip()

    if not conversation_id or not message:
        raise HTTPException(status_code=400, detail="conversation_id and message are required")
    if sender_type not in {"user", "consultant", "ai"}:
        raise HTTPException(status_code=400, detail="sender_type must be user|consultant|ai")

    conn = get_conn()
    try:
        conv = fetch_one(conn, "SELECT id FROM conversations WHERE id = ?", (conversation_id,))
        if conv is None:
            raise HTTPException(status_code=404, detail="conversation not found")

        msg_id = str(uuid.uuid4())
        ts = dt.datetime.utcnow().isoformat()
        conn.execute(
            "INSERT INTO messages(id, conversation_id, sender_type, message_text, timestamp) VALUES(?, ?, ?, ?, ?)",
            (msg_id, conversation_id, sender_type, message, ts),
        )
        conn.commit()
        return {"message_id": msg_id}
    finally:
        conn.close()


@router.get("/conversations-for-consultant/{consultant_id}", response_model=list[ConversationListItem])
def list_conversations_for_consultant(consultant_id: str) -> list[ConversationListItem]:
    consultant_id = (consultant_id or "").strip()
    if not consultant_id:
        raise HTTPException(status_code=400, detail="consultant_id is required")

    conn = get_conn()
    try:
        rows = fetch_all(
            conn,
            """
            SELECT c.id, c.user_id, c.consultant_id, c.created_at,
                   m.message_text AS last_message,
                   m.timestamp AS last_timestamp
            FROM conversations c
            LEFT JOIN (
              SELECT conversation_id, message_text, timestamp
              FROM messages
              WHERE (conversation_id, timestamp) IN (
                SELECT conversation_id, MAX(timestamp)
                FROM messages
                GROUP BY conversation_id
              )
            ) m ON m.conversation_id = c.id
            WHERE c.consultant_id = ?
            ORDER BY COALESCE(m.timestamp, c.created_at) DESC
            """,
            (consultant_id,),
        )

        return [
            ConversationListItem(
                id=str(r["id"]),
                user_id=str(r["user_id"]),
                consultant_id=str(r["consultant_id"]),
                created_at=str(r["created_at"]),
                last_message=None if r["last_message"] is None else str(r["last_message"]),
                last_timestamp=None if r["last_timestamp"] is None else str(r["last_timestamp"]),
            )
            for r in rows
        ]
    finally:
        conn.close()
