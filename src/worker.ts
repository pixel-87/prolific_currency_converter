import browser from "webextension-polyfill";
import { convertCurrency } from "./utils/api";
import type { ConversionResponse } from "./types";

// Listen for messages from content script
browser.runtime.onMessage.addListener(
  async (request: any): Promise<ConversionResponse> => {
    console.log("[Worker] Received message:", request);
    if (request.action === "convert") {
      const result = await convertCurrency(
        request.amount,
        request.from,
        request.to,
      );
      console.log("[Worker] Conversion result:", result);
      return { success: result !== null, value: result };
    }
    return { success: false, value: null };
  },
);
