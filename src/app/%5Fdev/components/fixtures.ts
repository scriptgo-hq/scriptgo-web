/**
 * Fixtures for the dev-only component gallery. Fictional sample data from UX-BRIEF section 11.
 * Never imported by a public page.
 */
import type { PackageSummary } from "@/lib/contract";

const base = {
  resourceName: "x",
  latestVersion: "1.0.0",
  license: "MIT",
  capabilities: ["events", "storage"],
  downloads: 0,
  updatedAt: "2026-11-06T10:00:00.000Z",
  listingStatus: "active" as const,
  visibility: null,
  isDemo: true,
};

export const SAMPLE_PACKAGES: PackageSummary[] = [
  {
    ...base,
    id: "1",
    identifier: "kestrel//inventory-pro",
    creator: { username: "kestrel", displayName: "Kestrel", firstParty: false },
    name: "inventory-pro",
    title: "Inventory Pro",
    summary: "Stacks, weights, persistence and events.",
    category: "inventory",
    environments: [
      { slug: "standalone", status: "verified" },
      { slug: "love2d", status: "verified" },
      { slug: "godot", status: "verified" },
      { slug: "luanti", status: "not_tested" },
    ],
    pricing: { kind: "paid", from: { amount: 600, currency: "EUR" }, interval: "month", checkoutEnabled: false },
  },
  {
    ...base,
    id: "2",
    identifier: "scriptgo//permissions-kit",
    creator: { username: "scriptgo", displayName: "SCRIPT//GO", firstParty: true },
    name: "permissions-kit",
    title: "Permissions Kit",
    summary: "Roles and privileges for every environment.",
    category: "permissions",
    environments: [
      { slug: "standalone", status: "verified" },
      { slug: "luanti", status: "stale" },
    ],
    pricing: { kind: "free" },
  },
  {
    ...base,
    id: "3",
    identifier: "mira//toast-ui",
    creator: { username: "mira", displayName: "Mira", firstParty: false },
    name: "toast-ui",
    title: "Toast UI",
    summary: "Notifications with a log fallback.",
    category: "ui",
    environments: [
      { slug: "standalone", status: "verified" },
      { slug: "luanti", status: "unsupported" },
      { slug: "godot", status: "failing" },
    ],
    pricing: { kind: "free" },
  },
  {
    ...base,
    id: "4",
    identifier: "ferrous//quest-engine",
    creator: { username: "ferrous", displayName: "Ferrous", firstParty: false },
    name: "quest-engine",
    title: "Quest Engine",
    summary: "Flexible quest and event system.",
    category: "quests",
    environments: [{ slug: "standalone", status: "verified" }],
    pricing: { kind: "paid", from: { amount: 1200, currency: "EUR" }, interval: "month", checkoutEnabled: false },
    listingStatus: "restricted",
  },
];
