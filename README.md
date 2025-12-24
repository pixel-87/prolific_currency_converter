# Prolific Currency Converter

Mini MV3 extension that converts Prolific reward amounts into a preferred currency using reusable, cached exchange-rate APIs.

## Usage

- Develop/test inside the Nix shell: `nix develop` and then `npm run build` (or `npm run build -- --watch`).
- Build Firefox artifact: `nix build .#firefox` produces `result/extension` with the Firefox manifest.
- Build Chrome artifact: `nix build .#chrome` reuses the Chrome manifest (service worker + no Gecko settings).

Reload the desired `result/extension` directory through `about:debugging` (Firefox) or `chrome://extensions` (Chrome) to test.
