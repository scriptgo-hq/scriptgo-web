#!/usr/bin/env node
// Puts the SCRIPT//GO SDK (github.com/scriptgo-hq/scriptgo-sdk, public, MIT) in `.sdk/`, at the tag
// pinned in package.json:
//
//   "scriptgo": { "sdk": "v0.1.0" }
//
//   node scripts/fetch-sdk.mjs                 the whole SDK
//   node scripts/fetch-sdk.mjs --only docs     only these top-level folders (comma-separated)
//
// SCRIPTGO_SDK_DIR set: nothing is downloaded, that folder is used as is (a local checkout of the
// SDK, to try a change before it is tagged). The `@scriptgo/*` dependencies must come from the same
// tag (their release tarballs, or npm at that version): the script refuses a mismatch, so the code
// and the documentation never come from two different SDKs.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { x as untar } from "tar";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const tag = pkg.scriptgo?.sdk;
if (!/^v\d+\.\d+\.\d+(-[\w.]+)?$/.test(tag ?? "")) {
  console.error(`fetch-sdk: package.json "scriptgo.sdk" must be a tag like v0.1.0 (found ${JSON.stringify(tag)})`);
  process.exit(1);
}

// Every @scriptgo/* dependency names the same version as the pinned tag.
const version = tag.slice(1);
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const off = Object.entries(deps)
  .filter(([name]) => name.startsWith("@scriptgo/"))
  .filter(([, spec]) => !(spec.includes(`/download/${tag}/`) || spec === version || spec === `^${version}` || spec === `~${version}`));
if (off.length) {
  console.error(`fetch-sdk: these dependencies do not come from ${tag}: ${off.map(([n, s]) => `${n}@${s}`).join(", ")}`);
  process.exit(1);
}

if (process.env.SCRIPTGO_SDK_DIR) {
  const dir = resolve(root, process.env.SCRIPTGO_SDK_DIR);
  if (!existsSync(join(dir, "sdk"))) {
    console.error(`fetch-sdk: SCRIPTGO_SDK_DIR=${dir} is not an SDK checkout (no sdk/ folder)`);
    process.exit(1);
  }
  console.log(`fetch-sdk: using the local SDK at ${dir} (not ${tag})`);
  process.exit(0);
}

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const only = (arg("--only") ?? "").split(",").filter(Boolean);
const dest = join(root, ".sdk");
const stamp = join(dest, ".scriptgo-sdk");
const want = `${tag} ${only.join(",") || "*"}`;
if (existsSync(stamp) && readFileSync(stamp, "utf8").trim() === want) {
  console.log(`fetch-sdk: .sdk is ${tag}`);
  process.exit(0);
}

const url = `https://codeload.github.com/scriptgo-hq/scriptgo-sdk/tar.gz/refs/tags/${tag}`;
const res = await fetch(url);
if (!res.ok || !res.body) {
  console.error(`fetch-sdk: ${url} answered HTTP ${res.status}`);
  process.exit(1);
}
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
// Archive entries are "scriptgo-sdk-<version>/<path>": strip the first component.
const keep = (path) => {
  const rel = path.split("/").slice(1);
  return rel.length > 0 && (only.length === 0 || only.includes(rel[0]));
};
await pipeline(Readable.fromWeb(res.body), untar({ cwd: dest, strip: 1, filter: keep }));
writeFileSync(stamp, `${want}\n`);
console.log(`fetch-sdk: .sdk is ${tag}${only.length ? ` (${only.join(", ")})` : ""}`);
