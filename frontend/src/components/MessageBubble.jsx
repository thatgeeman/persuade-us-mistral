import { useEffect, useState } from "react"
import { useTheme } from "./ThemeContext"

function Avatar({ name, colorFrom, colorTo }) {
  const { classic } = useTheme()
  return (
    <div style={{
      width: classic ? "32px" : "28px",
      height: classic ? "32px" : "28px",
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${colorFrom || "#6b7280"}, ${colorTo || "#374151"})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff",
      fontSize: classic ? "13px" : "11px",
      fontWeight: "700",
      fontFamily: classic ? "Helvetica Neue, Helvetica, sans-serif" : "'SF Pro Text', -apple-system, sans-serif",
      flexShrink: 0, alignSelf: "flex-end", marginBottom: "2px",
      ...(classic && { border: "2px solid #c8c8c8", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }),
    }}>
      {name?.[0] ?? "?"}
    </div>
  )
}

export function TypingRow({ name, colorFrom, colorTo }) {
  const { classic } = useTheme()
  return (
    <div style={{
      display: "flex", alignItems: "flex-end", gap: "6px",
      marginBottom: "3px", paddingRight: "60px",
      animation: "fadeSlideIn 0.2s ease-out",
    }}>
      <Avatar name={name} colorFrom={colorFrom} colorTo={colorTo} />
      <div>
        <div style={{
          fontSize: "11px",
          color: classic ? "#6d6d72" : "#8e8e93",
          fontFamily: classic ? "Helvetica Neue, Helvetica, sans-serif" : "'SF Pro Text', -apple-system, sans-serif",
          marginBottom: "3px", paddingLeft: "2px",
        }}>{name}</div>
        <div style={{
          display: "flex", alignItems: "center", gap: classic ? "3px" : "4px",
          padding: classic ? "8px 12px" : "10px 14px",
          background: classic ? "linear-gradient(180deg, #f0f0f0 0%, #e2e2e2 100%)" : "#e5e5ea",
          borderRadius: classic ? "14px 14px 14px 3px" : "18px 18px 18px 4px",
          width: "fit-content",
          ...(classic && { border: "1px solid #c8c8c8" }),
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: classic ? "6px" : "7px", height: classic ? "6px" : "7px",
              borderRadius: "50%", background: "#8e8e93",
              animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ClassicBubble({ isMe, content }) {
  return (
    <div style={{
      background: isMe
        ? "linear-gradient(180deg, #6ecb4f 0%, #45b330 100%)"
        : "linear-gradient(180deg, #f0f0f0 0%, #e2e2e2 100%)",
      color: isMe ? "#fff" : "#000",
      borderRadius: isMe ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
      padding: "8px 12px", fontSize: "14px",
      fontFamily: "Helvetica Neue, Helvetica, sans-serif",
      lineHeight: "1.4", wordBreak: "break-word",
      border: isMe ? "none" : "1px solid #c8c8c8",
      boxShadow: isMe
        ? "inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.15)"
        : "inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.08)",
      textShadow: isMe ? "0 -1px 0 rgba(0,0,0,0.2)" : "none",
    }}>{content}</div>
  )
}

function ModernBubble({ isMe, content }) {
  return (
    <div style={{
      background: isMe ? "linear-gradient(180deg, #34aadc 0%, #007aff 100%)" : "#e5e5ea",
      color: isMe ? "#fff" : "#000",
      borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
      padding: "9px 14px", fontSize: "15px",
      fontFamily: "'SF Pro Text', -apple-system, sans-serif",
      lineHeight: "1.4", wordBreak: "break-word",
    }}>{content}</div>
  )
}

export default function MessageBubble({ message }) {
  const { classic } = useTheme()
  const [visible, setVisible] = useState(false)
  const isMe = message.role === "user"

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: isMe ? "flex-end" : "flex-start",
      marginBottom: classic ? "6px" : "3px",
      paddingLeft: isMe ? "60px" : "0",
      paddingRight: isMe ? "0" : "60px",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(8px)",
      transition: "opacity 0.25s ease, transform 0.25s ease",
    }}>
      {!isMe && (
        <div style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
          <Avatar name={message.character} colorFrom={message.colorFrom} colorTo={message.colorTo} />
          <div>
            <div style={{
              fontSize: "11px",
              color: classic ? "#6d6d72" : "#8e8e93",
              fontFamily: classic ? "Helvetica Neue, Helvetica, sans-serif" : "'SF Pro Text', -apple-system, sans-serif",
              marginBottom: "3px", paddingLeft: "2px",
            }}>{message.character}</div>
            {classic ? <ClassicBubble isMe={false} content={message.content} /> : <ModernBubble isMe={false} content={message.content} />}
          </div>
        </div>
      )}
      {isMe && (classic ? <ClassicBubble isMe content={message.content} /> : <ModernBubble isMe content={message.content} />)}
    </div>
  )
}