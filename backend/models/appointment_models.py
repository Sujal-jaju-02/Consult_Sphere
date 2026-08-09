from pydantic import BaseModel


class BookAppointmentRequest(BaseModel):
    user_id: str
    consultant_id: str
    date: str
    time: str
    notes: str = ""


class AppointmentItem(BaseModel):
    id: str
    user_id: str
    consultant_id: str
    date: str
    time: str
    notes: str
    status: str
    created_at: str
