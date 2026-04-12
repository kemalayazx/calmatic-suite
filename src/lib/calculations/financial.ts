export interface SimpleInterestResult {
  interest: number;
  total: number;
}

export function simpleInterest(
  principal: number,
  rate: number,
  years: number
): SimpleInterestResult {
  const interest = (principal * rate * years) / 100;
  return { interest, total: principal + interest };
}

export interface CompoundInterestResult {
  total: number;
  earned: number;
  yearlyData: { year: number; balance: number }[];
}

export function compoundInterest(
  principal: number,
  rate: number,
  years: number,
  periodsPerYear: number
): CompoundInterestResult {
  const yearlyData: { year: number; balance: number }[] = [];
  for (let y = 1; y <= years; y++) {
    const balance = principal * Math.pow(1 + rate / 100 / periodsPerYear, periodsPerYear * y);
    yearlyData.push({ year: y, balance });
  }
  const total = yearlyData[yearlyData.length - 1]?.balance ?? principal;
  return { total, earned: total - principal, yearlyData };
}

export interface LoanRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: LoanRow[];
}

export function loanPayment(
  principal: number,
  annualRate: number,
  months: number
): LoanResult {
  if (annualRate === 0) {
    const payment = principal / months;
    const schedule: LoanRow[] = Array.from({ length: months }, (_, i) => ({
      month: i + 1,
      payment,
      principal: payment,
      interest: 0,
      balance: principal - payment * (i + 1),
    }));
    return { monthlyPayment: payment, totalPayment: payment * months, totalInterest: 0, schedule };
  }
  const r = annualRate / 100 / 12;
  const monthlyPayment = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const schedule: LoanRow[] = [];
  let balance = principal;
  for (let m = 1; m <= months; m++) {
    const interest = balance * r;
    const principalPart = monthlyPayment - interest;
    balance -= principalPart;
    schedule.push({
      month: m,
      payment: monthlyPayment,
      principal: principalPart,
      interest,
      balance: Math.max(0, balance),
    });
  }
  return {
    monthlyPayment,
    totalPayment: monthlyPayment * months,
    totalInterest: monthlyPayment * months - principal,
    schedule,
  };
}
