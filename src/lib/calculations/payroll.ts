// Payroll calculations — Turkey 2025 parameters

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface TaxBracket {
  min: number;
  max: number; // Infinity for last bracket
  rate: number;
}

export interface PayrollParams {
  sgkEmployee: number;           // 0.14
  unemploymentEmployee: number;  // 0.01
  stampTax: number;              // 0.00759
  agi: number;                   // 2006
  sgkEmployer: number;           // 0.205
  unemploymentEmployer: number;  // 0.02
  taxBrackets: TaxBracket[];
}

// ─── Constants (2025) ─────────────────────────────────────────────────────────

export const DEFAULT_2025_PARAMS: PayrollParams = {
  sgkEmployee: 0.14,
  unemploymentEmployee: 0.01,
  stampTax: 0.00759,
  agi: 2006,
  sgkEmployer: 0.205,
  unemploymentEmployer: 0.02,
  taxBrackets: [
    { min: 0,         max: 158_000,   rate: 0.15 },
    { min: 158_001,   max: 330_000,   rate: 0.20 },
    { min: 330_001,   max: 800_000,   rate: 0.27 },
    { min: 800_001,   max: 4_300_000, rate: 0.35 },
    { min: 4_300_001, max: Infinity,  rate: 0.40 },
  ],
};

// Legacy constant for backwards compatibility
export const PAYROLL_2025 = {
  SGK_WORKER_RATE: DEFAULT_2025_PARAMS.sgkEmployee,
  UNEMPLOYMENT_WORKER_RATE: DEFAULT_2025_PARAMS.unemploymentEmployee,
  STAMP_TAX_RATE: DEFAULT_2025_PARAMS.stampTax,
  AGI_SINGLE_MONTHLY: DEFAULT_2025_PARAMS.agi,
  SGK_EMPLOYER_RATE: DEFAULT_2025_PARAMS.sgkEmployer,
  UNEMPLOYMENT_EMPLOYER_RATE: DEFAULT_2025_PARAMS.unemploymentEmployer,
  TAX_BRACKETS: [
    { upTo: 158_000,   rate: 0.15 },
    { upTo: 330_000,   rate: 0.20 },
    { upTo: 800_000,   rate: 0.27 },
    { upTo: 4_300_000, rate: 0.35 },
    { upTo: Infinity,  rate: 0.40 },
  ],
};

// ─── Income Tax Calculation (annual basis, return annual) ─────────────────────

export function calculateAnnualIncomeTax(
  annualIncome: number,
  params: PayrollParams = DEFAULT_2025_PARAMS
): {
  tax: number;
  breakdown: { bracket: string; taxableAmount: number; rate: number; tax: number }[];
} {
  let remaining = annualIncome;
  let totalTax = 0;
  const breakdown: { bracket: string; taxableAmount: number; rate: number; tax: number }[] = [];

  for (const bracket of params.taxBrackets) {
    if (remaining <= 0) break;
    const bracketSize = bracket.max === Infinity
      ? Infinity
      : bracket.max - bracket.min + 1;
    const taxableInBracket = bracketSize === Infinity
      ? remaining
      : Math.min(remaining, bracketSize);
    const taxInBracket = taxableInBracket * bracket.rate;
    totalTax += taxInBracket;
    if (taxableInBracket > 0) {
      breakdown.push({
        bracket: bracket.max === Infinity
          ? `${bracket.min.toLocaleString("tr-TR")} TL +`
          : `${bracket.min.toLocaleString("tr-TR")} – ${bracket.max.toLocaleString("tr-TR")} TL`,
        taxableAmount: taxableInBracket,
        rate: bracket.rate,
        tax: taxInBracket,
      });
    }
    remaining -= taxableInBracket;
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

export function grossToNet(
  grossMonthly: number,
  params: PayrollParams = DEFAULT_2025_PARAMS
): GrossToNetResult {
  const sgkWorker = grossMonthly * params.sgkEmployee;
  const unemployment = grossMonthly * params.unemploymentEmployee;
  const taxBase = grossMonthly - sgkWorker - unemployment;

  // Annual basis for progressive tax
  const annualTaxBase = taxBase * 12;
  const { tax: annualTax, breakdown } = calculateAnnualIncomeTax(annualTaxBase, params);
  const monthlyIncomeTax = annualTax / 12;

  const stampTaxAmount = grossMonthly * params.stampTax;
  const agiAmount = params.agi;

  const net = grossMonthly - sgkWorker - unemployment - monthlyIncomeTax - stampTaxAmount + agiAmount;
  const totalDeductions = sgkWorker + unemployment + monthlyIncomeTax + stampTaxAmount - agiAmount;
  const effectiveRate = (totalDeductions / grossMonthly) * 100;

  return {
    gross: grossMonthly,
    sgkWorker,
    unemployment,
    taxBase,
    monthlyIncomeTax,
    stampTax: stampTaxAmount,
    agi: agiAmount,
    net,
    effectiveRate,
    taxBreakdown: breakdown,
  };
}

// ─── Net → Gross (binary search) ─────────────────────────────────────────────

export function netToGross(
  targetNet: number,
  params: PayrollParams = DEFAULT_2025_PARAMS
): { gross: number; details: GrossToNetResult } {
  let lo = targetNet;
  let hi = targetNet * 3;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const result = grossToNet(mid, params);
    if (Math.abs(result.net - targetNet) < 0.01) {
      return { gross: mid, details: result };
    }
    if (result.net < targetNet) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const finalResult = grossToNet((lo + hi) / 2, params);
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

export function employerCost(
  grossMonthly: number,
  params: PayrollParams = DEFAULT_2025_PARAMS
): EmployerCostResult {
  const sgkEmployer = grossMonthly * params.sgkEmployer;
  const unemploymentEmployer = grossMonthly * params.unemploymentEmployer;
  const totalEmployerCost = grossMonthly + sgkEmployer + unemploymentEmployer;
  const totalOverGross = ((totalEmployerCost - grossMonthly) / grossMonthly) * 100;

  return { grossSalary: grossMonthly, sgkEmployer, unemploymentEmployer, totalEmployerCost, totalOverGross };
}
