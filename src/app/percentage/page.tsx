"use client";

import { useState } from "react";
import {
  whatIsXPercentOfY,
  xIsWhatPercentOfY,
  percentChange,
  calcMarginMarkup,
  calcSellingPriceFromMargin,
} from "@/lib/calculations/percentage";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy}
      style={{ padding: "0.3rem 0.75rem", background: "#27272a", border: "1px solid #3f3f46", borderRadius: "0.375rem", color: "#a1a1aa", cursor: "pointer", fontSize: "0.75rem" }}>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function PercentagePage() {
  // Q1
  const [q1x, setQ1x] = useState("15");
  const [q1y, setQ1y] = useState("200");
  // Q2
  const [q2x, setQ2x] = useState("45");
  const [q2y, setQ2y] = useState("300");
  // Q3
  const [q3from, setQ3from] = useState("80");
  const [q3to, setQ3to] = useState("100");
  // Margin/Markup
  const [cost, setCost] = useState("50");
  const [selling, setSelling] = useState("80");
  const [targetMargin, setTargetMargin] = useState("40");
  const [mmMode, setMmMode] = useState<"calc" | "target">("calc");

  const q1Result = whatIsXPercentOfY(parseFloat(q1x) || 0, parseFloat(q1y) || 0);
  const q2Result = xIsWhatPercentOfY(parseFloat(q2x) || 0, parseFloat(q2y) || 0);
  const q3Result = percentChange(parseFloat(q3from) || 0, parseFloat(q3to) || 0);

  const mmResult = mmMode === "calc"
    ? calcMarginMarkup(parseFloat(cost) || 0, parseFloat(selling) || 0)
    : calcSellingPriceFromMargin(parseFloat(cost) || 0, parseFloat(targetMargin) || 0);

  const sectionStyle = {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "0.75rem",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>Percentage Calculator</h1>
      <p style={{ color: "#71717a", marginBottom: "2rem" }}>Quick percentage questions + margin vs markup calculator.</p>

      {/* Q1 */}
      <div style={sectionStyle}>
        <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: "1rem" }}>What is X% of Y?</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ color: "#71717a" }}>What is</span>
          <input type="number" value={q1x} onChange={(e) => setQ1x(e.target.value)}
            style={{ width: "90px", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.95rem" }} />
          <span style={{ color: "#71717a" }}>% of</span>
          <input type="number" value={q1y} onChange={(e) => setQ1y(e.target.value)}
            style={{ width: "110px", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.95rem" }} />
          <span style={{ color: "#71717a" }}>?</span>
        </div>
        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "#22c55e" }}>{q1Result.toLocaleString("en-US", { maximumFractionDigits: 4 })}</span>
          <CopyButton value={q1Result.toString()} />
        </div>
        <div style={{ fontSize: "0.8rem", color: "#71717a", marginTop: "0.25rem" }}>
          {q1x}% of {q1y} = {q1Result.toFixed(4)}
        </div>
      </div>

      {/* Q2 */}
      <div style={sectionStyle}>
        <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: "1rem" }}>X is what % of Y?</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <input type="number" value={q2x} onChange={(e) => setQ2x(e.target.value)}
            style={{ width: "110px", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.95rem" }} />
          <span style={{ color: "#71717a" }}>is what % of</span>
          <input type="number" value={q2y} onChange={(e) => setQ2y(e.target.value)}
            style={{ width: "110px", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.95rem" }} />
          <span style={{ color: "#71717a" }}>?</span>
        </div>
        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "#22c55e" }}>{q2Result.toFixed(4)}%</span>
          <CopyButton value={q2Result.toFixed(4) + "%"} />
        </div>
        <div style={{ fontSize: "0.8rem", color: "#71717a", marginTop: "0.25rem" }}>
          {q2x} / {q2y} × 100 = {q2Result.toFixed(4)}%
        </div>
      </div>

      {/* Q3 */}
      <div style={sectionStyle}>
        <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: "1rem" }}>% Change from X to Y</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ color: "#71717a" }}>From</span>
          <input type="number" value={q3from} onChange={(e) => setQ3from(e.target.value)}
            style={{ width: "110px", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.95rem" }} />
          <span style={{ color: "#71717a" }}>to</span>
          <input type="number" value={q3to} onChange={(e) => setQ3to(e.target.value)}
            style={{ width: "110px", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.95rem" }} />
        </div>
        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "1.75rem", fontWeight: 800, color: q3Result.isIncrease ? "#22c55e" : "#f87171" }}>
            {q3Result.isIncrease ? "+" : ""}{q3Result.change.toFixed(4)}%
          </span>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: "0.375rem", background: q3Result.isIncrease ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: q3Result.isIncrease ? "#22c55e" : "#f87171" }}>
            {q3Result.isIncrease ? "Increase" : "Decrease"}
          </span>
          <CopyButton value={q3Result.change.toFixed(4) + "%"} />
        </div>
        <div style={{ fontSize: "0.8rem", color: "#71717a", marginTop: "0.25rem" }}>
          ({q3to} − {q3from}) / |{q3from}| × 100
        </div>
      </div>

      {/* Margin vs Markup */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div style={{ fontWeight: 700, color: "#a78bfa" }}>Margin vs Markup</div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => setMmMode("calc")}
              style={{ padding: "0.3rem 0.75rem", borderRadius: "0.375rem", border: "none", background: mmMode === "calc" ? "#7c3aed" : "#27272a", color: mmMode === "calc" ? "white" : "#a1a1aa", cursor: "pointer", fontSize: "0.8rem" }}>
              Cost + Price
            </button>
            <button onClick={() => setMmMode("target")}
              style={{ padding: "0.3rem 0.75rem", borderRadius: "0.375rem", border: "none", background: mmMode === "target" ? "#7c3aed" : "#27272a", color: mmMode === "target" ? "white" : "#a1a1aa", cursor: "pointer", fontSize: "0.8rem" }}>
              Target Margin
            </button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>Cost ($)</label>
            <input type="number" value={cost} onChange={(e) => setCost(e.target.value)}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.9rem" }} />
          </div>
          {mmMode === "calc" ? (
            <div>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>Selling Price ($)</label>
              <input type="number" value={selling} onChange={(e) => setSelling(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.9rem" }} />
            </div>
          ) : (
            <div>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>Target Margin (%)</label>
              <input type="number" value={targetMargin} onChange={(e) => setTargetMargin(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.9rem" }} />
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem" }}>
          {[
            { label: "Selling Price", value: "$" + (mmResult.sellingPrice).toFixed(2) },
            { label: "Profit", value: "$" + mmResult.profit.toFixed(2) },
            { label: "Margin", value: mmResult.margin.toFixed(2) + "%" },
            { label: "Markup", value: mmResult.markup.toFixed(2) + "%" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "#09090b", borderRadius: "0.5rem", padding: "0.875rem", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.3rem" }}>{label}</div>
              <div style={{ fontWeight: 700, color: "#fafafa", fontSize: "1.1rem" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <p style={{ marginTop: "2rem", fontSize: "0.8rem", color: "#52525b", borderTop: "1px solid #27272a", paddingTop: "1rem" }}>
        Results are for informational purposes only. Consult a qualified professional for official decisions.
      </p>
    </div>
  );
}
