import type { StatusMeta } from "@/lib/status";

/** Admin-only status vocabulary (icon + label + tone), kept beside the admin pages. */

export const paymentEventMeta: Record<"processed" | "deferred" | "ignored" | "failed", StatusMeta> = {
  processed: { label: "Processed", tone: "success", icon: "check", hint: "Applied to licenses and subscriptions." },
  deferred: { label: "Deferred", tone: "warning", icon: "clock", hint: "Waiting for an earlier event; it will be retried." },
  ignored: { label: "Ignored", tone: "neutral", icon: "minus", hint: "Duplicate or irrelevant event; nothing changed." },
  failed: { label: "Failed", tone: "danger", icon: "x", hint: "Processing failed; see the error." },
};

export const reviewStatusMeta: Record<"open" | "approved" | "restricted", StatusMeta> = {
  open: { label: "Open", tone: "warning", icon: "hourglass", hint: "Opened before ADR-0037. Nothing is queued for review any more." },
  approved: { label: "Closed", tone: "success", icon: "check", hint: "Closed with no restriction." },
  restricted: { label: "Restricted", tone: "danger", icon: "shield", hint: "Reviewed and restricted." },
};

export const appealMeta: Record<"open" | "upheld" | "reversed", StatusMeta> = {
  open: { label: "Appeal open", tone: "info", icon: "send", hint: "Waiting for a reviewer who did not take the original decision." },
  upheld: { label: "Upheld", tone: "neutral", icon: "scale", hint: "The original decision stands." },
  reversed: { label: "Reversed", tone: "success", icon: "undo", hint: "The original decision was reversed." },
};

export const signatureMeta: Record<"valid" | "invalid", StatusMeta> = {
  valid: { label: "Signature valid", tone: "success", icon: "shield", hint: "The provider signature matched." },
  invalid: { label: "Signature invalid", tone: "danger", icon: "ban", hint: "Rejected: the signature did not match." },
};

export const MODERATION_ACTIONS = {
  no_action: {
    label: "No action",
    effect: "The listing stays as it is. The reporter and the creator are told no restriction was applied.",
  },
  restrict_release: {
    label: "Restrict the release",
    effect: "The reported release is no longer downloadable or installable. Other releases are unaffected.",
  },
  restrict_sales: {
    label: "Restrict sales",
    effect: "Checkout is turned off for every offer of the package. Existing licenses keep working.",
  },
  suspend_listing: {
    label: "Suspend the listing",
    effect: "The package is hidden from the public, downloads and checkout stop. Existing licenses keep working.",
  },
  suspend_store: {
    label: "Suspend the seller's store",
    effect: "Nothing can be bought from this seller, on any of their packages, until the suspension is lifted. Existing licenses keep working.",
  },
} as const;

/** Decisions on one offer (taken on the Offers page, not on a report): shown in notices and case history. */
const OFFER_ACTION_LABELS: Record<string, string> = { hold_offer: "Offer put on hold", reject_offer: "Offer withdrawn" };

export type ModerationActionKey = keyof typeof MODERATION_ACTIONS;

export function moderationActionLabel(action: string | null | undefined): string {
  if (!action) return "—";
  return (MODERATION_ACTIONS as Record<string, { label: string }>)[action]?.label ?? OFFER_ACTION_LABELS[action] ?? action.replace(/_/g, " ");
}

export const ACTOR_LABELS: Record<string, string> = { user: "User", admin: "Staff", system: "System", provider: "Provider" };

/** "kestrel//inventory-pro" → public package page, or null when the identifier is malformed. */
export function packagePath(identifier: string | null | undefined): string | null {
  if (!identifier) return null;
  const [creator, name] = identifier.split("//");
  if (!creator || !name) return null;
  return `/packages/${encodeURIComponent(creator)}/${encodeURIComponent(name.split("@")[0]!)}`;
}
