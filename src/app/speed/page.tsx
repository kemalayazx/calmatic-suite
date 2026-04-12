"use client";

import { useState, useMemo } from "react";
import { calcSpeed, calcPace, type SpeedUnit, type DistanceUnit, type TimeUnit } from "@/lib/calculations/speed";
import { useLanguage } from "@/context/LanguageContext";

function SegButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "0.5rem 1rem", fontSize: "0.875rem", fontWeight: 600,
      background: active ? "#7c3aed" : "#27272a",
      color: active ? "#fff" : "#71717a",
      border: "none", cursor: "pointer", borderRadius: "0.375rem",
    }}>{children}</button>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.75rem", color: "#a1a1aa", marginBottom: "0.25rem" }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ background: "#27272a", border: "1px solid #3f3f46", borderRadius: "0.375rem", color: "#fafafa", padding: "0.5rem 0.75rem", width: "100%", fontSize: "0.9rem" }}>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function NumIn({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.75rem", color: "#a1a1aa", marginBottom: "0.25rem" }}>{label}</label>
      <input type="number" value={value} min={0} step="any" onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", background: "#27272a", border: "1px solid #3f3f46", borderRadius: "0.375rem", color: "#fafafa", padding: "0.5rem 0.75rem", fontSize: "0.9rem", outline: "none" }} />
    </div>
  );
}

function ResultCard({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div style={{ background: "#1c1c1f", borderRadius: "0.75rem", padding: "1.25rem", textAlign: "center" }}>
      <div style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: "1.75rem", fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: "0.8rem", color: "#52525b" }}>{unit}</div>
    </div>
  );
}

type Mode = "speed" | "distance" | "time";

const SPEED_UNITS: SpeedUnit[] = ["km/h", "mph", "m/s", "knots"];
const DIST_UNITS: DistanceUnit[] = ["km", "mi"];
const TIME_UNITS: TimeUnit[] = ["hours", "minutes", "seconds"];

const RACES = [
  { label: "5K", km: 5 }, { label: "10K", km: 10 },
  { label: "Half Marathon", km: 21.0975 }, { label: "Marathon", km: 42.195 },
];

export default function SpeedPage() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>("speed");
  const [v1, setV1] = useState(10);
  const [u1, setU1] = useState<string>("km");
  const [v2, setV2] = useState(1);
  const [u2, setU2] = useState<string>("hours");
  const [outSpeed, setOutSpeed] = useState<SpeedUnit>("km/h");
  const [outDist, setOutDist] = useState<DistanceUnit>("km");
  const [outTime, setOutTime] = useState<TimeUnit>("hours");

  // Pace state
  const [paceInput, setPaceInput] = useState<"min/km" | "min/mi">("min/km");
  const [paceVal, setPaceVal] = useState(5);
  const [raceIdx, setRaceIdx] = useState(0);

  const result = useMemo(() => {
    try {
      return calcSpeed({ mode, value1: v1, unit1: u1, value2: v2, unit2: u2, speedUnit: outSpeed, distanceUnit: outDist, timeUnit: outTime });
    } catch {
      return null;
    }
  }, [mode, v1, u1, v2, u2, outSpeed, outDist, outTime]);

  const paceResult = useMemo(() => calcPace({ inputType: paceInput, value: paceVal, raceDistanceKm: RACES[raceIdx].km }), [paceInput, paceVal, raceIdx]);

  const modeConfig: Record<Mode, { label: string; in1Label: string; in1Units: string[]; in2Label: string; in2Units: string[] }> = {
    speed: { label: t("speed.mode.speedLabel"), in1Label: t("speed.label.distance"), in1Units: DIST_UNITS, in2Label: t("speed.label.time"), in2Units: TIME_UNITS },
    distance: { label: t("speed.mode.distanceLabel"), in1Label: t("speed.label.speed"), in1Units: SPEED_UNITS, in2Label: t("speed.label.time"), in2Units: TIME_UNITS },
    time: { label: t("speed.mode.timeLabel"), in1Label: t("speed.label.speed"), in1Units: SPEED_UNITS, in2Label: t("speed.label.distance"), in2Units: DIST_UNITS },
  };
  const cfg = modeConfig[mode];

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem", color: "#fafafa" }}>
        {t("speed.title")}
      </h1>
      <p style={{ color: "#71717a", marginBottom: "2rem" }}>{t("speed.subtitle")}</p>

      {/* Mode selector */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {(["speed", "distance", "time"] as Mode[]).map((m) => (
          <SegButton key={m} active={mode === m} onClick={() => setMode(m)}>
            {modeConfig[m].label}
          </SegButton>
        ))}
      </div>

      <div style={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
          <NumIn label={`${cfg.in1Label} ${t("speed.label.value")}`} value={v1} onChange={setV1} />
          <Select label={t("speed.label.unit")} value={u1} onChange={setU1} options={cfg.in1Units} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <NumIn label={`${cfg.in2Label} ${t("speed.label.value")}`} value={v2} onChange={setV2} />
          <Select label={t("speed.label.unit")} value={u2} onChange={setU2} options={cfg.in2Units} />
        </div>

        {/* Output units */}
        <div style={{ borderTop: "1px solid #27272a", paddingTop: "1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{t("speed.label.outputUnits")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
            <Select label={t("speed.label.speed")} value={outSpeed} onChange={(v) => setOutSpeed(v as SpeedUnit)} options={SPEED_UNITS} />
            <Select label={t("speed.label.distance")} value={outDist} onChange={(v) => setOutDist(v as DistanceUnit)} options={DIST_UNITS} />
            <Select label={t("speed.label.time")} value={outTime} onChange={(v) => setOutTime(v as TimeUnit)} options={TIME_UNITS} />
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          <ResultCard label={t("speed.label.speed")} value={result.speed.toFixed(2)} unit={outSpeed} color={mode === "speed" ? "#a78bfa" : "#71717a"} />
          <ResultCard label={t("speed.label.distance")} value={result.distance.toFixed(2)} unit={outDist} color={mode === "distance" ? "#22c55e" : "#71717a"} />
          <ResultCard label={t("speed.label.time")} value={result.timeDisplay.split(" ")[0]} unit={result.timeDisplay.split(" ").slice(1).join(" ") || outTime} color={mode === "time" ? "#f97316" : "#71717a"} />
        </div>
      )}

      {/* Pace Calculator */}
      <div style={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "0.75rem", padding: "1.5rem" }}>
        <h2 style={{ fontWeight: 700, color: "#fafafa", marginBottom: "1rem", fontSize: "1.1rem" }}>{t("speed.pace.title")}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
          <NumIn label={t("speed.pace.paceMinutes")} value={paceVal} onChange={setPaceVal} />
          <Select label={t("speed.pace.paceUnit")} value={paceInput} onChange={(v) => setPaceInput(v as "min/km" | "min/mi")} options={["min/km", "min/mi"]} />
        </div>
        <Select label={t("speed.pace.raceDistance")} value={RACES[raceIdx].label} onChange={(v) => setRaceIdx(RACES.findIndex((r) => r.label === v))} options={RACES.map((r) => r.label)} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginTop: "1.25rem" }}>
          <div style={{ background: "#1c1c1f", borderRadius: "0.5rem", padding: "0.875rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.7rem", color: "#71717a" }}>{t("speed.pace.minPerKm")}</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#a78bfa" }}>{paceResult.paceMinPerKm.toFixed(2)}</div>
          </div>
          <div style={{ background: "#1c1c1f", borderRadius: "0.5rem", padding: "0.875rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.7rem", color: "#71717a" }}>{t("speed.pace.minPerMile")}</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#3b82f6" }}>{paceResult.paceMinPerMile.toFixed(2)}</div>
          </div>
          <div style={{ background: "#1c1c1f", borderRadius: "0.5rem", padding: "0.875rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.7rem", color: "#71717a" }}>{t("speed.pace.finish")} ({RACES[raceIdx].label})</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#22c55e" }}>
              {paceResult.finishTime.hours > 0 ? `${paceResult.finishTime.hours}:` : ""}
              {String(paceResult.finishTime.minutes).padStart(2, "0")}:{String(paceResult.finishTime.seconds).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>

      <p style={{ color: "#52525b", fontSize: "0.8rem", textAlign: "center", marginTop: "1.5rem" }}>
        {t("common.disclaimerProfessional")}
      </p>
    </div>
  );
}
