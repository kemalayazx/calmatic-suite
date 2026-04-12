"use client";

import { useState, useEffect } from "react";
import { TIMEZONES, WORLD_CITIES, formatInTz, formatTimeOnly } from "@/lib/calculations/timezone";

const INPUT_STYLE: React.CSSProperties = {
  background: "#0a0a0b",
  border: "1px solid #27272a",
  borderRadius: "0.5rem",
  color: "#f4f4f5",
  padding: "0.5rem 0.75rem",
  fontSize: "0.9rem",
  width: "100%",
  boxSizing: "border-box",
};

function getOffsetHours(date: Date, tz: string): number {
  try {
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(date.toLocaleString("en-US", { timeZone: tz }));
    return (tzDate.getTime() - utcDate.getTime()) / 3600000;
  } catch {
    return 0;
  }
}

function fmtDiff(h: number): string {
  if (h === 0) return "Same time";
  const sign = h > 0 ? "+" : "";
  return `${sign}${h % 1 === 0 ? h : h.toFixed(1)} hours`;
}

export default function TimezonePage() {
  const [fromTz, setFromTz] = useState("UTC");
  const [toTz, setToTz] = useState("America/New_York");
  const [inputDate, setInputDate] = useState(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [now, setNow] = useState(new Date());
  const [result, setResult] = useState<{ formatted: string; diff: number } | null>(null);

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  function setToNow() {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    setInputDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
  }

  function convert() {
    try {
      const date = new Date(inputDate);
      if (isNaN(date.getTime())) throw new Error("Invalid date");

      // Interpret inputDate as being in fromTz
      // We parse it as local time, then adjust
      const fromOffset = getOffsetHours(date, fromTz);
      const utcMs = date.getTime() - fromOffset * 3600000;
      const utcDate = new Date(utcMs);

      const formatted = formatInTz(utcDate, toTz);
      const diff = getOffsetHours(utcDate, toTz) - getOffsetHours(utcDate, fromTz);
      setResult({ formatted, diff });
    } catch {
      setResult(null);
    }
  }

  return (
    <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <h1 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 800, color: "#22d3ee", marginBottom: "1.5rem" }}>
        Time Zone Converter
      </h1>

      {/* World Cities Live */}
      <div style={{ background: "#0a0a0b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1rem", marginBottom: "1.5rem" }}>
        <p style={{ fontSize: "0.75rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
          Live World Clock
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
          {WORLD_CITIES.map((city) => (
            <div key={city.tz} style={{ background: "#111113", border: "1px solid #27272a", borderRadius: "0.5rem", padding: "0.6rem 0.75rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.2rem" }}>{city.city}</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#f4f4f5", fontFamily: "monospace" }}>
                {formatTimeOnly(now, city.tz)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Converter */}
      <div style={{ background: "#111113", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "block", marginBottom: "0.3rem" }}>From Timezone</label>
            <select value={fromTz} onChange={(e) => setFromTz(e.target.value)} style={INPUT_STYLE}>
              {TIMEZONES.map((tz) => <option key={tz.tz} value={tz.tz}>{tz.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "block", marginBottom: "0.3rem" }}>To Timezone</label>
            <select value={toTz} onChange={(e) => setToTz(e.target.value)} style={INPUT_STYLE}>
              {TIMEZONES.map((tz) => <option key={tz.tz} value={tz.tz}>{tz.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "block", marginBottom: "0.3rem" }}>Date &amp; Time</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="datetime-local"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              style={{ ...INPUT_STYLE, flex: 1 }}
            />
            <button
              onClick={setToNow}
              style={{ background: "#1e293b", color: "#7dd3fc", border: "1px solid #1e3a5f", borderRadius: "0.5rem", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}
            >
              Now
            </button>
          </div>
        </div>

        <button
          onClick={convert}
          style={{ background: "#0891b2", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}
        >
          Convert
        </button>

        {result && (
          <div style={{ background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: "0.75rem", padding: "1rem 1.25rem", marginTop: "1rem" }}>
            <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.5rem" }}>Result in target timezone:</p>
            <p style={{ fontSize: "1.15rem", fontWeight: 700, color: "#f4f4f5", marginBottom: "0.5rem", fontFamily: "monospace" }}>
              {result.formatted}
            </p>
            <p style={{ fontSize: "0.9rem", color: result.diff > 0 ? "#86efac" : result.diff < 0 ? "#f87171" : "#a1a1aa" }}>
              Time difference: {fmtDiff(result.diff)}
            </p>
          </div>
        )}
      </div>

      <p style={{ marginTop: "1.5rem", fontSize: "0.7rem", color: "#3f3f46", textAlign: "center" }}>
        Uses your browser&apos;s Intl.DateTimeFormat. DST transitions are handled automatically.
      </p>
    </div>
  );
}
