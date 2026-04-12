"use client";

import { useState } from "react";
import { calcAutoLoanMonthly, calcAffordability, calcLeaseBuy } from "@/lib/calculations/auto-loan";
import { useLanguage } from "@/context/LanguageContext";

const INPUT_STYLE: React.CSSProperties = {
  background: "#0a0a0b",
  border: "1px solid #27272a",
  borderRadius: "0.5rem",
  color: "#f4f4f5",
  padding: "0.5rem 0.75rem",
  fontSize: "0.9rem",
  width: "100%",
  boxSizing: "border-box",
};
const TAB_STYLE = (active: boolean): React.CSSProperties => ({
  padding: "0.5rem 1.1rem",
  borderRadius: "0.5rem",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.85rem",
  background: active ? "#475569" : "#1c1c1e",
  color: active ? "#fff" : "#71717a",
  transition: "all 0.15s",
});

function usd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function Field({ label, value, onChange, prefix, suffix }: { label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{ fontSize: "0.8rem", color: "#a1a1aa" }}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#52525b", fontSize: "0.9rem" }}>{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...INPUT_STYLE, paddingLeft: prefix ? "1.6rem" : undefined, paddingRight: suffix ? "1.8rem" : undefined }}
          min="0"
        />
        {suffix && <span style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#52525b", fontSize: "0.9rem" }}>{suffix}</span>}
      </div>
    </div>
  );
}

function ResultCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ background: highlight ? "#0f172a" : "#0a0a0b", border: `1px solid ${highlight ? "#334155" : "#27272a"}`, borderRadius: "0.75rem", padding: "0.75rem 1rem" }}>
      <div style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: highlight ? "#38bdf8" : "#f4f4f5", marginTop: "0.25rem" }}>{value}</div>
    </div>
  );
}

// --- Tab 1: Monthly Payment ---
function TabMonthly() {
  const { t } = useLanguage();
  const [price, setPrice] = useState("35000");
  const [down, setDown] = useState("5000");
  const [tradeIn, setTradeIn] = useState("0");
  const [tax, setTax] = useState("7");
  const [rate, setRate] = useState("6.5");
  const [term, setTerm] = useState("60");
  const [result, setResult] = useState<ReturnType<typeof calcAutoLoanMonthly> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      const r = calcAutoLoanMonthly(
        parseFloat(price), parseFloat(down) || 0, parseFloat(tradeIn) || 0,
        parseFloat(tax) || 0, parseFloat(rate), parseInt(term)
      );
      if (r.loanAmount <= 0) throw new Error(t("autoLoan.error.downExceedsPrice"));
      setResult(r);
      setError("");
    } catch (e) { setError((e as Error).message); setResult(null); }
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
        <Field label={t("autoLoan.label.vehiclePrice")} value={price} onChange={setPrice} prefix="$" />
        <Field label={t("autoLoan.label.downPayment")} value={down} onChange={setDown} prefix="$" />
        <Field label={t("autoLoan.label.tradeInValue")} value={tradeIn} onChange={setTradeIn} prefix="$" />
        <Field label={t("autoLoan.label.salesTaxRate")} value={tax} onChange={setTax} suffix="%" />
        <Field label={t("autoLoan.label.interestRateAPR")} value={rate} onChange={setRate} suffix="%" />
        <div>
          <label style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "block", marginBottom: "0.3rem" }}>{t("autoLoan.label.loanTerm")}</label>
          <select value={term} onChange={(e) => setTerm(e.target.value)} style={INPUT_STYLE}>
            {[36, 48, 60, 72, 84].map((tv) => <option key={tv} value={tv}>{tv} {t("autoLoan.option.months")} ({tv / 12} {t("autoLoan.option.yr")})</option>)}
          </select>
        </div>
      </div>
      <button onClick={calculate} style={{ background: "#475569", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>
        {t("autoLoan.btn.calculate")}
      </button>
      {error && <p style={{ color: "#f87171", marginTop: "0.5rem", fontSize: "0.85rem" }}>{error}</p>}
      {result && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginTop: "1rem" }}>
          <ResultCard label={t("autoLoan.result.monthlyPayment")} value={usd(result.monthlyPayment)} highlight />
          <ResultCard label={t("autoLoan.result.loanAmount")} value={usd(result.loanAmount)} />
          <ResultCard label={t("autoLoan.result.salesTax")} value={usd(result.taxAmount)} />
          <ResultCard label={t("autoLoan.result.totalInterest")} value={usd(result.totalInterest)} />
          <ResultCard label={t("autoLoan.result.totalCostWithTax")} value={usd(result.totalCost)} />
        </div>
      )}
    </div>
  );
}

// --- Tab 2: Affordability ---
function TabAffordability() {
  const { t } = useLanguage();
  const [budget, setBudget] = useState("450");
  const [rate, setRate] = useState("6.5");
  const [term, setTerm] = useState("60");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      const b = parseFloat(budget), r = parseFloat(rate), tv = parseInt(term);
      if (isNaN(b) || b <= 0) throw new Error(t("autoLoan.error.invalidBudget"));
      setResult(calcAffordability(b, r, tv));
      setError("");
    } catch (e) { setError((e as Error).message); setResult(null); }
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
        <Field label={t("autoLoan.label.monthlyBudget")} value={budget} onChange={setBudget} prefix="$" />
        <Field label={t("autoLoan.label.interestRateAPR")} value={rate} onChange={setRate} suffix="%" />
        <div>
          <label style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "block", marginBottom: "0.3rem" }}>{t("autoLoan.label.loanTerm")}</label>
          <select value={term} onChange={(e) => setTerm(e.target.value)} style={INPUT_STYLE}>
            {[36, 48, 60, 72, 84].map((tv) => <option key={tv} value={tv}>{tv} {t("autoLoan.option.months")}</option>)}
          </select>
        </div>
      </div>
      <button onClick={calculate} style={{ background: "#475569", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>
        {t("autoLoan.btn.calculate")}
      </button>
      {error && <p style={{ color: "#f87171", marginTop: "0.5rem", fontSize: "0.85rem" }}>{error}</p>}
      {result !== null && (
        <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "0.75rem", padding: "1.25rem", marginTop: "1rem", textAlign: "center" }}>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.5rem" }}>{t("autoLoan.afford.maxPriceDesc")}</p>
          <p style={{ fontSize: "2.5rem", fontWeight: 900, color: "#38bdf8" }}>{usd(result)}</p>
          <p style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.5rem" }}>{t("autoLoan.afford.with")} {budget}/mo {t("autoLoan.afford.paymentOver")} {term} {t("autoLoan.afford.monthsAt")} {rate}% APR</p>
        </div>
      )}
    </div>
  );
}

// --- Tab 3: Lease vs Buy ---
function TabLease() {
  const { t } = useLanguage();
  const [purchasePrice, setPurchasePrice] = useState("35000");
  const [purchaseDown, setPurchaseDown] = useState("5000");
  const [purchaseRate, setPurchaseRate] = useState("6.5");
  const [purchaseTerm, setPurchaseTerm] = useState("60");
  const [resaleValue, setResaleValue] = useState("18000");
  const [leaseMonthly, setLeaseMonthly] = useState("350");
  const [leaseTerm, setLeaseTerm] = useState("36");
  const [leaseDown, setLeaseDown] = useState("2000");
  const [leaseFees, setLeaseFees] = useState("500");
  const [result, setResult] = useState<ReturnType<typeof calcLeaseBuy> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      const r = calcLeaseBuy(
        parseFloat(purchasePrice), parseFloat(purchaseDown) || 0, parseFloat(purchaseRate), parseInt(purchaseTerm),
        parseFloat(resaleValue) || 0, parseFloat(leaseMonthly), parseInt(leaseTerm),
        parseFloat(leaseDown) || 0, parseFloat(leaseFees) || 0
      );
      setResult(r);
      setError("");
    } catch (e) { setError((e as Error).message); setResult(null); }
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1rem" }}>
        <div>
          <p style={{ fontWeight: 700, color: "#38bdf8", fontSize: "0.9rem", marginBottom: "0.75rem" }}>{t("autoLoan.lease.purchase")}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <Field label={t("autoLoan.label.vehiclePrice")} value={purchasePrice} onChange={setPurchasePrice} prefix="$" />
            <Field label={t("autoLoan.label.downPayment")} value={purchaseDown} onChange={setPurchaseDown} prefix="$" />
            <Field label={t("autoLoan.label.interestRateAPR")} value={purchaseRate} onChange={setPurchaseRate} suffix="%" />
            <Field label={t("autoLoan.label.termMonths")} value={purchaseTerm} onChange={setPurchaseTerm} />
            <Field label={t("autoLoan.label.resaleValue")} value={resaleValue} onChange={setResaleValue} prefix="$" />
          </div>
        </div>
        <div>
          <p style={{ fontWeight: 700, color: "#c084fc", fontSize: "0.9rem", marginBottom: "0.75rem" }}>{t("autoLoan.lease.lease")}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <Field label={t("autoLoan.label.monthlyLease")} value={leaseMonthly} onChange={setLeaseMonthly} prefix="$" />
            <Field label={t("autoLoan.label.leaseTermMonths")} value={leaseTerm} onChange={setLeaseTerm} />
            <Field label={t("autoLoan.label.dueAtSigning")} value={leaseDown} onChange={setLeaseDown} prefix="$" />
            <Field label={t("autoLoan.label.acquisitionFees")} value={leaseFees} onChange={setLeaseFees} prefix="$" />
          </div>
        </div>
      </div>
      <button onClick={calculate} style={{ background: "#475569", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>
        {t("autoLoan.btn.compare")}
      </button>
      {error && <p style={{ color: "#f87171", marginTop: "0.5rem", fontSize: "0.85rem" }}>{error}</p>}
      {result && (
        <div style={{ marginTop: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ background: result.winner === "buy" ? "#0f1f0a" : "#0a0a0b", border: `1px solid ${result.winner === "buy" ? "#166534" : "#27272a"}`, borderRadius: "0.75rem", padding: "1rem" }}>
              <div style={{ fontWeight: 700, color: "#38bdf8", marginBottom: "0.5rem" }}>{t("autoLoan.lease.buyLabel")} {result.winner === "buy" && t("autoLoan.lease.winner")}</div>
              <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{t("autoLoan.lease.totalPaid")}: {usd(result.totalBuyCost)}</div>
              <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{t("autoLoan.lease.resaleValue")}: −{usd(result.buyResidualValue)}</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f4f4f5", marginTop: "0.5rem" }}>{t("autoLoan.lease.netCost")}: {usd(result.buyCostAfterResale)}</div>
            </div>
            <div style={{ background: result.winner === "lease" ? "#150f27" : "#0a0a0b", border: `1px solid ${result.winner === "lease" ? "#581c87" : "#27272a"}`, borderRadius: "0.75rem", padding: "1rem" }}>
              <div style={{ fontWeight: 700, color: "#c084fc", marginBottom: "0.5rem" }}>{t("autoLoan.lease.leaseLabel")} {result.winner === "lease" && t("autoLoan.lease.winner")}</div>
              <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{t("autoLoan.lease.totalLeaseCost")}: {usd(result.totalLeaseCost)}</div>
              <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{t("autoLoan.lease.noOwnership")}</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f4f4f5", marginTop: "0.5rem" }}>{t("autoLoan.lease.total")}: {usd(result.totalLeaseCost)}</div>
            </div>
          </div>
          <div style={{ background: "#0a0a0b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "0.75rem 1rem", marginTop: "0.75rem", textAlign: "center" }}>
            <span style={{ color: "#94a3b8" }}>{result.winner === "buy" ? t("autoLoan.lease.buying") : t("autoLoan.lease.leasing")} {t("autoLoan.lease.saves")} </span>
            <strong style={{ color: "#fbbf24" }}>{usd(result.savings)}</strong>
            <span style={{ color: "#94a3b8" }}> {t("autoLoan.lease.overPeriod")}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main ---
export default function AutoLoanPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"monthly" | "afford" | "lease">("monthly");

  return (
    <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <h1 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 800, color: "#94a3b8", marginBottom: "1.5rem" }}>
        {t("autoLoan.title")}
      </h1>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button style={TAB_STYLE(tab === "monthly")} onClick={() => setTab("monthly")}>{t("autoLoan.tab.monthlyPayment")}</button>
        <button style={TAB_STYLE(tab === "afford")} onClick={() => setTab("afford")}>{t("autoLoan.tab.affordability")}</button>
        <button style={TAB_STYLE(tab === "lease")} onClick={() => setTab("lease")}>{t("autoLoan.tab.leaseBuy")}</button>
      </div>
      <div style={{ background: "#111113", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
        {tab === "monthly" && <TabMonthly />}
        {tab === "afford" && <TabAffordability />}
        {tab === "lease" && <TabLease />}
      </div>
      <p style={{ marginTop: "1.5rem", fontSize: "0.7rem", color: "#3f3f46", textAlign: "center" }}>
        {t("autoLoan.desc.disclaimer")}
      </p>
    </div>
  );
}
