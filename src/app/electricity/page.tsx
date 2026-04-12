"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  calcApplianceCost, calcSolarSavings, calcBulbComparison,
  type Appliance, type SolarInputs, type BulbCompareInputs,
} from "@/lib/calculations/electricity";

const fmtCurrency = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.6rem 1.25rem", borderRadius: "0.5rem", fontWeight: 600, fontSize: "0.9rem",
        background: active ? "#7c3aed" : "transparent",
        color: active ? "#fff" : "#71717a",
        border: active ? "none" : "1px solid #3f3f46",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function NumInput({ label, value, onChange, min, max, step, prefix, suffix }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; prefix?: string; suffix?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.75rem", color: "#a1a1aa", marginBottom: "0.25rem" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", background: "#27272a", borderRadius: "0.375rem", border: "1px solid #3f3f46" }}>
        {prefix && <span style={{ padding: "0 0.5rem", color: "#71717a", fontSize: "0.85rem" }}>{prefix}</span>}
        <input
          type="number" value={value} min={min} max={max} step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fafafa", padding: "0.5rem 0.4rem", fontSize: "0.9rem" }}
        />
        {suffix && <span style={{ padding: "0 0.5rem", color: "#71717a", fontSize: "0.85rem" }}>{suffix}</span>}
      </div>
    </div>
  );
}

let nextId = 1;
function makeAppliance(): Appliance {
  return { id: String(nextId++), name: "Appliance", wattage: 100, hoursPerDay: 4, daysPerMonth: 30, rate: 0.16 };
}

// Tab 1: Appliance
function ApplianceTab() {
  const { t } = useLanguage();
  const [appliances, setAppliances] = useState<Appliance[]>([makeAppliance()]);

  const setField = (id: string, field: keyof Appliance, value: string | number) =>
    setAppliances((prev) => prev.map((a) => a.id === id ? { ...a, [field]: value } : a));

  const results = useMemo(() => appliances.map((a) => ({ ...a, ...calcApplianceCost(a) })), [appliances]);
  const totals = useMemo(() => results.reduce(
    (acc, r) => ({ kwhPerMonth: acc.kwhPerMonth + r.kwhPerMonth, monthlyCost: acc.monthlyCost + r.monthlyCost, annualCost: acc.annualCost + r.annualCost }),
    { kwhPerMonth: 0, monthlyCost: 0, annualCost: 0 }
  ), [results]);

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #3f3f46" }}>
              {[t("electricity.appliance.name"), t("electricity.appliance.watts"), t("electricity.appliance.hrsDay"), t("electricity.appliance.daysMo"), t("electricity.appliance.rate"), t("electricity.appliance.kwhMo"), t("electricity.appliance.monthly"), t("electricity.appliance.annual"), ""].map((h) => (
                <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", color: "#71717a", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #27272a" }}>
                <td style={{ padding: "0.5rem 0.75rem" }}>
                  <input value={r.name} onChange={(e) => setField(r.id, "name", e.target.value)}
                    style={{ background: "transparent", border: "1px solid #3f3f46", borderRadius: "0.25rem", color: "#fafafa", padding: "0.25rem 0.5rem", width: "100px" }} />
                </td>
                {(["wattage", "hoursPerDay", "daysPerMonth", "rate"] as const).map((f) => (
                  <td key={f} style={{ padding: "0.5rem 0.75rem" }}>
                    <input type="number" value={r[f]} onChange={(e) => setField(r.id, f, Number(e.target.value))}
                      style={{ background: "transparent", border: "1px solid #3f3f46", borderRadius: "0.25rem", color: "#fafafa", padding: "0.25rem 0.5rem", width: "72px" }} />
                  </td>
                ))}
                <td style={{ padding: "0.5rem 0.75rem", color: "#a78bfa" }}>{r.kwhPerMonth.toFixed(1)}</td>
                <td style={{ padding: "0.5rem 0.75rem", color: "#22c55e" }}>{fmtCurrency(r.monthlyCost)}</td>
                <td style={{ padding: "0.5rem 0.75rem", color: "#f97316" }}>{fmtCurrency(r.annualCost)}</td>
                <td style={{ padding: "0.5rem 0.75rem" }}>
                  {appliances.length > 1 && (
                    <button onClick={() => setAppliances((p) => p.filter((a) => a.id !== r.id))}
                      style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1rem" }}>✕</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={() => setAppliances((p) => [...p, makeAppliance()])}
        style={{ marginTop: "0.75rem", padding: "0.5rem 1rem", borderRadius: "0.375rem", background: "transparent", border: "1px solid #7c3aed", color: "#a78bfa", cursor: "pointer", fontSize: "0.875rem" }}
      >
        {t("electricity.appliance.addAppliance")}
      </button>

      {/* Totals */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "1.5rem" }}>
        {[
          { label: t("electricity.appliance.totalKwh"), value: totals.kwhPerMonth.toFixed(1) + " kWh", color: "#a78bfa" },
          { label: t("electricity.appliance.totalMonthlyCost"), value: fmtCurrency(totals.monthlyCost), color: "#22c55e" },
          { label: t("electricity.appliance.totalAnnualCost"), value: fmtCurrency(totals.annualCost), color: "#f97316" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "#1c1c1f", borderRadius: "0.5rem", padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.3rem" }}>{label}</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tab 2: Solar
function SolarTab() {
  const { t } = useLanguage();
  const [inputs, setInputs] = useState<SolarInputs>({ monthlyBill: 150, sunHoursPerDay: 5, systemSizeKw: 6, costPerWatt: 2.5, rate: 0.16 });
  const set = <K extends keyof SolarInputs>(k: K, v: number) => setInputs((p) => ({ ...p, [k]: v }));
  const r = useMemo(() => calcSolarSavings(inputs), [inputs]);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <NumInput label={t("electricity.solar.monthlyBill")} value={inputs.monthlyBill} onChange={(v) => set("monthlyBill", v)} min={0} prefix="$" />
        <NumInput label={t("electricity.solar.systemSize")} value={inputs.systemSizeKw} onChange={(v) => set("systemSizeKw", v)} min={0} step={0.5} suffix="kW" />
        <NumInput label={t("electricity.solar.costPerWatt")} value={inputs.costPerWatt} onChange={(v) => set("costPerWatt", v)} min={0} step={0.1} prefix="$" />
        <NumInput label={t("electricity.solar.electricityRate")} value={inputs.rate} onChange={(v) => set("rate", v)} min={0} step={0.01} suffix="$/kWh" />
        <div style={{ gridColumn: "span 2" }}>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#a1a1aa", marginBottom: "0.3rem" }}>
            {t("electricity.solar.sunHours")}: <strong style={{ color: "#fafafa" }}>{inputs.sunHoursPerDay}h</strong>
          </label>
          <input type="range" min={3} max={8} step={0.5} value={inputs.sunHoursPerDay}
            onChange={(e) => set("sunHoursPerDay", Number(e.target.value))}
            style={{ width: "100%", accentColor: "#eab308" }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {[
          { label: t("electricity.solar.systemCost"), value: fmtCurrency(r.systemCost), color: "#f97316" },
          { label: t("electricity.solar.monthlyProduction"), value: `${r.monthlyProduction.toFixed(0)} kWh`, color: "#a78bfa" },
          { label: t("electricity.solar.monthlySavings"), value: fmtCurrency(r.monthlySavings), color: "#22c55e" },
          { label: t("electricity.solar.annualSavings"), value: fmtCurrency(r.annualSavings), color: "#22c55e" },
          { label: t("electricity.solar.paybackPeriod"), value: isFinite(r.paybackYears) ? `${r.paybackYears.toFixed(1)} ${t("rentBuy.label.years")}` : "N/A", color: "#3b82f6" },
          { label: t("electricity.solar.savings25yr"), value: fmtCurrency(r.savings25yr), color: r.savings25yr >= 0 ? "#22c55e" : "#ef4444" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "#1c1c1f", borderRadius: "0.5rem", padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.3rem" }}>{label}</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tab 3: Bulb Comparison
function BulbTab() {
  const { t } = useLanguage();
  const [inputs, setInputs] = useState<BulbCompareInputs>({
    hoursPerDay: 5, rate: 0.16,
    incandescent: { watt: 60, cost: 0.5 },
    cfl: { watt: 13, cost: 3 },
    led: { watt: 9, cost: 7 },
  });

  const results = useMemo(() => calcBulbComparison(inputs), [inputs]);
  const minTenYear = Math.min(...results.map((r) => r.tenYearTotal));
  const colors = ["#f97316", "#3b82f6", "#22c55e"];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <NumInput label={t("electricity.bulb.hoursPerDay")} value={inputs.hoursPerDay} onChange={(v) => setInputs((p) => ({ ...p, hoursPerDay: v }))} min={0} max={24} />
        <NumInput label={t("electricity.solar.electricityRate")} value={inputs.rate} onChange={(v) => setInputs((p) => ({ ...p, rate: v }))} min={0} step={0.01} suffix="$/kWh" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {(["incandescent", "cfl", "led"] as const).map((key, i) => (
          <div key={key} style={{ background: "#1c1c1f", borderRadius: "0.5rem", padding: "1rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: colors[i], marginBottom: "0.75rem", textTransform: "capitalize" }}>{key}</div>
            <NumInput label={t("electricity.bulb.wattage")} value={inputs[key].watt} onChange={(v) => setInputs((p) => ({ ...p, [key]: { ...p[key], watt: v } }))} min={1} suffix="W" />
            <div style={{ marginTop: "0.5rem" }}>
              <NumInput label={t("electricity.bulb.bulbCost")} value={inputs[key].cost} onChange={(v) => setInputs((p) => ({ ...p, [key]: { ...p[key], cost: v } }))} min={0} step={0.1} prefix="$" />
            </div>
          </div>
        ))}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #3f3f46" }}>
              {[t("electricity.bulb.bulbCol"), t("electricity.bulb.wattsCol"), t("electricity.bulb.kwhYr"), t("electricity.bulb.energyYr"), t("electricity.bulb.replacements10yr"), t("electricity.bulb.tenYearTotal")].map((h) => (
                <th key={h} style={{ padding: "0.6rem 0.75rem", textAlign: "left", color: "#71717a", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={r.name} style={{
                borderBottom: "1px solid #27272a",
                background: r.tenYearTotal === minTenYear ? "#16a34a15" : "transparent",
              }}>
                <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600, color: colors[i] }}>
                  {r.name} {r.tenYearTotal === minTenYear ? "✓" : ""}
                </td>
                <td style={{ padding: "0.6rem 0.75rem", color: "#d4d4d8" }}>{r.watt}W</td>
                <td style={{ padding: "0.6rem 0.75rem", color: "#a1a1aa" }}>{r.annualKwh.toFixed(1)}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: "#a78bfa" }}>{fmtCurrency(r.annualEnergyCost)}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: "#f97316" }}>{r.bulbReplacements10yr}</td>
                <td style={{ padding: "0.6rem 0.75rem", fontWeight: 700, color: r.tenYearTotal === minTenYear ? "#22c55e" : "#d4d4d8" }}>
                  {fmtCurrency(r.tenYearTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ElectricityPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"appliance" | "solar" | "bulb">("appliance");

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem", color: "#fafafa" }}>
        {t("electricity.title")}
      </h1>
      <p style={{ color: "#71717a", marginBottom: "2rem" }}>
        {t("electricity.subtitle")}
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <TabButton active={tab === "appliance"} onClick={() => setTab("appliance")}>{t("electricity.tab.appliance")}</TabButton>
        <TabButton active={tab === "solar"} onClick={() => setTab("solar")}>{t("electricity.tab.solar")}</TabButton>
        <TabButton active={tab === "bulb"} onClick={() => setTab("bulb")}>{t("electricity.tab.bulb")}</TabButton>
      </div>

      <div style={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "0.75rem", padding: "1.5rem" }}>
        {tab === "appliance" && <ApplianceTab />}
        {tab === "solar" && <SolarTab />}
        {tab === "bulb" && <BulbTab />}
      </div>

      <p style={{ color: "#52525b", fontSize: "0.8rem", textAlign: "center", marginTop: "1.5rem" }}>
        {t("electricity.disclaimer")}
      </p>
    </div>
  );
}
