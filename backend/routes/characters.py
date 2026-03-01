import json
import os

from dotenv import load_dotenv
from fastapi import APIRouter
from mistral_chat_game.models import (
    GenerateCharactersRequest,
    GenerateCharactersResponse,
    GeneratedCharacter,
)
from mistralai import Mistral

load_dotenv()

router = APIRouter()
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])


@router.post("/characters/generate", response_model=GenerateCharactersResponse)
async def generate_characters(
    req: GenerateCharactersRequest,
) -> GenerateCharactersResponse:
    response = client.chat.complete(
        model="mistral-large-latest",
        messages=[
            {
                "role": "system",
                "content": (
                    "You generate realistic friend group characters for a social persuasion game. "
                    "Return ONLY valid JSON, no markdown, no explanation. "
                    "The JSON must be an object with a 'characters' array. "
                    "Each character must have: name (string), personality (1 sentence string), "
                    "resistance_level (float 0.0-1.0), "
                    "avatar_color_from (hex string), avatar_color_to (hex string). "
                    "Make characters feel like real distinct people with varied personalities. "
                    "Resistance level should vary — not everyone should be equally stubborn."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Generate {req.num_characters} characters for level {req.level_number}. "
                    f"The player needs to convince them to: {req.goal_description}. "
                    f"Make personalities relevant to why they might resist or be open to this goal."
                ),
            },
        ],
        max_tokens=600,
    )

    raw = response.choices[0].message.content
    # strip markdown fences if model adds them
    clean = raw.replace("```json", "").replace("```", "").strip()
    data = json.loads(clean)
    return GenerateCharactersResponse(
        characters=[GeneratedCharacter(**c) for c in data["characters"]]
    )
