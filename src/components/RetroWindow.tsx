"use client";

import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";

interface RetroWindowProps {
  title: string;
  children: React.ReactNode;
}

export default function RetroWindow({ title, children }: RetroWindowProps) {
  const { theme } = useTheme();

  if (theme !== "retro") return <>{children}</>;

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "20px auto",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div className="retro-window">
        {/* Title bar */}
        <div className="retro-title-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "12px" }}>🧮</span>
            <span>{title}</span>
          </div>
          <div className="retro-title-bar-buttons">
            <button className="retro-title-bar-btn" title="Minimize">_</button>
            <button className="retro-title-bar-btn" title="Maximize">□</button>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button
                className="retro-title-bar-btn"
                title="Close"
                style={{ background: "#c0c0c0", color: "#000" }}
              >
                ✕
              </button>
            </Link>
          </div>
        </div>

        {/* Menu bar */}
        <div
          style={{
            background: "#c0c0c0",
            padding: "2px 4px",
            fontSize: "11px",
            fontFamily: "'MS Sans Serif', Tahoma, sans-serif",
            borderBottom: "1px solid #808080",
            display: "flex",
            gap: "16px",
          }}
        >
          <span style={{ cursor: "pointer" }}><u>F</u>ile</span>
          <span style={{ cursor: "pointer" }}><u>E</u>dit</span>
          <span style={{ cursor: "pointer" }}><u>V</u>iew</span>
          <span style={{ cursor: "pointer" }}><u>H</u>elp</span>
        </div>

        {/* Content */}
        <div
          className="retro-window-content"
          style={{ maxHeight: "calc(100vh - 120px)", overflow: "auto" }}
        >
          {children}
        </div>

        {/* Status bar */}
        <div
          style={{
            background: "#c0c0c0",
            padding: "2px 8px",
            fontSize: "10px",
            fontFamily: "'MS Sans Serif', Tahoma, sans-serif",
            borderTop: "1px solid #808080",
            color: "#404040",
          }}
        >
          Ready
        </div>
      </div>
    </div>
  );
}
