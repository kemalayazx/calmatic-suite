// ─── Type definitions ─────────────────────────────────────────────────────────

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

// ─── Conversion ───────────────────────────────────────────────────────────────

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace(/^#/, "").trim();
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: RGB): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case rr: h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6; break;
    case gg: h = ((bb - rr) / d + 2) / 6; break;
    case bb: h = ((rr - gg) / d + 4) / 6; break;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const ss = s / 100, ll = l / 100;
  if (ss === 0) {
    const v = Math.round(ll * 255);
    return { r: v, g: v, b: v };
  }
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  const hk = h / 360;
  const [r, g, b] = [hk + 1 / 3, hk, hk - 1 / 3].map((t) => {
    const tc = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (tc < 1 / 6) return p + (q - p) * 6 * tc;
    if (tc < 1 / 2) return q;
    if (tc < 2 / 3) return p + (q - p) * (2 / 3 - tc) * 6;
    return p;
  });
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex));
}

// ─── Palette suggestions ──────────────────────────────────────────────────────

function rotateHue(h: number, deg: number): number {
  return (h + deg + 360) % 360;
}

export interface PaletteColor {
  hex: string;
  label: string;
}

export function getComplementary(hex: string): PaletteColor[] {
  const hsl = hexToHsl(hex);
  return [
    { hex, label: "Base" },
    { hex: hslToHex({ ...hsl, h: rotateHue(hsl.h, 180) }), label: "Complement" },
  ];
}

export function getAnalogous(hex: string): PaletteColor[] {
  const hsl = hexToHsl(hex);
  return [
    { hex: hslToHex({ ...hsl, h: rotateHue(hsl.h, -30) }), label: "-30°" },
    { hex, label: "Base" },
    { hex: hslToHex({ ...hsl, h: rotateHue(hsl.h, 30) }), label: "+30°" },
  ];
}

export function getTriadic(hex: string): PaletteColor[] {
  const hsl = hexToHsl(hex);
  return [
    { hex, label: "Base" },
    { hex: hslToHex({ ...hsl, h: rotateHue(hsl.h, 120) }), label: "+120°" },
    { hex: hslToHex({ ...hsl, h: rotateHue(hsl.h, 240) }), label: "+240°" },
  ];
}

// ─── CSS output helpers ───────────────────────────────────────────────────────

export function toCssRgb(rgb: RGB): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export function toCssRgba(rgb: RGB, alpha: number): string {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(alpha / 100).toFixed(2)})`;
}

export function toCssHsl(hsl: HSL): string {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

export function toCssHsla(hsl: HSL, alpha: number): string {
  return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${(alpha / 100).toFixed(2)})`;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function isValidHex(hex: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}
