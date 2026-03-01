import os
from typing import Optional

from fastapi import APIRouter
from huggingface_hub import InferenceClient
from huggingface_hub.errors import HfHubHTTPError
from pydantic import BaseModel

router = APIRouter()
MIN_MESSAGE_CHARS = 70
MAX_MESSAGE_CHARS = 100

HF_MODELS = [
    "Qwen/Qwen2.5-7B-Instruct",
    "meta-llama/Llama-3.1-8B-Instruct",
    "Qwen/Qwen2.5-14B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.2",
    "meta-llama/Llama-3.2-3B-Instruct",
    "meta-llama/Meta-Llama-3-8B-Instruct",
    "HuggingFaceH4/zephyr-7b-beta",
    "NousResearch/Hermes-3-Llama-3.1-8B",
]


class LLMPlayerRequest(BaseModel):
    model: str
    goal: str
    conversation: list[dict]  # {role, character, content}
    api_token: Optional[str] = None


class LLMPlayerResponse(BaseModel):
    message: str
    model: str


class LLMModelCheckRequest(BaseModel):
    model: str
    api_token: Optional[str] = None


class LLMModelCheckResponse(BaseModel):
    reachable: bool


def normalize_message(text: str) -> str:
    return " ".join(text.strip().split())


def strip_wrapping_quotes(text: str) -> str:
    s = (text or "").strip()
    quote_pairs = {('"', '"'), ("'", "'"), ("“", "”"), ("‘", "’")}
    while len(s) >= 2 and (s[0], s[-1]) in quote_pairs:
        s = s[1:-1].strip()
    return s


def in_range(text: str) -> bool:
    return MIN_MESSAGE_CHARS <= len(text) <= MAX_MESSAGE_CHARS


def build_fallback_message(goal: str) -> str:
    safe_goal = normalize_message(goal)[:42].rstrip(" .,;:")
    message = f"Come with me for {safe_goal} tonight. It'll be fun, easy, and we can bail early if needed."
    if len(message) < MIN_MESSAGE_CHARS:
        message += " You'll like the vibe."
    message = normalize_message(message)
    if len(message) > MAX_MESSAGE_CHARS:
        message = message[:MAX_MESSAGE_CHARS].rstrip()
    return message


def resolve_token(api_token: Optional[str]) -> Optional[str]:
    if api_token is not None:
        # If client explicitly provides a token field, use only that value.
        # Do not fall back to server HF_TOKEN in this case.
        return api_token.strip() or None
    return os.environ.get("HF_TOKEN")


@router.get("/player/llm-models")
def get_llm_models():
    return {"models": HF_MODELS}


@router.post("/player/llm-model-check", response_model=LLMModelCheckResponse)
async def llm_model_check(req: LLMModelCheckRequest) -> LLMModelCheckResponse:
    client = InferenceClient(model=req.model, token=resolve_token(req.api_token))
    try:
        client.chat_completion(
            messages=[{"role": "user", "content": "Hi"}],
            max_tokens=4,
            temperature=0.0,
        )
        return LLMModelCheckResponse(reachable=True)
    except HfHubHTTPError:
        return LLMModelCheckResponse(reachable=False)
    except Exception:
        return LLMModelCheckResponse(reachable=False)


@router.post("/player/llm-message", response_model=LLMPlayerResponse)
async def llm_player_message(req: LLMPlayerRequest) -> LLMPlayerResponse:
    token = resolve_token(req.api_token)
    client = InferenceClient(
        model=req.model,
        token=token,
    )

    history = "\n".join(
        f"{'Me' if m['role'] == 'user' else m.get('character', 'Friend')}: {m['content']}"
        for m in req.conversation
        if m.get("role") != "system" and m.get("content")
    )

    system_prompt = (
        f"You are playing a social persuasion game. Your goal is to convince your friends to: {req.goal}. "
        f"Write exactly one short, casual text message between {MIN_MESSAGE_CHARS} and {MAX_MESSAGE_CHARS} characters. "
        "Be natural, friendly, and persuasive. No emoji overload. "
        "Reply with ONLY the message text, nothing else."
    )
    user_prompt = (
        f"Chat so far:\n{history}\n\nWrite your next message:"
        if history
        else "Start the conversation to convince them."
    )

    try:
        response = client.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=80,
            temperature=0.8,
        )
    except HfHubHTTPError:
        return LLMPlayerResponse(
            message=build_fallback_message(req.goal), model=req.model
        )

    message = strip_wrapping_quotes(
        normalize_message(response.choices[0].message.content)
    )

    if not in_range(message):
        rewrite_system_prompt = (
            f"Rewrite text into one casual persuasive message between {MIN_MESSAGE_CHARS} and "
            f"{MAX_MESSAGE_CHARS} characters. Keep the same intent. Plain text only."
        )
        rewrite_user_prompt = f"Rewrite this:\n{message}"
        try:
            rewrite = client.chat_completion(
                messages=[
                    {"role": "system", "content": rewrite_system_prompt},
                    {"role": "user", "content": rewrite_user_prompt},
                ],
                max_tokens=80,
                temperature=0.4,
            )
            message = strip_wrapping_quotes(
                normalize_message(rewrite.choices[0].message.content)
            )
        except HfHubHTTPError:
            message = build_fallback_message(req.goal)

    if len(message) > MAX_MESSAGE_CHARS:
        message = message[:MAX_MESSAGE_CHARS].rstrip()

    if len(message) < MIN_MESSAGE_CHARS:
        message = build_fallback_message(req.goal)

    return LLMPlayerResponse(message=message, model=req.model)
