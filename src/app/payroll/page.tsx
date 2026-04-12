"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  grossToNet,
  netToGross,
  calculateOvertime,
  hourlyRateFromMonthly,
  employerCost,
  DEFAULT_2025_PARAMS,
  type PayrollParams,
  type TaxBracket,
  type OvertimeType,
} from "@/lib/calculations/payroll";
import ExportButton from "@/components/ui/ExportButton";
import PrintButton from "@/components/ui/PrintButton";
import type { ExportRow } from "@/lib/export";

// TABS defined inside component using t()

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

// ─── Parameter Panel ─────────────────────────────────────────────────────────

function ParamsPanel({
  params,
  onChange,
  isCustom,
}: {
  params: PayrollParams;
  onChange: (p: PayrollParams) => void;
  isCustom: boolean;
}) {
  const [open, setOpen] = useState(false);

  const setField = (key: keyof Omit<PayrollParams, "taxBrackets">, value: number) => {
    onChange({ ...params, [key]: value });
  };

  const setBracketRate = (index: number, rate: number) => {
    const updated = params.taxBrackets.map((b, i) =>
      i === index ? { ...b, rate } : b
    );
    onChange({ ...params, taxBrackets: updated });
  };

  const setBracketMax = (index: number, max: number) => {
    const updated = params.taxBrackets.map((b, i) => {
      if (i === index) return { ...b, max };
      // Update next bracket's min
      if (i === index + 1) return { ...b, min: max + 1 };
      return b;
    });
    onChange({ ...params, taxBrackets: updated });
  };

  const reset = () => onChange(DEFAULT_2025_PARAMS);

  const paramInputStyle: React.CSSProperties = {
    ...inputStyle,
    padding: "0.4rem 0.6rem",
    fontSize: "0.85rem",
    width: "110px",
  };

  const { t } = useLanguage();

  return (
    <div style={{ ...card, marginBottom: "1.75rem" }}>
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
            {t("payroll.params.title")}
          </span>
          <span style={{
            fontSize: "0.7rem",
            padding: "0.2rem 0.5rem",
            borderRadius: "1rem",
            background: isCustom ? "rgba(234,179,8,0.15)" : "rgba(124,58,237,0.15)",
            color: isCustom ? "#eab308" : "#a78bfa",
            fontWeight: 600,
          }}>
            {isCustom ? t("payroll.params.custom") : t("payroll.params.defaults")}
          </span>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}
        >
          <path d="M3 6l5 5 5-5" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{ marginTop: "1.25rem" }}>
          {/* Basic params */}
          <div style={{ marginBottom: "1.25rem" }}>
            <p style={{ color: "#71717a", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
              SGK &amp; Stopajlar
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem" }}>
              {[
                { key: "sgkEmployee" as const, label: "SGK İşçi Primi (%)", multiplier: 100 },
                { key: "unemploymentEmployee" as const, label: "İşsizlik İşçi (%)", multiplier: 100 },
                { key: "stampTax" as const, label: "Damga Vergisi (%)", multiplier: 100 },
                { key: "agi" as const, label: "AGİ (TL)", multiplier: 1 },
                { key: "sgkEmployer" as const, label: "SGK İşveren (%)", multiplier: 100 },
                { key: "unemploymentEmployer" as const, label: "İşsizlik İşveren (%)", multiplier: 100 },
              ].map(({ key, label, multiplier }) => (
                <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                  <span style={{ color: "#a1a1aa", fontSize: "0.85rem", flexGrow: 1 }}>{label}</span>
                  <input
                    type="number"
                    step={key === "agi" ? "1" : "0.001"}
                    min={0}
                    style={paramInputStyle}
                    value={multiplier === 1 ? params[key] : +(params[key] as number * 100).toFixed(4)}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) setField(key, multiplier === 1 ? v : v / 100);
                    }}
                    placeholder={
                      multiplier === 1
                        ? String(DEFAULT_2025_PARAMS[key])
                        : String(+(DEFAULT_2025_PARAMS[key] as number * 100).toFixed(4))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tax brackets */}
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ color: "#71717a", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
              Gelir Vergisi Dilimleri
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr>
                    <th style={{ color: "#52525b", textAlign: "left", padding: "0.35rem 0.5rem", fontWeight: 500 }}>Dilim</th>
                    <th style={{ color: "#52525b", textAlign: "left", padding: "0.35rem 0.5rem", fontWeight: 500 }}>Alt Limit (TL)</th>
                    <th style={{ color: "#52525b", textAlign: "left", padding: "0.35rem 0.5rem", fontWeight: 500 }}>Üst Limit (TL)</th>
                    <th style={{ color: "#52525b", textAlign: "left", padding: "0.35rem 0.5rem", fontWeight: 500 }}>Oran (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {params.taxBrackets.map((bracket, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #27272a" }}>
                      <td style={{ color: "#71717a", padding: "0.5rem" }}>Dilim {i + 1}</td>
                      <td style={{ padding: "0.4rem 0.5rem" }}>
                        <input
                          type="number"
                          disabled
                          value={bracket.min}
                          style={{ ...paramInputStyle, width: "120px", opacity: 0.5, cursor: "not-allowed" }}
                        />
                      </td>
                      <td style={{ padding: "0.4rem 0.5rem" }}>
                        {bracket.max === Infinity ? (
                          <span style={{ color: "#52525b", fontSize: "0.85rem", padding: "0.4rem 0.6rem" }}>∞</span>
                        ) : (
                          <input
                            type="number"
                            min={bracket.min + 1}
                            style={{ ...paramInputStyle, width: "120px" }}
                            value={bracket.max}
                            onChange={(e) => {
                              const v = parseInt(e.target.value);
                              if (!isNaN(v) && v > bracket.min) setBracketMax(i, v);
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
                          style={{ ...paramInputStyle, width: "80px" }}
                          value={+(bracket.rate * 100).toFixed(1)}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            if (!isNaN(v) && v >= 0 && v <= 100) setBracketRate(i, v / 100);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#27272a"; }}
            onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            {t("payroll.params.resetDefaults")}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Tab 1: Gross → Net ───────────────────────────────────────────────────────

function GrossToNetTab({ params }: { params: PayrollParams }) {
  const [gross, setGross] = useState("30000");
  const val = parseFloat(gross);
  const valid = val > 0 && val <= 10_000_000;
  const result = valid ? grossToNet(val, params) : null;

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
          <ResultRow name={`SGK İşçi Primi (%${(params.sgkEmployee * 100).toFixed(1)})`} amount={`− ${fmtTL(result.sgkWorker)}`} rate={fmtPct(params.sgkEmployee * 100)} />
          <ResultRow name={`İşsizlik Sigortası İşçi (%${(params.unemploymentEmployee * 100).toFixed(1)})`} amount={`− ${fmtTL(result.unemployment)}`} rate={fmtPct(params.unemploymentEmployee * 100)} />
          <ResultRow name="Gelir Vergisi Matrahı" amount={fmtTL(result.taxBase)} />
          <ResultRow name="Gelir Vergisi" amount={`− ${fmtTL(result.monthlyIncomeTax)}`} />
          <ResultRow name={`Damga Vergisi (%${(params.stampTax * 100).toFixed(3)})`} amount={`− ${fmtTL(result.stampTax)}`} rate={`${(params.stampTax * 100).toFixed(3)}%`} />
          <ResultRow name={`AGİ (Bekar)`} amount={`+ ${fmtTL(result.agi)}`} />
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

function NetToGrossTab({ params }: { params: PayrollParams }) {
  const [net, setNet] = useState("20000");
  const val = parseFloat(net);
  const valid = val > 0 && val <= 8_000_000;
  const result = valid ? netToGross(val, params) : null;

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

function EmployerCostTab({ params }: { params: PayrollParams }) {
  const [gross, setGross] = useState("30000");
  const val = parseFloat(gross);
  const valid = val > 0 && val <= 10_000_000;
  const result = valid ? employerCost(val, params) : null;

  return (
    <div style={card}>
      <h3 style={{ color: "#fafafa", fontWeight: 700, marginBottom: "0.5rem" }}>İşveren Maliyeti</h3>
      <p style={{ color: "#52525b", fontSize: "0.75rem", marginBottom: "1.25rem" }}>2025 parametreleri — SGK işveren payı, işsizlik</p>
      <label style={labelStyle}>Brüt Maaş (₺)</label>
      <input type="number" min="1" max="10000000" style={{ ...inputStyle, maxWidth: "320px" }} value={gross} onChange={(e) => setGross(e.target.value)} />
      {result && (
        <div style={{ marginTop: "1.25rem" }}>
          <ResultRow name="Brüt Maaş" amount={fmtTL(result.grossSalary)} />
          <ResultRow name={`SGK İşveren (%${(params.sgkEmployer * 100).toFixed(1)})`} amount={fmtTL(result.sgkEmployer)} rate={`${(params.sgkEmployer * 100).toFixed(1)}%`} />
          <ResultRow name={`İşsizlik İşveren (%${(params.unemploymentEmployer * 100).toFixed(1)})`} amount={fmtTL(result.unemploymentEmployer)} rate={`${(params.unemploymentEmployer * 100).toFixed(1)}%`} />
          <ResultRow name="Toplam İşveren Maliyeti" amount={fmtTL(result.totalEmployerCost)} highlight />
          <ResultRow name="Brüt Üzeri Ek Yük" amount={fmtPct(result.totalOverGross)} />
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function paramsAreDefault(params: PayrollParams): boolean {
  const d = DEFAULT_2025_PARAMS;
  if (
    params.sgkEmployee !== d.sgkEmployee ||
    params.unemploymentEmployee !== d.unemploymentEmployee ||
    params.stampTax !== d.stampTax ||
    params.agi !== d.agi ||
    params.sgkEmployer !== d.sgkEmployer ||
    params.unemploymentEmployer !== d.unemploymentEmployer
  ) return false;
  if (params.taxBrackets.length !== d.taxBrackets.length) return false;
  for (let i = 0; i < params.taxBrackets.length; i++) {
    if (
      params.taxBrackets[i].rate !== d.taxBrackets[i].rate ||
      params.taxBrackets[i].max !== d.taxBrackets[i].max
    ) return false;
  }
  return true;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PayrollPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [params, setParams] = useState<PayrollParams>(DEFAULT_2025_PARAMS);
  const isCustom = !paramsAreDefault(params);

  const TABS = [
    t("payroll.tab.grossToNet"),
    t("payroll.tab.netToGross"),
    t("payroll.tab.overtime"),
    t("payroll.tab.employerCost"),
  ];

  function getExportData(): ExportRow[] {
    // Export a snapshot of 2025 defaults summary
    const g = grossToNet(30000, params);
    return [
      { Alan: "Brüt Maaş", Değer: g.gross },
      { Alan: "SGK İşçi", Değer: g.sgkWorker },
      { Alan: "İşsizlik", Değer: g.unemployment },
      { Alan: "Gelir Vergisi", Değer: g.monthlyIncomeTax },
      { Alan: "Damga Vergisi", Değer: g.stampTax },
      { Alan: "AGİ", Değer: g.agi },
      { Alan: "Net Maaş", Değer: g.net },
      { Alan: "Efektif Kesinti (%)", Değer: g.effectiveRate.toFixed(2) },
    ];
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.75rem", color: "#fafafa", marginBottom: "0.5rem" }}>Maaş &amp; SGK Hesaplayıcı</h1>
          <p style={{ color: "#71717a", fontSize: "0.9rem" }}>Türkiye 2025 parametreleri — brüt/net, mesai, işveren maliyeti</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
          <ExportButton getData={getExportData} filename="calmatic-payroll" sheetName="TR Payroll" />
          <PrintButton />
        </div>
      </div>

      {/* Collapsible params panel */}
      <ParamsPanel params={params} onChange={setParams} isCustom={isCustom} />

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

      {activeTab === 0 && <GrossToNetTab params={params} />}
      {activeTab === 1 && <NetToGrossTab params={params} />}
      {activeTab === 2 && <OvertimeTab />}
      {activeTab === 3 && <EmployerCostTab params={params} />}

      <p style={{ textAlign: "center", color: "#52525b", fontSize: "0.75rem", marginTop: "2rem" }}>
        {t("payroll.disclaimer")}
      </p>
    </div>
  );
}
