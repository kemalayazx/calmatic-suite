"use client";

import { useState } from "react";
import {
  calculateFederalTax,
  calculateStateTax,
  hourlyToSalary,
  salaryToHourly,
  calculateOvertime,
  ALL_STATES,
  DEFAULT_2025_PARAMS,
  type FilingStatus,
  type StateCode,
  type USPayrollParams,
  type TaxBracket,
} from "@/lib/calculations/us-payroll";
import ExportButton from "@/components/ui/ExportButton";
import PrintButton from "@/components/ui/PrintButton";
import type { ExportRow } from "@/lib/export";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const fmtPct = (n: number) => (n * 100).toFixed(2) + "%";

// ─── Param Input Style ────────────────────────────────────────────────────────

const paramInput: React.CSSProperties = {
  background: "#27272a",
  border: "1px solid #3f3f46",
  borderRadius: "0.5rem",
  padding: "0.4rem 0.6rem",
  color: "#fafafa",
  fontSize: "0.85rem",
  outline: "none",
};

// ─── Params Panel ─────────────────────────────────────────────────────────────

function USParamsPanel({
  params,
  onChange,
  isCustom,
  selectedState,
}: {
  params: USPayrollParams;
  onChange: (p: USPayrollParams) => void;
  isCustom: boolean;
  selectedState: StateCode;
}) {
  const [open, setOpen] = useState(false);

  const setDeduction = (key: keyof USPayrollParams["standardDeduction"], value: number) => {
    onChange({ ...params, standardDeduction: { ...params.standardDeduction, [key]: value } });
  };

  const setFicaField = (
    key: "socialSecurityRate" | "socialSecurityCap" | "medicareRate" | "additionalMedicareRate",
    value: number
  ) => {
    onChange({ ...params, [key]: value });
  };

  const setMedicareThreshold = (
    key: keyof USPayrollParams["additionalMedicareThreshold"],
    value: number
  ) => {
    onChange({
      ...params,
      additionalMedicareThreshold: { ...params.additionalMedicareThreshold, [key]: value },
    });
  };

  const setFederalBracket = (
    status: keyof USPayrollParams["federalBrackets"],
    index: number,
    field: keyof TaxBracket,
    value: number | null
  ) => {
    const updated = params.federalBrackets[status].map((b, i) =>
      i === index ? { ...b, [field]: value } : b
    );
    onChange({ ...params, federalBrackets: { ...params.federalBrackets, [status]: updated } });
  };

  const addFederalBracket = (status: keyof USPayrollParams["federalBrackets"]) => {
    const list = params.federalBrackets[status];
    const last = list[list.length - 1];
    const newMin = (last.min ?? 0) + 50000;
    const newBracket: TaxBracket = { min: newMin, max: null, rate: 0.37 };
    // Set previous last max
    const updated = list.map((b, i) =>
      i === list.length - 1 ? { ...b, max: newMin } : b
    );
    onChange({
      ...params,
      federalBrackets: { ...params.federalBrackets, [status]: [...updated, newBracket] },
    });
  };

  const removeFederalBracket = (status: keyof USPayrollParams["federalBrackets"]) => {
    const list = params.federalBrackets[status];
    if (list.length <= 1) return;
    const trimmed = list.slice(0, -1);
    // Make new last bracket go to infinity
    const updated = trimmed.map((b, i) =>
      i === trimmed.length - 1 ? { ...b, max: null } : b
    );
    onChange({ ...params, federalBrackets: { ...params.federalBrackets, [status]: updated } });
  };

  const setStateFlatRate = (state: string, rate: number) => {
    const existing = params.stateTaxes[state];
    onChange({
      ...params,
      stateTaxes: { ...params.stateTaxes, [state]: { ...existing, rate } },
    });
  };

  const setStateBracket = (
    state: string,
    index: number,
    field: keyof TaxBracket,
    value: number | null
  ) => {
    const existing = params.stateTaxes[state];
    const brackets = existing.brackets ?? [];
    const updated = brackets.map((b, i) => (i === index ? { ...b, [field]: value } : b));
    onChange({
      ...params,
      stateTaxes: { ...params.stateTaxes, [state]: { ...existing, brackets: updated } },
    });
  };

  const reset = () => onChange(DEFAULT_2025_PARAMS);

  const stateConfig = params.stateTaxes[selectedState];
  const defaultStateConfig = DEFAULT_2025_PARAMS.stateTaxes[selectedState];

  const [activeBracketTab, setActiveBracketTab] = useState<"single" | "mfj" | "hoh">("single");

  const bracketTabStyle = (t: string): React.CSSProperties => ({
    padding: "0.3rem 0.75rem",
    borderRadius: "0.375rem",
    border: "none",
    background: activeBracketTab === t ? "#3f3f46" : "transparent",
    color: activeBracketTab === t ? "#fafafa" : "#71717a",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: activeBracketTab === t ? 600 : 400,
  });

  const sectionLabel: React.CSSProperties = {
    color: "#71717a",
    fontSize: "0.7rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "0.75rem",
  };

  return (
    <div
      style={{
        background: "rgba(24,24,27,0.7)",
        border: "1px solid #27272a",
        borderRadius: "0.875rem",
        padding: "1.5rem",
        marginBottom: "1.75rem",
      }}
    >
      {/* Header toggle */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <span style={{ color: "#fafafa", fontWeight: 600, fontSize: "0.95rem" }}>
            Customize Parameters
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              padding: "0.2rem 0.5rem",
              borderRadius: "1rem",
              background: isCustom ? "rgba(234,179,8,0.15)" : "rgba(124,58,237,0.15)",
              color: isCustom ? "#eab308" : "#a78bfa",
              fontWeight: 600,
            }}
          >
            {isCustom ? "(custom)" : "(2025 defaults)"}
          </span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        >
          <path
            d="M3 6l5 5 5-5"
            stroke="#71717a"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Collapsible body */}
      <div
        style={{
          overflow: "hidden",
          maxHeight: open ? "9999px" : "0",
          transition: "max-height 0.3s ease",
        }}
      >
        <div style={{ marginTop: "1.5rem" }}>

          {/* ── Standard Deductions ── */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={sectionLabel}>Standard Deduction ($)</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }}>
              {(
                [
                  { key: "single" as const, label: "Single" },
                  { key: "mfj" as const, label: "Married Filing Jointly" },
                  { key: "hoh" as const, label: "Head of Household" },
                ] as const
              ).map(({ key, label }) => (
                <div key={key}>
                  <label
                    style={{
                      display: "block",
                      color: "#a1a1aa",
                      fontSize: "0.78rem",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {label}
                  </label>
                  <input
                    type="number"
                    style={{ ...paramInput, width: "100%", boxSizing: "border-box" }}
                    value={params.standardDeduction[key]}
                    placeholder={String(DEFAULT_2025_PARAMS.standardDeduction[key])}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v) && v >= 0) setDeduction(key, v);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Federal Tax Brackets ── */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <p style={{ ...sectionLabel, marginBottom: 0 }}>Federal Tax Brackets</p>
              <div style={{ display: "flex", gap: "0.25rem" }}>
                {(["single", "mfj", "hoh"] as const).map((t) => (
                  <button key={t} style={bracketTabStyle(t)} onClick={() => setActiveBracketTab(t)}>
                    {t === "mfj" ? "MFJ" : t === "hoh" ? "HoH" : "Single"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr>
                    <th style={{ color: "#52525b", textAlign: "left", padding: "0.35rem 0.5rem", fontWeight: 500 }}>#</th>
                    <th style={{ color: "#52525b", textAlign: "left", padding: "0.35rem 0.5rem", fontWeight: 500 }}>Min ($)</th>
                    <th style={{ color: "#52525b", textAlign: "left", padding: "0.35rem 0.5rem", fontWeight: 500 }}>Max ($)</th>
                    <th style={{ color: "#52525b", textAlign: "left", padding: "0.35rem 0.5rem", fontWeight: 500 }}>Rate (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {params.federalBrackets[activeBracketTab].map((b, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #27272a" }}>
                      <td style={{ color: "#71717a", padding: "0.4rem 0.5rem" }}>{i + 1}</td>
                      <td style={{ padding: "0.4rem 0.5rem" }}>
                        <input
                          type="number"
                          disabled
                          value={b.min}
                          style={{ ...paramInput, width: "100px", opacity: 0.5, cursor: "not-allowed" }}
                        />
                      </td>
                      <td style={{ padding: "0.4rem 0.5rem" }}>
                        {b.max === null ? (
                          <span style={{ color: "#52525b", fontSize: "0.85rem", padding: "0.4rem 0.6rem" }}>
                            +∞
                          </span>
                        ) : (
                          <input
                            type="number"
                            min={b.min + 1}
                            style={{ ...paramInput, width: "110px" }}
                            value={b.max}
                            placeholder={String(
                              DEFAULT_2025_PARAMS.federalBrackets[activeBracketTab][i]?.max ?? ""
                            )}
                            onChange={(e) => {
                              const v = parseInt(e.target.value);
                              if (!isNaN(v) && v > b.min)
                                setFederalBracket(activeBracketTab, i, "max", v);
                            }}
                          />
                        )}
                      </td>
                      <td style={{ padding: "0.4rem 0.5rem" }}>
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          max={100}
                          style={{ ...paramInput, width: "80px" }}
                          value={+(b.rate * 100).toFixed(2)}
                          placeholder={String(
                            +(
                              (DEFAULT_2025_PARAMS.federalBrackets[activeBracketTab][i]?.rate ?? 0) *
                              100
                            ).toFixed(2)
                          )}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            if (!isNaN(v) && v >= 0 && v <= 100)
                              setFederalBracket(activeBracketTab, i, "rate", v / 100);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
              <button
                onClick={() => addFederalBracket(activeBracketTab)}
                style={{
                  ...paramInput,
                  cursor: "pointer",
                  color: "#a78bfa",
                  border: "1px solid #3f3f46",
                  padding: "0.35rem 0.875rem",
                }}
              >
                + Add bracket
              </button>
              <button
                onClick={() => removeFederalBracket(activeBracketTab)}
                disabled={params.federalBrackets[activeBracketTab].length <= 1}
                style={{
                  ...paramInput,
                  cursor: "pointer",
                  color: "#f87171",
                  border: "1px solid #3f3f46",
                  padding: "0.35rem 0.875rem",
                  opacity: params.federalBrackets[activeBracketTab].length <= 1 ? 0.4 : 1,
                }}
              >
                Remove last
              </button>
            </div>
          </div>

          {/* ── FICA ── */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={sectionLabel}>FICA Settings</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "0.75rem" }}>
              {[
                {
                  key: "socialSecurityRate" as const,
                  label: "Social Security Rate (%)",
                  multiplier: 100,
                  step: "0.01",
                  placeholder: String(+(DEFAULT_2025_PARAMS.socialSecurityRate * 100).toFixed(2)),
                },
                {
                  key: "socialSecurityCap" as const,
                  label: "SS Wage Cap ($)",
                  multiplier: 1,
                  step: "100",
                  placeholder: String(DEFAULT_2025_PARAMS.socialSecurityCap),
                },
                {
                  key: "medicareRate" as const,
                  label: "Medicare Rate (%)",
                  multiplier: 100,
                  step: "0.01",
                  placeholder: String(+(DEFAULT_2025_PARAMS.medicareRate * 100).toFixed(2)),
                },
                {
                  key: "additionalMedicareRate" as const,
                  label: "Additional Medicare Rate (%)",
                  multiplier: 100,
                  step: "0.01",
                  placeholder: String(+(DEFAULT_2025_PARAMS.additionalMedicareRate * 100).toFixed(2)),
                },
              ].map(({ key, label, multiplier, step, placeholder }) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ color: "#a1a1aa", fontSize: "0.78rem" }}>{label}</label>
                  <input
                    type="number"
                    step={step}
                    min={0}
                    style={{ ...paramInput, width: "100%", boxSizing: "border-box" }}
                    value={
                      multiplier === 1
                        ? params[key]
                        : +((params[key] as number) * 100).toFixed(4)
                    }
                    placeholder={placeholder}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v) && v >= 0)
                        setFicaField(key, multiplier === 1 ? v : v / 100);
                    }}
                  />
                </div>
              ))}
            </div>
            {/* Additional Medicare Threshold */}
            <div style={{ marginTop: "0.75rem" }}>
              <p style={{ color: "#a1a1aa", fontSize: "0.78rem", marginBottom: "0.4rem" }}>
                Additional Medicare Threshold ($)
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", maxWidth: "460px" }}>
                {(["single", "mfj"] as const).map((key) => (
                  <div key={key}>
                    <label style={{ display: "block", color: "#71717a", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                      {key === "mfj" ? "Married Filing Jointly" : "Single"}
                    </label>
                    <input
                      type="number"
                      step="1000"
                      style={{ ...paramInput, width: "100%", boxSizing: "border-box" }}
                      value={params.additionalMedicareThreshold[key]}
                      placeholder={String(DEFAULT_2025_PARAMS.additionalMedicareThreshold[key])}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v) && v >= 0) setMedicareThreshold(key, v);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── State Tax ── */}
          <div style={{ marginBottom: "1.25rem" }}>
            <p style={sectionLabel}>State Tax Settings — {selectedState}</p>
            {stateConfig?.type === "none" ? (
              <p style={{ color: "#52525b", fontSize: "0.875rem" }}>
                {selectedState} has no state income tax.
              </p>
            ) : stateConfig?.type === "flat" ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <label style={{ color: "#a1a1aa", fontSize: "0.85rem" }}>Flat Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  style={{ ...paramInput, width: "100px" }}
                  value={+((stateConfig.rate ?? 0) * 100).toFixed(4)}
                  placeholder={String(
                    defaultStateConfig?.type === "flat"
                      ? +((defaultStateConfig.rate ?? 0) * 100).toFixed(4)
                      : ""
                  )}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v >= 0 && v <= 100)
                      setStateFlatRate(selectedState, v / 100);
                  }}
                />
              </div>
            ) : stateConfig?.type === "progressive" && stateConfig.brackets ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr>
                      <th style={{ color: "#52525b", textAlign: "left", padding: "0.35rem 0.5rem", fontWeight: 500 }}>#</th>
                      <th style={{ color: "#52525b", textAlign: "left", padding: "0.35rem 0.5rem", fontWeight: 500 }}>Min ($)</th>
                      <th style={{ color: "#52525b", textAlign: "left", padding: "0.35rem 0.5rem", fontWeight: 500 }}>Max ($)</th>
                      <th style={{ color: "#52525b", textAlign: "left", padding: "0.35rem 0.5rem", fontWeight: 500 }}>Rate (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stateConfig.brackets.map((b, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #27272a" }}>
                        <td style={{ color: "#71717a", padding: "0.4rem 0.5rem" }}>{i + 1}</td>
                        <td style={{ padding: "0.4rem 0.5rem" }}>
                          <input
                            type="number"
                            disabled
                            value={b.min}
                            style={{ ...paramInput, width: "100px", opacity: 0.5, cursor: "not-allowed" }}
                          />
                        </td>
                        <td style={{ padding: "0.4rem 0.5rem" }}>
                          {b.max === null ? (
                            <span style={{ color: "#52525b", fontSize: "0.85rem", padding: "0.4rem 0.6rem" }}>+∞</span>
                          ) : (
                            <input
                              type="number"
                              min={b.min + 1}
                              style={{ ...paramInput, width: "110px" }}
                              value={b.max}
                              onChange={(e) => {
                                const v = parseInt(e.target.value);
                                if (!isNaN(v) && v > b.min)
                                  setStateBracket(selectedState, i, "max", v);
                              }}
                            />
                          )}
                        </td>
                        <td style={{ padding: "0.4rem 0.5rem" }}>
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            max={100}
                            style={{ ...paramInput, width: "80px" }}
                            value={+(b.rate * 100).toFixed(3)}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              if (!isNaN(v) && v >= 0 && v <= 100)
                                setStateBracket(selectedState, i, "rate", v / 100);
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>

          {/* Reset */}
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1.125rem",
              borderRadius: "0.5rem",
              border: "1px solid #3f3f46",
              background: "transparent",
              color: "#a1a1aa",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#27272a";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            Reset to 2025 Defaults
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function isParamsCustom(params: USPayrollParams): boolean {
  return JSON.stringify(params) !== JSON.stringify(DEFAULT_2025_PARAMS);
}

export default function USPayrollPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [params, setParams] = useState<USPayrollParams>(DEFAULT_2025_PARAMS);

  // Tab 1 & 2
  const [gross, setGross] = useState("75000");
  const [filing, setFiling] = useState<FilingStatus>("single");
  const [selectedState, setSelectedState] = useState<StateCode>("TX");
  const [showAllBrackets, setShowAllBrackets] = useState(false);

  // Tab 3
  const [hourlyInput, setHourlyInput] = useState("25");
  const [salaryInput, setSalaryInput] = useState("52000");
  const [hoursWorked, setHoursWorked] = useState("45");

  const grossNum = parseFloat(gross) || 0;
  const fedResult = calculateFederalTax(grossNum, filing, params);
  const stateResult = calculateStateTax(grossNum, selectedState, params);
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
        { Field: "Social Security", Value: fedResult.socialSecurity },
        { Field: "Medicare", Value: fedResult.medicare },
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>US Payroll Calculator</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <ExportButton getData={getExportData} filename="calmatic-us-payroll" sheetName="US Payroll" />
          <PrintButton />
        </div>
      </div>
      <p style={{ color: "#71717a", marginBottom: "2rem" }}>
        Federal income tax, FICA, state tax, and take-home pay — 2025 brackets.
      </p>

      {/* Customize Parameters */}
      <USParamsPanel
        params={params}
        onChange={setParams}
        isCustom={isParamsCustom(params)}
        selectedState={selectedState}
      />

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "2rem",
          borderBottom: "1px solid #27272a",
          paddingBottom: "0",
        }}
      >
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
              <label
                style={{
                  display: "block",
                  color: "#a1a1aa",
                  fontSize: "0.85rem",
                  marginBottom: "0.4rem",
                }}
              >
                Annual Gross Salary
              </label>
              <input
                type="number"
                value={gross}
                onChange={(e) => setGross(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.875rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #3f3f46",
                  background: "#18181b",
                  color: "#fafafa",
                  fontSize: "1rem",
                }}
                placeholder="75000"
              />
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "block",
                  color: "#a1a1aa",
                  fontSize: "0.85rem",
                  marginBottom: "0.4rem",
                }}
              >
                Filing Status
              </label>
              <select
                value={filing}
                onChange={(e) => setFiling(e.target.value as FilingStatus)}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.875rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #3f3f46",
                  background: "#18181b",
                  color: "#fafafa",
                  fontSize: "0.95rem",
                }}
              >
                <option value="single">Single</option>
                <option value="mfj">Married Filing Jointly</option>
                <option value="hoh">Head of Household</option>
              </select>
            </div>

            {/* Summary card */}
            <div
              style={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "0.75rem",
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#71717a",
                  marginBottom: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                2025 Summary — {FILING_LABELS[filing]}
              </div>
              {[
                ["Gross Salary", fmt(fedResult.grossSalary)],
                ["Standard Deduction", `−${fmt(fedResult.standardDeduction)}`],
                ["Taxable Income", fmt(fedResult.taxableIncome)],
                ["Federal Income Tax", `−${fmt(fedResult.totalFederalTax)}`],
                ["Effective Rate", fmtPct(fedResult.effectiveRate)],
                [
                  `Social Security (${fmtPct(params.socialSecurityRate)})`,
                  `−${fmt(fedResult.socialSecurity)}`,
                ],
                [`Medicare (${fmtPct(params.medicareRate)})`, `−${fmt(fedResult.medicare)}`],
                ...(fedResult.additionalMedicare > 0
                  ? [
                      [
                        `Additional Medicare (${fmtPct(params.additionalMedicareRate)})`,
                        `−${fmt(fedResult.additionalMedicare)}`,
                      ],
                    ]
                  : []),
                ["Total FICA", `−${fmt(fedResult.totalFICA)}`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.375rem 0",
                    borderBottom: "1px solid #27272a",
                    fontSize: "0.875rem",
                  }}
                >
                  <span style={{ color: "#a1a1aa" }}>{label}</span>
                  <span style={{ color: "#fafafa", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.75rem 0 0",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                }}
              >
                <span style={{ color: "#a78bfa" }}>Net Annual</span>
                <span style={{ color: "#22c55e" }}>{fmt(fedResult.netAnnual)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.25rem 0",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ color: "#71717a" }}>Net Monthly</span>
                <span style={{ color: "#86efac" }}>{fmt(fedResult.netMonthly)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.25rem 0",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ color: "#71717a" }}>Net Biweekly</span>
                <span style={{ color: "#86efac" }}>{fmt(fedResult.netBiweekly)}</span>
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "0.75rem",
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#71717a",
                  marginBottom: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Tax Bracket Breakdown
              </div>
              {fedResult.brackets
                .filter((b) => showAllBrackets || b.taxableIncome > 0)
                .map((b, i) => (
                  <div key={i} style={{ padding: "0.5rem 0", borderBottom: "1px solid #27272a" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <span style={{ color: "#71717a" }}>
                        {(b.rate * 100).toFixed(0)}% bracket
                        {b.max ? ` (up to ${fmt(b.max)})` : " (top bracket)"}
                      </span>
                      <span
                        style={{
                          color: b.taxableIncome > 0 ? "#fafafa" : "#3f3f46",
                          fontWeight: 600,
                        }}
                      >
                        {fmt(b.tax)}
                      </span>
                    </div>
                    {b.taxableIncome > 0 && (
                      <div
                        style={{ fontSize: "0.75rem", color: "#52525b", marginTop: "0.2rem" }}
                      >
                        {fmt(b.taxableIncome)} taxable in this bracket
                      </div>
                    )}
                  </div>
                ))}
              <button
                onClick={() => setShowAllBrackets(!showAllBrackets)}
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.8rem",
                  color: "#7c3aed",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
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
              <label
                style={{
                  display: "block",
                  color: "#a1a1aa",
                  fontSize: "0.85rem",
                  marginBottom: "0.4rem",
                }}
              >
                Annual Gross Salary
              </label>
              <input
                type="number"
                value={gross}
                onChange={(e) => setGross(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.875rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #3f3f46",
                  background: "#18181b",
                  color: "#fafafa",
                  fontSize: "1rem",
                }}
              />
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "block",
                  color: "#a1a1aa",
                  fontSize: "0.85rem",
                  marginBottom: "0.4rem",
                }}
              >
                Filing Status
              </label>
              <select
                value={filing}
                onChange={(e) => setFiling(e.target.value as FilingStatus)}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.875rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #3f3f46",
                  background: "#18181b",
                  color: "#fafafa",
                  fontSize: "0.95rem",
                }}
              >
                <option value="single">Single</option>
                <option value="mfj">Married Filing Jointly</option>
                <option value="hoh">Head of Household</option>
              </select>
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "block",
                  color: "#a1a1aa",
                  fontSize: "0.85rem",
                  marginBottom: "0.4rem",
                }}
              >
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value as StateCode)}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.875rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #3f3f46",
                  background: "#18181b",
                  color: "#fafafa",
                  fontSize: "0.95rem",
                }}
              >
                {ALL_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div
              style={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "0.75rem",
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#71717a",
                  marginBottom: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
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
                [
                  "Combined Eff. Rate",
                  grossNum > 0 ? fmtPct(combinedTax / grossNum) : "0%",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.375rem 0",
                    borderBottom: "1px solid #27272a",
                    fontSize: "0.875rem",
                  }}
                >
                  <span style={{ color: "#a1a1aa" }}>{label}</span>
                  <span style={{ color: "#fafafa", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.75rem 0 0",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                }}
              >
                <span style={{ color: "#a78bfa" }}>Net Annual</span>
                <span style={{ color: "#22c55e" }}>{fmt(combinedNet)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.25rem 0",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ color: "#71717a" }}>Net Monthly</span>
                <span style={{ color: "#86efac" }}>{fmt(combinedNet / 12)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.25rem 0",
                  fontSize: "0.875rem",
                }}
              >
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
            <div
              style={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "0.75rem",
                padding: "1.25rem",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#a78bfa",
                  marginBottom: "1rem",
                }}
              >
                Hourly Rate → Annual
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    color: "#a1a1aa",
                    fontSize: "0.85rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  value={hourlyInput}
                  onChange={(e) => setHourlyInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #3f3f46",
                    background: "#09090b",
                    color: "#fafafa",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
              {[
                ["Annual (2080h)", fmt(hToS.annualSalary)],
                ["Monthly", fmt(hToS.monthly)],
                ["Biweekly", fmt(hToS.biweekly)],
                ["Semi-Monthly", fmt(hToS.semiMonthly)],
                ["Weekly", fmt(hToS.weekly)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.3rem 0",
                    fontSize: "0.875rem",
                  }}
                >
                  <span style={{ color: "#a1a1aa" }}>{label}</span>
                  <span style={{ color: "#fafafa", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "0.75rem",
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#a78bfa",
                  marginBottom: "1rem",
                }}
              >
                Annual Salary → Hourly
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    color: "#a1a1aa",
                    fontSize: "0.85rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  Annual Salary ($)
                </label>
                <input
                  type="number"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #3f3f46",
                    background: "#09090b",
                    color: "#fafafa",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
              {[
                ["Hourly Rate", fmt(sToH.hourlyRate) + "/hr"],
                ["Monthly", fmt(sToH.monthly)],
                ["Biweekly", fmt(sToH.biweekly)],
                ["Semi-Monthly", fmt(sToH.semiMonthly)],
                ["Weekly", fmt(sToH.weekly)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.3rem 0",
                    fontSize: "0.875rem",
                  }}
                >
                  <span style={{ color: "#a1a1aa" }}>{label}</span>
                  <span style={{ color: "#fafafa", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div
              style={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "0.75rem",
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#a78bfa",
                  marginBottom: "1rem",
                }}
              >
                Overtime Calculator
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    color: "#a1a1aa",
                    fontSize: "0.85rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  Hours Worked This Week
                </label>
                <input
                  type="number"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #3f3f46",
                    background: "#09090b",
                    color: "#fafafa",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
              <div
                style={{ marginBottom: "1rem", fontSize: "0.85rem", color: "#71717a" }}
              >
                Hourly rate from above: {fmt(hourlyNum)}/hr
              </div>
              {[
                [
                  "Regular Hours (≤40)",
                  `${Math.min(hoursNum, 40)}h @ ${fmt(hourlyNum)}`,
                ],
                [
                  "Overtime Hours (>40)",
                  `${ot.overtimeHours}h @ ${fmt(hourlyNum * 1.5)} (1.5x)`,
                ],
                ["Regular Pay", fmt(ot.regularPay)],
                ["Overtime Pay", fmt(ot.overtimePay)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.3rem 0",
                    borderBottom: "1px solid #27272a",
                    fontSize: "0.875rem",
                  }}
                >
                  <span style={{ color: "#a1a1aa" }}>{label}</span>
                  <span style={{ color: "#fafafa" }}>{value}</span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.75rem 0 0",
                  fontWeight: 700,
                }}
              >
                <span style={{ color: "#a78bfa" }}>Weekly Total Pay</span>
                <span style={{ color: "#22c55e" }}>{fmt(ot.totalPay)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <p
        style={{
          marginTop: "3rem",
          fontSize: "0.8rem",
          color: "#52525b",
          borderTop: "1px solid #27272a",
          paddingTop: "1rem",
        }}
      >
        Results are for informational purposes only. Consult a qualified professional for official
        decisions.
      </p>
    </div>
  );
}
