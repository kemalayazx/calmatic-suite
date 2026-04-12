"use client";

import { useState } from "react";
import RetroWindow from "@/components/RetroWindow";
import {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  calculateAffordability,
  calculateRefinance,
} from "@/lib/calculations/mortgage";
import ExportButton from "@/components/ui/ExportButton";
import PrintButton from "@/components/ui/PrintButton";
import type { ExportRow } from "@/lib/export";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function PieChart({ principal, interest }: { principal: number; interest: number }) {
  const total = principal + interest;
  if (total === 0) return null;
  const principalPct = principal / total;
  const r = 80;
  const cx = 100;
  const cy = 100;
  const angle = principalPct * 2 * Math.PI;
  const x1 = cx + r * Math.sin(0);
  const y1 = cy - r * Math.cos(0);
  const x2 = cx + r * Math.sin(angle);
  const y2 = cy - r * Math.cos(angle);
  const largeArc = principalPct > 0.5 ? 1 : 0;
  const interestPath = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  const principalPath = `M ${cx} ${cy} L ${x2} ${y2} A ${r} ${r} 0 ${1 - largeArc} 1 ${x1} ${y1} Z`;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        <path d={interestPath} fill="#7c3aed" opacity={0.85} />
        <path d={principalPath} fill="#22c55e" opacity={0.85} />
        <circle cx={cx} cy={cy} r={38} fill="#09090b" />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#fafafa" fontSize="11" fontWeight="700">
          {(principalPct * 100).toFixed(0)}%
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#a1a1aa" fontSize="9">
          Principal
        </text>
      </svg>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: "#22c55e" }} />
          <span style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Principal: {fmt(principal)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: "#7c3aed" }} />
          <span style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Interest: {fmt(interest)}</span>
        </div>
      </div>
    </div>
  );
}

export default function MortgagePage() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["Monthly Payment", "Amortization", "Affordability", "Refinance"];

  // Tab 1
  const [homePrice, setHomePrice] = useState("400000");
  const [downPayment, setDownPayment] = useState("20");
  const [dpIsPercent, setDpIsPercent] = useState(true);
  const [loanTerm, setLoanTerm] = useState("30");
  const [interestRate, setInterestRate] = useState("6.5");

  // Tab 2
  const [showAllRows, setShowAllRows] = useState(false);

  // Tab 3
  const [annualIncome, setAnnualIncome] = useState("100000");
  const [monthlyDebts, setMonthlyDebts] = useState("500");
  const [affordDP, setAffordDP] = useState("50000");

  // Tab 4
  const [curBalance, setCurBalance] = useState("300000");
  const [curRate, setCurRate] = useState("7.5");
  const [curRemainingYears, setCurRemainingYears] = useState("25");
  const [newRate, setNewRate] = useState("6.0");
  const [newTerm, setNewTerm] = useState("30");
  const [closingCosts, setClosingCosts] = useState("5000");

  const hp = parseFloat(homePrice) || 0;
  const dp = parseFloat(downPayment) || 0;
  const term = parseInt(loanTerm) || 30;
  const rate = parseFloat(interestRate) || 0;

  const paymentResult = calculateMonthlyPayment(hp, dp, dpIsPercent, rate, term);
  const schedule = generateAmortizationSchedule(paymentResult.loanAmount, rate, term);
  const displayedRows = showAllRows ? schedule : schedule.slice(0, 12);

  const affordResult = calculateAffordability(
    parseFloat(annualIncome) || 0,
    parseFloat(monthlyDebts) || 0,
    parseFloat(affordDP) || 0,
    rate,
    term
  );

  const refiResult = calculateRefinance(
    parseFloat(curBalance) || 0,
    parseFloat(curRate) || 0,
    (parseInt(curRemainingYears) || 25) * 12,
    parseFloat(newRate) || 0,
    (parseInt(newTerm) || 30) * 12,
    parseFloat(closingCosts) || 0
  );

  // Per-year summary for amortization
  const yearlyAmort: { year: number; principalPaid: number; interestPaid: number }[] = [];
  for (let y = 0; y < term; y++) {
    const start = y * 12;
    const end = start + 12;
    const slice = schedule.slice(start, end);
    yearlyAmort.push({
      year: y + 1,
      principalPaid: slice.reduce((s, r) => s + r.principal, 0),
      interestPaid: slice.reduce((s, r) => s + r.interest, 0),
    });
  }

  function getMortgageExportData(): ExportRow[] {
    if (activeTab === 0) {
      return [
        { Field: "Home Price", Value: paymentResult.loanAmount + paymentResult.downPaymentAmount },
        { Field: "Loan Amount", Value: paymentResult.loanAmount },
        { Field: "Down Payment", Value: paymentResult.downPaymentAmount },
        { Field: "Monthly Payment", Value: paymentResult.monthlyPayment },
        { Field: "Total Interest", Value: paymentResult.totalInterest },
        { Field: "Total Cost", Value: paymentResult.totalCost },
      ];
    }
    if (activeTab === 1) {
      return schedule.map((row) => ({
        Month: row.month,
        Payment: row.payment,
        Principal: row.principal,
        Interest: row.interest,
        Balance: row.balance,
      }));
    }
    if (activeTab === 2) {
      return [
        { Field: "Max Home Price", Value: affordResult.maxHomePrice },
        { Field: "Gross Monthly Income", Value: affordResult.grossMonthlyIncome },
        { Field: "Max Monthly Housing (28%)", Value: affordResult.maxMonthlyHousing },
        { Field: "Max Total Debt (36%)", Value: affordResult.maxTotalDebt },
        { Field: "DTI Ratio", Value: (affordResult.debtToIncomeRatio * 100).toFixed(2) + "%" },
      ];
    }
    return [
      { Field: "Current Monthly Payment", Value: refiResult.currentMonthlyPayment },
      { Field: "New Monthly Payment", Value: refiResult.newMonthlyPayment },
      { Field: "Monthly Savings", Value: refiResult.monthlySavings },
      { Field: "Break-Even Months", Value: refiResult.breakEvenMonths === Infinity ? "Never" : refiResult.breakEvenMonths },
      { Field: "Total Savings", Value: refiResult.totalSavings },
    ];
  }

  return (
    <RetroWindow title="Mortgage Calculator">
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Mortgage Calculator</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <ExportButton getData={getMortgageExportData} filename="calmatic-mortgage" sheetName="Mortgage" />
          <PrintButton />
        </div>
      </div>
      <p style={{ color: "#71717a", marginBottom: "2rem" }}>Monthly payment, amortization, affordability, and refinance analysis.</p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", borderBottom: "1px solid #27272a" }}>
        {tabs.map((t, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "0.625rem 1.25rem",
              border: "none",
              background: "transparent",
              color: activeTab === i ? "#a78bfa" : "#71717a",
              fontWeight: activeTab === i ? 700 : 400,
              cursor: "pointer",
              fontSize: "0.9rem",
              borderBottom: activeTab === i ? "2px solid #7c3aed" : "2px solid transparent",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Shared inputs always visible */}
      {(activeTab === 0 || activeTab === 1) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <div>
            <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>Home Price</label>
            <input type="number" value={homePrice} onChange={(e) => setHomePrice(e.target.value)}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.9rem" }} />
          </div>
          <div>
            <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
              Down Payment {" "}
              <button onClick={() => setDpIsPercent(!dpIsPercent)} style={{ fontSize: "0.7rem", color: "#7c3aed", background: "none", border: "1px solid #3f3f46", borderRadius: "0.25rem", padding: "0.1rem 0.4rem", cursor: "pointer" }}>
                {dpIsPercent ? "%" : "$"}
              </button>
            </label>
            <input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.9rem" }} />
          </div>
          <div>
            <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>Loan Term</label>
            <select value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.9rem" }}>
              <option value="15">15 years</option>
              <option value="20">20 years</option>
              <option value="30">30 years</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>Interest Rate (%)</label>
            <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} step="0.1"
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.9rem" }} />
          </div>
        </div>
      )}

      {/* Tab 1 */}
      {activeTab === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Results</div>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#22c55e", marginBottom: "0.25rem" }}>
              {fmt(paymentResult.monthlyPayment)}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#71717a", marginBottom: "1.5rem" }}>per month (P&I)</div>
            {[
              ["Loan Amount", fmt(paymentResult.loanAmount)],
              ["Down Payment", fmt(paymentResult.downPaymentAmount)],
              ["Total Interest", fmt(paymentResult.totalInterest)],
              ["Total Cost", fmt(paymentResult.totalCost)],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid #27272a", fontSize: "0.875rem" }}>
                <span style={{ color: "#a1a1aa" }}>{l}</span>
                <span style={{ color: "#fafafa", fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PieChart principal={paymentResult.loanAmount} interest={paymentResult.totalInterest} />
          </div>
        </div>
      )}

      {/* Tab 2 */}
      {activeTab === 1 && (
        <div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #3f3f46" }}>
                  {["Month", "Payment", "Principal", "Interest", "Balance"].map((h) => (
                    <th key={h} style={{ padding: "0.625rem 0.75rem", textAlign: "right", color: "#71717a", fontWeight: 600, fontSize: "0.8rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row) => (
                  <tr key={row.month} style={{ borderBottom: "1px solid #27272a" }}>
                    {[row.month, fmt(row.payment), fmt(row.principal), fmt(row.interest), fmt(row.balance)].map((v, i) => (
                      <td key={i} style={{ padding: "0.5rem 0.75rem", textAlign: "right", color: "#fafafa" }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {schedule.length > 12 && (
            <button onClick={() => setShowAllRows(!showAllRows)}
              style={{ marginTop: "1rem", padding: "0.5rem 1.25rem", background: "#27272a", border: "none", borderRadius: "0.5rem", color: "#a1a1aa", cursor: "pointer", fontSize: "0.875rem" }}>
              {showAllRows ? "Show less" : `Show all ${schedule.length} months`}
            </button>
          )}
          <div style={{ marginTop: "2rem" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#a78bfa", marginBottom: "1rem" }}>Yearly Summary</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #3f3f46" }}>
                    {["Year", "Principal Paid", "Interest Paid"].map((h) => (
                      <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "right", color: "#71717a", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {yearlyAmort.slice(0, 5).map((row) => (
                    <tr key={row.year} style={{ borderBottom: "1px solid #27272a" }}>
                      <td style={{ padding: "0.4rem 0.75rem", textAlign: "right", color: "#fafafa" }}>Year {row.year}</td>
                      <td style={{ padding: "0.4rem 0.75rem", textAlign: "right", color: "#22c55e" }}>{fmt(row.principalPaid)}</td>
                      <td style={{ padding: "0.4rem 0.75rem", textAlign: "right", color: "#f87171" }}>{fmt(row.interestPaid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3 — Affordability */}
      {activeTab === 2 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div>
            {[
              { label: "Annual Income ($)", value: annualIncome, set: setAnnualIncome },
              { label: "Monthly Debts ($)", value: monthlyDebts, set: setMonthlyDebts },
              { label: "Down Payment ($)", value: affordDP, set: setAffordDP },
              { label: "Interest Rate (%)", value: interestRate, set: setInterestRate },
            ].map(({ label, value, set }) => (
              <div key={label} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "0.3rem" }}>{label}</label>
                <input type="number" value={value} onChange={(e) => set(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.9rem" }} />
              </div>
            ))}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "0.3rem" }}>Loan Term</label>
              <select value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.9rem" }}>
                <option value="15">15 years</option>
                <option value="20">20 years</option>
                <option value="30">30 years</option>
              </select>
            </div>
          </div>
          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>28/36 Rule Analysis</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#22c55e", marginBottom: "0.25rem" }}>
              {fmt(affordResult.maxHomePrice)}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#71717a", marginBottom: "1.5rem" }}>Maximum home price you can afford</div>
            <div style={{ padding: "0.625rem 0.75rem", borderRadius: "0.5rem", marginBottom: "1rem",
              background: affordResult.limitingFactor === "debt" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
              border: `1px solid ${affordResult.limitingFactor === "debt" ? "#ef4444" : "#22c55e"}` }}>
              <div style={{ fontSize: "0.8rem", color: "#a1a1aa" }}>Limiting factor</div>
              <div style={{ fontWeight: 700, color: affordResult.limitingFactor === "debt" ? "#f87171" : "#22c55e" }}>
                {affordResult.limitingFactor === "debt" ? "Debt-to-Income (36% rule)" : "Housing Ratio (28% rule)"}
              </div>
            </div>
            {[
              ["Gross Monthly Income", fmt(affordResult.grossMonthlyIncome)],
              ["Max Monthly Housing (28%)", fmt(affordResult.maxMonthlyHousing)],
              ["Max Total Debt (36%)", fmt(affordResult.maxTotalDebt)],
              ["Existing Monthly Debts", fmt(affordResult.monthlyDebtPayment)],
              ["DTI Ratio", (affordResult.debtToIncomeRatio * 100).toFixed(1) + "%"],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", borderBottom: "1px solid #27272a", fontSize: "0.875rem" }}>
                <span style={{ color: "#a1a1aa" }}>{l}</span>
                <span style={{ color: "#fafafa", fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4 — Refinance */}
      {activeTab === 3 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div>
            <div style={{ fontWeight: 700, color: "#71717a", marginBottom: "1rem", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>Current Loan</div>
            {[
              { label: "Current Balance ($)", value: curBalance, set: setCurBalance },
              { label: "Current Rate (%)", value: curRate, set: setCurRate },
              { label: "Remaining Term (years)", value: curRemainingYears, set: setCurRemainingYears },
            ].map(({ label, value, set }) => (
              <div key={label} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "0.3rem" }}>{label}</label>
                <input type="number" value={value} onChange={(e) => set(e.target.value)} step="0.1"
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.9rem" }} />
              </div>
            ))}
            <div style={{ fontSize: "0.75rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em", margin: "1.25rem 0 0.75rem" }}>New Loan</div>
            {[
              { label: "New Rate (%)", value: newRate, set: setNewRate },
              { label: "New Term (years)", value: newTerm, set: setNewTerm },
              { label: "Closing Costs ($)", value: closingCosts, set: setClosingCosts },
            ].map(({ label, value, set }) => (
              <div key={label} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "0.3rem" }}>{label}</label>
                <input type="number" value={value} onChange={(e) => set(e.target.value)} step="0.1"
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.9rem" }} />
              </div>
            ))}
          </div>
          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Refinance Analysis</div>
            {[
              ["Current Monthly Payment", fmt(refiResult.currentMonthlyPayment)],
              ["New Monthly Payment", fmt(refiResult.newMonthlyPayment)],
              ["Monthly Savings", fmt(refiResult.monthlySavings)],
              ["Break-Even Point", refiResult.breakEvenMonths === Infinity ? "Never" : `${refiResult.breakEvenMonths} months`],
              ["Total Current Cost Remaining", fmt(refiResult.currentTotalRemaining)],
              ["New Total Cost", fmt(refiResult.newTotalCost)],
              ["Total Savings", fmt(refiResult.totalSavings)],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid #27272a", fontSize: "0.875rem" }}>
                <span style={{ color: "#a1a1aa" }}>{l}</span>
                <span style={{ color: l === "Monthly Savings" || l === "Total Savings" ? (refiResult.monthlySavings > 0 ? "#22c55e" : "#f87171") : "#fafafa", fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            {refiResult.monthlySavings > 0 && (
              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(34,197,94,0.1)", borderRadius: "0.5rem", border: "1px solid #22c55e", fontSize: "0.875rem", color: "#86efac" }}>
                Refinancing saves {fmt(refiResult.monthlySavings)}/month. Break-even in {refiResult.breakEvenMonths} months.
              </div>
            )}
            {refiResult.monthlySavings <= 0 && (
              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(239,68,68,0.1)", borderRadius: "0.5rem", border: "1px solid #ef4444", fontSize: "0.875rem", color: "#f87171" }}>
                Refinancing does not reduce your monthly payment at this rate.
              </div>
            )}
          </div>
        </div>
      )}

      <p style={{ marginTop: "3rem", fontSize: "0.8rem", color: "#52525b", borderTop: "1px solid #27272a", paddingTop: "1rem" }}>
        Results are for informational purposes only. Consult a qualified professional for official decisions.
      </p>
    </div>
    </RetroWindow>
  );
}
