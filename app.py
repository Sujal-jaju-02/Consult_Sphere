import logging
import os
import time
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Force .env loading from project root, independent of current working directory.
BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path, override=True)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
print("Loaded OpenAI key prefix:", OPENAI_API_KEY[:10] if OPENAI_API_KEY else "None")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment")

from backend.api.ai_routes import router as ai_router
from backend.api.appointment_routes import router as appointments_router
from backend.api.auth_routes import router as auth_router
from backend.api.chat_routes import router as chat_router
from backend.db import init_db
from recommender import load_recommender


logger = logging.getLogger("consultant_recommendation")
logging.basicConfig(level=logging.INFO)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendRequest(BaseModel):
    query: str


@app.on_event("startup")
def _startup() -> None:
    try:
        init_db()
        load_recommender()
    except FileNotFoundError as e:
        logger.error(str(e))


app.include_router(chat_router)
app.include_router(ai_router)
app.include_router(appointments_router)
app.include_router(auth_router)


@app.post("/recommend")
def recommend(req: RecommendRequest) -> list[dict[str, Any]]:
    query = (req.query or "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="query must be a non-empty string")

    logger.info("Incoming query: %s", query)
    start = time.perf_counter()

    try:
        recommender = load_recommender()
        results = recommender.recommend_consultants(query=query, top_k=5)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Recommendation failed")
        raise HTTPException(status_code=500, detail="internal error")
    finally:
        elapsed_ms = (time.perf_counter() - start) * 1000.0
        logger.info("Recommendation computed in %.2fms", elapsed_ms)

    return results
