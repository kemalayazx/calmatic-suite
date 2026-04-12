"use client";

import { useState, useCallback, useEffect } from "react";
import {
  generatePassword,
  generatePasswords,
  calculateStrength,
  type PasswordOptions,
} from "@/lib/calculations/password";
import { useLanguage } from "@/context/LanguageContext";

const DEFAULT_OPTS: PasswordOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: false,
  excludeAmbiguous: false,
};

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", userSelect: "none" }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: "44px", height: "24px", borderRadius: "12px",
          background: checked ? "#7c3aed" : "#3f3f46",
          position: "relative", transition: "background 0.2s", cursor: "pointer", flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute", top: "3px",
          left: checked ? "23px" : "3px",
          width: "18px", height: "18px", borderRadius: "50%",
          background: "#fafafa", transition: "left 0.2s",
        }} />
      </div>
      <span style={{ color: "#d4d4d8", fontSize: "0.9rem" }}>{label}</span>
    </label>
  );
}

export default function PasswordPage() {
  const { t } = useLanguage();
  const [opts, setOpts] = useState<PasswordOptions>(DEFAULT_OPTS);
  const [password, setPassword] = useState("");
  const [bulk, setBulk] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const generate = useCallback(() => {
    setPassword(generatePassword(opts));
    setBulk([]);
  }, [opts]);

  const generateBulk = useCallback(() => {
    setBulk(generatePasswords(opts, 5));
    setPassword("");
  }, [opts]);

  useEffect(() => { generate(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (password || bulk.length > 0) { /* re-gen when opts change */ } }, [opts]); // eslint-disable-line

  const setOpt = <K extends keyof PasswordOptions>(k: K, v: PasswordOptions[K]) =>
    setOpts((prev) => ({ ...prev, [k]: v }));

  const strength = calculateStrength(password || bulk[0] || "");

  const copy = (text: string, idx?: number) => {
    navigator.clipboard.writeText(text).then(() => {
      if (idx !== undefined) {
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 1500);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    });
  };

  const displayPassword = password || (bulk.length > 0 ? "" : "");

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem", color: "#fafafa" }}>
        {t("password.title")}
      </h1>
      <p style={{ color: "#71717a", marginBottom: "2rem" }}>
        {t("password.subtitle")}
      </p>

      {/* Generated Password Display */}
      <div style={{
        background: "#18181b", border: "1px solid #3f3f46", borderRadius: "0.75rem",
        padding: "1.5rem", marginBottom: "1.5rem",
      }}>
        {displayPassword ? (
          <>
            <div style={{
              fontFamily: "monospace", fontSize: "clamp(1rem, 3vw, 1.5rem)",
              color: "#a78bfa", wordBreak: "break-all", letterSpacing: "0.05em",
              marginBottom: "1rem", minHeight: "2.5rem",
            }}>
              {displayPassword}
            </div>
            {/* Strength Meter */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.8rem", color: "#71717a" }}>{t("password.label.strength")}</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: strength.color }}>{strength.label}</span>
              </div>
              <div style={{ background: "#27272a", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                <div style={{
                  width: `${((strength.score + 1) / 5) * 100}%`,
                  height: "100%", background: strength.color,
                  transition: "width 0.3s, background 0.3s",
                }} />
              </div>
              <div style={{ fontSize: "0.75rem", color: "#52525b", marginTop: "0.3rem" }}>
                {t("password.label.entropy")}: {strength.entropy.toFixed(1)} bits
              </div>
            </div>
            <button
              onClick={() => copy(displayPassword)}
              style={{
                padding: "0.5rem 1.25rem", borderRadius: "0.5rem",
                background: copied ? "#16a34a" : "#7c3aed",
                color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem",
              }}
            >
              {copied ? t("common.copied") : t("password.btn.copyPassword")}
            </button>
          </>
        ) : (
          <div style={{ color: "#52525b", fontStyle: "italic" }}>{t("password.msg.enableCharType")}</div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        background: "#18181b", border: "1px solid #3f3f46", borderRadius: "0.75rem",
        padding: "1.5rem", marginBottom: "1.5rem",
      }}>
        {/* Length Slider */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ color: "#d4d4d8", fontWeight: 600 }}>{t("password.label.length")}</span>
            <span style={{
              background: "#7c3aed", color: "#fff", borderRadius: "0.375rem",
              padding: "0.1rem 0.6rem", fontSize: "0.9rem", fontWeight: 700, minWidth: "3rem", textAlign: "center",
            }}>{opts.length}</span>
          </div>
          <input
            type="range" min={8} max={128} value={opts.length}
            onChange={(e) => setOpt("length", Number(e.target.value))}
            style={{ width: "100%", accentColor: "#7c3aed" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#52525b" }}>
            <span>8</span><span>128</span>
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
          <Toggle label={t("password.toggle.uppercase")} checked={opts.uppercase} onChange={(v) => setOpt("uppercase", v)} />
          <Toggle label={t("password.toggle.lowercase")} checked={opts.lowercase} onChange={(v) => setOpt("lowercase", v)} />
          <Toggle label={t("password.toggle.numbers")} checked={opts.numbers} onChange={(v) => setOpt("numbers", v)} />
          <Toggle label={t("password.toggle.symbols")} checked={opts.symbols} onChange={(v) => setOpt("symbols", v)} />
          <Toggle label={t("password.toggle.excludeAmbiguous")} checked={opts.excludeAmbiguous} onChange={(v) => setOpt("excludeAmbiguous", v)} />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <button
          onClick={generate}
          style={{
            flex: 1, padding: "0.75rem 1.5rem", borderRadius: "0.5rem",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "1rem",
          }}
        >
          {t("password.btn.generate")}
        </button>
        <button
          onClick={generateBulk}
          style={{
            flex: 1, padding: "0.75rem 1.5rem", borderRadius: "0.5rem",
            background: "transparent", color: "#a78bfa",
            border: "1px solid #7c3aed", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
          }}
        >
          {t("password.btn.generate5")}
        </button>
      </div>

      {/* Bulk Results */}
      {bulk.length > 0 && (
        <div style={{
          background: "#18181b", border: "1px solid #3f3f46", borderRadius: "0.75rem",
          padding: "1.25rem", marginBottom: "1.5rem",
        }}>
          <h3 style={{ color: "#a1a1aa", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
            {t("password.label.generated5")}
          </h3>
          {bulk.map((pw, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.75rem", borderRadius: "0.5rem",
              background: i % 2 === 0 ? "#1c1c1f" : "transparent",
              marginBottom: "0.25rem",
            }}>
              <span style={{ fontFamily: "monospace", color: "#a78bfa", wordBreak: "break-all", fontSize: "0.9rem" }}>{pw}</span>
              <button
                onClick={() => copy(pw, i)}
                style={{
                  marginLeft: "0.75rem", padding: "0.25rem 0.75rem", borderRadius: "0.375rem",
                  background: copiedIdx === i ? "#16a34a" : "#27272a",
                  color: "#d4d4d8", border: "1px solid #3f3f46", cursor: "pointer", fontSize: "0.8rem",
                  flexShrink: 0,
                }}
              >
                {copiedIdx === i ? t("common.copied") : t("common.copy")}
              </button>
            </div>
          ))}
        </div>
      )}

      <p style={{ color: "#52525b", fontSize: "0.8rem", textAlign: "center", marginTop: "1rem" }}>
        {t("password.footer")}
      </p>
    </div>
  );
}
