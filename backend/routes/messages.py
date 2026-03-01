import asyncio
import os

from dotenv import load_dotenv
from fastapi import APIRouter
from mistral_chat_game.models import (
    CharacterResponse,
    GameState,
    SingleCharacterRequest,
    TurnResponse,
)
from mistralai import Mistral

load_dotenv()

router = APIRouter()
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])


def build_character_prompt(character, goal: str, conversation: list) -> list:
    history = "\n".join(
        f"{'User' if m.role == 'user' else m.character}: {m.content}"
        for m in conversation
    )
    return [
        {
            "role": "system",
            "content": (
                f"You are {character.name} in a group chat. {character.personality} "
                f"Someone is trying to convince you to: {goal}. "
                f"Your resistance level is {character.resistance_level} out of 1.0 — "
                f"the higher it is, the harder you are to convince. "
                f"Reply in 1-2 short casual sentences like a real text message. "
                f"Never break character. At the end of your reply add exactly: "
                f"[CONVINCED:true] or [CONVINCED:false]"
            ),
        },
        {"role": "user", "content": f"Conversation so far:\n{history}"},
    ]


async def get_character_response(
    character, goal: str, conversation: list
) -> CharacterResponse:
    messages = build_character_prompt(character, goal, conversation)
    response = client.chat.complete(
        model="mistral-large-latest",
        messages=messages,
        max_tokens=120,
    )
    raw = response.choices[0].message.content
    convinced = "[CONVINCED:true]" in raw
    clean = raw.replace("[CONVINCED:true]", "").replace("[CONVINCED:false]", "").strip()

    return CharacterResponse(
        character=character.name,
        message=clean,
        convinced=convinced,
        resistance_level=character.resistance_level,
    )


@router.post("/message", response_model=TurnResponse)
async def send_message(state: GameState) -> TurnResponse:
    responses = await asyncio.gather(
        *[
            get_character_response(c, state.level.goal_description, state.conversation)
            for c in state.level.characters
        ]
    )
    all_convinced = all(r.convinced for r in responses)
    return TurnResponse(
        responses=list(responses),
        all_convinced=all_convinced,
        game_over=all_convinced or state.time_remaining <= 0,
    )


@router.post("/message/character", response_model=CharacterResponse)
async def single_character_message(req: SingleCharacterRequest) -> CharacterResponse:
    response = await get_character_response(req.character, req.goal, req.conversation)
    return response
