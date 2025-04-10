import { resolve } from "path";
import { mkdir } from "fs/promises";

async function build() {
  // Ensure dist directory exists
  await mkdir("dist", { recursive: true });

  // Build ESM version
  const esmBuild = await Bun.build({
    entrypoints: ["./src/index.ts"],
    outdir: "./dist",
    naming: {
      entry: "baserow.esm.js"
    },
    sourcemap: 'external',
    minify: false,
    external: ["*"],
    format: "esm",
  });

  if (!esmBuild.success) {
    console.error("ESM build failed:", esmBuild.logs);
    process.exit(1);
  }

  // Build CJS version
  const cjsBuild = await Bun.build({
    entrypoints: ["./src/index.ts"],
    outdir: "./dist",
    naming: {
      entry: "baserow.cjs.js"
    },
    sourcemap: 'external',
    minify: false,
    external: ["*"],
    format: "cjs",
  });

  if (!cjsBuild.success) {
    console.error("CJS build failed:", cjsBuild.logs);
    process.exit(1);
  }
}

build().catch(console.error); 