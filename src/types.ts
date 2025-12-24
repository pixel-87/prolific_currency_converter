export interface ExchangeRateCache {
  baseCurrency: string;
  rates: Record<string, number>;
  timestamp: number;
}

export interface ConversionResponse {
  success: boolean;
  value: number | null;
}
