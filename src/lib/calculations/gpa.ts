export type GradingScale = "us4" | "us43" | "uk" | "10pt";

export interface Course {
  name: string;
  grade: string;
  credits: number;
}

const US4_SCALE: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "D-": 0.7,
  "F": 0.0,
};

const US43_SCALE: Record<string, number> = {
  "A+": 4.3, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "D-": 0.7,
  "F": 0.0,
};

const UK_SCALE: Record<string, number> = {
  "First (1st)": 4.0,
  "Upper Second (2:1)": 3.3,
  "Lower Second (2:2)": 2.7,
  "Third (3rd)": 2.0,
  "Fail": 0.0,
};

export const SCALE_GRADES: Record<GradingScale, string[]> = {
  us4: Object.keys(US4_SCALE),
  us43: Object.keys(US43_SCALE),
  uk: Object.keys(UK_SCALE),
  "10pt": Array.from({ length: 11 }, (_, i) => String(10 - i)),
};

export function gradeToPoints(grade: string, scale: GradingScale): number {
  if (scale === "us4") return US4_SCALE[grade] ?? 0;
  if (scale === "us43") return US43_SCALE[grade] ?? 0;
  if (scale === "uk") return UK_SCALE[grade] ?? 0;
  if (scale === "10pt") {
    const n = parseFloat(grade);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

export function calculateGPA(courses: Course[], scale: GradingScale): {
  gpa: number;
  totalCredits: number;
  totalPoints: number;
  coursePoints: { name: string; points: number; credits: number; weightedPoints: number }[];
} {
  let totalCredits = 0;
  let totalPoints = 0;
  const coursePoints = courses
    .filter((c) => c.credits > 0 && c.grade)
    .map((c) => {
      const points = gradeToPoints(c.grade, scale);
      const weightedPoints = points * c.credits;
      totalCredits += c.credits;
      totalPoints += weightedPoints;
      return { name: c.name, points, credits: c.credits, weightedPoints };
    });

  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  return { gpa, totalCredits, totalPoints, coursePoints };
}

export function calculateCumulativeGPA(
  currentGPA: number,
  currentCredits: number,
  newCourses: Course[],
  scale: GradingScale
): { newGPA: number; semesterGPA: number; totalCredits: number } {
  const { gpa: semesterGPA, totalCredits: newCredits, totalPoints: newPoints } = calculateGPA(newCourses, scale);
  const prevTotal = currentGPA * currentCredits;
  const combinedCredits = currentCredits + newCredits;
  const newGPA = combinedCredits > 0 ? (prevTotal + newPoints) / combinedCredits : 0;
  return { newGPA, semesterGPA, totalCredits: combinedCredits };
}
