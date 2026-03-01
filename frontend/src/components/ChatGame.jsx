import { useState, useEffect, useRef } from "react"
import PhoneFrame from "./PhoneFrame"
import MessageBubble, { TypingRow } from "./MessageBubble"
import { GoalBanner, Timer } from "./GameOverlay"
import { ThemeContext } from "./ThemeContext"

const TOTAL_SECONDS = 90
const MAX_CHARS = 140
const API = "http://localhost:8000"

const LEVEL_GOALS = [
    "Come to the house party tonight",
    "Join us for a spontaneous road trip this weekend",
    "Come watch the game at the bar tonight",
    "Try that new sushi place downtown with us",
]

function ClassicStatusBar() {
    return (
        <div style={{
            height: "20px",
            background: "linear-gradient(180deg, #6d9fd8 0%, #4a7fc1 100%)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "0 8px", flexShrink: 0,
            boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.2)",
        }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#fff", fontFamily: "Helvetica Neue, Helvetica, sans-serif", textShadow: "0 -1px 0 rgba(0,0,0,0.3)" }}>AT&T</span>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#fff", fontFamily: "Helvetica Neue, Helvetica, sans-serif", textShadow: "0 -1px 0 rgba(0,0,0,0.3)" }}>9:41 AM</span>
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                {[4, 6, 8, 10, 12].map((h, i) => (
                    <div key={i} style={{ width: "3px", height: `${h}px`, background: "#fff", borderRadius: "1px", opacity: i < 4 ? 1 : 0.4 }} />
                ))}
                <span style={{ fontSize: "10px", color: "#fff", marginLeft: "3px" }}>🔋</span>
            </div>
        </div>
    )
}

function ModernStatusBar() {
    return (
        <div style={{
            height: "54px", flexShrink: 0, padding: "14px 28px 0",
            display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            fontSize: "12px", fontWeight: "600", background: "#fff",
        }}>
            <span style={{ fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>9:41</span>
            <div style={{ display: "flex", gap: "5px", alignItems: "center", fontSize: "11px" }}>
                <span>●●●</span><span>WiFi</span><span>⬤</span>
            </div>
        </div>
    )
}

function ClassicNavBar({ characters, timeRemaining }) {
    return (
        <div style={{
            background: "linear-gradient(180deg, #548fcd 0%, #2a5d9f 100%)",
            borderBottom: "1px solid #1a4a80",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.3)",
            padding: "6px 10px",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", fontFamily: "Helvetica Neue, Helvetica, sans-serif" }}>◀ Messages</span>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff", fontFamily: "Helvetica Neue, Helvetica, sans-serif", textShadow: "0 -1px 0 rgba(0,0,0,0.3)" }}>
                {characters.map(c => c.name).join(", ")}
            </div>
            <Timer seconds={timeRemaining} totalSeconds={TOTAL_SECONDS} />
        </div>
    )
}

function ModernNavBar({ characters, timeRemaining }) {
    return (
        <div style={{
            background: "rgba(249,249,249,0.95)", backdropFilter: "blur(20px)",
            borderBottom: "0.5px solid rgba(0,0,0,0.12)",
            padding: "8px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ position: "relative", width: `${characters.length * 14 + 14}px`, height: "36px" }}>
                    {characters.map((c, i) => (
                        <div key={c.name} style={{
                            position: "absolute", left: `${i * 14}px`,
                            width: "28px", height: "28px", borderRadius: "50%",
                            background: `linear-gradient(135deg, ${c.avatar_color_from}, ${c.avatar_color_to})`,
                            border: "2px solid #f9f9f9",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontSize: "11px", fontWeight: "700", zIndex: i,
                        }}>{c.name[0]}</div>
                    ))}
                </div>
                <div>
                    <div style={{ fontWeight: "600", fontSize: "15px", fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
                        {characters.map(c => c.name).join(", ")}
                    </div>
                    <div style={{ fontSize: "11px", color: "#8e8e93", fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>iMessage</div>
                </div>
            </div>
            <Timer seconds={timeRemaining} totalSeconds={TOTAL_SECONDS} />
        </div>
    )
}

function ClassicInputBar({ input, setInput, onSend, onKey, loading, gameOver, inputRef }) {
    const charsLeft = MAX_CHARS - input.length
    const charsWarning = charsLeft <= 20
    return (
        <div style={{
            background: "linear-gradient(180deg, #d4d4d4 0%, #b8b8b8 100%)",
            borderTop: "1px solid #999", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
            padding: "6px 8px 8px", display: "flex", alignItems: "center", gap: "6px", flexShrink: 0,
        }}>
            <div style={{ flex: 1, background: "#fff", borderRadius: "14px", border: "1px solid #aaa", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15)", padding: "6px 10px", position: "relative" }}>
                <textarea
                    ref={inputRef} rows={1} value={input}
                    onChange={e => setInput(e.target.value)} onKeyDown={onKey}
                    disabled={loading || gameOver} maxLength={MAX_CHARS} placeholder="Text Message"
                    style={{ width: "100%", border: "none", background: "transparent", fontSize: "14px", fontFamily: "Helvetica Neue, Helvetica, sans-serif", color: "#000", lineHeight: "1.4", maxHeight: "70px", overflowY: "auto", resize: "none", outline: "none" }}
                />
                {charsWarning && <div style={{ position: "absolute", right: "8px", bottom: "5px", fontSize: "10px", color: charsLeft <= 0 ? "#cc0000" : "#888", fontWeight: "600" }}>{charsLeft}</div>}
            </div>
            <button onClick={onSend} disabled={!input.trim() || loading || gameOver} style={{
                background: input.trim() && !loading ? "linear-gradient(180deg, #6ecb4f 0%, #45b330 100%)" : "linear-gradient(180deg, #c8c8c8 0%, #aaa 100%)",
                border: input.trim() && !loading ? "1px solid #35a020" : "1px solid #999",
                borderRadius: "8px", padding: "6px 12px", fontSize: "13px", fontWeight: "700",
                fontFamily: "Helvetica Neue, Helvetica, sans-serif", color: "#fff",
                cursor: input.trim() && !loading ? "pointer" : "default",
                textShadow: "0 -1px 0 rgba(0,0,0,0.25)", flexShrink: 0, transition: "all 0.2s ease",
            }}>Send</button>
        </div>
    )
}

function ModernInputBar({ input, setInput, onSend, onKey, loading, gameOver, inputRef }) {
    const charsLeft = MAX_CHARS - input.length
    const charsWarning = charsLeft <= 20
    return (
        <div style={{
            borderTop: "0.5px solid rgba(0,0,0,0.12)", padding: "8px 12px 28px",
            display: "flex", alignItems: "flex-end", gap: "8px",
            background: "rgba(249,249,249,0.95)", backdropFilter: "blur(20px)", flexShrink: 0,
        }}>
            <div style={{ flex: 1, border: `1px solid ${charsWarning ? "#f97316" : "#c7c7cc"}`, borderRadius: "20px", padding: "8px 14px", background: "#fff", position: "relative", transition: "border-color 0.2s ease" }}>
                <textarea
                    ref={inputRef} rows={1} value={input}
                    onChange={e => setInput(e.target.value)} onKeyDown={onKey}
                    disabled={loading || gameOver} maxLength={MAX_CHARS} placeholder="iMessage"
                    style={{ width: "100%", border: "none", background: "transparent", fontSize: "15px", fontFamily: "'SF Pro Text', -apple-system, sans-serif", color: "#000", lineHeight: "1.4", maxHeight: "80px", overflowY: "auto", resize: "none", outline: "none" }}
                />
                {charsWarning && <div style={{ position: "absolute", right: "10px", bottom: "6px", fontSize: "10px", color: charsLeft <= 0 ? "#ef4444" : "#f97316", fontWeight: "600" }}>{charsLeft}</div>}
            </div>
            <button onClick={onSend} disabled={!input.trim() || loading || gameOver} style={{
                width: "34px", height: "34px", borderRadius: "50%",
                background: input.trim() && !loading ? "#007aff" : "#c7c7cc",
                border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "16px", flexShrink: 0, transition: "background 0.2s ease",
            }}>↑</button>
        </div>
    )
}

function LoadingScreen({ classic }) {
    return (
        <div style={{
            minHeight: "100vh", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: classic ? "radial-gradient(ellipse at top, #2a5d9f 0%, #0d1f3c 100%)" : "radial-gradient(ellipse at top, #0f1729 0%, #060810 100%)",
            gap: "16px",
        }}>
            <div style={{ fontSize: "32px", animation: "typingDot 1s ease-in-out infinite" }}>💬</div>
            <div style={{
                color: "rgba(255,255,255,0.5)", fontSize: "13px",
                fontFamily: classic ? "Helvetica Neue, Helvetica, sans-serif" : "'SF Pro Text', -apple-system, sans-serif",
            }}>
                Setting up your group chat...
            </div>
        </div>
    )
}

export default function ChatGame() {
    const [classic, setClassic] = useState(false)
    const [level, setLevel] = useState(null)
    const [levelNumber, setLevelNumber] = useState(1)
    const [loadingLevel, setLoadingLevel] = useState(true)
    const [conversation, setConversation] = useState([])
    const [input, setInput] = useState("")
    const [timeRemaining, setTimeRemaining] = useState(TOTAL_SECONDS)
    const [timerActive, setTimerActive] = useState(false)
    const [typing, setTyping] = useState([])
    const [gameOver, setGameOver] = useState(false)
    const [won, setWon] = useState(false)
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef(null)
    const inputRef = useRef(null)
    const convincedRef = useRef({})

    useEffect(() => { generateLevel(levelNumber) }, [])

    const previousGoalsRef = useRef([])

    async function generateLevel(n) {
        setLoadingLevel(true)
        // ... reset state as before ...

        const numCharacters = Math.min(2 + Math.floor((n - 1) / 2), 4)

        try {
            // Step 1 — generate the goal
            const goalRes = await fetch(`${API}/level/generate-goal`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    level_number: n,
                    num_characters: numCharacters,
                    previous_goals: previousGoalsRef.current,
                }),
            })
            const goalData = await goalRes.json()
            previousGoalsRef.current = [...previousGoalsRef.current, goalData.goal_short]

            // Step 2 — generate characters informed by the goal
            const charRes = await fetch(`${API}/characters/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    level_number: n,
                    goal_description: goalData.goal_short,
                    num_characters: numCharacters,
                }),
            })
            const charData = await charRes.json()

            setLevel({
                level_number: n,
                goal_description: goalData.goal_short,   // goes to Mistral prompts
                goal_display: goalData.goal_display,      // shown in UI
                difficulty: goalData.difficulty,
                characters: charData.characters,
            })
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingLevel(false)
        }
    }

    useEffect(() => {
        if (!timerActive || gameOver) return
        if (timeRemaining <= 0) { setGameOver(true); setWon(false); return }
        const t = setInterval(() => setTimeRemaining(s => s - 1), 1000)
        return () => clearInterval(t)
    }, [timerActive, timeRemaining, gameOver])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [conversation, typing])

    async function sendMessage() {
        const text = input.trim()
        if (!text || loading || gameOver || text.length > MAX_CHARS || !level) return

        setInput("")
        if (!timerActive) setTimerActive(true)

        const userMsg = { role: "user", character: null, content: text }
        let growingConvo = [...conversation, userMsg]
        setConversation([...growingConvo])
        setLoading(true)

        const shuffled = [...level.characters].sort(() => Math.random() - 0.5)

        try {
            for (const character of shuffled) {
                await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))
                setTyping([character.name])

                const res = await fetch(`${API}/message/character`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        character,
                        goal: level.goal_description,
                        conversation: growingConvo,
                    }),
                })

                const r = await res.json()
                setTyping([])

                const msg = {
                    role: "assistant",
                    character: r.character,
                    content: r.message,
                    colorFrom: character.avatar_color_from,
                    colorTo: character.avatar_color_to,
                }
                growingConvo = [...growingConvo, msg]
                setConversation([...growingConvo])

                convincedRef.current[r.character] = r.convinced
                const allConvinced = level.characters.every(c => convincedRef.current[c.name] === true)

                if (allConvinced) {
                    setGameOver(true)
                    setWon(true)
                    setTimerActive(false)
                    break
                }
            }
        } catch (err) {
            console.error(err)
            setTyping([])
        } finally {
            setLoading(false)
            inputRef.current?.focus()
        }
    }

    function handleKey(e) {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
    }

    function nextLevel() {
        const next = levelNumber + 1
        setLevelNumber(next)
        generateLevel(next)
    }

    function restart() {
        generateLevel(levelNumber)
    }

    if (loadingLevel || !level) return <LoadingScreen classic={classic} />

    const messagesBackground = classic
        ? "linear-gradient(180deg, #dce4ee 0%, #c8d4e0 100%)"
        : "#fff"

    return (
        <ThemeContext.Provider value={{ classic }}>
            <div style={{
                minHeight: "100vh",
                background: classic
                    ? "radial-gradient(ellipse at top, #2a5d9f 0%, #0d1f3c 100%)"
                    : "radial-gradient(ellipse at top, #0f1729 0%, #060810 100%)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "40px 20px", transition: "background 0.4s ease",
            }}>
                <style>{`
          @keyframes typingDot {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.1); }
          }
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          textarea:focus { outline: none; }
          textarea { resize: none; }
          ::-webkit-scrollbar { width: 0; }
        `}</style>

                {/* Toggle */}
                <div style={{
                    display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px",
                    background: "rgba(255,255,255,0.07)", borderRadius: "20px", padding: "8px 18px",
                    border: "1px solid rgba(255,255,255,0.1)",
                }}>
                    <span style={{ fontSize: "12px", fontWeight: "600", letterSpacing: "0.04em", transition: "color 0.3s ease", color: !classic ? "#fff" : "rgba(255,255,255,0.45)" }}>MODERN</span>
                    <div onClick={() => setClassic(c => !c)} style={{
                        width: "48px", height: "26px",
                        background: classic ? "#007aff" : "#3a3a3c",
                        borderRadius: "13px", position: "relative", cursor: "pointer",
                        transition: "background 0.3s ease", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
                    }}>
                        <div style={{
                            position: "absolute", top: "3px", left: classic ? "25px" : "3px",
                            width: "20px", height: "20px", borderRadius: "50%",
                            background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.35)", transition: "left 0.25s ease",
                        }} />
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: "600", letterSpacing: "0.04em", transition: "color 0.3s ease", color: classic ? "#fff" : "rgba(255,255,255,0.45)" }}>CLASSIC</span>
                </div>

                <PhoneFrame classic={classic}>
                    {classic ? <ClassicStatusBar /> : <ModernStatusBar />}

                    {classic
                        ? <ClassicNavBar characters={level.characters} timeRemaining={timeRemaining} />
                        : <ModernNavBar characters={level.characters} timeRemaining={timeRemaining} />
                    }

                    <GoalBanner goal={level.goal_display} level={level.level_number} />

                    <div style={{
                        flex: 1, overflowY: "auto", padding: "12px 14px",
                        display: "flex", flexDirection: "column", gap: "2px",
                        background: messagesBackground, transition: "background 0.4s ease", position: "relative",
                    }}>
                        {conversation.length === 0 && (
                            <div style={{
                                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                                flexDirection: "column", gap: "6px",
                                color: classic ? "#6d6d72" : "#c7c7cc",
                                fontSize: classic ? "13px" : "14px",
                                fontFamily: classic ? "Helvetica Neue, Helvetica, sans-serif" : "'SF Pro Text', -apple-system, sans-serif",
                                textAlign: "center", padding: "20px",
                            }}>
                                <span>Say something to start.</span>
                                <span style={{ fontSize: "11px", opacity: 0.7 }}>Timer starts on your first message.</span>
                            </div>
                        )}

                        {conversation.map((msg, i) => <MessageBubble key={i} message={msg} />)}
                        {typing.map(name => <TypingRow key={name} name={name} />)}

                        {gameOver && (
                            <div style={{
                                position: "absolute", inset: 0,
                                background: won
                                    ? (classic ? "rgba(69,179,48,0.93)" : "rgba(0,200,83,0.92)")
                                    : "rgba(20,20,20,0.92)",
                                display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center", gap: "14px",
                                animation: "fadeSlideIn 0.4s ease", zIndex: 20,
                            }}>
                                <div style={{ fontSize: "52px" }}>{won ? "🎉" : "⏱️"}</div>
                                <div style={{
                                    fontSize: "22px", fontWeight: "700", color: "#fff", textAlign: "center",
                                    fontFamily: classic ? "Helvetica Neue, Helvetica, sans-serif" : "'SF Pro Text', -apple-system, sans-serif",
                                }}>
                                    {won ? "They're in!" : "Time's up!"}
                                </div>
                                <div style={{
                                    fontSize: "13px", color: "rgba(255,255,255,0.7)",
                                    textAlign: "center", padding: "0 28px", lineHeight: "1.5",
                                    fontFamily: classic ? "Helvetica Neue, Helvetica, sans-serif" : "'SF Pro Text', -apple-system, sans-serif",
                                }}>
                                    {won ? `Level ${levelNumber} cleared.` : "Couldn't seal the deal in time."}
                                </div>
                                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                                    <button onClick={restart} style={{
                                        background: "rgba(255,255,255,0.15)", color: "#fff",
                                        border: "1px solid rgba(255,255,255,0.3)",
                                        borderRadius: classic ? "10px" : "24px",
                                        padding: "9px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
                                        fontFamily: classic ? "Helvetica Neue, Helvetica, sans-serif" : "'SF Pro Text', -apple-system, sans-serif",
                                    }}>Try again</button>
                                    {won && (
                                        <button onClick={nextLevel} style={{
                                            background: classic ? "linear-gradient(180deg, #6ecb4f 0%, #45b330 100%)" : "#fff",
                                            color: classic ? "#fff" : "#00c853",
                                            border: classic ? "1px solid #35a020" : "none",
                                            borderRadius: classic ? "10px" : "24px",
                                            padding: "9px 20px", fontSize: "14px", fontWeight: "700", cursor: "pointer",
                                            fontFamily: classic ? "Helvetica Neue, Helvetica, sans-serif" : "'SF Pro Text', -apple-system, sans-serif",
                                        }}>Next level →</button>
                                    )}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {classic
                        ? <ClassicInputBar input={input} setInput={setInput} onSend={sendMessage} onKey={handleKey} loading={loading} gameOver={gameOver} inputRef={inputRef} />
                        : <ModernInputBar input={input} setInput={setInput} onSend={sendMessage} onKey={handleKey} loading={loading} gameOver={gameOver} inputRef={inputRef} />
                    }
                </PhoneFrame>
            </div>
        </ThemeContext.Provider>
    )
}