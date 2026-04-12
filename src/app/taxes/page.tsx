"use client";

import { useState } from "react";
import {
  invoiceTaxBreakdown,
  annualIncomeTax,
  stopajHesapla,
  STOPAJ_RATES,
  type VATRate,
  type StopajType,
} from "@/lib/calculations/taxes";
import ExportButton from "@/components/ui/ExportButton";
import PrintButton from "@/components/ui/PrintButton";
import type { ExportRow } from "@/lib/export";

const TABS = ["Invoice VAT", "Annual Income Tax", "Withholding (Stopaj)"];

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

function fmtPct(n: number, decimals = 2): string {
  return n.toFixed(decimals) + "%";
}

function Row({ name, amount, highlight, subdued }: { name: string; amount: string; highlight?: boolean; subdued?: boolean }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "0.5rem 0",
      borderBottom: "1px solid #27272a",
    }}>
      <span style={{ color: subdued ? "#52525b" : highlight ? "#f87171" : "#a1a1aa", fontSize: "0.875rem", fontWeight: highlight ? 600 : 400 }}>{name}</span>
      <span style={{ color: highlight ? "#f87171" : "#fafafa", fontFamily: "monospace", fontWeight: 600 }}>{amount}</span>
    </div>
  );
}

// ─── Tab 1: Invoice VAT Breakdown ─────────────────────────────────────────────

function InvoiceTab({ onResults }: { onResults: (d: ExportRow[]) => void }) {
  const [amount, setAmount] = useState("1000");
  const [inputType, setInputType] = useState<"net" | "gross">("net");
  const [vatRate, setVatRate] = useState<VATRate>(18);
  const [otvRate, setOtvRate] = useState("0");
  const [stopajRate, setStopajRate] = useState("0");
  const [stopajPreset, setStopajPreset] = useState("manual");

  const STOPAJ_PRESETS = [
    { label: "Yok", value: "0" },
    { label: "Serbest Meslek (%20)", value: "20" },
    { label: "Kira (%20)", value: "20" },
    { label: "Temettü (%10)", value: "10" },
    { label: "Menkul Kıymet (%10)", value: "10" },
    { label: "Diğer (%15)", value: "15" },
    { label: "Manuel", value: "manual" },
  ];

  const amtVal = parseFloat(amount);
  const otvVal = parseFloat(otvRate) || 0;
  const stopajVal = parseFloat(stopajRate) || 0;
  const valid = amtVal > 0 && amtVal <= 1_000_000_000;

  const result = valid ? invoiceTaxBreakdown(amtVal, inputType, vatRate, otvVal, stopajVal) : null;

  if (result) {
    onResults([
      { Alan: "Net Tutar", Değer: result.netAmount },
      { Alan: `KDV (%${vatRate})`, Değer: result.vatAmount },
      { Alan: "KDV Dahil Tutar", Değer: result.grossAmount },
      { Alan: "Damga Vergisi", Değer: result.stampTax },
      { Alan: "ÖTV", Değer: result.otvAmount },
      { Alan: "Stopaj", Değer: result.stopajAmount },
      { Alan: "Alıcı Toplam", Değer: result.buyerTotal },
      { Alan: "Satıcı → Devlet", Değer: result.sellerToGovt },
    ]);
  }

  return (
    <div>
      <div style={card}>
        <h3 style={{ color: "#fafafa", fontWeight: 700, marginBottom: "1.25rem" }}>Fatura Vergi Dökümü</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={labelStyle}>Tutar (₺)</label>
            <input type="number" min="0" max="1000000000" style={inputStyle} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Tutar Türü</label>
            <select value={inputType} onChange={(e) => setInputType(e.target.value as "net" | "gross")} style={selectStyle}>
              <option value="net">KDV Hariç (Net)</option>
              <option value="gross">KDV Dahil (Gross)</option>
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={labelStyle}>KDV Oranı</label>
            <select value={vatRate} onChange={(e) => setVatRate(parseInt(e.target.value) as VATRate)} style={selectStyle}>
              <option value={1}>%1</option>
              <option value={8}>%8</option>
              <option value={18}>%18</option>
              <option value={20}>%20</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>ÖTV Oranı (%)</label>
            <input type="number" min="0" max="300" style={inputStyle} value={otvRate} onChange={(e) => setOtvRate(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label style={labelStyle}>Stopaj</label>
            <select value={stopajPreset} onChange={(e) => {
              setStopajPreset(e.target.value);
              if (e.target.value !== "manual") setStopajRate(e.target.value);
            }} style={selectStyle}>
              {STOPAJ_PRESETS.map((p) => <option key={p.label} value={p.value === "manual" ? "manual" : p.value}>{p.label}</option>)}
            </select>
            {stopajPreset === "manual" && (
              <input type="number" min="0" max="100" style={{ ...inputStyle, marginTop: "0.5rem" }} value={stopajRate} onChange={(e) => setStopajRate(e.target.value)} placeholder="Manuel oran (%)" />
            )}
          </div>
        </div>
      </div>

      {result && (
        <div style={card}>
          <h3 style={{ color: "#fafafa", fontWeight: 700, marginBottom: "1rem" }}>Vergi Dökümü</h3>
          <Row name="Net Tutar (KDV Hariç)" amount={fmtTL(result.netAmount)} />
          <Row name={`KDV (%${vatRate})`} amount={fmtTL(result.vatAmount)} />
          <Row name="KDV Dahil Tutar" amount={fmtTL(result.grossAmount)} />
          <Row name="Fatura Damga Vergisi (‰9.48)" amount={fmtTL(result.stampTax)} />
          {result.otvAmount > 0 && <Row name={`ÖTV (%${otvVal})`} amount={fmtTL(result.otvAmount)} />}
          {result.stopajAmount > 0 && <Row name={`Stopaj (%${stopajVal})`} amount={fmtTL(result.stopajAmount)} />}

          <div style={{ height: "0.75rem" }} />
          <div style={{ background: "rgba(239,68,68,0.08)", borderRadius: "0.5rem", padding: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ color: "#a1a1aa", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Alıcının Ödeyeceği Toplam</div>
            <div style={{ color: "#fafafa", fontFamily: "monospace", fontWeight: 700, fontSize: "1.25rem" }}>{fmtTL(result.buyerTotal)}</div>
          </div>
          <div style={{ background: "rgba(234,88,12,0.08)", borderRadius: "0.5rem", padding: "1rem" }}>
            <div style={{ color: "#a1a1aa", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Satıcının Devlete Ödeyeceği</div>
            <div style={{ color: "#fb923c", fontFamily: "monospace", fontWeight: 700, fontSize: "1.25rem" }}>{fmtTL(result.sellerToGovt)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: Annual Income Tax ─────────────────────────────────────────────────

function AnnualIncomeTaxTab({ onResults }: { onResults: (d: ExportRow[]) => void }) {
  const [income, setIncome] = useState("300000");
  const val = parseFloat(income);
  const valid = val > 0 && val <= 100_000_000;
  const result = valid ? annualIncomeTax(val) : null;

  if (result) {
    onResults([
      { Alan: "Yıllık Gelir", Değer: result.annualIncome },
      { Alan: "Toplam Vergi", Değer: result.totalTax },
      { Alan: "Efektif Oran (%)", Değer: result.effectiveRate.toFixed(2) },
      ...result.breakdown.map((b) => ({
        Alan: b.bracket,
        Değer: b.tax,
        Matrah: b.taxableAmount,
        Oran: `%${(b.rate * 100).toFixed(0)}`,
      })),
    ]);
  }

  return (
    <div>
      <div style={card}>
        <h3 style={{ color: "#fafafa", fontWeight: 700, marginBottom: "0.5rem" }}>Yıllık Gelir Vergisi</h3>
        <p style={{ color: "#52525b", fontSize: "0.75rem", marginBottom: "1.25rem" }}>2025 gelir vergisi dilimleri (yıllık baz)</p>
        <label style={labelStyle}>Yıllık Gelir (₺)</label>
        <input type="number" min="1" max="100000000" style={{ ...inputStyle, maxWidth: "320px" }} value={income} onChange={(e) => setIncome(e.target.value)} />
      </div>

      {result && (
        <div style={card}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ background: "#27272a", borderRadius: "0.5rem", padding: "1rem" }}>
              <div style={{ color: "#71717a", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Yıllık Gelir</div>
              <div style={{ color: "#fafafa", fontFamily: "monospace", fontWeight: 700 }}>{fmtTL(result.annualIncome)}</div>
            </div>
            <div style={{ background: "#27272a", borderRadius: "0.5rem", padding: "1rem" }}>
              <div style={{ color: "#71717a", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Toplam Vergi</div>
              <div style={{ color: "#f87171", fontFamily: "monospace", fontWeight: 700 }}>{fmtTL(result.totalTax)}</div>
            </div>
            <div style={{ background: "#27272a", borderRadius: "0.5rem", padding: "1rem" }}>
              <div style={{ color: "#71717a", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Efektif Oran</div>
              <div style={{ color: "#a78bfa", fontFamily: "monospace", fontWeight: 700 }}>{fmtPct(result.effectiveRate)}</div>
            </div>
          </div>

          <h4 style={{ color: "#a1a1aa", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Dilim Detayı</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "0", fontSize: "0.8rem" }}>
            <div style={{ color: "#52525b", padding: "0.375rem 0", borderBottom: "1px solid #27272a" }}>Dilim</div>
            <div style={{ color: "#52525b", padding: "0.375rem 0.5rem", borderBottom: "1px solid #27272a", textAlign: "right" }}>Matrah</div>
            <div style={{ color: "#52525b", padding: "0.375rem 0.5rem", borderBottom: "1px solid #27272a", textAlign: "right" }}>Oran</div>
            <div style={{ color: "#52525b", padding: "0.375rem 0", borderBottom: "1px solid #27272a", textAlign: "right" }}>Vergi</div>
            {result.breakdown.map((b, i) => (
              <>
                <div key={`d${i}`} style={{ color: "#a1a1aa", padding: "0.375rem 0", borderBottom: "1px solid #1c1c1f" }}>{b.bracket}</div>
                <div key={`m${i}`} style={{ color: "#fafafa", padding: "0.375rem 0.5rem", borderBottom: "1px solid #1c1c1f", textAlign: "right", fontFamily: "monospace" }}>{fmtTL(b.taxableAmount)}</div>
                <div key={`r${i}`} style={{ color: "#a78bfa", padding: "0.375rem 0.5rem", borderBottom: "1px solid #1c1c1f", textAlign: "right" }}>%{(b.rate * 100).toFixed(0)}</div>
                <div key={`t${i}`} style={{ color: "#f87171", padding: "0.375rem 0", borderBottom: "1px solid #1c1c1f", textAlign: "right", fontFamily: "monospace" }}>{fmtTL(b.tax)}</div>
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 3: Stopaj ────────────────────────────────────────────────────────────

function StopajTab({ onResults }: { onResults: (d: ExportRow[]) => void }) {
  const [stopajType, setStopajType] = useState<StopajType>("freelance");
  const [gross, setGross] = useState("10000");
  const [manualRate, setManualRate] = useState("");
  const [useManual, setUseManual] = useState(false);

  const val = parseFloat(gross);
  const valid = val > 0 && val <= 1_000_000_000;

  let result = null;
  if (valid) {
    if (useManual && manualRate !== "") {
      const rate = parseFloat(manualRate) / 100;
      result = { grossAmount: val, stopajAmount: val * rate, netAmount: val * (1 - rate), rate };
    } else {
      result = stopajHesapla(val, stopajType);
    }
  }

  if (result) {
    onResults([
      { Alan: "Brüt Tutar", Değer: result.grossAmount },
      { Alan: `Stopaj (%${(result.rate * 100).toFixed(0)})`, Değer: result.stopajAmount },
      { Alan: "Net Tutar", Değer: result.netAmount },
    ]);
  }

  return (
    <div style={card}>
      <h3 style={{ color: "#fafafa", fontWeight: 700, marginBottom: "1.25rem" }}>Stopaj (Tevkifat) Hesabı</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label style={labelStyle}>Brüt Tutar (₺)</label>
          <input type="number" min="0" max="1000000000" style={inputStyle} value={gross} onChange={(e) => setGross(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Gelir Türü</label>
          <select value={stopajType} onChange={(e) => setStopajType(e.target.value as StopajType)} style={selectStyle} disabled={useManual}>
            {(Object.entries(STOPAJ_RATES) as [StopajType, { label: string; rate: number }][]).map(([key, val]) => (
              <option key={key} value={key}>{val.label} (%{(val.rate * 100).toFixed(0)})</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <input type="checkbox" id="manualStopaj" checked={useManual} onChange={(e) => setUseManual(e.target.checked)} style={{ cursor: "pointer", accentColor: "#7c3aed" }} />
        <label htmlFor="manualStopaj" style={{ color: "#a1a1aa", fontSize: "0.85rem", cursor: "pointer" }}>Manuel oran</label>
        {useManual && (
          <input type="number" min="0" max="100" style={{ ...inputStyle, maxWidth: "120px" }} value={manualRate} onChange={(e) => setManualRate(e.target.value)} placeholder="%" />
        )}
      </div>

      {result && (
        <>
          <Row name="Brüt Tutar" amount={fmtTL(result.grossAmount)} />
          <Row name={`Stopaj (%${(result.rate * 100).toFixed(0)})`} amount={`− ${fmtTL(result.stopajAmount)}`} />
          <Row name="Net Tutar" amount={fmtTL(result.netAmount)} highlight />
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TaxesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [exportData, setExportData] = useState<ExportRow[]>([]);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.75rem", color: "#fafafa", marginBottom: "0.5rem" }}>Vergi Hesaplayıcı</h1>
          <p style={{ color: "#71717a", fontSize: "0.9rem" }}>KDV, gelir vergisi dilimleri, stopaj — Türkiye 2025</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
          <ExportButton getData={() => exportData} filename="calmatic-taxes" sheetName="Taxes" />
          <PrintButton />
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "2rem", borderBottom: "1px solid #27272a" }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(i); setExportData([]); }}
            style={{
              padding: "0.625rem 1.125rem",
              border: "none",
              borderBottom: activeTab === i ? "2px solid #f87171" : "2px solid transparent",
              background: "transparent",
              color: activeTab === i ? "#f87171" : "#71717a",
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

      {activeTab === 0 && <InvoiceTab onResults={setExportData} />}
      {activeTab === 1 && <AnnualIncomeTaxTab onResults={setExportData} />}
      {activeTab === 2 && <StopajTab onResults={setExportData} />}

      <p style={{ textAlign: "center", color: "#52525b", fontSize: "0.75rem", marginTop: "2rem" }}>
        Results are for informational purposes only. Consult a professional for official calculations. (2025 parametreleri)
      </p>
    </div>
  );
}
