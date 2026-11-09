import Link from "next/link";
import {
  BadgeCheck,
  Blocks,
  Box,
  Car,
  Coins,
  House,
  KeyRound,
  LibraryBig,
  MonitorSmartphone,
  Package,
  Radio,
  ScrollText,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";
import { CategoryCover, categoryLabel } from "@/components/illustrations";
import type { Category, CompatibilityStatus, PackageSummary, Pricing } from "@/lib/contract";
import { cn } from "@/lib/cn";
import { envName } from "@/lib/env";
import { formatCount, formatDate, formatMoney, intervalSuffix, monogram, relativeTime } from "@/lib/format";
import { COMPAT_ORDER, compatibilityMeta, listingMeta, metaFor } from "@/lib/status";
import { StatusBadge, TONE_CLASSES } from "./badge";
import { StatusIcon } from "./icon";
import { Identifier } from "./typography";

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  inventory: Box,
  permissions: KeyRound,
  economy: Coins,
  events: Radio,
  quests: ScrollText,
  ui: MonitorSmartphone,
  admin: SquareTerminal,
  framework: Blocks,
  vehicles: Car,
  housing: House,
  library: LibraryBig,
  other: Package,
};

export function packageHref(p: { creator: { username: string }; name: string }): string {
  return `/packages/${encodeURIComponent(p.creator.username)}/${encodeURIComponent(p.name)}`;
}

const AVATAR_COLORS = ["#2f3ce0", "#e0582f", "#7b3fe4", "#17703a", "#c2367a", "#0f7c8c", "#8a5a00"];

function hashColor(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length]!;
}

export function Avatar({ name, size = 22, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full border-2 border-line font-bold text-white", className)}
      style={{ width: size, height: size, background: hashColor(name), fontSize: Math.max(9, size * 0.42) }}
    >
      {monogram(name)}
    </span>
  );
}

/** Creator chip: avatar + "by Name", with a first-party marker for `scriptgo//`. */
export function CreatorLine({
  creator,
  link = true,
  className,
}: {
  creator: { username: string; displayName: string; firstParty: boolean };
  link?: boolean;
  className?: string;
}) {
  const inner = (
    <>
      <Avatar name={creator.displayName || creator.username} />
      <span className="truncate">
        <span className="text-ink-3">by </span>
        {creator.displayName || creator.username}
      </span>
      {creator.firstParty ? (
        <span title="First-party package published by SCRIPT//GO" className="inline-flex items-center text-cobalt-ink">
          <BadgeCheck aria-hidden="true" size={14} strokeWidth={2.5} />
          <span className="sr-only">(first party)</span>
        </span>
      ) : null}
    </>
  );
  const cls = cn("relative z-[2] inline-flex min-w-0 items-center gap-1.5 text-[13px] font-semibold", className);
  return link ? (
    <Link href={`/creators/${encodeURIComponent(creator.username)}`} className={cn(cls, "hover:underline")}>
      {inner}
    </Link>
  ) : (
    <span className={cls}>{inner}</span>
  );
}

/** Price capsule from the provider's offer data ("Free", "from €6/mo"). */
export function PriceCapsule({ pricing, className }: { pricing: Pricing; className?: string }) {
  if (pricing.kind === "free") {
    return (
      <span className={cn("rounded-md border-2 border-ok/50 bg-ok-soft px-2 py-0.5 text-[12.5px] font-extrabold text-ok", className)}>
        Free
      </span>
    );
  }
  return (
    <span
      className={cn("tabular whitespace-nowrap rounded-md border-2 border-line bg-surface px-2 py-0.5 text-[12.5px] font-extrabold", className)}
      title={pricing.checkoutEnabled ? "Lowest paid plan" : "Lowest paid plan. Checkout is not available yet."}
    >
      <span className="sr-only">From </span>
      {formatMoney(pricing.from)}
      {intervalSuffix(pricing.interval)}
    </span>
  );
}

/** Environment capsule with its compatibility status icon (never colour alone). */
export function EnvCompatTag({ slug, status, className }: { slug: string; status: CompatibilityStatus; className?: string }) {
  const meta = metaFor(compatibilityMeta, status);
  return (
    <span
      title={`${envName(slug)}: ${meta.label}`}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-1.5 py-[3px] text-[11.5px] font-semibold leading-none",
        TONE_CLASSES[meta.tone],
        className,
      )}
    >
      <StatusIcon name={meta.icon} size={11} />
      {envName(slug)}
      <span className="sr-only">: {meta.label}</span>
    </span>
  );
}

function sortedEnvs(envs: PackageSummary["environments"]) {
  return [...envs].sort((a, b) => (COMPAT_ORDER[a.status] ?? 9) - (COMPAT_ORDER[b.status] ?? 9) || a.slug.localeCompare(b.slug));
}

export function EnvCompatTags({ envs, max = 3, className }: { envs: PackageSummary["environments"]; max?: number; className?: string }) {
  const sorted = sortedEnvs(envs);
  const shown = sorted.slice(0, max);
  const rest = sorted.length - shown.length;
  if (sorted.length === 0) {
    return <span className="text-[12px] text-ink-3">No environments declared</span>;
  }
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {shown.map((e) => (
        <EnvCompatTag key={e.slug} slug={e.slug} status={e.status} />
      ))}
      {rest > 0 ? (
        <span
          className="inline-flex items-center rounded-full border border-line-soft px-1.5 py-[3px] text-[11.5px] font-semibold leading-none text-ink-2"
          title={sorted
            .slice(max)
            .map((e) => `${envName(e.slug)}: ${metaFor(compatibilityMeta, e.status).label}`)
            .join(", ")}
        >
          +{rest}
          <span className="sr-only"> more environments</span>
        </span>
      ) : null}
    </div>
  );
}

/** Cover card (Explore "Covers" view, featured scripts). The whole card is one link target. */
export function PackageCard({ pkg, className, showSummary = false }: { pkg: PackageSummary; className?: string; showSummary?: boolean }) {
  const Icon = CATEGORY_ICONS[pkg.category] ?? Package;
  const restricted = pkg.listingStatus !== "active";
  return (
    <article className={cn("sticker sticker-hover relative flex flex-col overflow-hidden", className)}>
      <div className="relative aspect-[2/1] overflow-hidden border-b-[2.5px] border-line bg-surface-2">
        <CategoryCover category={pkg.category} className="h-full w-full" />
        <span
          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md border-2 border-line bg-surface text-ink"
          title={categoryLabel(pkg.category)}
        >
          <Icon aria-hidden="true" size={15} strokeWidth={2.25} />
          <span className="sr-only">{categoryLabel(pkg.category)}</span>
        </span>
        {pkg.isDemo ? (
          <span className="absolute left-2 top-2 rounded-md border-2 border-line bg-sun px-1.5 py-0.5 font-mono text-[10.5px] font-bold uppercase text-on-sun">
            Example
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="min-w-0">
          <h3 className="font-display text-[17px] font-extrabold leading-tight tracking-[-0.01em]">
            <Link href={packageHref(pkg)} className="after:absolute after:inset-0 after:z-[1] focus-visible:outline-none">
              {pkg.title}
            </Link>
          </h3>
          <p className="truncate text-[11.5px] text-ink-3">
            <Identifier value={pkg.identifier} />
          </p>
          {showSummary ? <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink-2">{pkg.summary}</p> : null}
        </div>
        <EnvCompatTags envs={pkg.environments} />
        {restricted ? <StatusBadge meta={metaFor(listingMeta, pkg.listingStatus)} size="sm" className="self-start" /> : null}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <CreatorLine creator={pkg.creator} />
          <PriceCapsule pricing={pkg.pricing} className="relative z-[2]" />
        </div>
      </div>
    </article>
  );
}

/** Dense list row (Explore "List" view). */
export function PackageRow({ pkg }: { pkg: PackageSummary }) {
  const Icon = CATEGORY_ICONS[pkg.category] ?? Package;
  return (
    <li className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 border-b border-line-soft px-3 py-3 last:border-b-0 hover:bg-surface-2 md:grid-cols-[auto_minmax(0,1.6fr)_minmax(0,1.2fr)_auto] md:items-center">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 border-line bg-surface">
        <Icon aria-hidden="true" size={17} strokeWidth={2.25} />
      </span>
      <div className="min-w-0">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <Link href={packageHref(pkg)} className="font-display text-[16px] font-extrabold after:absolute after:inset-0">
            {pkg.title}
          </Link>
          <span className="truncate text-[12px] text-ink-3">
            <Identifier value={pkg.identifier} />
          </span>
        </p>
        <p className="truncate text-[13.5px] text-ink-2">{pkg.summary}</p>
      </div>
      <div className="col-span-2 md:col-span-1">
        <EnvCompatTags envs={pkg.environments} max={4} />
      </div>
      <div className="col-span-2 flex items-center justify-between gap-3 md:col-span-1 md:flex-col md:items-end md:gap-1">
        <PriceCapsule pricing={pkg.pricing} />
        <span className="tabular text-[12px] text-ink-3">
          {pkg.latestVersion ? `v${pkg.latestVersion} · ` : ""}
          <span title={formatDate(pkg.updatedAt)}>updated {relativeTime(pkg.updatedAt)}</span>
          {" · "}
          {formatCount(pkg.downloads)} downloads
        </span>
      </div>
    </li>
  );
}
