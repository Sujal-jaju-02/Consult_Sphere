from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.services.openai_service import chat_completion

router = APIRouter(prefix="/ai", tags=["ai"])


class AIChatRequest(BaseModel):
    message: str


@router.post("/chat")
def ai_chat(req: AIChatRequest) -> dict[str, str]:
    message = (req.message or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="message must be a non-empty string")

    try:
        reply = chat_completion(message)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"reply": reply}
