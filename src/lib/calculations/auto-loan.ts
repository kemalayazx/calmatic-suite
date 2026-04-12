export interface AutoLoanMonthlyResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  loanAmount: number;
  taxAmount: number;
}

export function calcAutoLoanMonthly(
  vehiclePrice: number,
  downPayment: number,
  tradeIn: number,
  salesTaxRate: number,
  interestRate: number,
  termMonths: number
): AutoLoanMonthlyResult {
  const taxAmount = vehiclePrice * (salesTaxRate / 100);
  const loanAmount = vehiclePrice + taxAmount - downPayment - tradeIn;
  const r = interestRate / 100 / 12;
  let monthlyPayment: number;

  if (r === 0) {
    monthlyPayment = loanAmount / termMonths;
  } else {
    monthlyPayment = (loanAmount * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
  }

  const totalPaid = monthlyPayment * termMonths;
  const totalInterest = totalPaid - loanAmount;

  return {
    monthlyPayment,
    totalInterest: Math.max(0, totalInterest),
    totalCost: vehiclePrice + taxAmount + Math.max(0, totalInterest),
    loanAmount: Math.max(0, loanAmount),
    taxAmount,
  };
}

export function calcAffordability(
  monthlyBudget: number,
  interestRate: number,
  termMonths: number
): number {
  const r = interestRate / 100 / 12;
  if (r === 0) return monthlyBudget * termMonths;
  return (monthlyBudget * (Math.pow(1 + r, termMonths) - 1)) / (r * Math.pow(1 + r, termMonths));
}

export interface LeaseBuyCompare {
  totalBuyCost: number;
  totalLeaseCost: number;
  buyResidualValue: number;
  buyCostAfterResale: number;
  winner: "buy" | "lease";
  savings: number;
}

export function calcLeaseBuy(
  purchasePrice: number,
  purchaseDown: number,
  purchaseRate: number,
  purchaseTerm: number,
  resaleValue: number,
  leaseMonthly: number,
  leaseTerm: number,
  leaseDown: number,
  leaseFees: number
): LeaseBuyCompare {
  const r = purchaseRate / 100 / 12;
  let monthlyPayment: number;
  const loanAmount = purchasePrice - purchaseDown;

  if (r === 0) {
    monthlyPayment = loanAmount / purchaseTerm;
  } else {
    monthlyPayment = (loanAmount * r * Math.pow(1 + r, purchaseTerm)) / (Math.pow(1 + r, purchaseTerm) - 1);
  }

  const totalBuyCost = purchaseDown + monthlyPayment * purchaseTerm;
  const totalLeaseCost = leaseDown + leaseMonthly * leaseTerm + leaseFees;
  const buyCostAfterResale = totalBuyCost - resaleValue;

  const winner = buyCostAfterResale < totalLeaseCost ? "buy" : "lease";
  const savings = Math.abs(buyCostAfterResale - totalLeaseCost);

  return { totalBuyCost, totalLeaseCost, buyResidualValue: resaleValue, buyCostAfterResale, winner, savings };
}
