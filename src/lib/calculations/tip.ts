export type Currency = "TRY" | "USD" | "EUR";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

export interface TipResult {
  tipAmount: number;
  totalAmount: number;
  perPerson: number;
  symbol: string;
}

export function calcTip(
  bill: number,
  tipPercent: number,
  people: number,
  currency: Currency
): TipResult {
  const tipAmount = bill * (tipPercent / 100);
  const totalAmount = bill + tipAmount;
  const perPerson = totalAmount / Math.max(1, people);
  return {
    tipAmount,
    totalAmount,
    perPerson,
    symbol: CURRENCY_SYMBOLS[currency],
  };
}
