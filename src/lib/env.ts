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
};

const LONG_NAMES: Record<string, string> = {
  standalone: "Standalone Lua",
  love2d: "LÖVE",
  godot: "Godot 4",
  luanti: "Luanti",
  open77: "OPEN//77",
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

export const KNOWN_ENVIRONMENTS = ["standalone", "love2d", "godot", "luanti", "open77"];

export function dialectLabel(d: string): string {
  return d === "luajit" ? "LuaJIT" : `Lua ${d}`;
}
