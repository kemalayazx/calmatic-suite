"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

function fmtCurrency(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  fontSize: "0.75rem",
  color: "#a1a1aa",
  display: "block",
  marginBottom: "0.375rem",
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const TABS = ["Price → Discount", "Find Discount %", "Bulk Calculator"];

// --- Tab 1: Original price + discount % → discounted price ---
function PriceDiscountTab() {
  const [original, setOriginal] = useState("");
  const [discountPct, setDiscountPct] = useState("");

  const price = parseFloat(original);
  const pct = parseFloat(discountPct);
  const valid = !isNaN(price) && !isNaN(pct) && price > 0 && pct >= 0 && pct <= 100;

  const savings = valid ? price * (pct / 100) : null;
  const discounted = valid && savings !== null ? price - savings : null;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <label style={labelStyle}>Original Price</label>
          <input type="number" style={inputStyle} placeholder="100" value={original} onChange={(e) => setOriginal(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Discount (%)</label>
          <input type="number" style={inputStyle} placeholder="20" min="0" max="100" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} />
        </div>
      </div>

      {valid && discounted !== null && savings !== null && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{
            background: "#09090b",
            border: "1px solid #4ade8033",
            borderRadius: "0.75rem",
            padding: "1.5rem",
            textAlign: "center",
          }}>
            <p style={{ fontSize: "0.7rem", color: "#71717a", marginBottom: "0.5rem", textTransform: "uppercase" }}>Discounted Price</p>
            <p style={{ fontSize: "2.25rem", fontWeight: 900, color: "#4ade80" }}>${fmtCurrency(discounted)}</p>
            <p style={{ fontSize: "0.8rem", color: "#52525b", marginTop: "0.4rem" }}>
              was ${fmtCurrency(price)}
            </p>
          </div>
          <div style={{
            background: "#09090b",
            border: "1px solid #fb923c33",
            borderRadius: "0.75rem",
            padding: "1.5rem",
            textAlign: "center",
          }}>
            <p style={{ fontSize: "0.7rem", color: "#71717a", marginBottom: "0.5rem", textTransform: "uppercase" }}>You Save</p>
            <p style={{ fontSize: "2.25rem", fontWeight: 900, color: "#fb923c" }}>${fmtCurrency(savings)}</p>
            <p style={{ fontSize: "0.8rem", color: "#52525b", marginTop: "0.4rem" }}>
              {pct}% off
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Tab 2: Original + discounted → find % ---
function FindPctTab() {
  const [original, setOriginal] = useState("");
  const [discounted, setDiscounted] = useState("");

  const orig = parseFloat(original);
  const disc = parseFloat(discounted);
  const valid = !isNaN(orig) && !isNaN(disc) && orig > 0 && disc >= 0 && disc < orig;

  const savings = valid ? orig - disc : null;
  const pct = valid && savings !== null ? (savings / orig) * 100 : null;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <label style={labelStyle}>Original Price</label>
          <input type="number" style={inputStyle} placeholder="100" value={original} onChange={(e) => setOriginal(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Sale Price</label>
          <input type="number" style={inputStyle} placeholder="75" value={discounted} onChange={(e) => setDiscounted(e.target.value)} />
        </div>
      </div>

      {valid && pct !== null && savings !== null && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{
            background: "#09090b",
            border: "1px solid #a78bfa33",
            borderRadius: "0.75rem",
            padding: "1.5rem",
            textAlign: "center",
          }}>
            <p style={{ fontSize: "0.7rem", color: "#71717a", marginBottom: "0.5rem", textTransform: "uppercase" }}>Discount Rate</p>
            <p style={{ fontSize: "2.5rem", fontWeight: 900, color: "#a78bfa" }}>{pct.toFixed(2)}%</p>
          </div>
          <div style={{
            background: "#09090b",
            border: "1px solid #fb923c33",
            borderRadius: "0.75rem",
            padding: "1.5rem",
            textAlign: "center",
          }}>
            <p style={{ fontSize: "0.7rem", color: "#71717a", marginBottom: "0.5rem", textTransform: "uppercase" }}>Total Savings</p>
            <p style={{ fontSize: "2.5rem", fontWeight: 900, color: "#fb923c" }}>${fmtCurrency(savings)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Tab 3: Bulk ---
interface BulkItem { id: number; name: string; price: string; pct: string; }
let nextBulkId = 10;

function BulkTab() {
  const [items, setItems] = useState<BulkItem[]>([
    { id: 1, name: "", price: "", pct: "" },
    { id: 2, name: "", price: "", pct: "" },
  ]);

  function addItem() {
    setItems((prev) => [...prev, { id: nextBulkId++, name: "", price: "", pct: "" }]);
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function update(id: number, field: keyof BulkItem, value: string) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: value } : i));
  }

  const processed = items.map((item) => {
    const price = parseFloat(item.price);
    const pct = parseFloat(item.pct);
    const valid = !isNaN(price) && !isNaN(pct) && price > 0 && pct >= 0 && pct <= 100;
    const savings = valid ? price * pct / 100 : null;
    const discounted = valid && savings !== null ? price - savings : null;
    return { ...item, price, pct, valid, savings, discounted };
  });

  const totalOriginal = processed.filter((i) => i.valid).reduce((s, i) => s + i.price, 0);
  const totalDiscounted = processed.filter((i) => i.valid && i.discounted !== null).reduce((s, i) => s + (i.discounted ?? 0), 0);
  const totalSavings = totalOriginal - totalDiscounted;

  return (
    <div>
      <div style={{ marginBottom: "0.75rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 32px", gap: "0.5rem", marginBottom: "0.4rem" }}>
          {["Item", "Price", "Discount %", ""].map((h) => (
            <p key={h} style={{ fontSize: "0.7rem", color: "#71717a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</p>
          ))}
        </div>
        {items.map((item) => (
          <div key={item.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 32px", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
            <input type="text" style={{ ...inputStyle, fontSize: "0.875rem", padding: "0.5rem 0.75rem" }} placeholder="Product name" value={item.name} onChange={(e) => update(item.id, "name", e.target.value)} />
            <input type="number" style={{ ...inputStyle, fontSize: "0.875rem", padding: "0.5rem 0.75rem" }} placeholder="0.00" value={item.price} onChange={(e) => update(item.id, "price", e.target.value)} />
            <input type="number" style={{ ...inputStyle, fontSize: "0.875rem", padding: "0.5rem 0.75rem" }} placeholder="0" min="0" max="100" value={item.pct} onChange={(e) => update(item.id, "pct", e.target.value)} />
            {items.length > 1 ? (
              <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#52525b", padding: "0.25rem" }}>
                <Trash2 size={15} />
              </button>
            ) : <div />}
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "transparent",
          border: "1px dashed #f97316aa",
          borderRadius: "0.5rem",
          padding: "0.4rem 0.875rem",
          color: "#fb923c",
          fontSize: "0.8rem",
          cursor: "pointer",
          marginBottom: "1.5rem",
        }}
      >
        <Plus size={13} /> Add Item
      </button>

      {/* Results table */}
      {processed.some((i) => i.valid) && (
        <>
          <div style={{ overflowX: "auto", marginBottom: "1rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #27272a" }}>
                  {["Item", "Original", "Discount", "Sale Price", "Savings"].map((h) => (
                    <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "right", color: "#71717a", fontWeight: 600, fontSize: "0.75rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processed.filter((i) => i.valid).map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #1c1c1f" }}>
                    <td style={{ padding: "0.4rem 0.75rem", textAlign: "right", color: "#a1a1aa" }}>{item.name || "—"}</td>
                    <td style={{ padding: "0.4rem 0.75rem", textAlign: "right", color: "#fafafa" }}>${fmtCurrency(item.price)}</td>
                    <td style={{ padding: "0.4rem 0.75rem", textAlign: "right", color: "#a78bfa" }}>{item.pct}%</td>
                    <td style={{ padding: "0.4rem 0.75rem", textAlign: "right", color: "#4ade80" }}>${fmtCurrency(item.discounted ?? 0)}</td>
                    <td style={{ padding: "0.4rem 0.75rem", textAlign: "right", color: "#fb923c" }}>${fmtCurrency(item.savings ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            {[
              { label: "Total Original", value: totalOriginal, color: "#a1a1aa" },
              { label: "Total Sale Price", value: totalDiscounted, color: "#4ade80" },
              { label: "Total Savings", value: totalSavings, color: "#fb923c" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: "#09090b",
                border: `1px solid ${color}33`,
                borderRadius: "0.75rem",
                padding: "1rem",
                textAlign: "center",
              }}>
                <p style={{ fontSize: "0.7rem", color: "#71717a", marginBottom: "0.4rem", textTransform: "uppercase" }}>{label}</p>
                <p style={{ fontSize: "1.4rem", fontWeight: 800, color }}>${fmtCurrency(value)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function DiscountPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
        <Link href="/" style={{ color: "#71717a", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={18} />
        </Link>
        <h1 style={{ fontWeight: 700, fontSize: "1.35rem", color: "#fafafa" }}>Discount Calculator</h1>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.625rem",
              border: "1px solid",
              borderColor: activeTab === i ? "#f97316" : "#27272a",
              background: activeTab === i ? "#f9731622" : "transparent",
              color: activeTab === i ? "#fb923c" : "#71717a",
              fontSize: "0.82rem",
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
        {activeTab === 0 && <PriceDiscountTab />}
        {activeTab === 1 && <FindPctTab />}
        {activeTab === 2 && <BulkTab />}
      </div>

      <p style={{ textAlign: "center", color: "#3f3f46", fontSize: "0.75rem", marginTop: "1.25rem" }}>
        Results are for informational purposes only.
      </p>
    </div>
  );
}
