export interface StatsResult {
  count: number;
  mean: number;
  median: number;
  mode: number[];
  min: number;
  max: number;
  variance: number;
  stdDev: number;
  sum: number;
  range: number;
}

export function parseNumbers(input: string): number[] {
  return input
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map(Number)
    .filter((n) => !isNaN(n));
}

export function calcStats(numbers: number[]): StatsResult | null {
  if (numbers.length === 0) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const count = numbers.length;
  const sum = numbers.reduce((a, b) => a + b, 0);
  const mean = sum / count;
  const min = sorted[0];
  const max = sorted[count - 1];

  // median
  let median: number;
  if (count % 2 === 0) {
    median = (sorted[count / 2 - 1] + sorted[count / 2]) / 2;
  } else {
    median = sorted[Math.floor(count / 2)];
  }

  // mode
  const freq: Record<number, number> = {};
  for (const n of numbers) freq[n] = (freq[n] || 0) + 1;
  const maxFreq = Math.max(...Object.values(freq));
  const mode = Object.keys(freq)
    .filter((k) => freq[Number(k)] === maxFreq)
    .map(Number)
    .sort((a, b) => a - b);

  // variance
  const variance = numbers.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  return { count, mean, median, mode, min, max, variance, stdDev, sum, range: max - min };
}

export interface HistogramBin {
  label: string;
  count: number;
  from: number;
  to: number;
}

export function buildHistogram(numbers: number[], bins = 10): HistogramBin[] {
  if (numbers.length === 0) return [];
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  if (min === max) {
    return [{ label: `${min}`, count: numbers.length, from: min, to: max }];
  }
  const binSize = (max - min) / bins;
  const result: HistogramBin[] = Array.from({ length: bins }, (_, i) => ({
    label: `${(min + i * binSize).toFixed(1)}`,
    count: 0,
    from: min + i * binSize,
    to: min + (i + 1) * binSize,
  }));
  for (const n of numbers) {
    const idx = Math.min(Math.floor((n - min) / binSize), bins - 1);
    result[idx].count++;
  }
  return result;
}
