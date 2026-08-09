import datetime as dt
import uuid

from fastapi import APIRouter, HTTPException

from backend.db import fetch_all, get_conn
from backend.models.appointment_models import AppointmentItem, BookAppointmentRequest

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.post("/book")
def book(req: BookAppointmentRequest) -> dict[str, str]:
    user_id = (req.user_id or "").strip()
    consultant_id = (req.consultant_id or "").strip()
    date = (req.date or "").strip()
    time = (req.time or "").strip()
    notes = (req.notes or "").strip()

    if not user_id or not consultant_id or not date or not time:
        raise HTTPException(status_code=400, detail="user_id, consultant_id, date, time are required")

    conn = get_conn()
    try:
        appt_id = str(uuid.uuid4())
        created_at = dt.datetime.utcnow().isoformat()
        conn.execute(
            """
            INSERT INTO appointments(id, user_id, consultant_id, date, time, notes, status, created_at)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (appt_id, user_id, consultant_id, date, time, notes, "scheduled", created_at),
        )
        conn.commit()
        return {"appointment_id": appt_id}
    finally:
        conn.close()


@router.get("/user/{user_id}", response_model=list[AppointmentItem])
def for_user(user_id: str) -> list[AppointmentItem]:
    user_id = (user_id or "").strip()
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    conn = get_conn()
    try:
        rows = fetch_all(
            conn,
            "SELECT id, user_id, consultant_id, date, time, notes, status, created_at FROM appointments WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        )
        return [AppointmentItem(**dict(r)) for r in rows]
    finally:
        conn.close()


@router.get("/consultant/{consultant_id}", response_model=list[AppointmentItem])
def for_consultant(consultant_id: str) -> list[AppointmentItem]:
    consultant_id = (consultant_id or "").strip()
    if not consultant_id:
        raise HTTPException(status_code=400, detail="consultant_id is required")

    conn = get_conn()
    try:
        rows = fetch_all(
            conn,
            "SELECT id, user_id, consultant_id, date, time, notes, status, created_at FROM appointments WHERE consultant_id = ? ORDER BY created_at DESC",
            (consultant_id,),
        )
        return [AppointmentItem(**dict(r)) for r in rows]
    finally:
        conn.close()
