"use client";

import { useState } from "react";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { CATEGORIES, convert } from "@/lib/calculations/units";
import { useLanguage } from "@/context/LanguageContext";

function fmt(n: number) {
  if (!isFinite(n)) return "—";
  if (Number.isInteger(n)) return n.toLocaleString("en-US");
  return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#27272a",
  border: "1px solid #3f3f46",
  borderRadius: "0.75rem",
  color: "#fafafa",
  padding: "0.75rem 1rem",
  fontSize: "1.25rem",
  fontWeight: 600,
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: "#27272a",
  border: "1px solid #3f3f46",
  borderRadius: "0.75rem",
  color: "#fafafa",
  padding: "0.75rem 1rem",
  fontSize: "0.95rem",
  outline: "none",
  cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#a1a1aa",
  display: "block",
  marginBottom: "0.375rem",
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const CATEGORY_KEYS = Object.keys(CATEGORIES);

export default function UnitsPage() {
  const { t } = useLanguage();
  const [categoryKey, setCategoryKey] = useState("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");
  const [inputValue, setInputValue] = useState("1");

  const category = CATEGORIES[categoryKey];
  const unitKeys = Object.keys(category.units);

  function handleCategoryChange(key: string) {
    setCategoryKey(key);
    const units = Object.keys(CATEGORIES[key].units);
    setFromUnit(units[0]);
    setToUnit(units[1] ?? units[0]);
    setInputValue("1");
  }

  function handleSwap() {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }

  const numVal = parseFloat(inputValue);
  const result = !isNaN(numVal) ? convert(numVal, fromUnit, toUnit, categoryKey) : null;

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
        <Link href="/" style={{ color: "#71717a", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={18} />
        </Link>
        <h1 style={{ fontWeight: 700, fontSize: "1.35rem", color: "#fafafa" }}>{t("units.title")}</h1>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {CATEGORY_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => handleCategoryChange(key)}
            style={{
              padding: "0.4rem 0.875rem",
              borderRadius: "0.625rem",
              border: "1px solid",
              borderColor: categoryKey === key ? "#6366f1" : "#27272a",
              background: categoryKey === key ? "#6366f122" : "transparent",
              color: categoryKey === key ? "#a5b4fc" : "#71717a",
              fontSize: "0.82rem",
              fontWeight: categoryKey === key ? 700 : 400,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {CATEGORIES[key].name}
          </button>
        ))}
      </div>

      <div style={{ background: "#18181b", borderRadius: "1rem", border: "1px solid #27272a", padding: "1.75rem" }}>
        {/* Input */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={labelStyle}>{t("units.label.value")}</label>
          <input
            type="number"
            style={inputStyle}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="1"
          />
        </div>

        {/* From / Swap / To */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t("units.label.from")}</label>
            <select style={selectStyle} value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
              {unitKeys.map((key) => (
                <option key={key} value={key}>{category.units[key].label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwap}
            style={{
              flexShrink: 0,
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeftRight size={16} color="white" />
          </button>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t("units.label.to")}</label>
            <select style={selectStyle} value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
              {unitKeys.map((key) => (
                <option key={key} value={key}>{category.units[key].label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Result */}
        {result !== null && (
          <div style={{
            background: "#09090b",
            border: "1px solid #6366f133",
            borderRadius: "1rem",
            padding: "1.5rem",
            textAlign: "center",
          }}>
            <p style={{ color: "#71717a", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
              {inputValue} {fromUnit} =
            </p>
            <p style={{ fontSize: "2.5rem", fontWeight: 900, color: "#a5b4fc" }}>
              {fmt(result)} <span style={{ fontSize: "1.25rem" }}>{toUnit}</span>
            </p>
          </div>
        )}
      </div>

      {/* All conversions for entered value */}
      {result !== null && (
        <div style={{ background: "#18181b", borderRadius: "1rem", border: "1px solid #27272a", padding: "1.5rem", marginTop: "1.25rem" }}>
          <p style={{ fontSize: "0.85rem", color: "#a1a1aa", fontWeight: 600, marginBottom: "1rem" }}>
            {inputValue} {fromUnit} {t("units.allConversionsIn")} {category.name.toLowerCase()} {t("units.allConversionsUnits")}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {unitKeys.filter((k) => k !== fromUnit).map((key) => {
              const val = convert(numVal, fromUnit, key, categoryKey);
              return (
                <div
                  key={key}
                  onClick={() => setToUnit(key)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.5rem 0.75rem",
                    background: key === toUnit ? "#6366f122" : "#09090b",
                    border: `1px solid ${key === toUnit ? "#6366f144" : "#1c1c1f"}`,
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "0.82rem", color: "#71717a" }}>{key}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: key === toUnit ? "#a5b4fc" : "#fafafa", fontWeight: key === toUnit ? 700 : 400 }}>
                    {fmt(val)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p style={{ textAlign: "center", color: "#3f3f46", fontSize: "0.75rem", marginTop: "1.25rem" }}>
        {t("common.disclaimer")}
      </p>
    </div>
  );
}
