"use client";

import { useState } from "react";
import {
  calculateCompoundGrowth,
  calculateROI,
  calculateRetirement,
  calculateDCA,
} from "@/lib/calculations/investment";
import { useLanguage } from "@/context/LanguageContext";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function AreaChart({ data, height = 200, legendValue, legendContrib }: {
  data: { year: number; contributions: number; value: number }[];
  height?: number;
  legendValue: string;
  legendContrib: string;
}) {
  if (!data.length) return null;
  const width = 560;
  const pad = { top: 20, right: 20, bottom: 30, left: 60 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const maxVal = Math.max(...data.map((d) => d.value));
  const minYear = data[0].year;
  const maxYear = data[data.length - 1].year;

  const xScale = (year: number) => ((year - minYear) / Math.max(maxYear - minYear, 1)) * w;
  const yScale = (val: number) => h - (val / Math.max(maxVal, 1)) * h;

  const valuePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(d.year)} ${yScale(d.value)}`).join(" ");
  const contribPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(d.year)} ${yScale(d.contributions)}`).join(" ");
  const valueArea = `${valuePath} L ${xScale(maxYear)} ${h} L ${xScale(minYear)} ${h} Z`;
  const contribArea = `${contribPath} L ${xScale(maxYear)} ${h} L ${xScale(minYear)} ${h} Z`;

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <g transform={`translate(${pad.left}, ${pad.top})`}>
        <defs>
          <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="contribGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <path d={valueArea} fill="url(#valueGrad)" />
        <path d={contribArea} fill="url(#contribGrad)" />
        <path d={valuePath} fill="none" stroke="#a78bfa" strokeWidth={2} />
        <path d={contribPath} fill="none" stroke="#86efac" strokeWidth={1.5} strokeDasharray="4 2" />
        {/* Axes */}
        <line x1={0} y1={h} x2={w} y2={h} stroke="#3f3f46" />
        {[0, 0.25, 0.5, 0.75, 1].map((tv) => (
          <text key={tv} x={-6} y={yScale(maxVal * (1 - tv)) + 4} textAnchor="end" fill="#71717a" fontSize={10}>
            {tv === 0 ? fmt(maxVal).replace(/\.00$/, "") : ""}
          </text>
        ))}
        {/* Year labels */}
        {data.filter((_, i) => i % Math.max(Math.floor(data.length / 5), 1) === 0 || i === data.length - 1).map((d) => (
          <text key={d.year} x={xScale(d.year)} y={h + 16} textAnchor="middle" fill="#71717a" fontSize={10}>
            Yr {d.year}
          </text>
        ))}
      </g>
    </svg>
  );
}

export default function InvestmentPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    t("investment.tab.compoundGrowth"),
    t("investment.tab.roi"),
    t("investment.tab.retirement"),
    t("investment.tab.dca"),
  ];

  // Tab 1
  const [initial, setInitial] = useState("10000");
  const [monthly, setMonthly] = useState("500");
  const [annualReturn, setAnnualReturn] = useState("7");
  const [years, setYears] = useState("20");

  // Tab 2
  const [roiInitial, setRoiInitial] = useState("10000");
  const [roiFinal, setRoiFinal] = useState("18000");
  const [roiYears, setRoiYears] = useState("5");

  // Tab 3
  const [currentAge, setCurrentAge] = useState("30");
  const [retireAge, setRetireAge] = useState("65");
  const [currentSavings, setCurrentSavings] = useState("50000");
  const [monthlySavings, setMonthlySavings] = useState("1000");
  const [retireReturn, setRetireReturn] = useState("7");
  const [inflation, setInflation] = useState("3");

  // Tab 4
  const [dcaTotal, setDcaTotal] = useState("12000");
  const [dcaPeriods, setDcaPeriods] = useState("12");
  const [dcaStartPrice, setDcaStartPrice] = useState("100");
  const [dcaEndPrice, setDcaEndPrice] = useState("150");

  const compoundResult = calculateCompoundGrowth(
    parseFloat(initial) || 0, parseFloat(monthly) || 0, parseFloat(annualReturn) || 0, parseInt(years) || 0
  );

  const roiResult = calculateROI(parseFloat(roiInitial) || 0, parseFloat(roiFinal) || 0, parseFloat(roiYears) || 0);

  const retireResult = calculateRetirement(
    parseInt(currentAge) || 30, parseInt(retireAge) || 65,
    parseFloat(currentSavings) || 0, parseFloat(monthlySavings) || 0,
    parseFloat(retireReturn) || 0, parseFloat(inflation) || 0
  );

  const dcaResult = calculateDCA(
    parseFloat(dcaTotal) || 0, parseInt(dcaPeriods) || 12,
    parseFloat(dcaStartPrice) || 0, parseFloat(dcaEndPrice) || 0
  );

  return (
    <div style={{ maxWidth: "950px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>{t("investment.title")}</h1>
      <p style={{ color: "#71717a", marginBottom: "2rem" }}>{t("investment.desc.intro")}</p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", borderBottom: "1px solid #27272a", flexWrap: "wrap" }}>
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            style={{ padding: "0.625rem 1.25rem", border: "none", background: "transparent", color: activeTab === i ? "#a78bfa" : "#71717a", fontWeight: activeTab === i ? 700 : 400, cursor: "pointer", fontSize: "0.9rem", borderBottom: activeTab === i ? "2px solid #7c3aed" : "2px solid transparent" }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 1 — Compound Growth */}
      {activeTab === 0 && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: t("investment.label.initialInvestment"), value: initial, set: setInitial },
              { label: t("investment.label.monthlyContribution"), value: monthly, set: setMonthly },
              { label: t("investment.label.annualReturn"), value: annualReturn, set: setAnnualReturn },
              { label: t("investment.label.timeHorizon"), value: years, set: setYears },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>{label}</label>
                <input type="number" value={value} onChange={(e) => set(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.9rem" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: t("investment.result.finalValue"), value: fmt(compoundResult.finalValue), color: "#a78bfa" },
              { label: t("investment.result.totalContributions"), value: fmt(compoundResult.totalContributions), color: "#86efac" },
              { label: t("investment.result.totalEarnings"), value: fmt(compoundResult.totalEarnings), color: "#fbbf24" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.25rem", textAlign: "center" }}>
                <div style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "0.4rem" }}>{label}</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem", overflowX: "auto" }}>
            <div style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "1rem" }}>
              <span style={{ color: "#a78bfa" }}>— {t("investment.chart.totalValue")}</span>
              {"  "}
              <span style={{ color: "#86efac" }}>– – {t("investment.chart.contributions")}</span>
            </div>
            <AreaChart
              data={compoundResult.yearlyData}
              height={220}
              legendValue={t("investment.chart.totalValue")}
              legendContrib={t("investment.chart.contributions")}
            />
          </div>
        </div>
      )}

      {/* Tab 2 — ROI */}
      {activeTab === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div>
            {[
              { label: t("investment.label.initialInvestment"), value: roiInitial, set: setRoiInitial },
              { label: t("investment.label.finalValue"), value: roiFinal, set: setRoiFinal },
              { label: t("investment.label.timePeriod"), value: roiYears, set: setRoiYears },
            ].map(({ label, value, set }) => (
              <div key={label} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "0.3rem" }}>{label}</label>
                <input type="number" value={value} onChange={(e) => set(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.9rem" }} />
              </div>
            ))}
          </div>
          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>{t("investment.roi.resultsTitle")}</div>
            {[
              [t("investment.roi.totalGainLoss"), fmt(roiResult.totalGain)],
              [t("investment.roi.roi"), roiResult.roi.toFixed(2) + "%"],
              [t("investment.roi.cagr"), roiResult.annualizedReturn.toFixed(2) + "%"],
            ].map(([l, v]) => (
              <div key={l} style={{ marginBottom: "1.25rem" }}>
                <div style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "0.25rem" }}>{l}</div>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: roiResult.totalGain >= 0 ? "#22c55e" : "#f87171" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3 — Retirement */}
      {activeTab === 2 && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: t("investment.label.currentAge"), value: currentAge, set: setCurrentAge },
              { label: t("investment.label.targetRetirementAge"), value: retireAge, set: setRetireAge },
              { label: t("investment.label.currentSavings"), value: currentSavings, set: setCurrentSavings },
              { label: t("investment.label.monthlySavings"), value: monthlySavings, set: setMonthlySavings },
              { label: t("investment.label.expectedReturn"), value: retireReturn, set: setRetireReturn },
              { label: t("investment.label.expectedInflation"), value: inflation, set: setInflation },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>{label}</label>
                <input type="number" value={value} onChange={(e) => set(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.9rem" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: t("investment.retire.projectedSavings"), value: fmt(retireResult.projectedSavings), color: "#a78bfa" },
              { label: t("investment.retire.monthlyWithdrawal"), value: fmt(retireResult.monthlyWithdrawal), color: "#86efac" },
              { label: t("investment.retire.moneyLasts"), value: retireResult.willMoneyLast ? t("investment.retire.yes") : t("investment.retire.no"), color: retireResult.willMoneyLast ? "#22c55e" : "#ef4444" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.25rem", textAlign: "center" }}>
                <div style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "0.4rem" }}>{label}</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem", overflowX: "auto" }}>
            <div style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "1rem" }}>{t("investment.retire.trajectoryDesc")}</div>
            <AreaChart
              data={retireResult.yearlyData.map((d) => ({ year: d.age, contributions: 0, value: d.savings }))}
              height={200}
              legendValue={t("investment.chart.totalValue")}
              legendContrib={t("investment.chart.contributions")}
            />
          </div>
        </div>
      )}

      {/* Tab 4 — DCA */}
      {activeTab === 3 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div>
            {[
              { label: t("investment.label.totalInvestment"), value: dcaTotal, set: setDcaTotal },
              { label: t("investment.label.numPeriods"), value: dcaPeriods, set: setDcaPeriods },
              { label: t("investment.label.startingPrice"), value: dcaStartPrice, set: setDcaStartPrice },
              { label: t("investment.label.endingPrice"), value: dcaEndPrice, set: setDcaEndPrice },
            ].map(({ label, value, set }) => (
              <div key={label} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "0.3rem" }}>{label}</label>
                <input type="number" value={value} onChange={(e) => set(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.9rem" }} />
              </div>
            ))}
          </div>
          <div>
            <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>{t("investment.dca.title")}</div>
              {[
                [t("investment.dca.avgCost"), fmt(dcaResult.dcaAverageCost)],
                [t("investment.dca.totalUnits"), dcaResult.dcaTotalUnits.toFixed(4)],
                [t("investment.dca.finalValue"), fmt(dcaResult.dcaFinalValue)],
                [t("investment.dca.return"), dcaResult.dcaReturn.toFixed(2) + "%"],
              ].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", borderBottom: "1px solid #27272a", fontSize: "0.875rem" }}>
                  <span style={{ color: "#a1a1aa" }}>{l}</span>
                  <span style={{ color: "#fafafa", fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>{t("investment.lumpsum.title")}</div>
              {[
                [t("investment.lumpsum.units"), dcaResult.lumpSumUnits.toFixed(4)],
                [t("investment.lumpsum.finalValue"), fmt(dcaResult.lumpSumFinalValue)],
                [t("investment.lumpsum.return"), dcaResult.lumpSumReturn.toFixed(2) + "%"],
              ].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", borderBottom: "1px solid #27272a", fontSize: "0.875rem" }}>
                  <span style={{ color: "#a1a1aa" }}>{l}</span>
                  <span style={{ color: "#fafafa", fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "0.5rem",
                background: dcaResult.winner === "dca" ? "rgba(34,197,94,0.1)" : dcaResult.winner === "lumpsum" ? "rgba(168,85,247,0.1)" : "rgba(100,100,100,0.1)",
                border: `1px solid ${dcaResult.winner === "dca" ? "#22c55e" : dcaResult.winner === "lumpsum" ? "#a855f7" : "#52525b"}` }}>
                <div style={{ fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.25rem" }}>{t("investment.dca.winner")}</div>
                <div style={{ fontWeight: 700, color: dcaResult.winner === "dca" ? "#22c55e" : dcaResult.winner === "lumpsum" ? "#a78bfa" : "#71717a" }}>
                  {dcaResult.winner === "dca" ? t("investment.dca.dcaWins") : dcaResult.winner === "lumpsum" ? t("investment.dca.lumpSumWins") : t("investment.dca.tie")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <p style={{ marginTop: "3rem", fontSize: "0.8rem", color: "#52525b", borderTop: "1px solid #27272a", paddingTop: "1rem" }}>
        {t("investment.desc.disclaimer")}
      </p>
    </div>
  );
}
