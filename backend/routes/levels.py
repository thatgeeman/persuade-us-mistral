import json
import os
import random

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
MAX_GROUP_MEMBERS = 4
MAX_LEVEL = 10


def build_fallback_goal(theme: str, level_number: int) -> dict:
    fallback_by_theme = {
        "a spontaneous night out": "Go out for one spontaneous night",
        "a weekend trip": "Take a quick weekend trip together",
        "a food adventure": "Try a new spot together tonight",
        "an outdoor activity": "Join an outdoor plan this weekend",
        "a creative project": "Start a fun creative project together",
        "a fitness challenge": "Do a short fitness challenge together",
        "a social gathering": "Come to a small group hangout",
        "a surprise plan": "Say yes to a surprise plan",
        "a cultural outing": "Join a cultural outing this week",
        "a lazy day in": "Come over for a chill day in",
        "a late-night idea": "Say yes to a late-night plan",
        "a workplace situation": "Back my workplace plan this week",
        "a family obligation": "Help me handle a family plan",
        "a romantic scenario": "Support my romantic plan tonight",
        "a group vacation": "Commit to a short group getaway",
    }
    goal_short = fallback_by_theme.get(theme, "Join this plan with me tonight")
    difficulty = "easy" if level_number <= 3 else "medium" if level_number <= 7 else "hard"
    goal_display = f"{goal_short} 🎯"
    return {
        "goal_short": goal_short,
        "goal_display": goal_display,
        "difficulty": difficulty,
    }


@router.post("/level/generate-goal", response_model=GenerateLevelGoalResponse)
async def generate_level_goal(
    req: GenerateLevelGoalRequest,
) -> GenerateLevelGoalResponse:
    effective_level = max(1, min(req.level_number, MAX_LEVEL))
    requested_count = max(1, min(req.num_characters, MAX_GROUP_MEMBERS))
    themes = [
        "a spontaneous night out", "a weekend trip", "a food adventure",
        "an outdoor activity", "a creative project", "a fitness challenge",
        "a social gathering", "a surprise plan", "a cultural outing",
        "a lazy day in", "a late-night idea", "a workplace situation",
        "a family obligation", "a romantic scenario", "a group vacation",
    ]
    theme = random.choice(themes)

    response = client.chat.complete(
        model="mistral-large-latest",
        temperature=0.9,
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
                    f"Generate a goal for level {effective_level} themed around: {theme}. "
                    f"There will be {requested_count} people to convince. "
                    f"Player context: name={req.player_name or 'unspecified'}, type={req.player_type or 'unspecified'}. "
                    f"Make it progressively more challenging than earlier levels. "
                    f"Be creative and unexpected — avoid clichés. "
                    f"Previously used goals to avoid repeating: {', '.join(req.previous_goals) if req.previous_goals else 'none'}."
                ),
            },
        ],
        max_tokens=300,
    )

    raw = response.choices[0].message.content
    clean = raw.replace("```json", "").replace("```", "").strip()
    fallback = build_fallback_goal(theme, effective_level)
    allowed_difficulties = {"easy", "medium", "hard"}

    try:
        data = json.loads(clean)
    except json.JSONDecodeError:
        data = fallback.copy()

    if not isinstance(data, dict):
        data = {}

    goal_short = str(data.get("goal_short") or "").strip() or fallback["goal_short"]
    if goal_short.lower().startswith("convince everyone for level"):
        goal_short = fallback["goal_short"]
    goal_display = str(data.get("goal_display") or "").strip() or f"{goal_short} 🎯"
    if goal_display.lower().startswith("convince everyone for level"):
        goal_display = fallback["goal_display"]
    difficulty = str(data.get("difficulty") or "").strip().lower()
    if difficulty not in allowed_difficulties:
        difficulty = fallback["difficulty"]

    return GenerateLevelGoalResponse(
        goal_short=goal_short,
        goal_display=goal_display,
        difficulty=difficulty,
    )
