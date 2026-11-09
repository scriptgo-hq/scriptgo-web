import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Manifest-style key/value list: mono labels, compact values. */
export function KeyValue({
  items,
  className,
  labelWidth = "8.5rem",
}: {
  items: { label: string; value: React.ReactNode }[];
  className?: string;
  labelWidth?: string;
}) {
  return (
    <dl
      className={cn("grid gap-x-4 gap-y-2 text-[14px]", className)}
      style={{ gridTemplateColumns: `minmax(0, ${labelWidth}) minmax(0, 1fr)` }}
    >
      {items.map((it) => (
        <div key={it.label} className="contents">
          <dt className="pt-[2px] font-mono text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">{it.label}</dt>
          <dd className="min-w-0 break-words">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Deployments meter: "3 of 5 in use". */
export function Meter({ used, allowed, label = "in use", className }: { used: number; allowed: number; label?: string; className?: string }) {
  const pct = allowed > 0 ? Math.min(100, Math.round((used / allowed) * 100)) : 0;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={allowed}
        aria-valuenow={used}
        aria-label={`Deployments: ${used} of ${allowed} ${label}`}
        className="h-3 w-40 max-w-full overflow-hidden rounded-full border-2 border-line bg-surface-2"
      >
        <div className="h-full bg-cobalt" style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular text-[14px] font-semibold">
        {used} of {allowed} {label}
      </span>
    </div>
  );
}

/** `Explore // kestrel // inventory-pro` */
export function Breadcrumb({ items, className }: { items: { label: string; href?: string }[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("font-mono text-[12.5px] text-ink-3", className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5">
        {items.map((it, i) => (
          <li key={`${it.label}-${i}`} className="flex items-center gap-x-1.5">
            {i > 0 ? (
              <span aria-hidden="true" className="text-cobalt-ink">
                {"//"}
              </span>
            ) : null}
            {it.href && i < items.length - 1 ? (
              <Link href={it.href} className="hover:text-ink hover:underline">
                {it.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined} className="text-ink-2">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function pageWindow(page: number, pages: number): (number | "gap")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const out: (number | "gap")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);
  if (start > 2) out.push("gap");
  for (let p = start; p <= end; p++) out.push(p);
  if (end < pages - 1) out.push("gap");
  out.push(pages);
  return out;
}

/** Numbered pagination as plain links (works without JavaScript). */
export function Pagination({
  page,
  total,
  pageSize,
  hrefFor,
  className,
}: {
  page: number;
  total: number;
  pageSize: number;
  hrefFor: (page: number) => string;
  className?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const arrow = "inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-2";
  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1", className)}>
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={arrow} aria-label="Previous page" rel="prev">
          <ChevronLeft aria-hidden="true" size={18} strokeWidth={2.5} />
        </Link>
      ) : (
        <span className={cn(arrow, "opacity-35")} aria-hidden="true">
          <ChevronLeft size={18} strokeWidth={2.5} />
        </span>
      )}
      {pageWindow(page, pages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-ink-3">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Page ${p}`}
            className={cn(
              "tabular inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-[14px] font-bold",
              p === page ? "bg-ink text-paper" : "hover:bg-surface-2",
            )}
          >
            {p}
          </Link>
        ),
      )}
      {page < pages ? (
        <Link href={hrefFor(page + 1)} className={arrow} aria-label="Next page" rel="next">
          <ChevronRight aria-hidden="true" size={18} strokeWidth={2.5} />
        </Link>
      ) : (
        <span className={cn(arrow, "opacity-35")} aria-hidden="true">
          <ChevronRight size={18} strokeWidth={2.5} />
        </span>
      )}
    </nav>
  );
}

/** Relative time with the absolute time on hover. */
export function Time({ iso, relative, absolute }: { iso: string | null | undefined; relative: string; absolute: string }) {
  if (!iso) return <span>{relative}</span>;
  return (
    <time dateTime={iso} title={absolute} className="tabular">
      {relative}
    </time>
  );
}
