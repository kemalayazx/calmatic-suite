"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  calcDeterminant,
  calcInverse,
  calcTranspose,
  calcMatrixAdd,
  calcMatrixMultiply,
  solveQuadratic,
  solveLinear2,
  solveLinear3,
  calcDerivative,
  calcIntegral,
  calcFactorial,
  calcPermutation,
  calcCombination,
  calcComplex,
  type Matrix2D,
  type ComplexOp,
} from "@/lib/calculations/math-advanced";

// ─── helpers ─────────────────────────────────────────────────────────────────

const TABS = ["Matrix", "Equations", "Derivative", "Integral", "Perm & Comb", "Complex"] as const;
type Tab = (typeof TABS)[number];

function fmt(n: number, d = 6): string {
  if (!isFinite(n)) return "undefined";
  return parseFloat(n.toFixed(d)).toString();
}

function emptyMatrix(size: number): Matrix2D {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

// ─── Matrix Grid ─────────────────────────────────────────────────────────────

function MatrixGrid({
  size,
  values,
  onChange,
  label,
}: {
  size: number;
  values: Matrix2D;
  onChange: (r: number, c: number, v: string) => void;
  label: string;
}) {
  return (
    <div>
      <div style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.5rem" }}>{label}</div>
      <div style={{ display: "inline-grid", gridTemplateColumns: `repeat(${size}, 1fr)`, gap: "6px" }}>
        {values.map((row, r) =>
          row.map((val, c) => (
            <input
              key={`${r}-${c}`}
              type="number"
              tabIndex={r * size + c + 1}
              value={val === 0 ? "" : val}
              placeholder="0"
              onChange={(e) => onChange(r, c, e.target.value)}
              style={{
                width: "52px",
                height: "40px",
                textAlign: "center",
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "6px",
                color: "#fafafa",
                fontSize: "0.875rem",
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Result Matrix Display ────────────────────────────────────────────────────

function ResultMatrix({ m }: { m: Matrix2D }) {
  return (
    <div
      style={{
        display: "inline-grid",
        gridTemplateColumns: `repeat(${m[0].length}, 1fr)`,
        gap: "6px",
        marginTop: "0.5rem",
      }}
    >
      {m.map((row, r) =>
        row.map((val, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              width: "64px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#27272a",
              borderRadius: "6px",
              color: "#a78bfa",
              fontSize: "0.8rem",
              fontFamily: "monospace",
            }}
          >
            {fmt(val, 4)}
          </div>
        ))
      )}
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "8px",
  color: "#fafafa",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#71717a",
  marginBottom: "4px",
};

const btnStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  border: "1px solid #3f3f46",
  background: "#27272a",
  color: "#fafafa",
  cursor: "pointer",
  fontSize: "0.8rem",
};

const btnPrimary: React.CSSProperties = {
  ...btnStyle,
  background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
  border: "none",
};

const resultBox: React.CSSProperties = {
  background: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "10px",
  padding: "1rem",
  marginTop: "1rem",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      {children}
    </div>
  );
}

// ─── Tab: Matrix ─────────────────────────────────────────────────────────────

function MatrixTab() {
  const [size, setSize] = useState(2);
  const [matA, setMatA] = useState<Matrix2D>(emptyMatrix(2));
  const [matB, setMatB] = useState<Matrix2D>(emptyMatrix(2));
  const [result, setResult] = useState<{ label: string; matrix?: Matrix2D; scalar?: number; error?: string } | null>(null);

  function updateA(r: number, c: number, v: string) {
    setMatA((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = parseFloat(v) || 0;
      return next;
    });
  }

  function updateB(r: number, c: number, v: string) {
    setMatB((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = parseFloat(v) || 0;
      return next;
    });
  }

  function changeSize(s: number) {
    setSize(s);
    setMatA(emptyMatrix(s));
    setMatB(emptyMatrix(s));
    setResult(null);
  }

  function run(op: string) {
    try {
      switch (op) {
        case "det": {
          const d = calcDeterminant(matA);
          setResult({ label: "Determinant", scalar: d });
          break;
        }
        case "inv": {
          if (Math.abs(calcDeterminant(matA)) < 1e-10) {
            setResult({ label: "Inverse", error: "Singular matrix — inverse does not exist." });
            return;
          }
          setResult({ label: "Inverse (A⁻¹)", matrix: calcInverse(matA) });
          break;
        }
        case "transpose":
          setResult({ label: "Transpose (Aᵀ)", matrix: calcTranspose(matA) });
          break;
        case "add":
          setResult({ label: "A + B", matrix: calcMatrixAdd(matA, matB) });
          break;
        case "multiply":
          setResult({ label: "A × B", matrix: calcMatrixMultiply(matA, matB) });
          break;
      }
    } catch {
      setResult({ label: op, error: "Calculation error." });
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Field label="Matrix size">
        <select
          value={size}
          onChange={(e) => changeSize(Number(e.target.value))}
          style={{ ...inputStyle, width: "120px" }}
        >
          <option value={2}>2 × 2</option>
          <option value={3}>3 × 3</option>
          <option value={4}>4 × 4</option>
        </select>
      </Field>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <MatrixGrid size={size} values={matA} onChange={updateA} label="Matrix A" />
        <MatrixGrid size={size} values={matB} onChange={updateB} label="Matrix B (for Add/Multiply)" />
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {["det", "inv", "transpose", "add", "multiply"].map((op) => (
          <button key={op} style={btnStyle} onClick={() => run(op)}>
            {{
              det: "Determinant",
              inv: "Inverse",
              transpose: "Transpose",
              add: "A + B",
              multiply: "A × B",
            }[op]}
          </button>
        ))}
      </div>

      {result && (
        <div style={resultBox}>
          <div style={{ color: "#71717a", fontSize: "0.8rem", marginBottom: "0.5rem" }}>{result.label}</div>
          {result.error ? (
            <div style={{ color: "#f87171" }}>{result.error}</div>
          ) : result.scalar !== undefined ? (
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#a78bfa" }}>{fmt(result.scalar)}</div>
          ) : result.matrix ? (
            <ResultMatrix m={result.matrix} />
          ) : null}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Equations ──────────────────────────────────────────────────────────

function EquationsTab() {
  const [mode, setMode] = useState<"quad" | "linear2" | "linear3">("quad");

  // quadratic
  const [qa, setQa] = useState("");
  const [qb, setQb] = useState("");
  const [qc, setQc] = useState("");
  const [qResult, setQResult] = useState<ReturnType<typeof solveQuadratic> | null>(null);

  // linear 2
  const [l2, setL2] = useState({ a1: "", b1: "", c1: "", a2: "", b2: "", c2: "" });
  const [l2Result, setL2Result] = useState<{ x: number; y: number } | null>(null);

  // linear 3
  const [l3, setL3] = useState({
    a1: "", b1: "", c1: "", d1: "",
    a2: "", b2: "", c2: "", d2: "",
    a3: "", b3: "", c3: "", d3: "",
  });
  const [l3Result, setL3Result] = useState<{ x: number; y: number; z: number } | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {(["quad", "linear2", "linear3"] as const).map((m) => (
          <button
            key={m}
            style={mode === m ? btnPrimary : btnStyle}
            onClick={() => setMode(m)}
          >
            {{ quad: "Quadratic", linear2: "Linear 2×2", linear3: "Linear 3×3" }[m]}
          </button>
        ))}
      </div>

      {mode === "quad" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ color: "#a1a1aa", fontFamily: "monospace" }}>ax² + bx + c = 0</div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {[["a", qa, setQa], ["b", qb, setQb], ["c", qc, setQc]].map(([lbl, val, setter]) => (
              <Field key={lbl as string} label={lbl as string}>
                <input
                  style={{ ...inputStyle, width: "100px" }}
                  type="number"
                  value={val as string}
                  onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                />
              </Field>
            ))}
          </div>
          <button
            style={btnPrimary}
            onClick={() => {
              const a = parseFloat(qa), b = parseFloat(qb), c = parseFloat(qc);
              if (!a) return;
              setQResult(solveQuadratic(a, b, c));
            }}
          >
            Solve
          </button>
          {qResult && (
            <div style={resultBox}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <div style={labelStyle}>Root 1</div>
                  <div style={{ color: "#a78bfa", fontFamily: "monospace" }}>{qResult.root1}</div>
                </div>
                <div>
                  <div style={labelStyle}>Root 2</div>
                  <div style={{ color: "#a78bfa", fontFamily: "monospace" }}>{qResult.root2}</div>
                </div>
                <div>
                  <div style={labelStyle}>Discriminant</div>
                  <div style={{ color: "#71717a", fontFamily: "monospace" }}>{fmt(qResult.discriminant)}</div>
                </div>
                <div>
                  <div style={labelStyle}>Vertex</div>
                  <div style={{ color: "#71717a", fontFamily: "monospace" }}>
                    ({fmt(qResult.vertex.x, 4)}, {fmt(qResult.vertex.y, 4)})
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === "linear2" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ color: "#a1a1aa", fontSize: "0.85rem", fontFamily: "monospace" }}>
            a₁x + b₁y = c₁ &nbsp;|&nbsp; a₂x + b₂y = c₂
          </div>
          {[
            { prefix: "1", a: "a1", b: "b1", c: "c1" },
            { prefix: "2", a: "a2", b: "b2", c: "c2" },
          ].map(({ prefix, a, b, c }) => (
            <div key={prefix} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {[
                { k: a as keyof typeof l2, lbl: `a${prefix}` },
                { k: b as keyof typeof l2, lbl: `b${prefix}` },
                { k: c as keyof typeof l2, lbl: `c${prefix}` },
              ].map(({ k, lbl }) => (
                <Field key={lbl} label={lbl}>
                  <input
                    style={{ ...inputStyle, width: "80px" }}
                    type="number"
                    value={l2[k]}
                    onChange={(e) => setL2((prev) => ({ ...prev, [k]: e.target.value }))}
                  />
                </Field>
              ))}
            </div>
          ))}
          <button
            style={btnPrimary}
            onClick={() => {
              const n = (k: keyof typeof l2) => parseFloat(l2[k]) || 0;
              setL2Result(solveLinear2(n("a1"), n("b1"), n("c1"), n("a2"), n("b2"), n("c2")));
            }}
          >
            Solve
          </button>
          {l2Result && (
            <div style={resultBox}>
              <div style={{ display: "flex", gap: "2rem" }}>
                <div><div style={labelStyle}>x</div><div style={{ color: "#a78bfa", fontSize: "1.25rem", fontWeight: 700 }}>{fmt(l2Result.x)}</div></div>
                <div><div style={labelStyle}>y</div><div style={{ color: "#a78bfa", fontSize: "1.25rem", fontWeight: 700 }}>{fmt(l2Result.y)}</div></div>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === "linear3" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ color: "#a1a1aa", fontSize: "0.85rem", fontFamily: "monospace" }}>
            a₁x + b₁y + c₁z = d₁ (×3)
          </div>
          {[
            { prefix: "1", keys: ["a1", "b1", "c1", "d1"] },
            { prefix: "2", keys: ["a2", "b2", "c2", "d2"] },
            { prefix: "3", keys: ["a3", "b3", "c3", "d3"] },
          ].map(({ prefix, keys }) => (
            <div key={prefix} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {keys.map((k) => (
                <Field key={k} label={k}>
                  <input
                    style={{ ...inputStyle, width: "70px" }}
                    type="number"
                    value={l3[k as keyof typeof l3]}
                    onChange={(e) => setL3((prev) => ({ ...prev, [k]: e.target.value }))}
                  />
                </Field>
              ))}
            </div>
          ))}
          <button
            style={btnPrimary}
            onClick={() => {
              const n = (k: keyof typeof l3) => parseFloat(l3[k]) || 0;
              setL3Result(
                solveLinear3(
                  n("a1"), n("b1"), n("c1"), n("d1"),
                  n("a2"), n("b2"), n("c2"), n("d2"),
                  n("a3"), n("b3"), n("c3"), n("d3")
                )
              );
            }}
          >
            Solve
          </button>
          {l3Result && (
            <div style={resultBox}>
              <div style={{ display: "flex", gap: "2rem" }}>
                {["x", "y", "z"].map((v) => (
                  <div key={v}>
                    <div style={labelStyle}>{v}</div>
                    <div style={{ color: "#a78bfa", fontSize: "1.25rem", fontWeight: 700 }}>
                      {fmt(l3Result[v as "x" | "y" | "z"])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Derivative ─────────────────────────────────────────────────────────

function DerivativeTab() {
  const [expr, setExpr] = useState("x^3 + 2*x^2 - 5*x + 3");
  const [xVal, setXVal] = useState("1");
  const [result, setResult] = useState<ReturnType<typeof calcDerivative> | null>(null);
  const [error, setError] = useState("");

  function solve() {
    try {
      setError("");
      setResult(calcDerivative(expr, parseFloat(xVal) || 0));
    } catch {
      setError("Invalid expression. Use * for multiplication, ^ for power.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Field label="f(x) — use * for multiply, ^ for power">
        <input style={inputStyle} value={expr} onChange={(e) => setExpr(e.target.value)} />
      </Field>
      <Field label="Evaluate at x =">
        <input style={{ ...inputStyle, width: "120px" }} type="number" value={xVal} onChange={(e) => setXVal(e.target.value)} />
      </Field>
      <button style={btnPrimary} onClick={solve}>Calculate Derivative</button>
      {error && <div style={{ color: "#f87171", fontSize: "0.85rem" }}>{error}</div>}
      {result && (
        <div style={resultBox}>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <div>
              <div style={labelStyle}>f′(x) — symbolic</div>
              <div style={{ color: "#a78bfa", fontFamily: "monospace", fontSize: "1rem" }}>{result.symbolicDerivative}</div>
            </div>
            <div style={{ display: "flex", gap: "2rem" }}>
              <div>
                <div style={labelStyle}>f({xVal})</div>
                <div style={{ color: "#fafafa", fontSize: "1.25rem", fontWeight: 700 }}>{fmt(result.fAtX)}</div>
              </div>
              <div>
                <div style={labelStyle}>f′({xVal})</div>
                <div style={{ color: "#a78bfa", fontSize: "1.25rem", fontWeight: 700 }}>{fmt(result.fPrimeAtX)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Integral ────────────────────────────────────────────────────────────

function IntegralTab() {
  const [expr, setExpr] = useState("x^2");
  const [a, setA] = useState("0");
  const [b, setB] = useState("1");
  const [result, setResult] = useState<ReturnType<typeof calcIntegral> | null>(null);
  const [error, setError] = useState("");

  function solve() {
    try {
      setError("");
      const aNum = parseFloat(a), bNum = parseFloat(b);
      if (isNaN(aNum) || isNaN(bNum)) throw new Error("bounds");
      setResult(calcIntegral(expr, aNum, bNum, 100));
    } catch {
      setError("Invalid expression or bounds.");
    }
  }

  const W = 360, H = 140;

  const svgPath = useCallback(() => {
    if (!result || result.points.length < 2) return "";
    const xs = result.points.map((p) => p.x);
    const ys = result.points.map((p) => p.y);
    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    const yMin = Math.min(...ys, 0), yMax = Math.max(...ys, 0);
    const pad = 10;
    const scaleX = (xMax - xMin === 0) ? 1 : (W - 2 * pad) / (xMax - xMin);
    const scaleY = (yMax - yMin === 0) ? 1 : (H - 2 * pad) / (yMax - yMin);
    return result.points
      .map((p, i) => {
        const px = pad + (p.x - xMin) * scaleX;
        const py = H - pad - (p.y - yMin) * scaleY;
        return `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
      })
      .join(" ");
  }, [result]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Field label="f(x)">
        <input style={inputStyle} value={expr} onChange={(e) => setExpr(e.target.value)} />
      </Field>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Field label="Lower bound (a)">
          <input style={{ ...inputStyle, width: "100px" }} type="number" value={a} onChange={(e) => setA(e.target.value)} />
        </Field>
        <Field label="Upper bound (b)">
          <input style={{ ...inputStyle, width: "100px" }} type="number" value={b} onChange={(e) => setB(e.target.value)} />
        </Field>
      </div>
      <button style={btnPrimary} onClick={solve}>Integrate (Simpson)</button>
      {error && <div style={{ color: "#f87171", fontSize: "0.85rem" }}>{error}</div>}
      {result && (
        <div style={resultBox}>
          <div style={labelStyle}>∫f(x)dx from {a} to {b}</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#a78bfa" }}>{fmt(result.value)}</div>
          {result.points.length > 1 && (
            <svg
              width={W}
              height={H}
              style={{ marginTop: "1rem", display: "block", background: "#111113", borderRadius: "8px" }}
            >
              <path d={svgPath()} fill="none" stroke="#7c3aed" strokeWidth="2" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Perm & Comb ─────────────────────────────────────────────────────────

function PermCombTab() {
  const [n, setN] = useState("5");
  const [r, setR] = useState("2");
  const [result, setResult] = useState<{ P: number; C: number; nFact: number } | null>(null);
  const [error, setError] = useState("");

  function solve() {
    const nv = parseInt(n), rv = parseInt(r);
    if (isNaN(nv) || isNaN(rv) || nv < 0 || rv < 0 || rv > nv) {
      setError("Ensure 0 ≤ r ≤ n");
      setResult(null);
      return;
    }
    setError("");
    try {
      setResult({
        P: calcPermutation(nv, rv),
        C: calcCombination(nv, rv),
        nFact: calcFactorial(nv),
      });
    } catch {
      setError("Values too large to compute.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Field label="n (total)">
          <input style={{ ...inputStyle, width: "100px" }} type="number" min={0} value={n} onChange={(e) => setN(e.target.value)} />
        </Field>
        <Field label="r (select)">
          <input style={{ ...inputStyle, width: "100px" }} type="number" min={0} value={r} onChange={(e) => setR(e.target.value)} />
        </Field>
      </div>
      <button style={btnPrimary} onClick={solve}>Calculate</button>
      {error && <div style={{ color: "#f87171", fontSize: "0.85rem" }}>{error}</div>}
      {result && (
        <div style={resultBox}>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {[
              { lbl: `P(${n}, ${r})`, val: result.P, formula: "n! / (n−r)!" },
              { lbl: `C(${n}, ${r})`, val: result.C, formula: "n! / (r! × (n−r)!)" },
              { lbl: `${n}!`, val: result.nFact, formula: "n × (n−1) × … × 1" },
            ].map(({ lbl, val, formula }) => (
              <div key={lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "#fafafa", fontWeight: 600 }}>{lbl}</div>
                  <div style={{ color: "#52525b", fontSize: "0.75rem" }}>{formula}</div>
                </div>
                <div style={{ color: "#a78bfa", fontSize: "1.5rem", fontWeight: 800, fontFamily: "monospace" }}>
                  {val.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Complex ─────────────────────────────────────────────────────────────

function ComplexTab() {
  const [z1Re, setZ1Re] = useState("3");
  const [z1Im, setZ1Im] = useState("4");
  const [z2Re, setZ2Re] = useState("1");
  const [z2Im, setZ2Im] = useState("-2");
  const [op, setOp] = useState<ComplexOp>("add");
  const [result, setResult] = useState<ReturnType<typeof calcComplex> | null>(null);

  function solve() {
    const a = parseFloat(z1Re) || 0, bi = parseFloat(z1Im) || 0;
    const b = parseFloat(z2Re) || 0, bj = parseFloat(z2Im) || 0;
    setResult(calcComplex(a, bi, b, bj, op));
  }

  function fmtComplex(re: number, im: number) {
    const reStr = fmt(re, 4);
    const imStr = fmt(Math.abs(im), 4);
    return `${reStr} ${im < 0 ? "−" : "+"} ${imStr}i`;
  }

  const ops: ComplexOp[] = ["add", "subtract", "multiply", "divide", "modulus", "conjugate"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ ...labelStyle, marginBottom: "8px" }}>z₁ = a + bi</div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Field label="a">
              <input style={{ ...inputStyle, width: "80px" }} type="number" value={z1Re} onChange={(e) => setZ1Re(e.target.value)} />
            </Field>
            <Field label="b">
              <input style={{ ...inputStyle, width: "80px" }} type="number" value={z1Im} onChange={(e) => setZ1Im(e.target.value)} />
            </Field>
          </div>
        </div>
        <div>
          <div style={{ ...labelStyle, marginBottom: "8px" }}>z₂ = a + bi</div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Field label="a">
              <input style={{ ...inputStyle, width: "80px" }} type="number" value={z2Re} onChange={(e) => setZ2Re(e.target.value)} />
            </Field>
            <Field label="b">
              <input style={{ ...inputStyle, width: "80px" }} type="number" value={z2Im} onChange={(e) => setZ2Im(e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      <Field label="Operation">
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {ops.map((o) => (
            <button key={o} style={op === o ? btnPrimary : btnStyle} onClick={() => setOp(o)}>
              {{ add: "Add", subtract: "Subtract", multiply: "Multiply", divide: "Divide", modulus: "Modulus", conjugate: "Conjugate" }[o]}
            </button>
          ))}
        </div>
      </Field>

      <button style={btnPrimary} onClick={solve}>Calculate</button>

      {result && (
        <div style={resultBox}>
          <div>
            <div style={labelStyle}>Result (rectangular)</div>
            <div style={{ color: "#a78bfa", fontSize: "1.25rem", fontFamily: "monospace", fontWeight: 700 }}>
              {fmtComplex(result.re, result.im)}
            </div>
          </div>
          {(op !== "modulus") && (
            <div style={{ marginTop: "0.75rem" }}>
              <div style={labelStyle}>Polar form</div>
              <div style={{ color: "#71717a", fontFamily: "monospace" }}>
                r = {fmt(result.modulus, 4)} &nbsp;|&nbsp; θ = {fmt((result.angle * 180) / Math.PI, 4)}°
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MathPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Matrix");

  return (
    <div>
      {/* Back */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/" style={{ color: "#71717a", textDecoration: "none", fontSize: "0.875rem" }}>
          ← Back
        </Link>
      </div>

      <h1
        style={{
          fontWeight: 800,
          fontSize: "1.75rem",
          marginBottom: "0.5rem",
          background: "linear-gradient(135deg,#a78bfa,#7c3aed)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Advanced Math
      </h1>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          flexWrap: "wrap",
          borderBottom: "1px solid #27272a",
          marginBottom: "1.75rem",
          paddingBottom: "0",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "0.625rem 1rem",
              border: "none",
              borderBottom: activeTab === t ? "2px solid #7c3aed" : "2px solid transparent",
              background: "transparent",
              color: activeTab === t ? "#a78bfa" : "#71717a",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: activeTab === t ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div
        style={{
          background: "rgba(24,24,27,0.6)",
          border: "1px solid #27272a",
          borderRadius: "1rem",
          padding: "1.75rem",
          maxWidth: "760px",
        }}
      >
        {activeTab === "Matrix" && <MatrixTab />}
        {activeTab === "Equations" && <EquationsTab />}
        {activeTab === "Derivative" && <DerivativeTab />}
        {activeTab === "Integral" && <IntegralTab />}
        {activeTab === "Perm & Comb" && <PermCombTab />}
        {activeTab === "Complex" && <ComplexTab />}
      </div>

      <p style={{ marginTop: "2rem", color: "#3f3f46", fontSize: "0.8rem" }}>
        Results are for informational purposes only.
      </p>
    </div>
  );
}
