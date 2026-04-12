"use client";

import { useState } from "react";
import { calculateLoan, type LoanInput } from "@/lib/calculations/loans";
import { useLanguage } from "@/context/LanguageContext";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

interface LoanFormProps {
  label: string;
  loan: LoanInput;
  onChange: (loan: LoanInput) => void;
  labels: {
    amount: string;
    annualRate: string;
    termMonths: string;
    fees: string;
  };
}

function LoanForm({ label, loan, onChange, labels }: LoanFormProps) {
  const fields: { key: keyof LoanInput; label: string; step?: string }[] = [
    { key: "amount", label: labels.amount },
    { key: "annualRate", label: labels.annualRate, step: "0.01" },
    { key: "termMonths", label: labels.termMonths },
    { key: "fees", label: labels.fees },
  ];
  return (
    <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.25rem" }}>
      <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: "1rem", fontSize: "0.9rem" }}>{label}</div>
      {fields.map(({ key, label: fl, step }) => (
        <div key={key} style={{ marginBottom: "0.875rem" }}>
          <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.25rem" }}>{fl}</label>
          <input
            type="number"
            value={loan[key]}
            step={step}
            onChange={(e) => onChange({ ...loan, [key]: parseFloat(e.target.value) || 0 })}
            style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.9rem" }}
          />
        </div>
      ))}
    </div>
  );
}

export default function LoansPage() {
  const { t } = useLanguage();
  const [showLoanC, setShowLoanC] = useState(false);

  const [loanA, setLoanA] = useState<LoanInput>({ amount: 20000, annualRate: 6.5, termMonths: 60, fees: 200 });
  const [loanB, setLoanB] = useState<LoanInput>({ amount: 20000, annualRate: 5.9, termMonths: 72, fees: 500 });
  const [loanC, setLoanC] = useState<LoanInput>({ amount: 20000, annualRate: 7.2, termMonths: 48, fees: 0 });

  const resA = calculateLoan(loanA);
  const resB = calculateLoan(loanB);
  const resC = calculateLoan(loanC);

  const fieldLabels = {
    amount: t("loans.field.amount"),
    annualRate: t("loans.field.annualRate"),
    termMonths: t("loans.field.termMonths"),
    fees: t("loans.field.fees"),
  };

  const loans = showLoanC
    ? [
        { label: t("loans.loan.a"), loan: loanA, result: resA },
        { label: t("loans.loan.b"), loan: loanB, result: resB },
        { label: t("loans.loan.c"), loan: loanC, result: resC },
      ]
    : [
        { label: t("loans.loan.a"), loan: loanA, result: resA },
        { label: t("loans.loan.b"), loan: loanB, result: resB },
      ];

  const setters = [setLoanA, setLoanB, setLoanC];

  const cheapestIdx = loans.reduce((min, cur, i) => cur.result.totalPaid < loans[min].result.totalPaid ? i : min, 0);

  const rowKeys: { key: keyof typeof resA; label: string }[] = [
    { key: "monthlyPayment", label: t("loans.metric.monthlyPayment") },
    { key: "totalPaid", label: t("loans.metric.totalPaid") },
    { key: "totalInterest", label: t("loans.metric.totalInterest") },
    { key: "effectiveAPR", label: t("loans.metric.effectiveAPR") },
  ];

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>{t("loans.title")}</h1>
      <p style={{ color: "#71717a", marginBottom: "2rem" }}>{t("loans.desc.intro")}</p>

      <div style={{ display: "grid", gridTemplateColumns: showLoanC ? "1fr 1fr 1fr" : "1fr 1fr", gap: "1.25rem", marginBottom: "2rem" }}>
        {loans.map(({ label, loan }, i) => (
          <LoanForm key={label} label={label} loan={loan} onChange={setters[i]} labels={fieldLabels} />
        ))}
      </div>

      <button
        onClick={() => setShowLoanC(!showLoanC)}
        style={{ marginBottom: "2rem", padding: "0.5rem 1.25rem", background: showLoanC ? "#27272a" : "#3f3f46", border: "1px solid #52525b", borderRadius: "0.5rem", color: "#a1a1aa", cursor: "pointer", fontSize: "0.875rem" }}
      >
        {showLoanC ? t("loans.btn.removeLoanC") : t("loans.btn.addLoanC")}
      </button>

      {/* Comparison Table */}
      <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #27272a" }}>
          <div style={{ fontWeight: 700, color: "#fafafa", fontSize: "0.95rem" }}>{t("loans.table.title")}</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #3f3f46" }}>
                <th style={{ padding: "0.75rem 1.25rem", textAlign: "left", color: "#71717a", fontWeight: 600, fontSize: "0.8rem" }}>{t("loans.table.metric")}</th>
                {loans.map(({ label }, i) => (
                  <th key={label} style={{ padding: "0.75rem 1rem", textAlign: "right", color: i === cheapestIdx ? "#a78bfa" : "#71717a", fontWeight: 700, fontSize: "0.85rem" }}>
                    {label} {i === cheapestIdx && "✓"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowKeys.map(({ key, label }) => (
                <tr key={key} style={{ borderBottom: "1px solid #27272a" }}>
                  <td style={{ padding: "0.625rem 1.25rem", color: "#a1a1aa", fontSize: "0.875rem" }}>{label}</td>
                  {loans.map(({ label: l, result }) => {
                    const val = result[key];
                    const isApr = key === "effectiveAPR";
                    const display = isApr ? (val as number).toFixed(2) + "%" : fmt(val as number);
                    const isBest = key === "totalPaid"
                      ? loans.every((lo) => (result[key] as number) <= (lo.result[key] as number))
                      : key === "effectiveAPR"
                      ? loans.every((lo) => (result[key] as number) <= (lo.result[key] as number))
                      : false;
                    return (
                      <td key={l} style={{ padding: "0.625rem 1rem", textAlign: "right", color: isBest ? "#22c55e" : "#fafafa", fontWeight: isBest ? 700 : 400, fontSize: "0.875rem" }}>
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid #27272a", background: "rgba(124,58,237,0.05)" }}>
          <div style={{ fontSize: "0.875rem", color: "#a1a1aa" }}>
            {t("loans.result.bestOverall")}
            <span style={{ fontWeight: 700, color: "#a78bfa", marginLeft: "0.5rem" }}>
              {loans[cheapestIdx].label} — {t("loans.result.saves")} {fmt(Math.max(...loans.map((l) => l.result.totalPaid)) - loans[cheapestIdx].result.totalPaid)} {t("loans.result.vsMostExpensive")}
            </span>
          </div>
        </div>
      </div>

      <p style={{ marginTop: "3rem", fontSize: "0.8rem", color: "#52525b", borderTop: "1px solid #27272a", paddingTop: "1rem" }}>
        {t("loans.desc.disclaimer")}
      </p>
    </div>
  );
}
