"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { simpleInterest, compoundInterest, loanPayment } from "@/lib/calculations/financial";

function fmt(n: number, digits = 2) {
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}

function fmtCurrency(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#27272a",
  border: "1px solid #3f3f46",
  borderRadius: "0.75rem",
  color: "#fafafa",
  padding: "0.75rem 1rem",
  fontSize: "1rem",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "#a1a1aa",
  marginBottom: "0.375rem",
  display: "block",
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const card: React.CSSProperties = {
  background: "#18181b",
  borderRadius: "1rem",
  border: "1px solid #27272a",
  padding: "1.5rem",
  marginBottom: "1.25rem",
};

const resultCard = (color: string): React.CSSProperties => ({
  background: "#09090b",
  border: `1px solid ${color}33`,
  borderRadius: "0.75rem",
  padding: "1.25rem",
  textAlign: "center",
});

const TABS = ["Simple Interest", "Compound Interest", "Loan / Mortgage"];

// SVG Bar Chart for compound interest
function BarChart({ data }: { data: { year: number; balance: number }[]; }) {
  if (!data.length) return null;
  const show = data.slice(0, 20);
  const max = Math.max(...show.map((d) => d.balance));
  const chartH = 180;

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <p style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "0.75rem", fontWeight: 600 }}>
        Year-by-Year Growth
      </p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: `${chartH}px` }}>
        {show.map((d) => {
          const barH = Math.max(4, Math.round((d.balance / max) * (chartH - 24)));
          return (
            <div
              key={d.year}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}
            >
              <div
                title={`Year ${d.year}: $${fmtCurrency(d.balance)}`}
                style={{
                  width: "100%",
                  background: "linear-gradient(180deg, #60a5fa, #2563eb)",
                  borderRadius: "3px 3px 0 0",
                  height: `${barH}px`,
                }}
              />
              <p style={{ fontSize: "0.55rem", color: "#52525b", marginTop: "3px" }}>{d.year}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Simple Interest Tab ---
function SimpleTab() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [unit, setUnit] = useState<"year" | "month">("year");

  const p = parseFloat(principal);
  const r = parseFloat(rate);
  const t = parseFloat(time);
  const years = unit === "month" ? t / 12 : t;

  const valid = !isNaN(p) && !isNaN(r) && !isNaN(t) && p > 0 && r > 0 && t > 0;
  const result = valid ? simpleInterest(p, r, years) : null;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label style={labelStyle}>Principal ($)</label>
          <input type="number" style={inputStyle} placeholder="10000" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Annual Rate (%)</label>
          <input type="number" style={inputStyle} placeholder="5" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Duration</label>
          <input type="number" style={inputStyle} placeholder="3" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Unit</label>
          <select
            style={selectStyle}
            value={unit}
            onChange={(e) => setUnit(e.target.value as "year" | "month")}
          >
            <option value="year">Years</option>
            <option value="month">Months</option>
          </select>
        </div>
      </div>

      {result && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}>
          <div style={resultCard("#4ade80")}>
            <p style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.4rem" }}>INTEREST</p>
            <p style={{ fontSize: "2rem", fontWeight: 800, color: "#4ade80" }}>
              ${fmtCurrency(result.interest)}
            </p>
          </div>
          <div style={resultCard("#60a5fa")}>
            <p style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.4rem" }}>TOTAL AMOUNT</p>
            <p style={{ fontSize: "2rem", fontWeight: 800, color: "#60a5fa" }}>
              ${fmtCurrency(result.total)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Compound Interest Tab ---
const PERIODS = [
  { label: "Annually", value: 1 },
  { label: "Semi-Annually", value: 2 },
  { label: "Monthly", value: 12 },
  { label: "Daily", value: 365 },
];

function CompoundTab() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [periods, setPeriods] = useState(12);

  const p = parseFloat(principal);
  const r = parseFloat(rate);
  const y = parseInt(years, 10);

  const valid = !isNaN(p) && !isNaN(r) && !isNaN(y) && p > 0 && r > 0 && y > 0;
  const result = valid ? compoundInterest(p, r, y, periods) : null;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label style={labelStyle}>Principal ($)</label>
          <input type="number" style={inputStyle} placeholder="10000" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Annual Rate (%)</label>
          <input type="number" style={inputStyle} placeholder="7" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Years</label>
          <input type="number" style={inputStyle} placeholder="10" value={years} onChange={(e) => setYears(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Compounding</label>
          <select style={selectStyle} value={periods} onChange={(e) => setPeriods(Number(e.target.value))}>
            {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      {result && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={resultCard("#60a5fa")}>
              <p style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.4rem" }}>FINAL AMOUNT</p>
              <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "#60a5fa" }}>
                ${fmtCurrency(result.total)}
              </p>
            </div>
            <div style={resultCard("#4ade80")}>
              <p style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.4rem" }}>TOTAL EARNED</p>
              <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "#4ade80" }}>
                ${fmtCurrency(result.earned)}
              </p>
            </div>
          </div>
          <BarChart data={result.yearlyData} />
        </>
      )}
    </div>
  );
}

// --- Loan Tab ---
function LoanTab() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [months, setMonths] = useState("");
  const [showFull, setShowFull] = useState(false);

  const p = parseFloat(principal);
  const r = parseFloat(rate);
  const m = parseInt(months, 10);

  const valid = !isNaN(p) && !isNaN(r) && !isNaN(m) && p > 0 && r >= 0 && m > 0;
  const result = valid ? loanPayment(p, r, m) : null;

  const displayRows = result ? (showFull ? result.schedule : result.schedule.slice(0, 12)) : [];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label style={labelStyle}>Principal ($)</label>
          <input type="number" style={inputStyle} placeholder="200000" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Annual Rate (%)</label>
          <input type="number" style={inputStyle} placeholder="4.5" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Term (months)</label>
          <input type="number" style={inputStyle} placeholder="360" value={months} onChange={(e) => setMonths(e.target.value)} />
        </div>
      </div>

      {result && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={resultCard("#a78bfa")}>
              <p style={{ fontSize: "0.7rem", color: "#71717a", marginBottom: "0.4rem" }}>MONTHLY PAYMENT</p>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#a78bfa" }}>
                ${fmtCurrency(result.monthlyPayment)}
              </p>
            </div>
            <div style={resultCard("#60a5fa")}>
              <p style={{ fontSize: "0.7rem", color: "#71717a", marginBottom: "0.4rem" }}>TOTAL PAYMENT</p>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#60a5fa" }}>
                ${fmtCurrency(result.totalPayment)}
              </p>
            </div>
            <div style={resultCard("#f87171")}>
              <p style={{ fontSize: "0.7rem", color: "#71717a", marginBottom: "0.4rem" }}>TOTAL INTEREST</p>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f87171" }}>
                ${fmtCurrency(result.totalInterest)}
              </p>
            </div>
          </div>

          {/* Amortization table */}
          <div>
            <p style={{ fontSize: "0.85rem", color: "#a1a1aa", fontWeight: 600, marginBottom: "0.75rem" }}>
              Amortization Schedule {!showFull && result.schedule.length > 12 ? "(first 12 months)" : ""}
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #27272a" }}>
                    {["Month", "Payment", "Principal", "Interest", "Balance"].map((h) => (
                      <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "right", color: "#71717a", fontWeight: 600, fontSize: "0.75rem" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row) => (
                    <tr key={row.month} style={{ borderBottom: "1px solid #1c1c1f" }}>
                      <td style={{ padding: "0.4rem 0.75rem", textAlign: "right", color: "#71717a" }}>{row.month}</td>
                      <td style={{ padding: "0.4rem 0.75rem", textAlign: "right", color: "#fafafa" }}>${fmtCurrency(row.payment)}</td>
                      <td style={{ padding: "0.4rem 0.75rem", textAlign: "right", color: "#4ade80" }}>${fmtCurrency(row.principal)}</td>
                      <td style={{ padding: "0.4rem 0.75rem", textAlign: "right", color: "#f87171" }}>${fmtCurrency(row.interest)}</td>
                      <td style={{ padding: "0.4rem 0.75rem", textAlign: "right", color: "#a1a1aa" }}>${fmtCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.schedule.length > 12 && (
              <button
                onClick={() => setShowFull(!showFull)}
                style={{
                  marginTop: "0.75rem",
                  background: "transparent",
                  border: "1px solid #3f3f46",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 1.25rem",
                  color: "#a1a1aa",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                {showFull ? "Show less" : `Show all ${result.schedule.length} months`}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// --- Main Page ---
export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
        <Link href="/" style={{ color: "#71717a", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={18} />
        </Link>
        <h1 style={{ fontWeight: 700, fontSize: "1.35rem", color: "#fafafa" }}>Financial Calculator</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "0.5rem 1.125rem",
              borderRadius: "0.625rem",
              border: "1px solid",
              borderColor: activeTab === i ? "#7c3aed" : "#27272a",
              background: activeTab === i ? "#7c3aed22" : "transparent",
              color: activeTab === i ? "#a78bfa" : "#71717a",
              fontSize: "0.85rem",
              fontWeight: activeTab === i ? 700 : 400,
              cursor: "pointer",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{
        background: "#18181b",
        borderRadius: "1rem",
        border: "1px solid #27272a",
        padding: "1.75rem",
      }}>
        {activeTab === 0 && <SimpleTab />}
        {activeTab === 1 && <CompoundTab />}
        {activeTab === 2 && <LoanTab />}
      </div>

      <p style={{ textAlign: "center", color: "#3f3f46", fontSize: "0.75rem", marginTop: "1.25rem" }}>
        Results are for informational purposes only.
      </p>
    </div>
  );
}
