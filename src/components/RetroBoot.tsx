"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

type BootPhase = "boot" | "dialog" | "ready";

export default function RetroBoot() {
  const { theme } = useTheme();
  const [bootPhase, setBootPhase] = useState<BootPhase>("ready");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (theme !== "retro") {
      setBootPhase("ready");
      return;
    }
    const welcomed = localStorage.getItem("calmatic-retro-welcomed");
    if (!welcomed) {
      setBootPhase("boot");
      const t1 = setTimeout(() => setBootPhase("dialog"), 2500);
      return () => clearTimeout(t1);
    }
  }, [theme, mounted]);

  function handleDialogOk() {
    localStorage.setItem("calmatic-retro-welcomed", "1");
    setBootPhase("ready");
  }

  if (!mounted || theme !== "retro") return null;
  if (bootPhase === "ready") return null;

  if (bootPhase === "boot") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            color: "#c0c0c0",
            fontSize: "28px",
            fontWeight: "bold",
            letterSpacing: "2px",
          }}
        >
          Calmatic Suite 95
        </div>
        <div style={{ color: "#808080", fontSize: "16px" }}>Starting...</div>
        <div
          style={{
            width: "300px",
            height: "20px",
            border: "2px inset #c0c0c0",
            background: "#000",
            padding: "2px",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#000080",
              animation: "bootProgress 2.5s linear forwards",
            }}
          />
        </div>
        <div
          style={{
            color: "#404040",
            fontSize: "12px",
            marginTop: "40px",
          }}
        >
          © 2025 Calmatic Suite Contributors
        </div>
        <style>{`
          @keyframes bootProgress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // bootPhase === "dialog"
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#008080",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#c0c0c0",
          border: "2px outset #c0c0c0",
          boxShadow: "2px 2px 0 rgba(0,0,0,0.5)",
          width: "520px",
          maxWidth: "95vw",
          fontFamily: "'Segoe UI', Tahoma, sans-serif",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            background: "linear-gradient(90deg, #000080, #1084d0)",
            color: "white",
            fontWeight: "bold",
            fontSize: "14px",
            padding: "4px 8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "28px",
          }}
        >
          <span>Welcome to Calmatic Suite 95</span>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "20px 24px",
            fontSize: "14px",
            lineHeight: 1.8,
            color: "#000",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "12px",
            }}
          >
            🧮 Welcome to Calmatic Suite 95!
          </div>
          <p style={{ marginBottom: "12px" }}>
            A free, open-source calculator suite with{" "}
            <strong>39+ tools</strong> for finance, math, science, and
            everyday life.
          </p>

          {/* Tips box */}
          <div
            style={{
              background: "#fff",
              border: "2px inset #c0c0c0",
              padding: "12px",
              marginBottom: "16px",
              fontSize: "13px",
            }}
          >
            <div style={{ marginBottom: "6px" }}>
              📁 <strong>Click folders</strong> on the desktop to explore
              calculators
            </div>
            <div style={{ marginBottom: "6px" }}>
              🪟 <strong>Start menu</strong> has all calculators organized by
              category
            </div>
            <div style={{ marginBottom: "6px" }}>
              🏳️ <strong>Change language</strong> from the taskbar flag icon
            </div>
            <div>
              ⚙️ <strong>Modern theme:</strong> Start → Switch to Modern Theme
            </div>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "#404040",
              marginBottom: "16px",
              lineHeight: 1.6,
            }}
          >
            ⚠️ All calculations are for informational purposes only — not
            professional advice.
            <br />
            💡 This is a volunteer project. No data collected. No ads.
          </p>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={handleDialogOk}
              style={{
                background: "#c0c0c0",
                border: "2px outset #c0c0c0",
                padding: "6px 32px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
                fontFamily: "'Segoe UI', Tahoma, sans-serif",
                color: "#000",
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderStyle =
                  "inset";
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderStyle =
                  "outset";
              }}
            >
              I understand, let&#39;s go!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
