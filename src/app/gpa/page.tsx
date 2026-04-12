"use client";

import { useState } from "react";
import {
  calculateGPA,
  calculateCumulativeGPA,
  SCALE_GRADES,
  type GradingScale,
  type Course,
} from "@/lib/calculations/gpa";
import { useLanguage } from "@/context/LanguageContext";

const SCALE_LABELS: Record<GradingScale, string> = {
  us4: "US 4.0",
  us43: "US 4.3 (A+)",
  uk: "UK",
  "10pt": "10-Point",
};

export default function GPAPage() {
  const { t } = useLanguage();
  const [scale, setScale] = useState<GradingScale>("us4");
  const [courses, setCourses] = useState<Course[]>([
    { name: "Mathematics", grade: "A", credits: 3 },
    { name: "English", grade: "B+", credits: 3 },
    { name: "Physics", grade: "A-", credits: 4 },
    { name: "History", grade: "B", credits: 3 },
  ]);

  // Cumulative GPA
  const [prevGPA, setPrevGPA] = useState("3.2");
  const [prevCredits, setPrevCredits] = useState("60");

  const grades = SCALE_GRADES[scale];

  const addCourse = () => setCourses([...courses, { name: "", grade: grades[0], credits: 3 }]);
  const removeCourse = (i: number) => setCourses(courses.filter((_, idx) => idx !== i));
  const updateCourse = (i: number, field: keyof Course, value: string | number) => {
    const copy = [...courses];
    copy[i] = { ...copy[i], [field]: value };
    setCourses(copy);
  };

  const gpaResult = calculateGPA(courses, scale);
  const cumulResult = calculateCumulativeGPA(
    parseFloat(prevGPA) || 0,
    parseFloat(prevCredits) || 0,
    courses,
    scale
  );

  const maxGPA = scale === "us43" ? 4.3 : scale === "10pt" ? 10 : scale === "uk" ? 4.0 : 4.0;

  const gpaColor = (gpa: number) => {
    const pct = gpa / maxGPA;
    if (pct >= 0.9) return "#22c55e";
    if (pct >= 0.75) return "#86efac";
    if (pct >= 0.6) return "#fbbf24";
    if (pct >= 0.4) return "#fb923c";
    return "#f87171";
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>{t("gpa.title")}</h1>
      <p style={{ color: "#71717a", marginBottom: "2rem" }}>{t("gpa.subtitle")}</p>

      {/* Scale selector */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        {(Object.keys(SCALE_LABELS) as GradingScale[]).map((s) => (
          <button key={s} onClick={() => {
            setScale(s);
            // Reset grades to first option of new scale
            const newGrades = SCALE_GRADES[s];
            setCourses(courses.map((c) => ({ ...c, grade: newGrades.includes(c.grade) ? c.grade : newGrades[0] })));
          }}
            style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: scale === s ? "#7c3aed" : "#27272a", color: scale === s ? "white" : "#a1a1aa", cursor: "pointer", fontSize: "0.875rem", fontWeight: scale === s ? 700 : 400 }}>
            {SCALE_LABELS[s]}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem" }}>
        <div>
          {/* Course table */}
          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", overflow: "hidden", marginBottom: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 80px 80px 32px", gap: "0.5rem", padding: "0.75rem 1.25rem", borderBottom: "1px solid #3f3f46" }}>
              {[t("gpa.col.courseName"), t("gpa.col.grade"), t("gpa.col.credits"), t("gpa.col.points"), ""].map((h) => (
                <div key={h} style={{ fontSize: "0.75rem", color: "#71717a", fontWeight: 600 }}>{h}</div>
              ))}
            </div>
            {courses.map((course, i) => {
              const cp = gpaResult.coursePoints[i];
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 110px 80px 80px 32px", gap: "0.5rem", padding: "0.5rem 1.25rem", borderBottom: "1px solid #27272a", alignItems: "center" }}>
                  <input type="text" value={course.name} onChange={(e) => updateCourse(i, "name", e.target.value)}
                    placeholder={t("gpa.placeholder.courseName")}
                    style={{ padding: "0.35rem 0.5rem", borderRadius: "0.375rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.85rem", width: "100%" }} />
                  <select value={course.grade} onChange={(e) => updateCourse(i, "grade", e.target.value)}
                    style={{ padding: "0.35rem 0.5rem", borderRadius: "0.375rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.85rem", width: "100%" }}>
                    {grades.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <input type="number" value={course.credits} onChange={(e) => updateCourse(i, "credits", parseFloat(e.target.value) || 0)}
                    style={{ padding: "0.35rem 0.5rem", borderRadius: "0.375rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.85rem", width: "100%" }} />
                  <div style={{ color: "#a78bfa", fontWeight: 600, fontSize: "0.8rem", textAlign: "center" }}>
                    {cp ? cp.weightedPoints.toFixed(1) : "—"}
                  </div>
                  <button onClick={() => removeCourse(i)}
                    style={{ background: "none", border: "none", color: "#52525b", cursor: "pointer", fontSize: "1.1rem" }}>×</button>
                </div>
              );
            })}
          </div>
          <button onClick={addCourse}
            style={{ padding: "0.5rem 1.25rem", background: "#27272a", border: "1px solid #3f3f46", borderRadius: "0.5rem", color: "#a1a1aa", cursor: "pointer", fontSize: "0.875rem" }}>
            {t("gpa.btn.addCourse")}
          </button>
        </div>

        {/* Results panel */}
        <div>
          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{t("gpa.result.semesterGPA")}</div>
            <div style={{ fontSize: "3.5rem", fontWeight: 900, color: gpaColor(gpaResult.gpa), lineHeight: 1 }}>
              {gpaResult.gpa.toFixed(2)}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#71717a", marginTop: "0.5rem" }}>
              {gpaResult.totalCredits} {t("gpa.result.credits")} · {gpaResult.totalPoints.toFixed(1)} {t("gpa.result.totalPoints")}
            </div>
            <div style={{ marginTop: "1rem", height: "8px", background: "#27272a", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(gpaResult.gpa / maxGPA) * 100}%`, background: gpaColor(gpaResult.gpa), borderRadius: "4px", transition: "width 0.3s" }} />
            </div>
            <div style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "0.25rem" }}>
              {((gpaResult.gpa / maxGPA) * 100).toFixed(1)}% {t("gpa.result.ofMax")} ({maxGPA.toFixed(1)})
            </div>
          </div>

          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: "1rem", fontSize: "0.9rem" }}>{t("gpa.result.cumulativeGPA")}</div>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.75rem", marginBottom: "0.25rem" }}>{t("gpa.label.previousGPA")}</label>
              <input type="number" value={prevGPA} onChange={(e) => setPrevGPA(e.target.value)} step="0.01"
                style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: "0.375rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.875rem" }} />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.75rem", marginBottom: "0.25rem" }}>{t("gpa.label.previousCredits")}</label>
              <input type="number" value={prevCredits} onChange={(e) => setPrevCredits(e.target.value)}
                style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: "0.375rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.875rem" }} />
            </div>
            <div style={{ textAlign: "center", padding: "0.875rem", background: "#09090b", borderRadius: "0.5rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.25rem" }}>{t("gpa.result.newCumulativeGPA")}</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: gpaColor(cumulResult.newGPA) }}>
                {cumulResult.newGPA.toFixed(2)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#71717a" }}>{cumulResult.totalCredits} {t("gpa.result.totalCredits")}</div>
            </div>
          </div>
        </div>
      </div>

      <p style={{ marginTop: "3rem", fontSize: "0.8rem", color: "#52525b", borderTop: "1px solid #27272a", paddingTop: "1rem" }}>
        {t("common.disclaimerProfessional")}
      </p>
    </div>
  );
}
