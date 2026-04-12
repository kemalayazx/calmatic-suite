import {
  derivative,
  parse,
  evaluate,
  det,
  inv,
  transpose,
  complex,
  add,
  subtract,
  multiply,
  divide,
  abs,
  arg,
  conj,
  factorial,
  matrix,
} from "mathjs";

// ─── Matrix helpers ───────────────────────────────────────────────────────────

export type Matrix2D = number[][];

export function calcDeterminant(m: Matrix2D): number {
  return det(m) as number;
}

export function calcInverse(m: Matrix2D): Matrix2D {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = inv(m);
  if (result && typeof result.toArray === "function") return result.toArray() as Matrix2D;
  return result as Matrix2D;
}

export function calcTranspose(m: Matrix2D): Matrix2D {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = transpose(m);
  if (result && typeof result.toArray === "function") return result.toArray() as Matrix2D;
  return result as Matrix2D;
}

export function calcMatrixAdd(a: Matrix2D, b: Matrix2D): Matrix2D {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = add(matrix(a), matrix(b));
  if (result && typeof result.toArray === "function") return result.toArray() as Matrix2D;
  return result as Matrix2D;
}

export function calcMatrixMultiply(a: Matrix2D, b: Matrix2D): Matrix2D {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = multiply(matrix(a), matrix(b));
  if (result && typeof result.toArray === "function") return result.toArray() as Matrix2D;
  return result as Matrix2D;
}

// ─── Equation solvers ─────────────────────────────────────────────────────────

export interface QuadraticResult {
  discriminant: number;
  root1: string;
  root2: string;
  vertex: { x: number; y: number };
}

export function solveQuadratic(a: number, b: number, c: number): QuadraticResult {
  const disc = b * b - 4 * a * c;
  const vx = -b / (2 * a);
  const vy = a * vx * vx + b * vx + c;
  let root1: string, root2: string;
  if (disc >= 0) {
    root1 = fmt((-b + Math.sqrt(disc)) / (2 * a));
    root2 = fmt((-b - Math.sqrt(disc)) / (2 * a));
  } else {
    const re = fmt(-b / (2 * a));
    const im = fmt(Math.sqrt(-disc) / (2 * a));
    root1 = `${re} + ${im}i`;
    root2 = `${re} - ${im}i`;
  }
  return { discriminant: disc, root1, root2, vertex: { x: vx, y: vy } };
}

export interface LinearSystem2Result {
  x: number;
  y: number;
}

export function solveLinear2(
  a1: number, b1: number, c1: number,
  a2: number, b2: number, c2: number
): LinearSystem2Result {
  const D = a1 * b2 - a2 * b1;
  const Dx = c1 * b2 - c2 * b1;
  const Dy = a1 * c2 - a2 * c1;
  return { x: Dx / D, y: Dy / D };
}

export interface LinearSystem3Result {
  x: number;
  y: number;
  z: number;
}

export function solveLinear3(
  a1: number, b1: number, c1: number, d1: number,
  a2: number, b2: number, c2: number, d2: number,
  a3: number, b3: number, c3: number, d3: number
): LinearSystem3Result {
  const A: Matrix2D = [[a1, b1, c1], [a2, b2, c2], [a3, b3, c3]];
  const D = calcDeterminant(A);
  const Dx = calcDeterminant([[d1, b1, c1], [d2, b2, c2], [d3, b3, c3]]);
  const Dy = calcDeterminant([[a1, d1, c1], [a2, d2, c2], [a3, d3, c3]]);
  const Dz = calcDeterminant([[a1, b1, d1], [a2, b2, d2], [a3, b3, d3]]);
  return { x: Dx / D, y: Dy / D, z: Dz / D };
}

// ─── Input Sanitization ─────────────────────────────────────────────────────

const SAFE_EXPR_PATTERN = /^[0-9x+\-*/^().sincotaglqrepbSINCOTAGLQREPB \t]+$/;

function sanitizeExpression(expr: string): string {
  const cleaned = expr.trim();
  if (cleaned.length === 0) throw new Error("Empty expression");
  if (cleaned.length > 200) throw new Error("Expression too long");
  if (/import|require|eval|Function|fetch|XMLHttp|window|document|process|global|__proto__|constructor/i.test(cleaned)) {
    throw new Error("Invalid expression: contains restricted keywords");
  }
  return cleaned;
}

// ─── Derivative ───────────────────────────────────────────────────────────────

export interface DerivativeResult {
  symbolicDerivative: string;
  fAtX: number;
  fPrimeAtX: number;
}

export function calcDerivative(expr: string, xVal: number): DerivativeResult {
  const safeExpr = sanitizeExpression(expr);
  const node = parse(safeExpr);
  const derivNode = derivative(node, "x");
  const fAtX = evaluate(safeExpr, { x: xVal }) as number;
  const fPrimeAtX = evaluate(derivNode.toString(), { x: xVal }) as number;
  return {
    symbolicDerivative: derivNode.toString(),
    fAtX,
    fPrimeAtX,
  };
}

// ─── Numerical Integration (Simpson's Rule) ──────────────────────────────────

export interface IntegralResult {
  value: number;
  points: { x: number; y: number }[];
}

export function calcIntegral(expr: string, a: number, b: number, n = 100): IntegralResult {
  const safeExpr = sanitizeExpression(expr);
  // n must be even for Simpson
  const steps = n % 2 === 0 ? n : n + 1;
  const h = (b - a) / steps;
  let sum = 0;
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = a + i * h;
    const y = evaluate(safeExpr, { x }) as number;
    points.push({ x, y });
    if (i === 0 || i === steps) {
      sum += y;
    } else if (i % 2 === 1) {
      sum += 4 * y;
    } else {
      sum += 2 * y;
    }
  }
  return { value: (h / 3) * sum, points };
}

// ─── Permutation & Combination ───────────────────────────────────────────────

export function calcFactorial(n: number): number {
  return factorial(n) as number;
}

export function calcPermutation(n: number, r: number): number {
  return (factorial(n) as number) / (factorial(n - r) as number);
}

export function calcCombination(n: number, r: number): number {
  return (factorial(n) as number) / ((factorial(r) as number) * (factorial(n - r) as number));
}

// ─── Complex Numbers ─────────────────────────────────────────────────────────

export interface ComplexResult {
  re: number;
  im: number;
  modulus: number;
  angle: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toComplexResult(c: any): ComplexResult {
  const re = (c as { re: number }).re ?? 0;
  const im = (c as { im: number }).im ?? 0;
  return {
    re,
    im,
    modulus: abs(c) as number,
    angle: arg(c) as number,
  };
}

export type ComplexOp = "add" | "subtract" | "multiply" | "divide" | "modulus" | "conjugate";

export function calcComplex(
  a: number, bi: number,
  b: number, bj: number,
  op: ComplexOp
): ComplexResult {
  const z1 = complex(a, bi);
  const z2 = complex(b, bj);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any;
  switch (op) {
    case "add":
      result = add(z1, z2);
      break;
    case "subtract":
      result = subtract(z1, z2);
      break;
    case "multiply":
      result = multiply(z1, z2);
      break;
    case "divide":
      result = divide(z1, z2);
      break;
    case "modulus":
      result = complex(abs(z1) as number, 0);
      break;
    case "conjugate":
      result = conj(z1);
      break;
    default:
      result = z1;
  }
  return toComplexResult(result);
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function fmt(n: number, d = 6): string {
  return parseFloat(n.toFixed(d)).toString();
}
