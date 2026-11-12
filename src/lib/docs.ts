import { existsSync, readFileSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseFrontMatter } from "./markdown";
import { SDK_RELEASES, SDK_TAG, adapterPath, sdkEditUrl, sdkFileUrl, sdkTreeUrl } from "./repo";

/**
 * Docs registry. Every page is read at build time from the SCRIPT//GO SDK (scriptgo-hq/scriptgo-sdk,
 * MIT), at the tag pinned in package.json (`scriptgo.sdk`): docs/site for the guides, docs/spec for
 * the specifications, docs/guides for the guides written next to the SDK code. `scripts/fetch-sdk.mjs`
 * puts that tag in `.sdk/` before `next dev` and `next build`; SCRIPTGO_SDK_DIR points at a local
 * checkout instead, to preview a documentation change. Pages using this module are statically
 * generated. A repository guide is listed only when its file exists at build time, so the site never
 * links to a page it cannot render.
 */
export interface DocEntry {
  slug: string;
  title: string;
  description: string;
  group: "Start" | "Reference" | "Licensing" | "Platforms" | "Platform builders" | "Help";
  source: { kind: "spec" | "guide" | "repo-guide"; file: string };
  /** Listed only when its file exists in the SDK the site is built from (a page newer than some tags). */
  optional?: true;
}

const SDK_DIR = path.resolve(process.cwd(), process.env.SCRIPTGO_SDK_DIR || ".sdk");
const SPEC_DIR = path.join(SDK_DIR, "docs/spec");
const GUIDE_DIR = path.join(SDK_DIR, "docs/site");
const REPO_GUIDE_DIR = path.join(SDK_DIR, "docs/guides");

export { SDK_TAG };
/** Where a page's source can be read: the file at the pinned tag. */
export function sourceUrl(repoPath: string): string {
  return sdkFileUrl(repoPath);
}

/**
 * The GitHub links under a page's title, besides its source: where to suggest a change (not for the
 * platform pages, which are generated from the registry and the adapter's SETUP.md), the adapter's
 * folder for a platform page, and the releases for the CLI.
 */
export function docRepoLinks(entry: DocEntry, repoPath: string): { href: string; label: string }[] {
  const links: { href: string; label: string }[] = [];
  if (entry.group === "Platforms") {
    const slug = entry.slug.replace(/^platforms\//, "");
    links.push({ href: sdkTreeUrl(adapterPath(slug)), label: "Adapter source" });
  } else {
    links.push({ href: sdkEditUrl(repoPath), label: "Suggest an edit" });
  }
  if (entry.slug === "cli") links.push({ href: "https://www.npmjs.com/package/@scriptgo/cli", label: "npm" }, { href: SDK_RELEASES, label: "Releases" });
  return links;
}

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
    slug: "environments",
    title: "Environments and statuses",
    description: "What an environment is, how it earns its status from real runs, and how to read the directory.",
    group: "Reference",
    source: { kind: "guide", file: "environments.md" },
  },
  {
    slug: "selling",
    title: "Selling",
    description: "Who sells, who charges and who licenses; the two ways to earn; opening a shop; the rules a seller answers for.",
    group: "Licensing",
    source: { kind: "guide", file: "selling.md" },
  },
  {
    slug: "selling-assets",
    title: "Selling assets",
    description: "Maps, models, textures and sounds on every platform that delivers files: how each one delivers them, what a fingerprinted copy is, and encrypted assets on OPEN//77.",
    group: "Licensing",
    source: { kind: "guide", file: "selling-assets.md" },
    optional: true,
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
    slug: "protect-your-own-server",
    title: "Protect your own server",
    description: "Keep your own game server's scripts from leaking, with nothing sold: a private encrypted package granted to your server's key, platform by platform.",
    group: "Licensing",
    source: { kind: "guide", file: "protect-your-own-server.md" },
    optional: true,
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
    description: "The pieces of the SDK, the two ways to integrate it, and what comes next.",
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

/**
 * One page per platform (docs/site/platforms/<slug>.md, generated in the SDK from its platform
 * registry): how it runs, setup, capabilities, protection, limits and real runs. A platform's page on
 * the site stays short and links here. Listed only when the SDK at the pinned tag has them.
 */
const PLATFORM_DOC_DIR = path.join(GUIDE_DIR, "platforms");
const PLATFORM_DOCS: DocEntry[] = (() => {
  if (!existsSync(PLATFORM_DOC_DIR)) return [];
  return readdirSync(PLATFORM_DOC_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { data } = parseFrontMatter(readFileSync(path.join(PLATFORM_DOC_DIR, f), "utf8"));
      const slug = f.slice(0, -3);
      return {
        slug: `platforms/${slug}`,
        title: data.title || slug,
        description: data.description || "",
        group: "Platforms" as const,
        source: { kind: "guide" as const, file: `platforms/${f}` },
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
})();

export const DOCS: DocEntry[] = (() => {
  const present = REPO_GUIDES.filter((g) => existsSync(path.join(REPO_GUIDE_DIR, g.source.file)));
  // Platform pages sit before the platform builders' group; repository guides at the end of theirs, before Help.
  const builtIn = BUILT_IN_DOCS.filter((d) => !d.optional || existsSync(path.join(GUIDE_DIR, d.source.file)));
  const builders = builtIn.findIndex((d) => d.group === "Platform builders");
  const withPlatforms = builders < 0 ? [...builtIn, ...PLATFORM_DOCS] : [...builtIn.slice(0, builders), ...PLATFORM_DOCS, ...builtIn.slice(builders)];
  if (present.length === 0) return withPlatforms;
  const help = withPlatforms.findIndex((d) => d.group === "Help");
  const at = help < 0 ? withPlatforms.length : help;
  return [...withPlatforms.slice(0, at), ...present, ...withPlatforms.slice(at)];
})();

/**
 * Where a platform's detail lives: its docs page when the SDK at the pinned tag has one, otherwise
 * the adapter's folder on GitHub (README and SETUP.md), otherwise the page on statuses.
 */
export function platformDocHref(slug: string, hasAdapter: boolean): string {
  if (DOCS.some((d) => d.slug === `platforms/${slug}`)) return `/docs/platforms/${slug}`;
  if (hasAdapter) return sdkTreeUrl(adapterPath(slug));
  return "/docs/environments";
}

/** Where to send a platform builder who wants escrow on their host: the adapter guide when it is published here. */
export function escrowAdapterGuideHref(): string | null {
  return DOCS.some((d) => d.slug === ESCROW_ADAPTER_GUIDE_SLUG) ? `/docs/${ESCROW_ADAPTER_GUIDE_SLUG}` : null;
}

/** The groups in nav order, the empty ones left out (Platforms needs an SDK that has its pages). */
export const DOC_GROUPS: DocEntry["group"][] = (["Start", "Reference", "Licensing", "Platforms", "Platform builders", "Help"] as const).filter((g) =>
  DOCS.some((d) => d.group === g),
);

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
    repoPath: `docs/site/${entry.source.file}`,
    title: data.title || entry.title,
    description: data.description || entry.description,
  };
}

export function neighbours(slug: string): { prev: DocEntry | null; next: DocEntry | null } {
  const i = DOCS.findIndex((d) => d.slug === slug);
  return { prev: i > 0 ? DOCS[i - 1]! : null, next: i >= 0 && i < DOCS.length - 1 ? DOCS[i + 1]! : null };
}
