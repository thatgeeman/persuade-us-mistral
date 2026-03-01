from datetime import datetime

from mistral_chat_game.database import Base
from sqlalchemy import Column, DateTime, Integer, String


class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True)
    player_name = Column(String, index=True, nullable=False)
    player_type = Column(String, nullable=False)  # "human" | "llm"
    llm_model = Column(String, nullable=True)  # HF model string if llm
    max_level = Column(Integer, default=1)
    total_time_s = Column(Integer, default=0)  # cumulative seconds
    created_at = Column(DateTime, default=datetime.utcnow)
