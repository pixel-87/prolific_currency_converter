// Load saved currency preference
interface CurrencyResult {
    targetCurrency?: string;
}

browser.storage.sync.get("targetCurrency", (result) => {
    const select = document.getElementById("targetCurrency") as HTMLSelectElement;
    select.value = result.targetCurrency || "GBP";
});

// Save on change
const select = document.getElementById("targetCurrency") as HTMLSelectElement;
select.addEventListener("change", () => {
  browser.storage.sync.set({ targetCurrency: select.value });

  // Show success message
  const status = document.getElementById("status");
  if (status) {
    status.classList.add("show");
    setTimeout(() => {
      status.classList.remove("show");
    }, 2000);
  }
});
