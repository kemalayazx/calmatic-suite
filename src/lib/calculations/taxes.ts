// Tax calculations — Turkey 2025 parameters

// ─── VAT / Invoice ────────────────────────────────────────────────────────────

export type VATRate = 1 | 8 | 18 | 20;

export interface InvoiceTaxResult {
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  stampTax: number;
  otvAmount: number;
  stopajAmount: number;
  totalTaxes: number;
  buyerTotal: number;
  sellerToGovt: number;
}

export function invoiceTaxBreakdown(
  inputAmount: number,
  inputType: "net" | "gross",
  vatRate: VATRate,
  otvRate: number,       // percentage, 0 if none
  stopajRate: number     // percentage, 0 if none
): InvoiceTaxResult {
  const vatMultiplier = 1 + vatRate / 100;

  const netAmount = inputType === "net" ? inputAmount : inputAmount / vatMultiplier;
  const grossAmount = netAmount * vatMultiplier;
  const vatAmount = grossAmount - netAmount;

  // Invoice stamp tax: binde 9.48 = 0.00948 (over gross)
  const stampTax = grossAmount * 0.00948;
  const otvAmount = netAmount * (otvRate / 100);
  const stopajAmount = grossAmount * (stopajRate / 100);

  const totalTaxes = vatAmount + stampTax + otvAmount + stopajAmount;
  const buyerTotal = grossAmount + stampTax + otvAmount;
  const sellerToGovt = vatAmount + stampTax;

  return {
    netAmount,
    vatAmount,
    grossAmount,
    stampTax,
    otvAmount,
    stopajAmount,
    totalTaxes,
    buyerTotal,
    sellerToGovt,
  };
}

// ─── Annual Income Tax (2025 brackets) ────────────────────────────────────────

const TAX_BRACKETS_2025 = [
  { upTo: 158_000,    rate: 0.15 },
  { upTo: 330_000,    rate: 0.20 },
  { upTo: 800_000,    rate: 0.27 },
  { upTo: 4_300_000,  rate: 0.35 },
  { upTo: Infinity,   rate: 0.40 },
];

export interface IncomeTaxBracketRow {
  bracket: string;
  taxableAmount: number;
  rate: number;
  tax: number;
}

export interface AnnualIncomeTaxResult {
  annualIncome: number;
  totalTax: number;
  effectiveRate: number;
  breakdown: IncomeTaxBracketRow[];
}

export function annualIncomeTax(annualIncome: number): AnnualIncomeTaxResult {
  let remaining = annualIncome;
  let previousUpTo = 0;
  let totalTax = 0;
  const breakdown: IncomeTaxBracketRow[] = [];

  for (const bracket of TAX_BRACKETS_2025) {
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

  return {
    annualIncome,
    totalTax,
    effectiveRate: annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0,
    breakdown,
  };
}

// ─── Stopaj (Withholding Tax) ─────────────────────────────────────────────────

export type StopajType =
  | "freelance"
  | "rent"
  | "dividend"
  | "securities"
  | "other";

export const STOPAJ_RATES: Record<StopajType, { label: string; rate: number }> = {
  freelance:  { label: "Serbest Meslek Makbuzu", rate: 0.20 },
  rent:       { label: "Kira Geliri",             rate: 0.20 },
  dividend:   { label: "Temettü",                 rate: 0.10 },
  securities: { label: "Menkul Kıymet",           rate: 0.10 },
  other:      { label: "Diğer",                   rate: 0.15 },
};

export interface StopajResult {
  grossAmount: number;
  stopajAmount: number;
  netAmount: number;
  rate: number;
}

export function stopajHesapla(grossAmount: number, type: StopajType): StopajResult {
  const rate = STOPAJ_RATES[type].rate;
  const stopajAmount = grossAmount * rate;
  return {
    grossAmount,
    stopajAmount,
    netAmount: grossAmount - stopajAmount,
    rate,
  };
}
