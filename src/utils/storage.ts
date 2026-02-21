import browser from "webextension-polyfill";

export async function getTargetCurrency(): Promise<string> {
  const stored = (await browser.storage.sync.get("targetCurrency")) as {
    targetCurrency?: string;
  };
  return stored.targetCurrency || "GBP";
}

export async function setTargetCurrency(currency: string): Promise<void> {
  await browser.storage.sync.set({ targetCurrency: currency });
}
