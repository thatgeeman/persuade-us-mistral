import { useState, useRef } from "react"
import ChatGame from "./components/ChatGame"
import Leaderboard from "./components/Leaderboard"
import HowToPlay from "./components/HowToPlay"
import PlayerSetup from "./components/PlayerSetup"

const API = "http://localhost:8000"


export default function App() {
  const [tab, setTab] = useState("game")
  const [classic, setClassic] = useState(false)
  const [player, setPlayer] = useState(null)
  const [currentLevel, setCurrentLevel] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [gameCode, setGameCode] = useState(null)
  const [gameReady, setGameReady] = useState(false)
  const chatRef = useRef(null)

  async function handlePlayerConfirm(playerInfo) {
    try {
      const res = await fetch(`${API}/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_name: playerInfo.playerName,
          player_type: playerInfo.playerType,
          llm_model: playerInfo.llmModel,
        }),
      })
      const data = await res.json()
      setSessionId(data.session_id)
      setPlayer(playerInfo)
      setGameCode(data.game_code)
      // focus the message input after a short delay to let the UI settle
      setTimeout(() => chatRef.current?.focus(), 150)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleLevelComplete(levelNumber, timeSpentS) {
    if (!sessionId) return
    await fetch(`${API}/session/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        max_level: levelNumber,
        time_spent_s: timeSpentS,
      }),
    }).catch(console.error)
  }

  const tabStyle = (t) => ({
    padding: "8px 20px",
    borderRadius: "10px",
    border: "none",
    background: tab === t ? "rgba(255,255,255,0.1)" : "transparent",
    color: tab === t ? "#fff" : "rgba(255,255,255,0.4)",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
    cursor: "pointer",
    transition: "all 0.2s ease",
    letterSpacing: "0.04em",
  })

  return (
    <div style={{
      minHeight: "100vh",
      background: classic
        ? "radial-gradient(ellipse at top, #2a5d9f 0%, #0d1f3c 100%)"
        : "radial-gradient(ellipse at top, #24324f 0%, #121a2d 100%)",
      transition: "background 0.4s ease",
    }}>


      {/* Top nav */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 32px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontWeight: "800",
          color: "#fff",
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          letterSpacing: "0.02em",
        }}>
          <span style={{ fontSize: "30px", lineHeight: 1 }}>🤝</span>
          <span style={{ fontSize: "20px", lineHeight: 1 }}>PersuadeUs</span>
        </div>

        <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "4px" }}>
          <button onClick={() => setTab("game")} style={tabStyle("game")}>Play</button>
          <button onClick={() => setTab("leaderboard")} style={tabStyle("leaderboard")}>Leaderboard</button>
          <button onClick={() => setTab("how-to-play")} style={tabStyle("how-to-play")}>How to Play</button>
        </div>

        {/* Classic toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            fontSize: "11px", fontWeight: "600", letterSpacing: "0.06em",
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            color: !classic ? "#fff" : "rgba(255,255,255,0.35)",
            transition: "color 0.3s ease",
          }}>MODERN</span>
          <div onClick={() => setClassic(c => !c)} style={{
            width: "40px", height: "22px",
            background: classic ? "#007aff" : "#3a3a3c",
            borderRadius: "11px", position: "relative", cursor: "pointer",
            transition: "background 0.3s ease",
          }}>
            <div style={{
              position: "absolute", top: "2px",
              left: classic ? "20px" : "2px",
              width: "18px", height: "18px", borderRadius: "50%",
              background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              transition: "left 0.25s ease",
            }} />
          </div>
          <span style={{
            fontSize: "11px", fontWeight: "600", letterSpacing: "0.06em",
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            color: classic ? "#fff" : "rgba(255,255,255,0.35)",
            transition: "color 0.3s ease",
          }}>CLASSIC</span>
        </div>
      </div>

      {/* Game tab — always mounted so state survives tab switches */}
      <div style={{
        display: tab === "game" ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        padding: "40px 24px",
        minHeight: "calc(100vh - 65px)",
        flexWrap: "wrap",
      }}>
          <div style={{
            width: "260px",
            background: classic ? "rgba(42,93,159,0.35)" : "rgba(15,23,41,0.55)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            backdropFilter: "blur(20px)",
            alignSelf: "center",
          }}>
            <div>
              <div style={{
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.45)",
                fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>
                Group members
              </div>
              <div style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.7)",
                fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              }}>
                Who you're trying to persuade
              </div>
            </div>

            {!currentLevel?.characters?.length && (
              <div style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.4)",
                fontFamily: "'SF Pro Text', -apple-system, sans-serif",
              }}>
                Loading characters...
              </div>
            )}

            {currentLevel?.characters?.map((character) => (
              <div key={character.name} style={{
                padding: "10px 12px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
              }}>
                <div style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#fff",
                  fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                  marginBottom: "4px",
                }}>
                  {character.name}
                </div>
                <div style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.65)",
                  fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                  lineHeight: "1.45",
                }}>
                  {character.relationship_blurb || character.personality}
                </div>
              </div>
            ))}
          </div>

          <ChatGame
            ref={chatRef}
            classic={classic}
            player={player}
            onLevelComplete={handleLevelComplete}
            onReady={() => setGameReady(true)}
            onLevelLoaded={setCurrentLevel}
          />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <div style={{ visibility: player ? "hidden" : "visible", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <span style={{
                fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.45)",
                fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                textTransform: "uppercase",
              }}>Start here</span>
              <span style={{ fontSize: "18px", color: "rgba(255,255,255,0.35)", lineHeight: 1 }}>↓</span>
            </div>
            <PlayerSetup
              onConfirm={handlePlayerConfirm}
              classic={classic}
              lockedPlayer={player}
              gameCode={gameCode}
            />
          </div>
      </div>

      {tab === "leaderboard" && <Leaderboard />}
      {tab === "how-to-play" && <HowToPlay />}

      <div style={{
        width: "100%",
        padding: "14px 20px 18px",
        textAlign: "center",
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
          <span>Powered by</span>
          <a
            href="https://mistral.ai"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              color: "rgba(255,165,70,0.8)", textDecoration: "none", fontWeight: "600",
              fontSize: "11px", letterSpacing: "0.02em",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="0" y="0" width="8" height="8" /><rect x="8" y="0" width="8" height="8" /><rect x="16" y="0" width="8" height="8" />
              <rect x="8" y="8" width="8" height="8" /><rect x="0" y="16" width="8" height="8" /><rect x="16" y="16" width="8" height="8" />
            </svg>
            Mistral AI
          </a>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <a
            href="https://huggingface.co"
            target="_blank"
            rel="noreferrer"
            style={{
              color: "rgba(255,198,80,0.7)", textDecoration: "none", fontWeight: "600",
              fontSize: "11px", letterSpacing: "0.02em",
            }}
          >
            🤗 Hugging Face
          </a>
        </div>
        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.22)", letterSpacing: "0.02em" }}>
          Copyright © 2026 PersuadeUs. All rights reserved.
        </div>
      </div>
    </div>
  )
}
