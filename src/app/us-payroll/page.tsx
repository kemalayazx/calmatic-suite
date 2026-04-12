"use client";

import { useState } from "react";
import {
  calculateFederalTax,
  calculateStateTax,
  hourlyToSalary,
  salaryToHourly,
  calculateOvertime,
  ALL_STATES,
  type FilingStatus,
  type StateCode,
} from "@/lib/calculations/us-payroll";
import ExportButton from "@/components/ui/ExportButton";
import PrintButton from "@/components/ui/PrintButton";
import type { ExportRow } from "@/lib/export";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const fmtPct = (n: number) => (n * 100).toFixed(2) + "%";

export default function USPayrollPage() {
  const [activeTab, setActiveTab] = useState(0);

  // Tab 1
  const [gross, setGross] = useState("75000");
  const [filing, setFiling] = useState<FilingStatus>("single");
  const [selectedState, setSelectedState] = useState<StateCode>("TX");
  const [showAllBrackets, setShowAllBrackets] = useState(false);

  // Tab 3
  const [hourlyInput, setHourlyInput] = useState("25");
  const [salaryInput, setSalaryInput] = useState("52000");
  const [hoursWorked, setHoursWorked] = useState("45");

  const grossNum = parseFloat(gross) || 0;
  const fedResult = calculateFederalTax(grossNum, filing);
  const stateResult = calculateStateTax(grossNum, selectedState);
  const combinedTax = fedResult.totalFederalTax + stateResult.stateTax + fedResult.totalFICA;
  const combinedNet = grossNum - combinedTax;

  const hourlyNum = parseFloat(hourlyInput) || 0;
  const salaryNum = parseFloat(salaryInput) || 0;
  const hoursNum = parseFloat(hoursWorked) || 0;

  const hToS = hourlyToSalary(hourlyNum);
  const sToH = salaryToHourly(salaryNum);
  const ot = calculateOvertime(hoursNum, hourlyNum);

  const FILING_LABELS: Record<FilingStatus, string> = {
    single: "Single",
    mfj: "Married Filing Jointly",
    hoh: "Head of Household",
  };

  const tabs = ["Federal Tax", "State Tax", "Hourly ↔ Salary"];

  function getExportData(): ExportRow[] {
    if (activeTab === 0) {
      return [
        { Field: "Gross Salary", Value: fedResult.grossSalary },
        { Field: "Standard Deduction", Value: fedResult.standardDeduction },
        { Field: "Taxable Income", Value: fedResult.taxableIncome },
        { Field: "Federal Income Tax", Value: fedResult.totalFederalTax },
        { Field: "Effective Rate", Value: (fedResult.effectiveRate * 100).toFixed(2) + "%" },
        { Field: "Social Security (6.2%)", Value: fedResult.socialSecurity },
        { Field: "Medicare (1.45%)", Value: fedResult.medicare },
        { Field: "Total FICA", Value: fedResult.totalFICA },
        { Field: "Net Annual", Value: fedResult.netAnnual },
        { Field: "Net Monthly", Value: fedResult.netMonthly },
        { Field: "Net Biweekly", Value: fedResult.netBiweekly },
      ];
    }
    if (activeTab === 1) {
      return [
        { Field: "Gross Salary", Value: grossNum },
        { Field: "Federal Income Tax", Value: fedResult.totalFederalTax },
        { Field: `${stateResult.stateName} State Tax`, Value: stateResult.stateTax },
        { Field: "FICA", Value: fedResult.totalFICA },
        { Field: "Total Tax", Value: combinedTax },
        { Field: "Net Annual", Value: combinedNet },
        { Field: "Net Monthly", Value: combinedNet / 12 },
        { Field: "Net Biweekly", Value: combinedNet / 26 },
      ];
    }
    return [
      { Field: "Hourly Rate", Value: hourlyNum },
      { Field: "Annual Salary", Value: hToS.annualSalary },
      { Field: "Monthly", Value: hToS.monthly },
      { Field: "Biweekly", Value: hToS.biweekly },
      { Field: "Weekly", Value: hToS.weekly },
      { Field: "Overtime Hours", Value: ot.overtimeHours },
      { Field: "Regular Pay", Value: ot.regularPay },
      { Field: "Overtime Pay", Value: ot.overtimePay },
      { Field: "Weekly Total", Value: ot.totalPay },
    ];
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
          US Payroll Calculator
        </h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <ExportButton getData={getExportData} filename="calmatic-us-payroll" sheetName="US Payroll" />
          <PrintButton />
        </div>
      </div>
      <p style={{ color: "#71717a", marginBottom: "2rem" }}>
        Federal income tax, FICA, state tax, and take-home pay — 2025 brackets.
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", borderBottom: "1px solid #27272a", paddingBottom: "0" }}>
        {tabs.map((t, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: "0.5rem 0.5rem 0 0",
              border: "none",
              background: activeTab === i ? "#18181b" : "transparent",
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

      {/* Tab 1 — Federal Tax */}
      {activeTab === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                Annual Gross Salary
              </label>
              <input
                type="number"
                value={gross}
                onChange={(e) => setGross(e.target.value)}
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "1rem" }}
                placeholder="75000"
              />
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                Filing Status
              </label>
              <select
                value={filing}
                onChange={(e) => setFiling(e.target.value as FilingStatus)}
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.95rem" }}
              >
                <option value="single">Single</option>
                <option value="mfj">Married Filing Jointly</option>
                <option value="hoh">Head of Household</option>
              </select>
            </div>

            {/* Summary card */}
            <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.25rem" }}>
              <div style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                2025 Summary — {FILING_LABELS[filing]}
              </div>
              {[
                ["Gross Salary", fmt(fedResult.grossSalary)],
                ["Standard Deduction", `−${fmt(fedResult.standardDeduction)}`],
                ["Taxable Income", fmt(fedResult.taxableIncome)],
                ["Federal Income Tax", `−${fmt(fedResult.totalFederalTax)}`],
                ["Effective Rate", fmtPct(fedResult.effectiveRate)],
                ["Social Security (6.2%)", `−${fmt(fedResult.socialSecurity)}`],
                ["Medicare (1.45%)", `−${fmt(fedResult.medicare)}`],
                ...(fedResult.additionalMedicare > 0 ? [["Additional Medicare (0.9%)", `−${fmt(fedResult.additionalMedicare)}`]] : []),
                ["Total FICA", `−${fmt(fedResult.totalFICA)}`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.375rem 0", borderBottom: "1px solid #27272a", fontSize: "0.875rem" }}>
                  <span style={{ color: "#a1a1aa" }}>{label}</span>
                  <span style={{ color: "#fafafa", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0 0", fontSize: "1.05rem", fontWeight: 700 }}>
                <span style={{ color: "#a78bfa" }}>Net Annual</span>
                <span style={{ color: "#22c55e" }}>{fmt(fedResult.netAnnual)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", fontSize: "0.875rem" }}>
                <span style={{ color: "#71717a" }}>Net Monthly</span>
                <span style={{ color: "#86efac" }}>{fmt(fedResult.netMonthly)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", fontSize: "0.875rem" }}>
                <span style={{ color: "#71717a" }}>Net Biweekly</span>
                <span style={{ color: "#86efac" }}>{fmt(fedResult.netBiweekly)}</span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.25rem" }}>
              <div style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Tax Bracket Breakdown
              </div>
              {fedResult.brackets
                .filter((b) => showAllBrackets || b.taxableIncome > 0)
                .map((b, i) => (
                  <div key={i} style={{ padding: "0.5rem 0", borderBottom: "1px solid #27272a" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <span style={{ color: "#71717a" }}>
                        {(b.rate * 100).toFixed(0)}% bracket
                        {b.max ? ` (up to ${fmt(b.max)})` : " (over $626K)"}
                      </span>
                      <span style={{ color: b.taxableIncome > 0 ? "#fafafa" : "#3f3f46", fontWeight: 600 }}>
                        {fmt(b.tax)}
                      </span>
                    </div>
                    {b.taxableIncome > 0 && (
                      <div style={{ fontSize: "0.75rem", color: "#52525b", marginTop: "0.2rem" }}>
                        {fmt(b.taxableIncome)} taxable in this bracket
                      </div>
                    )}
                  </div>
                ))}
              <button
                onClick={() => setShowAllBrackets(!showAllBrackets)}
                style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#7c3aed", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                {showAllBrackets ? "Show active only" : "Show all brackets"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2 — State Tax */}
      {activeTab === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                Annual Gross Salary
              </label>
              <input
                type="number"
                value={gross}
                onChange={(e) => setGross(e.target.value)}
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "1rem" }}
              />
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                Filing Status
              </label>
              <select
                value={filing}
                onChange={(e) => setFiling(e.target.value as FilingStatus)}
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.95rem" }}
              >
                <option value="single">Single</option>
                <option value="mfj">Married Filing Jointly</option>
                <option value="hoh">Head of Household</option>
              </select>
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value as StateCode)}
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.95rem" }}
              >
                {ALL_STATES.map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.25rem" }}>
              <div style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Combined Tax Summary
              </div>
              {[
                ["Gross Salary", fmt(grossNum)],
                ["Federal Income Tax", `−${fmt(fedResult.totalFederalTax)}`],
                ["Federal Eff. Rate", fmtPct(fedResult.effectiveRate)],
                [`${stateResult.stateName} State Tax`, `−${fmt(stateResult.stateTax)}`],
                ["State Eff. Rate", fmtPct(stateResult.stateEffectiveRate)],
                ["FICA (SS + Medicare)", `−${fmt(fedResult.totalFICA)}`],
                ["Total Tax", `−${fmt(combinedTax)}`],
                ["Combined Eff. Rate", grossNum > 0 ? fmtPct(combinedTax / grossNum) : "0%"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.375rem 0", borderBottom: "1px solid #27272a", fontSize: "0.875rem" }}>
                  <span style={{ color: "#a1a1aa" }}>{label}</span>
                  <span style={{ color: "#fafafa", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0 0", fontSize: "1.05rem", fontWeight: 700 }}>
                <span style={{ color: "#a78bfa" }}>Net Annual</span>
                <span style={{ color: "#22c55e" }}>{fmt(combinedNet)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", fontSize: "0.875rem" }}>
                <span style={{ color: "#71717a" }}>Net Monthly</span>
                <span style={{ color: "#86efac" }}>{fmt(combinedNet / 12)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", fontSize: "0.875rem" }}>
                <span style={{ color: "#71717a" }}>Net Biweekly</span>
                <span style={{ color: "#86efac" }}>{fmt(combinedNet / 26)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3 — Hourly <-> Salary */}
      {activeTab === 2 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div>
            <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.25rem", marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#a78bfa", marginBottom: "1rem" }}>Hourly Rate → Annual</div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "0.4rem" }}>Hourly Rate ($)</label>
                <input
                  type="number"
                  value={hourlyInput}
                  onChange={(e) => setHourlyInput(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.95rem" }}
                />
              </div>
              {[
                ["Annual (2080h)", fmt(hToS.annualSalary)],
                ["Monthly", fmt(hToS.monthly)],
                ["Biweekly", fmt(hToS.biweekly)],
                ["Semi-Monthly", fmt(hToS.semiMonthly)],
                ["Weekly", fmt(hToS.weekly)],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", fontSize: "0.875rem" }}>
                  <span style={{ color: "#a1a1aa" }}>{label}</span>
                  <span style={{ color: "#fafafa", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.25rem" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#a78bfa", marginBottom: "1rem" }}>Annual Salary → Hourly</div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "0.4rem" }}>Annual Salary ($)</label>
                <input
                  type="number"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.95rem" }}
                />
              </div>
              {[
                ["Hourly Rate", fmt(sToH.hourlyRate) + "/hr"],
                ["Monthly", fmt(sToH.monthly)],
                ["Biweekly", fmt(sToH.biweekly)],
                ["Semi-Monthly", fmt(sToH.semiMonthly)],
                ["Weekly", fmt(sToH.weekly)],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", fontSize: "0.875rem" }}>
                  <span style={{ color: "#a1a1aa" }}>{label}</span>
                  <span style={{ color: "#fafafa", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.25rem" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#a78bfa", marginBottom: "1rem" }}>Overtime Calculator</div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "0.4rem" }}>Hours Worked This Week</label>
                <input
                  type="number"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.95rem" }}
                />
              </div>
              <div style={{ marginBottom: "1rem", fontSize: "0.85rem", color: "#71717a" }}>
                Hourly rate from above: {fmt(hourlyNum)}/hr
              </div>
              {[
                ["Regular Hours (≤40)", `${Math.min(hoursNum, 40)}h @ ${fmt(hourlyNum)}`],
                ["Overtime Hours (>40)", `${ot.overtimeHours}h @ ${fmt(hourlyNum * 1.5)} (1.5x)`],
                ["Regular Pay", fmt(ot.regularPay)],
                ["Overtime Pay", fmt(ot.overtimePay)],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", borderBottom: "1px solid #27272a", fontSize: "0.875rem" }}>
                  <span style={{ color: "#a1a1aa" }}>{label}</span>
                  <span style={{ color: "#fafafa" }}>{value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0 0", fontWeight: 700 }}>
                <span style={{ color: "#a78bfa" }}>Weekly Total Pay</span>
                <span style={{ color: "#22c55e" }}>{fmt(ot.totalPay)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <p style={{ marginTop: "3rem", fontSize: "0.8rem", color: "#52525b", borderTop: "1px solid #27272a", paddingTop: "1rem" }}>
        Results are for informational purposes only. Consult a qualified professional for official decisions.
      </p>
    </div>
  );
}
