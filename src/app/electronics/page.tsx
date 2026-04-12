"use client";

import { useState } from "react";
import {
  ohmFromVI,
  ohmFromVR,
  ohmFromIR,
  COLOR_BANDS,
  resistorColorCode,
  seriesResistance,
  parallelResistance,
  ledResistor,
  nearestE12,
  rcCircuit,
  rlCircuit,
  powerRatioToDb,
  dbToPowerRatio,
  voltageRatioToDb,
  dbToVoltageRatio,
} from "@/lib/calculations/electronics";

const TABS = ["Ohm's Law", "Resistance", "LED", "RC/RL", "dB Converter"];

const card: React.CSSProperties = {
  background: "rgba(24,24,27,0.7)",
  border: "1px solid #27272a",
  borderRadius: "0.875rem",
  padding: "1.5rem",
  marginBottom: "1.25rem",
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  color: "#a1a1aa",
  marginBottom: "0.35rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const input: React.CSSProperties = {
  width: "100%",
  background: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "0.5rem",
  padding: "0.625rem 0.875rem",
  color: "#fafafa",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
};

const select: React.CSSProperties = {
  ...input,
  cursor: "pointer",
};

const resultRow = (label: string, value: string) => (
  <div
    key={label}
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "0.5rem 0",
      borderBottom: "1px solid #27272a",
      fontSize: "0.875rem",
    }}
  >
    <span style={{ color: "#a1a1aa" }}>{label}</span>
    <span style={{ color: "#fafafa", fontWeight: 600, fontFamily: "monospace" }}>{value}</span>
  </div>
);

function fmt(n: number, unit = "", decimals = 4): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: decimals }) + (unit ? " " + unit : "");
}

// ─── Tab 1: Ohm's Law ─────────────────────────────────────────────────────────

function OhmTab() {
  const [V, setV] = useState("");
  const [I, setI] = useState("");
  const [R, setR] = useState("");

  const filled = [V, I, R].filter((v) => v !== "").length;
  let result = null;

  if (filled === 2) {
    const v = parseFloat(V);
    const i = parseFloat(I);
    const r = parseFloat(R);
    if (!isNaN(v) && !isNaN(i) && V !== "" && I !== "") result = ohmFromVI(v, i);
    else if (!isNaN(v) && !isNaN(r) && V !== "" && R !== "") result = ohmFromVR(v, r);
    else if (!isNaN(i) && !isNaN(r) && I !== "" && R !== "") result = ohmFromIR(i, r);
  }

  return (
    <div>
      <div style={card}>
        <div style={{ background: "#27272a", borderRadius: "0.5rem", padding: "0.875rem 1.25rem", marginBottom: "1.25rem", textAlign: "center" }}>
          <span style={{ fontFamily: "monospace", fontSize: "1rem", color: "#a78bfa" }}>V = I × R</span>
          <span style={{ margin: "0 1rem", color: "#3f3f46" }}>|</span>
          <span style={{ fontFamily: "monospace", fontSize: "1rem", color: "#34d399" }}>P = V × I</span>
          <span style={{ margin: "0 1rem", color: "#3f3f46" }}>|</span>
          <span style={{ fontFamily: "monospace", fontSize: "1rem", color: "#fbbf24" }}>P = I² × R</span>
        </div>
        <p style={{ fontSize: "0.8rem", color: "#52525b", marginBottom: "1rem" }}>Fill any two fields — third is calculated automatically.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={label}>Voltage (V)</label>
            <input type="number" min="0" style={input} value={V} placeholder="e.g. 12"
              onChange={(e) => setV(e.target.value)} />
          </div>
          <div>
            <label style={label}>Current (A)</label>
            <input type="number" min="0" style={input} value={I} placeholder="e.g. 0.5"
              onChange={(e) => setI(e.target.value)} />
          </div>
          <div>
            <label style={label}>Resistance (Ω)</label>
            <input type="number" min="0" style={input} value={R} placeholder="e.g. 24"
              onChange={(e) => setR(e.target.value)} />
          </div>
        </div>
      </div>
      {result && (
        <div style={card}>
          <h3 style={{ color: "#a78bfa", fontWeight: 700, marginBottom: "1rem" }}>Results</h3>
          {resultRow("Voltage (V)", fmt(result.voltage, "V"))}
          {resultRow("Current (I)", fmt(result.current, "A"))}
          {resultRow("Resistance (R)", fmt(result.resistance, "Ω"))}
          {resultRow("Power (P = V×I)", fmt(result.power, "W"))}
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: Resistance ────────────────────────────────────────────────────────

const COLOR_OPTIONS = COLOR_BANDS.map((c) => c.name);
const DIGIT_COLORS = COLOR_BANDS.filter((c) => c.value !== null).map((c) => c.name);
const MULT_COLORS = COLOR_BANDS.map((c) => c.name);
const TOL_COLORS = COLOR_BANDS.filter((c) => c.tolerance !== null).map((c) => c.name);

function ResistanceTab() {
  const [bands, setBands] = useState(4);
  const [b1, setB1] = useState("Brown");
  const [b2, setB2] = useState("Black");
  const [b3, setB3] = useState("Black");
  const [mult, setMult] = useState("Brown");
  const [tol, setTol] = useState("Gold");
  const [seriesVals, setSeriesVals] = useState(["100", "220"]);
  const [parallelVals, setParallelVals] = useState(["100", "220"]);

  const colorResult = resistorColorCode(b1, b2, bands === 5 ? b3 : null, mult, tol);
  const seriesNums = seriesVals.map((v) => parseFloat(v)).filter((v) => !isNaN(v) && v > 0);
  const parallelNums = parallelVals.map((v) => parseFloat(v)).filter((v) => !isNaN(v) && v > 0);

  const colorStyle = (name: string) => {
    const c: Record<string, string> = {
      Black: "#000", Brown: "#92400e", Red: "#dc2626", Orange: "#ea580c",
      Yellow: "#facc15", Green: "#16a34a", Blue: "#2563eb", Violet: "#7c3aed",
      Grey: "#9ca3af", White: "#f9fafb", Gold: "#d97706", Silver: "#9ca3af",
    };
    return c[name] || "#555";
  };

  return (
    <div>
      {/* Color Code */}
      <div style={card}>
        <h3 style={{ color: "#fafafa", fontWeight: 700, marginBottom: "1rem" }}>Color Code Decoder</h3>
        <div style={{ marginBottom: "1rem", display: "flex", gap: "0.75rem" }}>
          <button onClick={() => setBands(4)} style={{ padding: "0.375rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", background: bands === 4 ? "#7c3aed" : "#27272a", color: "#fafafa", fontSize: "0.8rem" }}>4 Band</button>
          <button onClick={() => setBands(5)} style={{ padding: "0.375rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", background: bands === 5 ? "#7c3aed" : "#27272a", color: "#fafafa", fontSize: "0.8rem" }}>5 Band</button>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {[
            { lbl: "Band 1", val: b1, set: setB1, opts: DIGIT_COLORS },
            { lbl: "Band 2", val: b2, set: setB2, opts: DIGIT_COLORS },
            ...(bands === 5 ? [{ lbl: "Band 3", val: b3, set: setB3, opts: DIGIT_COLORS }] : []),
            { lbl: "Multiplier", val: mult, set: setMult, opts: MULT_COLORS },
            { lbl: "Tolerance", val: tol, set: setTol, opts: TOL_COLORS },
          ].map(({ lbl, val, set, opts }) => (
            <div key={lbl} style={{ flex: "1 1 120px" }}>
              <label style={label}>{lbl}</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "12px", height: "12px", borderRadius: "50%", background: colorStyle(val), border: "1px solid #555", zIndex: 1 }} />
                <select value={val} onChange={(e) => set(e.target.value)} style={{ ...select, paddingLeft: "2rem" }}>
                  {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: "#27272a", borderRadius: "0.5rem", padding: "0.875rem 1.25rem" }}>
          <span style={{ color: "#a78bfa", fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 700 }}>{colorResult.formatted}</span>
          {colorResult.tolerance !== null && <span style={{ color: "#71717a", marginLeft: "1rem", fontSize: "0.875rem" }}>± {colorResult.tolerance}%</span>}
        </div>
      </div>

      {/* Series */}
      <div style={card}>
        <h3 style={{ color: "#fafafa", fontWeight: 700, marginBottom: "1rem" }}>Series Connection</h3>
        <p style={{ fontFamily: "monospace", color: "#71717a", fontSize: "0.85rem", marginBottom: "1rem" }}>R_total = R1 + R2 + ...</p>
        {seriesVals.map((v, i) => (
          <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <input type="number" min="0" style={{ ...input, width: "160px" }} value={v} placeholder={`R${i + 1} (Ω)`}
              onChange={(e) => { const n = [...seriesVals]; n[i] = e.target.value; setSeriesVals(n); }} />
            {seriesVals.length > 2 && (
              <button onClick={() => setSeriesVals(seriesVals.filter((_, j) => j !== i))} style={{ padding: "0 0.75rem", background: "#27272a", border: "none", borderRadius: "0.5rem", color: "#ef4444", cursor: "pointer" }}>×</button>
            )}
          </div>
        ))}
        <button onClick={() => setSeriesVals([...seriesVals, ""])} style={{ padding: "0.375rem 0.875rem", background: "#27272a", border: "none", borderRadius: "0.5rem", color: "#a78bfa", cursor: "pointer", fontSize: "0.8rem", marginBottom: "1rem" }}>+ Add Resistor</button>
        {seriesNums.length > 0 && resultRow("Total Resistance", fmt(seriesResistance(seriesNums), "Ω"))}
      </div>

      {/* Parallel */}
      <div style={card}>
        <h3 style={{ color: "#fafafa", fontWeight: 700, marginBottom: "1rem" }}>Parallel Connection</h3>
        <p style={{ fontFamily: "monospace", color: "#71717a", fontSize: "0.85rem", marginBottom: "1rem" }}>1/R_total = 1/R1 + 1/R2 + ...</p>
        {parallelVals.map((v, i) => (
          <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <input type="number" min="0" style={{ ...input, width: "160px" }} value={v} placeholder={`R${i + 1} (Ω)`}
              onChange={(e) => { const n = [...parallelVals]; n[i] = e.target.value; setParallelVals(n); }} />
            {parallelVals.length > 2 && (
              <button onClick={() => setParallelVals(parallelVals.filter((_, j) => j !== i))} style={{ padding: "0 0.75rem", background: "#27272a", border: "none", borderRadius: "0.5rem", color: "#ef4444", cursor: "pointer" }}>×</button>
            )}
          </div>
        ))}
        <button onClick={() => setParallelVals([...parallelVals, ""])} style={{ padding: "0.375rem 0.875rem", background: "#27272a", border: "none", borderRadius: "0.5rem", color: "#a78bfa", cursor: "pointer", fontSize: "0.8rem", marginBottom: "1rem" }}>+ Add Resistor</button>
        {parallelNums.length > 0 && resultRow("Total Resistance", fmt(parallelResistance(parallelNums), "Ω"))}
      </div>
    </div>
  );
}

// ─── Tab 3: LED ───────────────────────────────────────────────────────────────

function LEDTab() {
  const [supply, setSupply] = useState("5");
  const [forward, setForward] = useState("2");
  const [current, setCurrent] = useState("20");

  const sv = parseFloat(supply);
  const fv = parseFloat(forward);
  const cv = parseFloat(current);
  const valid = sv > 0 && fv > 0 && cv > 0 && sv > fv;
  const result = valid ? ledResistor(sv, fv, cv) : null;

  return (
    <div style={card}>
      <h3 style={{ color: "#fafafa", fontWeight: 700, marginBottom: "1rem" }}>LED Series Resistor Calculator</h3>
      <p style={{ fontFamily: "monospace", color: "#71717a", fontSize: "0.85rem", marginBottom: "1.25rem" }}>R = (Vsupply − Vforward) / I</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <label style={label}>Supply Voltage (V)</label>
          <input type="number" min="0" max="1000" style={input} value={supply} onChange={(e) => setSupply(e.target.value)} />
        </div>
        <div>
          <label style={label}>LED Forward Voltage (V)</label>
          <input type="number" min="0" max="100" step="0.1" style={input} value={forward} onChange={(e) => setForward(e.target.value)} />
        </div>
        <div>
          <label style={label}>Desired Current (mA)</label>
          <input type="number" min="0" max="1000" style={input} value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
      </div>
      {!valid && sv > 0 && fv >= sv && (
        <p style={{ color: "#ef4444", fontSize: "0.8rem" }}>Supply voltage must be greater than forward voltage.</p>
      )}
      {result && (
        <>
          {resultRow("Calculated Resistor", fmt(result.resistorOhm, "Ω"))}
          {resultRow("Nearest E12 Standard Value", fmt(result.nearestStandard, "Ω"))}
          {resultRow("Power Dissipation", fmt(result.powerDissipation * 1000, "mW"))}
        </>
      )}
    </div>
  );
}

// ─── Tab 4: RC/RL ─────────────────────────────────────────────────────────────

function RCRLTab() {
  const [mode, setMode] = useState<"RC" | "RL">("RC");
  const [R, setR] = useState("1000");
  const [C, setC] = useState("0.000001"); // 1µF
  const [L, setL] = useState("0.001");    // 1mH

  const rv = parseFloat(R);
  const cv = parseFloat(C);
  const lv = parseFloat(L);

  const rcResult = mode === "RC" && rv > 0 && cv > 0 ? rcCircuit(rv, cv) : null;
  const rlResult = mode === "RL" && rv > 0 && lv > 0 ? rlCircuit(rv, lv) : null;

  return (
    <div>
      <div style={card}>
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <button onClick={() => setMode("RC")} style={{ padding: "0.375rem 1.25rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", background: mode === "RC" ? "#7c3aed" : "#27272a", color: "#fafafa" }}>RC Circuit</button>
          <button onClick={() => setMode("RL")} style={{ padding: "0.375rem 1.25rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", background: mode === "RL" ? "#7c3aed" : "#27272a", color: "#fafafa" }}>RL Circuit</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <label style={label}>Resistance R (Ω)</label>
            <input type="number" min="0" style={input} value={R} onChange={(e) => setR(e.target.value)} />
          </div>
          {mode === "RC" ? (
            <div>
              <label style={label}>Capacitance C (F)</label>
              <input type="number" min="0" step="0.000001" style={input} value={C} onChange={(e) => setC(e.target.value)} />
              <p style={{ fontSize: "0.7rem", color: "#52525b", marginTop: "0.25rem" }}>e.g. 1µF = 0.000001</p>
            </div>
          ) : (
            <div>
              <label style={label}>Inductance L (H)</label>
              <input type="number" min="0" step="0.001" style={input} value={L} onChange={(e) => setL(e.target.value)} />
              <p style={{ fontSize: "0.7rem", color: "#52525b", marginTop: "0.25rem" }}>e.g. 1mH = 0.001</p>
            </div>
          )}
        </div>
        {rcResult && (
          <>
            <div style={{ background: "#27272a", borderRadius: "0.5rem", padding: "0.5rem 1rem", marginBottom: "0.75rem", fontFamily: "monospace", fontSize: "0.85rem", color: "#a78bfa" }}>τ = R × C</div>
            {resultRow("Time Constant (τ)", fmt(rcResult.tau, "s"))}
            {resultRow("63.2% Charge Time (1τ)", fmt(rcResult.tau, "s"))}
            {resultRow("Half Charge Time (0.693τ)", fmt(rcResult.halfChargeTime, "s"))}
            {resultRow("Cutoff Frequency (fc)", fmt(rcResult.cutoffFrequency, "Hz"))}
          </>
        )}
        {rlResult && (
          <>
            <div style={{ background: "#27272a", borderRadius: "0.5rem", padding: "0.5rem 1rem", marginBottom: "0.75rem", fontFamily: "monospace", fontSize: "0.85rem", color: "#a78bfa" }}>τ = L / R</div>
            {resultRow("Time Constant (τ)", fmt(rlResult.tau, "s"))}
            {resultRow("Cutoff Frequency (fc)", fmt(rlResult.cutoffFrequency, "Hz"))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Tab 5: dB Converter ─────────────────────────────────────────────────────

function DbTab() {
  const [mode, setMode] = useState<"power" | "voltage">("power");
  const [direction, setDirection] = useState<"ratioToDb" | "dbToRatio">("ratioToDb");
  const [val, setVal] = useState("");

  const num = parseFloat(val);
  let result: number | null = null;
  if (!isNaN(num) && num > 0) {
    if (mode === "power") {
      result = direction === "ratioToDb" ? powerRatioToDb(num) : dbToPowerRatio(num);
    } else {
      result = direction === "ratioToDb" ? voltageRatioToDb(num) : dbToVoltageRatio(num);
    }
  }

  const inputLabel = direction === "ratioToDb" ? "Ratio (dimensionless)" : "dB value";
  const outputLabel = direction === "ratioToDb" ? "dB" : "Ratio";
  const formula = mode === "power"
    ? (direction === "ratioToDb" ? "dB = 10 × log₁₀(P₂/P₁)" : "P₂/P₁ = 10^(dB/10)")
    : (direction === "ratioToDb" ? "dB = 20 × log₁₀(V₂/V₁)" : "V₂/V₁ = 10^(dB/20)");

  return (
    <div style={card}>
      <h3 style={{ color: "#fafafa", fontWeight: 700, marginBottom: "1rem" }}>dB Converter</h3>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <button onClick={() => setMode("power")} style={{ padding: "0.375rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", background: mode === "power" ? "#7c3aed" : "#27272a", color: "#fafafa", fontSize: "0.85rem" }}>Power Ratio</button>
        <button onClick={() => setMode("voltage")} style={{ padding: "0.375rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", background: mode === "voltage" ? "#7c3aed" : "#27272a", color: "#fafafa", fontSize: "0.85rem" }}>Voltage Ratio</button>
        <span style={{ display: "flex", alignItems: "center", color: "#3f3f46", margin: "0 0.25rem" }}>|</span>
        <button onClick={() => setDirection("ratioToDb")} style={{ padding: "0.375rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", background: direction === "ratioToDb" ? "#0891b2" : "#27272a", color: "#fafafa", fontSize: "0.85rem" }}>Ratio → dB</button>
        <button onClick={() => setDirection("dbToRatio")} style={{ padding: "0.375rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", background: direction === "dbToRatio" ? "#0891b2" : "#27272a", color: "#fafafa", fontSize: "0.85rem" }}>dB → Ratio</button>
      </div>
      <div style={{ background: "#27272a", borderRadius: "0.5rem", padding: "0.5rem 1rem", marginBottom: "1.25rem", fontFamily: "monospace", fontSize: "0.85rem", color: "#a78bfa" }}>{formula}</div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={label}>{inputLabel}</label>
        <input type="number" min="0" style={{ ...input, maxWidth: "280px" }} value={val} onChange={(e) => setVal(e.target.value)} placeholder="Enter value" />
      </div>
      {result !== null && isFinite(result) && (
        <div style={{ background: "#27272a", borderRadius: "0.5rem", padding: "0.875rem 1.25rem" }}>
          <span style={{ color: "#a1a1aa", fontSize: "0.85rem" }}>{outputLabel}: </span>
          <span style={{ color: "#34d399", fontFamily: "monospace", fontWeight: 700, fontSize: "1.1rem" }}>
            {fmt(result, direction === "ratioToDb" ? "dB" : "")}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ElectronicsPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontWeight: 800, fontSize: "1.75rem", color: "#fafafa", marginBottom: "0.5rem" }}>Electronics Calculator</h1>
        <p style={{ color: "#71717a", fontSize: "0.9rem" }}>Ohm&apos;s Law, resistor color code, LED, RC/RL circuits, dB conversions</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "2rem", borderBottom: "1px solid #27272a", paddingBottom: "0" }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "0.625rem 1.125rem",
              border: "none",
              borderBottom: activeTab === i ? "2px solid #a78bfa" : "2px solid transparent",
              background: "transparent",
              color: activeTab === i ? "#a78bfa" : "#71717a",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: activeTab === i ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && <OhmTab />}
      {activeTab === 1 && <ResistanceTab />}
      {activeTab === 2 && <LEDTab />}
      {activeTab === 3 && <RCRLTab />}
      {activeTab === 4 && <DbTab />}

      <p style={{ textAlign: "center", color: "#52525b", fontSize: "0.75rem", marginTop: "2rem" }}>
        Results are for informational purposes only. Consult a professional for official calculations.
      </p>
    </div>
  );
}
