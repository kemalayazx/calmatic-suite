"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import RetroWindow from "@/components/RetroWindow";
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hslToHex,
  hexToHsl,
  toCssRgb,
  toCssRgba,
  toCssHsl,
  toCssHsla,
  getComplementary,
  getAnalogous,
  getTriadic,
  isValidHex,
  type RGB,
  type HSL,
  type PaletteColor,
} from "@/lib/calculations/colors";
import { useLanguage } from "@/context/LanguageContext";

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "8px",
  color: "#fafafa",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#71717a",
  marginBottom: "4px",
  display: "block",
};

const cardStyle: React.CSSProperties = {
  background: "rgba(24,24,27,0.6)",
  border: "1px solid #27272a",
  borderRadius: "1rem",
  padding: "1.25rem",
};

// ─── CopyRow ─────────────────────────────────────────────────────────────────

function CopyRow({ label, value }: { label: string; value: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.5rem 0.75rem",
        background: "#18181b",
        borderRadius: "8px",
        gap: "0.75rem",
      }}
    >
      <span style={{ color: "#52525b", fontSize: "0.75rem", minWidth: "48px" }}>{label}</span>
      <span style={{ fontFamily: "monospace", color: "#d4d4d8", fontSize: "0.85rem", flex: 1, overflowX: "auto" }}>
        {value}
      </span>
      <button
        onClick={copy}
        style={{
          padding: "0.25rem 0.6rem",
          borderRadius: "6px",
          border: "1px solid #3f3f46",
          background: copied ? "#7c3aed33" : "transparent",
          color: copied ? "#a78bfa" : "#71717a",
          cursor: "pointer",
          fontSize: "0.75rem",
          whiteSpace: "nowrap",
        }}
      >
        {copied ? t("common.copied") : t("common.copy")}
      </button>
    </div>
  );
}

// ─── PaletteRow ───────────────────────────────────────────────────────────────

function PaletteRow({ colors, title }: { colors: PaletteColor[]; title: string }) {
  return (
    <div>
      <div style={{ ...labelStyle, marginBottom: "0.5rem" }}>{title}</div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {colors.map(({ hex, label }) => (
          <div key={hex} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "8px",
                background: hex,
                border: "1px solid #3f3f46",
              }}
            />
            <span style={{ fontSize: "0.65rem", color: "#71717a" }}>{label}</span>
            <span style={{ fontSize: "0.65rem", color: "#52525b", fontFamily: "monospace" }}>{hex}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ColorsPage() {
  const { t } = useLanguage();
  const [hex, setHex] = useState("#ff5733");
  const [rgb, setRgb] = useState<RGB>({ r: 255, g: 87, b: 51 });
  const [hsl, setHsl] = useState<HSL>({ h: 11, s: 100, l: 60 });
  const [alpha, setAlpha] = useState(100);
  const [hexInput, setHexInput] = useState("#ff5733");

  function updateFromHex(h: string) {
    if (!isValidHex(h)) return;
    const clean = h.startsWith("#") ? h : "#" + h;
    const rgbVal = hexToRgb(clean);
    const hslVal = rgbToHsl(rgbVal);
    setHex(clean);
    setHexInput(clean);
    setRgb(rgbVal);
    setHsl(hslVal);
  }

  function updateFromRgb(r: number, g: number, b: number) {
    const safeRgb = {
      r: Math.max(0, Math.min(255, r)),
      g: Math.max(0, Math.min(255, g)),
      b: Math.max(0, Math.min(255, b)),
    };
    const hexVal = rgbToHex(safeRgb);
    const hslVal = rgbToHsl(safeRgb);
    setRgb(safeRgb);
    setHex(hexVal);
    setHexInput(hexVal);
    setHsl(hslVal);
  }

  function updateFromHsl(h: number, s: number, l: number) {
    const safeHsl = {
      h: Math.max(0, Math.min(360, h)),
      s: Math.max(0, Math.min(100, s)),
      l: Math.max(0, Math.min(100, l)),
    };
    const rgbVal = hslToRgb(safeHsl);
    const hexVal = rgbToHex(rgbVal);
    setHsl(safeHsl);
    setRgb(rgbVal);
    setHex(hexVal);
    setHexInput(hexVal);
  }

  const previewColor =
    alpha < 100
      ? `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha / 100})`
      : hex;

  return (
    <RetroWindow title={t("colors.title")}>
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/" style={{ color: "#71717a", textDecoration: "none", fontSize: "0.875rem" }}>
          {t("common.back")}
        </Link>
      </div>

      <h1
        style={{
          fontWeight: 800,
          fontSize: "1.75rem",
          marginBottom: "1.75rem",
          background: "linear-gradient(135deg,#e879f9,#a21caf)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {t("colors.title")}
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "1.25rem", maxWidth: "900px" }}>

        {/* Preview */}
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: "0.75rem" }}>{t("colors.label.preview")}</div>
          <div
            style={{
              width: "100%",
              height: "120px",
              borderRadius: "10px",
              background: previewColor,
              border: "1px solid #3f3f46",
            }}
          />
          <div style={{ marginTop: "0.75rem" }}>
            <label style={labelStyle}>{t("colors.label.opacity")}: {alpha}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#7c3aed" }}
            />
          </div>
        </div>

        {/* HEX input */}
        <div style={cardStyle}>
          <label style={labelStyle}>HEX</label>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="color"
              value={hex}
              onChange={(e) => updateFromHex(e.target.value)}
              style={{ width: "44px", height: "44px", borderRadius: "8px", border: "none", cursor: "pointer", background: "transparent" }}
            />
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={hexInput}
              onChange={(e) => {
                setHexInput(e.target.value);
                updateFromHex(e.target.value);
              }}
              placeholder="#ff5733"
            />
          </div>

          {/* RGB input */}
          <div style={{ marginTop: "1rem" }}>
            <label style={labelStyle}>RGB</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {(["r", "g", "b"] as const).map((ch) => (
                <div key={ch} style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, textAlign: "center", display: "block" }}>{ch.toUpperCase()}</label>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb[ch]}
                    onChange={(e) =>
                      updateFromRgb(
                        ch === "r" ? Number(e.target.value) : rgb.r,
                        ch === "g" ? Number(e.target.value) : rgb.g,
                        ch === "b" ? Number(e.target.value) : rgb.b
                      )
                    }
                    style={{ ...inputStyle, width: "100%", textAlign: "center" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* HSL input */}
          <div style={{ marginTop: "1rem" }}>
            <label style={labelStyle}>HSL</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[
                { k: "h" as const, lbl: "H°", max: 360 },
                { k: "s" as const, lbl: "S%", max: 100 },
                { k: "l" as const, lbl: "L%", max: 100 },
              ].map(({ k, lbl, max }) => (
                <div key={k} style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, textAlign: "center", display: "block" }}>{lbl}</label>
                  <input
                    type="number"
                    min={0}
                    max={max}
                    value={hsl[k]}
                    onChange={(e) =>
                      updateFromHsl(
                        k === "h" ? Number(e.target.value) : hsl.h,
                        k === "s" ? Number(e.target.value) : hsl.s,
                        k === "l" ? Number(e.target.value) : hsl.l
                      )
                    }
                    style={{ ...inputStyle, width: "100%", textAlign: "center" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CSS output */}
        <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
          <div style={{ ...labelStyle, marginBottom: "0.75rem" }}>{t("colors.label.cssOutput")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <CopyRow label="hex" value={hex} />
            <CopyRow label="rgb" value={toCssRgb(rgb)} />
            <CopyRow label="rgba" value={toCssRgba(rgb, alpha)} />
            <CopyRow label="hsl" value={toCssHsl(hsl)} />
            <CopyRow label="hsla" value={toCssHsla(hsl, alpha)} />
          </div>
        </div>

        {/* Palette suggestions */}
        <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
          <div style={{ ...labelStyle, marginBottom: "1rem" }}>{t("colors.label.paletteSuggestions")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <PaletteRow colors={getComplementary(hex)} title={t("colors.palette.complementary")} />
            <PaletteRow colors={getAnalogous(hex)} title={t("colors.palette.analogous")} />
            <PaletteRow colors={getTriadic(hex)} title={t("colors.palette.triadic")} />
          </div>
        </div>

      </div>

      <p style={{ marginTop: "2rem", color: "#3f3f46", fontSize: "0.8rem" }}>
        {t("common.disclaimer")}
      </p>
    </div>
    </RetroWindow>
  );
}
