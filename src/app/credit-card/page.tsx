"use client";

import { useState } from "react";
import { calcPayoff, calcMinimumTrap, calcBalanceTransfer } from "@/lib/calculations/credit-card";
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
  background: active ? "#991b1b" : "#1c1c1e",
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
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)}
          style={{ ...INPUT_STYLE, paddingLeft: prefix ? "1.6rem" : undefined, paddingRight: suffix ? "1.8rem" : undefined }} min="0" />
        {suffix && <span style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#52525b", fontSize: "0.9rem" }}>{suffix}</span>}
      </div>
    </div>
  );
}

// --- Tab 1: Payoff ---
function TabPayoff() {
  const { t } = useLanguage();
  const [balance, setBalance] = useState("5000");
  const [apr, setApr] = useState("22.99");
  const [payment, setPayment] = useState("200");
  const [result, setResult] = useState<ReturnType<typeof calcPayoff> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      const b = parseFloat(balance), a = parseFloat(apr), p = parseFloat(payment);
      if (isNaN(b) || b <= 0 || isNaN(a) || isNaN(p) || p <= 0) throw new Error(t("creditCard.error.invalidPositive"));
      const r = calcPayoff(b, a, p);
      setResult(r);
      setError("");
    } catch (e) { setError((e as Error).message); setResult(null); }
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
        <Field label={t("creditCard.label.currentBalance")} value={balance} onChange={setBalance} prefix="$" />
        <Field label={t("creditCard.label.apr")} value={apr} onChange={setApr} suffix="%" />
        <Field label={t("creditCard.label.monthlyPayment")} value={payment} onChange={setPayment} prefix="$" />
      </div>
      <button onClick={calculate} style={{ background: "#991b1b", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>
        {t("creditCard.btn.calculate")}
      </button>
      {error && <p style={{ color: "#f87171", marginTop: "0.5rem", fontSize: "0.85rem" }}>{error}</p>}
      {result && (
        <div style={{ marginTop: "1rem" }}>
          {result.minInterestWarning ? (
            <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: "0.75rem", padding: "1rem" }}>
              <p style={{ color: "#f87171", fontWeight: 700 }}>{t("creditCard.warn.paymentTooLow")}</p>
              <p style={{ color: "#fca5a5", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                {`${t("creditCard.warn.paymentTooLowDescPre")} ${usd(parseFloat(payment))} ${t("creditCard.warn.paymentTooLowDescPost")}`}
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
              {[
                { label: t("creditCard.result.monthsToPayOff"), value: `${result.months} ${t("creditCard.result.months")} (${(result.months / 12).toFixed(1)} ${t("creditCard.result.yrs")})` },
                { label: t("creditCard.result.totalInterestPaid"), value: usd(result.totalInterest) },
                { label: t("creditCard.result.totalAmountPaid"), value: usd(result.totalPaid) },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "#1a0b0b", border: "1px solid #7f1d1d", borderRadius: "0.75rem", padding: "0.75rem 1rem" }}>
                  <div style={{ fontSize: "0.7rem", color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f4f4f5", marginTop: "0.25rem" }}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Tab 2: Minimum Payment Trap ---
function TabMinimum() {
  const { t } = useLanguage();
  const [balance, setBalance] = useState("5000");
  const [apr, setApr] = useState("22.99");
  const [method, setMethod] = useState<"percent" | "fixed">("percent");
  const [minValue, setMinValue] = useState("2");
  const [rows, setRows] = useState<ReturnType<typeof calcMinimumTrap> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      const b = parseFloat(balance), a = parseFloat(apr), v = parseFloat(minValue);
      if (isNaN(b) || b <= 0 || isNaN(a) || isNaN(v) || v <= 0) throw new Error(t("creditCard.error.invalidPositive"));
      setRows(calcMinimumTrap(b, a, method, v));
      setError("");
    } catch (e) { setError((e as Error).message); setRows(null); }
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
        <Field label={t("creditCard.label.currentBalance")} value={balance} onChange={setBalance} prefix="$" />
        <Field label={t("creditCard.label.apr")} value={apr} onChange={setApr} suffix="%" />
        <div>
          <label style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "block", marginBottom: "0.3rem" }}>{t("creditCard.label.minPaymentMethod")}</label>
          <select value={method} onChange={(e) => setMethod(e.target.value as "percent"|"fixed")} style={INPUT_STYLE}>
            <option value="percent">{t("creditCard.option.percentOfBalance")}</option>
            <option value="fixed">{t("creditCard.option.fixedAmount")}</option>
          </select>
        </div>
        <Field label={method === "percent" ? t("creditCard.label.minimumPercent") : t("creditCard.label.minimumDollar")} value={minValue} onChange={setMinValue} suffix={method === "percent" ? "%" : "$"} />
      </div>
      <button onClick={calculate} style={{ background: "#991b1b", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>
        {t("creditCard.btn.showTrap")}
      </button>
      {error && <p style={{ color: "#f87171", marginTop: "0.5rem", fontSize: "0.85rem" }}>{error}</p>}
      {rows && (
        <div style={{ marginTop: "1rem", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr>
                {[
                  t("creditCard.table.payment"),
                  t("creditCard.table.months"),
                  t("creditCard.table.totalInterest"),
                  t("creditCard.table.totalPaid"),
                  t("creditCard.table.timeSaved"),
                  t("creditCard.table.interestSaved"),
                ].map((h) => (
                  <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", color: "#71717a", borderBottom: "1px solid #27272a", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ background: i === 0 ? "#1a0b0b" : i % 2 === 0 ? "#0a0a0b" : "#111113" }}>
                  <td style={{ padding: "0.5rem 0.75rem", color: i === 0 ? "#f87171" : "#4ade80", fontWeight: 700 }}>{row.label}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#f4f4f5" }}>{row.months < 0 ? t("creditCard.result.never") : row.months}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#f4f4f5" }}>{row.totalInterest < 0 ? "∞" : usd(row.totalInterest)}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#f4f4f5" }}>{row.totalPaid < 0 ? "∞" : usd(row.totalPaid)}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: row.timeSaved > 0 ? "#4ade80" : "#52525b" }}>{row.timeSaved > 0 ? `${row.timeSaved} ${t("creditCard.result.mo")}` : "—"}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: row.interestSaved > 0 ? "#4ade80" : "#52525b" }}>{row.interestSaved > 0 ? usd(row.interestSaved) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Tab 3: Balance Transfer ---
function TabTransfer() {
  const { t } = useLanguage();
  const [balance, setBalance] = useState("5000");
  const [currentApr, setCurrentApr] = useState("22.99");
  const [introPeriod, setIntroPeriod] = useState("15");
  const [regularApr, setRegularApr] = useState("19.99");
  const [transferFee, setTransferFee] = useState("3");
  const [payment, setPayment] = useState("200");
  const [result, setResult] = useState<ReturnType<typeof calcBalanceTransfer> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      const b = parseFloat(balance), ca = parseFloat(currentApr), ip = parseInt(introPeriod);
      const ra = parseFloat(regularApr), tf = parseFloat(transferFee), p = parseFloat(payment);
      if ([b, ca, ip, ra, tf, p].some(isNaN) || b <= 0 || p <= 0) throw new Error(t("creditCard.error.invalidPositive"));
      setResult(calcBalanceTransfer(b, ca, ip, ra, tf, p));
      setError("");
    } catch (e) { setError((e as Error).message); setResult(null); }
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
        <Field label={t("creditCard.label.currentBalance")} value={balance} onChange={setBalance} prefix="$" />
        <Field label={t("creditCard.label.currentAPR")} value={currentApr} onChange={setCurrentApr} suffix="%" />
        <Field label={t("creditCard.label.introPeriodMonths")} value={introPeriod} onChange={setIntroPeriod} />
        <Field label={t("creditCard.label.regularAPRAfter")} value={regularApr} onChange={setRegularApr} suffix="%" />
        <Field label={t("creditCard.label.transferFee")} value={transferFee} onChange={setTransferFee} suffix="%" />
        <Field label={t("creditCard.label.monthlyPayment")} value={payment} onChange={setPayment} prefix="$" />
      </div>
      <button onClick={calculate} style={{ background: "#991b1b", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>
        {t("creditCard.btn.analyze")}
      </button>
      {error && <p style={{ color: "#f87171", marginTop: "0.5rem", fontSize: "0.85rem" }}>{error}</p>}
      {result && (
        <div style={{ marginTop: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ background: "#1a0b0b", border: "1px solid #7f1d1d", borderRadius: "0.75rem", padding: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#f87171", marginBottom: "0.5rem" }}>{t("creditCard.transfer.stayOnCard")}</div>
              <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#f4f4f5" }}>{usd(result.stayTotalInterest)}</div>
              <div style={{ fontSize: "0.8rem", color: "#71717a" }}>{t("creditCard.transfer.totalInterest")}</div>
            </div>
            <div style={{ background: "#0f1f0a", border: "1px solid #166534", borderRadius: "0.75rem", padding: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#4ade80", marginBottom: "0.5rem" }}>{t("creditCard.transfer.balanceTransfer")}</div>
              <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#f4f4f5" }}>{usd(result.transferTotalInterest + result.transferFee)}</div>
              <div style={{ fontSize: "0.8rem", color: "#71717a" }}>{t("creditCard.transfer.interestPlusFee")} ({usd(result.transferFee)} fee)</div>
            </div>
          </div>
          <div style={{ background: "#0a0a0b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1rem" }}>
            <p style={{ color: result.savings > 0 ? "#4ade80" : "#f87171", fontWeight: 700, fontSize: "0.95rem" }}>
              {result.recommendation}
            </p>
            {result.breakEvenMonth > 0 && (
              <p style={{ color: "#71717a", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                {t("creditCard.transfer.breakEven")}: {t("creditCard.transfer.month")} {result.breakEvenMonth}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main ---
export default function CreditCardPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"payoff" | "minimum" | "transfer">("payoff");

  return (
    <div style={{ maxWidth: "52rem", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <h1 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 800, color: "#f87171", marginBottom: "1.5rem" }}>
        {t("creditCard.title")}
      </h1>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button style={TAB_STYLE(tab === "payoff")} onClick={() => setTab("payoff")}>{t("creditCard.tab.payoff")}</button>
        <button style={TAB_STYLE(tab === "minimum")} onClick={() => setTab("minimum")}>{t("creditCard.tab.minimumTrap")}</button>
        <button style={TAB_STYLE(tab === "transfer")} onClick={() => setTab("transfer")}>{t("creditCard.tab.balanceTransfer")}</button>
      </div>
      <div style={{ background: "#111113", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
        {tab === "payoff" && <TabPayoff />}
        {tab === "minimum" && <TabMinimum />}
        {tab === "transfer" && <TabTransfer />}
      </div>
      <p style={{ marginTop: "1.5rem", fontSize: "0.7rem", color: "#3f3f46", textAlign: "center" }}>
        {t("creditCard.desc.disclaimer")}
      </p>
    </div>
  );
}
