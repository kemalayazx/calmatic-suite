// ─── BMI ─────────────────────────────────────────────────────────────────────

export interface BMIResult {
  bmi: number;
  category: string;
  color: string;
  position: number; // 0-100 on the gauge bar
}

export function calcBMI(weightKg: number, heightCm: number): BMIResult {
  const h = heightCm / 100;
  const bmi = weightKg / (h * h);

  let category: string;
  let color: string;
  let position: number;

  if (bmi < 18.5) {
    category = "Underweight";
    color = "#38bdf8";
    position = Math.min((bmi / 18.5) * 25, 25);
  } else if (bmi < 25) {
    category = "Normal";
    color = "#4ade80";
    position = 25 + ((bmi - 18.5) / 6.5) * 25;
  } else if (bmi < 30) {
    category = "Overweight";
    color = "#fb923c";
    position = 50 + ((bmi - 25) / 5) * 25;
  } else {
    category = "Obese";
    color = "#f87171";
    position = Math.min(75 + ((bmi - 30) / 10) * 25, 99);
  }

  return { bmi: parseFloat(bmi.toFixed(1)), category, color, position };
}

// ─── BMR / Calorie ────────────────────────────────────────────────────────────

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Gender = "male" | "female";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (office work)",
  light: "Lightly active (1-3 days/wk)",
  moderate: "Moderately active (3-5 days/wk)",
  active: "Very active (6-7 days/wk)",
  very_active: "Extra active (physical job)",
};

export interface BMRResult {
  bmr: number;
  tdee: number; // total daily energy expenditure
}

export function calcBMR(
  gender: Gender,
  age: number,
  heightCm: number,
  weightKg: number,
  activity: ActivityLevel
): BMRResult {
  let bmr: number;
  if (gender === "male") {
    bmr = 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
  }
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activity];
  return { bmr: Math.round(bmr), tdee: Math.round(tdee) };
}

// ─── Ideal Weight ─────────────────────────────────────────────────────────────

export interface IdealWeightResult {
  formula: string;
  weight: number;
  description: string;
}

export function calcIdealWeight(heightCm: number, gender: Gender): IdealWeightResult[] {
  const heightIn = heightCm / 2.54;
  const inchesOver5Ft = Math.max(0, heightIn - 60);

  const devine =
    gender === "male"
      ? 50 + 2.3 * inchesOver5Ft
      : 45.5 + 2.3 * inchesOver5Ft;

  const robinson =
    gender === "male"
      ? 52 + 1.9 * inchesOver5Ft
      : 49 + 1.7 * inchesOver5Ft;

  const miller =
    gender === "male"
      ? 56.2 + 1.41 * inchesOver5Ft
      : 53.1 + 1.36 * inchesOver5Ft;

  const hamwi =
    gender === "male"
      ? 48 + 2.7 * inchesOver5Ft
      : 45.4 + 2.27 * inchesOver5Ft;

  return [
    { formula: "Devine", weight: parseFloat(devine.toFixed(1)), description: "Most used clinically" },
    { formula: "Robinson", weight: parseFloat(robinson.toFixed(1)), description: "1983 revision of Devine" },
    { formula: "Miller", weight: parseFloat(miller.toFixed(1)), description: "Accounts for lighter build" },
    { formula: "Hamwi", weight: parseFloat(hamwi.toFixed(1)), description: "Diabetes education standard" },
  ];
}
