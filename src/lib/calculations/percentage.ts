export function whatIsXPercentOfY(x: number, y: number): number {
  return (x / 100) * y;
}

export function xIsWhatPercentOfY(x: number, y: number): number {
  if (y === 0) return 0;
  return (x / y) * 100;
}

export function percentChange(from: number, to: number): { change: number; isIncrease: boolean } {
  if (from === 0) return { change: 0, isIncrease: to >= 0 };
  const change = ((to - from) / Math.abs(from)) * 100;
  return { change, isIncrease: to >= from };
}

export interface MarginMarkupResult {
  margin: number;
  markup: number;
  sellingPrice: number;
  profit: number;
}

export function calcMarginMarkup(cost: number, sellingPrice: number): MarginMarkupResult {
  const profit = sellingPrice - cost;
  const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  const markup = cost > 0 ? (profit / cost) * 100 : 0;
  return { margin, markup, sellingPrice, profit };
}

export function calcSellingPriceFromMargin(cost: number, targetMargin: number): MarginMarkupResult {
  // margin = (price - cost) / price => price = cost / (1 - margin/100)
  const sellingPrice = targetMargin >= 100 ? 0 : cost / (1 - targetMargin / 100);
  return calcMarginMarkup(cost, sellingPrice);
}
