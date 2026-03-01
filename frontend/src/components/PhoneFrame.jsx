function ClassicPhoneFrame({ children }) {
  return (
    <div style={{
      width: "320px",
      height: "568px",
      background: "linear-gradient(180deg, #1c1c1e 0%, #2c2c2e 100%)",
      borderRadius: "36px",
      boxShadow: `
        0 60px 120px rgba(0,0,0,0.8),
        0 0 0 1px rgba(255,255,255,0.08),
        inset 0 1px 0 rgba(255,255,255,0.12)
      `,
      position: "relative",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      {/* Side buttons */}
      <div style={{ position: "absolute", left: "-3px", top: "100px", width: "3px", height: "28px", background: "#3a3a3c", borderRadius: "2px 0 0 2px" }} />
      <div style={{ position: "absolute", left: "-3px", top: "140px", width: "3px", height: "56px", background: "#3a3a3c", borderRadius: "2px 0 0 2px" }} />
      <div style={{ position: "absolute", left: "-3px", top: "206px", width: "3px", height: "56px", background: "#3a3a3c", borderRadius: "2px 0 0 2px" }} />
      <div style={{ position: "absolute", right: "-3px", top: "150px", width: "3px", height: "70px", background: "#3a3a3c", borderRadius: "0 2px 2px 0" }} />

      {/* Top speaker + sensor bar */}
      <div style={{
        height: "48px", width: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "6px", flexShrink: 0, paddingTop: "8px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0a0a0a", border: "1px solid #3a3a3c" }} />
          <div style={{ width: "60px", height: "6px", borderRadius: "3px", background: "#0a0a0a", border: "1px solid #3a3a3c" }} />
        </div>
      </div>

      {/* Screen */}
      <div style={{
        width: "calc(100% - 16px)", flex: 1,
        background: "#fff", overflow: "hidden",
        display: "flex", flexDirection: "column",
        position: "relative", border: "1px solid #000",
      }}>
        {children}
      </div>

      {/* Home button */}
      <div style={{
        height: "60px", width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "50%",
          background: "linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 100%)",
          border: "2px solid #3a3a3c",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <div style={{ width: "14px", height: "14px", borderRadius: "4px", border: "1.5px solid #555" }} />
        </div>
      </div>
    </div>
  )
}

function ModernPhoneFrame({ children }) {
  return (
    <div style={{
      width: "390px",
      height: "844px",
      background: "#1a1a1a",
      borderRadius: "54px",
      padding: "12px",
      boxShadow: `
        0 60px 120px rgba(0,0,0,0.8),
        0 0 0 1px rgba(255,255,255,0.08),
        inset 0 0 0 1px rgba(255,255,255,0.04)
      `,
      position: "relative",
      flexShrink: 0,
    }}>
      {/* Side buttons */}
      <div style={{ position: "absolute", left: "-3px", top: "120px", width: "3px", height: "32px", background: "#333", borderRadius: "2px 0 0 2px" }} />
      <div style={{ position: "absolute", left: "-3px", top: "168px", width: "3px", height: "64px", background: "#333", borderRadius: "2px 0 0 2px" }} />
      <div style={{ position: "absolute", left: "-3px", top: "244px", width: "3px", height: "64px", background: "#333", borderRadius: "2px 0 0 2px" }} />
      <div style={{ position: "absolute", right: "-3px", top: "180px", width: "3px", height: "80px", background: "#333", borderRadius: "0 2px 2px 0" }} />

      {/* Screen */}
      <div style={{
        width: "100%", height: "100%", background: "#fff",
        borderRadius: "44px", overflow: "hidden",
        display: "flex", flexDirection: "column", position: "relative",
      }}>
        {/* Dynamic Island */}
        <div style={{
          position: "absolute", top: "12px", left: "50%",
          transform: "translateX(-50%)",
          width: "120px", height: "34px",
          background: "#000", borderRadius: "20px", zIndex: 10,
        }} />
        {children}
      </div>
    </div>
  )
}

export default function PhoneFrame({ children, classic = false }) {
  return classic
    ? <ClassicPhoneFrame>{children}</ClassicPhoneFrame>
    : <ModernPhoneFrame>{children}</ModernPhoneFrame>
}
