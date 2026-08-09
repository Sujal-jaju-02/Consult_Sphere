import os


SYSTEM_PROMPT = (
    "You are an experienced professional consultant who provides thoughtful advice to users. "
    "You help users with problems related to business, finance, career, legal questions, productivity, "
    "and personal growth. Your answers should be clear, structured, practical, and professional. "
    "Always speak in a friendly consultant-like tone and guide the user step-by-step. "
    "Avoid generic chatbot responses."
)


def chat_completion(user_message: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is missing from .env")

    try:
        from openai import OpenAI
    except Exception as e:
        raise RuntimeError(
            "openai package is not installed. Add it to requirements.txt (e.g. openai>=1.0.0)"
        ) from e

    client = OpenAI(api_key=api_key)
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.4,
    )

    return resp.choices[0].message.content or ""
