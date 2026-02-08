# Prolific Currency Converter — Privacy Policy

**Effective date:** 2026-01-02

## Summary

This extension converts Prolific study reward amounts into a user-selected currency using public exchange-rate APIs. It only uses the minimum data needed to do that.

## What information is used

- **Website content:** the reward amount numbers shown on Prolific pages (only the numbers and nearby text needed to find them).
- **Local settings:** your selected currency and display options, stored locally for up to 24 hours via `chrome.storage`.

We do **NOT** collect, store, or transmit:
- Personally identifiable information (names, emails, user IDs)
- Authentication information (passwords, tokens)
- Payment or financial account details
- Location data (GPS), IP addresses used to identify users, browsing history, personal communications, or behavioral/keystroke data

## How it’s used

- The amount and your selected currency are sent to public exchange-rate APIs (e.g., frankfurter.app, open.er-api.com) to fetch conversion rates and show the converted value.
- Your preferences are used only to remember your chosen currency and display options for up to 24 hours.

## Sharing and third parties

- Exchange-rate API providers receive only the amount and the selected currency (no personal data). We do not sell, rent, or share data for advertising or profiling.
- These APIs are independent services with their own policies.

## Storage and retention

- Your preferences are cached locally using `chrome.storage` for up to 24 hours, then automatically cleared.
- This extension does not keep any user data on a server or beyond the 24-hour cache period.

## Security

- The extension does not transmit personal data or sensitive authentication information. Requests to exchange-rate APIs are over HTTPS.
- All code runs from the packaged extension (no remote code execution).

## Remote code

- No remote JavaScript or WebAssembly is loaded or executed at runtime; all code runs from the packaged extension files.

## Your choices

- To stop conversions, disable or uninstall the extension.
- Cached data is automatically cleared after 24 hours.

## Contact

For questions about this privacy policy, contact: **[ferrnix@proton.me]**

## Certifications

I certify that:
- I do not sell or transfer user data to third parties.
- I do not use or transfer user data for purposes unrelated to the extension's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.
