"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { calc2D, calc3D, pythagorean, Shape2D, Shape3D } from "@/lib/calculations/geometry";

const TAB_STYLE = (active: boolean): React.CSSProperties => ({
  padding: "0.5rem 1.25rem",
  borderRadius: "0.5rem",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.875rem",
  background: active ? "#7c3aed" : "#1c1c1e",
  color: active ? "#fff" : "#71717a",
  transition: "all 0.15s",
});

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

const SELECT_STYLE: React.CSSProperties = { ...INPUT_STYLE };

const RESULT_BOX: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #1e3a5f",
  borderRadius: "0.75rem",
  padding: "1rem 1.25rem",
  marginTop: "1rem",
};

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(6).replace(/\.?0+$/, "");
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{ fontSize: "0.8rem", color: "#a1a1aa" }}>{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} style={INPUT_STYLE} min="0" />
    </div>
  );
}

// --- 2D Tab ---
function Tab2D() {
  const { t } = useLanguage();
  const [shape, setShape] = useState<Shape2D>("circle");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ area?: number; perimeter?: number; circumference?: number } | null>(null);
  const [error, setError] = useState("");

  const shapes: { value: Shape2D; label: string; fields: { key: string; label: string }[] }[] = [
    { value: "circle", label: t("geometry.shape.circle"), fields: [{ key: "radius", label: t("geometry.field.radius") }] },
    { value: "rectangle", label: t("geometry.shape.rectangle"), fields: [{ key: "width", label: t("geometry.field.width") }, { key: "height", label: t("geometry.field.height") }] },
    { value: "triangle", label: t("geometry.shape.triangleBaseHeight"), fields: [{ key: "base", label: t("geometry.field.base") }, { key: "height", label: t("geometry.field.height") }] },
    { value: "triangle-heron", label: t("geometry.shape.triangleHeron"), fields: [{ key: "a", label: t("geometry.field.sideA") }, { key: "b", label: t("geometry.field.sideB") }, { key: "c", label: t("geometry.field.sideC") }] },
    { value: "trapezoid", label: t("geometry.shape.trapezoid"), fields: [{ key: "a", label: t("geometry.field.sideAParallel") }, { key: "b", label: t("geometry.field.sideBParallel") }, { key: "height", label: t("geometry.field.height") }] },
    { value: "ellipse", label: t("geometry.shape.ellipse"), fields: [{ key: "a", label: t("geometry.field.semiAxisA") }, { key: "b", label: t("geometry.field.semiAxisB") }] },
    { value: "parallelogram", label: t("geometry.shape.parallelogram"), fields: [{ key: "base", label: t("geometry.field.base") }, { key: "height", label: t("geometry.field.height") }] },
  ];

  const current = shapes.find((s) => s.value === shape)!;

  function calculate() {
    try {
      const params: Record<string, number> = {};
      for (const f of current.fields) {
        const v = parseFloat(fields[f.key] || "0");
        if (isNaN(v) || v < 0) throw new Error(`Invalid ${f.label}`);
        params[f.key] = v;
      }
      const r = calc2D(shape, params);
      setResult(r);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "block", marginBottom: "0.3rem" }}>{t("geometry.label.shape")}</label>
        <select
          value={shape}
          onChange={(e) => { setShape(e.target.value as Shape2D); setResult(null); setFields({}); }}
          style={SELECT_STYLE}
        >
          {shapes.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
        {current.fields.map((f) => (
          <Field key={f.key} label={f.label} value={fields[f.key] || ""} onChange={(v) => setFields((p) => ({ ...p, [f.key]: v }))} />
        ))}
      </div>

      <button
        onClick={calculate}
        style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}
      >
        {t("geometry.btn.calculate")}
      </button>

      {error && <p style={{ color: "#f87171", marginTop: "0.75rem", fontSize: "0.85rem" }}>{error}</p>}

      {result && (
        <div style={RESULT_BOX}>
          {result.area !== undefined && <p style={{ color: "#c4b5fd", margin: "0.25rem 0" }}>{t("geometry.result.area")}: <strong style={{ color: "#f4f4f5" }}>{fmt(result.area)}</strong></p>}
          {result.perimeter !== undefined && <p style={{ color: "#c4b5fd", margin: "0.25rem 0" }}>{t("geometry.result.perimeter")}: <strong style={{ color: "#f4f4f5" }}>{fmt(result.perimeter)}</strong></p>}
          {result.circumference !== undefined && <p style={{ color: "#c4b5fd", margin: "0.25rem 0" }}>{t("geometry.result.circumference")}: <strong style={{ color: "#f4f4f5" }}>{fmt(result.circumference)}</strong></p>}
        </div>
      )}
    </div>
  );
}

// --- 3D Tab ---
function Tab3D() {
  const { t } = useLanguage();
  const [shape, setShape] = useState<Shape3D>("sphere");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ volume?: number; surfaceArea?: number; slantHeight?: number } | null>(null);
  const [error, setError] = useState("");

  const shapes: { value: Shape3D; label: string; fields: { key: string; label: string }[] }[] = [
    { value: "sphere", label: t("geometry.shape3d.sphere"), fields: [{ key: "r", label: t("geometry.field.radius") }] },
    { value: "cylinder", label: t("geometry.shape3d.cylinder"), fields: [{ key: "r", label: t("geometry.field.radius") }, { key: "h", label: t("geometry.field.height") }] },
    { value: "cone", label: t("geometry.shape3d.cone"), fields: [{ key: "r", label: t("geometry.field.radius") }, { key: "h", label: t("geometry.field.height") }] },
    { value: "cube", label: t("geometry.shape3d.cube"), fields: [{ key: "side", label: t("geometry.field.side") }] },
    { value: "rectangular-prism", label: t("geometry.shape3d.rectPrism"), fields: [{ key: "l", label: t("geometry.field.length") }, { key: "w", label: t("geometry.field.width") }, { key: "h", label: t("geometry.field.height") }] },
    { value: "pyramid", label: t("geometry.shape3d.squarePyramid"), fields: [{ key: "side", label: t("geometry.field.baseSide") }, { key: "height", label: t("geometry.field.height") }] },
  ];

  const current = shapes.find((s) => s.value === shape)!;

  function calculate() {
    try {
      const params: Record<string, number> = {};
      for (const f of current.fields) {
        const v = parseFloat(fields[f.key] || "0");
        if (isNaN(v) || v <= 0) throw new Error(`Invalid ${f.label}`);
        params[f.key] = v;
      }
      const r = calc3D(shape, params);
      setResult(r);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "block", marginBottom: "0.3rem" }}>{t("geometry.label.shape")}</label>
        <select value={shape} onChange={(e) => { setShape(e.target.value as Shape3D); setResult(null); setFields({}); }} style={SELECT_STYLE}>
          {shapes.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
        {current.fields.map((f) => (
          <Field key={f.key} label={f.label} value={fields[f.key] || ""} onChange={(v) => setFields((p) => ({ ...p, [f.key]: v }))} />
        ))}
      </div>

      <button onClick={calculate} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}>
        {t("geometry.btn.calculate")}
      </button>

      {error && <p style={{ color: "#f87171", marginTop: "0.75rem", fontSize: "0.85rem" }}>{error}</p>}

      {result && (
        <div style={RESULT_BOX}>
          {result.volume !== undefined && <p style={{ color: "#c4b5fd", margin: "0.25rem 0" }}>{t("geometry.result.volume")}: <strong style={{ color: "#f4f4f5" }}>{fmt(result.volume)}</strong></p>}
          {result.surfaceArea !== undefined && <p style={{ color: "#c4b5fd", margin: "0.25rem 0" }}>{t("geometry.result.surfaceArea")}: <strong style={{ color: "#f4f4f5" }}>{fmt(result.surfaceArea)}</strong></p>}
          {result.slantHeight !== undefined && (
            <p style={{ color: "#c4b5fd", margin: "0.25rem 0" }}>{t("geometry.result.slantHeight")}: <strong style={{ color: "#f4f4f5" }}>{fmt(result.slantHeight)}</strong></p>
          )}
        </div>
      )}
    </div>
  );
}

// --- Pythagorean Tab ---
function TabPyth() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"ab" | "ac" | "bc">("ab");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [result, setResult] = useState<{ a: number; b: number; c: number } | null>(null);
  const [error, setError] = useState("");

  const labels: Record<string, [string, string]> = {
    ab: [t("geometry.pyth.sideALeg"), t("geometry.pyth.sideBLeg")],
    ac: [t("geometry.pyth.sideALeg"), t("geometry.pyth.sideCHyp")],
    bc: [t("geometry.pyth.sideBLeg"), t("geometry.pyth.sideCHyp")],
  };
  const [l1, l2] = labels[mode];

  function calculate() {
    try {
      const v1 = parseFloat(p1);
      const v2 = parseFloat(p2);
      if (isNaN(v1) || isNaN(v2) || v1 <= 0 || v2 <= 0) throw new Error(t("geometry.pyth.invalidError"));
      const r = pythagorean(mode, v1, v2);
      setResult(r);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    }
  }

  // SVG triangle proportional
  const svgSize = 180;
  const renderSVG = result && (() => {
    const maxSide = Math.max(result.a, result.b);
    const scale = (svgSize * 0.7) / maxSide;
    const bw = result.b * scale;
    const ah = result.a * scale;
    const ox = 20, oy = svgSize - 20;
    const ax = ox + bw, ay = oy;
    const bx = ox, by = oy - ah;
    return (
      <svg width={svgSize} height={svgSize} style={{ marginTop: "1rem" }}>
        <polygon points={`${ox},${oy} ${ax},${ay} ${bx},${by}`} fill="none" stroke="#7c3aed" strokeWidth="2" />
        {/* right angle */}
        <polyline points={`${ox + 10},${oy} ${ox + 10},${oy - 10} ${ox},${oy - 10}`} fill="none" stroke="#a78bfa" strokeWidth="1.5" />
        <text x={(ox + ax) / 2} y={oy + 15} fill="#86efac" fontSize="11" textAnchor="middle">b={fmt(result.b)}</text>
        <text x={ox - 5} y={(oy + by) / 2} fill="#86efac" fontSize="11" textAnchor="end">a={fmt(result.a)}</text>
        <text x={(ax + bx) / 2 + 12} y={(ay + by) / 2 - 5} fill="#fde68a" fontSize="11">c={fmt(result.c)}</text>
      </svg>
    );
  })();

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "block", marginBottom: "0.3rem" }}>{t("geometry.pyth.knownValues")}</label>
        <select value={mode} onChange={(e) => { setMode(e.target.value as "ab"|"ac"|"bc"); setResult(null); }} style={SELECT_STYLE}>
          <option value="ab">{t("geometry.pyth.knownAB")}</option>
          <option value="ac">{t("geometry.pyth.knownAC")}</option>
          <option value="bc">{t("geometry.pyth.knownBC")}</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        <Field label={l1} value={p1} onChange={setP1} />
        <Field label={l2} value={p2} onChange={setP2} />
      </div>

      <button onClick={calculate} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}>
        {t("geometry.btn.calculate")}
      </button>

      {error && <p style={{ color: "#f87171", marginTop: "0.75rem", fontSize: "0.85rem" }}>{error}</p>}

      {result && (
        <div style={RESULT_BOX}>
          <p style={{ color: "#c4b5fd", margin: "0.25rem 0" }}>a = <strong style={{ color: "#f4f4f5" }}>{fmt(result.a)}</strong></p>
          <p style={{ color: "#c4b5fd", margin: "0.25rem 0" }}>b = <strong style={{ color: "#f4f4f5" }}>{fmt(result.b)}</strong></p>
          <p style={{ color: "#fde68a", margin: "0.25rem 0" }}>c ({t("geometry.pyth.hypotenuse")}) = <strong style={{ color: "#f4f4f5" }}>{fmt(result.c)}</strong></p>
          <div style={{ display: "flex", justifyContent: "center" }}>{renderSVG}</div>
        </div>
      )}
    </div>
  );
}

// --- Main Page ---
export default function GeometryPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"2d" | "3d" | "pyth">("2d");

  return (
    <div style={{ maxWidth: "42rem", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <h1 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 800, color: "#38bdf8", marginBottom: "1.5rem" }}>
        {t("geometry.title")}
      </h1>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button style={TAB_STYLE(tab === "2d")} onClick={() => setTab("2d")}>{t("geometry.tab.2d")}</button>
        <button style={TAB_STYLE(tab === "3d")} onClick={() => setTab("3d")}>{t("geometry.tab.3d")}</button>
        <button style={TAB_STYLE(tab === "pyth")} onClick={() => setTab("pyth")}>{t("geometry.tab.pythagorean")}</button>
      </div>

      <div style={{ background: "#111113", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
        {tab === "2d" && <Tab2D />}
        {tab === "3d" && <Tab3D />}
        {tab === "pyth" && <TabPyth />}
      </div>

      <p style={{ marginTop: "1.5rem", fontSize: "0.7rem", color: "#3f3f46", textAlign: "center" }}>
        {t("geometry.disclaimer")}
      </p>
    </div>
  );
}
