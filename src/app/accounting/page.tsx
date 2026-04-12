"use client";

import { useState } from "react";
import { ArrowLeft, Copy, Check, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  vatFromNet,
  vatFromGross,
  straightLineDepreciation,
  decliningBalanceDepreciation,
} from "@/lib/calculations/accounting";
import ExportButton from "@/components/ui/ExportButton";
import PrintButton from "@/components/ui/PrintButton";
import type { ExportRow } from "@/lib/export";

function fmtCurrency(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
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

const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "#a1a1aa",
  marginBottom: "0.375rem",
  display: "block",
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const TABS = ["KDV Hesaplayıcı", "Amortisman", "Kar - Zarar"];
const VAT_RATES = [1, 8, 10, 18, 20];

// --- Copy button ---
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  if (!text) return null;
  return (
    <button
      onClick={handleCopy}
      style={{
        background: "none",
        border: "1px solid #3f3f46",
        borderRadius: "0.375rem",
        padding: "0.2rem 0.5rem",
        cursor: "pointer",
        color: copied ? "#4ade80" : "#71717a",
        fontSize: "0.7rem",
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Kopyalandı" : "Kopyala"}
    </button>
  );
}

// --- VAT Tab ---
function VatTab({ onResults }: { onResults: (d: ExportRow[]) => void }) {
  const [mode, setMode] = useState<"from-net" | "from-gross">("from-net");
  const [amount, setAmount] = useState("");
  const [vatRate, setVatRate] = useState(18);

  const n = parseFloat(amount);
  const valid = !isNaN(n) && n > 0;
  const result = valid
    ? mode === "from-net"
      ? vatFromNet(n, vatRate)
      : vatFromGross(n, vatRate)
    : null;

  if (result) {
    onResults([
      { Alan: "Net Tutar", Değer: result.net },
      { Alan: `KDV (%${vatRate})`, Değer: result.vat },
      { Alan: "Brüt Tutar", Değer: result.gross },
    ]);
  }

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {(["from-net", "from-gross"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              padding: "0.625rem",
              borderRadius: "0.625rem",
              border: "1px solid",
              borderColor: mode === m ? "#7c3aed" : "#27272a",
              background: mode === m ? "#7c3aed22" : "transparent",
              color: mode === m ? "#a78bfa" : "#71717a",
              fontSize: "0.85rem",
              fontWeight: mode === m ? 700 : 400,
              cursor: "pointer",
            }}
          >
            {m === "from-net" ? "KDV Hariç → KDV Dahil" : "KDV Dahil → KDV Hariç"}
          </button>
        ))}
      </div>

      {/* VAT Rate pills */}
      <div style={{ marginBottom: "1.25rem" }}>
        <label style={labelStyle}>KDV Oranı</label>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {VAT_RATES.map((r) => (
            <button
              key={r}
              onClick={() => setVatRate(r)}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "2rem",
                border: "1px solid",
                borderColor: vatRate === r ? "#7c3aed" : "#27272a",
                background: vatRate === r ? "#7c3aed33" : "transparent",
                color: vatRate === r ? "#a78bfa" : "#71717a",
                fontSize: "0.85rem",
                fontWeight: vatRate === r ? 700 : 400,
                cursor: "pointer",
              }}
            >
              %{r}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <label style={labelStyle}>
          {mode === "from-net" ? "KDV Hariç Tutar (₺)" : "KDV Dahil Tutar (₺)"}
        </label>
        <input
          type="number"
          style={inputStyle}
          placeholder="1000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {result && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          {[
            { label: "Net Tutar", value: result.net, color: "#a1a1aa" },
            { label: "KDV Tutarı", value: result.vat, color: "#fb923c" },
            { label: "Brüt Tutar", value: result.gross, color: "#4ade80" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: "#09090b",
              border: `1px solid ${color}33`,
              borderRadius: "0.75rem",
              padding: "1.25rem",
              textAlign: "center",
            }}>
              <p style={{ fontSize: "0.7rem", color: "#71717a", marginBottom: "0.5rem", textTransform: "uppercase" }}>{label}</p>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color, marginBottom: "0.5rem" }}>
                ₺{fmtCurrency(value)}
              </p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <CopyBtn text={fmtCurrency(value)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Depreciation Tab ---
function DepreciationTab({ onResults }: { onResults: (d: ExportRow[]) => void }) {
  const [assetValue, setAssetValue] = useState("");
  const [salvageValue, setSalvageValue] = useState("");
  const [lifeYears, setLifeYears] = useState("");
  const [method, setMethod] = useState<"straight" | "declining">("straight");

  const a = parseFloat(assetValue);
  const s = parseFloat(salvageValue) || 0;
  const l = parseInt(lifeYears, 10);

  const valid = !isNaN(a) && !isNaN(l) && a > 0 && l > 0 && a >= s;
  const rows = valid
    ? method === "straight"
      ? straightLineDepreciation(a, s, l)
      : decliningBalanceDepreciation(a, s, l)
    : [];

  if (rows.length > 0) {
    onResults(rows.map((row) => ({
      Yıl: row.year,
      "Amortisman Tutarı": row.depreciation,
      "Birikmiş Amortisman": row.accumulatedDepreciation,
      "Net Defter Değeri": row.bookValue,
    })));
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <label style={labelStyle}>Varlık Değeri (₺)</label>
          <input type="number" style={inputStyle} placeholder="100000" value={assetValue} onChange={(e) => setAssetValue(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Hurda Değer (₺)</label>
          <input type="number" style={inputStyle} placeholder="10000" value={salvageValue} onChange={(e) => setSalvageValue(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Ekonomik Ömür (yıl)</label>
          <input type="number" style={inputStyle} placeholder="5" value={lifeYears} onChange={(e) => setLifeYears(e.target.value)} />
        </div>
      </div>

      {/* Method toggle */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {([["straight", "Doğrusal Yöntem"], ["declining", "Azalan Bakiye"]] as const).map(([m, label]) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "0.625rem",
              border: "1px solid",
              borderColor: method === m ? "#7c3aed" : "#27272a",
              background: method === m ? "#7c3aed22" : "transparent",
              color: method === m ? "#a78bfa" : "#71717a",
              fontSize: "0.85rem",
              fontWeight: method === m ? 700 : 400,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {rows.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #27272a" }}>
                {["Yıl", "Amortisman Tutarı", "Birikmiş Amortisman", "Net Defter Değeri"].map((h) => (
                  <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "right", color: "#71717a", fontWeight: 600, fontSize: "0.75rem" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.year} style={{ borderBottom: "1px solid #1c1c1f" }}>
                  <td style={{ padding: "0.4rem 0.75rem", textAlign: "right", color: "#71717a" }}>{row.year}</td>
                  <td style={{ padding: "0.4rem 0.75rem", textAlign: "right", color: "#f87171" }}>₺{fmtCurrency(row.depreciation)}</td>
                  <td style={{ padding: "0.4rem 0.75rem", textAlign: "right", color: "#fb923c" }}>₺{fmtCurrency(row.accumulatedDepreciation)}</td>
                  <td style={{ padding: "0.4rem 0.75rem", textAlign: "right", color: "#4ade80" }}>₺{fmtCurrency(row.bookValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Profit/Loss Tab ---
interface LineItem { id: number; label: string; amount: string; }

function ProfitLossTab() {
  const [revenues, setRevenues] = useState<LineItem[]>([{ id: 1, label: "", amount: "" }]);
  const [expenses, setExpenses] = useState<LineItem[]>([{ id: 1, label: "", amount: "" }]);
  let nextId = 100;

  const totalRevenue = revenues.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const totalExpense = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const net = totalRevenue - totalExpense;

  function addRow(setter: React.Dispatch<React.SetStateAction<LineItem[]>>) {
    setter((prev) => [...prev, { id: nextId++, label: "", amount: "" }]);
  }

  function removeRow(setter: React.Dispatch<React.SetStateAction<LineItem[]>>, id: number) {
    setter((prev) => prev.filter((r) => r.id !== id));
  }

  function updateRow(
    setter: React.Dispatch<React.SetStateAction<LineItem[]>>,
    id: number,
    field: "label" | "amount",
    value: string
  ) {
    setter((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function renderList(
    items: LineItem[],
    setter: React.Dispatch<React.SetStateAction<LineItem[]>>,
    accentColor: string,
    title: string
  ) {
    return (
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: "0.9rem", color: accentColor, marginBottom: "0.75rem" }}>{title}</p>
        {items.map((item) => (
          <div key={item.id} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <input
              type="text"
              style={{ ...inputStyle, flex: 2, padding: "0.5rem 0.75rem", fontSize: "0.875rem" }}
              placeholder="Açıklama"
              value={item.label}
              onChange={(e) => updateRow(setter, item.id, "label", e.target.value)}
            />
            <input
              type="number"
              style={{ ...inputStyle, flex: 1, padding: "0.5rem 0.75rem", fontSize: "0.875rem" }}
              placeholder="0"
              value={item.amount}
              onChange={(e) => updateRow(setter, item.id, "amount", e.target.value)}
            />
            {items.length > 1 && (
              <button
                onClick={() => removeRow(setter, item.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#52525b", padding: "0.25rem" }}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => addRow(setter)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "transparent",
            border: `1px dashed ${accentColor}44`,
            borderRadius: "0.5rem",
            padding: "0.4rem 0.875rem",
            color: accentColor,
            fontSize: "0.8rem",
            cursor: "pointer",
            width: "100%",
            justifyContent: "center",
            marginTop: "0.25rem",
          }}
        >
          <Plus size={13} /> Satır Ekle
        </button>
        <div style={{
          marginTop: "0.75rem",
          padding: "0.625rem 0.75rem",
          background: `${accentColor}11`,
          border: `1px solid ${accentColor}33`,
          borderRadius: "0.5rem",
          display: "flex",
          justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "0.8rem", color: "#a1a1aa" }}>Toplam {title}</span>
          <span style={{ fontWeight: 700, color: accentColor, fontSize: "0.9rem" }}>
            ₺{fmtCurrency(title === "Gelirler" ? totalRevenue : totalExpense)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {renderList(revenues, setRevenues, "#4ade80", "Gelirler")}
        {renderList(expenses, setExpenses, "#f87171", "Giderler")}
      </div>

      {/* Summary */}
      <div style={{
        background: "#09090b",
        border: `1px solid ${net >= 0 ? "#4ade80" : "#f87171"}44`,
        borderRadius: "1rem",
        padding: "1.5rem",
        textAlign: "center",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <div>
            <p style={{ fontSize: "0.7rem", color: "#71717a", marginBottom: "0.4rem", textTransform: "uppercase" }}>Toplam Gelir</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#4ade80" }}>₺{fmtCurrency(totalRevenue)}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.7rem", color: "#71717a", marginBottom: "0.4rem", textTransform: "uppercase" }}>Toplam Gider</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f87171" }}>₺{fmtCurrency(totalExpense)}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.7rem", color: "#71717a", marginBottom: "0.4rem", textTransform: "uppercase" }}>
              {net >= 0 ? "Net Kar" : "Net Zarar"}
            </p>
            <p style={{ fontSize: "1.5rem", fontWeight: 800, color: net >= 0 ? "#4ade80" : "#f87171" }}>
              {net >= 0 ? "+" : ""}₺{fmtCurrency(Math.abs(net))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [exportData, setExportData] = useState<ExportRow[]>([]);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/" style={{ color: "#71717a", display: "flex", alignItems: "center" }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 style={{ fontWeight: 700, fontSize: "1.35rem", color: "#fafafa" }}>Muhasebe Araçları</h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <ExportButton getData={() => exportData} filename="calmatic-accounting" sheetName="Accounting" />
          <PrintButton />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(i); setExportData([]); }}
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
        {activeTab === 0 && <VatTab onResults={setExportData} />}
        {activeTab === 1 && <DepreciationTab onResults={setExportData} />}
        {activeTab === 2 && <ProfitLossTab />}
      </div>

      <p style={{ textAlign: "center", color: "#3f3f46", fontSize: "0.75rem", marginTop: "1.25rem" }}>
        Sonuçlar yalnızca bilgilendirme amaçlıdır.
      </p>
    </div>
  );
}
