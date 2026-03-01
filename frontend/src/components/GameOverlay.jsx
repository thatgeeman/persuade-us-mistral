import { useTheme } from "./ThemeContext"

export function GoalBanner({ goal, level }) {
  const { classic } = useTheme()

  if (classic) {
    return (
      <div style={{
        background: "linear-gradient(180deg, #548fcd 0%, #2a5d9f 100%)",
        padding: "8px 16px",
        borderBottom: "1px solid #1a4a80",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: "9px",
          fontWeight: "700",
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.7)",
          fontFamily: "Helvetica Neue, Helvetica, sans-serif",
          marginBottom: "3px",
          textTransform: "uppercase",
          textShadow: "0 -1px 0 rgba(0,0,0,0.3)",
        }}>
          Level {level} · Mission
        </div>
        <div style={{
          fontSize: "12px",
          color: "#fff",
          fontFamily: "Helvetica Neue, Helvetica, sans-serif",
          lineHeight: "1.4",
          textShadow: "0 -1px 0 rgba(0,0,0,0.25)",
        }}>
          {goal}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      padding: "10px 18px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      flexShrink: 0,
    }}>
      <div style={{
        fontSize: "9px", fontWeight: "700", letterSpacing: "0.12em",
        color: "#38bdf8",
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
        marginBottom: "4px", textTransform: "uppercase",
      }}>
        Level {level} · Mission
      </div>
      <div style={{
        fontSize: "13px", color: "#f1f5f9",
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
        lineHeight: "1.4",
      }}>
        {goal}
      </div>
    </div>
  )
}

export function Timer({ seconds, totalSeconds = 300 }) {
  const { classic } = useTheme()
  const pct = seconds / totalSeconds
  const isLow = seconds <= 20
  const isCritical = seconds <= 10
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const display = `${mins}:${String(secs).padStart(2, "0")}`
  const r = 14
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  const progressColor = isCritical ? "#ef4444" : isLow ? "#f97316" : (classic ? "#fff" : "#38bdf8")

  if (classic) {
    return (
      <div style={{
        background: isCritical
          ? "linear-gradient(180deg, #ff6b6b, #cc0000)"
          : "linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))",
        border: "1px solid rgba(255,255,255,0.3)",
        borderRadius: "10px",
        padding: "3px 10px",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)",
      }}>
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", fontFamily: "Helvetica Neue, Helvetica, sans-serif" }}>⏱</span>
        <span style={{
          fontSize: "13px", fontWeight: "700",
          color: "#fff",
          fontFamily: "Helvetica Neue, Helvetica, sans-serif",
          textShadow: "0 -1px 0 rgba(0,0,0,0.3)",
        }}>{display}</span>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
      <svg width="36" height="36" style={{ flexShrink: 0 }}>
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
        <circle
          cx="18" cy="18" r={r} fill="none"
          stroke={progressColor} strokeWidth="2.5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 18 18)"
          style={{ transition: "stroke-dasharray 1s linear, stroke 0.5s ease" }}
        />
        <text x="18" y="22" textAnchor="middle" fontSize="8" fontWeight="700"
          fill={isCritical ? "#ef4444" : "#fff"}
          fontFamily="'SF Pro Text', -apple-system, sans-serif"
          style={{ transition: "fill 0.5s ease" }}>
          {display}
        </text>
      </svg>
      <div style={{
        fontSize: "12px",
        fontWeight: "700",
        color: isCritical ? "#ef4444" : "#111827",
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
        minWidth: "34px",
        textAlign: "left",
      }}>
        {display}
      </div>
    </div>
  )
}
