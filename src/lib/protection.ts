import type { EnvironmentProtection, ProtectionTier } from "./contract";
import type { StatusMeta } from "./status";

/**
 * The words for the protection tier of an environment (ADR-0027). One vocabulary for the directory,
 * the environment pages, the package page and the dashboards. The ceiling is binding on all of it:
 * escrow is deterrence, traceability and revocation; we never say a host cannot be read by its own
 * operator, and a pure-script host gets no code-secrecy claim at all.
 */

export const tierMeta: Record<ProtectionTier, StatusMeta> = {
  escrow: {
    label: "Code escrow",
    tone: "success",
    icon: "shield",
    hint: "The host runs compiled code and can hold a key: an encrypted release is decrypted in memory, for a licensed and bound server only.",
  },
  license: {
    label: "Licence + signing",
    tone: "info",
    icon: "lock",
    hint: "Licence check per server and signed releases. The host runs plain script, so its operator can read what it loads: no code-secrecy claim.",
  },
  none: {
    label: "Nothing sold",
    tone: "neutral",
    icon: "minus",
    hint: "Free packages only here: nothing is sold or licensed. Releases are still signed.",
  },
};

/** Badge meta for one environment: the tier, marked "planned" when it does not work there yet. */
export function protectionMeta(p: EnvironmentProtection): StatusMeta {
  const base = tierMeta[p.tier];
  if (p.state === "planned") {
    return { ...base, label: `${base.label}: planned`, tone: "neutral", icon: "hourglass", hint: p.note || base.hint };
  }
  return { ...base, hint: p.note || base.hint };
}

/** Short heading for a tier, used in tables. */
export function tierHeading(tier: ProtectionTier): string {
  return tier === "escrow" ? "Code escrow" : tier === "license" ? "Licence and signing" : "Nothing sold";
}

/**
 * What a buyer's server gets in an environment for one release, in one sentence. `escrowed` says
 * whether the release is delivered as an encrypted bundle.
 */
export function buyerProtection(p: EnvironmentProtection, escrowed: boolean): { label: string; sentence: string } {
  if (p.tier === "none") {
    return { label: "Free only", sentence: "Nothing is sold in this environment. The release is signed, so you can check it was not altered." };
  }
  if (!escrowed) {
    return {
      label: "Licence + signing",
      sentence: "This release is not encrypted. Your server checks its licence, and the signed release shows it was not altered.",
    };
  }
  if (p.tier === "escrow" && p.state === "available") {
    return {
      label: "Code escrow",
      sentence: "Delivered encrypted. The host's compiled loader decrypts it in memory with a key released to your bound server only.",
    };
  }
  if (p.tier === "escrow") {
    return {
      label: "Licence-only fallback",
      sentence:
        "Delivered encrypted. In-memory escrow is planned here; until then the loader writes the decrypted copy to disk on your bound server, which is licence-only protection.",
    };
  }
  return {
    label: "Licence + signing",
    sentence:
      "Delivered encrypted and bound to your server. The host runs plain script, so the loader writes the decrypted copy to disk there: licence-only protection, no code-secrecy claim.",
  };
}

/** Tiers in the order the site lists them: the strongest first, "nothing sold" last. */
export const TIER_ORDER: ProtectionTier[] = ["escrow", "license", "none"];

/** One plain sentence per tier, for the tier tables. The per-environment note says the rest. */
export const tierBlurb: Record<ProtectionTier, string> = {
  escrow:
    "The host runs compiled code outside the script VM, so it can hold a key. An encrypted release is decrypted in memory, for a licensed and bound server only.",
  license:
    "The host runs plain script. Your server checks its licence and the release is signed, but the operator can read what the host loads. We make no code-secrecy claim here.",
  none: "The rights holder allows free packages only, so nothing is sold or licensed. Releases are still signed.",
};

/**
 * The state of a tier in one environment, as a short lead before its note. Read from the registry
 * fields only: the state decides "available" or "planned", and a note that names an opt-in feature
 * is led as one. A free-only environment has nothing to wait for, so it gets no lead.
 */
export function protectionLead(p: EnvironmentProtection): string | null {
  if (p.tier === "none") return null;
  const optIn = /\bopt-in\b/i.test(p.note);
  if (p.state === "available") return optIn ? "Available as an opt-in server feature." : "Available today.";
  return optIn ? "Planned as an opt-in server feature." : "Planned, not available yet.";
}

/** Environments grouped by tier, in TIER_ORDER; inside a tier, available first, then by name. */
export function groupByTier<T extends { name: string; protection: EnvironmentProtection }>(envs: T[]): { tier: ProtectionTier; envs: T[] }[] {
  return TIER_ORDER.map((tier) => ({
    tier,
    envs: envs
      .filter((e) => e.protection.tier === tier)
      .sort((a, b) => Number(a.protection.state === "planned") - Number(b.protection.state === "planned") || a.name.localeCompare(b.name)),
  })).filter((g) => g.envs.length > 0);
}

/** Groups a key fingerprint for reading aloud: "ab12 cd34 ef56 7890". */
export function formatFingerprint(fp: string | null | undefined): string {
  if (!fp) return "—";
  return fp.replace(/(.{4})(?=.)/g, "$1 ");
}
