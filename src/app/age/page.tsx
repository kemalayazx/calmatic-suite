"use client";

import { useState } from "react";
import { calculateAge, AgeResult } from "@/lib/calculations/age";

const INPUT_STYLE: React.CSSProperties = {
  background: "#0a0a0b",
  border: "1px solid #27272a",
  borderRadius: "0.5rem",
  color: "#f4f4f5",
  padding: "0.6rem 0.75rem",
  fontSize: "1rem",
  width: "100%",
  boxSizing: "border-box",
};

const CARD: React.CSSProperties = {
  background: "#111113",
  border: "1px solid #27272a",
  borderRadius: "0.75rem",
  padding: "1rem 1.25rem",
};

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ ...CARD, textAlign: "center" }}>
      <div style={{ fontSize: "0.7rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>{label}</div>
      <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f4f4f5" }}>{value}</div>
      {sub && <div style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "0.2rem" }}>{sub}</div>}
    </div>
  );
}

export default function AgePage() {
  const [birth, setBirth] = useState("");
  const [result, setResult] = useState<AgeResult | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      if (!birth) throw new Error("Please enter a birth date");
      const r = calculateAge(birth);
      setResult(r);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    }
  }

  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div style={{ maxWidth: "42rem", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <h1 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 800, color: "#f472b6", marginBottom: "1.5rem" }}>
        Age Calculator
      </h1>

      <div style={{ background: "#111113", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <label style={{ fontSize: "0.85rem", color: "#a1a1aa", display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
          Date of Birth
        </label>
        <input
          type="date"
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
          max={maxDate}
          style={INPUT_STYLE}
        />
        {error && <p style={{ color: "#f87171", fontSize: "0.85rem", marginTop: "0.5rem" }}>{error}</p>}
        <button
          onClick={calculate}
          style={{ marginTop: "1rem", background: "#db2777", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.65rem 2rem", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}
        >
          Calculate Age
        </button>
      </div>

      {result && (
        <>
          {/* Main age */}
          <div style={{ background: "linear-gradient(135deg, #831843 0%, #500724 100%)", border: "1px solid #9d174d", borderRadius: "0.75rem", padding: "1.5rem", textAlign: "center", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#fbcfe8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Your Age</div>
            <div style={{ fontSize: "3rem", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
              {result.years}
              <span style={{ fontSize: "1.25rem", fontWeight: 500, color: "#fbcfe8", marginLeft: "0.25rem" }}>years</span>
            </div>
            <div style={{ fontSize: "1.1rem", color: "#fbcfe8", marginTop: "0.5rem" }}>
              {result.months} months &amp; {result.days} days
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <Stat label="Total Days" value={result.totalDays.toLocaleString()} />
            <Stat label="Total Weeks" value={result.totalWeeks.toLocaleString()} />
            <Stat label="Total Hours" value={"~" + (result.totalHours / 1000).toFixed(0) + "k"} sub={result.totalHours.toLocaleString() + " hrs"} />
            <Stat label="Next Birthday" value={result.daysUntilNextBirthday === 0 ? "Today!" : result.daysUntilNextBirthday + " days"} sub="days remaining" />
          </div>

          {/* Days of week + zodiac */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={CARD}>
              <div style={{ fontSize: "0.7rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Born on</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f4f4f5" }}>{result.birthdayDOW}</div>
              <div style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "0.25rem" }}>This year falls on {result.thisBirthdayDOW}</div>
            </div>
            <div style={CARD}>
              <div style={{ fontSize: "0.7rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Zodiac</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f4f4f5" }}>{result.zodiac}</div>
              <div style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "0.25rem" }}>Chinese: {result.chineseZodiac}</div>
            </div>
          </div>
        </>
      )}

      <p style={{ marginTop: "1.5rem", fontSize: "0.7rem", color: "#3f3f46", textAlign: "center" }}>
        Calculations based on today&apos;s date. Zodiac signs based on Western astrology conventions.
      </p>
    </div>
  );
}
