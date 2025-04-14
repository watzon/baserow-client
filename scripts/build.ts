import { resolve } from "path";
import { mkdir } from "fs/promises";

async function build() {
  // Ensure dist directory exists
  await mkdir("dist", { recursive: true });

  const commonConfig = {
    sourcemap: 'linked' as const,
    minify: true,
    entrypoints: ["./src/index.ts"],
    outdir: "./dist",
  };

  // Build ESM version
  const esmBuild = await Bun.build({
    ...commonConfig,
    naming: {
      entry: "baserow.mjs",
    },
    format: "esm",
    target: "browser",
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });

  if (!esmBuild.success) {
    console.error("ESM build failed:", esmBuild.logs);
    process.exit(1);
  }

  // Build CJS version
  const cjsBuild = await Bun.build({
    ...commonConfig,
    naming: {
      entry: "baserow.cjs",
    },
    format: "cjs",
    target: "node",
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });

  if (!cjsBuild.success) {
    console.error("CJS build failed:", cjsBuild.logs);
    process.exit(1);
  }
}

build().catch(console.error); 