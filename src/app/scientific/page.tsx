"use client";

import { useState, useCallback, useEffect } from "react";
import { computeUnary, safeEvaluate, AngleMode } from "@/lib/calculations/scientific";

const BTN_BASE: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "0.5rem",
  fontSize: "0.85rem",
  fontWeight: 600,
  cursor: "pointer",
  border: "1px solid #27272a",
  padding: "0.6rem 0.25rem",
  transition: "background 0.12s",
  userSelect: "none",
  minHeight: "2.8rem",
};

const BTN_DARK: React.CSSProperties = { ...BTN_BASE, background: "#1c1c1e", color: "#d4d4d8" };
const BTN_MID: React.CSSProperties = { ...BTN_BASE, background: "#27272a", color: "#a1a1aa" };
const BTN_FUNC: React.CSSProperties = { ...BTN_BASE, background: "#1e293b", color: "#7dd3fc" };
const BTN_OP: React.CSSProperties = { ...BTN_BASE, background: "#3b1f7d", color: "#c4b5fd" };
const BTN_EQ: React.CSSProperties = { ...BTN_BASE, background: "#7c3aed", color: "#fff", fontSize: "1.1rem" };
const BTN_MEM: React.CSSProperties = { ...BTN_BASE, background: "#1e3a2f", color: "#86efac", fontSize: "0.75rem" };

type BtnDef = {
  label: string;
  action: string;
  style?: React.CSSProperties;
  span?: number;
};

export default function ScientificPage() {
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState("");
  const [mode, setMode] = useState<AngleMode>("deg");
  const [memory, setMemory] = useState(0);
  const [newNum, setNewNum] = useState(true);
  const [error, setError] = useState(false);

  const pushChar = useCallback((ch: string) => {
    setError(false);
    setDisplay((prev) => {
      if (newNum) {
        setNewNum(false);
        if ("0123456789.".includes(ch)) return ch === "." ? "0." : ch;
        return prev + ch;
      }
      if (ch === "." && prev.split(/[\+\-\*\/\(]/).pop()?.includes(".")) return prev;
      if (prev === "0" && "0123456789".includes(ch)) return ch;
      return prev + ch;
    });
  }, [newNum]);

  const handleAction = useCallback((action: string) => {
    setError(false);
    // direct char inserts
    if (["+", "-", "*", "/", "(", ")", ".", "0","1","2","3","4","5","6","7","8","9"].includes(action)) {
      pushChar(action);
      return;
    }
    if (action === "pi") { pushChar("π"); return; }
    if (action === "e_const") { pushChar("e"); return; }
    if (action === "^") { pushChar("^"); return; }
    if (action === "mod") { pushChar(" mod "); return; }
    if (action === "percent") {
      setDisplay((prev) => {
        try { return String(safeEvaluate(prev) / 100); } catch { setError(true); return prev; }
      });
      setNewNum(true);
      return;
    }

    if (action === "clear") {
      setDisplay("0"); setHistory(""); setNewNum(true); return;
    }
    if (action === "backspace") {
      setDisplay((prev) => {
        if (prev.length <= 1 || error) return "0";
        const trimmed = prev.trimEnd();
        if (trimmed.endsWith(" mod")) return prev.slice(0, -5);
        return prev.slice(0, -1);
      });
      return;
    }
    if (action === "equals") {
      try {
        const expr = display.replace(/π/g, "pi").replace(/e/g, "e");
        const result = safeEvaluate(display);
        setHistory(display + " =");
        setDisplay(String(result));
        setNewNum(true);
      } catch {
        setHistory(display);
        setDisplay("Error");
        setError(true);
        setNewNum(true);
      }
      return;
    }
    // Trig / math unary functions
    const unaryFns = ["sin","cos","tan","asin","acos","atan","log","ln","ex","10x","sqrt","x2","inv","neg","abs","factorial"];
    if (unaryFns.includes(action)) {
      try {
        const val = safeEvaluate(display);
        const result = computeUnary(action, val, mode);
        setHistory(action + "(" + display + ") =");
        setDisplay(String(result));
        setNewNum(true);
      } catch {
        setDisplay("Error");
        setError(true);
        setNewNum(true);
      }
      return;
    }
    // Memory
    if (action === "MS") { try { setMemory(safeEvaluate(display)); setNewNum(true); } catch { /**/ } return; }
    if (action === "MR") { setDisplay(String(memory)); setNewNum(false); return; }
    if (action === "MC") { setMemory(0); return; }
    if (action === "Mplus") { try { setMemory((m) => m + safeEvaluate(display)); setNewNum(true); } catch { /**/ } return; }
  }, [display, mode, memory, error, pushChar]);

  // Keyboard support
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") handleAction(e.key);
      else if (e.key === ".") handleAction(".");
      else if (e.key === "+") handleAction("+");
      else if (e.key === "-") handleAction("-");
      else if (e.key === "*") handleAction("*");
      else if (e.key === "/") { e.preventDefault(); handleAction("/"); }
      else if (e.key === "(" ) handleAction("(");
      else if (e.key === ")") handleAction(")");
      else if (e.key === "Enter" || e.key === "=") handleAction("equals");
      else if (e.key === "Backspace") handleAction("backspace");
      else if (e.key === "Escape") handleAction("clear");
      else if (e.key === "%") handleAction("percent");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleAction]);

  const rows: BtnDef[][] = [
    // Row 0 — memory
    [
      { label: "MC", action: "MC", style: BTN_MEM },
      { label: "MR", action: "MR", style: BTN_MEM },
      { label: "MS", action: "MS", style: BTN_MEM },
      { label: "M+", action: "Mplus", style: BTN_MEM },
      { label: mode === "deg" ? "DEG" : "RAD", action: "toggleMode", style: { ...BTN_MEM, color: "#fde68a", borderColor: "#ca8a04" } },
    ],
    // Row 1 — scientific functions
    [
      { label: "sin", action: "sin", style: BTN_FUNC },
      { label: "cos", action: "cos", style: BTN_FUNC },
      { label: "tan", action: "tan", style: BTN_FUNC },
      { label: "log", action: "log", style: BTN_FUNC },
      { label: "ln", action: "ln", style: BTN_FUNC },
    ],
    [
      { label: "asin", action: "asin", style: BTN_FUNC },
      { label: "acos", action: "acos", style: BTN_FUNC },
      { label: "atan", action: "atan", style: BTN_FUNC },
      { label: "eˣ", action: "ex", style: BTN_FUNC },
      { label: "10ˣ", action: "10x", style: BTN_FUNC },
    ],
    [
      { label: "x²", action: "x2", style: BTN_FUNC },
      { label: "√", action: "sqrt", style: BTN_FUNC },
      { label: "1/x", action: "inv", style: BTN_FUNC },
      { label: "|x|", action: "abs", style: BTN_FUNC },
      { label: "n!", action: "factorial", style: BTN_FUNC },
    ],
    [
      { label: "π", action: "pi", style: BTN_FUNC },
      { label: "e", action: "e_const", style: BTN_FUNC },
      { label: "(", action: "(", style: BTN_MID },
      { label: ")", action: ")", style: BTN_MID },
      { label: "mod", action: "mod", style: BTN_FUNC },
    ],
    // Row — standard
    [
      { label: "C", action: "clear", style: { ...BTN_MID, color: "#f87171" } },
      { label: "⌫", action: "backspace", style: BTN_MID },
      { label: "^", action: "^", style: BTN_OP },
      { label: "÷", action: "/", style: BTN_OP },
    ],
    [
      { label: "7", action: "7", style: BTN_DARK },
      { label: "8", action: "8", style: BTN_DARK },
      { label: "9", action: "9", style: BTN_DARK },
      { label: "×", action: "*", style: BTN_OP },
    ],
    [
      { label: "4", action: "4", style: BTN_DARK },
      { label: "5", action: "5", style: BTN_DARK },
      { label: "6", action: "6", style: BTN_DARK },
      { label: "−", action: "-", style: BTN_OP },
    ],
    [
      { label: "1", action: "1", style: BTN_DARK },
      { label: "2", action: "2", style: BTN_DARK },
      { label: "3", action: "3", style: BTN_DARK },
      { label: "+", action: "+", style: BTN_OP },
    ],
    [
      { label: "+/−", action: "neg", style: BTN_DARK },
      { label: "0", action: "0", style: BTN_DARK },
      { label: ".", action: ".", style: BTN_DARK },
      { label: "=", action: "equals", style: BTN_EQ },
    ],
  ];

  return (
    <div style={{ maxWidth: "28rem", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <h1 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 800, color: "#a78bfa", marginBottom: "1.5rem" }}>
        Scientific Calculator
      </h1>

      {/* Display */}
      <div style={{ background: "#0a0a0b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1rem 1.25rem", marginBottom: "1rem" }}>
        <div style={{ fontSize: "0.75rem", color: "#52525b", minHeight: "1.2rem", textAlign: "right", marginBottom: "0.25rem", fontFamily: "monospace" }}>
          {history}
        </div>
        <div
          style={{
            fontSize: display.length > 16 ? "1.2rem" : display.length > 10 ? "1.6rem" : "2.2rem",
            fontWeight: 700,
            color: error ? "#f87171" : "#f4f4f5",
            textAlign: "right",
            fontFamily: "monospace",
            wordBreak: "break-all",
            minHeight: "2.8rem",
          }}
        >
          {display}
        </div>
        {memory !== 0 && (
          <div style={{ fontSize: "0.7rem", color: "#86efac", textAlign: "right", marginTop: "0.25rem" }}>
            M = {memory}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: "grid", gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: "0.35rem" }}>
            {row.map((btn) => (
              <button
                key={btn.action}
                style={{ ...btn.style, gridColumn: btn.span ? `span ${btn.span}` : undefined }}
                onClick={() => {
                  if (btn.action === "toggleMode") {
                    setMode((m) => m === "deg" ? "rad" : "deg");
                  } else {
                    handleAction(btn.action);
                  }
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "0.8";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p style={{ marginTop: "1.5rem", fontSize: "0.7rem", color: "#3f3f46", textAlign: "center" }}>
        For educational use. Verify results independently for critical applications.
      </p>
    </div>
  );
}
