export interface PayoffResult {
  months: number;
  totalInterest: number;
  totalPaid: number;
  minInterestWarning: boolean;
}

export function calcPayoff(
  balance: number,
  apr: number,
  monthlyPayment: number
): PayoffResult {
  const r = apr / 100 / 12;
  const minInterest = balance * r;
  const minInterestWarning = monthlyPayment <= minInterest;

  if (minInterestWarning) {
    return { months: -1, totalInterest: -1, totalPaid: -1, minInterestWarning: true };
  }

  let remaining = balance;
  let months = 0;
  let totalInterest = 0;
  const MAX = 600;

  while (remaining > 0.01 && months < MAX) {
    const interest = remaining * r;
    totalInterest += interest;
    remaining = remaining + interest - monthlyPayment;
    if (remaining < 0) remaining = 0;
    months++;
  }

  return { months, totalInterest, totalPaid: balance + totalInterest, minInterestWarning: false };
}

export interface MinimumPaymentRow {
  label: string;
  months: number;
  totalInterest: number;
  totalPaid: number;
  timeSaved: number;
  interestSaved: number;
}

export function calcMinimumTrap(
  balance: number,
  apr: number,
  minPaymentMethod: "percent" | "fixed",
  minValue: number
): MinimumPaymentRow[] {
  function getPayoff(payment: number): { months: number; totalInterest: number } {
    const r = apr / 100 / 12;
    let remaining = balance;
    let months = 0;
    let totalInterest = 0;
    const MAX = 1200;
    while (remaining > 0.01 && months < MAX) {
      const interest = remaining * r;
      const pay = minPaymentMethod === "percent" ? Math.max(remaining * (minValue / 100), 25) : payment;
      if (pay <= interest) return { months: -1, totalInterest: -1 };
      totalInterest += interest;
      remaining = remaining + interest - pay;
      if (remaining < 0) remaining = 0;
      months++;
    }
    return { months, totalInterest };
  }

  const basePayment = minPaymentMethod === "percent"
    ? Math.max(balance * (minValue / 100), 25)
    : minValue;

  const base = getPayoff(basePayment);

  const extras = [50, 100, 200];
  const rows: MinimumPaymentRow[] = [
    {
      label: minPaymentMethod === "percent" ? `Minimum (${minValue}%)` : `Minimum ($${minValue})`,
      months: base.months,
      totalInterest: base.totalInterest,
      totalPaid: balance + base.totalInterest,
      timeSaved: 0,
      interestSaved: 0,
    },
  ];

  for (const extra of extras) {
    const extraPayment = basePayment + extra;
    const r = getPayoff(extraPayment);
    if (r.months > 0) {
      rows.push({
        label: `+$${extra}/mo`,
        months: r.months,
        totalInterest: r.totalInterest,
        totalPaid: balance + r.totalInterest,
        timeSaved: base.months - r.months,
        interestSaved: base.totalInterest - r.totalInterest,
      });
    }
  }

  return rows;
}

export interface BalanceTransferResult {
  stayTotalInterest: number;
  transferTotalInterest: number;
  transferFee: number;
  savings: number;
  breakEvenMonth: number;
  recommendation: string;
}

export function calcBalanceTransfer(
  balance: number,
  currentApr: number,
  introPeriodMonths: number,
  regularAprAfter: number,
  transferFeePercent: number,
  monthlyPayment: number
): BalanceTransferResult {
  const transferFee = balance * (transferFeePercent / 100);
  const startingBalance = balance + transferFee;

  // Stay scenario
  const r1 = currentApr / 100 / 12;
  let rem1 = balance;
  let stayInterest = 0;
  const MAX = 600;
  let m1 = 0;
  while (rem1 > 0.01 && m1 < MAX) {
    const int = rem1 * r1;
    stayInterest += int;
    rem1 = rem1 + int - monthlyPayment;
    if (rem1 < 0) rem1 = 0;
    m1++;
  }

  // Transfer scenario
  const r0 = 0; // intro period 0%
  const r2 = regularAprAfter / 100 / 12;
  let rem2 = startingBalance;
  let transferInterest = 0;
  let breakEvenMonth = -1;
  let stayCumInterest = 0;
  let transferCumInterest = transferFee; // fee counts as cost

  let rem1b = balance;
  let m2 = 0;
  while (rem2 > 0.01 && m2 < MAX) {
    m2++;
    const r = m2 <= introPeriodMonths ? r0 : r2;
    const int = rem2 * r;
    transferInterest += int;
    rem2 = rem2 + int - monthlyPayment;
    if (rem2 < 0) rem2 = 0;

    // track break-even
    stayCumInterest += rem1b * r1;
    rem1b = rem1b + rem1b * r1 - monthlyPayment;
    if (rem1b < 0) rem1b = 0;
    transferCumInterest += int;

    if (breakEvenMonth === -1 && transferCumInterest < stayCumInterest) {
      breakEvenMonth = m2;
    }
  }

  const savings = stayInterest - (transferInterest + transferFee);
  const recommendation = savings > 0
    ? `Transfer saves you $${Math.abs(savings).toFixed(0)}. Break-even at month ${breakEvenMonth > 0 ? breakEvenMonth : "N/A"}.`
    : `Transfer costs $${Math.abs(savings).toFixed(0)} more due to fee. Consider staying.`;

  return {
    stayTotalInterest: stayInterest,
    transferTotalInterest: transferInterest,
    transferFee,
    savings,
    breakEvenMonth,
    recommendation,
  };
}
