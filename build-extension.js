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
  bundle: false,
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
    fs.copyFileSync("manifest.json", path.join(outdir, "manifest.json"));
    fs.copyFileSync("src/options.html", path.join(outdir, "options.html"));

    console.log("✓ Extension built successfully!");
    console.log(`✓ Output directory: ${path.resolve(outdir)}`);
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

build();
