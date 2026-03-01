from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mistral_chat_game.database import init_db
from routes import characters, leaderboard, levels, messages, player

app = FastAPI()

init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(messages.router)
app.include_router(characters.router)
app.include_router(levels.router)
app.include_router(leaderboard.router)
app.include_router(player.router)
