"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

type BootPhase = "boot" | "login" | "startup" | "dialog" | "ready";

// Win95 startup sound via Web Audio API
function playWin95Startup() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const notes = [
      { freq: 523.25, start: 0, dur: 0.3 },     // C5
      { freq: 659.25, start: 0.25, dur: 0.3 },   // E5
      { freq: 783.99, start: 0.5, dur: 0.3 },     // G5
      { freq: 1046.5, start: 0.75, dur: 0.6 },    // C6
      { freq: 783.99, start: 1.1, dur: 0.3 },     // G5
      { freq: 1046.5, start: 1.35, dur: 0.8 },    // C6 (sustained)
    ];

    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, now + start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.1);
    });

    // Cleanup after sound finishes
    setTimeout(() => ctx.close(), 3000);
  } catch {
    // Audio not available, silently skip
  }
}

export default function RetroBoot() {
  const { theme } = useTheme();
  const [bootPhase, setBootPhase] = useState<BootPhase>("ready");
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

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
      const t1 = setTimeout(() => setBootPhase("login"), 2500);
      return () => clearTimeout(t1);
    }
  }, [theme, mounted]);

  function handleLogin() {
    if (username.toLowerCase() === "kemal" && password === "kemal") {
      setLoginError(false);
      setBootPhase("startup");
      playWin95Startup();
      setTimeout(() => setBootPhase("dialog"), 2200);
    } else {
      setLoginError(true);
      setPassword("");
      setTimeout(() => passwordRef.current?.focus(), 100);
    }
  }

  function handleDialogOk() {
    localStorage.setItem("calmatic-retro-welcomed", "1");
    setBootPhase("ready");
  }

  if (!mounted || theme !== "retro") return null;
  if (bootPhase === "ready") return null;

  // ── Boot screen (progress bar)
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
        <div style={{ color: "#c0c0c0", fontSize: "28px", fontWeight: "bold", letterSpacing: "2px" }}>
          Calmatic Suite 95
        </div>
        <div style={{ color: "#808080", fontSize: "16px" }}>Starting...</div>
        <div style={{ width: "300px", height: "20px", border: "2px inset #c0c0c0", background: "#000", padding: "2px" }}>
          <div style={{ height: "100%", background: "#000080", animation: "bootProgress 2.5s linear forwards" }} />
        </div>
        <div style={{ color: "#404040", fontSize: "12px", marginTop: "40px" }}>
          © 2025 Calmatic Suite Contributors
        </div>
        <style>{`@keyframes bootProgress { from { width: 0%; } to { width: 100%; } }`}</style>
      </div>
    );
  }

  // ── Login screen
  if (bootPhase === "login") {
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
            width: "380px",
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
              fontSize: "13px",
              padding: "4px 8px",
              height: "26px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span>🔐 Welcome to Windows</span>
          </div>

          {/* Login form */}
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              {/* Key icon */}
              <div style={{ fontSize: "40px", flexShrink: 0, marginTop: "4px" }}>🔑</div>
              <div style={{ fontSize: "13px", color: "#000", lineHeight: "1.6" }}>
                Type a user name and password to log on to Windows.
              </div>
            </div>

            {/* Username */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
              <label style={{ fontSize: "13px", color: "#000", width: "80px", textAlign: "right" }}>
                User name:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setLoginError(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") passwordRef.current?.focus(); }}
                autoFocus
                style={{
                  flex: 1,
                  background: "#fff",
                  border: "2px inset #808080",
                  padding: "3px 6px",
                  fontSize: "13px",
                  fontFamily: "'Segoe UI', Tahoma, sans-serif",
                  color: "#000",
                  outline: "none",
                }}
              />
            </div>

            {/* Password */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
              <label style={{ fontSize: "13px", color: "#000", width: "80px", textAlign: "right" }}>
                Password:
              </label>
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
                style={{
                  flex: 1,
                  background: "#fff",
                  border: "2px inset #808080",
                  padding: "3px 6px",
                  fontSize: "13px",
                  fontFamily: "'Segoe UI', Tahoma, sans-serif",
                  color: "#000",
                  outline: "none",
                }}
              />
            </div>

            {/* Show password checkbox */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "92px", marginBottom: "12px" }}>
              <input
                type="checkbox"
                id="showpw"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                style={{ margin: 0 }}
              />
              <label htmlFor="showpw" style={{ fontSize: "11px", color: "#444", cursor: "pointer" }}>
                Show password
              </label>
            </div>

            {/* Error message */}
            {loginError && (
              <div style={{
                background: "#fff",
                border: "2px inset #808080",
                padding: "8px 12px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                color: "#800000",
              }}>
                <span style={{ fontSize: "16px" }}>⛔</span>
                <span>The password is incorrect. Please retype your password.</span>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                onClick={handleLogin}
                style={{
                  background: "#c0c0c0",
                  border: "2px outset #c0c0c0",
                  padding: "4px 20px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "'Segoe UI', Tahoma, sans-serif",
                  fontWeight: "bold",
                  color: "#000",
                  minWidth: "75px",
                }}
              >
                OK
              </button>
              <button
                onClick={() => {
                  setUsername("");
                  setPassword("");
                  setLoginError(false);
                }}
                style={{
                  background: "#c0c0c0",
                  border: "2px outset #c0c0c0",
                  padding: "4px 20px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "'Segoe UI', Tahoma, sans-serif",
                  color: "#000",
                  minWidth: "75px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Startup animation (after login, while sound plays)
  if (bootPhase === "startup") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          background: "#008080",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          fontFamily: "'Segoe UI', Tahoma, sans-serif",
        }}
      >
        <div style={{
          fontSize: "48px",
          animation: "fadeInScale 0.8s ease-out forwards",
        }}>🪟</div>
        <div style={{
          color: "#fff",
          fontSize: "24px",
          fontWeight: "bold",
          letterSpacing: "1px",
          animation: "fadeInScale 0.8s ease-out 0.3s both",
        }}>
          Calmatic Suite 95
        </div>
        <div style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: "13px",
          animation: "fadeInScale 0.8s ease-out 0.6s both",
        }}>
          Loading your desktop...
        </div>
        <style>{`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  // ── Welcome dialog
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
        <div
          style={{
            background: "linear-gradient(90deg, #000080, #1084d0)",
            color: "white",
            fontWeight: "bold",
            fontSize: "14px",
            padding: "4px 8px",
            height: "28px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span>Welcome to Calmatic Suite 95</span>
        </div>

        <div style={{ padding: "20px 24px", fontSize: "14px", lineHeight: 1.8, color: "#000" }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px" }}>
            🧮 Welcome to Calmatic Suite 95!
          </div>
          <p style={{ marginBottom: "12px" }}>
            A free, open-source calculator suite with{" "}
            <strong>39+ tools</strong> for finance, math, science, and everyday life.
          </p>

          <div style={{
            background: "#fff",
            border: "2px inset #c0c0c0",
            padding: "12px",
            marginBottom: "16px",
            fontSize: "13px",
          }}>
            <div style={{ marginBottom: "6px" }}>📁 <strong>Click folders</strong> on the desktop to explore calculators</div>
            <div style={{ marginBottom: "6px" }}>🪟 <strong>Start menu</strong> has all calculators organized by category</div>
            <div>🏳️ <strong>Change language</strong> from the taskbar flag icon</div>
          </div>

          <p style={{ fontSize: "12px", color: "#404040", marginBottom: "16px", lineHeight: 1.6 }}>
            ⚠️ All calculations are for informational purposes only — not professional advice.
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
            >
              I understand, let&#39;s go!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
