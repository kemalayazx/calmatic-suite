"use client";

import { useState, useEffect, useRef } from "react";
import {
  foodDatabase,
  searchFoods,
  calcTotals,
  calcMacroRatios,
  MACRO_PRESETS,
  type FoodItem,
  type LoggedFood,
  type MacroPreset,
} from "@/lib/calculations/calories";
import ExportButton from "@/components/ui/ExportButton";
import PrintButton from "@/components/ui/PrintButton";
import { useLanguage } from "@/context/LanguageContext";

const PORTION_OPTIONS = [0.5, 1, 1.5, 2, 3];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const;
type MealType = (typeof MEAL_TYPES)[number];

// ── Shared: Food Search Component ─────────────────────────────────────────────
function FoodSearch({
  customFoods,
  onAdd,
}: {
  customFoods: FoodItem[];
  onAdd: (food: FoodItem, portions: number) => void;
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portions, setPortions] = useState(1);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const res = searchFoods(query, customFoods);
    setResults(res.slice(0, 10));
    setOpen(res.length > 0 && query.length > 0);
  }, [query, customFoods]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function select(food: FoodItem) {
    setSelectedFood(food);
    setQuery(food.name);
    setPortions(1);
    setOpen(false);
  }

  function handleAdd() {
    if (!selectedFood) return;
    onAdd(selectedFood, portions);
    setQuery("");
    setSelectedFood(null);
    setPortions(1);
  }

  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
      <div ref={containerRef} style={{ position: "relative", flex: "1 1 240px" }}>
        <label style={{ display: "block", fontSize: "0.75rem", color: "#a1a1aa", marginBottom: "0.4rem" }}>
          {t("calories.label.searchFood")}
        </label>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedFood && e.target.value !== selectedFood.name) setSelectedFood(null);
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={t("calories.placeholder.searchFood")}
          style={{
            width: "100%",
            padding: "0.55rem 0.875rem",
            borderRadius: "0.5rem",
            border: "1px solid #3f3f46",
            background: "#18181b",
            color: "#fafafa",
            fontSize: "0.875rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {open && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              background: "#1c1c1f",
              border: "1px solid #3f3f46",
              borderRadius: "0.5rem",
              zIndex: 50,
              maxHeight: "260px",
              overflowY: "auto",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            }}
          >
            {results.map((food) => (
              <button
                key={food.id}
                onClick={() => select(food)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "0.6rem 0.875rem",
                  background: "transparent",
                  border: "none",
                  color: "#e4e4e7",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  borderBottom: "1px solid #27272a",
                }}
                onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#27272a")}
                onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
              >
                <span style={{ fontWeight: 500 }}>{food.name}</span>
                <span style={{ color: "#71717a", marginLeft: "0.5rem", fontSize: "0.78rem" }}>
                  {food.serving} · {food.calories} {t("calories.unit.cal")}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: "0 0 auto" }}>
        <label style={{ display: "block", fontSize: "0.75rem", color: "#a1a1aa", marginBottom: "0.4rem" }}>
          {t("calories.label.portions")}
        </label>
        <select
          value={portions}
          onChange={(e) => setPortions(Number(e.target.value))}
          style={{
            padding: "0.55rem 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #3f3f46",
            background: "#18181b",
            color: "#fafafa",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          {PORTION_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}x
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleAdd}
        disabled={!selectedFood}
        style={{
          padding: "0.55rem 1.25rem",
          borderRadius: "0.5rem",
          border: "none",
          background: selectedFood ? "#ef4444" : "#3f3f46",
          color: selectedFood ? "#fff" : "#71717a",
          fontWeight: 600,
          fontSize: "0.875rem",
          cursor: selectedFood ? "pointer" : "not-allowed",
          transition: "background 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        {t("calories.btn.addFood")}
      </button>
    </div>
  );
}

// ── Shared: Food Log Table ─────────────────────────────────────────────────────
function FoodLogTable({
  items,
  onRemove,
}: {
  items: LoggedFood[];
  onRemove: (id: string) => void;
}) {
  const { t } = useLanguage();
  if (items.length === 0) return null;

  return (
    <div style={{ overflowX: "auto", marginTop: "1rem" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #3f3f46" }}>
            {[
              t("calories.col.food"),
              t("calories.col.serving"),
              t("calories.col.portions"),
              t("calories.col.calories"),
              t("calories.col.fat"),
              t("calories.col.carbs"),
              t("calories.col.protein"),
              "",
            ].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: h === "" ? "center" : "left",
                  padding: "0.5rem 0.75rem",
                  color: "#71717a",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #27272a" }}>
              <td style={{ padding: "0.6rem 0.75rem", color: "#e4e4e7", fontWeight: 500 }}>{item.food.name}</td>
              <td style={{ padding: "0.6rem 0.75rem", color: "#71717a", fontSize: "0.8rem" }}>{item.food.serving}</td>
              <td style={{ padding: "0.6rem 0.75rem", color: "#a1a1aa" }}>{item.portions}x</td>
              <td style={{ padding: "0.6rem 0.75rem", color: "#fbbf24", fontWeight: 600 }}>
                {Math.round(item.food.calories * item.portions)}
              </td>
              <td style={{ padding: "0.6rem 0.75rem", color: "#f87171" }}>
                {(item.food.fat * item.portions).toFixed(1)}
              </td>
              <td style={{ padding: "0.6rem 0.75rem", color: "#facc15" }}>
                {(item.food.carbs * item.portions).toFixed(1)}
              </td>
              <td style={{ padding: "0.6rem 0.75rem", color: "#60a5fa" }}>
                {(item.food.protein * item.portions).toFixed(1)}
              </td>
              <td style={{ padding: "0.6rem 0.75rem", textAlign: "center" }}>
                <button
                  onClick={() => onRemove(item.id)}
                  style={{
                    background: "transparent",
                    border: "1px solid #3f3f46",
                    color: "#71717a",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    padding: "0.2rem 0.5rem",
                    fontSize: "0.8rem",
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#ef4444";
                    (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#3f3f46";
                    (e.currentTarget as HTMLButtonElement).style.color = "#71717a";
                  }}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Shared: Totals Cards ───────────────────────────────────────────────────────
function TotalsCards({ items }: { items: LoggedFood[] }) {
  const { t } = useLanguage();
  const totals = calcTotals(items);

  const cards = [
    { label: t("calories.total.calories"), value: Math.round(totals.calories), unit: "kcal", color: "#fbbf24" },
    { label: t("calories.total.fat"), value: totals.fat.toFixed(1), unit: "g", color: "#f87171" },
    { label: t("calories.total.carbs"), value: totals.carbs.toFixed(1), unit: "g", color: "#facc15" },
    { label: t("calories.total.protein"), value: totals.protein.toFixed(1), unit: "g", color: "#60a5fa" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginTop: "1.25rem" }}>
      {cards.map((c) => (
        <div
          key={c.label}
          style={{
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "0.75rem",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: c.color }}>
            {c.value}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "0.25rem" }}>{c.unit}</div>
          <div style={{ fontSize: "0.75rem", color: "#a1a1aa", marginTop: "0.2rem" }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Tab 1: Food Search & Log ───────────────────────────────────────────────────
function Tab1({
  customFoods,
  loggedFoods,
  setLoggedFoods,
}: {
  customFoods: FoodItem[];
  loggedFoods: LoggedFood[];
  setLoggedFoods: React.Dispatch<React.SetStateAction<LoggedFood[]>>;
}) {
  const { t } = useLanguage();

  function addFood(food: FoodItem, portions: number) {
    setLoggedFoods((prev) => [
      ...prev,
      { food, portions, id: `${food.id}-${Date.now()}` },
    ]);
  }

  function removeFood(id: string) {
    setLoggedFoods((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fafafa", marginBottom: "1.25rem" }}>
        {t("calories.tab.foodSearch")}
      </h2>
      <FoodSearch customFoods={customFoods} onAdd={addFood} />
      {loggedFoods.length > 0 ? (
        <>
          <FoodLogTable items={loggedFoods} onRemove={removeFood} />
          <TotalsCards items={loggedFoods} />
        </>
      ) : (
        <div
          style={{
            marginTop: "2rem",
            textAlign: "center",
            color: "#52525b",
            border: "1px dashed #3f3f46",
            borderRadius: "0.75rem",
            padding: "2.5rem",
          }}
        >
          {t("calories.msg.addFoodsToStart")}
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Meal Planner ────────────────────────────────────────────────────────
function Tab2({
  customFoods,
  mealLogs,
  setMealLogs,
}: {
  customFoods: FoodItem[];
  mealLogs: Record<MealType, LoggedFood[]>;
  setMealLogs: React.Dispatch<React.SetStateAction<Record<MealType, LoggedFood[]>>>;
}) {
  const { t } = useLanguage();
  const [dailyGoal, setDailyGoal] = useState(2000);

  function addToMeal(meal: MealType, food: FoodItem, portions: number) {
    setMealLogs((prev) => ({
      ...prev,
      [meal]: [...prev[meal], { food, portions, id: `${food.id}-${Date.now()}` }],
    }));
  }

  function removeFromMeal(meal: MealType, id: string) {
    setMealLogs((prev) => ({
      ...prev,
      [meal]: prev[meal].filter((item) => item.id !== id),
    }));
  }

  const allItems = Object.values(mealLogs).flat();
  const grandTotal = calcTotals(allItems);
  const progress = Math.min((grandTotal.calories / dailyGoal) * 100, 100);

  const mealColors: Record<MealType, string> = {
    Breakfast: "#f59e0b",
    Lunch: "#10b981",
    Dinner: "#6366f1",
    Snacks: "#ec4899",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fafafa", margin: 0 }}>
          {t("calories.tab.mealPlanner")}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.8rem", color: "#a1a1aa" }}>{t("calories.label.dailyGoal")}:</label>
          <input
            type="number"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
            style={{
              width: "80px",
              padding: "0.35rem 0.6rem",
              borderRadius: "0.4rem",
              border: "1px solid #3f3f46",
              background: "#18181b",
              color: "#fafafa",
              fontSize: "0.875rem",
              outline: "none",
            }}
          />
          <span style={{ fontSize: "0.8rem", color: "#71717a" }}>kcal</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
          <span style={{ fontSize: "0.8rem", color: "#a1a1aa" }}>
            {Math.round(grandTotal.calories)} / {dailyGoal} kcal
          </span>
          <span style={{ fontSize: "0.8rem", color: progress >= 100 ? "#ef4444" : "#10b981" }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div style={{ height: "10px", borderRadius: "999px", background: "#27272a", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              borderRadius: "999px",
              background: progress >= 100 ? "#ef4444" : progress >= 80 ? "#f59e0b" : "#10b981",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {MEAL_TYPES.map((meal) => {
        const mealTotals = calcTotals(mealLogs[meal]);
        return (
          <div
            key={meal}
            style={{
              background: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "0.75rem",
              padding: "1.25rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: mealColors[meal], fontSize: "1rem" }}>
                {meal}
              </h3>
              {mealLogs[meal].length > 0 && (
                <span style={{ fontSize: "0.8rem", color: "#71717a" }}>
                  {Math.round(mealTotals.calories)} kcal · {mealTotals.fat.toFixed(1)}g fat · {mealTotals.carbs.toFixed(1)}g carbs · {mealTotals.protein.toFixed(1)}g protein
                </span>
              )}
            </div>
            <FoodSearch customFoods={customFoods} onAdd={(food, portions) => addToMeal(meal, food, portions)} />
            <FoodLogTable items={mealLogs[meal]} onRemove={(id) => removeFromMeal(meal, id)} />
          </div>
        );
      })}

      {/* Daily totals */}
      {allItems.length > 0 && (
        <div style={{ marginTop: "0.5rem" }}>
          <h3 style={{ fontWeight: 700, color: "#fafafa", marginBottom: "0.75rem" }}>{t("calories.label.dailyTotal")}</h3>
          <TotalsCards items={allItems} />
        </div>
      )}
    </div>
  );
}

// ── Tab 3: Custom Food ─────────────────────────────────────────────────────────
function Tab3({
  customFoods,
  setCustomFoods,
}: {
  customFoods: FoodItem[];
  setCustomFoods: React.Dispatch<React.SetStateAction<FoodItem[]>>;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    calories: "",
    fat: "",
    carbs: "",
    protein: "",
    serving: "",
  });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.calories || !form.serving.trim()) {
      setError(t("calories.error.requiredFields"));
      return;
    }
    const item: FoodItem = {
      id: `custom-${Date.now()}`,
      name: form.name.trim(),
      serving: form.serving.trim(),
      calories: Number(form.calories),
      fat: Number(form.fat) || 0,
      carbs: Number(form.carbs) || 0,
      protein: Number(form.protein) || 0,
      category: "Custom",
      isCustom: true,
    };
    const updated = [...customFoods, item];
    setCustomFoods(updated);
    localStorage.setItem("calmatic_custom_foods", JSON.stringify(updated));
    setForm({ name: "", calories: "", fat: "", carbs: "", protein: "", serving: "" });
    setError("");
  }

  function removeCustom(id: string) {
    const updated = customFoods.filter((f) => f.id !== id);
    setCustomFoods(updated);
    localStorage.setItem("calmatic_custom_foods", JSON.stringify(updated));
  }

  const inputStyle = {
    width: "100%",
    padding: "0.55rem 0.875rem",
    borderRadius: "0.5rem",
    border: "1px solid #3f3f46",
    background: "#18181b",
    color: "#fafafa",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = { display: "block", fontSize: "0.75rem", color: "#a1a1aa", marginBottom: "0.4rem" };

  return (
    <div>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fafafa", marginBottom: "1.25rem" }}>
        {t("calories.tab.customFood")}
      </h2>
      <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.875rem", marginBottom: "1rem" }}>
            <div>
              <label style={labelStyle}>{t("calories.custom.foodName")} *</label>
              <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("calories.custom.foodNamePlaceholder")} />
            </div>
            <div>
              <label style={labelStyle}>{t("calories.custom.servingDesc")} *</label>
              <input style={inputStyle} value={form.serving} onChange={(e) => setForm({ ...form, serving: e.target.value })} placeholder={t("calories.custom.servingDescPlaceholder")} />
            </div>
            <div>
              <label style={labelStyle}>{t("calories.custom.calories")} *</label>
              <input style={inputStyle} type="number" min="0" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} placeholder="e.g. 250" />
            </div>
            <div>
              <label style={labelStyle}>{t("calories.custom.fat")}</label>
              <input style={inputStyle} type="number" min="0" step="0.1" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>{t("calories.custom.carbs")}</label>
              <input style={inputStyle} type="number" min="0" step="0.1" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>{t("calories.custom.protein")}</label>
              <input style={inputStyle} type="number" min="0" step="0.1" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} placeholder="0" />
            </div>
          </div>
          {error && <div style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "0.75rem" }}>{error}</div>}
          <button
            type="submit"
            style={{
              padding: "0.6rem 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#ef4444",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            {t("calories.btn.addCustomFood")}
          </button>
        </form>
      </div>

      {customFoods.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 700, color: "#fafafa", marginBottom: "0.75rem" }}>
            {t("calories.label.myCustomFoods")} ({customFoods.length})
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #3f3f46" }}>
                  {[
                    t("calories.col.name"),
                    t("calories.col.serving"),
                    t("calories.col.calories"),
                    t("calories.col.fatShort"),
                    t("calories.col.carbsShort"),
                    t("calories.col.proteinShort"),
                    "",
                  ].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", color: "#71717a", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customFoods.map((f) => (
                  <tr key={f.id} style={{ borderBottom: "1px solid #27272a" }}>
                    <td style={{ padding: "0.6rem 0.75rem", color: "#e4e4e7", fontWeight: 500 }}>{f.name}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: "#71717a" }}>{f.serving}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: "#fbbf24", fontWeight: 600 }}>{f.calories}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: "#f87171" }}>{f.fat}g</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: "#facc15" }}>{f.carbs}g</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: "#60a5fa" }}>{f.protein}g</td>
                    <td style={{ padding: "0.6rem 0.75rem" }}>
                      <button
                        onClick={() => removeCustom(f.id)}
                        style={{ background: "transparent", border: "1px solid #3f3f46", color: "#71717a", borderRadius: "0.375rem", cursor: "pointer", padding: "0.2rem 0.5rem", fontSize: "0.8rem" }}
                        onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
                        onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#3f3f46"; (e.currentTarget as HTMLButtonElement).style.color = "#71717a"; }}
                      >✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {customFoods.length === 0 && (
        <div style={{ textAlign: "center", color: "#52525b", border: "1px dashed #3f3f46", borderRadius: "0.75rem", padding: "2rem" }}>
          {t("calories.msg.noCustomFoods")}
        </div>
      )}
    </div>
  );
}

// ── Tab 4: Macronutrient Summary ───────────────────────────────────────────────
function DonutChart({ fat, carbs, protein }: { fat: number; carbs: number; protein: number }) {
  const { t } = useLanguage();
  const total = fat + carbs + protein;
  if (total === 0) {
    return (
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r="70" fill="none" stroke="#27272a" strokeWidth="28" />
        <text x="90" y="94" textAnchor="middle" fill="#52525b" fontSize="13">{t("calories.msg.noData")}</text>
      </svg>
    );
  }

  const r = 70;
  const cx = 90;
  const cy = 90;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { value: fat, color: "#f87171", label: t("calories.macro.fat") },
    { value: carbs, color: "#facc15", label: t("calories.macro.carbs") },
    { value: protein, color: "#60a5fa", label: t("calories.macro.protein") },
  ];

  let offset = 0;
  const paths = segments.map((seg) => {
    const pct = seg.value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const rotate = -90 + offset * 360;
    offset += pct;
    return { ...seg, dash, gap, rotate };
  });

  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      {paths.map((p) => (
        <circle
          key={p.label}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={p.color}
          strokeWidth="28"
          strokeDasharray={`${p.dash} ${p.gap}`}
          transform={`rotate(${p.rotate} ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 0.4s ease" }}
        />
      ))}
      <circle cx={cx} cy={cy} r={56} fill="#09090b" />
    </svg>
  );
}

function Tab4({
  loggedFoods,
  mealLogs,
}: {
  loggedFoods: LoggedFood[];
  mealLogs: Record<MealType, LoggedFood[]>;
}) {
  const { t } = useLanguage();
  const [preset, setPreset] = useState<MacroPreset>("balanced");

  const allItems = [...loggedFoods, ...Object.values(mealLogs).flat()];
  const totals = calcTotals(allItems);
  const ratios = calcMacroRatios(totals);
  const target = MACRO_PRESETS[preset];

  return (
    <div>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fafafa", marginBottom: "1.25rem" }}>
        {t("calories.tab.macroSummary")}
      </h2>

      {/* Preset selector */}
      <div style={{ display: "flex", gap: "0.625rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {(Object.keys(MACRO_PRESETS) as MacroPreset[]).map((key) => (
          <button
            key={key}
            onClick={() => setPreset(key)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: `1px solid ${preset === key ? "#ef4444" : "#3f3f46"}`,
              background: preset === key ? "#ef444422" : "transparent",
              color: preset === key ? "#ef4444" : "#a1a1aa",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {MACRO_PRESETS[key].label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {/* Donut chart */}
        <div
          style={{
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "0.75rem",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: "0 0 1rem", fontWeight: 700, color: "#fafafa", fontSize: "0.95rem" }}>
            {t("calories.macro.currentMacros")}
          </h3>
          <DonutChart fat={ratios.fat} carbs={ratios.carbs} protein={ratios.protein} />
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { label: t("calories.macro.fat"), pct: ratios.fat, color: "#f87171" },
              { label: t("calories.macro.carbs"), pct: ratios.carbs, color: "#facc15" },
              { label: t("calories.macro.protein"), pct: ratios.protein, color: "#60a5fa" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color, display: "inline-block" }} />
                <span style={{ color: "#a1a1aa" }}>{item.label}</span>
                <span style={{ color: "#fafafa", fontWeight: 700 }}>{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison */}
        <div
          style={{
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "0.75rem",
            padding: "1.5rem",
          }}
        >
          <h3 style={{ margin: "0 0 1.25rem", fontWeight: 700, color: "#fafafa", fontSize: "0.95rem" }}>
            {t("calories.macro.currentVsTarget")} ({target.label})
          </h3>
          {[
            { label: t("calories.macro.fat"), current: ratios.fat, target: target.fat, color: "#f87171" },
            { label: t("calories.macro.carbs"), current: ratios.carbs, target: target.carbs, color: "#facc15" },
            { label: t("calories.macro.protein"), current: ratios.protein, target: target.protein, color: "#60a5fa" },
          ].map((item) => {
            const diff = item.current - item.target;
            return (
              <div key={item.label} style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ color: item.color, fontWeight: 600, fontSize: "0.875rem" }}>{item.label}</span>
                  <span style={{ fontSize: "0.8rem", color: Math.abs(diff) <= 3 ? "#10b981" : diff > 0 ? "#ef4444" : "#f59e0b" }}>
                    {item.current}% / {item.target}%
                    {diff !== 0 && (
                      <span style={{ marginLeft: "0.4rem" }}>({diff > 0 ? "+" : ""}{diff}%)</span>
                    )}
                  </span>
                </div>
                {/* Current bar */}
                <div style={{ height: "8px", borderRadius: "999px", background: "#27272a", overflow: "hidden", marginBottom: "4px" }}>
                  <div style={{ height: "100%", width: `${item.current}%`, borderRadius: "999px", background: item.color, transition: "width 0.3s ease" }} />
                </div>
                {/* Target bar */}
                <div style={{ height: "4px", borderRadius: "999px", background: "#27272a", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${item.target}%`, borderRadius: "999px", background: `${item.color}55` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
                  <span style={{ fontSize: "0.7rem", color: "#52525b" }}>{t("calories.macro.current")}</span>
                  <span style={{ fontSize: "0.7rem", color: "#52525b" }}>{t("calories.macro.target")}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals breakdown */}
        <div
          style={{
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "0.75rem",
            padding: "1.5rem",
          }}
        >
          <h3 style={{ margin: "0 0 1.25rem", fontWeight: 700, color: "#fafafa", fontSize: "0.95rem" }}>
            {t("calories.macro.nutrientTotals")}
          </h3>
          {[
            { label: t("calories.macro.calories"), value: `${Math.round(totals.calories)} kcal`, color: "#fbbf24" },
            { label: t("calories.macro.fat"), value: `${totals.fat.toFixed(1)}g`, sub: `${Math.round(totals.fat * 9)} kcal`, color: "#f87171" },
            { label: t("calories.macro.carbohydrates"), value: `${totals.carbs.toFixed(1)}g`, sub: `${Math.round(totals.carbs * 4)} kcal`, color: "#facc15" },
            { label: t("calories.macro.protein"), value: `${totals.protein.toFixed(1)}g`, sub: `${Math.round(totals.protein * 4)} kcal`, color: "#60a5fa" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: "1px solid #27272a" }}>
              <span style={{ color: "#a1a1aa", fontSize: "0.875rem" }}>{item.label}</span>
              <div style={{ textAlign: "right" }}>
                <span style={{ color: item.color, fontWeight: 700, fontSize: "0.95rem" }}>{item.value}</span>
                {item.sub && <div style={{ color: "#52525b", fontSize: "0.75rem" }}>{item.sub}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {allItems.length === 0 && (
        <div style={{ textAlign: "center", color: "#52525b", border: "1px dashed #3f3f46", borderRadius: "0.75rem", padding: "2.5rem", marginTop: "1rem" }}>
          {t("calories.msg.addFoodsForMacro")}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
const emptyMealLogs: Record<MealType, LoggedFood[]> = {
  Breakfast: [],
  Lunch: [],
  Dinner: [],
  Snacks: [],
};

export default function CaloriesPage() {
  const { t } = useLanguage();
  const TABS = [
    t("calories.tab.foodSearch"),
    t("calories.tab.mealPlanner"),
    t("calories.tab.customFood"),
    t("calories.tab.macroSummary"),
  ] as const;
  type TabName = (typeof TABS)[number];

  const [activeTab, setActiveTab] = useState<TabName>(TABS[0]);
  const [loggedFoods, setLoggedFoods] = useState<LoggedFood[]>([]);
  const [mealLogs, setMealLogs] = useState<Record<MealType, LoggedFood[]>>(emptyMealLogs);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);

  // Load custom foods from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("calmatic_custom_foods");
      if (stored) setCustomFoods(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  function getExportData() {
    const allItems = [...loggedFoods, ...Object.values(mealLogs).flat()];
    if (allItems.length === 0) return [];
    return allItems.map((item) => ({
      Food: item.food.name,
      Serving: item.food.serving,
      Portions: item.portions,
      Calories: Math.round(item.food.calories * item.portions),
      "Fat (g)": +(item.food.fat * item.portions).toFixed(1),
      "Carbs (g)": +(item.food.carbs * item.portions).toFixed(1),
      "Protein (g)": +(item.food.protein * item.portions).toFixed(1),
    }));
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 900,
              background: "linear-gradient(135deg, #f87171 0%, #ef4444 60%, #dc2626 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "0.5rem",
            }}
          >
            {t("calories.title")}
          </h1>
          <p style={{ color: "#71717a", fontSize: "0.9rem" }}>
            {t("calories.subtitle")}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
          <ExportButton getData={getExportData} filename="calmatic-calories" sheetName="Calories" />
          <PrintButton />
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          borderBottom: "1px solid #27272a",
          marginBottom: "1.75rem",
          overflowX: "auto",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.6rem 1.1rem",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #ef4444" : "2px solid transparent",
              background: "transparent",
              color: activeTab === tab ? "#ef4444" : "#71717a",
              fontWeight: activeTab === tab ? 700 : 500,
              fontSize: "0.875rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        style={{
          background: "rgba(24,24,27,0.6)",
          border: "1px solid #27272a",
          borderRadius: "1rem",
          padding: "1.75rem",
        }}
      >
        {activeTab === TABS[0] && (
          <Tab1 customFoods={customFoods} loggedFoods={loggedFoods} setLoggedFoods={setLoggedFoods} />
        )}
        {activeTab === TABS[1] && (
          <Tab2 customFoods={customFoods} mealLogs={mealLogs} setMealLogs={setMealLogs} />
        )}
        {activeTab === TABS[2] && (
          <Tab3 customFoods={customFoods} setCustomFoods={setCustomFoods} />
        )}
        {activeTab === TABS[3] && (
          <Tab4 loggedFoods={loggedFoods} mealLogs={mealLogs} />
        )}
      </div>

      {/* Info footer */}
      <p style={{ fontSize: "0.78rem", color: "#52525b", marginTop: "1.25rem", textAlign: "center" }}>
        {t("calories.footer")}
      </p>
    </div>
  );
}
