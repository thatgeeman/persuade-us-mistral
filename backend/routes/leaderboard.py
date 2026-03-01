from fastapi import APIRouter, Depends, Query
from mistral_chat_game.database import GameSession, get_db
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter()


class SessionStartRequest(BaseModel):
    player_name: str
    player_type: str
    llm_model: str | None = None


class SessionStartResponse(BaseModel):
    session_id: int
    game_code: str


class SessionUpdateRequest(BaseModel):
    session_id: int
    max_level: int
    time_spent_s: int


class LeaderboardEntry(BaseModel):
    rank: int
    game_code: str
    player_name: str
    player_type: str
    llm_model: str | None
    max_level: int
    total_time_s: int
    created_at: str


class LeaderboardResponse(BaseModel):
    entries: list[LeaderboardEntry]
    total: int
    page: int
    page_size: int
    total_pages: int


def make_game_code(session_id: int) -> str:
    return f"#{str(session_id).zfill(4)}"


@router.post("/session/start", response_model=SessionStartResponse)
def start_session(req: SessionStartRequest, db: Session = Depends(get_db)):
    session = GameSession(
        player_name=req.player_name,
        player_type=req.player_type,
        llm_model=req.llm_model,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return SessionStartResponse(
        session_id=session.id,
        game_code=make_game_code(session.id),
    )


@router.post("/session/update")
def update_session(req: SessionUpdateRequest, db: Session = Depends(get_db)):
    session = db.query(GameSession).filter(GameSession.id == req.session_id).first()
    if not session:
        return {"error": "Session not found"}
    if req.max_level > session.max_level:
        session.max_level = req.max_level
    # Fast clears can report 0s from the UI timer; store at least 1s per cleared level.
    session.total_time_s += max(1, int(req.time_spent_s))
    db.commit()
    return {"ok": True}


@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(
    search: str = Query(default=""),
    player_type: str = Query(default=""),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, le=50),
    db: Session = Depends(get_db),
):
    q = db.query(GameSession).filter(GameSession.total_time_s > 0)
    if search:
        q = q.filter(GameSession.player_name.ilike(f"%{search}%"))
    if player_type in ("human", "llm"):
        q = q.filter(GameSession.player_type == player_type)

    total = q.count()
    total_pages = max(1, -(-total // page_size))

    entries_db = (
        q.order_by(GameSession.max_level.desc(), GameSession.total_time_s.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    base_rank = (page - 1) * page_size + 1
    entries = [
        LeaderboardEntry(
            rank=base_rank + i,
            game_code=make_game_code(e.id),
            player_name=e.player_name,
            player_type=e.player_type,
            llm_model=e.llm_model,
            max_level=e.max_level,
            total_time_s=e.total_time_s,
            created_at=e.created_at.strftime("%Y-%m-%d"),
        )
        for i, e in enumerate(entries_db)
    ]

    return LeaderboardResponse(
        entries=entries,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )
