from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import characters, levels, messages

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(messages.router)
app.include_router(characters.router)
app.include_router(levels.router)
