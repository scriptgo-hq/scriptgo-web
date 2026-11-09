import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseFrontMatter } from "./markdown";

/**
 * Docs registry. Spec pages are read from the repository's docs/spec at build time; guides live in
 * src/content/docs. Pages using this module are statically generated.
 */
export interface DocEntry {
  slug: string;
  title: string;
  description: string;
  group: "Start" | "Reference" | "Licensing" | "Platform builders" | "Help";
  source: { kind: "spec" | "guide"; file: string };
}

const ROOT = process.cwd();
const SPEC_DIR = path.resolve(ROOT, "../../docs/spec");
const GUIDE_DIR = path.resolve(ROOT, "src/content/docs");

export const DOCS: DocEntry[] = [
  {
    slug: "quickstart",
    title: "Quickstart",
    description: "From an empty folder to a resource running in several environments.",
    group: "Start",
    source: { kind: "guide", file: "quickstart.md" },
  },
  {
    slug: "manifest",
    title: "Manifest: scriptgo.lua",
    description: "The declarative resource manifest shared with OPEN//77: directives, parsing and resolution rules.",
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
    slug: "troubleshooting",
    title: "Troubleshooting",
    description: "Symptoms, causes and fixes for the errors you are most likely to meet.",
    group: "Help",
    source: { kind: "guide", file: "troubleshooting.md" },
  },
];

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
