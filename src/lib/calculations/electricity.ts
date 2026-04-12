// Appliance Cost
export interface Appliance {
  id: string;
  name: string;
  wattage: number;
  hoursPerDay: number;
  daysPerMonth: number;
  rate: number;
}

export interface ApplianceCost {
  kwhPerMonth: number;
  monthlyCost: number;
  annualCost: number;
}

export function calcApplianceCost(a: Appliance): ApplianceCost {
  const kwhPerMonth = (a.wattage / 1000) * a.hoursPerDay * a.daysPerMonth;
  return {
    kwhPerMonth,
    monthlyCost: kwhPerMonth * a.rate,
    annualCost: kwhPerMonth * a.rate * 12,
  };
}

// Solar Savings
export interface SolarInputs {
  monthlyBill: number;
  sunHoursPerDay: number;
  systemSizeKw: number;
  costPerWatt: number;
  rate: number;
}

export interface SolarResult {
  systemCost: number;
  monthlyProduction: number;
  monthlyBillAfter: number;
  monthlySavings: number;
  annualSavings: number;
  paybackYears: number;
  savings25yr: number;
}

export function calcSolarSavings(inputs: SolarInputs): SolarResult {
  const { monthlyBill, sunHoursPerDay, systemSizeKw, costPerWatt, rate } = inputs;
  const systemCost = systemSizeKw * 1000 * costPerWatt;
  const monthlyProduction = systemSizeKw * sunHoursPerDay * 30; // kWh
  const monthlySavings = Math.min(monthlyProduction * rate, monthlyBill);
  const monthlyBillAfter = Math.max(0, monthlyBill - monthlySavings);
  const annualSavings = monthlySavings * 12;
  const paybackYears = annualSavings > 0 ? systemCost / annualSavings : Infinity;
  const savings25yr = annualSavings * 25 - systemCost;
  return {
    systemCost,
    monthlyProduction,
    monthlyBillAfter,
    monthlySavings,
    annualSavings,
    paybackYears,
    savings25yr,
  };
}

// Bulb Comparison
export interface BulbCompareInputs {
  hoursPerDay: number;
  rate: number;
  incandescent: { watt: number; cost: number };
  cfl: { watt: number; cost: number };
  led: { watt: number; cost: number };
}

export interface BulbResult {
  name: string;
  watt: number;
  annualKwh: number;
  annualEnergyCost: number;
  annualTotal: number;
  tenYearTotal: number;
  bulbReplacements10yr: number;
}

const BULB_LIFESPAN_HOURS: Record<string, number> = {
  incandescent: 1000,
  cfl: 8000,
  led: 25000,
};

export function calcBulbComparison(inputs: BulbCompareInputs): BulbResult[] {
  const { hoursPerDay, rate, incandescent, cfl, led } = inputs;
  const annualHours = hoursPerDay * 365;
  const bulbs = [
    { name: "Incandescent", watt: incandescent.watt, cost: incandescent.cost, key: "incandescent" },
    { name: "CFL", watt: cfl.watt, cost: cfl.cost, key: "cfl" },
    { name: "LED", watt: led.watt, cost: led.cost, key: "led" },
  ];
  return bulbs.map((b) => {
    const annualKwh = (b.watt / 1000) * annualHours;
    const annualEnergyCost = annualKwh * rate;
    const lifeHours = BULB_LIFESPAN_HOURS[b.key];
    const replacementsPerYear = annualHours / lifeHours;
    const annualBulbCost = replacementsPerYear * b.cost;
    const annualTotal = annualEnergyCost + annualBulbCost;
    const tenYearHours = annualHours * 10;
    const bulbReplacements10yr = Math.ceil(tenYearHours / lifeHours);
    const tenYearTotal = annualEnergyCost * 10 + bulbReplacements10yr * b.cost;
    return {
      name: b.name,
      watt: b.watt,
      annualKwh,
      annualEnergyCost,
      annualTotal,
      tenYearTotal,
      bulbReplacements10yr,
    };
  });
}
