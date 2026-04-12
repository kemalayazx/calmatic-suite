"use client";

import { useState, useEffect } from "react";
import { useLanguage, type Locale } from "@/context/LanguageContext";
import { LOCALE_NAMES, LOCALE_FLAGS } from "@/i18n/translations";

const LOCALES = Object.keys(LOCALE_NAMES) as Locale[];

export default function WelcomeModal() {
  const [show, setShow] = useState(false);
  const { setLocale } = useLanguage();

  useEffect(() => {
    const visited = localStorage.getItem("calmatic-welcomed");
    if (!visited) setShow(true);
  }, []);

  const handleSelect = (l: Locale) => {
    setLocale(l);
    localStorage.setItem("calmatic-welcomed", "1");
    setShow(false);
  };

  const handleSkip = () => {
    localStorage.setItem("calmatic-welcomed", "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          width: "100%",
          background: "#18181b",
          border: "1px solid #27272a",
          borderRadius: "1.25rem",
          padding: "2.5rem 2rem",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          animation: "fadeInUp 0.25s ease",
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              fontWeight: 900,
              background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #6d28d9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Welcome to Calmatic Suite
          </h1>
        </div>

        {/* Subtitle */}
        <p style={{ textAlign: "center", color: "#71717a", fontSize: "0.95rem", marginBottom: "2rem" }}>
          Choose your preferred language to get started
        </p>

        {/* Language grid: 5 columns × 3 rows */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "0.5rem",
            marginBottom: "2rem",
          }}
        >
          {LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => handleSelect(l)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.75rem 0.5rem",
                borderRadius: "0.75rem",
                border: "1px solid #27272a",
                background: "transparent",
                cursor: "pointer",
                transition: "all 0.15s",
                fontSize: "0.78rem",
                color: "#a1a1aa",
                fontWeight: 500,
              }}
              onMouseOver={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "rgba(124,58,237,0.15)";
                el.style.borderColor = "#7c3aed";
                el.style.color = "#fafafa";
                el.style.transform = "scale(1.04)";
              }}
              onMouseOut={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "transparent";
                el.style.borderColor = "#27272a";
                el.style.color = "#a1a1aa";
                el.style.transform = "scale(1)";
              }}
            >
              <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{LOCALE_FLAGS[l]}</span>
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%", fontSize: "0.75rem" }}>
                {LOCALE_NAMES[l]}
              </span>
            </button>
          ))}
        </div>

        {/* Footer note + skip */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#52525b", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
            You can change this anytime from the menu
          </p>
          <button
            onClick={handleSkip}
            style={{
              background: "transparent",
              border: "none",
              color: "#52525b",
              cursor: "pointer",
              fontSize: "0.85rem",
              textDecoration: "underline",
              padding: "0.25rem 0.5rem",
              transition: "color 0.15s",
            }}
            onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#a1a1aa"; }}
            onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#52525b"; }}
          >
            Continue in English →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
