# AGENTS

## When helping with this repository

This project contains a Python FastAPI backend and a Next.js frontend. Focus on the runtime commands and environment setup required to launch both locally.

## Key files

- `app.py`
  - FastAPI backend entrypoint.
  - Loads `.env` from the repository root and requires `OPENAI_API_KEY`.
  - Includes API routers for chat, AI, appointments, and auth.

- `requirements.txt`
  - Backend dependencies for Python.

- `backend/db.py`
  - Initializes a local SQLite database at `backend/consultmatch.db` on startup.

- `backend/services/openai_service.py`
  - Uses OpenAI SDK to call `gpt-4o-mini` for chat completions.

- `frontend/package.json`
  - Next.js 14 app with `dev`, `build`, `start`, and `lint` scripts.

- `frontend/lib/api.ts`
  - Frontend expects the backend at `NEXT_PUBLIC_API_BASE_URL` or defaults to `http://localhost:8000`.

## How to run locally

1. Install backend dependencies:
   - `python -m pip install -r requirements.txt`

2. Ensure environment variables are available:
   - Create a `.env` file in the repository root with:
     ```text
     OPENAI_API_KEY=<your-openai-api-key>
     ```
   - `app.py` will fail fast if `OPENAI_API_KEY` is missing.

3. Start the backend:
   - `python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000`

4. Start the frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`
   - Open `http://localhost:3000`

5. If the backend is running on a different host or port, set:
   - `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`

## Notes for agents

- Do not expose actual API key values in suggestions.
- For code execution issues, verify that `OPENAI_API_KEY` is set and `backend/consultmatch.db` is created automatically.
- Prefer `uvicorn` for the backend and `npm run dev` for the frontend.

## Related areas

- `train.py`, `train_domain_classifier.py`, `train_system.py`, `recommender.py`, `domain_classifier.py`, and `hybrid_retriever.py` are training and model utilities, not required for the standard web app startup path.
