from typing import Literal

from pydantic import BaseModel


class Message(BaseModel):
    role: Literal["user", "assistant", "system"]
    character: str | None = None
    content: str


class Character(BaseModel):
    name: str
    personality: str
    relationship_blurb: str  # one-line relationship to the player
    resistance_level: float  # 0.0 easy, 1.0 stubborn


class Level(BaseModel):
    level_number: int
    goal_description: str
    characters: list[Character]


class GameState(BaseModel):
    level: Level
    conversation: list[Message]
    time_remaining: int


class CharacterResponse(BaseModel):
    character: str
    message: str
    convinced: bool
    resistance_level: float


class TurnResponse(BaseModel):
    responses: list[CharacterResponse]
    all_convinced: bool
    game_over: bool


class SingleCharacterRequest(BaseModel):
    character: Character
    goal: str
    conversation: list[Message]


class GenerateCharactersRequest(BaseModel):
    level_number: int
    goal_description: str
    num_characters: int = 2
    player_name: str | None = None
    player_type: Literal["human", "llm"] | None = None


class GeneratedCharacter(BaseModel):
    name: str
    personality: str
    relationship_blurb: str
    resistance_level: float
    avatar_color_from: str  # hex, e.g. "#f97316"
    avatar_color_to: str  # hex


class GenerateCharactersResponse(BaseModel):
    characters: list[GeneratedCharacter]


class GenerateLevelGoalRequest(BaseModel):
    level_number: int
    num_characters: int
    previous_goals: list[str] = []
    player_name: str | None = None
    player_type: Literal["human", "llm"] | None = None


class GenerateLevelGoalResponse(BaseModel):
    goal_short: str  # used as goal_description sent to character prompts
    goal_display: str  # shown in the GoalBanner UI
    difficulty: str  # "easy" | "medium" | "hard"
