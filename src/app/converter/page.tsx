"use client";

import { useState } from "react";
import { ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";
import {
  decimalToBinary,
  decimalToHex,
  decimalToOctal,
  binaryToDecimal,
  hexToDecimal,
  octalToDecimal,
  textToBinary,
  binaryToText,
  ipToBinary,
  QUICK_REF,
} from "@/lib/calculations/converter";

type Bases = { decimal: string; binary: string; hex: string; octal: string };
type CopiedKey = string | null;

function useCopy() {
  const [copied, setCopied] = useState<CopiedKey>(null);
  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };
  return { copied, copy };
}

function CopyBtn({ id, text, copied, copy }: { id: string; text: string; copied: CopiedKey; copy: (k: string, t: string) => void }) {
  if (!text) return null;
  return (
    <button
      onClick={() => copy(id, text)}
      style={{
        background: "none",
        border: "1px solid #3f3f46",
        borderRadius: "0.375rem",
        padding: "0.25rem 0.5rem",
        cursor: "pointer",
        color: copied === id ? "#4ade80" : "#71717a",
        fontSize: "0.75rem",
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        flexShrink: 0,
      }}
    >
      {copied === id ? <Check size={12} /> : <Copy size={12} />}
      {copied === id ? "Copied" : "Copy"}
    </button>
  );
}

const inputBase: React.CSSProperties = {
  width: "100%",
  background: "#27272a",
  border: "1px solid #3f3f46",
  borderRadius: "0.75rem",
  color: "#fafafa",
  padding: "0.75rem 1rem",
  fontSize: "0.95rem",
  fontFamily: "monospace",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#a1a1aa",
  marginBottom: "0.375rem",
  display: "block",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const card: React.CSSProperties = {
  background: "#18181b",
  borderRadius: "1rem",
  border: "1px solid #27272a",
  padding: "1.5rem",
  marginBottom: "1.25rem",
};

export default function ConverterPage() {
  const [vals, setVals] = useState<Bases>({ decimal: "", binary: "", hex: "", octal: "" });
  const [errors, setErrors] = useState<Partial<Bases>>({});

  const [asciiText, setAsciiText] = useState("");
  const [asciiResult, setAsciiResult] = useState("");
  const [binText, setBinText] = useState("");
  const [binResult, setBinResult] = useState("");

  const [ip, setIp] = useState("");
  const [ipResult, setIpResult] = useState<string[] | null>(null);
  const [ipError, setIpError] = useState("");

  const { copied, copy } = useCopy();

  function update(source: keyof Bases, raw: string) {
    const v = raw.trim();
    setErrors({});

    if (v === "") {
      setVals({ decimal: "", binary: "", hex: "", octal: "" });
      return;
    }

    let dec: number;

    if (source === "decimal") {
      dec = parseInt(v, 10);
      if (isNaN(dec) || String(dec) !== v) {
        setErrors({ decimal: "Invalid decimal number" });
        setVals({ ...vals, decimal: raw });
        return;
      }
    } else if (source === "binary") {
      if (!/^[01]+$/.test(v)) {
        setErrors({ binary: "Only 0 and 1 allowed" });
        setVals({ ...vals, binary: raw });
        return;
      }
      dec = binaryToDecimal(v);
    } else if (source === "hex") {
      if (!/^[0-9a-fA-F]+$/.test(v)) {
        setErrors({ hex: "Only 0-9 and A-F allowed" });
        setVals({ ...vals, hex: raw });
        return;
      }
      dec = hexToDecimal(v);
    } else {
      if (!/^[0-7]+$/.test(v)) {
        setErrors({ octal: "Only 0-7 allowed" });
        setVals({ ...vals, octal: raw });
        return;
      }
      dec = octalToDecimal(v);
    }

    if (isNaN(dec)) {
      setErrors({ [source]: "Conversion error" });
      return;
    }

    setVals({
      decimal: source === "decimal" ? v : String(dec),
      binary: decimalToBinary(dec),
      hex: decimalToHex(dec),
      octal: decimalToOctal(dec),
    });
  }

  function handleIp(value: string) {
    setIp(value);
    setIpError("");
    setIpResult(null);
    if (!value.trim()) return;
    const result = ipToBinary(value);
    if (!result) {
      setIpError("Invalid IP address (e.g. 192.168.1.1)");
    } else {
      setIpResult(result.octets);
    }
  }

  const fields: { key: keyof Bases; label: string; placeholder: string }[] = [
    { key: "decimal", label: "Decimal (Base 10)", placeholder: "255" },
    { key: "binary", label: "Binary (Base 2)", placeholder: "11111111" },
    { key: "hex", label: "Hexadecimal (Base 16)", placeholder: "FF" },
    { key: "octal", label: "Octal (Base 8)", placeholder: "377" },
  ];

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
        <Link href="/" style={{ color: "#71717a", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={18} />
        </Link>
        <h1 style={{ fontWeight: 700, fontSize: "1.35rem", color: "#fafafa" }}>Number Base Converter</h1>
      </div>

      {/* 4-way base converter */}
      <div style={card}>
        <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "#a78bfa", marginBottom: "1.25rem" }}>
          Base Conversion
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {fields.map(({ key, label, placeholder }) => {
            const hasError = !!errors[key];
            return (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    type="text"
                    style={{
                      ...inputBase,
                      border: `1px solid ${hasError ? "#f87171" : "#3f3f46"}`,
                      flex: 1,
                    }}
                    placeholder={placeholder}
                    value={vals[key]}
                    onChange={(e) => {
                      setVals({ ...vals, [key]: e.target.value });
                      update(key, e.target.value);
                    }}
                  />
                  <CopyBtn id={`base-${key}`} text={vals[key]} copied={copied} copy={copy} />
                </div>
                {hasError && (
                  <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "0.3rem" }}>{errors[key]}</p>
                )}
              </div>
            );
          })}
        </div>
        <p style={{ color: "#3f3f46", fontSize: "0.75rem", marginTop: "1rem" }}>
          Type in any field — others update automatically
        </p>
      </div>

      {/* ASCII ↔ Binary */}
      <div style={card}>
        <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "#a78bfa", marginBottom: "1.25rem" }}>
          ASCII ↔ Binary
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          <div>
            <label style={labelStyle}>Text → Binary</label>
            <input
              type="text"
              style={inputBase}
              placeholder="Hello"
              value={asciiText}
              onChange={(e) => {
                setAsciiText(e.target.value);
                setAsciiResult(textToBinary(e.target.value));
              }}
            />
            {asciiResult && (
              <div style={{ marginTop: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.7rem", color: "#52525b" }}>8-bit per character</span>
                  <CopyBtn id="ascii-bin" text={asciiResult} copied={copied} copy={copy} />
                </div>
                <div style={{
                  background: "#09090b",
                  border: "1px solid #27272a",
                  borderRadius: "0.5rem",
                  padding: "0.75rem",
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  color: "#a78bfa",
                  wordBreak: "break-all",
                  lineHeight: 1.8,
                }}>
                  {asciiResult}
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Binary → Text</label>
            <input
              type="text"
              style={inputBase}
              placeholder="01001000 01101001"
              value={binText}
              onChange={(e) => {
                setBinText(e.target.value);
                setBinResult(binaryToText(e.target.value));
              }}
            />
            {binText && (
              <div style={{ marginTop: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.7rem", color: "#52525b" }}>Decoded text</span>
                  <CopyBtn id="bin-ascii" text={binResult} copied={copied} copy={copy} />
                </div>
                <div style={{
                  background: "#09090b",
                  border: "1px solid #27272a",
                  borderRadius: "0.5rem",
                  padding: "0.75rem",
                  fontFamily: "monospace",
                  fontSize: "1.1rem",
                  color: binResult ? "#4ade80" : "#f87171",
                  wordBreak: "break-all",
                  minHeight: "2.5rem",
                }}>
                  {binResult || "Invalid binary input"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* IP ↔ Binary */}
      <div style={card}>
        <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "#a78bfa", marginBottom: "1.25rem" }}>
          IP Address → Binary
        </h2>
        <div>
          <label style={labelStyle}>IPv4 Address</label>
          <input
            type="text"
            style={{ ...inputBase, border: `1px solid ${ipError ? "#f87171" : "#3f3f46"}` }}
            placeholder="192.168.1.1"
            value={ip}
            onChange={(e) => handleIp(e.target.value)}
          />
          {ipError && (
            <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "0.3rem" }}>{ipError}</p>
          )}
        </div>
        {ipResult && (
          <div style={{ marginTop: "1rem" }}>
            {ipResult.map((bin, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.5rem 0.75rem",
                background: "#09090b",
                border: "1px solid #27272a",
                borderRadius: "0.5rem",
                marginBottom: "0.5rem",
                fontFamily: "monospace",
              }}>
                <span style={{ color: "#71717a", fontSize: "0.85rem", minWidth: "100px" }}>
                  Octet {i + 1}: <span style={{ color: "#fafafa" }}>{ip.split(".")[i]}</span>
                </span>
                <span style={{ color: "#a78bfa", fontSize: "0.9rem", letterSpacing: "0.1em" }}>{bin}</span>
                <CopyBtn id={`ip-${i}`} text={bin} copied={copied} copy={copy} />
              </div>
            ))}
            <div style={{
              marginTop: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.5rem 0.75rem",
              background: "#1a1a2e",
              border: "1px solid #3f3f46",
              borderRadius: "0.5rem",
            }}>
              <span style={{ color: "#71717a", fontSize: "0.8rem" }}>Full binary:</span>
              <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#c4b5fd" }}>
                {ipResult.join(".")}
              </span>
              <CopyBtn id="ip-full" text={ipResult.join(".")} copied={copied} copy={copy} />
            </div>
          </div>
        )}
      </div>

      {/* Quick Reference Table */}
      <div style={card}>
        <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "#a78bfa", marginBottom: "1.25rem" }}>
          Quick Reference (0–15)
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace", fontSize: "0.85rem" }}>
            <thead>
              <tr>
                {["Dec", "Binary", "Hex", "Oct"].map((h) => (
                  <th key={h} style={{
                    padding: "0.5rem 0.75rem",
                    textAlign: "center",
                    color: "#a1a1aa",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    borderBottom: "1px solid #27272a",
                    letterSpacing: "0.05em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {QUICK_REF.map((row) => (
                <tr key={row.dec} style={{ borderBottom: "1px solid #1c1c1f" }}>
                  <td style={{ padding: "0.4rem 0.75rem", textAlign: "center", color: "#fafafa" }}>{row.dec}</td>
                  <td style={{ padding: "0.4rem 0.75rem", textAlign: "center", color: "#a78bfa" }}>{row.bin}</td>
                  <td style={{ padding: "0.4rem 0.75rem", textAlign: "center", color: "#4ade80" }}>{row.hex}</td>
                  <td style={{ padding: "0.4rem 0.75rem", textAlign: "center", color: "#fb923c" }}>{row.oct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ textAlign: "center", color: "#3f3f46", fontSize: "0.75rem", marginTop: "1rem" }}>
        Results are for informational purposes only.
      </p>
    </div>
  );
}
