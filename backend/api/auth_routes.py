import datetime as dt
import uuid

import bcrypt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.db import fetch_one, get_conn

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterConsultantRequest(BaseModel):
    username: str
    password: str
    name: str
    domain: str


class RegisterConsultantResponse(BaseModel):
    consultant_id: str
    username: str
    name: str
    domain: str


class LoginConsultantRequest(BaseModel):
    username: str
    password: str


class LoginConsultantResponse(BaseModel):
    consultant_id: str
    name: str
    domain: str


@router.post("/register-consultant", response_model=RegisterConsultantResponse)
def register_consultant(req: RegisterConsultantRequest) -> RegisterConsultantResponse:
    username = (req.username or "").strip()
    password = (req.password or "").strip()
    name = (req.name or "").strip()
    domain = (req.domain or "").strip()

    if not username or not password or not name or not domain:
        raise HTTPException(
            status_code=400,
            detail="username, password, name, and domain are required",
        )

    if len(username) < 3:
        raise HTTPException(status_code=400, detail="username must be at least 3 characters")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="password must be at least 6 characters")

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    consultant_id = str(uuid.uuid4())
    created_at = dt.datetime.utcnow().isoformat()

    conn = get_conn()
    try:
        # Check if username already exists
        existing = fetch_one(conn, "SELECT id FROM consultants WHERE username = ?", (username,))
        if existing is not None:
            raise HTTPException(status_code=400, detail="username already exists")

        conn.execute(
            """
            INSERT INTO consultants(id, username, password_hash, name, domain, created_at)
            VALUES(?, ?, ?, ?, ?, ?)
            """,
            (consultant_id, username, password_hash, name, domain, created_at),
        )
        conn.commit()

        return RegisterConsultantResponse(
            consultant_id=consultant_id, username=username, name=name, domain=domain
        )
    finally:
        conn.close()


@router.post("/login-consultant", response_model=LoginConsultantResponse)
def login_consultant(req: LoginConsultantRequest) -> LoginConsultantResponse:
    username = (req.username or "").strip()
    password = (req.password or "").strip()

    if not username or not password:
        raise HTTPException(status_code=400, detail="username and password are required")

    conn = get_conn()
    try:
        row = fetch_one(
            conn, "SELECT id, password_hash, name, domain FROM consultants WHERE username = ?", (username,)
        )
        if row is None:
            raise HTTPException(status_code=401, detail="invalid username or password")

        consultant_id = str(row["id"])
        password_hash = str(row["password_hash"])
        name = str(row["name"])
        domain = str(row["domain"])

        if not bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8")):
            raise HTTPException(status_code=401, detail="invalid username or password")

        return LoginConsultantResponse(
            consultant_id=consultant_id, name=name, domain=domain
        )
    finally:
        conn.close()


@router.get("/verify/{consultant_id}")
def verify_consultant(consultant_id: str) -> dict[str, bool]:
    consultant_id = (consultant_id or "").strip()
    if not consultant_id:
        raise HTTPException(status_code=400, detail="consultant_id is required")

    conn = get_conn()
    try:
        row = fetch_one(conn, "SELECT id FROM consultants WHERE id = ?", (consultant_id,))
        if row is None:
            return {"valid": False}
        return {"valid": True}
    finally:
        conn.close()
