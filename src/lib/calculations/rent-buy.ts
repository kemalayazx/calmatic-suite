export interface RentBuyInputs {
  monthlyRent: number;
  annualRentIncrease: number;
  rentersInsurance: number;
  homePrice: number;
  downPaymentPct: number;
  mortgageRate: number;
  loanTermYears: number;
  propertyTaxRate: number;
  homeownersInsurance: number;
  maintenancePct: number;
  appreciationRate: number;
  closingCostsPct: number;
  timeHorizonYears: number;
  investmentReturn: number;
}

export interface YearlyPoint {
  year: number;
  rentCumulative: number;
  buyCumulative: number;
  equity: number;
}

export interface RentBuyResult {
  totalRentCost: number;
  totalBuyCost: number;
  winner: "rent" | "buy";
  savingsAmount: number;
  monthlyMortgage: number;
  downPayment: number;
  closingCosts: number;
  yearlyData: YearlyPoint[];
  crossoverYear: number | null;
}

function monthlyMortgagePayment(principal: number, annualRate: number, termYears: number): number {
  if (annualRate === 0) return principal / (termYears * 12);
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function calculateRentVsBuy(inputs: RentBuyInputs): RentBuyResult {
  const {
    monthlyRent, annualRentIncrease, rentersInsurance,
    homePrice, downPaymentPct, mortgageRate, loanTermYears,
    propertyTaxRate, homeownersInsurance, maintenancePct, appreciationRate,
    closingCostsPct, timeHorizonYears, investmentReturn,
  } = inputs;

  const downPayment = homePrice * (downPaymentPct / 100);
  const loanAmount = homePrice - downPayment;
  const closingCosts = homePrice * (closingCostsPct / 100);
  const monthlyPayment = monthlyMortgagePayment(loanAmount, mortgageRate, loanTermYears);

  const yearlyData: YearlyPoint[] = [];
  let rentCumulative = 0;
  let buyCumulative = closingCosts + downPayment; // upfront
  let currentRent = monthlyRent;
  let currentHomeValue = homePrice;
  let loanBalance = loanAmount;
  let crossoverYear: number | null = null;
  const r = mortgageRate / 100 / 12;

  // opportunity cost: if you hadn't put down payment, you'd invest it
  let opportunityCostCumulative = 0;
  const monthlyInvestReturn = investmentReturn / 100 / 12;

  for (let year = 1; year <= timeHorizonYears; year++) {
    // Rent costs for this year
    let yearRent = 0;
    for (let m = 0; m < 12; m++) {
      yearRent += currentRent + rentersInsurance;
    }
    rentCumulative += yearRent;
    currentRent *= 1 + annualRentIncrease / 100;

    // Buy costs for this year
    const yearPropertyTax = currentHomeValue * (propertyTaxRate / 100);
    const yearInsurance = homeownersInsurance;
    const yearMaintenance = currentHomeValue * (maintenancePct / 100);

    // Mortgage payments for this year (or until loan is paid off)
    let yearMortgageTotal = 0;
    for (let m = 0; m < 12; m++) {
      if (loanBalance > 0) {
        const interestPayment = loanBalance * r;
        const principalPayment = Math.min(monthlyPayment - interestPayment, loanBalance);
        loanBalance = Math.max(loanBalance - principalPayment, 0);
        yearMortgageTotal += monthlyPayment;
      }
    }

    buyCumulative += yearMortgageTotal + yearPropertyTax + yearInsurance + yearMaintenance;

    // Home value appreciates
    currentHomeValue *= 1 + appreciationRate / 100;
    const equity = currentHomeValue - loanBalance;

    // Opportunity cost on down payment
    opportunityCostCumulative = (downPayment + opportunityCostCumulative) * Math.pow(1 + monthlyInvestReturn, 12);

    const rentEffective = rentCumulative;
    const buyEffective = buyCumulative - equity + downPayment; // subtract equity gained, add back down payment opportunity cost

    yearlyData.push({
      year,
      rentCumulative: Math.round(rentEffective),
      buyCumulative: Math.round(buyEffective),
      equity: Math.round(equity),
    });

    if (crossoverYear === null && year > 1) {
      const prev = yearlyData[yearlyData.length - 2];
      if ((prev.rentCumulative < prev.buyCumulative && rentEffective >= buyEffective) ||
          (prev.rentCumulative > prev.buyCumulative && rentEffective <= buyEffective)) {
        crossoverYear = year;
      }
    }
  }

  const finalRent = yearlyData[yearlyData.length - 1]?.rentCumulative ?? 0;
  const finalBuy = yearlyData[yearlyData.length - 1]?.buyCumulative ?? 0;

  return {
    totalRentCost: finalRent,
    totalBuyCost: finalBuy,
    winner: finalRent < finalBuy ? "rent" : "buy",
    savingsAmount: Math.abs(finalRent - finalBuy),
    monthlyMortgage: monthlyPayment,
    downPayment,
    closingCosts,
    yearlyData,
    crossoverYear,
  };
}
