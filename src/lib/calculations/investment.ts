export interface CompoundGrowthResult {
  finalValue: number;
  totalContributions: number;
  totalEarnings: number;
  yearlyData: { year: number; contributions: number; value: number }[];
}

export function calculateCompoundGrowth(
  initialInvestment: number,
  monthlyContribution: number,
  annualReturnRate: number,
  years: number
): CompoundGrowthResult {
  const monthlyRate = annualReturnRate / 100 / 12;
  const yearlyData: { year: number; contributions: number; value: number }[] = [];

  let value = initialInvestment;
  let totalContributions = initialInvestment;

  for (let year = 1; year <= years; year++) {
    for (let m = 0; m < 12; m++) {
      value = value * (1 + monthlyRate) + monthlyContribution;
      totalContributions += monthlyContribution;
    }
    yearlyData.push({ year, contributions: totalContributions, value });
  }

  return {
    finalValue: value,
    totalContributions,
    totalEarnings: value - totalContributions,
    yearlyData,
  };
}

export interface ROIResult {
  roi: number;
  annualizedReturn: number;
  totalGain: number;
}

export function calculateROI(
  initialInvestment: number,
  finalValue: number,
  years: number
): ROIResult {
  const totalGain = finalValue - initialInvestment;
  const roi = initialInvestment > 0 ? (totalGain / initialInvestment) * 100 : 0;
  const annualizedReturn = initialInvestment > 0 && years > 0
    ? (Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100
    : 0;

  return { roi, annualizedReturn, totalGain };
}

export interface RetirementResult {
  projectedSavings: number;
  monthlyWithdrawal: number;
  totalMonthsWithdrawal: number;
  willMoneyLast: boolean;
  yearlyData: { age: number; savings: number }[];
  inflationAdjustedWithdrawal: number;
}

export function calculateRetirement(
  currentAge: number,
  retirementAge: number,
  currentSavings: number,
  monthlySavings: number,
  expectedReturnRate: number,
  expectedInflationRate: number
): RetirementResult {
  const yearsToRetirement = retirementAge - currentAge;
  const monthlyRate = expectedReturnRate / 100 / 12;
  const yearlyData: { age: number; savings: number }[] = [];

  let savings = currentSavings;

  for (let year = 1; year <= yearsToRetirement; year++) {
    for (let m = 0; m < 12; m++) {
      savings = savings * (1 + monthlyRate) + monthlySavings;
    }
    yearlyData.push({ age: currentAge + year, savings });
  }

  const projectedSavings = savings;
  // 4% safe withdrawal rule (annual), converted to monthly
  const annualWithdrawal = projectedSavings * 0.04;
  const monthlyWithdrawal = annualWithdrawal / 12;
  const inflationAdjustedWithdrawal = monthlyWithdrawal / Math.pow(1 + expectedInflationRate / 100, yearsToRetirement);

  // Check if money lasts to age 90
  const withdrawalYears = 90 - retirementAge;
  const withdrawalMonthlyRate = (expectedReturnRate - expectedInflationRate) / 100 / 12;
  const totalMonthsWithdrawal = withdrawalYears * 12;

  let withdrawalBalance = projectedSavings;
  let willMoneyLast = true;
  for (let m = 0; m < totalMonthsWithdrawal; m++) {
    withdrawalBalance = withdrawalBalance * (1 + withdrawalMonthlyRate) - monthlyWithdrawal;
    if (withdrawalBalance <= 0) {
      willMoneyLast = false;
      break;
    }
  }

  // Add withdrawal phase to yearlyData
  let wBalance = projectedSavings;
  for (let year = 1; year <= withdrawalYears; year++) {
    for (let m = 0; m < 12; m++) {
      wBalance = wBalance * (1 + withdrawalMonthlyRate) - monthlyWithdrawal;
      if (wBalance < 0) { wBalance = 0; break; }
    }
    yearlyData.push({ age: retirementAge + year, savings: wBalance });
  }

  return {
    projectedSavings,
    monthlyWithdrawal,
    totalMonthsWithdrawal,
    willMoneyLast,
    yearlyData,
    inflationAdjustedWithdrawal,
  };
}

export interface DCAResult {
  dcaAverageCost: number;
  dcaTotalUnits: number;
  dcaFinalValue: number;
  lumpSumUnits: number;
  lumpSumFinalValue: number;
  winner: "dca" | "lumpsum" | "tie";
  dcaReturn: number;
  lumpSumReturn: number;
}

export function calculateDCA(
  totalInvestment: number,
  periods: number,
  startingPrice: number,
  endingPrice: number
): DCAResult {
  const periodicInvestment = totalInvestment / periods;
  // Assume linear price change from start to end
  let totalUnits = 0;
  let totalSpent = 0;
  const priceStep = (endingPrice - startingPrice) / Math.max(periods - 1, 1);

  for (let i = 0; i < periods; i++) {
    const price = startingPrice + priceStep * i;
    if (price > 0) {
      totalUnits += periodicInvestment / price;
      totalSpent += periodicInvestment;
    }
  }

  const dcaAverageCost = totalUnits > 0 ? totalSpent / totalUnits : 0;
  const dcaFinalValue = totalUnits * endingPrice;
  const lumpSumUnits = startingPrice > 0 ? totalInvestment / startingPrice : 0;
  const lumpSumFinalValue = lumpSumUnits * endingPrice;

  const dcaReturn = ((dcaFinalValue - totalInvestment) / totalInvestment) * 100;
  const lumpSumReturn = ((lumpSumFinalValue - totalInvestment) / totalInvestment) * 100;

  let winner: "dca" | "lumpsum" | "tie" = "tie";
  if (dcaFinalValue > lumpSumFinalValue + 0.01) winner = "dca";
  else if (lumpSumFinalValue > dcaFinalValue + 0.01) winner = "lumpsum";

  return {
    dcaAverageCost,
    dcaTotalUnits: totalUnits,
    dcaFinalValue,
    lumpSumUnits,
    lumpSumFinalValue,
    winner,
    dcaReturn,
    lumpSumReturn,
  };
}
