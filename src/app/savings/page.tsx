"use client";

import { useState } from "react";
import { calcSavingsGoal, calcEmergencyFund, calcCD } from "@/lib/calculations/savings";

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
  const [target, setTarget] = useState("50000");
  const [current, setCurrent] = useState("5000");
  const [monthly, setMonthly] = useState("500");
  const [rate, setRate] = useState("5");
  const [result, setResult] = useState<ReturnType<typeof calcSavingsGoal> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      const t = parseFloat(target), c = parseFloat(current), m = parseFloat(monthly), r = parseFloat(rate);
      if ([t, c, m, r].some(isNaN) || t <= 0 || m < 0) throw new Error("Enter valid positive numbers");
      if (c >= t) throw new Error("Current savings already meets the goal");
      const res = calcSavingsGoal(t, c, m, r);
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
        <Field label="Target Amount" value={target} onChange={setTarget} prefix="$" />
        <Field label="Current Savings" value={current} onChange={setCurrent} prefix="$" />
        <Field label="Monthly Contribution" value={monthly} onChange={setMonthly} prefix="$" />
        <Field label="Annual Interest Rate (%)" value={rate} onChange={setRate} />
      </div>
      <button onClick={calculate} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>
        Calculate
      </button>
      {error && <p style={{ color: "#f87171", marginTop: "0.5rem", fontSize: "0.85rem" }}>{error}</p>}
      {result && (
        <div style={{ marginTop: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
            {[
              { label: "Time to Goal", value: result.monthsToGoal < 0 ? "50+ years" : `${result.monthsToGoal} months (${(result.monthsToGoal / 12).toFixed(1)} yrs)` },
              { label: "Total Contributions", value: usd(result.totalContributions) },
              { label: "Total Interest Earned", value: usd(result.totalInterest) },
              { label: "Final Balance", value: usd(result.finalAmount) },
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
              <text x="4" y={chartH - (parseFloat(target) / maxBalance) * chartH - 4} fill="#fbbf24" fontSize="9">Goal: {usd(parseFloat(target))}</text>
              <text x="4" y={chartH + 20} fill="#4ade80" fontSize="9">Balance</text>
              <text x="60" y={chartH + 20} fill="#60a5fa" fontSize="9">Contributions</text>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Tab 2: Emergency Fund ---
function TabEmergency() {
  const [expenses, setExpenses] = useState("4000");
  const [savings, setSavings] = useState("5000");
  const [monthlySave, setMonthlySave] = useState("500");
  const [result, setResult] = useState<ReturnType<typeof calcEmergencyFund> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      const e = parseFloat(expenses), s = parseFloat(savings);
      if (isNaN(e) || e <= 0) throw new Error("Enter valid monthly expenses");
      const r = calcEmergencyFund(e, s || 0);
      setResult(r);
      setError("");
    } catch (e) { setError((e as Error).message); setResult(null); }
  }

  const monthly = parseFloat(monthlySave) || 0;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
        <Field label="Monthly Expenses" value={expenses} onChange={setExpenses} prefix="$" />
        <Field label="Current Savings" value={savings} onChange={setSavings} prefix="$" />
        <Field label="Monthly Savings" value={monthlySave} onChange={setMonthlySave} prefix="$" />
      </div>
      <button onClick={calculate} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>
        Calculate
      </button>
      {error && <p style={{ color: "#f87171", marginTop: "0.5rem", fontSize: "0.85rem" }}>{error}</p>}
      {result && (
        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            { tier: "3-Month Fund", target: result.threeMonth, gap: result.gapThree, months: result.monthsToThree(monthly), color: "#fbbf24" },
            { tier: "6-Month Fund", target: result.sixMonth, gap: result.gapSix, months: result.monthsToSix(monthly), color: "#60a5fa" },
            { tier: "12-Month Fund", target: result.twelveMonth, gap: result.gapTwelve, months: result.monthsToTwelve(monthly), color: "#4ade80" },
          ].map(({ tier, target, gap, months, color }) => (
            <div key={tier} style={{ background: "#0a0a0b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: 700, color, fontSize: "0.95rem" }}>{tier}</span>
                <span style={{ color: "#f4f4f5", fontWeight: 700 }}>{usd(target)}</span>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#71717a" }}>
                Gap: <span style={{ color: gap === 0 ? "#4ade80" : "#f87171" }}>{gap === 0 ? "Already funded!" : usd(gap)}</span>
                {gap > 0 && monthly > 0 && (
                  <span style={{ marginLeft: "1rem" }}>Time to reach: <strong style={{ color: "#f4f4f5" }}>{months} months</strong></span>
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
  const [principal, setPrincipal] = useState("10000");
  const [apy, setApy] = useState("5.0");
  const [term, setTerm] = useState("12");
  const [compounding, setCompounding] = useState<"daily" | "monthly" | "quarterly" | "yearly">("monthly");
  const [results, setResults] = useState<{ termMonths: number; res: { maturityValue: number; interestEarned: number } }[] | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      const p = parseFloat(principal), a = parseFloat(apy), t = parseInt(term);
      if (isNaN(p) || p <= 0 || isNaN(a) || a < 0 || isNaN(t) || t <= 0) throw new Error("Invalid inputs");
      const terms = [t, t * 2, t * 3].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 3);
      const res = terms.map((tm) => ({ termMonths: tm, res: calcCD(p, a, tm, compounding) }));
      setResults(res);
      setError("");
    } catch (e) { setError((e as Error).message); setResults(null); }
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
        <Field label="Principal" value={principal} onChange={setPrincipal} prefix="$" />
        <Field label="APY (%)" value={apy} onChange={setApy} />
        <Field label="Term (months)" value={term} onChange={setTerm} />
        <div>
          <label style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "block", marginBottom: "0.3rem" }}>Compounding</label>
          <select value={compounding} onChange={(e) => setCompounding(e.target.value as "daily"|"monthly"|"quarterly"|"yearly")} style={SELECT_STYLE}>
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      <button onClick={calculate} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>
        Calculate
      </button>
      {error && <p style={{ color: "#f87171", marginTop: "0.5rem", fontSize: "0.85rem" }}>{error}</p>}
      {results && (
        <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
          {results.map(({ termMonths, res }, i) => (
            <div key={termMonths} style={{ background: i === 0 ? "#0f2318" : "#0a0a0b", border: `1px solid ${i === 0 ? "#166534" : "#27272a"}`, borderRadius: "0.75rem", padding: "1rem" }}>
              <div style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "0.5rem" }}>{termMonths} months ({(termMonths / 12).toFixed(1)} yr)</div>
              <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#f4f4f5" }}>{usd(res.maturityValue)}</div>
              <div style={{ fontSize: "0.8rem", color: "#4ade80", marginTop: "0.25rem" }}>+{usd(res.interestEarned)} interest</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main ---
export default function SavingsPage() {
  const [tab, setTab] = useState<"goal" | "emergency" | "cd">("goal");

  return (
    <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <h1 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 800, color: "#4ade80", marginBottom: "1.5rem" }}>
        Savings Goal Calculator
      </h1>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button style={TAB_STYLE(tab === "goal")} onClick={() => setTab("goal")}>Savings Goal</button>
        <button style={TAB_STYLE(tab === "emergency")} onClick={() => setTab("emergency")}>Emergency Fund</button>
        <button style={TAB_STYLE(tab === "cd")} onClick={() => setTab("cd")}>CD / Deposit</button>
      </div>
      <div style={{ background: "#111113", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
        {tab === "goal" && <TabGoal />}
        {tab === "emergency" && <TabEmergency />}
        {tab === "cd" && <TabCD />}
      </div>
      <p style={{ marginTop: "1.5rem", fontSize: "0.7rem", color: "#3f3f46", textAlign: "center" }}>
        For educational purposes only. Results are estimates — consult a financial advisor for personalized guidance. (2025 rates)
      </p>
    </div>
  );
}
