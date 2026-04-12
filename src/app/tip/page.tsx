"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { calcTip, CURRENCY_SYMBOLS, type Currency } from "@/lib/calculations/tip";

const PRESET_TIPS = [5, 10, 15, 20, 25];

const inputStyle: React.CSSProperties = {
  background: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "8px",
  color: "#fafafa",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#71717a",
  marginBottom: "4px",
  display: "block",
};

export default function TipPage() {
  const [bill, setBill] = useState("100");
  const [tipPercent, setTipPercent] = useState(15);
  const [customTip, setCustomTip] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [people, setPeople] = useState(1);
  const [currency, setCurrency] = useState<Currency>("TRY");

  const activeTip = useCustom ? parseFloat(customTip) || 0 : tipPercent;

  const result = useMemo(() => {
    const b = parseFloat(bill) || 0;
    if (b <= 0) return null;
    return calcTip(b, activeTip, people, currency);
  }, [bill, activeTip, people, currency]);

  const sym = CURRENCY_SYMBOLS[currency];

  function fmt(n: number) {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

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
          background: "linear-gradient(135deg,#bef264,#65a30d)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Tip Calculator
      </h1>

      <div
        style={{
          background: "rgba(24,24,27,0.6)",
          border: "1px solid #27272a",
          borderRadius: "1rem",
          padding: "1.75rem",
          maxWidth: "480px",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {/* Bill + Currency */}
        <div>
          <label style={labelStyle}>Bill amount</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="number"
              min={0}
              value={bill}
              onChange={(e) => setBill(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
              placeholder="0.00"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              style={{ ...inputStyle, width: "80px" }}
            >
              {(Object.keys(CURRENCY_SYMBOLS) as Currency[]).map((c) => (
                <option key={c} value={c}>{CURRENCY_SYMBOLS[c]} {c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tip rate pills */}
        <div>
          <label style={labelStyle}>Tip rate</label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {PRESET_TIPS.map((p) => (
              <button
                key={p}
                onClick={() => { setUseCustom(false); setTipPercent(p); }}
                style={{
                  padding: "0.4rem 0.9rem",
                  borderRadius: "2rem",
                  border: "1px solid",
                  borderColor: !useCustom && tipPercent === p ? "#65a30d" : "#3f3f46",
                  background: !useCustom && tipPercent === p ? "#65a30d22" : "#18181b",
                  color: !useCustom && tipPercent === p ? "#bef264" : "#71717a",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: !useCustom && tipPercent === p ? 700 : 400,
                }}
              >
                {p}%
              </button>
            ))}
            <button
              onClick={() => setUseCustom(true)}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "2rem",
                border: "1px solid",
                borderColor: useCustom ? "#65a30d" : "#3f3f46",
                background: useCustom ? "#65a30d22" : "#18181b",
                color: useCustom ? "#bef264" : "#71717a",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Custom
            </button>
          </div>
          {useCustom && (
            <input
              type="number"
              min={0}
              max={200}
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value)}
              placeholder="Enter %"
              style={{ ...inputStyle, marginTop: "0.5rem", width: "120px" }}
            />
          )}
        </div>

        {/* People stepper */}
        <div>
          <label style={labelStyle}>Number of people</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={() => setPeople((p) => Math.max(1, p - 1))}
              style={{
                width: "36px", height: "36px", borderRadius: "8px",
                border: "1px solid #3f3f46", background: "#27272a",
                color: "#fafafa", cursor: "pointer", fontSize: "1.25rem", lineHeight: 1,
              }}
            >
              −
            </button>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, minWidth: "28px", textAlign: "center" }}>{people}</span>
            <button
              onClick={() => setPeople((p) => Math.min(20, p + 1))}
              style={{
                width: "36px", height: "36px", borderRadius: "8px",
                border: "1px solid #3f3f46", background: "#27272a",
                color: "#fafafa", cursor: "pointer", fontSize: "1.25rem", lineHeight: 1,
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div
            style={{
              background: "#111113",
              border: "1px solid #3f3f46",
              borderRadius: "10px",
              padding: "1rem",
              display: "grid",
              gap: "0.75rem",
            }}
          >
            {[
              { label: "Tip amount", value: `${sym}${fmt(result.tipAmount)}` },
              { label: "Total amount", value: `${sym}${fmt(result.totalAmount)}` },
              { label: `Per person (${people})`, value: `${sym}${fmt(result.perPerson)}`, highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#71717a", fontSize: "0.875rem" }}>{label}</span>
                <span
                  style={{
                    fontSize: highlight ? "1.5rem" : "1.1rem",
                    fontWeight: 800,
                    color: highlight ? "#bef264" : "#fafafa",
                    fontFamily: "monospace",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p style={{ marginTop: "2rem", color: "#3f3f46", fontSize: "0.8rem" }}>
        Results are for informational purposes only.
      </p>
    </div>
  );
}
