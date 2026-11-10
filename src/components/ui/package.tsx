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
import { categoryLabel } from "@/components/illustrations";
import { CategoryArt } from "@/components/site/world-art";
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

const AVATAR_COLORS = ["#2f3ce0", "#d6383d", "#7a3cc8", "#2f8f4e", "#c2367a", "#0f8a8a", "#51607f"];

function hashColor(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length]!;
}

export function Avatar({ name, size = 22, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex shrink-0 -skew-x-6 items-center justify-center border-2 border-line font-display font-extrabold text-white", className)}
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
      <span className={cn("sheet inline-block -skew-x-6 border-2 border-line bg-surface px-2.5 py-0.5 font-display text-[14px] font-black text-ok", className)}>
        Free
      </span>
    );
  }
  return (
    <span
      className={cn("sheet tabular inline-block -skew-x-6 whitespace-nowrap border-2 border-line bg-sun px-2.5 py-0.5 font-display text-[14px] font-black text-on-sun", className)}
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
      className={cn("tok", TONE_CLASSES[meta.tone], className)}
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
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {shown.map((e) => (
        <EnvCompatTag key={e.slug} slug={e.slug} status={e.status} />
      ))}
      {rest > 0 ? (
        <span
          className="tok tok-muted"
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
    <article className={cn("panel sticker-hover relative flex flex-col", className)}>
      <div className="relative aspect-[16/10] border-b-[2.5px] border-line bg-paper-2">
        <CategoryArt category={pkg.category} />
        <span className="absolute -left-[7px] top-3 inline-flex -skew-x-12 items-center gap-1.5 bg-[#0b0b1e] px-2.5 pb-[3px] pt-1 font-display text-[12px] font-bold uppercase tracking-[0.1em] text-[#f3ecdc]" style={{ fontStretch: "80%" }}>
          <Icon aria-hidden="true" size={13} strokeWidth={2.5} />
          {categoryLabel(pkg.category)}
        </span>
        {pkg.isDemo ? (
          <span className="absolute right-2 top-2 border-2 border-[#0b0b1e] bg-[#fffdf6] px-1.5 py-0.5 font-display text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#0b0b1e]" style={{ fontStretch: "80%" }}>
            Example
          </span>
        ) : null}
        <PriceCapsule pricing={pkg.pricing} className="absolute -bottom-[13px] -right-[9px] z-[2] !text-[16px]" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 pt-[18px]">
        <div className="min-w-0">
          <h3 className="font-display text-[19px] font-extrabold leading-tight tracking-[-0.015em]">
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
        </div>
      </div>
    </article>
  );
}

/** Dense list row (Explore "List" view). */
export function PackageRow({ pkg }: { pkg: PackageSummary }) {
  const Icon = CATEGORY_ICONS[pkg.category] ?? Package;
  return (
    <li className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 border-b border-line-soft px-3 py-3 last:border-b-0 hover:bg-sun-soft md:grid-cols-[auto_minmax(0,1.6fr)_minmax(0,1.2fr)_auto] md:items-center">
      <span className="inline-flex h-9 w-9 -skew-x-6 items-center justify-center border-2 border-line bg-paper-2">
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
