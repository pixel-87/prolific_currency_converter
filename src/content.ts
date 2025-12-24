const LOG_PREFIX = "[Prolific CC]";

console.info(`${LOG_PREFIX} Content script loaded at`, window.location.href);
// Currency symbols map
const CURRENCY_SYMBOLS: Record<string, string> = {
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

const CURRENCY_CODES = Object.keys(CURRENCY_SYMBOLS);

async function getTargetCurrency(): Promise<string> {
  const stored = await browser.storage.sync.get("targetCurrency");
  return stored.targetCurrency || "GBP";
}

function parseCurrencyAmount(text: string): { currency: string; amount: number } | null {
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

function formatCurrency(amount: number, currencyCode: string): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
  return `${symbol}${amount.toFixed(2)}`;
}

async function convertAndInject(element: Element, targetCurrency: string): Promise<void> {
  const text = element.textContent?.trim();
  if (!text) return;

  // Avoid processing the same node repeatedly
  const el = element as HTMLElement;
  if (el.dataset.ccProcessed === "1" || text.includes(" / ")) {
    return;
  }

  const parsed = parseCurrencyAmount(text);
  if (!parsed || parsed.currency === targetCurrency) return;

  // Request conversion from background worker (Firefox uses Promise-based API)
  try {
    console.debug(
      `${LOG_PREFIX} Converting`,
      { amount: parsed.amount, from: parsed.currency, to: targetCurrency },
      `for text="${text}"`
    );
    const response = await browser.runtime.sendMessage({
      action: "convert",
      amount: parsed.amount,
      from: parsed.currency,
      to: targetCurrency,
    });

    if (response && response.success && response.value !== null) {
      const converted = formatCurrency(response.value, targetCurrency);
      const original = text.split(" •")[0];
      const newText = `${original} / ${converted}`;
      element.textContent = newText;
      el.dataset.ccProcessed = "1";
      console.debug(`${LOG_PREFIX} Injected conversion`, { original, converted: newText });
    } else {
      const original = text.split(" /")[0];
      const newText = `${original} / ??`;
      element.textContent = newText;
      el.dataset.ccProcessed = "1";
      console.warn(`${LOG_PREFIX} Conversion unavailable; injected ??`, { original });
    }
  } catch (err) {
    const original = text.split(" /")[0];
    const newText = `${original} / ??`;
    element.textContent = newText;
    el.dataset.ccProcessed = "1";
    console.error(`${LOG_PREFIX} Messaging error; injected ??`, err);
  }
}

async function processRewardElements(): Promise<void> {
  console.info(`${LOG_PREFIX} Starting reward scan`);
  try {
    const targetCurrency = await getTargetCurrency();

    // Find all reward amount elements
    const rewardElements = document.querySelectorAll(
      '[data-testid="study-tag-reward"], [data-testid="study-tag-reward-per-hour"]'
    );

    console.info(`${LOG_PREFIX} Found reward elements:`, rewardElements.length);

    for (const element of rewardElements) {
      console.debug(`${LOG_PREFIX} Processing element`, element);
      await convertAndInject(element, targetCurrency);
    }
  } catch (err) {
    console.error(`${LOG_PREFIX} processRewardElements failed`, err);
  }
}

// Run on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    console.info(`${LOG_PREFIX} DOMContentLoaded`);
    void processRewardElements();
  });
} else {
  console.info(`${LOG_PREFIX} Document ready; processing immediately`);
  void processRewardElements();
}

// Listen for storage changes (user updates target currency in options)
browser.storage.onChanged.addListener((changes) => {
  if (changes.targetCurrency) {
    void processRewardElements();
  }
});

// Watch for dynamically added reward elements (pagination, infinite scroll)
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      void processRewardElements();
      break;
    }
  }
});
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

console.info(`${LOG_PREFIX} MutationObserver attached`);
