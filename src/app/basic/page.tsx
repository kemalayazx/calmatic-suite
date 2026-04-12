"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Delete } from "lucide-react";
import Link from "next/link";
import { calculate, formatDisplay, sqrt, square, percentage, negate } from "@/lib/calculations/basic";
import type { Operation } from "@/lib/calculations/basic";

const BUTTONS = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "√", "x²"],
  ["⌫", "", "", "="],
];

function getBtnStyle(label: string): React.CSSProperties {
  const base: React.CSSProperties = {
    borderRadius: "0.75rem",
    fontSize: label === "0" ? "1.25rem" : "1.1rem",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    transition: "all 0.12s",
    width: "100%",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  if (label === "=") return { ...base, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff" };
  if (label === "C") return { ...base, background: "#7f1d1d", color: "#fff" };
  if (["÷", "×", "−", "+"].includes(label)) return { ...base, background: "#5b21b6", color: "#fff" };
  if (["√", "x²", "⌫", "±", "%"].includes(label)) return { ...base, background: "#3f3f46", color: "#d4d4d8" };
  return { ...base, background: "#27272a", color: "#fafafa" };
}

export default function BasicPage() {
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState("");
  const [stored, setStored] = useState<number | null>(null);
  const [op, setOp] = useState<Operation>(null);
  const [waitingNext, setWaitingNext] = useState(false);

  const handleBtn = useCallback((label: string) => {
    if (label === "") return;

    if (label === "C") {
      setDisplay("0"); setHistory(""); setStored(null); setOp(null); setWaitingNext(false);
      return;
    }

    if (label === "⌫") {
      setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : "0"));
      return;
    }

    if (label === "±") {
      setDisplay((d) => String(negate(parseFloat(d) || 0)));
      return;
    }

    if (label === "%") {
      setDisplay((d) => String(percentage(parseFloat(d) || 0)));
      return;
    }

    if (label === "√") {
      const val = sqrt(parseFloat(display) || 0);
      setDisplay(formatDisplay(String(val)));
      setWaitingNext(true);
      return;
    }

    if (label === "x²") {
      const val = square(parseFloat(display) || 0);
      setDisplay(formatDisplay(String(val)));
      setWaitingNext(true);
      return;
    }

    if (["÷", "×", "−", "+"].includes(label)) {
      const opMap: Record<string, Operation> = { "÷": "/", "×": "*", "−": "-", "+": "+" };
      const current = parseFloat(display);
      if (stored !== null && op && !waitingNext) {
        const result = calculate(stored, current, op);
        const formatted = formatDisplay(String(result));
        setHistory(`${formatted} ${label}`);
        setDisplay(formatted);
        setStored(result);
      } else {
        setHistory(`${display} ${label}`);
        setStored(current);
      }
      setOp(opMap[label]);
      setWaitingNext(true);
      return;
    }

    if (label === "=") {
      if (stored !== null && op) {
        const current = parseFloat(display);
        const result = calculate(stored, current, op);
        setHistory(`${stored} ${op} ${current} =`);
        setDisplay(formatDisplay(String(result)));
        setStored(null);
        setOp(null);
        setWaitingNext(true);
      }
      return;
    }

    // digit or dot
    if (label === "." && display.includes(".") && !waitingNext) return;
    if (waitingNext) {
      setDisplay(label === "." ? "0." : label);
      setWaitingNext(false);
    } else {
      setDisplay((d) => (d === "0" && label !== "." ? label : d + label));
    }
  }, [display, stored, op, waitingNext]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, string> = {
        "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
        "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
        ".": ".", "+": "+", "-": "−", "*": "×", "/": "÷",
        "Enter": "=", "=": "=", "Backspace": "⌫", "Escape": "C",
        "%": "%",
      };
      if (map[e.key]) { e.preventDefault(); handleBtn(map[e.key]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleBtn]);

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <Link href="/" style={{ color: "#71717a", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={18} />
        </Link>
        <h1 style={{ fontWeight: 700, fontSize: "1.25rem", color: "#fafafa" }}>Basic Calculator</h1>
      </div>

      {/* Display */}
      <div
        style={{
          borderRadius: "1rem",
          border: "1px solid #27272a",
          background: "#18181b",
          padding: "1.25rem 1.5rem",
          marginBottom: "1rem",
          textAlign: "right",
        }}
      >
        <div style={{ fontSize: "0.8rem", color: "#52525b", minHeight: "1.25rem", marginBottom: "0.5rem", fontFamily: "monospace" }}>
          {history || " "}
        </div>
        <div
          style={{
            fontFamily: "monospace",
            fontWeight: 700,
            fontSize: display.length > 12 ? "1.5rem" : display.length > 9 ? "2rem" : "2.75rem",
            color: "#fafafa",
            wordBreak: "break-all",
          }}
        >
          {display}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
        {BUTTONS.flat().map((label, idx) => {
          if (label === "") return <div key={idx} />;
          return (
            <button
              key={idx}
              onClick={() => handleBtn(label)}
              style={getBtnStyle(label)}
              onMouseOver={(e) => {
                const el = e.currentTarget;
                el.style.filter = "brightness(1.2)";
                el.style.transform = "scale(1.04)";
              }}
              onMouseOut={(e) => {
                const el = e.currentTarget;
                el.style.filter = "";
                el.style.transform = "";
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1.04)"; }}
            >
              {label === "⌫" ? <Delete size={18} /> : label}
            </button>
          );
        })}
      </div>

      <p style={{ textAlign: "center", color: "#3f3f46", fontSize: "0.75rem", marginTop: "1rem" }}>
        Keyboard supported · For informational use only
      </p>
    </div>
  );
}
