import type { StatusMeta } from "./status";

/**
 * Display names for environment slugs that appear in package summaries (which only carry the slug).
 * These are labels, not data: status, versions and capabilities always come from /v1/environments.
 */
const NAMES: Record<string, string> = {
  standalone: "Lua",
  love2d: "LÖVE",
  godot: "Godot",
  luanti: "Luanti",
  open77: "OPEN//77",
  openresty: "OpenResty",
  defold: "Defold",
  neovim: "Neovim",
  cctweaked: "CC: Tweaked",
  dotnet: ".NET",
  garrysmod: "Garry's Mod",
  hytale: "Hytale",
  rust: "Rust",
  beammp: "BeamMP",
  fivem: "FiveM",
  roblox: "Roblox",
  redm: "RedM",
  kcdmp: "KCD:MP",
  zomboid: "Project Zomboid",
  dst: "Don't Starve Together",
};

const LONG_NAMES: Record<string, string> = {
  standalone: "Standalone Lua",
  love2d: "LÖVE",
  godot: "Godot 4",
  luanti: "Luanti",
  open77: "OPEN//77",
  cctweaked: "CC: Tweaked (Minecraft)",
  dotnet: ".NET kit",
  garrysmod: "Garry's Mod",
  hytale: "Hytale",
  rust: "Rust (Oxide/Carbon)",
  beammp: "BeamMP",
  fivem: "FiveM",
  roblox: "Roblox",
  redm: "RedM",
  kcdmp: "KCD:MP (Kingdom Come)",
  zomboid: "Project Zomboid",
  dst: "Don't Starve Together",
};

const MONOGRAMS: Record<string, string> = {
  standalone: "Lua",
  love2d: "LÖ",
  godot: "Gd",
  luanti: "Lt",
  open77: "77",
  openresty: "OR",
  defold: "Df",
  neovim: "Nv",
  cctweaked: "CC",
  dotnet: ".N",
  garrysmod: "GM",
  hytale: "Hy",
  rust: "Rs",
  beammp: "BM",
  fivem: "FM",
  roblox: "Rb",
  redm: "RM",
  kcdmp: "KC",
  zomboid: "PZ",
  dst: "DS",
};

export function envName(slug: string, fallback?: string): string {
  return fallback ?? NAMES[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function envLongName(slug: string, fallback?: string): string {
  return fallback ?? LONG_NAMES[slug] ?? envName(slug);
}

export function envMonogram(slug: string, name?: string): string {
  if (MONOGRAMS[slug]) return MONOGRAMS[slug]!;
  const n = name ?? slug;
  const first = n.charAt(0).toUpperCase();
  const rest = n.slice(1).replace(/[^a-z]/gi, "");
  const consonant = rest.match(/[^aeiou]/i)?.[0] ?? rest.charAt(0);
  return `${first}${consonant.toLowerCase()}`;
}

/**
 * The two kinds of environment, in display order. A runtime runs the scripts itself; a mod platform
 * is a layer on top of an existing game (players bring the game). Rename a section here, nowhere else.
 */
export const ENV_KINDS = [
  {
    kind: "runtime",
    title: "Engines & runtimes",
    singular: "Engine or runtime",
    blurb: "The scripts run inside the engine or runtime itself.",
  },
  {
    kind: "mod_platform",
    title: "Mod platforms",
    singular: "Mod platform",
    blurb:
      "Layers that add scripting on top of an existing game. Players bring their own copy.",
  },
] as const;

export function envKind(kind: string) {
  return ENV_KINDS.find((k) => k.kind === kind) ?? ENV_KINDS[0];
}

export const KNOWN_ENVIRONMENTS = ["standalone", "love2d", "godot", "luanti", "open77"];

export function dialectLabel(d: string): string {
  if (d.toLowerCase() === "luajit") return "LuaJIT";
  if (d.toLowerCase() === "luau") return "Luau";
  return /^\d/.test(d) ? `Lua ${d}` : d;
}

const LANGUAGE_NAMES: Record<string, string> = { lua: "Lua", ts: "TypeScript", js: "JavaScript", cs: "C#" };

/**
 * The languages an environment runs, for display: its Lua dialects in place of "lua", then the
 * other guest languages ("Lua 5.4", "TypeScript", "JavaScript" for the .NET kit).
 */
export function languageLabels(e: { languages?: string[]; luaDialects: string[] }): string[] {
  const langs = e.languages?.length ? e.languages : ["lua"];
  return langs.flatMap((l) =>
    l === "lua" ? (e.luaDialects.length ? e.luaDialects.map(dialectLabel) : ["Lua"]) : [LANGUAGE_NAMES[l] ?? l],
  );
}

/**
 * Where each guest language runs today. Lua: every environment. TypeScript and JavaScript: the .NET
 * kit only (verified there by sg_probe_ts and the sg_xlang pair). C#: planned, refused today.
 * Change a line here only when the evidence changes (PROJECT_STATUS.md, verification/reports).
 */
export const LANGUAGE_STATES: { language: string; meta: StatusMeta }[] = [
  {
    language: "lua",
    meta: { label: "Lua: everywhere", tone: "success", icon: "check", hint: "Every environment runs Lua." },
  },
  {
    language: "ts",
    meta: {
      label: "TypeScript: .NET kit, experimental",
      tone: "warning",
      icon: "flask",
      hint: "TypeScript and JavaScript run on the .NET host kit only. Other environments run Lua.",
    },
  },
  {
    language: "cs",
    meta: { label: "C#: next", tone: "muted", icon: "calendar", hint: "Planned. No host runs C# yet." },
  },
];
