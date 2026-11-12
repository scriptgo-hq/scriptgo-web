import { StatusBadge } from "@/components/ui/badge";
import type { PackageVersion, ParsedManifest, Release } from "@/lib/contract";
import { protectionRows } from "@/lib/release-protection";

/**
 * What this release protects, one row per part (server scripts, client scripts, assets), in plain
 * words. Shared by the package page and the creator's release page. The detail is in the docs.
 */
export function ReleaseProtects({
  version,
  manifest,
}: {
  version: Pick<PackageVersion | Release, "escrow" | "assets"> & { protection?: PackageVersion["protection"] };
  manifest: ParsedManifest | null;
}) {
  const rows = protectionRows(version, manifest);
  if (rows.length === 0) return null;
  return (
    <ul className="divide-y divide-line-soft border-2 border-line bg-surface" data-release-protects>
      {rows.map((r) => (
        <li
          key={r.id}
          className="grid grid-cols-1 gap-x-4 gap-y-1 px-3 py-2.5 sm:grid-cols-[9rem_minmax(0,1fr)]"
          data-protects={r.id}
          data-encrypted={r.encrypted ? "yes" : "no"}
          {...(r.id === "assets" ? { "data-assets-protection": "" } : {})}
        >
          <div className="flex flex-wrap items-center gap-2 sm:block">
            <p className="text-[14px] font-semibold">{r.label}</p>
            <span className="sm:mt-1 sm:block">
              <StatusBadge meta={r.meta} size="sm" />
            </span>
          </div>
          <p className="text-[14px] text-ink-2">{r.sentence}</p>
        </li>
      ))}
    </ul>
  );
}
