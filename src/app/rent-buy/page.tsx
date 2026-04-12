"use client";

import { useState, useMemo } from "react";
import { calculateRentVsBuy, type RentBuyInputs, type YearlyPoint } from "@/lib/calculations/rent-buy";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function Field({ label, value, onChange, min, max, step, prefix, suffix }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; prefix?: string; suffix?: string;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.3rem" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", background: "#27272a", borderRadius: "0.5rem", border: "1px solid #3f3f46" }}>
        {prefix && <span style={{ padding: "0 0.75rem", color: "#71717a", fontSize: "0.9rem" }}>{prefix}</span>}
        <input
          type="number" value={value} min={min} max={max} step={step ?? 0.01}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fafafa", padding: "0.6rem 0.5rem", fontSize: "0.9rem" }}
        />
        {suffix && <span style={{ padding: "0 0.75rem", color: "#71717a", fontSize: "0.9rem" }}>{suffix}</span>}
      </div>
    </div>
  );
}

function LineChart({ data, crossover }: { data: YearlyPoint[]; crossover: number | null }) {
  if (!data.length) return null;
  const W = 560, H = 260, PAD = { top: 20, right: 20, bottom: 40, left: 70 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const allVals = data.flatMap((d) => [d.rentCumulative, d.buyCumulative, d.equity]);
  const minV = Math.min(0, ...allVals);
  const maxV = Math.max(...allVals);
  const scaleX = (i: number) => PAD.left + (i / (data.length - 1 || 1)) * innerW;
  const scaleY = (v: number) => PAD.top + innerH - ((v - minV) / (maxV - minV || 1)) * innerH;

  const rentPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${scaleX(i)},${scaleY(d.rentCumulative)}`).join(" ");
  const buyPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${scaleX(i)},${scaleY(d.buyCumulative)}`).join(" ");
  const equityPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${scaleX(i)},${scaleY(d.equity)}`).join(" ");

  const yTicks = 5;
  const yStep = (maxV - minV) / yTicks;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
      {/* Grid */}
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const v = minV + i * yStep;
        const y = scaleY(v);
        return (
          <g key={i}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#27272a" strokeWidth={1} />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fill="#52525b" fontSize={10}>
              {v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`}
            </text>
          </g>
        );
      })}
      {/* X axis labels */}
      {data.filter((_, i) => i === 0 || (i + 1) % Math.ceil(data.length / 5) === 0).map((d, i) => (
        <text key={i} x={scaleX(data.indexOf(d))} y={H - 8} textAnchor="middle" fill="#52525b" fontSize={10}>
          Yr {d.year}
        </text>
      ))}
      {/* Crossover line */}
      {crossover !== null && crossover > 0 && crossover <= data.length && (
        <line
          x1={scaleX(crossover - 1)} x2={scaleX(crossover - 1)}
          y1={PAD.top} y2={H - PAD.bottom}
          stroke="#facc15" strokeWidth={1.5} strokeDasharray="4 3"
        />
      )}
      {/* Lines */}
      <path d={rentPath} fill="none" stroke="#3b82f6" strokeWidth={2.5} />
      <path d={buyPath} fill="none" stroke="#f97316" strokeWidth={2.5} />
      <path d={equityPath} fill="none" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="5 3" />
      {/* Legend */}
      <circle cx={PAD.left + 8} cy={PAD.top - 6} r={5} fill="#3b82f6" />
      <text x={PAD.left + 18} y={PAD.top - 2} fill="#a1a1aa" fontSize={10}>Rent Cost</text>
      <circle cx={PAD.left + 80} cy={PAD.top - 6} r={5} fill="#f97316" />
      <text x={PAD.left + 90} y={PAD.top - 2} fill="#a1a1aa" fontSize={10}>Buy Cost</text>
      <circle cx={PAD.left + 155} cy={PAD.top - 6} r={5} fill="#22c55e" />
      <text x={PAD.left + 165} y={PAD.top - 2} fill="#a1a1aa" fontSize={10}>Equity</text>
    </svg>
  );
}

const DEFAULTS: RentBuyInputs = {
  monthlyRent: 2000,
  annualRentIncrease: 3,
  rentersInsurance: 15,
  homePrice: 400000,
  downPaymentPct: 20,
  mortgageRate: 6.5,
  loanTermYears: 30,
  propertyTaxRate: 1.1,
  homeownersInsurance: 1500,
  maintenancePct: 1,
  appreciationRate: 3.5,
  closingCostsPct: 3,
  timeHorizonYears: 10,
  investmentReturn: 7,
};

export default function RentBuyPage() {
  const [inputs, setInputs] = useState<RentBuyInputs>(DEFAULTS);
  const set = <K extends keyof RentBuyInputs>(k: K, v: RentBuyInputs[K]) =>
    setInputs((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => calculateRentVsBuy(inputs), [inputs]);

  const winColor = result.winner === "rent" ? "#3b82f6" : "#f97316";

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem", color: "#fafafa" }}>
        Rent vs Buy Calculator
      </h1>
      <p style={{ color: "#71717a", marginBottom: "2rem" }}>
        Compare the true cost of renting vs buying over your time horizon.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Rent Side */}
        <div style={{ background: "#18181b", border: "1px solid #3b82f633", borderRadius: "0.75rem", padding: "1.25rem" }}>
          <h2 style={{ color: "#3b82f6", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>Renting</h2>
          <Field label="Monthly Rent ($)" value={inputs.monthlyRent} onChange={(v) => set("monthlyRent", v)} min={0} prefix="$" />
          <Field label="Annual Rent Increase (%)" value={inputs.annualRentIncrease} onChange={(v) => set("annualRentIncrease", v)} min={0} max={20} suffix="%" />
          <Field label="Renters Insurance ($/mo)" value={inputs.rentersInsurance} onChange={(v) => set("rentersInsurance", v)} min={0} prefix="$" />
        </div>

        {/* Buy Side */}
        <div style={{ background: "#18181b", border: "1px solid #f9731633", borderRadius: "0.75rem", padding: "1.25rem" }}>
          <h2 style={{ color: "#f97316", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>Buying</h2>
          <Field label="Home Price ($)" value={inputs.homePrice} onChange={(v) => set("homePrice", v)} min={0} prefix="$" />
          <Field label="Down Payment (%)" value={inputs.downPaymentPct} onChange={(v) => set("downPaymentPct", v)} min={0} max={100} suffix="%" />
          <Field label="Mortgage Rate (%)" value={inputs.mortgageRate} onChange={(v) => set("mortgageRate", v)} min={0} max={30} suffix="%" />
          <Field label="Loan Term (years)" value={inputs.loanTermYears} onChange={(v) => set("loanTermYears", v)} min={1} max={30} step={1} />
          <Field label="Property Tax Rate (%/yr)" value={inputs.propertyTaxRate} onChange={(v) => set("propertyTaxRate", v)} min={0} max={5} suffix="%" />
          <Field label="Homeowners Insurance ($/yr)" value={inputs.homeownersInsurance} onChange={(v) => set("homeownersInsurance", v)} min={0} prefix="$" />
          <Field label="Maintenance (%/yr)" value={inputs.maintenancePct} onChange={(v) => set("maintenancePct", v)} min={0} max={5} suffix="%" />
          <Field label="Home Appreciation (%/yr)" value={inputs.appreciationRate} onChange={(v) => set("appreciationRate", v)} min={0} max={20} suffix="%" />
          <Field label="Closing Costs (%)" value={inputs.closingCostsPct} onChange={(v) => set("closingCostsPct", v)} min={0} max={10} suffix="%" />
        </div>
      </div>

      {/* Shared */}
      <div style={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "0.75rem", padding: "1.25rem", marginBottom: "1.5rem" }}>
        <h2 style={{ color: "#a1a1aa", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>Shared Settings</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.4rem" }}>
              Time Horizon: <strong style={{ color: "#fafafa" }}>{inputs.timeHorizonYears} years</strong>
            </label>
            <input
              type="range" min={1} max={30} value={inputs.timeHorizonYears}
              onChange={(e) => set("timeHorizonYears", Number(e.target.value))}
              style={{ width: "100%", accentColor: "#7c3aed" }}
            />
          </div>
          <Field label="Investment Return (%/yr)" value={inputs.investmentReturn} onChange={(v) => set("investmentReturn", v)} min={0} max={20} suffix="%" />
        </div>
      </div>

      {/* Results */}
      <div style={{ background: "#18181b", border: `1px solid ${winColor}44`, borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{
          textAlign: "center", padding: "1rem", borderRadius: "0.5rem",
          background: `${winColor}15`, marginBottom: "1.5rem",
        }}>
          <div style={{ fontSize: "0.85rem", color: "#a1a1aa", marginBottom: "0.25rem" }}>Winner over {inputs.timeHorizonYears} years</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: winColor }}>
            {result.winner === "rent" ? "Renting" : "Buying"} saves {fmt(result.savingsAmount)}
          </div>
          {result.crossoverYear && (
            <div style={{ fontSize: "0.875rem", color: "#a1a1aa", marginTop: "0.25rem" }}>
              Crossover at year {result.crossoverYear}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Total Rent Cost", value: fmt(result.totalRentCost), color: "#3b82f6" },
            { label: "Total Buy Cost", value: fmt(result.totalBuyCost), color: "#f97316" },
            { label: "Monthly Mortgage", value: fmt(result.monthlyMortgage), color: "#a78bfa" },
            { label: "Down Payment", value: fmt(result.downPayment), color: "#facc15" },
            { label: "Closing Costs", value: fmt(result.closingCosts), color: "#f472b6" },
            { label: "Final Equity", value: fmt(result.yearlyData[result.yearlyData.length - 1]?.equity ?? 0), color: "#22c55e" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: "center", padding: "0.75rem", background: "#1c1c1f", borderRadius: "0.5rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.3rem" }}>{label}</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>

        <LineChart data={result.yearlyData} crossover={result.crossoverYear} />
      </div>

      <p style={{ color: "#52525b", fontSize: "0.8rem", textAlign: "center" }}>
        For informational purposes only. Consult a financial advisor before making real estate decisions. Results depend on assumptions that may not reflect your actual situation.
      </p>
    </div>
  );
}
