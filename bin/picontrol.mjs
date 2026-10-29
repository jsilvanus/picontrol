#!/usr/bin/env node
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distEntry = join(__dirname, "..", "dist", "cli", "index.js");

if (existsSync(distEntry)) {
  await import(pathToFileURL(distEntry).href);
} else {
  // If not built yet, run tsx directly if available
  const srcEntry = join(__dirname, "..", "src", "cli", "index.ts");
  const res = spawnSync("npx", ["tsx", srcEntry, ...process.argv.slice(2)], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  process.exit(res.status ?? 0);
}
