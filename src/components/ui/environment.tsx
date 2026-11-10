import Link from "next/link";
import { Plus } from "lucide-react";
import { EnvironmentCardArt } from "@/components/site/world-art";
import type { Environment } from "@/lib/contract";
import { cn } from "@/lib/cn";
import { platformRulesInfo } from "@/lib/platform-rules";
import { environmentMeta, metaFor } from "@/lib/status";
import { StatusBadge } from "./badge";
import { AdapterStateBadge } from "./integration";

export function EnvironmentTile({ env, className }: { env: Environment; className?: string }) {
  return (
    <Link
      href={`/environments/${encodeURIComponent(env.slug)}`}
      className={cn("sticker sticker-hover flex flex-col", className)}
    >
      <div className="aspect-[5/3] overflow-hidden border-b-[2.5px] border-line bg-paper-2">
        <EnvironmentCardArt slug={env.slug} name={env.name} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <p className="font-display text-[16px] font-extrabold leading-tight">{env.name}</p>
        <div className="flex flex-wrap gap-x-1.5 gap-y-2 pt-0.5">
          <StatusBadge meta={metaFor(environmentMeta, env.status)} size="sm" />
          {platformRulesInfo(env).notable ? <StatusBadge meta={platformRulesInfo(env).meta} size="sm" /> : null}
          {env.status === "planned" ? <AdapterStateBadge state={env.adapterState} blockedOn={env.blockedOn} /> : null}
        </div>
      </div>
    </Link>
  );
}

/** An open slot in a directory grid: the way in for a platform that is not listed yet. */
export function EnvironmentSlotTile({
  href,
  title,
  body,
  className,
}: {
  href: string;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "sheet group flex flex-col overflow-hidden border-[2.5px] border-dashed border-line bg-paper-2 text-ink transition-colors hover:bg-sun hover:text-on-sun focus-visible:bg-sun",
        className,
      )}
    >
      <div className="flex aspect-[5/3] items-center justify-center border-b-[2.5px] border-dashed border-line">
        <span className="inline-flex h-14 w-14 -skew-x-12 items-center justify-center border-[2.5px] border-line bg-surface text-ink shadow-[4px_4px_0_0_var(--line)] transition-transform group-hover:scale-105">
          <Plus aria-hidden="true" size={28} strokeWidth={2.75} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <p className="font-display text-[16px] font-extrabold leading-tight">{title}</p>
        <p className="text-[12.5px] leading-snug">{body}</p>
      </div>
    </Link>
  );
}

/** Small monogram tile (tables, matrices). */
export function EnvMonogramTile({ label, className }: { label: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "tok h-7 min-w-8 shrink-0 justify-center !px-1.5",
        className,
      )}
    >
      {label}
    </span>
  );
}
