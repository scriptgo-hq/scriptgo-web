import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseFrontMatter } from "./markdown";

/**
 * Docs registry. Spec pages are read from the repository's docs/spec at build time; guides live in
 * src/content/docs. Pages using this module are statically generated. A few guides live in the
 * repository's docs/guides, next to the code they describe: each is listed only when its file exists
 * at build time, so the site never links to a page it cannot render.
 */
export interface DocEntry {
  slug: string;
  title: string;
  description: string;
  group: "Start" | "Reference" | "Licensing" | "Platform builders" | "Help";
  source: { kind: "spec" | "guide" | "repo-guide"; file: string };
}

const ROOT = process.cwd();
const SPEC_DIR = path.resolve(ROOT, "../../docs/spec");
const GUIDE_DIR = path.resolve(ROOT, "src/content/docs");
const REPO_GUIDE_DIR = path.resolve(ROOT, "../../docs/guides");

/** The adapter guide for escrow, written next to the SDK. Listed only when the file is there. */
export const ESCROW_ADAPTER_GUIDE_SLUG = "guides/bring-escrow-to-your-platform";
const ESCROW_ADAPTER_GUIDE_FILE = "bring-escrow-to-your-platform.md";

const REPO_GUIDES: DocEntry[] = [
  {
    slug: ESCROW_ADAPTER_GUIDE_SLUG,
    title: "Bring escrow to your platform",
    description: "What a host needs to load encrypted releases: a server key, the key endpoint, and a loader in compiled code.",
    group: "Platform builders",
    source: { kind: "repo-guide", file: ESCROW_ADAPTER_GUIDE_FILE },
  },
];

const BUILT_IN_DOCS: DocEntry[] = [
  {
    slug: "quickstart",
    title: "Quickstart",
    description: "From an empty folder to a resource running in several environments.",
    group: "Start",
    source: { kind: "guide", file: "quickstart.md" },
  },
  {
    slug: "manifest",
    title: "Manifest",
    description: "The declarative resource manifest, scriptgo.lua or scriptgo.json: directives, script languages, parsing and resolution rules.",
    group: "Reference",
    source: { kind: "spec", file: "manifest.md" },
  },
  {
    slug: "runtime",
    title: "Runtime API",
    description: "Globals, the ScriptGo namespace, capabilities, the value codec and the sandbox.",
    group: "Reference",
    source: { kind: "spec", file: "runtime.md" },
  },
  {
    slug: "sdk/capabilities",
    title: "SDK and capabilities",
    description: "Required and optional capabilities, fallbacks, and what each ScriptGo member needs.",
    group: "Reference",
    source: { kind: "guide", file: "sdk/capabilities.md" },
  },
  {
    slug: "cli",
    title: "CLI",
    description: "The scriptgo command line: init, test, verify, publish, add.",
    group: "Reference",
    source: { kind: "guide", file: "cli.md" },
  },
  {
    slug: "licensing-api",
    title: "Licensing API",
    description: "Activate, verify and deactivate licenses from a deployment, with offline grace.",
    group: "Licensing",
    source: { kind: "guide", file: "licensing-api.md" },
  },
  {
    slug: "protect-your-work",
    title: "Protect your work",
    description: "Signed releases, per-server licences and encrypted releases: how to publish them, run them, and what they do not do.",
    group: "Licensing",
    source: { kind: "guide", file: "protect-your-work.md" },
  },
  {
    slug: "perks",
    title: "Player perks",
    description: "Sell a perk to the players of your own server: the server link, the check, the event queue, the purchase link and ScriptGo.perks.",
    group: "Licensing",
    source: { kind: "spec", file: "perks.md" },
  },
  {
    slug: "api",
    title: "HTTP API reference",
    description: "The v1 HTTP contract between the API, the website and the CLI.",
    group: "Licensing",
    source: { kind: "spec", file: "api.md" },
  },
  {
    slug: "create-adapter",
    title: "Create an adapter",
    description: "Bring SCRIPT//GO resources to your engine or framework.",
    group: "Platform builders",
    source: { kind: "guide", file: "create-adapter.md" },
  },
  {
    slug: "sdk",
    title: "The SDK",
    description: "The pieces of the SDK, the two ways to integrate it, and what is not built yet.",
    group: "Platform builders",
    source: { kind: "guide", file: "sdk.md" },
  },
  {
    slug: "dotnet-kit",
    title: "Embed the .NET kit",
    description: "Run Lua, TypeScript and JavaScript packages inside a .NET 10 engine or server.",
    group: "Platform builders",
    source: { kind: "guide", file: "dotnet-kit.md" },
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    description: "Symptoms, causes and fixes for the errors you are most likely to meet.",
    group: "Help",
    source: { kind: "guide", file: "troubleshooting.md" },
  },
];

export const DOCS: DocEntry[] = (() => {
  const present = REPO_GUIDES.filter((g) => existsSync(path.join(REPO_GUIDE_DIR, g.source.file)));
  if (present.length === 0) return BUILT_IN_DOCS;
  // Repository guides sit at the end of their group, before the Help pages.
  const help = BUILT_IN_DOCS.findIndex((d) => d.group === "Help");
  const at = help < 0 ? BUILT_IN_DOCS.length : help;
  return [...BUILT_IN_DOCS.slice(0, at), ...present, ...BUILT_IN_DOCS.slice(at)];
})();

/** Where to send a platform builder who wants escrow on their host: the adapter guide when it is published here. */
export function escrowAdapterGuideHref(): string | null {
  return DOCS.some((d) => d.slug === ESCROW_ADAPTER_GUIDE_SLUG) ? `/docs/${ESCROW_ADAPTER_GUIDE_SLUG}` : null;
}

export const DOC_GROUPS: DocEntry["group"][] = ["Start", "Reference", "Licensing", "Platform builders", "Help"];

export function findDoc(slug: string): DocEntry | undefined {
  return DOCS.find((d) => d.slug === slug);
}

export async function loadDoc(entry: DocEntry): Promise<{ markdown: string; repoPath: string; title: string; description: string }> {
  if (entry.source.kind === "spec") {
    const file = path.join(SPEC_DIR, entry.source.file);
    const markdown = await readFile(file, "utf8");
    return { markdown, repoPath: `docs/spec/${entry.source.file}`, title: entry.title, description: entry.description };
  }
  if (entry.source.kind === "repo-guide") {
    const raw = await readFile(path.join(REPO_GUIDE_DIR, entry.source.file), "utf8");
    const { data, body } = parseFrontMatter(raw);
    return {
      markdown: body,
      repoPath: `docs/guides/${entry.source.file}`,
      title: data.title || entry.title,
      description: data.description || entry.description,
    };
  }
  const file = path.join(GUIDE_DIR, entry.source.file);
  const raw = await readFile(file, "utf8");
  const { data, body } = parseFrontMatter(raw);
  return {
    markdown: body,
    repoPath: `apps/web/src/content/docs/${entry.source.file}`,
    title: data.title || entry.title,
    description: data.description || entry.description,
  };
}

export function neighbours(slug: string): { prev: DocEntry | null; next: DocEntry | null } {
  const i = DOCS.findIndex((d) => d.slug === slug);
  return { prev: i > 0 ? DOCS[i - 1]! : null, next: i >= 0 && i < DOCS.length - 1 ? DOCS[i + 1]! : null };
}
