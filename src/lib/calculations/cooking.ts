export interface ScaledIngredient {
  originalAmount: number;
  scaledAmount: number;
  unit: string;
  name: string;
}

export function scaleRecipe(
  ingredients: { amount: number; unit: string; name: string }[],
  originalServings: number,
  targetServings: number
): ScaledIngredient[] {
  if (originalServings === 0) return [];
  const ratio = targetServings / originalServings;
  return ingredients.map((ing) => ({
    ...ing,
    originalAmount: ing.amount,
    scaledAmount: ing.amount * ratio,
  }));
}

export interface CookingConversion {
  from: string;
  to: string;
  factor: number;
}

export const COOKING_CONVERSIONS: { category: string; conversions: CookingConversion[] }[] = [
  {
    category: "Volume",
    conversions: [
      { from: "cup", to: "mL", factor: 236.588 },
      { from: "tbsp", to: "mL", factor: 14.787 },
      { from: "tsp", to: "mL", factor: 4.929 },
      { from: "fl oz", to: "mL", factor: 29.574 },
      { from: "pint", to: "mL", factor: 473.176 },
      { from: "quart", to: "mL", factor: 946.353 },
      { from: "gallon", to: "mL", factor: 3785.41 },
    ],
  },
  {
    category: "Weight",
    conversions: [
      { from: "oz", to: "g", factor: 28.3495 },
      { from: "lb", to: "kg", factor: 0.453592 },
      { from: "lb", to: "g", factor: 453.592 },
    ],
  },
];

export function convertCookingUnit(value: number, from: string, to: string): number | null {
  for (const cat of COOKING_CONVERSIONS) {
    for (const conv of cat.conversions) {
      if (conv.from === from && conv.to === to) return value * conv.factor;
      if (conv.to === from && conv.from === to) return value / conv.factor;
    }
  }
  return null;
}

export function convertTemp(value: number, from: "F" | "C"): number {
  if (from === "F") return ((value - 32) * 5) / 9;
  return (value * 9) / 5 + 32;
}

export interface BakingRatio {
  name: string;
  description: string;
  ratios: { ingredient: string; ratio: number; unit: string }[];
  baseIngredient: string;
}

export const BAKING_RATIOS: BakingRatio[] = [
  {
    name: "Basic Bread",
    description: "Classic bread dough (baker's percentage)",
    baseIngredient: "Flour",
    ratios: [
      { ingredient: "Flour", ratio: 1, unit: "g" },
      { ingredient: "Water", ratio: 0.6, unit: "mL" },
      { ingredient: "Salt", ratio: 0.02, unit: "g" },
      { ingredient: "Yeast (active dry)", ratio: 0.01, unit: "g" },
    ],
  },
  {
    name: "Pizza Dough",
    description: "Neapolitan-style pizza dough",
    baseIngredient: "Flour",
    ratios: [
      { ingredient: "Flour", ratio: 1, unit: "g" },
      { ingredient: "Water", ratio: 0.65, unit: "mL" },
      { ingredient: "Salt", ratio: 0.025, unit: "g" },
      { ingredient: "Yeast (active dry)", ratio: 0.005, unit: "g" },
      { ingredient: "Olive Oil", ratio: 0.03, unit: "mL" },
    ],
  },
  {
    name: "Basic Cake",
    description: "Classic 1-2-3-4 cake",
    baseIngredient: "Flour",
    ratios: [
      { ingredient: "Flour", ratio: 1, unit: "g" },
      { ingredient: "Sugar", ratio: 1, unit: "g" },
      { ingredient: "Butter", ratio: 0.5, unit: "g" },
      { ingredient: "Eggs", ratio: 0.0167, unit: "eggs (large)" },
      { ingredient: "Milk", ratio: 0.25, unit: "mL" },
      { ingredient: "Baking Powder", ratio: 0.01, unit: "g" },
    ],
  },
  {
    name: "Chocolate Chip Cookies",
    description: "Classic American cookies",
    baseIngredient: "Flour",
    ratios: [
      { ingredient: "Flour", ratio: 1, unit: "g" },
      { ingredient: "Butter", ratio: 0.75, unit: "g" },
      { ingredient: "Brown Sugar", ratio: 0.6, unit: "g" },
      { ingredient: "White Sugar", ratio: 0.3, unit: "g" },
      { ingredient: "Eggs", ratio: 0.0083, unit: "eggs (large)" },
      { ingredient: "Baking Soda", ratio: 0.004, unit: "g" },
      { ingredient: "Salt", ratio: 0.005, unit: "g" },
      { ingredient: "Vanilla Extract", ratio: 0.004, unit: "tsp" },
      { ingredient: "Chocolate Chips", ratio: 0.83, unit: "g" },
    ],
  },
];

export function calculateBakingRatio(ratio: BakingRatio, flourAmount: number): { ingredient: string; amount: number; unit: string }[] {
  return ratio.ratios.map((r) => ({
    ingredient: r.ingredient,
    amount: flourAmount * r.ratio,
    unit: r.unit,
  }));
}
