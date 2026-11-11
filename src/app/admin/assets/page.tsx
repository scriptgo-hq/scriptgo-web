import Link from "next/link";
import { AssetLookup } from "@/components/assets/asset-lookup";
import { SectionTitle } from "@/components/admin/parts";
import { PageHeader } from "@/components/dashboard/page-header";
import { AutoSubmitSelect } from "@/components/site/auto-submit";
import { StatusBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { api } from "@/lib/api";
import { assetReportMeta } from "@/lib/assets";
import type { AssetReportRow } from "@/lib/contract";
import { formatDateTime, relativeTime } from "@/lib/format";

export const metadata = { title: "Asset reports" };

const STATUSES = ["open", "actioned", "rejected", "all"] as const;

export default async function AssetReportsPage({ searchParams }: { searchParams: Promise<{ status?: string | string[] }> }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const status = (STATUSES as readonly string[]).includes(raw ?? "") ? (raw as (typeof STATUSES)[number]) : "open";
  const res = await api<AssetReportRow[]>(`/v1/admin/assets/reports?status=${status}`, { auth: true });
  const rows = res.ok ? res.data : [];

  return (
    <>
      <PageHeader
        eyebrow="trust & safety"
        title="Asset reports."
        description="Leaked copies and infringing assets. Find the copy, then act: revoke the licence, stop the deployment, or hold the release."
      />
      <div className="grid grid-cols-1 gap-12">
        <section aria-labelledby="lookup-title">
          <SectionTitle id="lookup-title">Find a copy</SectionTitle>
          <p className="mt-2 max-w-prose text-[14px] text-ink-2">
            Each download is its own fingerprinted copy. A file, its SHA-256 or its fingerprint record says which licence and server it was built for.
          </p>
          <div className="mt-4 max-w-[760px]">
            <AssetLookup staff />
          </div>
        </section>

        <section aria-labelledby="reports-title">
          <SectionTitle id="reports-title">Reports</SectionTitle>
          <form method="get" className="mt-4 flex flex-wrap items-end gap-3" role="search" aria-label="Filter asset reports">
            <div>
              <label htmlFor="status" className="block text-[13px] font-bold">
                Status
              </label>
              <AutoSubmitSelect id="status" name="status" defaultValue={status} className="mt-1">
                <option value="open">Open</option>
                <option value="actioned">Actioned</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </AutoSubmitSelect>
            </div>
            <button type="submit" className={buttonClass("secondary", "md")}>
              Apply
            </button>
          </form>
          <div className="mt-4">
            {!res.ok ? (
              <ApiError failure={res} title="The asset reports could not be loaded." />
            ) : rows.length === 0 ? (
              <EmptyState title={status === "open" ? "No open asset reports" : "No asset reports"} />
            ) : (
              <ul className="grid grid-cols-1 gap-3" data-asset-reports={rows.length}>
                {rows.map((r) => (
                  <li key={r.id} className="panel p-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Link href={`/admin/assets/${encodeURIComponent(r.id)}`} className="font-mono text-[14px] font-bold text-cobalt-ink hover:underline">
                        {r.package}
                        {r.version ? `@${r.version}` : ""}
                      </Link>
                      <StatusBadge meta={assetReportMeta[r.status]} size="sm" />
                      {r.resolved ? <span className="text-[13px] text-ink-2">copy found</span> : <span className="text-[13px] text-ink-3">copy not found yet</span>}
                      <span className="tabular text-[13px] text-ink-3" title={formatDateTime(r.createdAt)}>
                        {relativeTime(r.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[14px] text-ink-2">{r.description}</p>
                    <p className="mt-1 text-[12.5px] text-ink-3">
                      {r.reporter ? `${r.reporter.name}${r.reporter.isCreator ? " (the creator)" : ""}` : "Reporter removed"}
                      {r.caseId ? <> · case {r.caseId}</> : null}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
