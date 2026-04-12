"use client";

import { useState } from "react";
import { calcSavingsGoal, calcEmergencyFund, calcCD } from "@/lib/calculations/savings";
import { useLanguage } from "@/context/LanguageContext";

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
const SELECT_STYLE: React.CSSProperties = { ...INPUT_STYLE };
const TAB_STYLE = (active: boolean): React.CSSProperties => ({
  padding: "0.5rem 1.1rem",
  borderRadius: "0.5rem",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.85rem",
  background: active ? "#16a34a" : "#1c1c1e",
  color: active ? "#fff" : "#71717a",
  transition: "all 0.15s",
});

function usd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function Field({ label, value, onChange, prefix }: { label: string; value: string; onChange: (v: string) => void; prefix?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{ fontSize: "0.8rem", color: "#a1a1aa" }}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#52525b", fontSize: "0.9rem" }}>{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...INPUT_STYLE, paddingLeft: prefix ? "1.6rem" : INPUT_STYLE.padding as string }}
          min="0"
        />
      </div>
    </div>
  );
}

// --- Tab 1: Savings Goal ---
function TabGoal() {
  const { t } = useLanguage();
  const [target, setTarget] = useState("50000");
  const [current, setCurrent] = useState("5000");
  const [monthly, setMonthly] = useState("500");
  const [rate, setRate] = useState("5");
  const [result, setResult] = useState<ReturnType<typeof calcSavingsGoal> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      const tv = parseFloat(target), c = parseFloat(current), m = parseFloat(monthly), r = parseFloat(rate);
      if ([tv, c, m, r].some(isNaN) || tv <= 0 || m < 0) throw new Error(t("savings.error.invalidPositive"));
      if (c >= tv) throw new Error(t("savings.error.alreadyMet"));
      const res = calcSavingsGoal(tv, c, m, r);
      setResult(res);
      setError("");
    } catch (e) { setError((e as Error).message); setResult(null); }
  }

  const maxBalance = result ? Math.max(...result.schedule.map((s) => s.balance)) : 0;
  const chartH = 120;
  const chartW = 400;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
        <Field label={t("savings.label.targetAmount")} value={target} onChange={setTarget} prefix="$" />
        <Field label={t("savings.label.currentSavings")} value={current} onChange={setCurrent} prefix="$" />
        <Field label={t("savings.label.monthlyContribution")} value={monthly} onChange={setMonthly} prefix="$" />
        <Field label={t("savings.label.annualInterestRate")} value={rate} onChange={setRate} />
      </div>
      <button onClick={calculate} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>
        {t("savings.btn.calculate")}
      </button>
      {error && <p style={{ color: "#f87171", marginTop: "0.5rem", fontSize: "0.85rem" }}>{error}</p>}
      {result && (
        <div style={{ marginTop: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
            {[
              { label: t("savings.result.timeToGoal"), value: result.monthsToGoal < 0 ? t("savings.result.50plusYears") : `${result.monthsToGoal} ${t("savings.result.months")} (${(result.monthsToGoal / 12).toFixed(1)} ${t("savings.result.yrs")})` },
              { label: t("savings.result.totalContributions"), value: usd(result.totalContributions) },
              { label: t("savings.result.totalInterestEarned"), value: usd(result.totalInterest) },
              { label: t("savings.result.finalBalance"), value: usd(result.finalAmount) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#0f2318", border: "1px solid #166534", borderRadius: "0.75rem", padding: "0.75rem 1rem" }}>
                <div style={{ fontSize: "0.7rem", color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f4f4f5", marginTop: "0.25rem" }}>{value}</div>
              </div>
            ))}
          </div>
          {/* SVG Line Chart */}
          <div style={{ overflowX: "auto" }}>
            <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} style={{ width: "100%", maxWidth: chartW }}>
              {/* target line */}
              {result.schedule.length > 1 && (() => {
                const tY = chartH - (parseFloat(target) / maxBalance) * chartH;
                return <line x1="0" y1={tY} x2={chartW} y2={tY} stroke="#fbbf24" strokeWidth="1" strokeDasharray="4 3" />;
              })()}
              {/* balance line */}
              <polyline
                fill="none"
                stroke="#4ade80"
                strokeWidth="2"
                points={result.schedule.map((s, i) => {
                  const x = (i / (result.schedule.length - 1)) * chartW;
                  const y = chartH - (s.balance / maxBalance) * chartH;
                  return `${x},${y}`;
                }).join(" ")}
              />
              {/* contributions line */}
              <polyline
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1.5"
                strokeDasharray="3 2"
                points={result.schedule.map((s, i) => {
                  const x = (i / (result.schedule.length - 1)) * chartW;
                  const y = chartH - (s.contributions / maxBalance) * chartH;
                  return `${x},${y}`;
                }).join(" ")}
              />
              <text x="4" y={chartH - (parseFloat(target) / maxBalance) * chartH - 4} fill="#fbbf24" fontSize="9">{t("savings.chart.goal")}: {usd(parseFloat(target))}</text>
              <text x="4" y={chartH + 20} fill="#4ade80" fontSize="9">{t("savings.chart.balance")}</text>
              <text x="60" y={chartH + 20} fill="#60a5fa" fontSize="9">{t("savings.chart.contributions")}</text>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Tab 2: Emergency Fund ---
function TabEmergency() {
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState("4000");
  const [savings, setSavings] = useState("5000");
  const [monthlySave, setMonthlySave] = useState("500");
  const [result, setResult] = useState<ReturnType<typeof calcEmergencyFund> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      const e = parseFloat(expenses), s = parseFloat(savings);
      if (isNaN(e) || e <= 0) throw new Error(t("savings.error.invalidExpenses"));
      const r = calcEmergencyFund(e, s || 0);
      setResult(r);
      setError("");
    } catch (e) { setError((e as Error).message); setResult(null); }
  }

  const monthly = parseFloat(monthlySave) || 0;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
        <Field label={t("savings.label.monthlyExpenses")} value={expenses} onChange={setExpenses} prefix="$" />
        <Field label={t("savings.label.currentSavings")} value={savings} onChange={setSavings} prefix="$" />
        <Field label={t("savings.label.monthlySavings")} value={monthlySave} onChange={setMonthlySave} prefix="$" />
      </div>
      <button onClick={calculate} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>
        {t("savings.btn.calculate")}
      </button>
      {error && <p style={{ color: "#f87171", marginTop: "0.5rem", fontSize: "0.85rem" }}>{error}</p>}
      {result && (
        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            { tier: t("savings.emergency.3month"), target: result.threeMonth, gap: result.gapThree, months: result.monthsToThree(monthly), color: "#fbbf24" },
            { tier: t("savings.emergency.6month"), target: result.sixMonth, gap: result.gapSix, months: result.monthsToSix(monthly), color: "#60a5fa" },
            { tier: t("savings.emergency.12month"), target: result.twelveMonth, gap: result.gapTwelve, months: result.monthsToTwelve(monthly), color: "#4ade80" },
          ].map(({ tier, target, gap, months, color }) => (
            <div key={tier} style={{ background: "#0a0a0b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: 700, color, fontSize: "0.95rem" }}>{tier}</span>
                <span style={{ color: "#f4f4f5", fontWeight: 700 }}>{usd(target)}</span>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#71717a" }}>
                {t("savings.emergency.gap")}: <span style={{ color: gap === 0 ? "#4ade80" : "#f87171" }}>{gap === 0 ? t("savings.emergency.alreadyFunded") : usd(gap)}</span>
                {gap > 0 && monthly > 0 && (
                  <span style={{ marginLeft: "1rem" }}>{t("savings.emergency.timeToReach")}: <strong style={{ color: "#f4f4f5" }}>{months} {t("savings.result.months")}</strong></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Tab 3: CD Calculator ---
function TabCD() {
  const { t } = useLanguage();
  const [principal, setPrincipal] = useState("10000");
  const [apy, setApy] = useState("5.0");
  const [term, setTerm] = useState("12");
  const [compounding, setCompounding] = useState<"daily" | "monthly" | "quarterly" | "yearly">("monthly");
  const [results, setResults] = useState<{ termMonths: number; res: { maturityValue: number; interestEarned: number } }[] | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      const p = parseFloat(principal), a = parseFloat(apy), tv = parseInt(term);
      if (isNaN(p) || p <= 0 || isNaN(a) || a < 0 || isNaN(tv) || tv <= 0) throw new Error(t("savings.error.invalidInputs"));
      const terms = [tv, tv * 2, tv * 3].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 3);
      const res = terms.map((tm) => ({ termMonths: tm, res: calcCD(p, a, tm, compounding) }));
      setResults(res);
      setError("");
    } catch (e) { setError((e as Error).message); setResults(null); }
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
        <Field label={t("savings.label.principal")} value={principal} onChange={setPrincipal} prefix="$" />
        <Field label={t("savings.label.apy")} value={apy} onChange={setApy} />
        <Field label={t("savings.label.termMonths")} value={term} onChange={setTerm} />
        <div>
          <label style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "block", marginBottom: "0.3rem" }}>{t("savings.label.compounding")}</label>
          <select value={compounding} onChange={(e) => setCompounding(e.target.value as "daily"|"monthly"|"quarterly"|"yearly")} style={SELECT_STYLE}>
            <option value="daily">{t("savings.option.daily")}</option>
            <option value="monthly">{t("savings.option.monthly")}</option>
            <option value="quarterly">{t("savings.option.quarterly")}</option>
            <option value="yearly">{t("savings.option.yearly")}</option>
          </select>
        </div>
      </div>
      <button onClick={calculate} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>
        {t("savings.btn.calculate")}
      </button>
      {error && <p style={{ color: "#f87171", marginTop: "0.5rem", fontSize: "0.85rem" }}>{error}</p>}
      {results && (
        <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
          {results.map(({ termMonths, res }, i) => (
            <div key={termMonths} style={{ background: i === 0 ? "#0f2318" : "#0a0a0b", border: `1px solid ${i === 0 ? "#166534" : "#27272a"}`, borderRadius: "0.75rem", padding: "1rem" }}>
              <div style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "0.5rem" }}>{termMonths} {t("savings.result.months")} ({(termMonths / 12).toFixed(1)} {t("savings.result.yr")})</div>
              <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#f4f4f5" }}>{usd(res.maturityValue)}</div>
              <div style={{ fontSize: "0.8rem", color: "#4ade80", marginTop: "0.25rem" }}>+{usd(res.interestEarned)} {t("savings.cd.interest")}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main ---
export default function SavingsPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"goal" | "emergency" | "cd">("goal");

  return (
    <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <h1 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 800, color: "#4ade80", marginBottom: "1.5rem" }}>
        {t("savings.title")}
      </h1>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button style={TAB_STYLE(tab === "goal")} onClick={() => setTab("goal")}>{t("savings.tab.goal")}</button>
        <button style={TAB_STYLE(tab === "emergency")} onClick={() => setTab("emergency")}>{t("savings.tab.emergency")}</button>
        <button style={TAB_STYLE(tab === "cd")} onClick={() => setTab("cd")}>{t("savings.tab.cd")}</button>
      </div>
      <div style={{ background: "#111113", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
        {tab === "goal" && <TabGoal />}
        {tab === "emergency" && <TabEmergency />}
        {tab === "cd" && <TabCD />}
      </div>
      <p style={{ marginTop: "1.5rem", fontSize: "0.7rem", color: "#3f3f46", textAlign: "center" }}>
        {t("savings.desc.disclaimer")}
      </p>
    </div>
  );
}
