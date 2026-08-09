import os
import sqlite3
from typing import Any

_DB_PATH = os.path.join(os.path.dirname(__file__), "consultmatch.db")


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(_DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_conn()
    try:
        cur = conn.cursor()

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS consultants (
              id TEXT PRIMARY KEY,
              username TEXT UNIQUE NOT NULL,
              password_hash TEXT NOT NULL,
              name TEXT NOT NULL,
              domain TEXT NOT NULL,
              created_at TEXT NOT NULL
            )
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS conversations (
              id TEXT PRIMARY KEY,
              user_id TEXT NOT NULL,
              consultant_id TEXT NOT NULL,
              created_at TEXT NOT NULL
            )
            """
        )
        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_conversations_user
            ON conversations(user_id)
            """
        )
        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_conversations_consultant
            ON conversations(consultant_id)
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
              id TEXT PRIMARY KEY,
              conversation_id TEXT NOT NULL,
              sender_type TEXT NOT NULL,
              message_text TEXT NOT NULL,
              timestamp TEXT NOT NULL,
              FOREIGN KEY(conversation_id) REFERENCES conversations(id)
            )
            """
        )
        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_messages_conversation
            ON messages(conversation_id)
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS appointments (
              id TEXT PRIMARY KEY,
              user_id TEXT NOT NULL,
              consultant_id TEXT NOT NULL,
              date TEXT NOT NULL,
              time TEXT NOT NULL,
              notes TEXT NOT NULL,
              status TEXT NOT NULL,
              created_at TEXT NOT NULL
            )
            """
        )
        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_appointments_user
            ON appointments(user_id)
            """
        )
        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_appointments_consultant
            ON appointments(consultant_id)
            """
        )

        conn.commit()
    finally:
        conn.close()


def fetch_all(conn: sqlite3.Connection, query: str, params: tuple[Any, ...] = ()) -> list[sqlite3.Row]:
    cur = conn.execute(query, params)
    return list(cur.fetchall())


def fetch_one(conn: sqlite3.Connection, query: str, params: tuple[Any, ...] = ()) -> sqlite3.Row | None:
    cur = conn.execute(query, params)
    return cur.fetchone()
