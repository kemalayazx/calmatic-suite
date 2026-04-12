"use client";

import { useState } from "react";
import {
  grossToNet,
  netToGross,
  calculateOvertime,
  hourlyRateFromMonthly,
  employerCost,
  PAYROLL_2025,
  type OvertimeType,
} from "@/lib/calculations/payroll";

const TABS = ["Gross → Net", "Net → Gross", "Overtime", "Employer Cost"];

const card: React.CSSProperties = {
  background: "rgba(24,24,27,0.7)",
  border: "1px solid #27272a",
  borderRadius: "0.875rem",
  padding: "1.5rem",
  marginBottom: "1.25rem",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  color: "#a1a1aa",
  marginBottom: "0.35rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "0.5rem",
  padding: "0.625rem 0.875rem",
  color: "#fafafa",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };

function fmtTL(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";
}

function fmtPct(n: number): string {
  return n.toFixed(2) + "%";
}

function ResultRow({ name, amount, rate, highlight }: { name: string; amount: string; rate?: string; highlight?: boolean }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.625rem 0",
      borderBottom: "1px solid #27272a",
      background: highlight ? "rgba(124,58,237,0.07)" : "transparent",
      borderRadius: highlight ? "0.375rem" : undefined,
      paddingLeft: highlight ? "0.5rem" : undefined,
    }}>
      <span style={{ color: highlight ? "#a78bfa" : "#a1a1aa", fontSize: "0.875rem", fontWeight: highlight ? 600 : 400 }}>{name}</span>
      <div style={{ textAlign: "right" }}>
        <span style={{ color: highlight ? "#a78bfa" : "#fafafa", fontFamily: "monospace", fontWeight: 600 }}>{amount}</span>
        {rate && <span style={{ color: "#52525b", fontSize: "0.75rem", marginLeft: "0.5rem" }}>({rate})</span>}
      </div>
    </div>
  );
}

// ─── Tab 1: Gross → Net ───────────────────────────────────────────────────────

function GrossToNetTab() {
  const [gross, setGross] = useState("30000");
  const val = parseFloat(gross);
  const valid = val > 0 && val <= 10_000_000;
  const result = valid ? grossToNet(val) : null;

  return (
    <div>
      <div style={card}>
        <h3 style={{ color: "#fafafa", fontWeight: 700, marginBottom: "0.5rem" }}>Brüt → Net Maaş Hesabı</h3>
        <p style={{ color: "#52525b", fontSize: "0.75rem", marginBottom: "1.25rem" }}>2025 parametreleri — SGK, gelir vergisi, damga vergisi, AGİ</p>
        <label style={labelStyle}>Brüt Maaş (₺)</label>
        <input
          type="number" min="1" max="10000000" style={{ ...inputStyle, maxWidth: "320px" }}
          value={gross} onChange={(e) => setGross(e.target.value)}
        />
      </div>

      {result && (
        <div style={card}>
          <h3 style={{ color: "#fafafa", fontWeight: 700, marginBottom: "1rem" }}>Hesaplama Detayı</h3>
          <ResultRow name="Brüt Maaş" amount={fmtTL(result.gross)} />
          <ResultRow name="SGK İşçi Primi (%14)" amount={`− ${fmtTL(result.sgkWorker)}`} rate={fmtPct(PAYROLL_2025.SGK_WORKER_RATE * 100)} />
          <ResultRow name="İşsizlik Sigortası İşçi (%1)" amount={`− ${fmtTL(result.unemployment)}`} rate={fmtPct(PAYROLL_2025.UNEMPLOYMENT_WORKER_RATE * 100)} />
          <ResultRow name="Gelir Vergisi Matrahı" amount={fmtTL(result.taxBase)} />
          <ResultRow name="Gelir Vergisi" amount={`− ${fmtTL(result.monthlyIncomeTax)}`} />
          <ResultRow name="Damga Vergisi (%0.759)" amount={`− ${fmtTL(result.stampTax)}`} rate="0.759%" />
          <ResultRow name="AGİ (Bekar)" amount={`+ ${fmtTL(result.agi)}`} />
          <ResultRow name="Net Maaş" amount={fmtTL(result.net)} highlight />
          <ResultRow name="Efektif Kesinti Oranı" amount={fmtPct(result.effectiveRate)} />

          {result.taxBreakdown.length > 0 && (
            <div style={{ marginTop: "1.25rem" }}>
              <p style={{ color: "#71717a", fontSize: "0.75rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Gelir Vergisi Dilimleri (Yıllık baz)</p>
              {result.taxBreakdown.map((b, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", padding: "0.25rem 0", color: "#71717a" }}>
                  <span>{b.bracket}</span>
                  <span style={{ fontFamily: "monospace" }}>%{(b.rate * 100).toFixed(0)} → {fmtTL(b.tax / 12)}/ay</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: Net → Gross ───────────────────────────────────────────────────────

function NetToGrossTab() {
  const [net, setNet] = useState("20000");
  const val = parseFloat(net);
  const valid = val > 0 && val <= 8_000_000;
  const result = valid ? netToGross(val) : null;

  return (
    <div>
      <div style={card}>
        <h3 style={{ color: "#fafafa", fontWeight: 700, marginBottom: "0.5rem" }}>Net → Brüt Maaş Hesabı</h3>
        <p style={{ color: "#52525b", fontSize: "0.75rem", marginBottom: "1.25rem" }}>İteratif binary search — 0.01 ₺ hassasiyet</p>
        <label style={labelStyle}>Net Maaş (₺)</label>
        <input
          type="number" min="1" max="8000000" style={{ ...inputStyle, maxWidth: "320px" }}
          value={net} onChange={(e) => setNet(e.target.value)}
        />
      </div>
      {result && (
        <div style={card}>
          <ResultRow name="Hedef Net Maaş" amount={fmtTL(val)} />
          <ResultRow name="Hesaplanan Brüt Maaş" amount={fmtTL(result.gross)} highlight />
          <ResultRow name="SGK İşçi" amount={fmtTL(result.details.sgkWorker)} />
          <ResultRow name="İşsizlik" amount={fmtTL(result.details.unemployment)} />
          <ResultRow name="Gelir Vergisi" amount={fmtTL(result.details.monthlyIncomeTax)} />
          <ResultRow name="Damga Vergisi" amount={fmtTL(result.details.stampTax)} />
          <ResultRow name="AGİ" amount={`+ ${fmtTL(result.details.agi)}`} />
          <ResultRow name="Net (doğrulama)" amount={fmtTL(result.details.net)} />
        </div>
      )}
    </div>
  );
}

// ─── Tab 3: Overtime ─────────────────────────────────────────────────────────

function OvertimeTab() {
  const [normalHours, setNormalHours] = useState("45");
  const [actualHours, setActualHours] = useState("50");
  const [rateMode, setRateMode] = useState<"hourly" | "monthly">("monthly");
  const [hourlyRate, setHourlyRate] = useState("200");
  const [monthlyGross, setMonthlyGross] = useState("30000");
  const [overtimeType, setOvertimeType] = useState<OvertimeType>("weekday");

  const nh = parseFloat(normalHours);
  const ah = parseFloat(actualHours);
  const hr = rateMode === "hourly" ? parseFloat(hourlyRate) : hourlyRateFromMonthly(parseFloat(monthlyGross), nh);
  const valid = nh > 0 && ah > 0 && hr > 0;
  const result = valid ? calculateOvertime(nh, ah, hr, overtimeType) : null;

  return (
    <div style={card}>
      <h3 style={{ color: "#fafafa", fontWeight: 700, marginBottom: "1.25rem" }}>Mesai Hesabı</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label style={labelStyle}>Normal Çalışma (saat/hafta)</label>
          <input type="number" min="1" max="168" style={inputStyle} value={normalHours} onChange={(e) => setNormalHours(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Fiili Çalışma (saat/hafta)</label>
          <input type="number" min="1" max="168" style={inputStyle} value={actualHours} onChange={(e) => setActualHours(e.target.value)} />
        </div>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={labelStyle}>Ücret Türü</label>
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <button onClick={() => setRateMode("hourly")} style={{ padding: "0.375rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", background: rateMode === "hourly" ? "#7c3aed" : "#27272a", color: "#fafafa", fontSize: "0.85rem" }}>Saatlik Ücret</button>
          <button onClick={() => setRateMode("monthly")} style={{ padding: "0.375rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", background: rateMode === "monthly" ? "#7c3aed" : "#27272a", color: "#fafafa", fontSize: "0.85rem" }}>Aylık Brüt</button>
        </div>
        {rateMode === "hourly" ? (
          <>
            <label style={labelStyle}>Saatlik Ücret (₺)</label>
            <input type="number" min="0" style={{ ...inputStyle, maxWidth: "240px" }} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
          </>
        ) : (
          <>
            <label style={labelStyle}>Aylık Brüt Maaş (₺)</label>
            <input type="number" min="0" style={{ ...inputStyle, maxWidth: "240px" }} value={monthlyGross} onChange={(e) => setMonthlyGross(e.target.value)} />
            {parseFloat(monthlyGross) > 0 && <p style={{ color: "#52525b", fontSize: "0.75rem", marginTop: "0.25rem" }}>Saatlik: {fmtTL(hourlyRateFromMonthly(parseFloat(monthlyGross), nh))}</p>}
          </>
        )}
      </div>
      <div style={{ marginBottom: "1.25rem" }}>
        <label style={labelStyle}>Mesai Türü</label>
        <select value={overtimeType} onChange={(e) => setOvertimeType(e.target.value as OvertimeType)} style={{ ...selectStyle, maxWidth: "280px" }}>
          <option value="weekday">Hafta İçi (%50 zamlı)</option>
          <option value="weekend">Hafta Sonu (%100 zamlı)</option>
          <option value="holiday">Resmi Tatil (%100 zamlı)</option>
        </select>
      </div>
      {result && (
        <>
          <ResultRow name="Normal Çalışma Ücreti" amount={fmtTL(result.normalWage)} />
          <ResultRow name={`Mesai Ücreti (${result.overtimeHours}h × ×${result.overtimeRate})`} amount={fmtTL(result.overtimePay)} />
          <ResultRow name="Toplam Haftalık Ücret" amount={fmtTL(result.total)} highlight />
        </>
      )}
    </div>
  );
}

// ─── Tab 4: Employer Cost ─────────────────────────────────────────────────────

function EmployerCostTab() {
  const [gross, setGross] = useState("30000");
  const val = parseFloat(gross);
  const valid = val > 0 && val <= 10_000_000;
  const result = valid ? employerCost(val) : null;

  return (
    <div style={card}>
      <h3 style={{ color: "#fafafa", fontWeight: 700, marginBottom: "0.5rem" }}>İşveren Maliyeti</h3>
      <p style={{ color: "#52525b", fontSize: "0.75rem", marginBottom: "1.25rem" }}>2025 parametreleri — SGK işveren payı, işsizlik</p>
      <label style={labelStyle}>Brüt Maaş (₺)</label>
      <input type="number" min="1" max="10000000" style={{ ...inputStyle, maxWidth: "320px" }} value={gross} onChange={(e) => setGross(e.target.value)} />
      {result && (
        <div style={{ marginTop: "1.25rem" }}>
          <ResultRow name="Brüt Maaş" amount={fmtTL(result.grossSalary)} />
          <ResultRow name="SGK İşveren (%20.5)" amount={fmtTL(result.sgkEmployer)} rate="20.5%" />
          <ResultRow name="İşsizlik İşveren (%2)" amount={fmtTL(result.unemploymentEmployer)} rate="2%" />
          <ResultRow name="Toplam İşveren Maliyeti" amount={fmtTL(result.totalEmployerCost)} highlight />
          <ResultRow name="Brüt Üzeri Ek Yük" amount={fmtPct(result.totalOverGross)} />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontWeight: 800, fontSize: "1.75rem", color: "#fafafa", marginBottom: "0.5rem" }}>Maaş &amp; SGK Hesaplayıcı</h1>
        <p style={{ color: "#71717a", fontSize: "0.9rem" }}>Türkiye 2025 parametreleri — brüt/net, mesai, işveren maliyeti</p>
      </div>

      <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "2rem", borderBottom: "1px solid #27272a" }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "0.625rem 1.125rem",
              border: "none",
              borderBottom: activeTab === i ? "2px solid #22d3ee" : "2px solid transparent",
              background: "transparent",
              color: activeTab === i ? "#22d3ee" : "#71717a",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: activeTab === i ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && <GrossToNetTab />}
      {activeTab === 1 && <NetToGrossTab />}
      {activeTab === 2 && <OvertimeTab />}
      {activeTab === 3 && <EmployerCostTab />}

      <p style={{ textAlign: "center", color: "#52525b", fontSize: "0.75rem", marginTop: "2rem" }}>
        Results are for informational purposes only. Consult a professional for official calculations. (2025 parametreleri)
      </p>
    </div>
  );
}
