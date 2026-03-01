import { useState, useEffect } from "react"

const API = "http://localhost:8000"

const INPUT_STYLE = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    padding: "9px 12px",
    color: "#fff",
    fontSize: "16px",
    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
    outline: "none",
    boxSizing: "border-box",
}

const LABEL_STYLE = {
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
    marginBottom: "6px",
    display: "block",
}

export default function PlayerSetup({ onConfirm, classic, gameCode }) {
    const [playerType, setPlayerType] = useState("human")
    const [playerName, setPlayerName] = useState("")
    const [selectedModel, setSelectedModel] = useState("")
    const [availableModels, setAvailableModels] = useState([])
    const [customModel, setCustomModel] = useState("")
    const [customToken, setCustomToken] = useState("")
    const [checkingCustomModel, setCheckingCustomModel] = useState(false)
    const [customModelError, setCustomModelError] = useState("")
    const [confirmedName, setConfirmedName] = useState(null)
    const [ageVerified, setAgeVerified] = useState(false)

    useEffect(() => {
        fetch(`${API}/player/llm-models`)
            .then(r => r.json())
            .then(d => {
                setAvailableModels(d.models)
                setSelectedModel(d.models?.[0] || "")
            })
            .catch(() => { })
    }, [])

    const customModelValid = /^[^/\s]+\/[^/\s]+$/.test(customModel.trim())
    const effectiveModel = selectedModel === "__other__" ? customModel.trim() : selectedModel

    const canConfirm = playerType === "llm"
        ? !!effectiveModel && (
            selectedModel !== "__other__"
            || (customModelValid && customToken.trim().length > 0)
        )
        : playerName.trim().length >= 2 && ageVerified

    async function handleConfirm() {
        if (!canConfirm || confirmedName) return
        const llmModel = playerType === "llm" ? effectiveModel : null
        if (playerType === "llm" && selectedModel === "__other__") {
            setCheckingCustomModel(true)
            setCustomModelError("")
            try {
                const res = await fetch(`${API}/player/llm-model-check`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: llmModel,
                        api_token: customToken.trim(),
                    }),
                })
                const data = await res.json()
                if (!res.ok || !data?.reachable) {
                    setCustomModelError("Not reachable. Check model ID and API token.")
                    setCheckingCustomModel(false)
                    return
                }
            } catch {
                setCustomModelError("Not reachable. Check model ID and API token.")
                setCheckingCustomModel(false)
                return
            }
            setCheckingCustomModel(false)
        }
        const name = playerType === "human" ? playerName.trim() : (llmModel?.split("/").pop() || "YOLO")
        onConfirm({
            playerType,
            playerName: name,
            llmModel,
            llmApiToken: playerType === "llm" ? customToken.trim() || null : null,
        })
        setConfirmedName(name)
    }

    const bg = classic
        ? "rgba(42,93,159,0.4)"
        : "rgba(15,23,41,0.6)"

    return (
        <div style={{
            width: "284px",
            background: bg,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "24px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            backdropFilter: "blur(20px)",
            alignSelf: "center",
        }}>
            <div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#fff", fontFamily: "'SF Pro Text', -apple-system, sans-serif", marginBottom: "4px" }}>
                    Who's playing?
                </div>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
                    Set up before starting
                </div>
            </div>

            <div style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
                padding: "10px 10px 9px",
                display: "grid",
                gap: "4px",
            }}>
                <div style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                    marginBottom: "2px",
                }}>
                    Quick guide
                </div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)", fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>1. Pick 🏂 Human or 🦀 YOLO.</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)", fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>2. Read the mission: persuade everyone to agree.</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)", fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>3. Convince every member before the timer ends.</div>
            </div>

            {gameCode && (
                <div style={{
                    textAlign: "center", marginTop: "12px",
                    fontSize: "13px", color: "rgba(255,255,255,0.3)",
                    fontFamily: "monospace", letterSpacing: "0.1em",
                }}>
                    {confirmedName} (Game #{gameCode})
                </div>
            )}

            {/* Player type toggle */}
            <div>
                <span style={LABEL_STYLE}>Player type</span>
                <div style={{ display: "flex", gap: "6px" }}>
                    {["human", "llm"].map(type => (
                        <button key={type} onClick={() => !confirmedName && setPlayerType(type)} style={{
                            flex: 1,
                            padding: "7px 0",
                            borderRadius: "8px",
                            border: playerType === type ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
                            background: playerType === type ? "rgba(255,255,255,0.12)" : "transparent",
                            color: playerType === type ? (confirmedName ? "rgba(255,255,255,0.4)" : "#fff") : "rgba(255,255,255,0.4)",
                            fontSize: "14px",
                            fontWeight: "600",
                            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                            cursor: confirmedName ? "default" : "pointer",
                            transition: "all 0.2s ease",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            opacity: confirmedName && playerType !== type ? 0.3 : 1,
                        }}>
                            {type === "human" ? "🏂 Human" : "🦀 YOLO"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Human name input */}
            {playerType === "human" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div>
                        <span style={LABEL_STYLE}>Your name</span>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={playerName}
                            onChange={e => setPlayerName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleConfirm()}
                            maxLength={30}
                            disabled={!!confirmedName}
                            style={{ ...INPUT_STYLE, opacity: confirmedName ? 0.4 : 1, cursor: confirmedName ? "default" : "text" }}
                        />
                    </div>
                    <label style={{
                        display: "flex", alignItems: "flex-start", gap: "8px",
                        cursor: confirmedName ? "default" : "pointer",
                        opacity: confirmedName ? 0.4 : 1,
                    }}>
                        <input
                            type="checkbox"
                            checked={ageVerified}
                            onChange={e => !confirmedName && setAgeVerified(e.target.checked)}
                            disabled={!!confirmedName}
                            style={{ marginTop: "2px", flexShrink: 0, accentColor: "#007aff" }}
                        />
                        <span style={{
                            fontSize: "12px", color: "rgba(255,255,255,0.4)",
                            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                            lineHeight: "1.5",
                        }}>
                            I confirm I am 18 years of age or older. This game is intended for a mature audience.
                        </span>
                    </label>
                </div>
            )}

            {/* LLM model selector */}
            {playerType === "llm" && (
                <div>
                    <span style={LABEL_STYLE}>Model</span>
                    <select
                        value={selectedModel}
                        onChange={e => setSelectedModel(e.target.value)}
                        disabled={!!confirmedName}
                        style={{ ...INPUT_STYLE, cursor: confirmedName ? "default" : "pointer", opacity: confirmedName ? 0.4 : 1 }}
                    >
                        {availableModels.map(m => (
                            <option key={m} value={m} style={{ background: "#1a1a2e", color: "#fff" }}>
                                {m.split("/").pop()}
                            </option>
                        ))}
                        <option value="__other__" style={{ background: "#1a1a2e", color: "#fff" }}>
                            Other (🤗HuggingFace)
                        </option>
                    </select>
                    {selectedModel === "__other__" && (
                        <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <input
                                type="text"
                                placeholder="Model ID (e.g. Qwen/Qwen3.5-35B-A3B)"
                                value={customModel}
                                onChange={e => { setCustomModel(e.target.value); setCustomModelError("") }}
                                disabled={!!confirmedName}
                                style={{
                                    ...INPUT_STYLE,
                                    opacity: confirmedName ? 0.4 : 1,
                                    border: customModel && !customModelValid
                                        ? "1px solid rgba(248,113,113,0.9)"
                                        : INPUT_STYLE.border,
                                }}
                            />
                            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
                                Find conversational model IDs on <a href="https://huggingface.co/models?pipeline_tag=text-generation&inference_provider=groq,novita,cerebras,sambanova,nscale,fal-ai,hyperbolic,together,fireworks-ai,featherless-ai,zai-org,replicate,cohere,scaleway,publicai,ovhcloud,hf-inference,wavespeed&other=conversational&sort=trending" target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", textDecoration: "underline" }}>HF Hub</a>.
                            </div>
                            <input
                                type="password"
                                placeholder="Hugging Face API Token"
                                value={customToken}
                                onChange={e => { setCustomToken(e.target.value); setCustomModelError("") }}
                                disabled={!!confirmedName}
                                style={{ ...INPUT_STYLE, opacity: confirmedName ? 0.4 : 1 }}
                            />
                            {customModelError && (
                                <div style={{ fontSize: "12px", color: "rgba(248,113,113,0.95)", fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
                                    {customModelError}
                                </div>
                            )}
                            {customToken.trim().length === 0 && (
                                <div style={{ fontSize: "12px", color: "rgba(248,113,113,0.95)", fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
                                    API token is required for using other models.
                                </div>
                            )}
                            {!customModelValid && customModel.trim().length > 0 && (
                                <div style={{ fontSize: "12px", color: "rgba(248,113,113,0.95)", fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
                                    Use model id format: <code style={{ fontFamily: "monospace" }}>repo/model</code>
                                </div>
                            )}
                        </div>
                    )}
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "6px", fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
                        The AI will play on your behalf
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.58)", marginTop: "6px", lineHeight: "1.45", fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
                        🤗 YOLO-mode uses models from Hugging Face and runs inference through their Inference Providers.
                    </div>
                </div>
            )}

            {/* Confirm button */}
            <button
                onClick={handleConfirm}
                disabled={!canConfirm || !!confirmedName || checkingCustomModel}
                style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: "12px",
                    border: "none",
                    background: canConfirm && !confirmedName && !checkingCustomModel
                        ? "linear-gradient(135deg, #007aff, #0055cc)"
                        : "rgba(255,255,255,0.06)",
                    color: canConfirm && !confirmedName && !checkingCustomModel ? "#fff" : "rgba(255,255,255,0.2)",
                    fontSize: "16px",
                    fontWeight: "700",
                    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                    cursor: canConfirm && !confirmedName && !checkingCustomModel ? "pointer" : "default",
                    transition: "all 0.2s ease",
                    letterSpacing: "0.04em",
                }}
            >
                {checkingCustomModel ? "Checking..." : "Start Game"}
            </button>
        </div>
    )
}
