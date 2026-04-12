export interface UnitDef {
  label: string;
  toBase: (v: number) => number;   // convert to base unit
  fromBase: (v: number) => number; // convert from base unit
}

export interface Category {
  name: string;
  baseUnit: string;
  units: Record<string, UnitDef>;
}

export const CATEGORIES: Record<string, Category> = {
  length: {
    name: "Length",
    baseUnit: "m",
    units: {
      km:   { label: "Kilometer (km)",  toBase: (v) => v * 1000,       fromBase: (v) => v / 1000 },
      m:    { label: "Meter (m)",        toBase: (v) => v,              fromBase: (v) => v },
      cm:   { label: "Centimeter (cm)", toBase: (v) => v / 100,        fromBase: (v) => v * 100 },
      mm:   { label: "Millimeter (mm)", toBase: (v) => v / 1000,       fromBase: (v) => v * 1000 },
      mile: { label: "Mile",             toBase: (v) => v * 1609.344,   fromBase: (v) => v / 1609.344 },
      yard: { label: "Yard (yd)",        toBase: (v) => v * 0.9144,     fromBase: (v) => v / 0.9144 },
      foot: { label: "Foot (ft)",        toBase: (v) => v * 0.3048,     fromBase: (v) => v / 0.3048 },
      inch: { label: "Inch (in)",        toBase: (v) => v * 0.0254,     fromBase: (v) => v / 0.0254 },
    },
  },
  weight: {
    name: "Weight",
    baseUnit: "kg",
    units: {
      kg:  { label: "Kilogram (kg)", toBase: (v) => v,           fromBase: (v) => v },
      g:   { label: "Gram (g)",      toBase: (v) => v / 1000,    fromBase: (v) => v * 1000 },
      lb:  { label: "Pound (lb)",    toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
      oz:  { label: "Ounce (oz)",    toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
      ton: { label: "Metric Ton (t)", toBase: (v) => v * 1000,    fromBase: (v) => v / 1000 },
    },
  },
  temperature: {
    name: "Temperature",
    baseUnit: "C",
    units: {
      C: { label: "Celsius (°C)",    toBase: (v) => v,                    fromBase: (v) => v },
      F: { label: "Fahrenheit (°F)", toBase: (v) => (v - 32) * 5 / 9,    fromBase: (v) => v * 9 / 5 + 32 },
      K: { label: "Kelvin (K)",      toBase: (v) => v - 273.15,           fromBase: (v) => v + 273.15 },
    },
  },
  area: {
    name: "Area",
    baseUnit: "m2",
    units: {
      "m2":  { label: "Square Meter (m²)",     toBase: (v) => v,             fromBase: (v) => v },
      "km2": { label: "Square Kilometer (km²)", toBase: (v) => v * 1e6,      fromBase: (v) => v / 1e6 },
      "ft2": { label: "Square Foot (ft²)",      toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      acre:  { label: "Acre",                   toBase: (v) => v * 4046.86,  fromBase: (v) => v / 4046.86 },
      ha:    { label: "Hectare (ha)",            toBase: (v) => v * 10000,    fromBase: (v) => v / 10000 },
    },
  },
  speed: {
    name: "Speed",
    baseUnit: "ms",
    units: {
      "km/h": { label: "km/h",      toBase: (v) => v / 3.6,     fromBase: (v) => v * 3.6 },
      "m/s":  { label: "m/s",       toBase: (v) => v,            fromBase: (v) => v },
      mph:    { label: "mph",        toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      knot:   { label: "Knot (kn)", toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    },
  },
};

export function convert(value: number, fromUnit: string, toUnit: string, categoryKey: string): number {
  const cat = CATEGORIES[categoryKey];
  if (!cat) return NaN;
  const from = cat.units[fromUnit];
  const to = cat.units[toUnit];
  if (!from || !to) return NaN;
  const base = from.toBase(value);
  return to.fromBase(base);
}
