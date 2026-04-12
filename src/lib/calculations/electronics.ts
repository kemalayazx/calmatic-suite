// Electronics calculations library

// ─── Ohm's Law ───────────────────────────────────────────────────────────────

export interface OhmResult {
  voltage: number;
  current: number;
  resistance: number;
  power: number;
}

export function ohmFromVI(voltage: number, current: number): OhmResult {
  return {
    voltage,
    current,
    resistance: voltage / current,
    power: voltage * current,
  };
}

export function ohmFromVR(voltage: number, resistance: number): OhmResult {
  const current = voltage / resistance;
  return { voltage, current, resistance, power: voltage * current };
}

export function ohmFromIR(current: number, resistance: number): OhmResult {
  const voltage = current * resistance;
  return { voltage, current, resistance, power: voltage * current };
}

// ─── Resistor Color Code ─────────────────────────────────────────────────────

export const COLOR_BANDS = [
  { name: "Black",  value: 0, multiplier: 1,        tolerance: null },
  { name: "Brown",  value: 1, multiplier: 10,        tolerance: 1 },
  { name: "Red",    value: 2, multiplier: 100,       tolerance: 2 },
  { name: "Orange", value: 3, multiplier: 1000,      tolerance: null },
  { name: "Yellow", value: 4, multiplier: 10000,     tolerance: null },
  { name: "Green",  value: 5, multiplier: 100000,    tolerance: 0.5 },
  { name: "Blue",   value: 6, multiplier: 1000000,   tolerance: 0.25 },
  { name: "Violet", value: 7, multiplier: 10000000,  tolerance: 0.1 },
  { name: "Grey",   value: 8, multiplier: 100000000, tolerance: 0.05 },
  { name: "White",  value: 9, multiplier: 1e9,       tolerance: null },
  { name: "Gold",   value: null, multiplier: 0.1,    tolerance: 5 },
  { name: "Silver", value: null, multiplier: 0.01,   tolerance: 10 },
];

export function resistorColorCode(
  band1: string,
  band2: string,
  band3: string | null, // for 5-band
  multiplierBand: string,
  toleranceBand: string
): { resistance: number; tolerance: number | null; formatted: string } {
  const b1 = COLOR_BANDS.find((c) => c.name === band1);
  const b2 = COLOR_BANDS.find((c) => c.name === band2);
  const b3 = band3 ? COLOR_BANDS.find((c) => c.name === band3) : null;
  const mult = COLOR_BANDS.find((c) => c.name === multiplierBand);
  const tol = COLOR_BANDS.find((c) => c.name === toleranceBand);

  if (!b1 || !b2 || !mult) return { resistance: 0, tolerance: null, formatted: "Invalid" };

  let base: number;
  if (b3 && band3) {
    base = (b1.value! * 100 + b2.value! * 10 + b3.value!) * mult.multiplier;
  } else {
    base = (b1.value! * 10 + b2.value!) * mult.multiplier;
  }

  const tolerance = tol?.tolerance ?? null;
  const formatted = base >= 1e6
    ? `${base / 1e6} MΩ`
    : base >= 1e3
    ? `${base / 1e3} kΩ`
    : `${base} Ω`;

  return { resistance: base, tolerance, formatted };
}

// ─── Series / Parallel Resistors ─────────────────────────────────────────────

export function seriesResistance(values: number[]): number {
  return values.reduce((sum, r) => sum + r, 0);
}

export function parallelResistance(values: number[]): number {
  const sum = values.reduce((acc, r) => acc + 1 / r, 0);
  return 1 / sum;
}

// ─── LED Calculator ───────────────────────────────────────────────────────────

const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];

export function nearestE12(value: number): number {
  if (value <= 0) return 10;
  const exp = Math.floor(Math.log10(value));
  const multiplier = Math.pow(10, exp);
  const base = E12.map((v) => v * multiplier);
  const higher = E12.map((v) => v * multiplier * 10);
  const all = [...base, ...higher];
  return all.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

export interface LEDResult {
  resistorOhm: number;
  nearestStandard: number;
  powerDissipation: number;
}

export function ledResistor(
  supplyVoltage: number,
  forwardVoltage: number,
  currentMa: number
): LEDResult {
  const currentA = currentMa / 1000;
  const resistorOhm = (supplyVoltage - forwardVoltage) / currentA;
  return {
    resistorOhm,
    nearestStandard: nearestE12(resistorOhm),
    powerDissipation: resistorOhm * currentA * currentA,
  };
}

// ─── RC / RL Circuits ─────────────────────────────────────────────────────────

export interface RCResult {
  tau: number;
  halfChargeTime: number;
  cutoffFrequency: number;
}

export function rcCircuit(resistanceOhm: number, capacitanceFarad: number): RCResult {
  const tau = resistanceOhm * capacitanceFarad;
  return {
    tau,
    halfChargeTime: tau * Math.log(2),
    cutoffFrequency: 1 / (2 * Math.PI * tau),
  };
}

export interface RLResult {
  tau: number;
  cutoffFrequency: number;
}

export function rlCircuit(resistanceOhm: number, inductanceHenry: number): RLResult {
  const tau = inductanceHenry / resistanceOhm;
  return {
    tau,
    cutoffFrequency: resistanceOhm / (2 * Math.PI * inductanceHenry),
  };
}

// ─── dB Converter ─────────────────────────────────────────────────────────────

export function powerRatioToDb(ratio: number): number {
  return 10 * Math.log10(ratio);
}

export function dbToPowerRatio(db: number): number {
  return Math.pow(10, db / 10);
}

export function voltageRatioToDb(ratio: number): number {
  return 20 * Math.log10(ratio);
}

export function dbToVoltageRatio(db: number): number {
  return Math.pow(10, db / 20);
}
