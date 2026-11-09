import Link from "next/link";
import { CircleCheck, CircleMinus, CircleX } from "lucide-react";
import type { RightsDeclaration } from "@/lib/contract";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export function SectionTitle({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <h2 id={id} className={cn("font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3", className)}>
      {children}
    </h2>
  );
}

/** Yes / No with an icon, never colour alone. */
export function YesNo({ value, yes = "Yes", no = "No", goodWhen = true }: { value: boolean; yes?: string; no?: string; goodWhen?: boolean }) {
  const good = value === goodWhen;
  const Icon = value ? CircleCheck : CircleX;
  return (
    <span className={cn("inline-flex items-center gap-1 font-semibold", good ? "text-ok" : "text-bad")}>
      <Icon aria-hidden="true" size={15} strokeWidth={2.25} />
      {value ? yes : no}
    </span>
  );
}

/** Compact rights declaration: ownership, proprietary game target, third-party assets. */
export function RightsSummary({ rights, detailed = false }: { rights: RightsDeclaration | null; detailed?: boolean }) {
  if (!rights) {
    return (
      <p className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-warn">
        <CircleMinus aria-hidden="true" size={15} strokeWidth={2.25} />
        No rights declaration
      </p>
    );
  }
  return (
    <div className="space-y-2 text-[13.5px]">
      <ul className="space-y-1">
        <li className="flex flex-wrap gap-x-2">
          <span className="text-ink-3">Owns the code</span>
          <YesNo value={rights.ownsCode} />
        </li>
        <li className="flex flex-wrap gap-x-2">
          <span className="text-ink-3">Targets a proprietary game</span>
          <YesNo value={rights.targetsProprietaryGame} goodWhen={false} />
        </li>
        <li className="flex flex-wrap gap-x-2">
          <span className="text-ink-3">Third-party assets</span>
          <span className="tabular font-semibold">{rights.thirdPartyAssets.length}</span>
        </li>
        <li className="flex flex-wrap gap-x-2">
          <span className="text-ink-3">Declared</span>
          <span className="tabular">{formatDate(rights.declaredAt)}</span>
        </li>
      </ul>
      {detailed && rights.thirdPartyAssets.length > 0 ? (
        <div className="relative overflow-x-auto rounded-lg border border-line-soft">
          <table className="w-full min-w-[480px] text-left text-[13px]">
            <caption className="sr-only">Third-party assets declared</caption>
            <thead className="bg-surface-2 text-[11.5px] uppercase tracking-wide text-ink-3">
              <tr>
                <th scope="col" className="px-2.5 py-1.5">Path</th>
                <th scope="col" className="px-2.5 py-1.5">Source</th>
                <th scope="col" className="px-2.5 py-1.5">License</th>
              </tr>
            </thead>
            <tbody>
              {rights.thirdPartyAssets.map((a, i) => (
                <tr key={`${a.path}-${i}`} className="border-t border-line-soft">
                  <td className="break-all px-2.5 py-1.5 font-mono">{a.path}</td>
                  {/* Untrusted text: never rendered as a link. */}
                  <td className="break-all px-2.5 py-1.5">{a.source}</td>
                  <td className="px-2.5 py-1.5">{a.license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

/** One tile of the admin overview: the real count, or "unavailable" with the failure code. */
export function CountTile({
  label,
  count,
  failure,
  href,
  hint,
}: {
  label: string;
  count: number | null;
  failure: string | null;
  href: string;
  hint: string;
}) {
  return (
    <Link href={href} className="sticker sticker-hover block p-4">
      <p className="text-[13.5px] font-bold text-ink-2">{label}</p>
      {count !== null ? (
        <p className="tabular display mt-1 text-[40px]">{count}</p>
      ) : (
        <p className="mt-2 text-[15px] font-bold text-bad">
          Unavailable
          <span className="block font-mono text-[12px] font-normal text-ink-3">{failure}</span>
        </p>
      )}
      <p className="mt-1 text-[12.5px] text-ink-3">{hint}</p>
    </Link>
  );
}
