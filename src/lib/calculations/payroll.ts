// Payroll calculations — Turkey 2025 parameters

// ─── Constants (2025) ─────────────────────────────────────────────────────────

export const PAYROLL_2025 = {
  SGK_WORKER_RATE: 0.14,       // %14 (health + retirement)
  UNEMPLOYMENT_WORKER_RATE: 0.01, // %1
  STAMP_TAX_RATE: 0.00759,     // %0.759
  AGI_SINGLE_MONTHLY: 2006,    // Asgari Geçim İndirimi (bekar)
  SGK_EMPLOYER_RATE: 0.205,    // %20.5
  UNEMPLOYMENT_EMPLOYER_RATE: 0.02, // %2
  // Annual income tax brackets (yearly cumulative)
  TAX_BRACKETS: [
    { upTo: 158_000,   rate: 0.15 },
    { upTo: 330_000,   rate: 0.20 },
    { upTo: 800_000,   rate: 0.27 },
    { upTo: 4_300_000, rate: 0.35 },
    { upTo: Infinity,  rate: 0.40 },
  ],
};

// ─── Income Tax Calculation (annual basis, return annual) ─────────────────────

export function calculateAnnualIncomeTax(annualIncome: number): {
  tax: number;
  breakdown: { bracket: string; taxableAmount: number; rate: number; tax: number }[];
} {
  const brackets = PAYROLL_2025.TAX_BRACKETS;
  let remaining = annualIncome;
  let previousUpTo = 0;
  let totalTax = 0;
  const breakdown: { bracket: string; taxableAmount: number; rate: number; tax: number }[] = [];

  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const bracketSize = bracket.upTo - previousUpTo;
    const taxableInBracket = Math.min(remaining, bracketSize);
    const taxInBracket = taxableInBracket * bracket.rate;
    totalTax += taxInBracket;
    if (taxableInBracket > 0) {
      breakdown.push({
        bracket: bracket.upTo === Infinity
          ? `${previousUpTo.toLocaleString("tr-TR")} TL +`
          : `${previousUpTo.toLocaleString("tr-TR")} – ${bracket.upTo.toLocaleString("tr-TR")} TL`,
        taxableAmount: taxableInBracket,
        rate: bracket.rate,
        tax: taxInBracket,
      });
    }
    remaining -= taxableInBracket;
    previousUpTo = bracket.upTo;
  }

  return { tax: totalTax, breakdown };
}

// ─── Gross → Net ──────────────────────────────────────────────────────────────

export interface GrossToNetResult {
  gross: number;
  sgkWorker: number;
  unemployment: number;
  taxBase: number;
  monthlyIncomeTax: number;
  stampTax: number;
  agi: number;
  net: number;
  effectiveRate: number;
  taxBreakdown: { bracket: string; taxableAmount: number; rate: number; tax: number }[];
}

export function grossToNet(grossMonthly: number): GrossToNetResult {
  const sgkWorker = grossMonthly * PAYROLL_2025.SGK_WORKER_RATE;
  const unemployment = grossMonthly * PAYROLL_2025.UNEMPLOYMENT_WORKER_RATE;
  const taxBase = grossMonthly - sgkWorker - unemployment;

  // Annual basis for progressive tax
  const annualTaxBase = taxBase * 12;
  const { tax: annualTax, breakdown } = calculateAnnualIncomeTax(annualTaxBase);
  const monthlyIncomeTax = annualTax / 12;

  const stampTax = grossMonthly * PAYROLL_2025.STAMP_TAX_RATE;
  const agi = PAYROLL_2025.AGI_SINGLE_MONTHLY;

  const net = grossMonthly - sgkWorker - unemployment - monthlyIncomeTax - stampTax + agi;
  const totalDeductions = sgkWorker + unemployment + monthlyIncomeTax + stampTax - agi;
  const effectiveRate = (totalDeductions / grossMonthly) * 100;

  return {
    gross: grossMonthly,
    sgkWorker,
    unemployment,
    taxBase,
    monthlyIncomeTax,
    stampTax,
    agi,
    net,
    effectiveRate,
    taxBreakdown: breakdown,
  };
}

// ─── Net → Gross (binary search) ─────────────────────────────────────────────

export function netToGross(targetNet: number): { gross: number; details: GrossToNetResult } {
  let lo = targetNet;
  let hi = targetNet * 3;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const result = grossToNet(mid);
    if (Math.abs(result.net - targetNet) < 0.01) {
      return { gross: mid, details: result };
    }
    if (result.net < targetNet) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const finalResult = grossToNet((lo + hi) / 2);
  return { gross: (lo + hi) / 2, details: finalResult };
}

// ─── Overtime ─────────────────────────────────────────────────────────────────

export type OvertimeType = "weekday" | "weekend" | "holiday";

export interface OvertimeResult {
  normalWage: number;
  overtimePay: number;
  total: number;
  overtimeHours: number;
  overtimeRate: number;
}

export function calculateOvertime(
  normalHoursPerWeek: number,
  actualHours: number,
  hourlyRate: number,
  overtimeType: OvertimeType
): OvertimeResult {
  const overtimeHours = Math.max(0, actualHours - normalHoursPerWeek);
  const normalHours = Math.min(actualHours, normalHoursPerWeek);
  const normalWage = normalHours * hourlyRate;

  const overtimeMultiplier = overtimeType === "weekday" ? 1.5 : 2.0;
  const overtimePay = overtimeHours * hourlyRate * overtimeMultiplier;

  return {
    normalWage,
    overtimePay,
    total: normalWage + overtimePay,
    overtimeHours,
    overtimeRate: overtimeMultiplier,
  };
}

export function hourlyRateFromMonthly(monthlyGross: number, weeklyHours = 45): number {
  const monthlyHours = (weeklyHours * 52) / 12;
  return monthlyGross / monthlyHours;
}

// ─── Employer Cost ─────────────────────────────────────────────────────────────

export interface EmployerCostResult {
  grossSalary: number;
  sgkEmployer: number;
  unemploymentEmployer: number;
  totalEmployerCost: number;
  totalOverGross: number; // percentage over gross
}

export function employerCost(grossMonthly: number): EmployerCostResult {
  const sgkEmployer = grossMonthly * PAYROLL_2025.SGK_EMPLOYER_RATE;
  const unemploymentEmployer = grossMonthly * PAYROLL_2025.UNEMPLOYMENT_EMPLOYER_RATE;
  const totalEmployerCost = grossMonthly + sgkEmployer + unemploymentEmployer;
  const totalOverGross = ((totalEmployerCost - grossMonthly) / grossMonthly) * 100;

  return { grossSalary: grossMonthly, sgkEmployer, unemploymentEmployer, totalEmployerCost, totalOverGross };
}
