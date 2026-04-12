export interface SavingsGoalResult {
  monthsToGoal: number;
  totalContributions: number;
  totalInterest: number;
  finalAmount: number;
  schedule: { month: number; balance: number; contributions: number; interest: number }[];
}

export function calcSavingsGoal(
  target: number,
  current: number,
  monthly: number,
  annualRate: number
): SavingsGoalResult {
  const r = annualRate / 100 / 12;
  let balance = current;
  let totalContributions = 0;
  let totalInterest = 0;
  const schedule: SavingsGoalResult["schedule"] = [];

  let month = 0;
  const MAX_MONTHS = 600; // 50 years cap

  while (balance < target && month < MAX_MONTHS) {
    month++;
    const interest = balance * r;
    balance += interest + monthly;
    totalContributions += monthly;
    totalInterest += interest;
    schedule.push({ month, balance, contributions: totalContributions + current, interest: totalInterest });
    if (schedule.length > 120) schedule.shift(); // keep last 120 for chart
  }

  // rebuild schedule properly for chart (max 60 points)
  let bal2 = current;
  let tc = 0;
  let ti = 0;
  const fullSchedule: SavingsGoalResult["schedule"] = [{ month: 0, balance: current, contributions: current, interest: 0 }];
  const step = Math.max(1, Math.ceil(month / 60));
  for (let m = 1; m <= month; m++) {
    const int = bal2 * r;
    bal2 += int + monthly;
    tc += monthly;
    ti += int;
    if (m % step === 0 || m === month) {
      fullSchedule.push({ month: m, balance: bal2, contributions: tc + current, interest: ti });
    }
  }

  return {
    monthsToGoal: month >= MAX_MONTHS ? -1 : month,
    totalContributions,
    totalInterest,
    finalAmount: balance,
    schedule: fullSchedule,
  };
}

export interface EmergencyFundResult {
  threeMonth: number;
  sixMonth: number;
  twelveMonth: number;
  gapThree: number;
  gapSix: number;
  gapTwelve: number;
  monthsToThree: (monthly: number) => number;
  monthsToSix: (monthly: number) => number;
  monthsToTwelve: (monthly: number) => number;
}

export function calcEmergencyFund(monthlyExpenses: number, currentSavings: number): EmergencyFundResult {
  const threeMonth = monthlyExpenses * 3;
  const sixMonth = monthlyExpenses * 6;
  const twelveMonth = monthlyExpenses * 12;
  const gapThree = Math.max(0, threeMonth - currentSavings);
  const gapSix = Math.max(0, sixMonth - currentSavings);
  const gapTwelve = Math.max(0, twelveMonth - currentSavings);

  return {
    threeMonth,
    sixMonth,
    twelveMonth,
    gapThree,
    gapSix,
    gapTwelve,
    monthsToThree: (m: number) => (m <= 0 ? 0 : Math.ceil(gapThree / m)),
    monthsToSix: (m: number) => (m <= 0 ? 0 : Math.ceil(gapSix / m)),
    monthsToTwelve: (m: number) => (m <= 0 ? 0 : Math.ceil(gapTwelve / m)),
  };
}

export interface CDResult {
  maturityValue: number;
  interestEarned: number;
}

export function calcCD(
  principal: number,
  apy: number,
  termMonths: number,
  compounding: "daily" | "monthly" | "quarterly" | "yearly"
): CDResult {
  const n: Record<string, number> = { daily: 365, monthly: 12, quarterly: 4, yearly: 1 };
  const periodsPerYear = n[compounding];
  const r = apy / 100;
  const t = termMonths / 12;
  const maturityValue = principal * Math.pow(1 + r / periodsPerYear, periodsPerYear * t);
  return { maturityValue, interestEarned: maturityValue - principal };
}
