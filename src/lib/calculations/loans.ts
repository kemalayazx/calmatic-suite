export interface LoanInput {
  amount: number;
  annualRate: number;
  termMonths: number;
  fees: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  effectiveAPR: number;
}

export function calculateLoan(loan: LoanInput): LoanResult {
  const { amount, annualRate, termMonths, fees } = loan;
  const monthlyRate = annualRate / 100 / 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = amount / termMonths;
  } else {
    monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  const totalPaid = monthlyPayment * termMonths + fees;
  const totalInterest = totalPaid - amount - fees;

  // Effective APR using Newton's method to solve for rate including fees
  const totalLoanCost = monthlyPayment * termMonths;
  const netAmount = amount - fees; // fees paid upfront reduce net proceeds
  let effectiveAPR = annualRate; // fallback

  if (fees > 0 && netAmount > 0) {
    // Solve for monthly rate: netAmount = payment * (1 - (1+r)^-n) / r
    let r = monthlyRate;
    for (let i = 0; i < 100; i++) {
      const f = r === 0 ? monthlyPayment * termMonths - netAmount :
        monthlyPayment * (1 - Math.pow(1 + r, -termMonths)) / r - netAmount;
      const df = r === 0 ? 0 :
        monthlyPayment * ((-termMonths * Math.pow(1 + r, -termMonths - 1) * r -
          (1 - Math.pow(1 + r, -termMonths))) / (r * r));
      if (Math.abs(df) < 1e-10) break;
      const rNew = r - f / df;
      if (Math.abs(rNew - r) < 1e-10) { r = rNew; break; }
      r = rNew;
    }
    effectiveAPR = r * 12 * 100;
  }

  return {
    monthlyPayment,
    totalPaid,
    totalInterest,
    effectiveAPR: Math.max(0, effectiveAPR),
  };
}
