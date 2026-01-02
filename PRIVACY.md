# Prolific Currency Converter — Privacy Policy

**Effective date:** 2026-01-02

## Summary

This extension converts Prolific study reward amounts into a user-selected currency using public exchange-rate APIs. It only processes the minimal data necessary to provide that functionality.

## Data Collected

- **Website content:** numeric reward amounts visible on Prolific pages (only numbers and the surrounding context needed to locate them).
- **Local cache:** the user's selected target currency and display settings, cached locally for up to 24 hours via `chrome.storage`.

We do **NOT** collect, store, or transmit:
- Personally identifiable information (names, emails, user IDs)
- Authentication information (passwords, tokens)
- Payment or financial account details
- Location data (GPS), IP addresses used to identify users, browsing history, personal communications, or behavioral/keystroke data

## How Data is Used

- Numeric amounts and the selected target currency are sent to third-party public exchange-rate APIs (e.g., frankfurter.app, open.er-api.com) to obtain conversion rates and compute displayed values.
- Cached preferences are used only to remember the user's chosen currency and display options for up to 24 hours.

## Sharing and Third Parties

- Exchange-rate API providers receive only the numeric amount and the selected currency (no PII). We do not sell, rent, or otherwise share user data with third parties for advertising or profiling.
- These third-party APIs are independent services governed by their own policies; consult their policies for details.

## Storage and Retention

- User preferences are cached locally using `chrome.storage` for up to 24 hours, then automatically cleared.
- No user data is retained on any server or beyond the 24-hour cache period by this extension.

## Security

- The extension does not transmit PII or sensitive authentication information. Requests to exchange-rate APIs are over HTTPS.
- All executable code is packaged in the extension bundle (no remote code execution).

## Remote Code

- No remote JavaScript or WebAssembly is loaded or executed at runtime; all code runs from the packaged extension files.

## User Controls

- To stop the extension from converting amounts, uninstall or disable the extension.
- All cached data is automatically cleared after 24 hours.

## Contact

For questions about this privacy policy, contact: **[ferrnix@proton.me]**

## Certifications

I certify that:
- I do not sell or transfer user data to third parties outside approved use cases.
- I do not use or transfer user data for purposes unrelated to the extension's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.
