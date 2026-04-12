export function decimalToBinary(n: number): string {
  if (!Number.isInteger(n) || n < 0) return "";
  return n.toString(2);
}

export function decimalToHex(n: number): string {
  if (!Number.isInteger(n) || n < 0) return "";
  return n.toString(16).toUpperCase();
}

export function decimalToOctal(n: number): string {
  if (!Number.isInteger(n) || n < 0) return "";
  return n.toString(8);
}

export function binaryToDecimal(s: string): number {
  return parseInt(s, 2);
}

export function hexToDecimal(s: string): number {
  return parseInt(s, 16);
}

export function octalToDecimal(s: string): number {
  return parseInt(s, 8);
}

export function textToBinary(text: string): string {
  if (!text) return "";
  return text
    .split("")
    .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
}

export function binaryToText(binary: string): string {
  const trimmed = binary.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/);
  try {
    return parts
      .map((b) => {
        const code = parseInt(b, 2);
        if (isNaN(code) || code < 0 || code > 127) throw new Error("invalid");
        return String.fromCharCode(code);
      })
      .join("");
  } catch {
    return "";
  }
}

export function ipToBinary(ip: string): { octets: string[]; error: string } | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  const octets: string[] = [];
  for (const part of parts) {
    const n = parseInt(part, 10);
    if (isNaN(n) || n < 0 || n > 255 || String(n) !== part) return null;
    octets.push(n.toString(2).padStart(8, "0"));
  }
  return { octets, error: "" };
}

export const QUICK_REF: { dec: number; bin: string; hex: string; oct: string }[] = Array.from(
  { length: 16 },
  (_, i) => ({
    dec: i,
    bin: i.toString(2).padStart(4, "0"),
    hex: i.toString(16).toUpperCase(),
    oct: i.toString(8),
  })
);
