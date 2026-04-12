import { evaluate, factorial as mathFactorial } from "mathjs";

export type AngleMode = "deg" | "rad";

function toRad(x: number, mode: AngleMode): number {
  return mode === "deg" ? (x * Math.PI) / 180 : x;
}

function fromRad(x: number, mode: AngleMode): number {
  return mode === "deg" ? (x * 180) / Math.PI : x;
}

export function computeUnary(
  fn: string,
  value: number,
  mode: AngleMode
): number {
  switch (fn) {
    case "sin":
      return Math.sin(toRad(value, mode));
    case "cos":
      return Math.cos(toRad(value, mode));
    case "tan":
      return Math.tan(toRad(value, mode));
    case "asin":
      return fromRad(Math.asin(value), mode);
    case "acos":
      return fromRad(Math.acos(value), mode);
    case "atan":
      return fromRad(Math.atan(value), mode);
    case "log":
      return Math.log10(value);
    case "ln":
      return Math.log(value);
    case "ex":
      return Math.exp(value);
    case "10x":
      return Math.pow(10, value);
    case "sqrt":
      return Math.sqrt(value);
    case "x2":
      return value * value;
    case "inv":
      return 1 / value;
    case "neg":
      return -value;
    case "abs":
      return Math.abs(value);
    case "factorial": {
      if (value < 0 || !Number.isInteger(value)) throw new Error("Factorial requires non-negative integer");
      return Number(mathFactorial(value));
    }
    default:
      throw new Error(`Unknown function: ${fn}`);
  }
}

export function safeEvaluate(expr: string): number {
  // Replace π and e with their values
  const cleaned = expr
    .replace(/π/g, "pi")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/mod/g, " mod ")
    .replace(/\^/g, "^");
  const result = evaluate(cleaned);
  return Number(result);
}
