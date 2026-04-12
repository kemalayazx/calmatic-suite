export type Operation = "+" | "-" | "*" | "/" | null;

export function calculate(a: number, b: number, op: Operation): number {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b !== 0 ? a / b : NaN;
    default: return b;
  }
}

export function formatDisplay(value: string): string {
  if (value === "NaN" || value === "Infinity" || value === "-Infinity") return "Error";
  return value;
}

export function sqrt(value: number): number {
  if (value < 0) return NaN;
  return Math.sqrt(value);
}

export function square(value: number): number {
  return value * value;
}

export function percentage(value: number): number {
  return value / 100;
}

export function negate(value: number): number {
  return -value;
}
