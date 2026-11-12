import type { AssetReportStatus, AssetRightsCase, AssetSupport } from "./contract";
import type { StatusMeta } from "./status";

/**
 * Words for assets (docs/spec/assets.md; ADR-0043 in scriptgo-api). Assets are licensed,
 * fingerprinted and traceable: never "encrypted", "escrow" or "protected" on these pages, except for
 * a release with asset escrow (OPEN//77), worded in lib/release-protection.ts.
 */

/** Where the detail lives: the SDK's page, rendered under /docs. */
export const ASSETS_DOC = "/docs/selling-assets";

export const RIGHTS_CASES: { id: AssetRightsCase; label: string; hint: string }[] = [
  { id: "original", label: "Made by me", hint: "You made them, or they are licensed to you for this." },
  { id: "game_edits", label: "Edits of a game's files", hint: "Edits of, or made from, a game's own files." },
  { id: "game_extracted", label: "Includes files taken from a game", hint: "Some files are a game's own, taken from it." },
];

export function rightsCaseLabel(c: AssetRightsCase | null | undefined): string {
  return RIGHTS_CASES.find((x) => x.id === c)?.label ?? "Not declared";
}

export const supportMeta: Record<AssetSupport, StatusMeta> = {
  supported: { label: "Players download", tone: "success", icon: "check", hint: "Players download these files from the server before they join." },
  partial: { label: "Players download", tone: "info", icon: "check", hint: "Delivered to players, with the limits on this platform's page." },
  bundled: { label: "Server only", tone: "neutral", icon: "minus", hint: "The files stay with the resource. Players download nothing." },
  unsupported: { label: "Not delivered", tone: "warning", icon: "alert", hint: "This platform cannot deliver assets." },
};

const NEEDS: Record<string, string> = {
  archivexl: "ArchiveXL",
  tweakxl: "TweakXL",
  levelurl: "a map URL (server.levelurl)",
  fastdl: "FastDL",
  this_is_a_map: "loaded as a map",
};

export function needLabel(n: string): string {
  return NEEDS[n] ?? n;
}

export const fingerprintedMeta: StatusMeta = {
  label: "Fingerprinted copies",
  tone: "info",
  icon: "check",
  hint: "Each licence holder downloads their own copy, with a signed record of their licence in it.",
};

export const assetReportMeta: Record<AssetReportStatus, StatusMeta> = {
  open: { label: "Open", tone: "warning", icon: "clock", hint: "Waiting for a staff decision." },
  actioned: { label: "Actioned", tone: "success", icon: "check", hint: "Staff acted on it." },
  rejected: { label: "Rejected", tone: "muted", icon: "minus", hint: "Closed with no action." },
};

