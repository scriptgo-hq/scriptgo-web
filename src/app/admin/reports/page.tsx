import Link from "next/link";
import { Scale } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { AutoSubmitSelect } from "@/components/site/auto-submit";
import { StatusBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { Identifier } from "@/components/ui/typography";
import { api, asList, qs } from "@/lib/api";
import type { CaseStatus, CaseSummary } from "@/lib/contract";
import { formatDateTime, relativeTime } from "@/lib/format";
import { caseMeta, metaFor } from "@/lib/status";

export const metadata = { title: "Reports" };

const STATUSES = Object.keys(caseMeta) as CaseStatus[];
const ROLE_LABELS: Record<string, string> = { rights_holder: "Rights holder", authorized_agent: "Authorized agent", user: "User" };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ status?: string | string[] }> }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const status = raw && (STATUSES as string[]).includes(raw) ? raw : undefined;
  const res = await api<CaseSummary[] | { items: CaseSummary[] }>(`/v1/admin/reports${qs({ status })}`, { auth: true });
  const cases = res.ok ? asList(res.data) : [];

  return (
    <>
      <PageHeader eyebrow="trust & safety" title="Reports." description="Open cases first, oldest first. Each case keeps the listing as it was when the report arrived." />

      <form method="get" className="mb-5 flex flex-wrap items-end gap-3" role="search" aria-label="Filter reports">
        <div>
          <label htmlFor="status" className="block text-[13px] font-bold">
            Status
          </label>
          <AutoSubmitSelect id="status" name="status" defaultValue={status ?? ""} className="mt-1">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {caseMeta[s].label}
              </option>
            ))}
          </AutoSubmitSelect>
        </div>
        <button type="submit" className={buttonClass("secondary", "md")}>
          Apply
        </button>
        {status ? (
          <Link href="/admin/reports" className="text-[14px] font-semibold text-cobalt-ink hover:underline">
            Clear filter
          </Link>
        ) : null}
      </form>

      {!res.ok ? (
        <ApiError failure={res} title="The report queue could not be loaded." />
      ) : cases.length === 0 ? (
        <EmptyState title={status ? `No cases with the status “${caseMeta[status as CaseStatus].label}”` : "No reports yet"} />
      ) : (
        <>
          <p className="tabular mb-2 text-[13.5px] text-ink-3" aria-live="polite">
            {cases.length} {cases.length === 1 ? "case" : "cases"}
          </p>
          <div className="panel relative overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[14px]">
              <caption className="sr-only">Report cases</caption>
              <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                <tr>
                  <th scope="col" className="px-3 py-2.5">Case</th>
                  <th scope="col" className="px-3 py-2.5">Status</th>
                  <th scope="col" className="px-3 py-2.5">Kind</th>
                  <th scope="col" className="px-3 py-2.5">Package</th>
                  <th scope="col" className="px-3 py-2.5">Reporter</th>
                  <th scope="col" className="px-3 py-2.5">Received</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id} className="border-t border-line-soft align-top">
                    <th scope="row" className="px-3 py-2.5">
                      <Link href={`/admin/reports/${encodeURIComponent(c.caseId)}`} className="tabular font-mono text-[13.5px] font-bold text-cobalt-ink hover:underline">
                        {c.caseId}
                      </Link>
                    </th>
                    <td className="px-3 py-2.5">
                      <span className="flex flex-wrap gap-1">
                        <StatusBadge size="sm" meta={metaFor(caseMeta, c.status)} />
                        {c.escalated && c.status !== "escalated" ? (
                          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-bad">
                            <Scale aria-hidden="true" size={13} /> Escalated
                          </span>
                        ) : null}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">{c.kind === "ip" ? "Intellectual property" : "Abuse"}</td>
                    <td className="px-3 py-2.5">
                      {c.package ? (
                        <>
                          <Identifier value={c.package.identifier} className="text-[13px]" />
                          {c.releaseVersion ? <span className="font-mono text-[13px] text-ink-3">@{c.releaseVersion}</span> : null}
                        </>
                      ) : (
                        <span className="text-ink-3">Not a listed package</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">{ROLE_LABELS[c.reporterRole] ?? c.reporterRole}</td>
                    <td className="tabular px-3 py-2.5">
                      <time dateTime={c.receivedAt} title={formatDateTime(c.receivedAt)}>
                        {relativeTime(c.receivedAt)}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
