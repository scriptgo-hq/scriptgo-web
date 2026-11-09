/**
 * HTTP contract types for the web app. The source of truth is @scriptgo/shared (zod schemas
 * generated from docs/spec/api.md); this module only re-exports the inferred types and adds a
 * few web-side conveniences. Type-only imports keep zod out of client bundles.
 */
export type {
  ActivationStatus,
  CapabilitySupport,
  CaseStatus,
  Category,
  CheckStage,
  CheckStatus,
  Classification,
  CompatibilityStatus,
  EnvironmentStatus,
  LicenseStatus,
  ListingStatus,
  OfferInterval,
  Provider,
  ReleaseStatus,
  Role,
  StoreStatus,
  Visibility,
  AppealStatus,
  HistorySource,
  ModerationActionKind,
  VerifyFailureReason,
  Money,
  Page,
  ErrorBody,
  Environment,
  EnvironmentDetail,
  PackageSummary,
  PackageDetail,
  PackageVersion,
  CompatibilityEntry,
  Offer,
  RightsDeclaration,
  ThirdPartyAsset,
  CreatorProfile,
  CreatorRef,
  Pricing,
  Stats,
  Release,
  ReleaseCheck,
  CreatorPackageDetail,
  ParsedManifestShape as ParsedManifest,
  Me,
  CreatedToken,
  TokenSummary,
  LicenseSummary,
  LicenseDetail,
  Activation,
  LicenseHistoryEntry,
  AddDeploymentResult,
  CheckoutCreated,
  CheckoutState,
  VerifyResult,
  Notice,
  Series,
  Analytics,
  Store,
  CustomerRow,
  AuditEntry,
  CaseSummary,
  CaseDetail,
  ModerationDecision,
  ReviewOffer,
  ReviewRelease,
  PaymentEventRow,
  OperationalError,
} from "@scriptgo/shared";

import type { Category } from "@scriptgo/shared";

export interface Health {
  ok: boolean;
  version: string;
  /** The platform delivers e-mail (SMTP configured on the server). */
  mail: boolean;
}

export interface ReportReceipt {
  caseId: string;
  status: "received";
}

export const CATEGORIES: Category[] = [
  "inventory",
  "permissions",
  "economy",
  "events",
  "ui",
  "admin",
  "framework",
  "vehicles",
  "housing",
  "quests",
  "library",
  "other",
];

/** Capabilities from docs/spec/runtime.md (the environment matrix may list more). */
export const CAPABILITIES = [
  "events",
  "logging",
  "storage",
  "players",
  "permissions",
  "commands",
  "config",
  "ui",
  "http",
  "licensing",
] as const;
