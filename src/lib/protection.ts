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

/** Groups a key fingerprint for reading aloud: "ab12 cd34 ef56 7890". */
export function formatFingerprint(fp: string | null | undefined): string {
  if (!fp) return "—";
  return fp.replace(/(.{4})(?=.)/g, "$1 ");
}
