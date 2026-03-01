# 🤝PersuadeUs

🤝PersuadeUs is a social-persuasion chat game.  
You are placed in a group chat scenario and must convince each member to agree with a mission before the timer expires.

## What It Is

- AI-powered group chat simulation
- Human mode (you type) and YOLO mode (LLM plays)
- Progressive levels with changing social context
- Character relationship blurbs and personality-driven responses
- Leaderboard and GIF export

## Technologies Used

### Backend

- Python 3.13
- FastAPI
- Uvicorn
- Pydantic
- SQLAlchemy 
- Mistral AI Python SDK (`mistralai`)
- Hugging Face Hub / Inference Providers

### Frontend

- React
- React DOM
- Vite 
- `gifenc`

## How To Play (Same Core Guide)

Social persuasion is part of daily life: inviting, negotiating, repairing, and coordinating.  
This game is a low-stakes way to practice those skills with feedback every round.

### Core Loop

1. Choose mode: Human (you type) or YOLO (model plays).
2. Read the level goal and each person’s relationship context.
3. Send one persuasive message at a time.
4. Watch replies and adjust your next message.
5. Win by convincing everyone before the timer expires.

### Practical Tips

- Lead with shared benefit, not only your own goal.
- Address objections directly (time, money, effort, social comfort).
- Match tone to relationship: coworker, cousin, mentor, priest, etc.
- Keep messages concise; one clear ask beats long paragraphs.
- Use replies as signals and iterate instead of repeating the same pitch.

### Why This Works

- The game models social behavior as feedback loops: message, reaction, adjustment.
- That aligns with social learning research: repeated practice with immediate feedback improves performance.
- You train perspective-taking, framing, and timing, which transfer to real conversations.
- Think of each level as a mini experiment in everyday influence and communication.

### Licenses, Attribution, and Libraries

- Licenses are respected and remain with their original owners; third-party libraries keep their own license terms.
- This project uses GNU AGPL v3.0. Full text: https://www.gnu.org/licenses/agpl-3.0.en.html#license-text
- Backend libraries: FastAPI, Uvicorn, SQLAlchemy, Pydantic, Python Dotenv, Mistral AI SDK, Hugging Face Hub.
- Frontend libraries: React, React DOM, Mistral JS SDK, gifenc, Vite.
- Inference attribution: YOLO mode uses Hugging Face Inference Providers for hosted model inference.
- Throwback attribution: YOLO mode includes an OpenClaw throwback to its creator.

## Project Structure

```text
backend/   FastAPI server, AI routes, DB models
frontend/  React app, game UI, leaderboard, GIF export
```

## How To Run

## 1) Backend

From repo root:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -e .
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Environment variable needed:

```bash
MISTRAL_API_KEY=...
```

Optional for YOLO model inference:

```bash
HF_TOKEN=...
```

## 2) Frontend

From repo root:

```bash
cd frontend
npm install
npm run dev
```

Default frontend URL:

- http://localhost:5173

Backend API URL used in app:

- http://localhost:8000

## License

This repository is licensed under AGPL-3.0.  
See the [LICENSE](./LICENSE) file for full terms.
