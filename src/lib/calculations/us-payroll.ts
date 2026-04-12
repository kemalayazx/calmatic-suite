export type FilingStatus = "single" | "mfj" | "hoh";

interface BracketResult {
  min: number;
  max: number | null;
  rate: number;
  taxableIncome: number;
  tax: number;
}

// ─── Params Interface ─────────────────────────────────────────────────────────

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface StateTaxConfig {
  type: "none" | "flat" | "progressive";
  rate?: number;
  brackets?: TaxBracket[];
}

export interface USPayrollParams {
  standardDeduction: {
    single: number;
    mfj: number;
    hoh: number;
  };
  socialSecurityRate: number;
  socialSecurityCap: number;
  medicareRate: number;
  additionalMedicareRate: number;
  additionalMedicareThreshold: {
    single: number;
    mfj: number;
  };
  federalBrackets: {
    single: TaxBracket[];
    mfj: TaxBracket[];
    hoh: TaxBracket[];
  };
  stateTaxes: Record<string, StateTaxConfig>;
}

// ─── Default 2025 Params ──────────────────────────────────────────────────────

export const DEFAULT_2025_PARAMS: USPayrollParams = {
  standardDeduction: {
    single: 15000,
    mfj: 30000,
    hoh: 22500,
  },
  socialSecurityRate: 0.062,
  socialSecurityCap: 176100,
  medicareRate: 0.0145,
  additionalMedicareRate: 0.009,
  additionalMedicareThreshold: {
    single: 200000,
    mfj: 250000,
  },
  federalBrackets: {
    single: [
      { min: 0, max: 11925, rate: 0.10 },
      { min: 11925, max: 48475, rate: 0.12 },
      { min: 48475, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250525, rate: 0.32 },
      { min: 250525, max: 626350, rate: 0.35 },
      { min: 626350, max: null, rate: 0.37 },
    ],
    mfj: [
      { min: 0, max: 23850, rate: 0.10 },
      { min: 23850, max: 96950, rate: 0.12 },
      { min: 96950, max: 206700, rate: 0.22 },
      { min: 206700, max: 394600, rate: 0.24 },
      { min: 394600, max: 501050, rate: 0.32 },
      { min: 501050, max: 751600, rate: 0.35 },
      { min: 751600, max: null, rate: 0.37 },
    ],
    hoh: [
      { min: 0, max: 17000, rate: 0.10 },
      { min: 17000, max: 64850, rate: 0.12 },
      { min: 64850, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250500, rate: 0.32 },
      { min: 250500, max: 626350, rate: 0.35 },
      { min: 626350, max: null, rate: 0.37 },
    ],
  },
  stateTaxes: {
    CA: {
      type: "progressive",
      brackets: [
        { min: 0, max: 10099, rate: 0.01 },
        { min: 10099, max: 23942, rate: 0.02 },
        { min: 23942, max: 37788, rate: 0.04 },
        { min: 37788, max: 52455, rate: 0.06 },
        { min: 52455, max: 66295, rate: 0.08 },
        { min: 66295, max: 338639, rate: 0.093 },
        { min: 338639, max: 406364, rate: 0.103 },
        { min: 406364, max: 677275, rate: 0.113 },
        { min: 677275, max: 1000000, rate: 0.123 },
        { min: 1000000, max: null, rate: 0.133 },
      ],
    },
    TX: { type: "none" },
    FL: { type: "none" },
    NY: {
      type: "progressive",
      brackets: [
        { min: 0, max: 17150, rate: 0.04 },
        { min: 17150, max: 23600, rate: 0.045 },
        { min: 23600, max: 27900, rate: 0.0525 },
        { min: 27900, max: 161550, rate: 0.0585 },
        { min: 161550, max: 323200, rate: 0.0625 },
        { min: 323200, max: 2155350, rate: 0.0685 },
        { min: 2155350, max: 5000000, rate: 0.0965 },
        { min: 5000000, max: 25000000, rate: 0.103 },
        { min: 25000000, max: null, rate: 0.109 },
      ],
    },
    PA: { type: "flat", rate: 0.0307 },
    IL: { type: "flat", rate: 0.0495 },
    OH: {
      type: "progressive",
      brackets: [
        { min: 0, max: 26050, rate: 0 },
        { min: 26050, max: 100000, rate: 0.02765 },
        { min: 100000, max: 115300, rate: 0.03226 },
        { min: 115300, max: null, rate: 0.0375 },
      ],
    },
    GA: {
      type: "progressive",
      brackets: [
        { min: 0, max: 750, rate: 0.01 },
        { min: 750, max: 2250, rate: 0.02 },
        { min: 2250, max: 3750, rate: 0.03 },
        { min: 3750, max: 5250, rate: 0.04 },
        { min: 5250, max: 7000, rate: 0.05 },
        { min: 7000, max: null, rate: 0.0549 },
      ],
    },
    WA: { type: "none" },
    NJ: {
      type: "progressive",
      brackets: [
        { min: 0, max: 20000, rate: 0.014 },
        { min: 20000, max: 35000, rate: 0.0175 },
        { min: 35000, max: 40000, rate: 0.035 },
        { min: 40000, max: 75000, rate: 0.05525 },
        { min: 75000, max: 500000, rate: 0.0637 },
        { min: 500000, max: 1000000, rate: 0.0897 },
        { min: 1000000, max: null, rate: 0.1075 },
      ],
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcProgressiveTax(income: number, brackets: TaxBracket[]): number {
  let tax = 0;
  for (const b of brackets) {
    const upper = b.max ?? Infinity;
    const taxable = Math.min(Math.max(income - b.min, 0), upper - b.min);
    tax += taxable * b.rate;
  }
  return tax;
}

// ─── Federal Tax ──────────────────────────────────────────────────────────────

export interface FederalTaxResult {
  grossSalary: number;
  standardDeduction: number;
  taxableIncome: number;
  brackets: BracketResult[];
  totalFederalTax: number;
  effectiveRate: number;
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  totalFICA: number;
  totalTax: number;
  netAnnual: number;
  netMonthly: number;
  netBiweekly: number;
}

export function calculateFederalTax(
  gross: number,
  filingStatus: FilingStatus,
  params: USPayrollParams = DEFAULT_2025_PARAMS
): FederalTaxResult {
  const deduction = params.standardDeduction[filingStatus];
  const taxableIncome = Math.max(0, gross - deduction);

  const bracketList =
    filingStatus === "mfj"
      ? params.federalBrackets.mfj
      : filingStatus === "hoh"
      ? params.federalBrackets.hoh
      : params.federalBrackets.single;

  const brackets: BracketResult[] = bracketList.map((b) => {
    const lower = b.min;
    const upper = b.max ?? Infinity;
    const taxableInBracket = Math.min(Math.max(taxableIncome - lower, 0), upper - lower);
    return {
      min: b.min,
      max: b.max,
      rate: b.rate,
      taxableIncome: taxableInBracket,
      tax: taxableInBracket * b.rate,
    };
  });

  const totalFederalTax = brackets.reduce((sum, b) => sum + b.tax, 0);
  const effectiveRate = gross > 0 ? totalFederalTax / gross : 0;

  const socialSecurity = Math.min(gross, params.socialSecurityCap) * params.socialSecurityRate;
  const medicare = gross * params.medicareRate;
  const additionalMedicareThreshold =
    filingStatus === "mfj"
      ? params.additionalMedicareThreshold.mfj
      : params.additionalMedicareThreshold.single;
  const additionalMedicare =
    Math.max(0, gross - additionalMedicareThreshold) * params.additionalMedicareRate;
  const totalFICA = socialSecurity + medicare + additionalMedicare;

  const totalTax = totalFederalTax + totalFICA;
  const netAnnual = gross - totalTax;

  return {
    grossSalary: gross,
    standardDeduction: deduction,
    taxableIncome,
    brackets,
    totalFederalTax,
    effectiveRate,
    socialSecurity,
    medicare,
    additionalMedicare,
    totalFICA,
    totalTax,
    netAnnual,
    netMonthly: netAnnual / 12,
    netBiweekly: netAnnual / 26,
  };
}

// ─── State Tax ────────────────────────────────────────────────────────────────

export type StateCode = "CA" | "TX" | "FL" | "NY" | "PA" | "IL" | "OH" | "GA" | "WA" | "NJ";

const STATE_NAMES: Record<StateCode, string> = {
  CA: "California",
  TX: "Texas",
  FL: "Florida",
  NY: "New York",
  PA: "Pennsylvania",
  IL: "Illinois",
  OH: "Ohio",
  GA: "Georgia",
  WA: "Washington",
  NJ: "New Jersey",
};

export interface StateTaxResult {
  state: StateCode;
  stateName: string;
  stateTax: number;
  stateEffectiveRate: number;
}

export function calculateStateTax(
  grossIncome: number,
  state: StateCode,
  params: USPayrollParams = DEFAULT_2025_PARAMS
): StateTaxResult {
  const config = params.stateTaxes[state];
  let stateTax = 0;

  if (config) {
    if (config.type === "flat" && config.rate !== undefined) {
      stateTax = grossIncome * config.rate;
    } else if (config.type === "progressive" && config.brackets) {
      stateTax = calcProgressiveTax(grossIncome, config.brackets);
    }
    // "none" stays 0
  }

  return {
    state,
    stateName: STATE_NAMES[state],
    stateTax,
    stateEffectiveRate: grossIncome > 0 ? stateTax / grossIncome : 0,
  };
}

// ─── Hourly ↔ Salary ─────────────────────────────────────────────────────────

export interface HourlyResult {
  hourlyRate: number;
  annualSalary: number;
  weekly: number;
  biweekly: number;
  semiMonthly: number;
  monthly: number;
}

export function hourlyToSalary(hourlyRate: number): HourlyResult {
  const annualSalary = hourlyRate * 2080;
  return {
    hourlyRate,
    annualSalary,
    weekly: hourlyRate * 40,
    biweekly: hourlyRate * 80,
    semiMonthly: annualSalary / 24,
    monthly: annualSalary / 12,
  };
}

export function salaryToHourly(annualSalary: number): HourlyResult {
  const hourlyRate = annualSalary / 2080;
  return {
    hourlyRate,
    annualSalary,
    weekly: annualSalary / 52,
    biweekly: annualSalary / 26,
    semiMonthly: annualSalary / 24,
    monthly: annualSalary / 12,
  };
}

export function calculateOvertime(
  regularHours: number,
  hourlyRate: number
): {
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  overtimeHours: number;
} {
  const overtimeHours = Math.max(0, regularHours - 40);
  const regularHoursActual = Math.min(regularHours, 40);
  const regularPay = regularHoursActual * hourlyRate;
  const overtimePay = overtimeHours * hourlyRate * 1.5;
  return {
    regularPay,
    overtimePay,
    totalPay: regularPay + overtimePay,
    overtimeHours,
  };
}

export const ALL_STATES: { code: StateCode; name: string }[] = Object.entries(STATE_NAMES).map(
  ([code, name]) => ({
    code: code as StateCode,
    name,
  })
);
