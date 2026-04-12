"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const TABS = ["Date Difference", "Add / Subtract Days", "Countdown"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function dateDiff(a: string, b: string) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  const msPerDay = 86400000;
  const totalDays = Math.round((d2.getTime() - d1.getTime()) / msPerDay);
  const sign = totalDays >= 0 ? 1 : -1;
  const abs = Math.abs(totalDays);

  // Approximate months/years
  const years = Math.floor(abs / 365.25);
  const remAfterYears = abs - Math.round(years * 365.25);
  const months = Math.floor(remAfterYears / 30.44);
  const days = Math.round(remAfterYears - months * 30.44);
  const weeks = Math.floor(abs / 7);

  return { totalDays, sign, abs, years, months, days, weeks };
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const inputStyle: React.CSSProperties = {
  background: "#27272a",
  border: "1px solid #3f3f46",
  borderRadius: "0.75rem",
  color: "#fafafa",
  padding: "0.75rem 1rem",
  fontSize: "0.95rem",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#a1a1aa",
  display: "block",
  marginBottom: "0.375rem",
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const card: React.CSSProperties = {
  background: "#09090b",
  border: "1px solid #27272a",
  borderRadius: "0.75rem",
  padding: "1rem",
  textAlign: "center",
};

// --- Date Difference Tab ---
function DiffTab() {
  const today = todayStr();
  const [date1, setDate1] = useState(today);
  const [date2, setDate2] = useState(today);

  const d1Valid = !!date1;
  const d2Valid = !!date2;
  const result = d1Valid && d2Valid ? dateDiff(date1, date2) : null;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <label style={labelStyle}>Start Date</label>
          <input type="date" style={inputStyle} value={date1} onChange={(e) => setDate1(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>End Date</label>
          <input type="date" style={inputStyle} value={date2} onChange={(e) => setDate2(e.target.value)} />
        </div>
      </div>

      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
            {[
              { label: "Days", value: result.abs.toLocaleString("en-US") },
              { label: "Weeks", value: result.weeks.toLocaleString("en-US") },
              { label: "Months (approx)", value: `${result.years * 12 + result.months}` },
              { label: "Years (approx)", value: `${(result.abs / 365.25).toFixed(2)}` },
            ].map(({ label, value }) => (
              <div key={label} style={card}>
                <p style={{ fontSize: "0.7rem", color: "#71717a", marginBottom: "0.35rem" }}>{label}</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#a5b4fc" }}>{value}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "0.75rem",
            padding: "0.875rem 1rem",
            fontSize: "0.9rem",
            color: "#a1a1aa",
          }}>
            {result.totalDays === 0
              ? "Same day"
              : result.totalDays > 0
              ? `${result.years > 0 ? `${result.years} year${result.years > 1 ? "s" : ""}, ` : ""}${result.months > 0 ? `${result.months} month${result.months > 1 ? "s" : ""}, ` : ""}${result.days} day${result.days !== 1 ? "s" : ""} apart`
              : `${Math.abs(result.totalDays)} days before`}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Add/Subtract Tab ---
function AddTab() {
  const [startDate, setStartDate] = useState(todayStr());
  const [daysInput, setDaysInput] = useState("30");
  const [op, setOp] = useState<"add" | "sub">("add");

  const n = parseInt(daysInput, 10);
  const valid = !isNaN(n) && n >= 0 && !!startDate;
  const resultDate = valid ? addDays(startDate, op === "add" ? n : -n) : null;

  const resultDateObj = resultDate ? new Date(resultDate) : null;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <label style={labelStyle}>Start Date</label>
          <input type="date" style={inputStyle} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Number of Days</label>
          <input type="number" style={inputStyle} placeholder="30" value={daysInput} onChange={(e) => setDaysInput(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {([["add", "+ Add"], ["sub", "− Subtract"]] as const).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setOp(v)}
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "0.625rem",
              border: "1px solid",
              borderColor: op === v ? "#6366f1" : "#27272a",
              background: op === v ? "#6366f122" : "transparent",
              color: op === v ? "#a5b4fc" : "#71717a",
              fontSize: "0.85rem",
              fontWeight: op === v ? 700 : 400,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {resultDate && resultDateObj && (
        <div style={{
          background: "#09090b",
          border: "1px solid #6366f133",
          borderRadius: "1rem",
          padding: "1.75rem",
          textAlign: "center",
        }}>
          <p style={{ color: "#71717a", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Result Date</p>
          <p style={{ fontSize: "2.5rem", fontWeight: 900, color: "#a5b4fc" }}>
            {resultDate}
          </p>
          <p style={{ color: "#52525b", fontSize: "0.85rem", marginTop: "0.5rem" }}>
            {resultDateObj.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      )}
    </div>
  );
}

// --- Countdown Tab ---
function CountdownTab() {
  const [target, setTarget] = useState("");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const targetDate = target ? new Date(target) : null;
  const diff = targetDate ? targetDate.getTime() - now.getTime() : null;
  const isPast = diff !== null && diff < 0;
  const absDiff = diff !== null ? Math.abs(diff) : 0;

  const days = Math.floor(absDiff / 86400000);
  const hours = Math.floor((absDiff % 86400000) / 3600000);
  const minutes = Math.floor((absDiff % 3600000) / 60000);
  const seconds = Math.floor((absDiff % 60000) / 1000);

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={labelStyle}>Target Date & Time</label>
        <input
          type="datetime-local"
          style={inputStyle}
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
      </div>

      {targetDate && diff !== null && (
        <div style={{
          background: "#09090b",
          border: `1px solid ${isPast ? "#f8717133" : "#4ade8033"}`,
          borderRadius: "1rem",
          padding: "1.75rem",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "0.85rem", color: isPast ? "#f87171" : "#4ade80", marginBottom: "1rem", fontWeight: 700 }}>
            {isPast ? "This date has passed" : "Time remaining"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem" }}>
            {[
              { label: "Days", value: days },
              { label: "Hours", value: hours },
              { label: "Minutes", value: minutes },
              { label: "Seconds", value: seconds },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "0.75rem",
                padding: "1rem",
              }}>
                <p style={{ fontSize: "2rem", fontWeight: 900, color: isPast ? "#f87171" : "#4ade80" }}>
                  {String(value).padStart(2, "0")}
                </p>
                <p style={{ fontSize: "0.7rem", color: "#71717a", marginTop: "0.25rem" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DatesPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
        <Link href="/" style={{ color: "#71717a", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={18} />
        </Link>
        <h1 style={{ fontWeight: 700, fontSize: "1.35rem", color: "#fafafa" }}>Date Calculator</h1>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.625rem",
              border: "1px solid",
              borderColor: activeTab === i ? "#ec4899" : "#27272a",
              background: activeTab === i ? "#ec489922" : "transparent",
              color: activeTab === i ? "#f9a8d4" : "#71717a",
              fontSize: "0.82rem",
              fontWeight: activeTab === i ? 700 : 400,
              cursor: "pointer",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{
        background: "#18181b",
        borderRadius: "1rem",
        border: "1px solid #27272a",
        padding: "1.75rem",
      }}>
        {activeTab === 0 && <DiffTab />}
        {activeTab === 1 && <AddTab />}
        {activeTab === 2 && <CountdownTab />}
      </div>

      <p style={{ textAlign: "center", color: "#3f3f46", fontSize: "0.75rem", marginTop: "1.25rem" }}>
        Results are for informational purposes only.
      </p>
    </div>
  );
}
