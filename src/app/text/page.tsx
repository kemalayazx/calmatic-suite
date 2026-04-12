"use client";

import { useState, useMemo } from "react";
import {
  analyzeText, toUpperCase, toLowerCase, toTitleCase, toSentenceCase, formatTime,
} from "@/lib/calculations/text";
import { useLanguage } from "@/context/LanguageContext";

function StatBox({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: "#1c1c1f", borderRadius: "0.5rem", padding: "0.875rem", textAlign: "center" }}>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: color ?? "#a78bfa" }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "0.2rem" }}>{label}</div>
      {sub && <div style={{ fontSize: "0.7rem", color: "#52525b" }}>{sub}</div>}
    </div>
  );
}

export default function TextPage() {
  const { t } = useLanguage();
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => analyzeText(text), [text]);

  const apply = (fn: (t: string) => string) => setText(fn(text));

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem", color: "#fafafa" }}>
        {t("text.title")}
      </h1>
      <p style={{ color: "#71717a", marginBottom: "1.5rem" }}>
        {t("text.subtitle")}
      </p>

      {/* Textarea */}
      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("text.placeholder")}
          rows={12}
          style={{
            width: "100%", background: "#18181b", border: "1px solid #3f3f46",
            borderRadius: "0.75rem", color: "#fafafa", padding: "1rem", fontSize: "1rem",
            resize: "vertical", outline: "none", lineHeight: 1.7, boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
        <div style={{ position: "absolute", bottom: "0.75rem", right: "1rem", fontSize: "0.75rem", color: "#3f3f46" }}>
          {stats.characters} {t("text.stat.chars")}
        </div>
      </div>

      {/* Case Converter + Copy */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {[
          { label: t("text.case.upper"), fn: toUpperCase },
          { label: t("text.case.lower"), fn: toLowerCase },
          { label: t("text.case.title"), fn: toTitleCase },
          { label: t("text.case.sentence"), fn: toSentenceCase },
        ].map(({ label, fn }) => (
          <button key={label} onClick={() => apply(fn)}
            style={{ padding: "0.45rem 0.875rem", background: "#27272a", color: "#d4d4d8", border: "1px solid #3f3f46", borderRadius: "0.375rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
            {label}
          </button>
        ))}
        <button onClick={copy}
          style={{ padding: "0.45rem 0.875rem", background: copied ? "#16a34a" : "#7c3aed", color: "#fff", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, marginLeft: "auto" }}>
          {copied ? t("common.copied") : t("text.btn.copyText")}
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <StatBox label={t("text.stat.characters")} value={stats.characters} color="#a78bfa" />
        <StatBox label={t("text.stat.charsNoSpaces")} value={stats.charactersNoSpaces} color="#7c3aed" />
        <StatBox label={t("text.stat.words")} value={stats.words} color="#3b82f6" />
        <StatBox label={t("text.stat.sentences")} value={stats.sentences} color="#22c55e" />
        <StatBox label={t("text.stat.paragraphs")} value={stats.paragraphs} color="#f97316" />
        <StatBox label={t("text.stat.lines")} value={stats.lines} color="#eab308" />
        <StatBox label={t("text.stat.readingTime")} value={formatTime(stats.readingTimeSeconds)} sub={t("text.stat.readingTimeSub")} color="#ec4899" />
        <StatBox label={t("text.stat.speakingTime")} value={formatTime(stats.speakingTimeSeconds)} sub={t("text.stat.speakingTimeSub")} color="#14b8a6" />
      </div>

      {/* Keyword Density */}
      {stats.topKeywords.length > 0 && (
        <div style={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "0.75rem", padding: "1.25rem" }}>
          <h2 style={{ fontWeight: 700, fontSize: "0.85rem", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
            {t("text.label.topKeywords")}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {stats.topKeywords.map(({ word, count, pct }) => (
              <div key={word} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ width: "100px", color: "#fafafa", fontSize: "0.875rem", fontWeight: 600, flexShrink: 0 }}>{word}</span>
                <div style={{ flex: 1, background: "#27272a", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "#7c3aed", transition: "width 0.3s" }} />
                </div>
                <span style={{ width: "60px", textAlign: "right", color: "#71717a", fontSize: "0.8rem", flexShrink: 0 }}>
                  {count}× ({pct.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ color: "#52525b", fontSize: "0.8rem", textAlign: "center", marginTop: "1.5rem" }}>
        {t("text.footer")}
      </p>
    </div>
  );
}
