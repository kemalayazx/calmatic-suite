export interface MortgagePaymentResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  principal: number;
  loanAmount: number;
  downPaymentAmount: number;
}

export function calculateMonthlyPayment(
  homePrice: number,
  downPayment: number,
  isDownPaymentPercent: boolean,
  annualRate: number,
  termYears: number
): MortgagePaymentResult {
  const downPaymentAmount = isDownPaymentPercent ? (homePrice * downPayment) / 100 : downPayment;
  const loanAmount = homePrice - downPaymentAmount;
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / numPayments;
  } else {
    monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  const totalCost = monthlyPayment * numPayments + downPaymentAmount;
  const totalInterest = monthlyPayment * numPayments - loanAmount;

  return {
    monthlyPayment,
    totalInterest,
    totalCost,
    principal: loanAmount,
    loanAmount,
    downPaymentAmount,
  };
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function generateAmortizationSchedule(
  loanAmount: number,
  annualRate: number,
  termYears: number
): AmortizationRow[] {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  let balance = loanAmount;
  const rows: AmortizationRow[] = [];

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / numPayments;
  } else {
    monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  for (let month = 1; month <= numPayments; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance = Math.max(0, balance - principalPayment);

    rows.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance,
    });
  }

  return rows;
}

export interface AffordabilityResult {
  maxHomePrice: number;
  maxMonthlyHousing: number;
  maxTotalDebt: number;
  monthlyDebtPayment: number;
  grossMonthlyIncome: number;
  debtToIncomeRatio: number;
  isAffordable: boolean;
  limitingFactor: "income" | "debt";
}

export function calculateAffordability(
  annualIncome: number,
  monthlyDebts: number,
  downPayment: number,
  annualRate: number,
  termYears: number
): AffordabilityResult {
  const grossMonthlyIncome = annualIncome / 12;
  const maxMonthlyHousing = grossMonthlyIncome * 0.28;
  const maxTotalDebt = grossMonthlyIncome * 0.36;
  const maxHousingFromDebt = maxTotalDebt - monthlyDebts;
  const effectiveMaxHousing = Math.min(maxMonthlyHousing, maxHousingFromDebt);
  const limitingFactor: "income" | "debt" = maxHousingFromDebt < maxMonthlyHousing ? "debt" : "income";

  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;

  let maxLoanAmount: number;
  if (monthlyRate === 0) {
    maxLoanAmount = effectiveMaxHousing * numPayments;
  } else {
    maxLoanAmount = effectiveMaxHousing * (Math.pow(1 + monthlyRate, numPayments) - 1) /
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
  }

  const maxHomePrice = maxLoanAmount + downPayment;
  const debtToIncomeRatio = (monthlyDebts + effectiveMaxHousing) / grossMonthlyIncome;

  return {
    maxHomePrice,
    maxMonthlyHousing,
    maxTotalDebt,
    monthlyDebtPayment: monthlyDebts,
    grossMonthlyIncome,
    debtToIncomeRatio,
    isAffordable: effectiveMaxHousing > 0,
    limitingFactor,
  };
}

export interface RefinanceResult {
  currentMonthlyPayment: number;
  newMonthlyPayment: number;
  monthlySavings: number;
  breakEvenMonths: number;
  totalSavings: number;
  newTotalCost: number;
  currentTotalRemaining: number;
}

export function calculateRefinance(
  currentBalance: number,
  currentRate: number,
  currentRemainingMonths: number,
  newRate: number,
  newTermMonths: number,
  closingCosts: number
): RefinanceResult {
  const calcPayment = (principal: number, monthlyRate: number, n: number) => {
    if (monthlyRate === 0) return principal / n;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
      (Math.pow(1 + monthlyRate, n) - 1);
  };

  const currentMonthlyPayment = calcPayment(currentBalance, currentRate / 100 / 12, currentRemainingMonths);
  const newMonthlyPayment = calcPayment(currentBalance, newRate / 100 / 12, newTermMonths);

  const monthlySavings = currentMonthlyPayment - newMonthlyPayment;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : Infinity;

  const currentTotalRemaining = currentMonthlyPayment * currentRemainingMonths;
  const newTotalCost = newMonthlyPayment * newTermMonths + closingCosts;
  const totalSavings = currentTotalRemaining - newTotalCost;

  return {
    currentMonthlyPayment,
    newMonthlyPayment,
    monthlySavings,
    breakEvenMonths,
    totalSavings,
    newTotalCost,
    currentTotalRemaining,
  };
}
