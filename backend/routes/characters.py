import json
import os
import random

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
MAX_GROUP_MEMBERS = 4
MAX_LEVEL = 10
DEFAULT_COLOR_PAIRS = [
    ("#f97316", "#fb7185"),
    ("#06b6d4", "#3b82f6"),
    ("#22c55e", "#14b8a6"),
    ("#a855f7", "#6366f1"),
    ("#f59e0b", "#ef4444"),
]


def is_valid_hex_color(value: str) -> bool:
    if not isinstance(value, str) or len(value) != 7 or not value.startswith("#"):
        return False
    try:
        int(value[1:], 16)
        return True
    except ValueError:
        return False


def clamp_resistance(value) -> float:
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        numeric = random.uniform(0.3, 0.8)
    return max(0.0, min(1.0, numeric))


@router.post("/characters/generate", response_model=GenerateCharactersResponse)
async def generate_characters(
    req: GenerateCharactersRequest,
) -> GenerateCharactersResponse:
    effective_level = max(1, min(req.level_number, MAX_LEVEL))
    requested_count = max(1, min(req.num_characters, MAX_GROUP_MEMBERS))
    archetypes = [
        "anxious overthinker", "laid-back optimist", "stubborn realist",
        "impulsive thrill-seeker", "rule-follower", "people-pleaser",
        "contrarian", "homebody", "chronic over-committer", "budget hawk",
        "FOMO-driven", "overly cautious planner", "spontaneous free spirit",
        "social butterfly", "reluctant joiner", "eternal pessimist",
    ]
    name_styles = [
        "common American names", "British names", "Southern US names",
        "Latino names", "French names", "mixed international names",
        "classic 80s names", "trendy millennial names", "short punchy nicknames",
    ]
    player_personas = [
        "You are Riley, 29, a product designer who lives in a city apartment and is active in local community events.",
        "You are Jordan, 34, an operations manager and parent who plans around a busy weekly schedule.",
        "You are Sam, 26, a graduate student balancing classes, part-time work, and a tight budget.",
        "You are Alex, 31, a software engineer who recently moved to town and is building a new social circle.",
        "You are Casey, 38, a small-business owner who knows many people across work, neighborhood, and church groups.",
        "You are Taylor, 27, a nurse working rotating shifts and trying to keep up with friends and family.",
    ]
    relationship_contexts = [
        "work colleague", "former manager", "startup cofounder", "client from work",
        "neighbor in your building", "landlord", "roommate", "college classmate",
        "cousin", "older sibling", "ex-partner", "childhood friend",
        "church priest", "youth pastor", "choir director", "volunteer coordinator",
        "boxing coach", "running club friend", "book club organizer", "dog park regular",
        "barista who knows your order", "local bartender", "tattoo artist", "hair stylist",
        "building superintendent", "pharmacist", "dentist friend", "family doctor friend",
    ]
    chosen_archetypes = random.sample(archetypes, min(requested_count, len(archetypes)))
    name_style = random.choice(name_styles)
    human_name = (req.player_name or "").strip()
    if req.player_type == "human" and human_name:
        persona_templates = [
            f"You are {human_name}, 29, a product designer who lives in a city apartment and is active in local community events.",
            f"You are {human_name}, 34, an operations manager and parent who plans around a busy weekly schedule.",
            f"You are {human_name}, 26, a graduate student balancing classes, part-time work, and a tight budget.",
            f"You are {human_name}, 31, a software engineer who recently moved to town and is building a new social circle.",
            f"You are {human_name}, 38, a small-business owner who knows many people across work, neighborhood, and church groups.",
            f"You are {human_name}, 27, a nurse working rotating shifts and trying to keep up with friends and family.",
        ]
        player_persona = random.choice(persona_templates)
    else:
        player_persona = random.choice(player_personas)
    chosen_relationships = random.sample(relationship_contexts, min(requested_count, len(relationship_contexts)))

    response = client.chat.complete(
        model="mistral-large-latest",
        temperature=0.9,
        messages=[
            {
                "role": "system",
                "content": (
                    "You generate realistic friend group characters for a social persuasion game. "
                    "Return ONLY valid JSON, no markdown, no explanation. "
                    "The JSON must be an object with a 'characters' array. "
                    "Each character must have: name (single first name only, no last name), personality (1 sentence string), "
                    "relationship_blurb (1 sentence string describing their relationship to the player), "
                    "resistance_level (float 0.0-1.0), "
                    "avatar_color_from (hex string), avatar_color_to (hex string). "
                    "Make characters feel like real distinct people. "
                    "Resistance level should vary — not everyone should be equally stubborn. "
                    "Give each character a unique voice and motivation."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Generate {requested_count} characters for level {effective_level}. "
                    f"The player needs to convince them to: {req.goal_description}. "
                    f"Fixed player profile for all characters: {player_persona} "
                    f"Use {name_style} for the names. "
                    f"Assign one archetype per character from this list: {', '.join(chosen_archetypes)}. "
                    f"Use distinct relationship contexts from this list: {', '.join(chosen_relationships)}. "
                    f"Make each personality reflect their archetype and why they'd resist or accept the goal. "
                    "Each relationship_blurb should be direct and specific, and describe how this person knows the SAME player profile above. "
                    "Keep the player's identity, background, and life context consistent across all characters. "
                    "Do not assign the player a different role/persona per character. "
                    "Favor unusual-but-plausible social variety instead of only close friends."
                ),
            },
        ],
        max_tokens=600,
    )

    raw = response.choices[0].message.content
    # strip markdown fences if model adds them
    clean = raw.replace("```json", "").replace("```", "").strip()
    try:
        data = json.loads(clean)
    except json.JSONDecodeError:
        data = {}

    chars = data.get("characters") if isinstance(data, dict) else []
    if not isinstance(chars, list):
        chars = []

    normalized = []
    for i, raw_char in enumerate(chars[:requested_count]):
        c = raw_char if isinstance(raw_char, dict) else {}
        name = str(c.get("name") or "").strip() or f"Friend {i + 1}"
        personality = str(c.get("personality") or "").strip() or "Practical and cautious about new plans."
        relationship_blurb = str(c.get("relationship_blurb") or "").strip() or "You know each other through the same local social circle."
        resistance_level = clamp_resistance(c.get("resistance_level"))
        avatar_color_from = c.get("avatar_color_from")
        avatar_color_to = c.get("avatar_color_to")
        if not is_valid_hex_color(avatar_color_from) or not is_valid_hex_color(avatar_color_to):
            avatar_color_from, avatar_color_to = DEFAULT_COLOR_PAIRS[i % len(DEFAULT_COLOR_PAIRS)]

        normalized.append(GeneratedCharacter(
            name=name,
            personality=personality,
            relationship_blurb=relationship_blurb,
            resistance_level=resistance_level,
            avatar_color_from=avatar_color_from,
            avatar_color_to=avatar_color_to,
        ))

    while len(normalized) < requested_count:
        i = len(normalized)
        color_from, color_to = DEFAULT_COLOR_PAIRS[i % len(DEFAULT_COLOR_PAIRS)]
        normalized.append(GeneratedCharacter(
            name=f"Friend {i + 1}",
            personality="Friendly but unsure whether this plan fits their schedule.",
            relationship_blurb="You know each other through the same local social circle.",
            resistance_level=clamp_resistance(None),
            avatar_color_from=color_from,
            avatar_color_to=color_to,
        ))

    return GenerateCharactersResponse(characters=normalized)
