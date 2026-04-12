export type DistanceUnit = "miles" | "km";
export type FuelUnit = "mpg" | "L100km";
export type PriceUnit = "per_gallon" | "per_liter";

export interface FuelCostResult {
  fuelNeeded: number;
  fuelUnit: string;
  totalCost: number;
}

export function calculateFuelCost(
  distance: number,
  distanceUnit: DistanceUnit,
  fuelEfficiency: number,
  fuelEfficiencyUnit: FuelUnit,
  gasPrice: number,
  gasPriceUnit: PriceUnit
): FuelCostResult {
  // Normalize to km and L/100km
  const distanceKm = distanceUnit === "miles" ? distance * 1.60934 : distance;

  let litersPer100Km: number;
  if (fuelEfficiencyUnit === "mpg") {
    // MPG to L/100km: 235.214 / mpg
    litersPer100Km = fuelEfficiencyUnit === "mpg" ? 235.214 / fuelEfficiency : fuelEfficiency;
  } else {
    litersPer100Km = fuelEfficiency;
  }

  const litersNeeded = (distanceKm / 100) * litersPer100Km;

  let totalCost: number;
  if (gasPriceUnit === "per_gallon") {
    const gallonsNeeded = litersNeeded / 3.78541;
    totalCost = gallonsNeeded * gasPrice;
  } else {
    totalCost = litersNeeded * gasPrice;
  }

  const fuelNeeded = gasPriceUnit === "per_gallon" ? litersNeeded / 3.78541 : litersNeeded;
  const fuelUnit = gasPriceUnit === "per_gallon" ? "gallons" : "liters";

  return { fuelNeeded, fuelUnit, totalCost };
}

export function calculateTripSplit(
  distance: number,
  distanceUnit: DistanceUnit,
  fuelEfficiency: number,
  fuelEfficiencyUnit: FuelUnit,
  gasPrice: number,
  gasPriceUnit: PriceUnit,
  passengers: number
): { totalCost: number; costPerPerson: number; fuelNeeded: number; fuelUnit: string } {
  const result = calculateFuelCost(distance, distanceUnit, fuelEfficiency, fuelEfficiencyUnit, gasPrice, gasPriceUnit);
  return {
    ...result,
    costPerPerson: passengers > 0 ? result.totalCost / passengers : result.totalCost,
  };
}

export function mpgToL100km(mpg: number): number {
  return mpg > 0 ? 235.214 / mpg : 0;
}

export function l100kmToMpg(l100km: number): number {
  return l100km > 0 ? 235.214 / l100km : 0;
}
