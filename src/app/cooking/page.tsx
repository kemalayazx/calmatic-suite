"use client";

import { useState } from "react";
import {
  scaleRecipe,
  COOKING_CONVERSIONS,
  convertCookingUnit,
  convertTemp,
  BAKING_RATIOS,
  calculateBakingRatio,
} from "@/lib/calculations/cooking";
import { useLanguage } from "@/context/LanguageContext";

export default function CookingPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [t("cooking.tab.scaler"), t("cooking.tab.conversion"), t("cooking.tab.bakingRatios")];

  // Tab 1
  const [origServings, setOrigServings] = useState("4");
  const [targetServings, setTargetServings] = useState("8");
  const [ingredients, setIngredients] = useState([
    { amount: "2", unit: "cup", name: "Flour" },
    { amount: "1", unit: "cup", name: "Sugar" },
    { amount: "0.5", unit: "cup", name: "Butter" },
    { amount: "2", unit: "tsp", name: "Baking powder" },
  ]);

  const addIngredient = () => setIngredients([...ingredients, { amount: "1", unit: "g", name: "" }]);
  const removeIngredient = (i: number) => setIngredients(ingredients.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, field: "amount" | "unit" | "name", value: string) => {
    const copy = [...ingredients];
    copy[i] = { ...copy[i], [field]: value };
    setIngredients(copy);
  };

  const scaledIngredients = scaleRecipe(
    ingredients.map((ing) => ({ amount: parseFloat(ing.amount) || 0, unit: ing.unit, name: ing.name })),
    parseFloat(origServings) || 1,
    parseFloat(targetServings) || 1
  );

  // Tab 2
  const [convValue, setConvValue] = useState("1");
  const [convFrom, setConvFrom] = useState("cup");
  const [convTo, setConvTo] = useState("mL");
  const [tempValue, setTempValue] = useState("350");
  const [tempDir, setTempDir] = useState<"F" | "C">("F");

  const allUnits = COOKING_CONVERSIONS.flatMap((c) => c.conversions.flatMap((co) => [co.from, co.to]));
  const uniqueUnits = Array.from(new Set(allUnits));
  const convResult = convertCookingUnit(parseFloat(convValue) || 0, convFrom, convTo);
  const tempResult = convertTemp(parseFloat(tempValue) || 0, tempDir);

  // Tab 3
  const [selectedRatio, setSelectedRatio] = useState(0);
  const [flourAmount, setFlourAmount] = useState("500");

  const bakingResult = calculateBakingRatio(BAKING_RATIOS[selectedRatio], parseFloat(flourAmount) || 0);

  function formatAmount(val: number, unit: string): string {
    if (unit === "eggs (large)") return val.toFixed(2) + " eggs";
    if (val < 0.01) return (val * 1000).toFixed(2) + " m" + unit;
    return val.toFixed(unit === "tsp" || unit === "mL" ? 1 : 1) + " " + unit;
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>{t("cooking.title")}</h1>
      <p style={{ color: "#71717a", marginBottom: "2rem" }}>{t("cooking.subtitle")}</p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", borderBottom: "1px solid #27272a" }}>
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            style={{ padding: "0.625rem 1.25rem", border: "none", background: "transparent", color: activeTab === i ? "#a78bfa" : "#71717a", fontWeight: activeTab === i ? 700 : 400, cursor: "pointer", fontSize: "0.9rem", borderBottom: activeTab === i ? "2px solid #7c3aed" : "2px solid transparent" }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 1 — Recipe Scaler */}
      {activeTab === 0 && (
        <div>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>{t("cooking.label.originalServings")}</label>
              <input type="number" value={origServings} onChange={(e) => setOrigServings(e.target.value)}
                style={{ width: "120px", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.95rem" }} />
            </div>
            <div>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>{t("cooking.label.targetServings")}</label>
              <input type="number" value={targetServings} onChange={(e) => setTargetServings(e.target.value)}
                style={{ width: "120px", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.95rem" }} />
            </div>
            <div style={{ fontSize: "0.875rem", color: "#71717a", paddingBottom: "0.5rem" }}>
              {t("cooking.label.scale")}: <strong style={{ color: "#a78bfa" }}>×{(parseFloat(targetServings) / parseFloat(origServings) || 0).toFixed(3)}</strong>
            </div>
          </div>

          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", overflow: "hidden", marginBottom: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "80px 90px 1fr 120px 32px", gap: "0.5rem", padding: "0.75rem 1.25rem", borderBottom: "1px solid #3f3f46" }}>
              <div style={{ fontSize: "0.75rem", color: "#71717a", fontWeight: 600 }}>{t("cooking.col.amount")}</div>
              <div style={{ fontSize: "0.75rem", color: "#71717a", fontWeight: 600 }}>{t("cooking.col.unit")}</div>
              <div style={{ fontSize: "0.75rem", color: "#71717a", fontWeight: 600 }}>{t("cooking.col.ingredient")}</div>
              <div style={{ fontSize: "0.75rem", color: "#71717a", fontWeight: 600 }}>{t("cooking.col.scaled")}</div>
              <div />
            </div>
            {ingredients.map((ing, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 90px 1fr 120px 32px", gap: "0.5rem", padding: "0.5rem 1.25rem", borderBottom: "1px solid #27272a", alignItems: "center" }}>
                <input type="number" value={ing.amount} onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                  style={{ padding: "0.35rem 0.5rem", borderRadius: "0.375rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.85rem", width: "100%" }} />
                <input type="text" value={ing.unit} onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                  style={{ padding: "0.35rem 0.5rem", borderRadius: "0.375rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.85rem", width: "100%" }} />
                <input type="text" value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)}
                  placeholder={t("cooking.placeholder.ingredientName")}
                  style={{ padding: "0.35rem 0.5rem", borderRadius: "0.375rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.85rem", width: "100%" }} />
                <div style={{ color: "#86efac", fontWeight: 600, fontSize: "0.875rem" }}>
                  {scaledIngredients[i] ? scaledIngredients[i].scaledAmount.toFixed(3) + " " + ing.unit : "—"}
                </div>
                <button onClick={() => removeIngredient(i)}
                  style={{ background: "none", border: "none", color: "#52525b", cursor: "pointer", fontSize: "1.1rem" }}>×</button>
              </div>
            ))}
          </div>
          <button onClick={addIngredient}
            style={{ padding: "0.5rem 1.25rem", background: "#27272a", border: "1px solid #3f3f46", borderRadius: "0.5rem", color: "#a1a1aa", cursor: "pointer", fontSize: "0.875rem" }}>
            {t("cooking.btn.addIngredient")}
          </button>
        </div>
      )}

      {/* Tab 2 — Unit Conversion */}
      {activeTab === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: "1.25rem" }}>{t("cooking.section.volumeWeight")}</div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>{t("cooking.label.value")}</label>
              <input type="number" value={convValue} onChange={(e) => setConvValue(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.95rem" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>{t("cooking.label.from")}</label>
                <select value={convFrom} onChange={(e) => setConvFrom(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.9rem" }}>
                  {uniqueUnits.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>{t("cooking.label.to")}</label>
                <select value={convTo} onChange={(e) => setConvTo(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.9rem" }}>
                  {uniqueUnits.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div style={{ padding: "0.875rem", background: "#09090b", borderRadius: "0.5rem", textAlign: "center" }}>
              {convResult !== null ? (
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#22c55e" }}>
                  {convResult.toFixed(4)} {convTo}
                </div>
              ) : (
                <div style={{ color: "#71717a", fontSize: "0.875rem" }}>{t("cooking.msg.noConversion")}</div>
              )}
              <div style={{ fontSize: "0.8rem", color: "#71717a", marginTop: "0.25rem" }}>
                {convValue} {convFrom}
              </div>
            </div>
          </div>

          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: "1.25rem" }}>{t("cooking.section.temperature")}</div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>{t("cooking.label.temperature")}</label>
              <input type="number" value={tempValue} onChange={(e) => setTempValue(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.95rem" }} />
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <button onClick={() => setTempDir("F")}
                style={{ flex: 1, padding: "0.5rem", borderRadius: "0.5rem", border: "none", background: tempDir === "F" ? "#7c3aed" : "#27272a", color: tempDir === "F" ? "white" : "#a1a1aa", cursor: "pointer", fontWeight: 700 }}>
                °F → °C
              </button>
              <button onClick={() => setTempDir("C")}
                style={{ flex: 1, padding: "0.5rem", borderRadius: "0.5rem", border: "none", background: tempDir === "C" ? "#7c3aed" : "#27272a", color: tempDir === "C" ? "white" : "#a1a1aa", cursor: "pointer", fontWeight: 700 }}>
                °C → °F
              </button>
            </div>
            <div style={{ padding: "0.875rem", background: "#09090b", borderRadius: "0.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#22c55e" }}>
                {tempResult.toFixed(1)}°{tempDir === "F" ? "C" : "F"}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#71717a", marginTop: "0.25rem" }}>
                {tempValue}°{tempDir}
              </div>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.5rem" }}>{t("cooking.label.commonOvenTemps")}</div>
              {[[325, 163], [350, 177], [375, 190], [400, 204], [425, 218]].map(([f, c]) => (
                <div key={f} style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", fontSize: "0.8rem" }}>
                  <span style={{ color: "#a1a1aa" }}>{f}°F</span>
                  <span style={{ color: "#fafafa" }}>{c}°C</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3 — Baking Ratios */}
      {activeTab === 2 && (
        <div>
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {BAKING_RATIOS.map((r, i) => (
              <button key={i} onClick={() => setSelectedRatio(i)}
                style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: selectedRatio === i ? "#7c3aed" : "#27272a", color: selectedRatio === i ? "white" : "#a1a1aa", cursor: "pointer", fontSize: "0.875rem", fontWeight: selectedRatio === i ? 700 : 400 }}>
                {r.name}
              </button>
            ))}
          </div>

          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontWeight: 700, color: "#a78bfa", fontSize: "1.1rem" }}>{BAKING_RATIOS[selectedRatio].name}</div>
              <div style={{ fontSize: "0.85rem", color: "#71717a", marginTop: "0.25rem" }}>{BAKING_RATIOS[selectedRatio].description}</div>
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>{t("cooking.label.flourAmountG")}</label>
              <input type="number" value={flourAmount} onChange={(e) => setFlourAmount(e.target.value)}
                style={{ width: "180px", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.95rem" }} />
            </div>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {bakingResult.map((item) => (
                <div key={item.ingredient} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.625rem 0.875rem", background: "#09090b", borderRadius: "0.5rem" }}>
                  <span style={{ color: "#a1a1aa", fontSize: "0.9rem" }}>{item.ingredient}</span>
                  <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "0.9rem" }}>
                    {item.ingredient === "Eggs" || item.unit.includes("egg") ? item.amount.toFixed(1) + " eggs" : item.amount.toFixed(1) + " " + item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <p style={{ marginTop: "3rem", fontSize: "0.8rem", color: "#52525b", borderTop: "1px solid #27272a", paddingTop: "1rem" }}>
        {t("common.disclaimerProfessional")}
      </p>
    </div>
  );
}
