import json
import os

from dotenv import load_dotenv
from fastapi import APIRouter
from mistral_chat_game.models import (
    GenerateLevelGoalRequest,
    GenerateLevelGoalResponse,
)
from mistralai import Mistral

load_dotenv()

router = APIRouter()
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])


@router.post("/level/generate-goal", response_model=GenerateLevelGoalResponse)
async def generate_level_goal(
    req: GenerateLevelGoalRequest,
) -> GenerateLevelGoalResponse:
    response = client.chat.complete(
        model="mistral-large-latest",
        messages=[
            {
                "role": "system",
                "content": (
                    "You generate short, fun social challenge goals for a persuasion game. "
                    "Return ONLY valid JSON with no markdown or explanation. "
                    "The JSON must have: "
                    "'goal_short' (a terse 5-8 word goal string, e.g. 'Come to the house party tonight'), "
                    "'goal_display' (the same goal with an appropriate emoji appended, e.g. 'Come to the house party tonight 🎉'), "
                    "'difficulty' (one of: easy, medium, hard). "
                    "Goals should feel like real social situations: parties, trips, dates, outdoor plans, food runs, spontaneous ideas. "
                    "Higher levels should have more socially awkward or emotionally complex goals."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Generate a goal for level {req.level_number}. "
                    f"There will be {req.num_characters} people to convince. "
                    f"Make it progressively more challenging than earlier levels. "
                    f"Previously used goals to avoid repeating: {', '.join(req.previous_goals) if req.previous_goals else 'none'}."
                ),
            },
        ],
        max_tokens=120,
    )

    raw = response.choices[0].message.content
    clean = raw.replace("```json", "").replace("```", "").strip()
    data = json.loads(clean)
    return GenerateLevelGoalResponse(**data)
