import browser from "webextension-polyfill";
import { getTargetCurrency } from "./utils/storage";
import { processRewardElements } from "./utils/dom";

const LOG_PREFIX = "[Prolific CC]";
const SCAN_DELAY_MS = 400;

console.info(`${LOG_PREFIX} Content script loaded at`, window.location.href);

let scanScheduled = false;

async function runScan(): Promise<void> {
  const targetCurrency = await getTargetCurrency();
  await processRewardElements(targetCurrency);
}

function scheduleRewardScan(): void {
  if (scanScheduled) return;
  scanScheduled = true;
  setTimeout(() => {
    scanScheduled = false;
    void runScan();
  }, SCAN_DELAY_MS);
}

// Run on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    console.info(`${LOG_PREFIX} DOMContentLoaded`);
    scheduleRewardScan();
  });
} else {
  console.info(`${LOG_PREFIX} Document ready; processing immediately`);
  scheduleRewardScan();
}

// Listen for storage changes (user updates target currency in options)
browser.storage.onChanged.addListener((changes) => {
  if (changes.targetCurrency) {
    void runScan();
  }
});

// Watch for dynamically added reward elements (pagination, infinite scroll)
const observer = new MutationObserver(() => {
  scheduleRewardScan();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

console.info(`${LOG_PREFIX} MutationObserver attached`);
