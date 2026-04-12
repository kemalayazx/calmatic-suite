"use client";

import { useState } from "react";
import {
  calcBasicProb,
  calcConditional,
  calcDiceProb,
  calcCoinFlips,
  calcBinomial,
  BinomialResult,
} from "@/lib/calculations/probability";

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
  background: active ? "#b45309" : "#1c1c1e",
  color: active ? "#fff" : "#71717a",
  transition: "all 0.15s",
});

function pct(n: number) {
  return (n * 100).toFixed(4) + "%";
}

function Field({ label, value, onChange, suffix }: { label: string; value: string; onChange: (v: string) => void; suffix?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{ fontSize: "0.8rem", color: "#a1a1aa" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)}
          style={{ ...INPUT_STYLE, paddingRight: suffix ? "1.8rem" : undefined }} min="0" />
        {suffix && <span style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#52525b", fontSize: "0.9rem" }}>{suffix}</span>}
      </div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #1c1c1e" }}>
      <span style={{ color: "#a1a1aa", fontSize: "0.875rem" }}>{label}</span>
      <span style={{ color: "#f4f4f5", fontWeight: 700, fontFamily: "monospace" }}>{value}</span>
    </div>
  );
}

// --- Tab 1: Basic Probability ---
function TabBasic() {
  const [pA, setPa] = useState("40");
  const [pB, setPb] = useState("30");
  const [pAB, setPab] = useState("12");
  const [condPB, setCondPB] = useState("30");
  const [result, setResult] = useState<ReturnType<typeof calcBasicProb> | null>(null);
  const [conditional, setConditional] = useState<number | null>(null);

  function calculate() {
    const r = calcBasicProb(parseFloat(pA) || 0, parseFloat(pB) || 0, true);
    setResult(r);
    const c = calcConditional(parseFloat(pAB) || 0, parseFloat(condPB) || 0);
    setConditional(c);
  }

  return (
    <div>
      <p style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "1rem" }}>Independent events</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        <Field label="P(A) %" value={pA} onChange={setPa} suffix="%" />
        <Field label="P(B) %" value={pB} onChange={setPb} suffix="%" />
      </div>
      <p style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "0.5rem" }}>Conditional P(A|B)</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        <Field label="P(A∩B) %" value={pAB} onChange={setPab} suffix="%" />
        <Field label="P(B) %" value={condPB} onChange={setCondPB} suffix="%" />
      </div>
      <button onClick={calculate} style={{ background: "#b45309", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>
        Calculate
      </button>
      {result && (
        <div style={{ background: "#0a0a0b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1rem", marginTop: "1rem" }}>
          <ResultRow label="P(A and B) — Independent" value={pct(result.pAandB)} />
          <ResultRow label="P(A or B)" value={pct(result.pAorB)} />
          <ResultRow label="P(not A)" value={pct(result.pNotA)} />
          {conditional !== null && <ResultRow label="P(A|B) — Conditional" value={pct(conditional)} />}
        </div>
      )}
    </div>
  );
}

// --- Tab 2: Dice & Coins ---
function TabDiceCoin() {
  const [numDice, setNumDice] = useState("2");
  const [diceSum, setDiceSum] = useState("7");
  const [numCoins, setNumCoins] = useState("10");
  const [targetHeads, setTargetHeads] = useState("6");
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [coinResult, setCoinResult] = useState<number | null>(null);

  function calcDice() {
    const n = parseInt(numDice), s = parseInt(diceSum);
    if (isNaN(n) || isNaN(s)) return;
    setDiceResult(calcDiceProb(n, s));
  }

  function calcCoin() {
    const n = parseInt(numCoins), k = parseInt(targetHeads);
    if (isNaN(n) || isNaN(k)) return;
    setCoinResult(calcCoinFlips(n, k));
  }

  return (
    <div>
      <div style={{ background: "#0a0a0b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1rem", marginBottom: "1rem" }}>
        <p style={{ fontWeight: 700, color: "#fbbf24", marginBottom: "0.75rem", fontSize: "0.9rem" }}>Dice Probability</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <Field label="Number of Dice" value={numDice} onChange={setNumDice} />
          <Field label="Target Sum" value={diceSum} onChange={setDiceSum} />
        </div>
        <button onClick={calcDice} style={{ background: "#78350f", color: "#fde68a", border: "1px solid #92400e", borderRadius: "0.5rem", padding: "0.4rem 1rem", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
          Calculate
        </button>
        {diceResult !== null && (
          <div style={{ marginTop: "0.75rem" }}>
            <div style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>P(sum = {diceSum}) with {numDice} dice:</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fbbf24", fontFamily: "monospace" }}>{pct(diceResult)}</div>
            <div style={{ background: "#27272a", height: "8px", borderRadius: "4px", marginTop: "0.5rem" }}>
              <div style={{ width: `${Math.min(diceResult * 100 * 5, 100)}%`, background: "#fbbf24", height: "100%", borderRadius: "4px", transition: "width 0.3s" }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ background: "#0a0a0b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1rem" }}>
        <p style={{ fontWeight: 700, color: "#60a5fa", marginBottom: "0.75rem", fontSize: "0.9rem" }}>Coin Flip Probability</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <Field label="Number of Flips" value={numCoins} onChange={setNumCoins} />
          <Field label="Target Heads" value={targetHeads} onChange={setTargetHeads} />
        </div>
        <button onClick={calcCoin} style={{ background: "#1e3a5f", color: "#93c5fd", border: "1px solid #1e40af", borderRadius: "0.5rem", padding: "0.4rem 1rem", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
          Calculate
        </button>
        {coinResult !== null && (
          <div style={{ marginTop: "0.75rem" }}>
            <div style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>P(exactly {targetHeads} heads in {numCoins} flips):</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#60a5fa", fontFamily: "monospace" }}>{pct(coinResult)}</div>
            <div style={{ background: "#27272a", height: "8px", borderRadius: "4px", marginTop: "0.5rem" }}>
              <div style={{ width: `${Math.min(coinResult * 100 * 10, 100)}%`, background: "#60a5fa", height: "100%", borderRadius: "4px", transition: "width 0.3s" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Tab 3: Binomial Distribution ---
function TabBinomial() {
  const [n, setN] = useState("20");
  const [p, setP] = useState("0.5");
  const [k, setK] = useState("10");
  const [result, setResult] = useState<BinomialResult | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      const nv = parseInt(n), pv = parseFloat(p), kv = parseInt(k);
      if (isNaN(nv) || isNaN(pv) || isNaN(kv)) throw new Error("Enter valid numbers");
      if (pv < 0 || pv > 1) throw new Error("p must be between 0 and 1");
      if (kv < 0 || kv > nv) throw new Error("k must be between 0 and n");
      if (nv > 500) throw new Error("n must be ≤ 500");
      setResult(calcBinomial(nv, pv, kv));
      setError("");
    } catch (e) { setError((e as Error).message); setResult(null); }
  }

  const maxP = result ? Math.max(...result.distribution.map((d) => d.p)) : 1;
  const chartH = 100;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1rem" }}>
        <Field label="n (trials)" value={n} onChange={setN} />
        <Field label="p (success prob)" value={p} onChange={setP} />
        <Field label="k (successes)" value={k} onChange={setK} />
      </div>
      <button onClick={calculate} style={{ background: "#b45309", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>
        Calculate
      </button>
      {error && <p style={{ color: "#f87171", marginTop: "0.5rem", fontSize: "0.85rem" }}>{error}</p>}
      {result && (
        <div style={{ marginTop: "1rem" }}>
          <div style={{ background: "#0a0a0b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1rem", marginBottom: "1rem" }}>
            <ResultRow label={`P(X = ${k})`} value={pct(result.pExactly)} />
            <ResultRow label={`P(X ≤ ${k})`} value={pct(result.pAtMost)} />
            <ResultRow label={`P(X ≥ ${k})`} value={pct(result.pAtLeast)} />
            <ResultRow label="Expected value E(X)" value={result.expected.toFixed(4)} />
            <ResultRow label="Variance" value={result.variance.toFixed(4)} />
            <ResultRow label="Std Deviation" value={result.stdDev.toFixed(4)} />
          </div>

          {/* SVG Bar Chart */}
          <div style={{ overflowX: "auto" }}>
            <p style={{ fontSize: "0.75rem", color: "#52525b", marginBottom: "0.5rem" }}>
              Distribution (n={n}, p={p}) — k={k} highlighted
            </p>
            <svg
              viewBox={`0 0 ${result.distribution.length * 14 + 10} ${chartH + 20}`}
              style={{ width: "100%", minWidth: `${result.distribution.length * 14 + 10}px`, maxWidth: "600px" }}
            >
              {result.distribution.map((d, i) => {
                const barH = maxP > 0 ? (d.p / maxP) * chartH : 0;
                const x = i * 14 + 5;
                const y = chartH - barH;
                const isK = d.k === parseInt(k);
                return (
                  <g key={d.k}>
                    <rect x={x} y={y} width="10" height={barH}
                      fill={isK ? "#fbbf24" : "#374151"} />
                    {(d.k % 5 === 0 || result.distribution.length <= 15) && (
                      <text x={x + 5} y={chartH + 14} textAnchor="middle" fill="#52525b" fontSize="8">{d.k}</text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main ---
export default function ProbabilityPage() {
  const [tab, setTab] = useState<"basic" | "dice" | "binomial">("basic");

  return (
    <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <h1 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 800, color: "#fbbf24", marginBottom: "1.5rem" }}>
        Probability Calculator
      </h1>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button style={TAB_STYLE(tab === "basic")} onClick={() => setTab("basic")}>Basic Probability</button>
        <button style={TAB_STYLE(tab === "dice")} onClick={() => setTab("dice")}>Dice &amp; Coins</button>
        <button style={TAB_STYLE(tab === "binomial")} onClick={() => setTab("binomial")}>Binomial Distribution</button>
      </div>
      <div style={{ background: "#111113", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
        {tab === "basic" && <TabBasic />}
        {tab === "dice" && <TabDiceCoin />}
        {tab === "binomial" && <TabBinomial />}
      </div>
      <p style={{ marginTop: "1.5rem", fontSize: "0.7rem", color: "#3f3f46", textAlign: "center" }}>
        For educational use. Assumes fair, independent random events unless otherwise specified.
      </p>
    </div>
  );
}
