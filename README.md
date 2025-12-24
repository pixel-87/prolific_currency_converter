# Prolific Currency Converter

Converts currencies on prolific to a target currency.

This is all vibecoded since I don't know TS, I was just annoyed and wanted a solution so I did this in an evening.

## Usage

- Develop/test inside the Nix shell: `nix develop` and then `npm run build` (or `npm run build -- --watch`).
- Build Firefox artifact: `nix build .#firefox` produces `result/extension` with the Firefox manifest.
- Build Chrome artifact: `nix build .#chrome` reuses the Chrome manifest (service worker + no Gecko settings).

Reload the desired `result/extension` directory through `about:debugging` (Firefox) or `chrome://extensions` (Chrome) to test.

## Contributing

Any contributions welcome just make a PR