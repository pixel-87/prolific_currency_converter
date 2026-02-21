import { getTargetCurrency, setTargetCurrency } from "./utils/storage";

async function initOptions() {
  const select = document.getElementById("targetCurrency") as HTMLSelectElement;
  if (!select) return;

  // Load saved currency preference
  select.value = await getTargetCurrency();

  // Save on change
  select.addEventListener("change", async () => {
    await setTargetCurrency(select.value);

    // Show success message
    const status = document.getElementById("status");
    if (status) {
      status.classList.add("show");
      setTimeout(() => {
        status.classList.remove("show");
      }, 2000);
    }
  });
}

document.addEventListener("DOMContentLoaded", initOptions);
