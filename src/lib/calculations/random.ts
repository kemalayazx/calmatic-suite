// Always uses crypto.getRandomValues — never Math.random

function cryptoRandInt(min: number, max: number): number {
  // inclusive both ends
  const range = max - min + 1;
  const arr = new Uint32Array(1);
  let value: number;
  // rejection sampling to avoid modulo bias
  const limit = Math.floor(0x100000000 / range) * range;
  do {
    crypto.getRandomValues(arr);
    value = arr[0];
  } while (value >= limit);
  return min + (value % range);
}

function cryptoRandFloat(min: number, max: number, decimals: number): number {
  // use 53-bit precision from two 32-bit values
  const arr = new Uint32Array(2);
  crypto.getRandomValues(arr);
  const f = (arr[0] * 0x100000000 + arr[1]) / (0x100000000 * 0x100000000);
  const raw = min + f * (max - min);
  return parseFloat(raw.toFixed(decimals));
}

export interface NumberGenOptions {
  min: number;
  max: number;
  count: number;
  allowDuplicates: boolean;
  integerOnly: boolean;
  decimals: number;
}

export function generateNumbers(opts: NumberGenOptions): number[] {
  const { min, max, count, allowDuplicates, integerOnly, decimals } = opts;
  if (allowDuplicates) {
    return Array.from({ length: count }, () =>
      integerOnly ? cryptoRandInt(min, max) : cryptoRandFloat(min, max, decimals)
    );
  }
  // unique values
  if (integerOnly && max - min + 1 < count) {
    throw new Error("Range too small for unique integers");
  }
  const pool = new Set<number>();
  let attempts = 0;
  while (pool.size < count && attempts < count * 100) {
    const v = integerOnly ? cryptoRandInt(min, max) : cryptoRandFloat(min, max, decimals);
    pool.add(v);
    attempts++;
  }
  return Array.from(pool);
}

export function shuffleList(items: string[]): string[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = cryptoRandInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickRandom(items: string[], n: number): string[] {
  const shuffled = shuffleList(items);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

export type CoinSide = "Heads" | "Tails";
export function flipCoin(): CoinSide {
  const arr = new Uint8Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % 2 === 0 ? "Heads" : "Tails";
}

export interface DiceResult {
  dice: number[];
  total: number;
}
export function rollDice(count: number, sides = 6): DiceResult {
  const dice = Array.from({ length: count }, () => cryptoRandInt(1, sides));
  return { dice, total: dice.reduce((a, b) => a + b, 0) };
}
