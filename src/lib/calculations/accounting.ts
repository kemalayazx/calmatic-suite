export interface VatResult {
  net: number;
  vat: number;
  gross: number;
}

export function vatFromNet(net: number, rate: number): VatResult {
  const vat = net * (rate / 100);
  return { net, vat, gross: net + vat };
}

export function vatFromGross(gross: number, rate: number): VatResult {
  const net = gross / (1 + rate / 100);
  const vat = gross - net;
  return { net, vat, gross };
}

export interface DepreciationRow {
  year: number;
  depreciation: number;
  bookValue: number;
  accumulatedDepreciation: number;
}

export function straightLineDepreciation(
  assetValue: number,
  salvageValue: number,
  lifeYears: number
): DepreciationRow[] {
  const annualDep = (assetValue - salvageValue) / lifeYears;
  const rows: DepreciationRow[] = [];
  let bookValue = assetValue;
  let accumulated = 0;
  for (let y = 1; y <= lifeYears; y++) {
    accumulated += annualDep;
    bookValue -= annualDep;
    rows.push({ year: y, depreciation: annualDep, bookValue: Math.max(salvageValue, bookValue), accumulatedDepreciation: accumulated });
  }
  return rows;
}

export function decliningBalanceDepreciation(
  assetValue: number,
  salvageValue: number,
  lifeYears: number
): DepreciationRow[] {
  const rate = 2 / lifeYears;
  const rows: DepreciationRow[] = [];
  let bookValue = assetValue;
  let accumulated = 0;
  for (let y = 1; y <= lifeYears; y++) {
    const dep = Math.max(0, Math.min(bookValue * rate, bookValue - salvageValue));
    accumulated += dep;
    bookValue -= dep;
    rows.push({ year: y, depreciation: dep, bookValue, accumulatedDepreciation: accumulated });
  }
  return rows;
}
