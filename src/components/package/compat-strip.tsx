import { ExternalLink } from "lucide-react";
import type { CompatibilityEntry } from "@/lib/contract";
import { envLongName } from "@/lib/env";
import { formatDate, formatDateTime } from "@/lib/format";
import { capabilityPlain } from "@/lib/integration";
import { COMPAT_ORDER, compatibilityMeta, metaFor } from "@/lib/status";
import { StatusBadge } from "@/components/ui/badge";
import { KeyValue } from "@/components/ui/data";
import { Popover } from "@/components/ui/popover";

export function sortCompat(entries: CompatibilityEntry[]) {
  return [...entries].sort(
    (a, b) => (COMPAT_ORDER[a.status] ?? 9) - (COMPAT_ORDER[b.status] ?? 9) || a.environment.localeCompare(b.environment),
  );
}

export function EvidencePanel({ entry }: { entry: CompatibilityEntry }) {
  const meta = metaFor(compatibilityMeta, entry.status);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold">{envLongName(entry.environment)}</p>
        <StatusBadge meta={meta} size="sm" />
      </div>
      <p className="text-[13px] text-ink-2">{meta.hint}</p>
      {entry.status === "not_tested" ? (
        <p className="text-[13px] text-ink-2">Declared by the creator for {entry.version}.</p>
      ) : (
        <KeyValue
          labelWidth="6.5rem"
          className="text-[13px]"
          items={[
            { label: "Release", value: <span className="tabular font-mono">{entry.version}</span> },
            {
              label: "Tested",
              value: entry.ranAt ? (
                <time dateTime={entry.ranAt} title={formatDateTime(entry.ranAt)}>
                  {formatDate(entry.ranAt)}
                </time>
              ) : (
                "—"
              ),
            },
            ...(entry.missingCapability
              ? [{ label: "Needs", value: capabilityPlain(entry.missingCapability) }]
              : []),
          ]}
        />
      )}
      {entry.evidence.length > 0 ? (
        <ul className="space-y-1 text-[13px]">
          {entry.evidence.map((ev) => (
            <li key={ev.url}>
              <a href={ev.url} className="inline-flex items-center gap-1 font-semibold text-cobalt-ink underline-offset-2 hover:underline" rel="noopener">
                {ev.kind === "screenshot" ? "Screenshot" : "Full log"}
                <ExternalLink aria-hidden="true" size={12} />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** One tile per declared environment; each opens its details. Scrolls horizontally on mobile. */
export function CompatStrip({ entries }: { entries: CompatibilityEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="border-[2.5px] border-dashed border-line-soft px-4 py-3 text-[14px] text-ink-2">
        No environments declared or tested for this release yet.
      </p>
    );
  }
  return (
    <div className="-mx-4 relative overflow-x-auto px-4 pb-2 md:mx-0 md:pl-0 md:pr-1.5">
      <ul className="flex gap-4 pb-1 md:grid md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
        {sortCompat(entries).map((e) => {
          const meta = metaFor(compatibilityMeta, e.status);
          return (
            <li key={e.environment} className="w-[160px] shrink-0 md:w-auto">
              <Popover
                triggerLabel={`${envLongName(e.environment)}: ${meta.label}. Show details`}
                triggerClassName="sticker-sm sticker-hover flex w-full flex-col items-start gap-2 p-3 text-left"
                trigger={
                  <>
                    <span className="font-display text-[15px] font-extrabold leading-tight">{envLongName(e.environment)}</span>
                    <StatusBadge meta={meta} size="sm" />
                    <span className="tabular truncate text-[12px] text-ink-3">
                      {e.missingCapability ? `Needs ${capabilityPlain(e.missingCapability).toLowerCase()}` : e.ranAt ? `Tested ${formatDate(e.ranAt)}` : "Declared by the creator"}
                    </span>
                  </>
                }
              >
                <EvidencePanel entry={e} />
              </Popover>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
