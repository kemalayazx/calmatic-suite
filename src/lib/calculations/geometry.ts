export type Shape2D = "circle" | "rectangle" | "triangle" | "triangle-heron" | "trapezoid" | "ellipse" | "parallelogram";
export type Shape3D = "sphere" | "cylinder" | "cone" | "cube" | "rectangular-prism" | "pyramid";

export interface Shape2DResult {
  area: number;
  perimeter?: number;
  circumference?: number;
}

export interface Shape3DResult {
  volume: number;
  surfaceArea: number;
  slantHeight?: number;
}

export function calc2D(shape: Shape2D, params: Record<string, number>): Shape2DResult {
  const PI = Math.PI;
  switch (shape) {
    case "circle": {
      const r = params.radius;
      return { area: PI * r * r, circumference: 2 * PI * r };
    }
    case "rectangle": {
      const { width: w, height: h } = params;
      return { area: w * h, perimeter: 2 * (w + h) };
    }
    case "triangle": {
      const { base, height } = params;
      return { area: 0.5 * base * height };
    }
    case "triangle-heron": {
      const { a, b, c } = params;
      const s = (a + b + c) / 2;
      return { area: Math.sqrt(s * (s - a) * (s - b) * (s - c)), perimeter: a + b + c };
    }
    case "trapezoid": {
      const { a, b, height } = params;
      return { area: 0.5 * (a + b) * height };
    }
    case "ellipse": {
      const { a, b } = params;
      // Ramanujan approximation for perimeter
      const h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
      const perimeter = PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
      return { area: PI * a * b, perimeter };
    }
    case "parallelogram": {
      const { base, height } = params;
      return { area: base * height };
    }
    default:
      throw new Error(`Unknown 2D shape: ${shape}`);
  }
}

export function calc3D(shape: Shape3D, params: Record<string, number>): Shape3DResult {
  const PI = Math.PI;
  switch (shape) {
    case "sphere": {
      const r = params.r;
      return {
        volume: (4 / 3) * PI * r * r * r,
        surfaceArea: 4 * PI * r * r,
      };
    }
    case "cylinder": {
      const { r, h } = params;
      return {
        volume: PI * r * r * h,
        surfaceArea: 2 * PI * r * (r + h),
      };
    }
    case "cone": {
      const { r, h } = params;
      const slant = Math.sqrt(r * r + h * h);
      return {
        volume: (1 / 3) * PI * r * r * h,
        surfaceArea: PI * r * (r + slant),
        slantHeight: slant,
      };
    }
    case "cube": {
      const s = params.side;
      return { volume: s * s * s, surfaceArea: 6 * s * s };
    }
    case "rectangular-prism": {
      const { l, w, h } = params;
      return {
        volume: l * w * h,
        surfaceArea: 2 * (l * w + w * h + h * l),
      };
    }
    case "pyramid": {
      const { side, height } = params;
      const slant = Math.sqrt(height * height + (side / 2) * (side / 2));
      const baseArea = side * side;
      return {
        volume: (1 / 3) * baseArea * height,
        surfaceArea: baseArea + 2 * side * slant,
        slantHeight: slant,
      };
    }
    default:
      throw new Error(`Unknown 3D shape: ${shape}`);
  }
}

export interface PythagoreanResult {
  a: number;
  b: number;
  c: number;
}

export function pythagorean(
  known: "ab" | "ac" | "bc",
  p1: number,
  p2: number
): PythagoreanResult {
  switch (known) {
    case "ab":
      return { a: p1, b: p2, c: Math.sqrt(p1 * p1 + p2 * p2) };
    case "ac": {
      const bSq = p2 * p2 - p1 * p1;
      if (bSq < 0) throw new Error("Hypotenuse must be longer than the leg");
      return { a: p1, b: Math.sqrt(bSq), c: p2 };
    }
    case "bc": {
      const aSq = p2 * p2 - p1 * p1;
      if (aSq < 0) throw new Error("Hypotenuse must be longer than the leg");
      return { a: Math.sqrt(aSq), b: p1, c: p2 };
    }
    default:
      throw new Error("Unknown mode");
  }
}
