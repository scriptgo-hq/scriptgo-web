/** Fixed illustration palette. Illustrations keep these colors in both themes. */
export const INK = "#15130F";
export const CREAM = "#F7F1E5";
export const PAPER = "#FFFDF8";
export const WHITE = "#FFFFFF";
export const COBALT = "#2F3CE0";
export const COBALT_DARK = "#1D27A6";
export const COBALT_LIGHT = "#6B77FF";
export const SUN = "#FFC83D";
export const SUN_DARK = "#E09A1C";
export const SUN_LIGHT = "#FFE38A";
export const OPEN77_NAVY = "#060A0F";
export const OPEN77_CYAN = "#22E0EE";

export const RED = "#E5394B";
export const ORANGE = "#F07B2C";
export const TEAL = "#1FA39B";
export const MINT = "#A9DCCB";
export const SKY = "#9BD8F3";
export const GRASS = "#4FB548";
export const GRASS_DARK = "#2F7D3A";
export const DIRT = "#A8693A";
export const DIRT_DARK = "#7A4A26";
export const STONE = "#C8C3B8";
export const STONE_DARK = "#8F897D";
export const SKIN = "#F2C49B";

/** Outline width at native viewBox size. */
export const STROKE = 3;

/** Accessibility props: labelled image when a title is given, decorative otherwise. */
export function svgA11y(title?: string) {
  return title
    ? ({ role: "img" } as const)
    : ({ "aria-hidden": true, focusable: "false" } as const);
}

/** Round to one decimal to keep generated markup short. */
export function r1(n: number): number {
  return Math.round(n * 10) / 10;
}
