export default function HowToPlay() {
    const panelStyle = {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "18px 20px",
    }

    const listItemStyle = {
        fontSize: "16px",
        color: "rgba(255,255,255,0.86)",
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
        lineHeight: "1.5",
    }

    return (
        <div style={{ width: "100%", maxWidth: "960px", margin: "0 auto", padding: "40px 24px" }}>
            <div style={{ marginBottom: "22px" }}>
                <div style={{
                    fontSize: "29px",
                    fontWeight: "700",
                    color: "#fff",
                    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                    marginBottom: "6px",
                }}>
                    How To Play
                </div>
                <div style={{
                    fontSize: "17px",
                    color: "rgba(255,255,255,0.62)",
                    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                    maxWidth: "760px",
                    lineHeight: "1.55",
                }}>
                    Social persuasion is part of daily life: inviting, negotiating, repairing, and coordinating.
                    This game is a low-stakes way to practice those skills with feedback every round.
                </div>
            </div>

            <div style={{ ...panelStyle, marginBottom: "14px" }}>
                <div style={{
                    fontSize: "13px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                    fontWeight: "700",
                    marginBottom: "10px",
                }}>
                    Core Loop
                </div>
                <div style={{ display: "grid", gap: "8px" }}>
                    <div style={listItemStyle}>1. Choose mode: Human (you type) or YOLO (model plays and you watch, taking notes).</div>
                    <div style={listItemStyle}>2. Read the level goal and each person’s relationship context.</div>
                    <div style={listItemStyle}>3. Send one persuasive message at a time (140 character limit).</div>
                    <div style={listItemStyle}>4. Watch replies and adjust your next message. Characters respond based on their personality and how well your argument lands.</div>
                    <div style={listItemStyle}>5. Win by convincing everyone before the timer expires.</div>
                </div>
            </div>

            <div style={{ ...panelStyle, marginBottom: "14px" }}>
                <div style={{
                    fontSize: "13px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                    fontWeight: "700",
                    marginBottom: "10px",
                }}>
                    Practical Tips
                </div>
                <div style={{ display: "grid", gap: "8px" }}>
                    <div style={listItemStyle}>Lead with shared benefit, not only your own goal.</div>
                    <div style={listItemStyle}>Address objections directly (time, money, effort, social comfort).</div>
                    <div style={listItemStyle}>Match tone to relationship: coworker, cousin, mentor, priest, etc.</div>
                    <div style={listItemStyle}>Keep messages concise; one clear ask beats long paragraphs.</div>
                    <div style={listItemStyle}>Use replies as data. Iterate instead of repeating the same pitch.</div>
                </div>
            </div>

            <div style={panelStyle}>
                <div style={{
                    fontSize: "13px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                    fontWeight: "700",
                    marginBottom: "10px",
                }}>
                    Why This Works
                </div>
                <div style={{ display: "grid", gap: "8px" }}>
                    <div style={listItemStyle}>The game models social behavior as feedback loops: message, reaction, adjustment.</div>
                    <div style={listItemStyle}>That aligns with social learning research: repeated practice with immediate feedback improves performance.</div>
                    <div style={listItemStyle}>You train perspective-taking, framing, and timing, which transfer to real conversations.</div>
                    <div style={listItemStyle}>Think of each level as a mini experiment in everyday influence and communication.</div>
                </div>
            </div>

        <details style={{ ...panelStyle, marginTop: "14px", paddingTop: "14px" }}>
                <summary style={{
                    cursor: "pointer",
                    listStyle: "none",
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#fff",
                    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                }}>
                    Licenses, Attribution, and Libraries
                </summary>
                <div style={{
                    marginTop: "12px",
                    display: "grid",
                    gap: "8px",
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.78)",
                    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                    lineHeight: "1.5",
                }}>
                    <div>Licenses are respected and remain with their original owners; third-party libraries keep their own license terms.</div>
                    <div>
                        This project uses GNU AGPL v3.0. Full text:{" "}
                        <a
                            href="https://www.gnu.org/licenses/agpl-3.0.en.html#license-text"
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#93c5fd", textDecoration: "underline", fontWeight: "600" }}
                        >
                            GNU AGPL v3.0 license text
                        </a>
                    </div>
                    <div>Backend libraries: FastAPI, Uvicorn, SQLAlchemy, Pydantic, Python Dotenv, Mistral AI SDK, Hugging Face Hub.</div>
                    <div>Frontend libraries: React, React DOM, Mistral JS SDK, gifenc, Vite.</div>
                    <div>
                        Inference attribution: character AI, level goals, and character generation are powered by{" "}
                        <a href="https://mistral.ai" target="_blank" rel="noreferrer" style={{ color: "#fb923c", textDecoration: "underline", fontWeight: "600" }}>Mistral AI</a>
                        {" "}(mistral-large-latest). YOLO mode player messages run via{" "}
                        <a href="https://huggingface.co" target="_blank" rel="noreferrer" style={{ color: "#fbbf24", textDecoration: "underline", fontWeight: "600" }}>Hugging Face Inference Providers</a>.
                        {" "}YOLO mode includes an OpenClaw throwback to its creator.
                    </div>
                    <div>Special thanks: Priyanka Main joined forces as beta tester and suggested awesome features.</div>
                </div>
            </details>
        </div>
    )
}
