import type { Category } from "./contract";

/**
 * The inked illustrations, and which environment or category each one stands for. These are
 * pictures and labels only: names, statuses, versions and counts always come from /v1/environments.
 */
export interface WorldArt {
  /** File stem under /ink: `world-<art>.webp` (1382x778) and `world-<art>-card.webp` (360x203). */
  art: string;
  /** Plate colour behind the picked ticket and the hero tag. */
  tint: string;
  /** One line that says what kind of place this is. */
  kind: string;
}

export const WORLD_ART: Record<string, WorldArt> = {
  garrysmod: { art: "sandbox", tint: "#ff8a3d", kind: "Physics sandbox" },
  fivem: { art: "city", tint: "#e77bff", kind: "Roleplay servers" },
  cctweaked: { art: "voxel", tint: "#86dc5f", kind: "Block worlds" },
  rust: { art: "survival", tint: "#ff7a52", kind: "Survival servers" },
  godot: { art: "engine", tint: "#7db4ff", kind: "Game engine" },
  beammp: { art: "driving", tint: "#ffa574", kind: "Driving servers" },
  redm: { art: "frontier", tint: "#ffc061", kind: "Frontier roleplay" },
  open77: { art: "open77", tint: "#a48bff", kind: "Multiplayer servers" },
};

/** The home page picker, left to right. Only environments the registry really lists are shown. */
export const PICKER_ORDER = ["garrysmod", "fivem", "cctweaked", "rust", "godot", "beammp", "redm", "open77"];
export const DEFAULT_WORLD = "godot";

export const WORLD_SIZE = { width: 1382, height: 778 } as const;
export const WORLD_CARD_SIZE = { width: 360, height: 203 } as const;

export function worldArt(slug: string): WorldArt | null {
  return WORLD_ART[slug] ?? null;
}
export function worldSrc(art: string): string {
  return `/ink/world-${art}.webp`;
}
export function worldCardSrc(art: string): string {
  return `/ink/world-${art}-card.webp`;
}

/** Registry names carry a qualifier in brackets ("Rust (Oxide/Carbon)"); tickets show the short form. */
export function shortEnvName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*$/, "");
}

/** Ground colours for environments without a drawing: a typographic tile, never a stand-in picture. */
const TILE_GROUNDS = [
  { bg: "#2f3ce0", fg: "#f3ecdc", slash: "#ffc83d" },
  { bg: "#121238", fg: "#f3ecdc", slash: "#ffc83d" },
  { bg: "#ffc83d", fg: "#0b0b1e", slash: "#2f3ce0" },
  { bg: "#7a5cf0", fg: "#fffdf6", slash: "#ffc83d" },
  { bg: "#e8dec6", fg: "#0b0b1e", slash: "#2f3ce0" },
];
export function tileGround(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return TILE_GROUNDS[h % TILE_GROUNDS.length]!;
}

/** Category covers (800x500). A category without its own drawing borrows a neutral scene. */
const COVERS: Partial<Record<Category, string>> = {
  inventory: "cover-inventory",
  permissions: "cover-permissions",
  economy: "cover-economy",
  quests: "cover-quests",
  ui: "cover-hud",
  admin: "cover-admin",
  vehicles: "cover-garage",
  housing: "cover-housing",
  framework: "cover-permissions",
  events: "scene-signpost",
  library: "scene-strongbox",
  other: "scene-stall",
};
export function cover(category: Category): { src: string; width: number; height: number } {
  const stem = COVERS[category] ?? "scene-signpost";
  return stem.startsWith("scene-") ? { src: `/ink/${stem}.webp`, width: 1152, height: 691 } : { src: `/ink/${stem}.webp`, width: 800, height: 500 };
}
