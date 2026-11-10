import type { PlatformRules } from "./contract";
import type { StatusMeta } from "./status";

/**
 * The one place that puts an environment's `platformRules` into words (ADR-0037).
 *
 * `platformRules` and `platformRulesNote` report what the platform's own rights holder says about
 * paid scripts. They are information for the operator who runs a script there and answers for it.
 * They are never a SCRIPT//GO permission or prohibition, and they do not affect what can be sold:
 * a script is sold as a SCRIPT//GO script, and the environments it lists are places where it runs.
 * Every page that shows this information goes through `platformRulesInfo`, so the wording stays one.
 */

/** The sentence that frames the note wherever it is shown. */
export const PLATFORM_RULES_LEAD =
  "This platform's own rules, which you answer for when you run a script there. SCRIPT//GO does not enforce them, and they do not change what can be sold.";

const LABELS: Record<PlatformRules, { label: string; tone: StatusMeta["tone"]; icon: StatusMeta["icon"]; fallback: string }> = {
  no_restriction: {
    label: "No platform restriction on paid scripts",
    tone: "neutral",
    icon: "check",
    fallback: "No restriction on paid scripts is known from this platform's rights holder.",
  },
  restricts_paid: {
    label: "Platform restricts paid scripts",
    tone: "info",
    icon: "scale",
    fallback: "This platform's rights holder restricts paid scripts.",
  },
  unsettled: {
    label: "Platform rules on paid scripts unsettled",
    tone: "info",
    icon: "scale",
    fallback: "This platform's rights holder publishes no clear rule on paid scripts, or it depends on the script.",
  },
};

export interface PlatformRulesInfo {
  /** Short label for a badge or a table cell. */
  label: string;
  /** The platform's own rule in one factual sentence (the registry note, or a neutral default). */
  note: string;
  /** Badge meta: the label, a neutral tone, and the note plus the framing sentence as its hint. */
  meta: StatusMeta;
  /** False when there is nothing to report (no known restriction and no note): pages then show nothing. */
  notable: boolean;
}

/** Display label and note for one environment's platform rules. */
export function platformRulesInfo(env: { platformRules: PlatformRules; platformRulesNote?: string | null }): PlatformRulesInfo {
  const l = LABELS[env.platformRules] ?? LABELS.no_restriction;
  const note = env.platformRulesNote?.trim() || l.fallback;
  return {
    label: l.label,
    note,
    meta: { label: l.label, tone: l.tone, icon: l.icon, hint: `${note} ${PLATFORM_RULES_LEAD}` },
    notable: env.platformRules !== "no_restriction",
  };
}
