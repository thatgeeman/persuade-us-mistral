import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import PhoneFrame from "./PhoneFrame"
import MessageBubble, { TypingRow } from "./MessageBubble"
import { GoalBanner, Timer } from "./GameOverlay"
import { ThemeContext } from "./ThemeContext"
import { exportConversationAsGif } from "../utils/exportConversationGif"

const TOTAL_SECONDS = 300
const MAX_CHARS = 140
const WIN_OVERLAY_DELAY_MS = 2500
const MAX_LEVEL = 10
const MAX_TOTAL_PARTICIPANTS = 5
const MAX_GROUP_MEMBERS = MAX_TOTAL_PARTICIPANTS - 1
const API = "http://localhost:8000"

const LLM_FUN_NAMES = ["OpenClaw", "MoltBot", "NeuralNed", "PromptBot", "SynapseBot", "LogicLlama", "ByteBot", "ThinkBot"]
function getLlmFunName(modelName) {
    const sum = [...(modelName || "")].reduce((a, c) => a + c.charCodeAt(0), 0)
    return LLM_FUN_NAMES[sum % LLM_FUN_NAMES.length]
}

function makeEnteredMsg(player, adder) {
    const name = player.playerType === "llm" ? getLlmFunName(player.playerName) : player.playerName
    return { role: "system", content: `${adder || "Someone"} added ${name} to the chat` }
}

function getNumCharactersForLevel(levelNumber) {
    // Levels 1-4: exactly 3 total participants including player => 2 other characters
    if (levelNumber <= 4) return 2
    // Levels 5-10: vary between 3-5 total participants => 2-4 other characters
    const totalParticipants = 3 + ((levelNumber - 5) % 3) // 3,4,5 repeating
    return Math.min(Math.max(totalParticipants - 1, 2), MAX_GROUP_MEMBERS)
}

function useAutoResize(value) {
    const ref = useRef(null)
    useEffect(() => {
        if (!ref.current) return
        ref.current.style.height = "auto"
        ref.current.style.height = `${ref.current.scrollHeight}px`
    }, [value])
    return ref
}

function ClassicStatusBar() {
    return (
        <div style={{
            height: "20px",
            background: "linear-gradient(180deg, #6d9fd8 0%, #4a7fc1 100%)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "0 8px", flexShrink: 0,
            boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.2)",
        }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#fff", fontFamily: "Helvetica Neue, Helvetica, sans-serif", textShadow: "0 -1px 0 rgba(0,0,0,0.3)" }}>Network</span>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#fff", fontFamily: "Helvetica Neue, Helvetica, sans-serif", textShadow: "0 -1px 0 rgba(0,0,0,0.3)" }}>9:41 AM</span>
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <span style={{ fontSize: "10px", color: "#fff", marginLeft: "1px", fontFamily: "Helvetica Neue, Helvetica, sans-serif", textShadow: "0 -1px 0 rgba(0,0,0,0.3)" }}>WiFi</span>
                <span style={{ fontSize: "10px", color: "#fff", marginLeft: "2px" }}>🔋</span>
            </div>
        </div>
    )
}

function ModernStatusBar() {
    return (
        <div style={{
            height: "54px", flexShrink: 0, padding: "14px 28px 0",
            display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            fontSize: "12px", fontWeight: "600", background: "#f5f7fa",
        }}>
            <span style={{ fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>9:41</span>
            <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                {/* Signal bars */}
                <svg width="18" height="11" viewBox="0 0 18 11" fill="none">
                    <rect x="0" y="5" width="4" height="6" rx="1" fill="#000" />
                    <rect x="7" y="3" width="4" height="8" rx="1" fill="#000" />
                    <rect x="14" y="0" width="4" height="11" rx="1" fill="#000" />
                </svg>
                {/* WiFi */}
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                    <circle cx="8" cy="11" r="1.6" fill="#000" />
                    <path d="M4.5 7.5 a5 5 0 0 1 7 0" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M1.5 4.5 a9 9 0 0 1 13 0" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                {/* Battery */}
                <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
                    <rect x="0.5" y="0.5" width="22" height="12" rx="3" stroke="#000" strokeWidth="1" />
                    <rect x="2" y="2" width="17" height="9" rx="1.5" fill="#000" />
                    <path d="M23.5 4.5 v4 c1.5-.5 2.2-1.1 2.2-2s-.7-1.5-2.2-2z" fill="#000" />
                </svg>
            </div>
        </div>
    )
}

function ClassicNavBar({ characters, timeRemaining, player }) {
    const playerLabel = player
        ? (player.playerType === "llm" ? `🦀 ${getLlmFunName(player.playerName)}` : `🏂 You`)
        : null
    return (
        <div style={{
            background: "linear-gradient(180deg, #548fcd 0%, #2a5d9f 100%)",
            borderBottom: "1px solid #1a4a80",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.3)",
            padding: "6px 10px",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", fontFamily: "Helvetica Neue, Helvetica, sans-serif" }}>◀ Messages</span>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff", fontFamily: "Helvetica Neue, Helvetica, sans-serif", textShadow: "0 -1px 0 rgba(0,0,0,0.3)", textAlign: "center" }}>
                {characters.map(c => c.name).join(", ")}
                {playerLabel && <span style={{ fontWeight: "400", opacity: 0.75 }}>, {playerLabel}</span>}
            </div>
            <Timer seconds={timeRemaining} totalSeconds={TOTAL_SECONDS} />
        </div>
    )
}

function ModernNavBar({ characters, timeRemaining, player }) {
    const participants = [
        ...characters.map(c => ({
            key: c.name,
            label: c.name?.[0]?.toUpperCase() || "?",
            from: c.avatar_color_from,
            to: c.avatar_color_to,
        })),
        ...(player ? [{
            key: "__player__",
            label: player.playerType === "llm" ? "AI" : "Y",
            from: player.playerType === "llm" ? "#7c3aed" : "#059669",
            to: player.playerType === "llm" ? "#4f46e5" : "#0d9488",
        }] : []),
    ]
    const slotsByCount = {
        1: [{ x: 18, y: 18, size: 12 }],
        2: [{ x: 12, y: 18, size: 10 }, { x: 24, y: 18, size: 10 }],
        3: [{ x: 18, y: 11, size: 10 }, { x: 12, y: 24, size: 10 }, { x: 24, y: 24, size: 10 }],
        4: [{ x: 12, y: 12, size: 9 }, { x: 24, y: 12, size: 9 }, { x: 12, y: 24, size: 9 }, { x: 24, y: 24, size: 9 }],
        5: [{ x: 18, y: 9, size: 8 }, { x: 10, y: 16, size: 8 }, { x: 26, y: 16, size: 8 }, { x: 13, y: 27, size: 8 }, { x: 23, y: 27, size: 8 }],
    }
    const slots = slotsByCount[Math.min(Math.max(participants.length, 1), 5)]

    return (
        <div style={{
            background: "rgba(249,249,249,0.95)", backdropFilter: "blur(20px)",
            borderBottom: "0.5px solid rgba(0,0,0,0.12)",
            padding: "8px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                    position: "relative",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "1px solid rgba(0,0,0,0.08)",
                    background: "linear-gradient(180deg, #ffffff, #f0f3f6)",
                    overflow: "hidden",
                    flexShrink: 0,
                }}>
                    {participants.map((p, i) => {
                        const slot = slots[i] || slots[slots.length - 1]
                        return (
                            <div key={p.key} style={{
                                position: "absolute",
                                left: `${slot.x}px`,
                                top: `${slot.y}px`,
                                width: `${slot.size}px`,
                                height: `${slot.size}px`,
                                transform: "translate(-50%, -50%)",
                                borderRadius: "999px",
                                background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
                                color: "#fff",
                                fontSize: `${Math.max(6, slot.size - 3)}px`,
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                                lineHeight: 1,
                                boxShadow: "0 0 0 1px rgba(255,255,255,0.85)",
                            }}>
                                {p.label}
                            </div>
                        )
                    })}
                </div>
                <div>
                    <div style={{ fontWeight: "600", fontSize: "15px", fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
                        {characters.map(c => c.name).join(", ")}
                        {player && <span style={{ fontWeight: "400", color: "#636366" }}>, {player.playerType === "llm" ? getLlmFunName(player.playerName) : "You"}</span>}
                    </div>
                    <div style={{ fontSize: "11px", color: "#8e8e93", fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>Group Chat</div>
                </div>
            </div>
            <Timer seconds={timeRemaining} totalSeconds={TOTAL_SECONDS} />
        </div>
    )
}

function ClassicInputBar({ input, setInput, onSend, onKey, loading, gameOver, inputRef }) {
    const charsLeft = MAX_CHARS - input.length
    const autoRef = useAutoResize(input)

    return (
        <div style={{
            background: "linear-gradient(180deg, #d4d4d4 0%, #b8b8b8 100%)",
            borderTop: "1px solid #999", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
            padding: "6px 8px 8px", display: "flex", alignItems: "flex-end", gap: "6px", flexShrink: 0,
        }}>
            <div style={{ flex: 1, background: "#fff", borderRadius: "14px", border: "1px solid #aaa", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15)", padding: "6px 10px", position: "relative" }}>
                <textarea
                    ref={(el) => { autoRef.current = el; if (inputRef) inputRef.current = el }}
                    rows={1}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={onKey}
                    disabled={loading || gameOver}
                    maxLength={MAX_CHARS}
                    placeholder="Type a message..."
                    style={{
                        width: "100%", border: "none", background: "transparent",
                        fontSize: "14px", fontFamily: "Helvetica Neue, Helvetica, sans-serif",
                        color: "#000", lineHeight: "1.4",
                        maxHeight: "120px", overflowY: "auto", resize: "none", outline: "none", display: "block",
                    }}
                />
                <div style={{
                    textAlign: "right", fontSize: "10px", marginTop: "2px",
                    color: charsLeft <= 10 ? "#cc0000" : charsLeft <= 20 ? "#888" : "#bbb",
                    fontFamily: "Helvetica Neue, Helvetica, sans-serif",
                    fontWeight: charsLeft <= 20 ? "600" : "400",
                    transition: "color 0.2s ease",
                }}>{charsLeft}</div>
            </div>
            <button onClick={onSend} disabled={!input.trim() || loading || gameOver} style={{
                background: input.trim() && !loading ? "linear-gradient(180deg, #6ecb4f 0%, #45b330 100%)" : "linear-gradient(180deg, #c8c8c8 0%, #aaa 100%)",
                border: input.trim() && !loading ? "1px solid #35a020" : "1px solid #999",
                borderRadius: "8px", padding: "6px 12px", fontSize: "13px", fontWeight: "700",
                fontFamily: "Helvetica Neue, Helvetica, sans-serif", color: "#fff",
                cursor: input.trim() && !loading ? "pointer" : "default",
                textShadow: "0 -1px 0 rgba(0,0,0,0.25)", flexShrink: 0, transition: "all 0.2s ease",
                marginBottom: "20px",
            }}>Send</button>
        </div>
    )
}

function ModernInputBar({ input, setInput, onSend, onKey, loading, gameOver, inputRef }) {
    const charsLeft = MAX_CHARS - input.length
    const autoRef = useAutoResize(input)

    return (
        <div style={{
            borderTop: "0.5px solid rgba(0,0,0,0.12)", padding: "8px 12px 28px",
            display: "flex", alignItems: "flex-end", gap: "8px",
            background: "rgba(249,249,249,0.95)", backdropFilter: "blur(20px)", flexShrink: 0,
        }}>
            <div style={{
                flex: 1,
                border: `1px solid ${charsLeft <= 20 ? "#f97316" : "#c7c7cc"}`,
                borderRadius: "20px", padding: "8px 14px",
                background: "#fff", transition: "border-color 0.2s ease",
            }}>
                <textarea
                    ref={(el) => { autoRef.current = el; if (inputRef) inputRef.current = el }}
                    rows={1}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={onKey}
                    disabled={loading || gameOver}
                    maxLength={MAX_CHARS}
                    placeholder="Type a message..."
                    style={{
                        width: "100%", border: "none", background: "transparent",
                        fontSize: "15px", fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                        color: "#000", lineHeight: "1.4",
                        maxHeight: "120px", overflowY: "auto", resize: "none", outline: "none", display: "block",
                    }}
                />
                <div style={{
                    textAlign: "right", fontSize: "11px", marginTop: "2px",
                    color: charsLeft <= 10 ? "#ef4444" : charsLeft <= 20 ? "#f97316" : "#c7c7cc",
                    fontWeight: charsLeft <= 20 ? "600" : "400",
                    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                    transition: "color 0.2s ease",
                }}>{charsLeft}</div>
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

function LoadingScreen({ classic, waitingForPlayer }) {
    return (
        <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            flex: 1, gap: "16px", padding: "80px 0",
            background: classic ? "linear-gradient(180deg, #dce4ee 0%, #c8d4e0 100%)" : "#f7f8fa",
        }}>
            <div style={{ fontSize: "32px", animation: waitingForPlayer ? "none" : "typingDot 1s ease-in-out infinite" }}>
                {waitingForPlayer ? "🏂" : "💬"}
            </div>
            <div style={{
                color: classic ? "rgba(0,0,0,0.52)" : "rgba(17,24,39,0.68)", fontSize: "13px",
                fontFamily: classic ? "Helvetica Neue, Helvetica, sans-serif" : "'SF Pro Text', -apple-system, sans-serif",
            }}>
                {waitingForPlayer ? "Confirm player to set up the group chat." : "Setting up your group chat..."}
            </div>
        </div>
    )
}

const ChatGame = forwardRef(function ChatGame({ classic, player, onLevelComplete, onReady, onLevelLoaded }, ref) {
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
    const [exportingGif, setExportingGif] = useState(false)
    const [gifProgress, setGifProgress] = useState(0)
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef(null)
    const inputRef = useRef(null)
    const convincedRef = useRef({})
    const previousGoalsRef = useRef([])
    const initializedRef = useRef(false)
    const conversationRef = useRef([])
    const loadingRef = useRef(false)
    const gameOverRef = useRef(false)
    const llmBusyRef = useRef(false)
    const playerRef = useRef(player)
    const personalizedForPlayerRef = useRef(null)
    const timeRemainingRef = useRef(TOTAL_SECONDS)
    const [llmThinking, setLlmThinking] = useState(false)

    // expose focus() to parent via ref
    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
    }))

    // focus input whenever level finishes loading
    useEffect(() => {
        if (!loadingLevel && level) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [loadingLevel, level])

    useEffect(() => {
        if (initializedRef.current) return
        initializedRef.current = true
    }, [])

    // Keep refs in sync with state so async callbacks always see fresh values
    useEffect(() => { conversationRef.current = conversation }, [conversation])
    useEffect(() => { loadingRef.current = loading }, [loading])
    useEffect(() => { gameOverRef.current = gameOver }, [gameOver])
    useEffect(() => { playerRef.current = player }, [player])
    useEffect(() => { timeRemainingRef.current = timeRemaining }, [timeRemaining])

    // Generate only after player confirm so scenario + characters use that player persona.
    useEffect(() => {
        if (!player) return
        const key = `${player.playerType}:${player.playerName}`
        if (personalizedForPlayerRef.current === key) return
        personalizedForPlayerRef.current = key
        generateLevel(levelNumber)
    }, [player]) // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-trigger LLM player when a level finishes loading
    useEffect(() => {
        if (!level || loadingLevel || player?.playerType !== "llm") return
        const t = setTimeout(() => llmGetAndSend(), 700)
        return () => clearTimeout(t)
    }, [level, loadingLevel, player]) // eslint-disable-line react-hooks/exhaustive-deps

    async function generateLevel(n) {
        const cappedLevel = Math.min(Math.max(n, 1), MAX_LEVEL)
        setLoadingLevel(true)
        conversationRef.current = []
        setConversation([])
        setInput("")
        setTimeRemaining(TOTAL_SECONDS)
        setTimerActive(false)
        setTyping([])
        setGameOver(false)
        setWon(false)
        setLoading(false)
        convincedRef.current = {}

        const numCharacters = getNumCharactersForLevel(cappedLevel)

        try {
            const goalRes = await fetch(`${API}/level/generate-goal`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    level_number: cappedLevel,
                    num_characters: numCharacters,
                    previous_goals: previousGoalsRef.current,
                    player_name: playerRef.current?.playerName || null,
                    player_type: playerRef.current?.playerType || null,
                }),
            })
            const goalData = await goalRes.json()
            previousGoalsRef.current = [...previousGoalsRef.current, goalData.goal_short]

            const charRes = await fetch(`${API}/characters/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    level_number: cappedLevel,
                    goal_description: goalData.goal_short,
                    num_characters: numCharacters,
                    player_name: playerRef.current?.playerName || null,
                    player_type: playerRef.current?.playerType || null,
                }),
            })
            const charData = await charRes.json()

            if (playerRef.current) {
                const enteredMsg = makeEnteredMsg(playerRef.current, charData.characters[0]?.name)
                conversationRef.current = [enteredMsg]
                setConversation([enteredMsg])
            }

            const nextLevel = {
                level_number: cappedLevel,
                goal_description: goalData.goal_short,
                goal_display: goalData.goal_display,
                difficulty: goalData.difficulty,
                characters: charData.characters,
            }
            setLevel(nextLevel)
            onLevelLoaded?.(nextLevel)
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingLevel(false)
            if (cappedLevel === 1) onReady?.()
        }
    }
    useEffect(() => {
        if (!loading && !gameOver) {
            inputRef.current?.focus()
        }
    }, [loading, gameOver])

    useEffect(() => {
        if (!timerActive || gameOver) return
        if (timeRemaining <= 0) { setGameOver(true); setWon(false); return }
        const t = setInterval(() => setTimeRemaining(s => s - 1), 1000)
        return () => clearInterval(t)
    }, [timerActive, timeRemaining, gameOver])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [conversation, typing])

    async function sendMessage(overrideText) {
        const text = overrideText !== undefined ? String(overrideText) : input.trim()
        if (!text || loadingRef.current || gameOverRef.current || text.length > MAX_CHARS || !level) return

        if (overrideText === undefined) setInput("")
        if (!timerActive) setTimerActive(true)

        const userMsg = { role: "user", character: null, content: text }
        let growingConvo = [...conversationRef.current, userMsg]
        conversationRef.current = growingConvo
        setConversation([...growingConvo])
        setLoading(true); loadingRef.current = true

        const shuffled = [...level.characters].sort(() => Math.random() - 0.5)
        let roundEnded = false

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
                conversationRef.current = growingConvo
                setConversation([...growingConvo])

                convincedRef.current[r.character] = r.convinced
                const allConvinced = level.characters.every(c => convincedRef.current[c.name] === true)

                if (allConvinced) {
                    const timeSpent = TOTAL_SECONDS - timeRemainingRef.current
                    onLevelComplete?.(level.level_number, timeSpent)
                    setTimerActive(false)
                    await new Promise(resolve => setTimeout(resolve, WIN_OVERLAY_DELAY_MS))
                    setGameOver(true); gameOverRef.current = true
                    setWon(true)
                    roundEnded = true
                    break
                }
            }
        } catch (err) {
            console.error(err)
            setTyping([])
            roundEnded = true
        } finally {
            setLoading(false); loadingRef.current = false
        }

        if (player?.playerType === "llm" && !roundEnded) {
            setTimeout(() => llmGetAndSend(), 1200)
        }
    }

    async function llmGetAndSend() {
        if (llmBusyRef.current || loadingRef.current || gameOverRef.current || !level || !player?.llmModel) return
        llmBusyRef.current = true
        setLlmThinking(true)
        try {
            const res = await fetch(`${API}/player/llm-message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: player.llmModel,
                    goal: level.goal_description,
                    conversation: conversationRef.current.map(m => ({
                        role: m.role,
                        character: m.character || null,
                        content: m.content,
                    })),
                }),
            })
            const data = await res.json()
            if (!res.ok || typeof data?.message !== "string") {
                throw new Error(data?.detail || "Failed to get YOLO message")
            }
            setLlmThinking(false)
            llmBusyRef.current = false
            await new Promise(resolve => setTimeout(resolve, 1000))
            if (!gameOverRef.current) {
                await sendMessage(data.message)
            }
        } catch (err) {
            console.error(err)
            setLlmThinking(false)
            llmBusyRef.current = false
        }
    }

    function handleKey(e) {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
    }

    function nextLevel() {
        const next = Math.min(levelNumber + 1, MAX_LEVEL)
        setLevelNumber(next)
        generateLevel(next)
    }

    function restart() {
        generateLevel(levelNumber)
    }

    const messagesBackground = classic
        ? "linear-gradient(180deg, #dce4ee 0%, #c8d4e0 100%)"
        : "#fff"
    const isMaxLevel = levelNumber >= MAX_LEVEL

    return (
        <ThemeContext.Provider value={{ classic }}>
            <style>{`
        @keyframes typingDot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes arrowBounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-6px); }
        }
        textarea:focus { outline: none; }
        textarea { resize: none; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

            {loadingLevel || !level
                ? (
                    <PhoneFrame classic={classic}>
                        {classic ? <ClassicStatusBar /> : <ModernStatusBar />}
                        <LoadingScreen classic={classic} waitingForPlayer={!player} />
                    </PhoneFrame>
                )
                : (
                    <PhoneFrame classic={classic}>
                        {classic ? <ClassicStatusBar /> : <ModernStatusBar />}

                        {classic
                            ? <ClassicNavBar characters={level.characters} timeRemaining={timeRemaining} player={player} />
                            : <ModernNavBar characters={level.characters} timeRemaining={timeRemaining} player={player} />
                        }

                        <GoalBanner goal={level.goal_display} level={level.level_number} />

                        {/* Wrapper gives overlay a fixed, non-scrolling anchor */}
                        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                            <div style={{
                                height: "100%", overflowY: "auto", padding: "12px 14px",
                                display: "flex", flexDirection: "column", gap: "2px",
                                background: messagesBackground, transition: "background 0.4s ease",
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

                                {conversation.map((msg, i) =>
                                    msg.role === "system" ? (
                                        <div key={i} style={{
                                            textAlign: "center", padding: "6px 0 2px",
                                            fontSize: "11px", color: classic ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.3)",
                                            fontFamily: classic ? "Helvetica Neue, Helvetica, sans-serif" : "'SF Pro Text', -apple-system, sans-serif",
                                        }}>{msg.content}</div>
                                    ) : <MessageBubble key={i} message={msg} />
                                )}
                                {typing.map(name => <TypingRow key={name} name={name} />)}
                                <div ref={bottomRef} />
                            </div>

                            {/* Overlay is outside the scroll so it always covers the visible area */}
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
                                        {won && !isMaxLevel && (
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
                                    {won && isMaxLevel && (
                                        <div style={{
                                            fontSize: "12px",
                                            color: "rgba(255,255,255,0.72)",
                                            fontFamily: classic ? "Helvetica Neue, Helvetica, sans-serif" : "'SF Pro Text', -apple-system, sans-serif",
                                        }}>
                                            Max level reached (Level {MAX_LEVEL})
                                        </div>
                                    )}
                                    {won && (
                                        <button
                                            disabled={exportingGif}
                                            onClick={async () => {
                                                setExportingGif(true)
                                                setGifProgress(0)
                                                await exportConversationAsGif(
                                                    conversation, level, player,
                                                    p => setGifProgress(Math.round(p))
                                                )
                                                setExportingGif(false)
                                            }}
                                            style={{
                                                background: exportingGif
                                                    ? "rgba(255,255,255,0.1)"
                                                    : "linear-gradient(135deg, #f97316 0%, #ec4899 55%, #8b5cf6 100%)",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: classic ? "10px" : "24px",
                                                padding: "9px 22px", fontSize: "13px", fontWeight: "700",
                                                cursor: exportingGif ? "default" : "pointer",
                                                fontFamily: classic ? "Helvetica Neue, Helvetica, sans-serif" : "'SF Pro Text', -apple-system, sans-serif",
                                                boxShadow: exportingGif ? "none" : "0 3px 16px rgba(236,72,153,0.45)",
                                                letterSpacing: "0.02em",
                                            }}
                                        >
                                            {exportingGif ? `Exporting… ${gifProgress}%` : "✦ Export GIF"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {!player ? (
                            <div style={{
                                borderTop: classic ? "1px solid #999" : "0.5px solid rgba(0,0,0,0.12)",
                                background: classic
                                    ? "linear-gradient(180deg, #d4d4d4 0%, #b8b8b8 100%)"
                                    : "rgba(249,249,249,0.95)",
                                padding: "12px 16px 28px",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                                flexShrink: 0,
                            }}>
                                <span style={{ fontSize: "13px" }}>⚠️</span>
                                <span style={{
                                    fontSize: "11px",
                                    color: classic ? "#666" : "rgba(0,0,0,0.4)",
                                    fontFamily: classic ? "Helvetica Neue, Helvetica, sans-serif" : "'SF Pro Text', -apple-system, sans-serif",
                                    fontWeight: "500",
                                }}>
                                    Enter your name &amp; confirm age to play.
                                </span>
                            </div>
                        ) : player.playerType === "llm" ? (
                            <div style={{
                                borderTop: classic ? "1px solid #999" : "0.5px solid rgba(0,0,0,0.12)",
                                background: classic
                                    ? "linear-gradient(180deg, #d4d4d4 0%, #b8b8b8 100%)"
                                    : "rgba(249,249,249,0.95)",
                                padding: "12px 16px 28px",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                                flexShrink: 0,
                            }}>
                                <span style={{ fontSize: "13px" }}>🦀</span>
                                <span style={{
                                    fontSize: "11px",
                                    color: classic ? "#666" : "rgba(0,0,0,0.4)",
                                    fontFamily: classic ? "Helvetica Neue, Helvetica, sans-serif" : "'SF Pro Text', -apple-system, sans-serif",
                                    fontWeight: "500",
                                }}>
                                    {llmThinking ? "Thinking…" : loading ? "Waiting for replies…" : gameOver ? "Game over" : "Playing autonomously"}
                                </span>
                            </div>
                        ) : classic
                            ? <ClassicInputBar input={input} setInput={setInput} onSend={sendMessage} onKey={handleKey} loading={loading} gameOver={gameOver} inputRef={inputRef} />
                            : <ModernInputBar input={input} setInput={setInput} onSend={sendMessage} onKey={handleKey} loading={loading} gameOver={gameOver} inputRef={inputRef} />
                        }
                    </PhoneFrame>
                )
            }
        </ThemeContext.Provider>
    )
})

export default ChatGame
