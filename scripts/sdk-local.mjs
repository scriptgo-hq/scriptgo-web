#!/usr/bin/env node
// Builds this site against an SDK checkout that is not tagged yet, without touching any committed
// file: the built `dist/` of @scriptgo/shared in that checkout replaces the `dist/` of the pinned
// tarball pnpm installed in node_modules (the API repository has the same tool, tools/sdk-local.mjs).
//
//   (cd <sdk> && corepack pnpm install && corepack pnpm -r --filter "./packages/*" run build)
//   SCRIPTGO_SDK_DIR=<sdk> node scripts/sdk-local.mjs      overlay (docs: SCRIPTGO_SDK_DIR also feeds fetch-sdk)
//   node scripts/sdk-local.mjs --status                     says which SDK node_modules holds
//   corepack pnpm install --force                           back to the pinned tag
//
// package.json keeps the pinned tag: a branch built this way proves the pages against the SDK
// checkout, and merges only once that SDK is tagged and the pin moves to it. Vercel always installs
// the pinned tag, so a deployed build never contains an overlay.
import { cpSync, existsSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function installed() {
  const store = join(root, "node_modules", ".pnpm");
  if (!existsSync(store)) return [];
  return readdirSync(store)
    .filter((d) => d.startsWith("@scriptgo+shared@"))
    .map((d) => join(store, d, "node_modules", "@scriptgo", "shared"))
    .filter((d) => existsSync(join(d, "package.json")))
    .map((d) => realpathSync(d));
}

if (process.argv.includes("--status")) {
  for (const dir of installed()) {
    const stamp = join(dir, ".sdk-local");
    console.log(`@scriptgo/shared: ${existsSync(stamp) ? `overlay from ${readFileSync(stamp, "utf8").trim()}` : "the pinned tarball"}`);
  }
  process.exit(0);
}

const sdk = process.env.SCRIPTGO_SDK_DIR ? resolve(root, process.env.SCRIPTGO_SDK_DIR) : null;
if (!sdk || !existsSync(join(sdk, "packages", "shared", "package.json"))) {
  console.error("sdk-local: set SCRIPTGO_SDK_DIR to a checkout of scriptgo-sdk (installed and built).");
  process.exit(2);
}
const from = join(sdk, "packages", "shared", "dist");
if (!existsSync(join(from, "index.js"))) {
  console.error(`sdk-local: ${from} is not built: run corepack pnpm -r --filter "./packages/*" run build in the SDK.`);
  process.exit(2);
}
const targets = installed();
if (targets.length === 0) {
  console.error("sdk-local: @scriptgo/shared is not installed here: run corepack pnpm install first.");
  process.exit(2);
}
const head = spawnSync("git", ["-C", sdk, "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).stdout?.trim() || "unknown";
const branch = spawnSync("git", ["-C", sdk, "rev-parse", "--abbrev-ref", "HEAD"], { encoding: "utf8" }).stdout?.trim() || "?";
for (const dir of targets) {
  rmSync(join(dir, "dist"), { recursive: true, force: true });
  cpSync(from, join(dir, "dist"), { recursive: true });
  writeFileSync(join(dir, ".sdk-local"), `${branch} ${head}\n`);
}
console.log(`sdk-local: @scriptgo/shared <- ${branch} ${head}`);
