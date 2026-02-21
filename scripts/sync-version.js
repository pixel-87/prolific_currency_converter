const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const manifests = ['public/manifest.json', 'public/manifest.chrome.json'];

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;

manifests.forEach((m) => {
  const mPath = path.join(root, m);
  if (!fs.existsSync(mPath)) return;
  const manifest = JSON.parse(fs.readFileSync(mPath, 'utf8'));
  if (manifest.version === version) return;
  manifest.version = version;
  fs.writeFileSync(mPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`Synced ${m} -> ${version}`);
});

// Also update default.nix if you want, but default.nix now reads package.json directly.
console.log('Version sync complete');
