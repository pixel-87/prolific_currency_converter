const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const outdir = "dist";

// Clean dist folder
if (fs.existsSync(outdir)) {
  fs.rmSync(outdir, { recursive: true });
}
fs.mkdirSync(outdir, { recursive: true });

const isWatch = process.argv.includes("--watch");

const commonConfig = {
  bundle: true,
  target: "es2020",
};

const buildConfigs = [
  {
    ...commonConfig,
    entryPoints: ["src/content.ts"],
    outfile: path.join(outdir, "content.js"),
  },
  {
    ...commonConfig,
    entryPoints: ["src/worker.ts"],
    outfile: path.join(outdir, "worker.js"),
  },
  {
    ...commonConfig,
    entryPoints: ["src/options.ts"],
    outfile: path.join(outdir, "options.js"),
  },
];

async function build() {
  try {
    if (isWatch) {
      // Use context for watch mode
      const contexts = await Promise.all(buildConfigs.map((config) => esbuild.context(config)));
      await Promise.all(contexts.map((ctx) => ctx.watch()));
      console.log("✓ Watching for changes...");
    } else {
      // Regular build
      await Promise.all(buildConfigs.map((config) => esbuild.build(config)));
    }

    // Copy static files
    const manifestSource = process.env.MANIFEST_PATH
      ? path.resolve(process.env.MANIFEST_PATH)
      : path.join(__dirname, "manifest.json");
    fs.copyFileSync(manifestSource, path.join(outdir, "manifest.json"));
    fs.copyFileSync("src/options.html", path.join(outdir, "options.html"));
    // Copy assets directory (icons, screenshots, etc.) if present
    const assetsSrc = path.join(__dirname, "assets");
    const assetsDest = path.join(outdir, "assets");
    if (fs.existsSync(assetsSrc)) {
      // prefer fs.cpSync when available (Node 16+)
      if (typeof fs.cpSync === "function") {
        fs.cpSync(assetsSrc, assetsDest, { recursive: true });
      } else {
        // fallback: simple recursive copy
        const copyRecursive = (src, dest) => {
          if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
          for (const name of fs.readdirSync(src)) {
            const s = path.join(src, name);
            const d = path.join(dest, name);
            const stat = fs.statSync(s);
            if (stat.isDirectory()) copyRecursive(s, d);
            else fs.copyFileSync(s, d);
          }
        };
        copyRecursive(assetsSrc, assetsDest);
      }
    }

    console.log("✓ Extension built successfully!");
    console.log(`✓ Output directory: ${path.resolve(outdir)}`);
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

build();
