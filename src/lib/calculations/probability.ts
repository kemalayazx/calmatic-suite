// --- Basic Probability ---
export interface BasicProbResult {
  pAandB: number;
  pAorB: number;
  pNotA: number;
}

export function calcBasicProb(pA: number, pB: number, independent: boolean): BasicProbResult {
  const a = pA / 100;
  const b = pB / 100;
  const pAandB = independent ? a * b : 0; // for independent only
  const pAorB = a + b - pAandB;
  return { pAandB, pAorB, pNotA: 1 - a };
}

export function calcConditional(pAintersectB: number, pB: number): number {
  if (pB === 0) return 0;
  return (pAintersectB / 100) / (pB / 100);
}

// --- Dice ---
export function calcDiceProb(numDice: number, targetSum: number): number {
  if (numDice <= 0 || targetSum < numDice || targetSum > numDice * 6) return 0;

  // dp[i] = number of ways to get sum i with current dice
  let dp: Record<number, number> = { 0: 1 };
  for (let d = 0; d < numDice; d++) {
    const next: Record<number, number> = {};
    for (const [sum, ways] of Object.entries(dp)) {
      for (let face = 1; face <= 6; face++) {
        const newSum = parseInt(sum) + face;
        next[newSum] = (next[newSum] || 0) + ways;
      }
    }
    dp = next;
  }

  const total = Math.pow(6, numDice);
  return (dp[targetSum] || 0) / total;
}

// --- Binomial ---
function logFactorial(n: number): number {
  let result = 0;
  for (let i = 2; i <= n; i++) result += Math.log(i);
  return result;
}

export function binomialCoeff(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  return Math.exp(logFactorial(n) - logFactorial(k) - logFactorial(n - k));
}

export function binomialPMF(n: number, p: number, k: number): number {
  return binomialCoeff(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

export function binomialCDF(n: number, p: number, k: number): number {
  let sum = 0;
  for (let i = 0; i <= k; i++) sum += binomialPMF(n, p, i);
  return sum;
}

export interface BinomialResult {
  pExactly: number;
  pAtMost: number;
  pAtLeast: number;
  expected: number;
  variance: number;
  stdDev: number;
  distribution: { k: number; p: number }[];
}

export function calcBinomial(n: number, p: number, k: number): BinomialResult {
  const distribution = Array.from({ length: Math.min(n + 1, 31) }, (_, i) => ({
    k: i,
    p: binomialPMF(n, p, i),
  }));

  return {
    pExactly: binomialPMF(n, p, k),
    pAtMost: binomialCDF(n, p, k),
    pAtLeast: 1 - binomialCDF(n, p, k - 1),
    expected: n * p,
    variance: n * p * (1 - p),
    stdDev: Math.sqrt(n * p * (1 - p)),
    distribution,
  };
}

// --- Coin flips ---
export function calcCoinFlips(n: number, k: number): number {
  return binomialPMF(n, 0.5, k);
}
