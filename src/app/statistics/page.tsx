"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import RetroWindow from "@/components/RetroWindow";
import { useLanguage } from "@/context/LanguageContext";
import { parseNumbers, calcStats, buildHistogram } from "@/lib/calculations/statistics";
import ExportButton from "@/components/ui/ExportButton";
import PrintButton from "@/components/ui/PrintButton";

function fmt(n: number) {
  if (Number.isInteger(n)) return n.toLocaleString("en-US");
  return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

const card: React.CSSProperties = {
  background: "#18181b",
  borderRadius: "1rem",
  border: "1px solid #27272a",
  padding: "1.5rem",
  marginBottom: "1.25rem",
};

export default function StatisticsPage() {
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const [showSorted, setShowSorted] = useState(false);

  const numbers = parseNumbers(input);
  const stats = calcStats(numbers);
  const histogram = stats ? buildHistogram(numbers) : [];
  const maxBin = histogram.length ? Math.max(...histogram.map((b) => b.count)) : 0;

  const sorted = [...numbers].sort((a, b) => a - b);

  const statCards = stats
    ? [
        { label: t("statistics.stat.count"), value: String(stats.count), color: "#a78bfa" },
        { label: t("statistics.stat.sum"), value: fmt(stats.sum), color: "#a78bfa" },
        { label: t("statistics.stat.mean"), value: fmt(stats.mean), color: "#60a5fa" },
        { label: t("statistics.stat.median"), value: fmt(stats.median), color: "#60a5fa" },
        { label: t("statistics.stat.mode"), value: stats.mode.map(fmt).join(", "), color: "#34d399" },
        { label: t("statistics.stat.range"), value: fmt(stats.range), color: "#34d399" },
        { label: t("statistics.stat.min"), value: fmt(stats.min), color: "#fb923c" },
        { label: t("statistics.stat.max"), value: fmt(stats.max), color: "#fb923c" },
        { label: t("statistics.stat.stdDev"), value: fmt(stats.stdDev), color: "#f472b6" },
        { label: t("statistics.stat.variance"), value: fmt(stats.variance), color: "#f472b6" },
      ]
    : [];

  function getExportData() {
    if (!stats) return [];
    return [
      { Statistic: t("statistics.stat.count"), Value: stats.count },
      { Statistic: t("statistics.stat.sum"), Value: stats.sum },
      { Statistic: t("statistics.stat.mean"), Value: stats.mean },
      { Statistic: t("statistics.stat.median"), Value: stats.median },
      { Statistic: t("statistics.stat.mode"), Value: stats.mode.map(fmt).join(", ") },
      { Statistic: t("statistics.stat.range"), Value: stats.range },
      { Statistic: t("statistics.stat.min"), Value: stats.min },
      { Statistic: t("statistics.stat.max"), Value: stats.max },
      { Statistic: t("statistics.stat.stdDev"), Value: stats.stdDev },
      { Statistic: t("statistics.stat.variance"), Value: stats.variance },
    ];
  }

  return (
    <RetroWindow title={t("statistics.title")}>
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/" style={{ color: "#71717a", display: "flex", alignItems: "center" }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 style={{ fontWeight: 700, fontSize: "1.35rem", color: "#fafafa" }}>{t("statistics.heading")}</h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <ExportButton getData={getExportData} filename="calmatic-statistics" sheetName="Statistics" />
          <PrintButton />
        </div>
      </div>

      {/* Input */}
      <div style={card}>
        <label style={{ fontSize: "0.875rem", color: "#a1a1aa", display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
          {t("statistics.input.label")}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("statistics.input.placeholder")}
          style={{
            width: "100%",
            background: "#27272a",
            border: "1px solid #3f3f46",
            borderRadius: "0.75rem",
            color: "#fafafa",
            padding: "0.875rem 1rem",
            fontSize: "0.95rem",
            fontFamily: "monospace",
            resize: "vertical",
            minHeight: "140px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#52525b" }}>
            {numbers.length > 0
              ? t("statistics.input.detected").replace("{count}", String(numbers.length)).replace("{plural}", numbers.length !== 1 ? "s" : "")
              : t("statistics.input.hint")}
          </p>
          {numbers.length > 0 && (
            <button
              onClick={() => setInput("")}
              style={{ background: "none", border: "none", color: "#71717a", fontSize: "0.75rem", cursor: "pointer" }}
            >
              {t("common.clear")}
            </button>
          )}
        </div>
      </div>

      {/* Result cards */}
      {stats && (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "0.75rem",
            marginBottom: "1.25rem",
          }}>
            {statCards.map(({ label, value, color }) => (
              <div key={label} style={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "0.75rem",
                padding: "1rem",
                textAlign: "center",
              }}>
                <p style={{ fontSize: "0.7rem", color: "#71717a", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {label}
                </p>
                <p style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "1rem", color, wordBreak: "break-all" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* SVG Histogram */}
          {histogram.length > 0 && (
            <div style={card}>
              <p style={{ fontSize: "0.9rem", color: "#a1a1aa", marginBottom: "1.25rem", fontWeight: 600 }}>
                {t("statistics.histogram.title")}
              </p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "180px" }}>
                {histogram.map((bin, i) => {
                  const barH = maxBin > 0 ? Math.max(4, Math.round((bin.count / maxBin) * 150)) : 0;
                  return (
                    <div
                      key={i}
                      style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}
                    >
                      {bin.count > 0 && (
                        <span style={{ fontSize: "0.65rem", color: "#a78bfa", marginBottom: "3px", fontWeight: 700 }}>
                          {bin.count}
                        </span>
                      )}
                      <div
                        title={`${bin.label}: ${bin.count}`}
                        style={{
                          width: "100%",
                          background: bin.count > 0
                            ? `linear-gradient(180deg, #a78bfa, #7c3aed)`
                            : "#27272a",
                          borderRadius: "4px 4px 0 0",
                          height: bin.count > 0 ? `${barH}px` : "2px",
                          transition: "height 0.3s ease",
                        }}
                      />
                      <p style={{
                        fontSize: "0.55rem",
                        color: "#52525b",
                        marginTop: "4px",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        width: "100%",
                        textAlign: "center",
                        textOverflow: "ellipsis",
                      }}>
                        {parseFloat(bin.label).toFixed(1)}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: "0.7rem", color: "#3f3f46", marginTop: "0.75rem" }}>
                {t("statistics.histogram.footer").replace("{bins}", String(histogram.length)).replace("{min}", fmt(stats.min)).replace("{max}", fmt(stats.max))}
              </p>
            </div>
          )}

          {/* Sorted list toggle */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: "0.9rem", color: "#a1a1aa", fontWeight: 600 }}>
                {t("statistics.sorted.title").replace("{count}", String(numbers.length))}
              </p>
              <button
                onClick={() => setShowSorted(!showSorted)}
                style={{
                  background: showSorted ? "#3f3f46" : "transparent",
                  border: "1px solid #3f3f46",
                  borderRadius: "0.5rem",
                  padding: "0.375rem 0.875rem",
                  color: "#a1a1aa",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                {showSorted ? t("common.hide") : t("common.show")}
              </button>
            </div>
            {showSorted && (
              <div style={{
                marginTop: "1rem",
                background: "#09090b",
                border: "1px solid #27272a",
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                fontFamily: "monospace",
                fontSize: "0.85rem",
                color: "#d4d4d8",
                lineHeight: 1.9,
                wordBreak: "break-all",
                maxHeight: "200px",
                overflowY: "auto",
              }}>
                {sorted.map(fmt).join(", ")}
              </div>
            )}
          </div>
        </>
      )}

      <p style={{ textAlign: "center", color: "#3f3f46", fontSize: "0.75rem", marginTop: "1rem" }}>
        {t("common.disclaimer")}
      </p>
    </div>
    </RetroWindow>
  );
}
