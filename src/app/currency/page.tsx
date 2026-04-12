"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowLeftRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const CURRENCIES = [
  { code: "USD", nameKey: "currency.name.usd",         symbol: "$",  flag: "🇺🇸" },
  { code: "EUR", nameKey: "currency.name.eur",          symbol: "€",  flag: "🇪🇺" },
  { code: "TRY", nameKey: "currency.name.try",          symbol: "₺",  flag: "🇹🇷" },
  { code: "GBP", nameKey: "currency.name.gbp",          symbol: "£",  flag: "🇬🇧" },
  { code: "JPY", nameKey: "currency.name.jpy",          symbol: "¥",  flag: "🇯🇵" },
  { code: "CHF", nameKey: "currency.name.chf",          symbol: "Fr", flag: "🇨🇭" },
  { code: "CAD", nameKey: "currency.name.cad",          symbol: "C$", flag: "🇨🇦" },
  { code: "AUD", nameKey: "currency.name.aud",          symbol: "A$", flag: "🇦🇺" },
  { code: "SAR", nameKey: "currency.name.sar",          symbol: "﷼",  flag: "🇸🇦" },
  { code: "AED", nameKey: "currency.name.aed",          symbol: "د.إ",flag: "🇦🇪" },
  { code: "CNY", nameKey: "currency.name.cny",          symbol: "¥",  flag: "🇨🇳" },
  { code: "INR", nameKey: "currency.name.inr",          symbol: "₹",  flag: "🇮🇳" },
];

const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, TRY: 32.8, GBP: 0.79, JPY: 149.5,
  CHF: 0.88, CAD: 1.36, AUD: 1.53, SAR: 3.75, AED: 3.67,
  CNY: 7.24, INR: 83.1,
};

function selectStyle(): React.CSSProperties {
  return {
    background: "#27272a",
    border: "1px solid #3f3f46",
    borderRadius: "0.75rem",
    color: "#fafafa",
    padding: "0.75rem 1rem",
    fontSize: "0.95rem",
    width: "100%",
    cursor: "pointer",
    outline: "none",
  };
}

function fmt(n: number) {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

function getSymbol(code: string) {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

export default function CurrencyPage() {
  const { t } = useLanguage();
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("TRY");
  const [amount, setAmount] = useState("1");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [usedCache, setUsedCache] = useState(false);
  const [swapping, setSwapping] = useState(false);

  const fetchRates = useCallback(async (base: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const r = { ...data.rates, [base]: 1 };
      setRates(r);
      setUpdatedAt(data.date ?? new Date().toISOString().slice(0, 10));
      setUsedCache(false);
    } catch {
      // fallback to pre-set rates relative to USD
      const baseToUsd = 1 / FALLBACK_RATES[base];
      const fallback: Record<string, number> = {};
      for (const [code, rate] of Object.entries(FALLBACK_RATES)) {
        fallback[code] = rate * baseToUsd;
      }
      setRates(fallback);
      setUpdatedAt("cached");
      setUsedCache(true);
      setError(t("currency.error.apiUnreachable"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchRates(from); }, [from, fetchRates]);

  function handleSwap() {
    setSwapping(true);
    setTimeout(() => setSwapping(false), 300);
    const newFrom = to;
    const newTo = from;
    setFrom(newFrom);
    setTo(newTo);
  }

  const numAmount = parseFloat(amount) || 0;
  const converted = rates && rates[to] ? numAmount * rates[to] : null;

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
        <Link href="/" style={{ color: "#71717a", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={18} />
        </Link>
        <h1 style={{ fontWeight: 700, fontSize: "1.35rem", color: "#fafafa" }}>{t("currency.title")}</h1>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {usedCache && (
            <span style={{ fontSize: "0.75rem", color: "#fb923c", background: "#fb923c11", border: "1px solid #fb923c33", borderRadius: "0.375rem", padding: "0.2rem 0.5rem" }}>
              {t("currency.badge.cachedRates")}
            </span>
          )}
          {updatedAt && !usedCache && (
            <span style={{ fontSize: "0.75rem", color: "#52525b" }}>
              {t("currency.label.lastUpdated")}: {updatedAt}
            </span>
          )}
          <button
            onClick={() => fetchRates(from)}
            disabled={loading}
            style={{
              background: "none",
              border: "1px solid #27272a",
              borderRadius: "0.5rem",
              padding: "0.375rem 0.625rem",
              color: "#71717a",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          </button>
        </div>
      </div>

      {/* Main converter */}
      <div style={{ background: "#18181b", borderRadius: "1rem", border: "1px solid #27272a", padding: "1.75rem", marginBottom: "1.25rem" }}>
        {/* Amount */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "block", marginBottom: "0.375rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t("currency.label.amount")}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: "100%",
              background: "#27272a",
              border: "1px solid #3f3f46",
              borderRadius: "0.75rem",
              color: "#fafafa",
              padding: "0.875rem 1rem",
              fontSize: "1.5rem",
              fontWeight: 700,
              outline: "none",
              boxSizing: "border-box",
            }}
            placeholder="1"
          />
        </div>

        {/* From ⇄ To */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "block", marginBottom: "0.375rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("currency.label.from")}</label>
            <select style={selectStyle()} value={from} onChange={(e) => setFrom(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} — {t(c.nameKey)}
                </option>
              ))}
            </select>
          </div>

          {/* Swap button */}
          <button
            onClick={handleSwap}
            style={{
              flexShrink: 0,
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: swapping ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
              marginBottom: "0px",
            }}
          >
            <ArrowLeftRight size={18} color="white" />
          </button>

          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "block", marginBottom: "0.375rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("currency.label.to")}</label>
            <select style={selectStyle()} value={to} onChange={(e) => setTo(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} — {t(c.nameKey)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result */}
        {loading ? (
          <div style={{ marginTop: "1.5rem", background: "#27272a", borderRadius: "0.75rem", height: "80px", animation: "pulse 1.5s ease-in-out infinite" }} />
        ) : converted !== null ? (
          <div style={{
            marginTop: "1.5rem",
            background: "#09090b",
            border: "1px solid #7c3aed33",
            borderRadius: "1rem",
            padding: "1.5rem",
            textAlign: "center",
          }}>
            <p style={{ color: "#71717a", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
              {fmt(numAmount)} {from} =
            </p>
            <p style={{ fontSize: "3rem", fontWeight: 900, color: "#a78bfa", lineHeight: 1.1 }}>
              {getSymbol(to)}{fmt(converted)}
            </p>
            <p style={{ color: "#52525b", fontSize: "0.8rem", marginTop: "0.5rem" }}>
              {to} · 1 {from} = {getSymbol(to)}{fmt(rates?.[to] ?? 0)}
            </p>
          </div>
        ) : null}
      </div>

      {/* All pairs table */}
      {rates && (
        <div style={{ background: "#18181b", borderRadius: "1rem", border: "1px solid #27272a", padding: "1.5rem" }}>
          <p style={{ fontSize: "0.85rem", color: "#a1a1aa", fontWeight: 600, marginBottom: "1rem" }}>
            {`1 ${from} ${t("currency.allRates.inAllCurrencies")}`}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {CURRENCIES.filter((c) => c.code !== from).map((c) => (
              <div
                key={c.code}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem 0.75rem",
                  background: c.code === to ? "#7c3aed22" : "#09090b",
                  border: `1px solid ${c.code === to ? "#7c3aed44" : "#1c1c1f"}`,
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                }}
                onClick={() => setTo(c.code)}
              >
                <span style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>
                  {c.flag} {c.code}
                </span>
                <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: c.code === to ? "#a78bfa" : "#fafafa", fontWeight: c.code === to ? 700 : 400 }}>
                  {c.symbol}{fmt(rates[c.code] ?? 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ textAlign: "center", color: "#3f3f46", fontSize: "0.75rem", marginTop: "1.25rem" }}>
        {t("currency.desc.disclaimer")}
      </p>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
