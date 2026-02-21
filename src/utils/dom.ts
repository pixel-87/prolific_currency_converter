import browser from "webextension-polyfill";
import { formatCurrency, parseCurrencyAmount } from "./currency";

const LOG_PREFIX = "[Prolific CC]";

async function convertAndInject(
  element: Element,
  targetCurrency: string,
): Promise<void> {
  const text = element.textContent?.trim();
  if (!text) return;

  // Avoid processing the same node repeatedly
  const el = element as HTMLElement;
  if (el.dataset.ccProcessed === "1" || text.includes(" / ")) {
    return;
  }

  const parsed = parseCurrencyAmount(text);
  if (!parsed || parsed.currency === targetCurrency) return;

  // Request conversion from background worker
  try {
    console.debug(
      `${LOG_PREFIX} Converting`,
      { amount: parsed.amount, from: parsed.currency, to: targetCurrency },
      `for text="${text}"`,
    );
    const response = (await browser.runtime.sendMessage({
      action: "convert",
      amount: parsed.amount,
      from: parsed.currency,
      to: targetCurrency,
    })) as { success: boolean; value: number | null };

    if (response?.success && response.value !== null) {
      const converted = formatCurrency(response.value, targetCurrency);
      const original = text.split(" •")[0];
      const newText = `${original} / ${converted}`;
      element.textContent = newText;
      el.dataset.ccProcessed = "1";
      console.debug(`${LOG_PREFIX} Injected conversion`, {
        original,
        converted: newText,
      });
    } else {
      const original = text.split(" /")[0];
      const newText = `${original} / ??`;
      element.textContent = newText;
      el.dataset.ccProcessed = "1";
      console.warn(`${LOG_PREFIX} Conversion unavailable; injected ??`, {
        original,
      });
    }
  } catch (err) {
    const original = text.split(" /")[0];
    const newText = `${original} / ??`;
    element.textContent = newText;
    el.dataset.ccProcessed = "1";
    console.error(`${LOG_PREFIX} Messaging error; injected ??`, err);
  }
}

export async function processRewardElements(
  targetCurrency: string,
): Promise<void> {
  console.info(`${LOG_PREFIX} Starting reward scan`);
  try {
    // Find all reward amount elements
    const rewardElements = document.querySelectorAll(
      '[data-testid="study-tag-reward"], [data-testid="study-tag-reward-per-hour"]',
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
