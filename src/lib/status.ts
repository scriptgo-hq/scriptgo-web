import type {
  ActivationStatus,
  CapabilitySupport,
  CaseStatus,
  CheckStatus,
  Classification,
  CompatibilityStatus,
  EnvironmentStatus,
  LicenseStatus,
  ListingStatus,
  ReleaseStatus,
  StoreStatus,
  Visibility,
} from "./contract";

/**
 * The status vocabulary from UX-BRIEF section 6. Every status renders as icon + label + tone;
 * colour is never the only signal.
 */
export type Tone = "success" | "danger" | "warning" | "neutral" | "info" | "muted" | "accent";

export type IconName =
  | "check"
  | "x"
  | "alert"
  | "dashed"
  | "minus"
  | "clock"
  | "ban"
  | "flask"
  | "hourglass"
  | "loader"
  | "lock"
  | "rocket"
  | "calendar"
  | "eye-off"
  | "pause"
  | "dot"
  | "shield"
  | "undo"
  | "archive"
  | "scale"
  | "send";

export interface StatusMeta {
  label: string;
  tone: Tone;
  icon: IconName;
  /** One-line explanation for tooltips and popovers. */
  hint: string;
}

const unknown = (value: string): StatusMeta => ({
  label: value.replace(/_/g, " "),
  tone: "neutral",
  icon: "dot",
  hint: "Status reported by the API.",
});

export const compatibilityMeta: Record<CompatibilityStatus, StatusMeta> = {
  verified: { label: "Verified", tone: "success", icon: "check", hint: "Passed in the real runtime (scriptgo verify)." },
  failing: { label: "Failing", tone: "danger", icon: "x", hint: "The last run failed." },
  stale: { label: "Stale", tone: "warning", icon: "clock", hint: "Verified on an older runtime or adapter than current." },
  not_tested: { label: "Not tested", tone: "neutral", icon: "dashed", hint: "Declared by the creator, no run yet." },
  unsupported: { label: "Unsupported", tone: "muted", icon: "minus", hint: "Needs a capability this environment lacks." },
};

export const environmentMeta: Record<EnvironmentStatus, StatusMeta> = {
  available: { label: "Available", tone: "success", icon: "check", hint: "Adapter stable, conformance suite passing." },
  beta: { label: "Beta", tone: "info", icon: "flask", hint: "Adapter usable, conformance partial." },
  experimental: {
    label: "Experimental",
    tone: "warning",
    icon: "flask",
    hint: "Integration tests or review still pending. Expect changes.",
  },
  planned: { label: "Planned", tone: "muted", icon: "calendar", hint: "Not usable yet. No install instructions." },
};

// An environment's own rules on paid scripts are worded in one place: lib/platform-rules.ts.
/** Announced and being built, not usable yet. The one stamp for everything in that state. */
export const IN_DEVELOPMENT: StatusMeta = {
  label: "In development",
  tone: "warning",
  icon: "hourglass",
  hint: "Being built. Not usable yet.",
};

export const capabilityMeta: Record<CapabilitySupport, StatusMeta> = {
  supported: { label: "Supported", tone: "success", icon: "check", hint: "Fully provided by the adapter." },
  partial: { label: "Partial", tone: "warning", icon: "alert", hint: "Provided with limitations." },
  fallback: { label: "Fallback", tone: "info", icon: "undo", hint: "Degrades to a simpler behaviour (for example, log output)." },
  unavailable: { label: "Not available", tone: "muted", icon: "minus", hint: "This environment does not provide it." },
};

export const releaseMeta: Record<ReleaseStatus, StatusMeta> = {
  draft: { label: "Draft", tone: "neutral", icon: "dashed", hint: "Not submitted for validation." },
  validating: { label: "Validating", tone: "info", icon: "loader", hint: "Checks are running." },
  validation_failed: { label: "Validation failed", tone: "danger", icon: "x", hint: "A required check failed." },
  ready: { label: "Checks passed", tone: "accent", icon: "rocket", hint: "Required checks passed; publish once rights are declared." },
  published: { label: "Published", tone: "success", icon: "check", hint: "Immutable and listed." },
  deprecated: { label: "Deprecated", tone: "warning", icon: "archive", hint: "Still downloadable; a newer release is recommended." },
  yanked: { label: "Yanked", tone: "danger", icon: "ban", hint: "Withdrawn by the creator. Not installable." },
};

export const visibilityMeta: Record<Visibility, StatusMeta> = {
  private: { label: "Private", tone: "neutral", icon: "lock", hint: "Only you can see it." },
  unlisted: { label: "Unlisted", tone: "neutral", icon: "eye-off", hint: "Reachable by link, not listed." },
  public: { label: "Public", tone: "success", icon: "check", hint: "Listed in Explore." },
};

export const listingMeta: Record<ListingStatus, StatusMeta> = {
  active: { label: "Active", tone: "success", icon: "check", hint: "Listed normally." },
  restricted: {
    label: "Restricted",
    tone: "warning",
    icon: "shield",
    hint: "Visible with a notice. Not downloadable or purchasable.",
  },
  suspended: { label: "Suspended", tone: "danger", icon: "ban", hint: "Hidden from the public." },
};

export const classificationMeta: Record<Classification, StatusMeta> = {
  free: { label: "Free", tone: "success", icon: "check", hint: "No payment. Install only." },
  software_license: {
    label: "Software license",
    tone: "info",
    icon: "scale",
    hint: "A license to software the seller declares as their own, independent work. SCRIPT//GO does not review offers before sale.",
  },
  seller_declared: {
    label: "Sold on the seller's declaration",
    tone: "info",
    icon: "scale",
    hint: "The seller declares that they own this code and that it targets a third-party game platform. SCRIPT//GO does not review offers before sale; it acts on reports.",
  },
  authorized_app_feature: {
    label: "Authorized app feature",
    tone: "info",
    icon: "shield",
    hint: "Paid features in an application whose operator holds the commercial rights.",
  },
  undeclared: {
    label: "Rights not declared",
    tone: "warning",
    icon: "hourglass",
    hint: "No purchase path yet: the seller has not declared their rights for a published release. It is the seller's step; no reviewer is involved.",
  },
  on_hold: {
    label: "On hold",
    tone: "warning",
    icon: "shield",
    hint: "Put on hold by SCRIPT//GO staff after a report. No purchase path; the seller was notified and can appeal.",
  },
  rejected: { label: "Withdrawn by staff", tone: "danger", icon: "ban", hint: "Withdrawn by a moderation decision after a report. The seller was notified and can appeal." },
};

export const licenseMeta: Record<LicenseStatus, StatusMeta> = {
  active: { label: "Active", tone: "success", icon: "check", hint: "In good standing." },
  grace: { label: "Grace period", tone: "warning", icon: "clock", hint: "Payment failed. Active until the date shown." },
  cancelled_active: {
    label: "Cancelled",
    tone: "warning",
    icon: "pause",
    hint: "Cancelled at the provider. Active until the end of the paid period.",
  },
  expired: { label: "Expired", tone: "muted", icon: "minus", hint: "No longer valid." },
  revoked: { label: "Revoked", tone: "danger", icon: "ban", hint: "Revoked: by SCRIPT//GO, or by the creator who granted it." },
  refunded: { label: "Refunded", tone: "muted", icon: "undo", hint: "Payment refunded; license ended." },
};

export const activationMeta: Record<ActivationStatus, StatusMeta> = {
  pending: { label: "Waiting for first check", tone: "neutral", icon: "hourglass", hint: "The deployment has not called verify yet." },
  active: { label: "Active", tone: "success", icon: "check", hint: "Verified recently." },
  offline_grace: { label: "Offline grace", tone: "warning", icon: "clock", hint: "Running on its last signed token." },
  deactivated: { label: "Deactivated", tone: "muted", icon: "minus", hint: "Removed from the license." },
  blocked: { label: "Blocked", tone: "danger", icon: "ban", hint: "License revoked or expired." },
};

export const storeMeta: Record<StoreStatus, StatusMeta> = {
  not_connected: { label: "Not connected", tone: "muted", icon: "dashed", hint: "No provider connection yet." },
  sandbox: { label: "Sandbox", tone: "info", icon: "flask", hint: "Test events only. No real payments." },
  checkout_off: {
    label: "Connected, checkout off",
    tone: "warning",
    icon: "lock",
    hint: "The shop is set up. Real checkout is not live yet, for any shop, until Tebex approves it in writing.",
  },
  live: { label: "Live", tone: "success", icon: "check", hint: "Taking real payments." },
  needs_attention: { label: "Needs attention", tone: "danger", icon: "alert", hint: "Webhook deliveries are failing." },
  suspended: { label: "Suspended", tone: "danger", icon: "ban", hint: "Suspended by SCRIPT//GO staff after a report. Nothing can be bought through it; the seller can appeal." },
};

export const caseMeta: Record<CaseStatus, StatusMeta> = {
  received: { label: "Received", tone: "neutral", icon: "dot", hint: "Acknowledged, not yet assigned." },
  under_review: { label: "Under review", tone: "info", icon: "hourglass", hint: "A moderator is reviewing the case." },
  action_taken: { label: "Action taken", tone: "warning", icon: "shield", hint: "A restriction was applied." },
  no_action: { label: "No action", tone: "neutral", icon: "minus", hint: "Reviewed; no restriction applied." },
  escalated: { label: "Escalated to legal", tone: "danger", icon: "scale", hint: "Sent for legal review." },
  appeal_open: { label: "Appeal open", tone: "info", icon: "send", hint: "The creator appealed the decision." },
  closed: { label: "Closed", tone: "muted", icon: "archive", hint: "No further action expected." },
};

export const checkMeta: Record<CheckStatus, StatusMeta> = {
  pending: { label: "Pending", tone: "neutral", icon: "dashed", hint: "Queued." },
  running: { label: "Running", tone: "info", icon: "loader", hint: "In progress." },
  passed: { label: "Passed", tone: "success", icon: "check", hint: "Check passed." },
  failed: { label: "Failed", tone: "danger", icon: "x", hint: "Check failed." },
  skipped: { label: "Skipped", tone: "muted", icon: "minus", hint: "Not applicable to this release." },
};

export function metaFor<K extends string>(table: Record<K, StatusMeta>, value: string | null | undefined): StatusMeta {
  if (!value) return unknown("unknown");
  return (table as Record<string, StatusMeta>)[value] ?? unknown(value);
}

/** Directory order from the brief: by status, then alphabetically. */
export const ENV_STATUS_ORDER: Record<string, number> = { available: 0, beta: 1, experimental: 2, planned: 3 };
export const COMPAT_ORDER: Record<string, number> = { verified: 0, stale: 1, failing: 2, not_tested: 3, unsupported: 4 };
