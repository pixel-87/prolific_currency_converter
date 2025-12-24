import type { ConversionResponse, ExchangeRateCache } from "./types";

const CACHE_KEY = "exchange_rate_cache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const FAILURE_RECORD_KEY = "exchange_rate_failures";
const MAX_FAILURE_ATTEMPTS = 3;
const FAILURE_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

type FailureRecord = {
  count: number;
  lastAttempt: number;
};

const API_SOURCES = [
  {
    name: "Frankfurter",
    url: (base: string) => `https://api.frankfurter.app/latest?from=${base}`,
    extractor: (data: any) => data?.rates as Record<string, number> | undefined,
  },
  {
    name: "ER API",
    url: (base: string) => `https://open.er-api.com/v6/latest/${base}`,
    extractor: (data: any) => data?.rates as Record<string, number> | undefined,
  },
];

async function fetchExchangeRates(baseCurrency: string): Promise<Record<string, number> | null> {
  for (const source of API_SOURCES) {
    try {
      const response = await fetch(source.url(baseCurrency));
      if (!response.ok) throw new Error(`API error ${source.name}: ${response.status}`);
      const data = await response.json();
      const rates = source.extractor(data);
      if (rates) {
        return rates;
      }
      console.warn(`[Worker] ${source.name} did not return rates`);
    } catch (error) {
      console.warn(`[Worker] ${source.name} fetch failed`, error);
    }
  }
  return null;
}

async function getCachedRates(baseCurrency: string): Promise<ExchangeRateCache | null> {
  const cached = await browser.storage.local.get(CACHE_KEY);
  const cache = cached[CACHE_KEY] as ExchangeRateCache | undefined;
  const now = Date.now();

  if (cache && cache.baseCurrency === baseCurrency && now - cache.timestamp <= CACHE_TTL_MS) {
    return cache;
  }

  const failureRecord = await getFailureRecord(baseCurrency);
  if (
    failureRecord &&
    failureRecord.count >= MAX_FAILURE_ATTEMPTS &&
    now - failureRecord.lastAttempt < FAILURE_COOLDOWN_MS
  ) {
    console.warn(
      `[Worker] Skipping API fetch for ${baseCurrency}; previous failures throttling new attempts`
    );
    return cache ?? null;
  }

  const rates = await fetchExchangeRates(baseCurrency);
  if (!rates) {
    await recordFailure(baseCurrency, failureRecord);
    return cache ?? null;
  }

  await clearFailureRecord(baseCurrency);

  const updatedCache: ExchangeRateCache = {
    baseCurrency,
    rates,
    timestamp: now,
  };
  await browser.storage.local.set({ [CACHE_KEY]: updatedCache });
  return updatedCache;
}

async function getFailureRecord(baseCurrency: string): Promise<FailureRecord | null> {
  const stored = await browser.storage.local.get(FAILURE_RECORD_KEY);
  const record = stored[FAILURE_RECORD_KEY] as Record<string, FailureRecord> | undefined;
  return record?.[baseCurrency] ?? null;
}

async function recordFailure(baseCurrency: string, existing?: FailureRecord | null): Promise<void> {
  const stored = await browser.storage.local.get(FAILURE_RECORD_KEY);
  const records = (stored[FAILURE_RECORD_KEY] as Record<string, FailureRecord> | undefined) ?? {};
  const nextCount = (existing?.count ?? 0) + 1;
  records[baseCurrency] = { count: nextCount, lastAttempt: Date.now() };
  await browser.storage.local.set({ [FAILURE_RECORD_KEY]: records });
}

async function clearFailureRecord(baseCurrency: string): Promise<void> {
  const stored = await browser.storage.local.get(FAILURE_RECORD_KEY);
  const records = (stored[FAILURE_RECORD_KEY] as Record<string, FailureRecord> | undefined) ?? {};
  if (records[baseCurrency]) {
    delete records[baseCurrency];
    await browser.storage.local.set({ [FAILURE_RECORD_KEY]: records });
  }
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
