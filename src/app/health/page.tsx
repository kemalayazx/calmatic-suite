"use client";

import { useState } from "react";
import Link from "next/link";
import {
  calcBMI,
  calcBMR,
  calcIdealWeight,
  ACTIVITY_LABELS,
  type Gender,
  type ActivityLevel,
} from "@/lib/calculations/health";

// ─── Styles ───────────────────────────────────────────────────────────────────

const TABS = ["BMI", "Calorie (BMR)", "Ideal Weight"] as const;
type Tab = (typeof TABS)[number];

const inputStyle: React.CSSProperties = {
  background: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "8px",
  color: "#fafafa",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#71717a",
  marginBottom: "4px",
  display: "block",
};

const btnPrimary: React.CSSProperties = {
  padding: "0.6rem 1.25rem",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg,#16a34a,#15803d)",
  color: "#fafafa",
  cursor: "pointer",
  fontSize: "0.875rem",
  fontWeight: 600,
};

const resultBox: React.CSSProperties = {
  background: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "10px",
  padding: "1rem",
  marginTop: "1rem",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

// ─── Tab: BMI ─────────────────────────────────────────────────────────────────

function BMITab() {
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("70");
  const [result, setResult] = useState<ReturnType<typeof calcBMI> | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Field label="Height (cm)">
          <input style={{ ...inputStyle, width: "120px" }} type="number" min={50} max={250} value={height} onChange={(e) => setHeight(e.target.value)} />
        </Field>
        <Field label="Weight (kg)">
          <input style={{ ...inputStyle, width: "120px" }} type="number" min={10} max={500} value={weight} onChange={(e) => setWeight(e.target.value)} />
        </Field>
      </div>

      <button style={btnPrimary} onClick={() => setResult(calcBMI(parseFloat(weight), parseFloat(height)))}>
        Calculate BMI
      </button>

      {result && (
        <div style={resultBox}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "3rem", fontWeight: 900, color: result.color }}>{result.bmi}</div>
            <div style={{ fontSize: "1rem", color: result.color, fontWeight: 600 }}>{result.category}</div>
          </div>

          {/* Gauge bar */}
          <div style={{ position: "relative", height: "20px", borderRadius: "10px", background: "linear-gradient(to right, #38bdf8 0%, #4ade80 25%, #fb923c 50%, #f87171 75%, #dc2626 100%)", marginBottom: "0.5rem" }}>
            <div
              style={{
                position: "absolute",
                top: "-4px",
                left: `${result.position}%`,
                width: "12px",
                height: "28px",
                borderRadius: "4px",
                background: "#fff",
                border: "2px solid #27272a",
                transform: "translateX(-50%)",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#52525b" }}>
            <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
          </div>

          <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#71717a" }}>
            Formula: weight (kg) / height (m)²
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: BMR ─────────────────────────────────────────────────────────────────

function BMRTab() {
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("25");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("70");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [result, setResult] = useState<ReturnType<typeof calcBMR> | null>(null);

  function solve() {
    setResult(calcBMR(gender, parseInt(age), parseFloat(height), parseFloat(weight), activity));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Field label="Gender">
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["male", "female"] as Gender[]).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "8px",
                border: "1px solid #3f3f46",
                background: gender === g ? "#16a34a33" : "#18181b",
                color: gender === g ? "#4ade80" : "#71717a",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: gender === g ? 600 : 400,
              }}
            >
              {g === "male" ? "Male" : "Female"}
            </button>
          ))}
        </div>
      </Field>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Field label="Age">
          <input style={{ ...inputStyle, width: "80px" }} type="number" min={1} max={120} value={age} onChange={(e) => setAge(e.target.value)} />
        </Field>
        <Field label="Height (cm)">
          <input style={{ ...inputStyle, width: "100px" }} type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
        </Field>
        <Field label="Weight (kg)">
          <input style={{ ...inputStyle, width: "100px" }} type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </Field>
      </div>

      <Field label="Activity level">
        <select value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)} style={inputStyle}>
          {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((k) => (
            <option key={k} value={k}>{ACTIVITY_LABELS[k]}</option>
          ))}
        </select>
      </Field>

      <button style={btnPrimary} onClick={solve}>Calculate</button>

      {result && (
        <div style={resultBox}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <div style={labelStyle}>BMR (Basal Metabolic Rate)</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#4ade80" }}>{result.bmr.toLocaleString()}</div>
              <div style={{ color: "#52525b", fontSize: "0.75rem" }}>kcal/day at rest</div>
            </div>
            <div>
              <div style={labelStyle}>Daily Calorie Need (TDEE)</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#86efac" }}>{result.tdee.toLocaleString()}</div>
              <div style={{ color: "#52525b", fontSize: "0.75rem" }}>kcal/day with activity</div>
            </div>
          </div>
          <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#52525b" }}>
            Harris-Benedict Equation · Activity multiplier: ×{({ sedentary: "1.2", light: "1.375", moderate: "1.55", active: "1.725", very_active: "1.9" })[activity]}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Ideal Weight ────────────────────────────────────────────────────────

function IdealWeightTab() {
  const [height, setHeight] = useState("175");
  const [gender, setGender] = useState<Gender>("male");
  const [result, setResult] = useState<ReturnType<typeof calcIdealWeight> | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Field label="Gender">
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["male", "female"] as Gender[]).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "8px",
                border: "1px solid #3f3f46",
                background: gender === g ? "#16a34a33" : "#18181b",
                color: gender === g ? "#4ade80" : "#71717a",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: gender === g ? 600 : 400,
              }}
            >
              {g === "male" ? "Male" : "Female"}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Height (cm)">
        <input style={{ ...inputStyle, width: "120px" }} type="number" min={100} max={250} value={height} onChange={(e) => setHeight(e.target.value)} />
      </Field>

      <button style={btnPrimary} onClick={() => setResult(calcIdealWeight(parseFloat(height), gender))}>
        Calculate
      </button>

      {result && (
        <div style={resultBox}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #3f3f46" }}>
                <th style={{ textAlign: "left", padding: "0.5rem 0.25rem", color: "#71717a", fontWeight: 500 }}>Formula</th>
                <th style={{ textAlign: "right", padding: "0.5rem 0.25rem", color: "#71717a", fontWeight: 500 }}>Weight (kg)</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.5rem", color: "#71717a", fontWeight: 500 }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {result.map(({ formula, weight, description }) => (
                <tr key={formula} style={{ borderBottom: "1px solid #27272a" }}>
                  <td style={{ padding: "0.625rem 0.25rem", color: "#fafafa", fontWeight: 600 }}>{formula}</td>
                  <td style={{ padding: "0.625rem 0.25rem", textAlign: "right", color: "#4ade80", fontWeight: 700, fontSize: "1.1rem" }}>{weight}</td>
                  <td style={{ padding: "0.625rem 0.5rem", color: "#52525b", fontSize: "0.75rem" }}>{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HealthPage() {
  const [activeTab, setActiveTab] = useState<Tab>("BMI");

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/" style={{ color: "#71717a", textDecoration: "none", fontSize: "0.875rem" }}>
          ← Back
        </Link>
      </div>

      <h1
        style={{
          fontWeight: 800,
          fontSize: "1.75rem",
          marginBottom: "1.75rem",
          background: "linear-gradient(135deg,#4ade80,#16a34a)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Health Calculators
      </h1>

      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", borderBottom: "1px solid #27272a", marginBottom: "1.75rem" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "0.625rem 1rem",
              border: "none",
              borderBottom: activeTab === t ? "2px solid #16a34a" : "2px solid transparent",
              background: "transparent",
              color: activeTab === t ? "#4ade80" : "#71717a",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: activeTab === t ? 600 : 400,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div
        style={{
          background: "rgba(24,24,27,0.6)",
          border: "1px solid #27272a",
          borderRadius: "1rem",
          padding: "1.75rem",
          maxWidth: "600px",
        }}
      >
        {activeTab === "BMI" && <BMITab />}
        {activeTab === "Calorie (BMR)" && <BMRTab />}
        {activeTab === "Ideal Weight" && <IdealWeightTab />}
      </div>

      <p style={{ marginTop: "2rem", color: "#3f3f46", fontSize: "0.8rem" }}>
        Results are for informational purposes only.
      </p>
    </div>
  );
}
