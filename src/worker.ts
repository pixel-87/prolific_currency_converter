import type { ConversionResponse, ExchangeRateCache } from "./types";

const API_URL = "https://api.exchangerate.host/latest";
const CACHE_KEY = "exchange_rate_cache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function fetchExchangeRates(baseCurrency: string): Promise<Record<string, number> | null> {
  try {
    const response = await fetch(`${API_URL}?base=${baseCurrency}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    return null;
  }
}

async function getCachedRates(baseCurrency: string): Promise<ExchangeRateCache | null> {
  const cached = await browser.storage.local.get(CACHE_KEY);
  const cache = cached[CACHE_KEY] as ExchangeRateCache | undefined;

  if (!cache || cache.baseCurrency !== baseCurrency) {
    const rates = await fetchExchangeRates(baseCurrency);
    if (!rates) {
      return null;
    }
    const updatedCache: ExchangeRateCache = {
      baseCurrency,
      rates,
      timestamp: Date.now(),
    };
    await browser.storage.local.set({ [CACHE_KEY]: updatedCache });
    return updatedCache;
  }

  const now = Date.now();
  if (now - cache.timestamp > CACHE_TTL_MS) {
    // TTL expired, try to fetch new rates
    const newRates = await fetchExchangeRates(baseCurrency);
    if (newRates) {
      const updatedCache: ExchangeRateCache = {
        baseCurrency,
        rates: newRates,
        timestamp: now,
      };
      await browser.storage.local.set({ [CACHE_KEY]: updatedCache });
      return updatedCache;
    }
    // API failed, return stale cache
    return cache;
  }

  return cache;
}

async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number | null> {
  const cache = await getCachedRates(fromCurrency);

  if (!cache) {
    return null;
  }

  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rate = cache.rates[toCurrency];
  if (!rate) {
    return null;
  }

  return parseFloat((amount * rate).toFixed(2));
}

// Listen for messages from content script
browser.runtime.onMessage.addListener(async (request) => {
  console.log("[Worker] Received message:", request);
  if (request.action === "convert") {
    const result = await convertCurrency(request.amount, request.from, request.to);
    console.log("[Worker] Conversion result:", result);
    return { success: result !== null, value: result };
  }
  return { success: false, value: null };
});
