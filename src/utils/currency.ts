export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  JPY: "¥",
  CAD: "$",
  AUD: "$",
  CHF: "Fr",
  CNY: "¥",
  INR: "₹",
  MXN: "$",
  SGD: "$",
};

export const CURRENCY_CODES = Object.keys(CURRENCY_SYMBOLS);

export function parseCurrencyAmount(
  text: string,
): { currency: string; amount: number } | null {
  // Match patterns like "$3.00" or "£21.43"
  const match = text.match(/([^\d]?)([\d,]+\.?\d*)/);
  if (!match) return null;

  const symbol = match[1]?.trim() || "$";
  const amountStr = match[2].replace(/,/g, "");
  const amount = parseFloat(amountStr);

  // Find currency code by symbol
  let currency = "USD";
  for (const [code, sym] of Object.entries(CURRENCY_SYMBOLS)) {
    if (sym === symbol) {
      currency = code;
      break;
    }
  }

  return isNaN(amount) ? null : { currency, amount };
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
  return `${symbol}${amount.toFixed(2)}`;
}
