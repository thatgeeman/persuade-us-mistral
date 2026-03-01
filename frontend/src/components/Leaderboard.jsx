import { useState, useEffect, useCallback } from "react"

const API = "http://localhost:8000"

function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    if (m === 0) return `${s}s`
    return `${m}m ${s}s`
}

const TH = ({ children, style = {} }) => (
    <th style={{
        padding: "10px 14px",
        textAlign: "left",
        fontSize: "12px",
        fontWeight: "700",
        letterSpacing: "0.1em",
        color: "rgba(255,255,255,0.4)",
        textTransform: "uppercase",
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        whiteSpace: "nowrap",
        ...style,
    }}>{children}</th>
)

const TD = ({ children, style = {} }) => (
    <td style={{
        padding: "12px 14px",
        fontSize: "16px",
        color: "#e2e8f0",
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        ...style,
    }}>{children}</td>
)

function RankBadge({ rank }) {
    const medals = { 1: "🥇", 2: "🥈", 3: "🥉" }
    if (medals[rank]) return <span style={{ fontSize: "19px" }}>{medals[rank]}</span>
    return <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "16px" }}>#{rank}</span>
}

function GameCodeBadge({ code }) {
    return (
        <span style={{
            fontFamily: "monospace",
            fontSize: "14px",
            fontWeight: "700",
            color: "rgba(255,255,255,0.35)",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "6px",
            padding: "2px 8px",
            letterSpacing: "0.06em",
        }}>
            {code}
        </span>
    )
}

function PlayerTypeBadge({ type, model }) {
    const isLLM = type === "llm"
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            background: isLLM ? "rgba(139,92,246,0.2)" : "rgba(16,185,129,0.2)",
            border: `1px solid ${isLLM ? "rgba(139,92,246,0.3)" : "rgba(16,185,129,0.3)"}`,
            borderRadius: "6px",
            padding: "2px 8px",
            fontSize: "13px",
            color: isLLM ? "#a78bfa" : "#34d399",
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            fontWeight: "600",
        }}>
            {isLLM ? "🦀" : "🏂"} {isLLM && model ? model.split("/").pop() : "Human"}
        </span>
    )
}

export default function Leaderboard() {
    const [entries, setEntries] = useState([])
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [playerFilter, setPlayerFilter] = useState("all")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 300)
        return () => clearTimeout(t)
    }, [search])

    // Reset page when filter changes
    useEffect(() => { setPage(1) }, [playerFilter])

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ search: debouncedSearch, page, page_size: 50 })
            if (playerFilter !== "all") params.set("player_type", playerFilter)
            const res = await fetch(`${API}/leaderboard?${params}`)
            const data = await res.json()
            setEntries(data.entries)
            setTotalPages(data.total_pages)
            setTotal(data.total)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [debouncedSearch, playerFilter, page])

    useEffect(() => { fetchLeaderboard() }, [fetchLeaderboard])

    return (
        <div style={{ width: "100%", maxWidth: "960px", margin: "0 auto", padding: "40px 24px" }}>

            {/* Header */}
            <div style={{ marginBottom: "28px" }}>
                <div style={{ fontSize: "29px", fontWeight: "700", color: "#fff", fontFamily: "'SF Pro Text', -apple-system, sans-serif", marginBottom: "4px" }}>
                    Leaderboard
                </div>
                <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
                    {total} game session{total !== 1 ? "s" : ""} recorded
                </div>
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: "20px" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "17px", opacity: 0.4 }}>🔍</span>
                <input
                    type="text"
                    placeholder="Search by player name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        width: "100%", boxSizing: "border-box",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px", padding: "11px 14px 11px 40px",
                        color: "#fff", fontSize: "17px",
                        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                        outline: "none",
                    }}
                />
            </div>

            {/* Player type filter */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                {[
                    { value: "all", label: "All" },
                    { value: "human", label: "🏂 Human" },
                    { value: "llm", label: "🦀 LLM" },
                ].map(({ value, label }) => (
                    <button key={value} onClick={() => setPlayerFilter(value)} style={{
                        padding: "6px 16px",
                        borderRadius: "8px",
                        border: playerFilter === value ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
                        background: playerFilter === value ? "rgba(255,255,255,0.1)" : "transparent",
                        color: playerFilter === value ? "#fff" : "rgba(255,255,255,0.4)",
                        fontSize: "14px",
                        fontWeight: "600",
                        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                    }}>{label}</button>
                ))}
            </div>

            {/* Table */}
            <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "16px", overflow: "hidden",
            }}>
                {loading ? (
                    <div style={{ padding: "48px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontFamily: "'SF Pro Text', -apple-system, sans-serif", fontSize: "16px" }}>
                        Loading...
                    </div>
                ) : entries.length === 0 ? (
                    <div style={{ padding: "48px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontFamily: "'SF Pro Text', -apple-system, sans-serif", fontSize: "16px" }}>
                        {debouncedSearch ? `No results for "${debouncedSearch}"` : "No games played yet. Be the first!"}
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <TH style={{ width: "48px" }}>#</TH>
                                <TH>Game</TH>
                                <TH>Player</TH>
                                <TH>Type</TH>
                                <TH>Max Level</TH>
                                <TH>Total Time</TH>
                                <TH>Date</TH>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry, i) => (
                                <tr key={i} style={{
                                    background: entry.rank <= 3 ? "rgba(255,255,255,0.02)" : "transparent",
                                }}>
                                    <TD><RankBadge rank={entry.rank} /></TD>
                                    <TD><GameCodeBadge code={entry.game_code} /></TD>
                                    <TD style={{ fontWeight: "600", color: "#fff" }}>{entry.player_name}</TD>
                                    <TD><PlayerTypeBadge type={entry.player_type} model={entry.llm_model} /></TD>
                                    <TD>
                                        <span style={{
                                            background: "rgba(56,189,248,0.15)",
                                            border: "1px solid rgba(56,189,248,0.2)",
                                            borderRadius: "6px", padding: "2px 10px",
                                            color: "#38bdf8", fontSize: "14px", fontWeight: "700",
                                        }}>
                                            Lvl {entry.max_level}
                                        </span>
                                    </TD>
                                    <TD style={{ color: "rgba(255,255,255,0.6)" }}>{formatTime(entry.total_time_s)}</TD>
                                    <TD style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>{entry.created_at}</TD>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                        padding: "7px 16px", borderRadius: "8px",
                        background: page === 1 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: page === 1 ? "rgba(255,255,255,0.2)" : "#fff",
                        cursor: page === 1 ? "default" : "pointer",
                        fontSize: "16px", fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                    }}>← Prev</button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                        return (
                            <button key={p} onClick={() => setPage(p)} style={{
                                width: "36px", height: "36px", borderRadius: "8px",
                                background: p === page ? "#007aff" : "rgba(255,255,255,0.05)",
                                border: p === page ? "none" : "1px solid rgba(255,255,255,0.1)",
                                color: "#fff", cursor: "pointer",
                                fontSize: "16px", fontWeight: p === page ? "700" : "400",
                                fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                            }}>{p}</button>
                        )
                    })}

                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
                        padding: "7px 16px", borderRadius: "8px",
                        background: page === totalPages ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: page === totalPages ? "rgba(255,255,255,0.2)" : "#fff",
                        cursor: page === totalPages ? "default" : "pointer",
                        fontSize: "16px", fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                    }}>Next →</button>
                </div>
            )}
        </div>
    )
}
