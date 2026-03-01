import { GIFEncoder, quantize, applyPalette } from "gifenc"

// ── screen / phone dimensions ─────────────────────────────────────────────────
const W = 380          // screen content width
const H = 620          // screen content height
const SCREEN_X = 20   // screen left offset inside phone body
const SCREEN_Y = 80   // screen top offset inside phone body
const TW = SCREEN_X * 2 + W          // total canvas width  = 420
const TH = SCREEN_Y + H + 60         // total canvas height = 760

// ── content layout ────────────────────────────────────────────────────────────
const PAD = 14
const HEADER_H = 56
const BUBBLE_MAX_W = 230
const LINE_H = 18
const FONT = "13px system-ui, -apple-system, sans-serif"
const NAME_FONT = "bold 10px system-ui, -apple-system, sans-serif"
const AVATAR_R = 13
const POST_CHAT_HOLD_FRAMES = 3
const POST_CHAT_HOLD_DELAY = 700

// ── helpers ───────────────────────────────────────────────────────────────────

function wrapText(ctx, text, maxWidth) {
    const words = text.split(" ")
    const lines = []
    let cur = ""
    for (const w of words) {
        const test = cur ? `${cur} ${w}` : w
        if (ctx.measureText(test).width > maxWidth && cur) {
            lines.push(cur)
            cur = w
        } else {
            cur = test
        }
    }
    if (cur) lines.push(cur)
    return lines.length ? lines : [""]
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
}

// ── phone shell ───────────────────────────────────────────────────────────────

function drawPhoneShell(ctx) {
    // Outer body
    const bodyGrad = ctx.createLinearGradient(0, 0, TW, TH)
    bodyGrad.addColorStop(0, "#28283a")
    bodyGrad.addColorStop(0.5, "#1a1a26")
    bodyGrad.addColorStop(1, "#111118")
    roundRect(ctx, 0, 0, TW, TH, 46)
    ctx.fillStyle = bodyGrad
    ctx.fill()

    // Metallic border
    roundRect(ctx, 0, 0, TW, TH, 46)
    ctx.strokeStyle = "rgba(255,255,255,0.13)"
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Inner highlight (top edge reflection)
    roundRect(ctx, 1, 1, TW - 2, TH / 2, 45)
    ctx.strokeStyle = "rgba(255,255,255,0.06)"
    ctx.lineWidth = 1
    ctx.stroke()

    // Screen recessed bezel
    roundRect(ctx, SCREEN_X - 3, SCREEN_Y - 3, W + 6, H + 6, 8)
    ctx.fillStyle = "#06060c"
    ctx.fill()

    // Side buttons (left: volume, right: power)
    ctx.fillStyle = "#222230"
    roundRect(ctx, -3, SCREEN_Y + 28, 5, 30, 2)   // vol up
    ctx.fill()
    roundRect(ctx, -3, SCREEN_Y + 68, 5, 30, 2)   // vol down
    ctx.fill()
    roundRect(ctx, TW - 2, SCREEN_Y + 55, 5, 52, 2) // power
    ctx.fill()
}

function drawPhoneDecorations(ctx) {
    // Dynamic Island pill
    const diW = 116, diH = 30
    const diX = (TW - diW) / 2
    const diY = (SCREEN_Y - diH) / 2 - 2
    roundRect(ctx, diX, diY, diW, diH, 15)
    ctx.fillStyle = "#06060c"
    ctx.fill()

    // Camera dot inside island
    ctx.beginPath()
    ctx.arc(diX + diW - 15, diY + diH / 2, 5, 0, Math.PI * 2)
    ctx.fillStyle = "#151525"
    ctx.fill()
    ctx.beginPath()
    ctx.arc(diX + diW - 15, diY + diH / 2, 2.5, 0, Math.PI * 2)
    ctx.fillStyle = "#0a0a18"
    ctx.fill()
    // Camera lens glint
    ctx.beginPath()
    ctx.arc(diX + diW - 16, diY + diH / 2 - 1.5, 1, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(255,255,255,0.18)"
    ctx.fill()

    // Home indicator
    const homW = 128, homH = 5
    roundRect(ctx, (TW - homW) / 2, SCREEN_Y + H + 20, homW, homH, 3)
    ctx.fillStyle = "rgba(255,255,255,0.22)"
    ctx.fill()
}

// ── content drawing (all coords relative to screen 0,0) ──────────────────────

function drawBackground(ctx) {
    ctx.fillStyle = "#0d1117"
    ctx.fillRect(0, 0, W, H)
}

function drawHeader(ctx, level) {
    const grad = ctx.createLinearGradient(0, 0, W, 0)
    grad.addColorStop(0, "#0f1729")
    grad.addColorStop(1, "#060810")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, HEADER_H)

    ctx.font = "bold 14px system-ui, -apple-system, sans-serif"
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "left"
    ctx.fillText(`🤝 PersuadeUs  ·  Level ${level.level_number}`, PAD, 22)

    ctx.font = "11px system-ui, -apple-system, sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.45)"
    const goalText = `Goal: ${level.goal_display || level.goal_description || ""}`
    ctx.fillText(goalText.slice(0, 55) + (goalText.length > 55 ? "…" : ""), PAD, 40)

    ctx.strokeStyle = "rgba(255,255,255,0.07)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, HEADER_H)
    ctx.lineTo(W, HEADER_H)
    ctx.stroke()
}

function measureMsg(ctx, msg) {
    if (msg.role === "system") return 26
    ctx.font = FONT
    const lines = wrapText(ctx, msg.content, BUBBLE_MAX_W - 24)
    return 14 + 4 + lines.length * LINE_H + 16 + 6
}

function drawSingleMsg(ctx, msg, y, player) {
    if (msg.role === "system") {
        ctx.font = "11px system-ui, -apple-system, sans-serif"
        ctx.fillStyle = "rgba(255,255,255,0.28)"
        ctx.textAlign = "center"
        ctx.fillText(msg.content, W / 2, y + 15)
        return
    }

    const isUser = msg.role === "user"
    const name = isUser ? (player?.playerName || "You") : (msg.character || "?")

    ctx.font = FONT
    const lines = wrapText(ctx, msg.content, BUBBLE_MAX_W - 24)
    const bubbleH = lines.length * LINE_H + 16
    const textWidths = lines.map(l => ctx.measureText(l).width)
    const bubbleW = Math.min(BUBBLE_MAX_W, Math.max(...textWidths) + 28)

    const avatarX = PAD + AVATAR_R
    const bx = isUser ? W - PAD - bubbleW : PAD + AVATAR_R * 2 + 8
    const nameY = y + 12
    const bubbleY = y + 18

    if (!isUser) {
        const cy = bubbleY + bubbleH / 2
        const grad = ctx.createRadialGradient(avatarX, cy - 3, 0, avatarX, cy, AVATAR_R)
        grad.addColorStop(0, msg.colorFrom || "#6366f1")
        grad.addColorStop(1, msg.colorTo || "#4338ca")
        ctx.beginPath()
        ctx.arc(avatarX, cy, AVATAR_R, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
        ctx.font = "bold 10px system-ui, -apple-system, sans-serif"
        ctx.fillStyle = "#fff"
        ctx.textAlign = "center"
        ctx.fillText((name[0] || "?").toUpperCase(), avatarX, cy + 4)
    }

    ctx.font = NAME_FONT
    ctx.fillStyle = isUser ? "#38bdf8" : "rgba(255,255,255,0.38)"
    ctx.textAlign = isUser ? "right" : "left"
    ctx.fillText(name, isUser ? W - PAD : bx, nameY)

    roundRect(ctx, bx, bubbleY, bubbleW, bubbleH, 14)
    ctx.fillStyle = isUser ? "#007aff" : "#22223a"
    ctx.fill()

    ctx.font = FONT
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "left"
    lines.forEach((line, li) => {
        ctx.fillText(line, bx + 12, bubbleY + 12 + 13 + li * LINE_H)
    })
}

function drawMessages(ctx, messages, player) {
    const AVAIL_H = H - HEADER_H - PAD
    const heights = messages.map(m => measureMsg(ctx, m))

    let totalFit = 0
    let startIdx = messages.length
    for (let i = messages.length - 1; i >= 0; i--) {
        if (totalFit + heights[i] > AVAIL_H) break
        totalFit += heights[i]
        startIdx = i
    }

    const visible = messages.slice(startIdx)
    const visHeights = heights.slice(startIdx)
    const visTotal = visHeights.reduce((a, b) => a + b, 0)

    let y = H - PAD - visTotal
    if (y < HEADER_H + PAD) y = HEADER_H + PAD

    ctx.save()
    ctx.beginPath()
    ctx.rect(0, HEADER_H, W, H - HEADER_H)
    ctx.clip()

    visible.forEach((msg, i) => {
        drawSingleMsg(ctx, msg, y, player)
        y += visHeights[i]
    })

    ctx.restore()
}

function drawWonBanner(ctx) {
    const bw = W - PAD * 2
    const bh = 42
    const bx = PAD
    const by = HEADER_H + 8
    roundRect(ctx, bx, by, bw, bh, 12)
    ctx.fillStyle = "rgba(0,200,83,0.92)"
    ctx.fill()
    ctx.strokeStyle = "rgba(255,255,255,0.25)"
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.font = "bold 16px system-ui, -apple-system, sans-serif"
    ctx.textAlign = "center"
    ctx.fillStyle = "#fff"
    ctx.fillText("They're in! 🎉", W / 2, by + 27)
}

// ── frame render ──────────────────────────────────────────────────────────────

function renderFrame(ctx, drawContent) {
    // 1. Phone body
    ctx.clearRect(0, 0, TW, TH)
    drawPhoneShell(ctx)

    // 2. Screen content (clipped to screen bounds)
    ctx.save()
    ctx.translate(SCREEN_X, SCREEN_Y)
    ctx.beginPath()
    ctx.rect(0, 0, W, H)
    ctx.clip()
    drawContent(ctx)
    ctx.restore()

    // 3. Phone decorations on top (notch, home bar)
    drawPhoneDecorations(ctx)
}

function encodeFrame(gif, ctx, delay) {
    const { data } = ctx.getImageData(0, 0, TW, TH)
    const palette = quantize(data, 256)
    const index = applyPalette(data, palette)
    gif.writeFrame(index, TW, TH, { palette, delay, dispose: 2 })
}

// ── public API ────────────────────────────────────────────────────────────────

/**
 * Renders the conversation as an animated GIF inside a phone frame and triggers a download.
 * @param {Array}    conversation  - [{role, character, content, colorFrom, colorTo}]
 * @param {Object}   level         - {level_number, goal_display, goal_description}
 * @param {Object}   player        - {playerName, playerType}
 * @param {Function} onProgress    - optional callback(pct: 0–100)
 */
export async function exportConversationAsGif(conversation, level, player, onProgress) {
    const canvas = document.createElement("canvas")
    canvas.width = TW
    canvas.height = TH
    const ctx = canvas.getContext("2d", { willReadFrequently: true })

    const gif = GIFEncoder()
    const total = conversation.length + POST_CHAT_HOLD_FRAMES + 1

    for (let i = 0; i < conversation.length; i++) {
        const visible = conversation.slice(0, i + 1)
        renderFrame(ctx, c => {
            drawBackground(c)
            drawHeader(c, level)
            drawMessages(c, visible, player)
        })

        const msg = conversation[i]
        const delay = msg.role === "system"
            ? 800
            : Math.min(2500, Math.max(800, (msg.content?.length || 0) * 35))

        encodeFrame(gif, ctx, delay)
        onProgress?.((i + 1) / total * 90)
        await new Promise(r => setTimeout(r, 0))
    }

    // Hold a few extra frames so the final chat remains readable.
    for (let i = 0; i < POST_CHAT_HOLD_FRAMES; i++) {
        renderFrame(ctx, c => {
            drawBackground(c)
            drawHeader(c, level)
            drawMessages(c, conversation, player)
        })
        encodeFrame(gif, ctx, POST_CHAT_HOLD_DELAY)
        onProgress?.((conversation.length + i + 1) / total * 90)
        await new Promise(r => setTimeout(r, 0))
    }

    // Final won frame as a top banner (keeps chat readable)
    renderFrame(ctx, c => {
        drawBackground(c)
        drawHeader(c, level)
        drawMessages(c, conversation, player)
        drawWonBanner(c)
    })
    encodeFrame(gif, ctx, 2600)

    gif.finish()
    onProgress?.(100)

    const blob = new Blob([gif.bytesView()], { type: "image/gif" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `persuade-us-level-${level.level_number}.gif`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
