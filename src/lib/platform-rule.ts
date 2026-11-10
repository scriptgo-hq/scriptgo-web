import type { StatusMeta } from "./status";

/**
 * What a platform's own rights holder says about paid mods, as a neutral note.
 *
 * SCRIPT//GO does not allow, restrict or forbid a sale by environment: a script is sold as a
 * SCRIPT//GO script and "runs on" environments. A platform may have its own rule about paid mods;
 * that rule is the rights holder's, and whoever runs a script on that platform answers for it.
 *
 * This is the only place that knows how the registry carries that rule today (the `sales` and
 * `salesNote` fields of an environment, which are being renamed). Change the two readers below
 * when the fields change; nothing else on the site reads them.
 */
export interface PlatformRuleSource {
  name: string;
  sales: string;
  salesNote: string;
}

export interface PlatformRule {
  /** Short stamp for tables and headers. Always the same neutral tone: it is a fact, not a verdict. */
  meta: StatusMeta;
  /** One sentence: what the rights holder says, or that the registry records nothing. */
  note: string;
  /** Whether the registry records a rule at all. */
  recorded: boolean;
}

const LABELS: Record<string, string> = {
  allowed: "Paid mods allowed",
  free_only: "Free mods only",
  review: "Own conditions",
};

/** Old wording that spoke for SCRIPT//GO ("free packages only", "reviewed first"): not ours to say. */
function onlyTheRightsHoldersWords(note: string): string {
  const cleaned = note
    .replace(/^(free packages only|paid packages are reviewed first)\s*[:.]\s*/i, "")
    .replace(/\s*[:,]?\s*free packages only\b[^.]*\.?\s*$/i, "")
    .trim();
  if (!cleaned) return "";
  const sentence = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return /[.!?)"]$/.test(sentence) ? sentence : `${sentence}.`;
}

export function platformRule(env: PlatformRuleSource): PlatformRule {
  const said = onlyTheRightsHoldersWords(env.salesNote ?? "");
  const recorded = said !== "" || env.sales !== "allowed";
  const note =
    said ||
    (env.sales === "free_only"
      ? `The rights holder of ${env.name} does not allow paid mods.`
      : env.sales === "review"
        ? `The rights holder of ${env.name} sets its own conditions on paid mods.`
        : `The registry records no rule from a rights holder about paid mods on ${env.name}.`);
  return {
    recorded,
    note,
    meta: {
      label: recorded ? (LABELS[env.sales] ?? "Own conditions") : "No rule recorded",
      tone: recorded ? "neutral" : "muted",
      icon: "scale",
      hint: `${note} This is the platform's own rule: whoever runs a script there answers for following it.`,
    },
  };
}

/** The sentence that frames every platform note. */
export function platformRuleFraming(name: string): string {
  return `Its rights holder’s rule, not ours. Whoever runs a script on ${name} answers for following it.`;
}
