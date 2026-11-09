import Link from "next/link";
import { EnvironmentArt } from "@/components/illustrations";
import type { Environment } from "@/lib/contract";
import { cn } from "@/lib/cn";
import { environmentMeta, metaFor } from "@/lib/status";
import { StatusBadge } from "./badge";

export function EnvironmentTile({ env, className }: { env: Environment; className?: string }) {
  return (
    <Link
      href={`/environments/${encodeURIComponent(env.slug)}`}
      className={cn("sticker sticker-hover flex flex-col overflow-hidden", className)}
    >
      <div className="aspect-[5/3] overflow-hidden border-b-[2.5px] border-line">
        <EnvironmentArt slug={env.slug} name={env.name} className="h-full w-full" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <p className="font-display text-[16px] font-extrabold leading-tight">{env.name}</p>
        <StatusBadge meta={metaFor(environmentMeta, env.status)} size="sm" className="self-start" />
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
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 border-line bg-surface font-mono text-[11px] font-bold",
        className,
      )}
    >
      {label}
    </span>
  );
}
