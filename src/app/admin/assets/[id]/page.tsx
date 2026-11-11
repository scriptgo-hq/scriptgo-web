import Link from "next/link";
import { notFound } from "next/navigation";
import { ASSET_ACTIONS, AssetReportActions } from "@/components/assets/asset-report-actions";
import { AssetLookup } from "@/components/assets/asset-lookup";
import { SectionTitle } from "@/components/admin/parts";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/data";
import { ApiError } from "@/components/ui/feedback";
import { api } from "@/lib/api";
import { assetReportMeta } from "@/lib/assets";
import type { AssetReportRow } from "@/lib/contract";
import { formatBytes, formatDateTime, shortHash } from "@/lib/format";

export const metadata = { title: "Asset report" };

const EVIDENCE_LABEL: Record<string, string> = { sha256: "SHA-256", record: "Fingerprint record", url: "Where it is", note: "Note" };

export default async function AssetReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await api<AssetReportRow>(`/v1/admin/assets/reports/${encodeURIComponent(decodeURIComponent(id))}`, { auth: true });
  if (!res.ok) {
    if (res.status === 404) notFound();
    return <ApiError failure={res} title="This asset report couldn't be loaded." />;
  }
  const r = res.data;
  const m = r.resolved;
  return (
    <>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: "Asset reports", href: "/admin/assets" }, { label: r.package }]} />}
        eyebrow="trust & safety"
        title="Asset report."
      />
      <div className="grid grid-cols-1 gap-10" data-asset-report={r.id} data-asset-report-status={r.status}>
        <section aria-labelledby="report-title" className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="panel p-4">
            <h2 id="report-title" className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">
              Report
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge meta={assetReportMeta[r.status]} />
              {r.caseId ? (
                <Link href={`/admin/reports/${encodeURIComponent(r.caseId)}`} className="font-mono text-[13px] font-bold text-cobalt-ink underline">
                  case {r.caseId}
                </Link>
              ) : null}
            </div>
            <dl className="tabular mt-3 grid grid-cols-[8rem_minmax(0,1fr)] gap-y-1 text-[14px]">
              <dt className="text-ink-3">Package</dt>
              <dd className="break-all font-mono text-[13px]">
                {r.package}
                {r.version ? `@${r.version}` : ""}
              </dd>
              <dt className="text-ink-3">Received</dt>
              <dd>{formatDateTime(r.createdAt)}</dd>
              <dt className="text-ink-3">From</dt>
              <dd>{r.reporter ? `${r.reporter.name}${r.reporter.isCreator ? " (the package's creator)" : ""}` : "—"}</dd>
            </dl>
            <p className="mt-3 whitespace-pre-line text-[14.5px]">{r.description}</p>
          </div>
          <div className="panel p-4">
            <p className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">Evidence</p>
            <ul className="mt-2 space-y-2 text-[14px]">
              {r.evidence.map((e, i) => (
                <li key={i}>
                  <span className="text-ink-3">{EVIDENCE_LABEL[e.kind] ?? e.kind}</span>
                  {e.kind === "record" ? (
                    <pre className="mt-1 max-h-48 overflow-auto rounded-[8px] border-2 border-line-soft bg-surface-2 p-2 font-mono text-[12px]">{e.value}</pre>
                  ) : e.kind === "url" ? (
                    <span className="block break-all font-mono text-[13px]">{e.value}</span>
                  ) : (
                    <span className={e.kind === "sha256" ? "block break-all font-mono text-[13px]" : "block whitespace-pre-line"}>{e.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="copy-title">
          <SectionTitle id="copy-title">The copy</SectionTitle>
          {m ? (
            <div className="panel mt-4 p-4" data-resolved={m.deliveryId}>
              <dl className="grid grid-cols-1 gap-y-1.5 text-[14px] sm:grid-cols-[10rem_minmax(0,1fr)]">
                <dt className="text-ink-3">Release</dt>
                <dd className="font-mono text-[13px]">
                  {m.package}@{m.version}
                </dd>
                <dt className="text-ink-3">Licence</dt>
                <dd className="break-all font-mono text-[13px]">{m.license ? `${m.license.id} (${m.license.status})` : m.accountCopy ? "none: an account copy" : "—"}</dd>
                <dt className="text-ink-3">Account</dt>
                <dd>{m.account ? `${m.account.name} <${m.account.email}>` : "—"}</dd>
                <dt className="text-ink-3">Deployment</dt>
                <dd>{m.deployment ? `${m.deployment.name} (${m.deployment.environment}, ${m.deployment.status})` : "—"}</dd>
                <dt className="text-ink-3">Copy</dt>
                <dd className="tabular">
                  {formatBytes(m.size)} · {shortHash(m.sha256, 16)} · built {formatDateTime(m.createdAt)}
                </dd>
              </dl>
              <p className="mt-3 text-[13px] text-ink-2">Where the copy was delivered. Evidence for a decision, not a verdict.</p>
            </div>
          ) : (
            <p className="mt-3 max-w-prose text-[14px] text-ink-2">Not found yet. Look the evidence up below and choose the copy it came from.</p>
          )}
          <details className="mt-4 max-w-[760px]" open={!m}>
            <summary className="cursor-pointer text-[14px] font-semibold text-cobalt-ink">{m ? "Look up another copy" : "Look up the copy"}</summary>
            <div className="mt-3">
              <AssetLookup staff resolveReport={r.id} />
            </div>
          </details>
        </section>

        <section aria-labelledby="act-title">
          <SectionTitle id="act-title">Decide</SectionTitle>
          <div className="mt-4 max-w-[760px]">
            <AssetReportActions report={r} />
          </div>
          {r.actions.length ? (
            <ol className="mt-5 space-y-2 text-[14px]">
              {r.actions.map((a, i) => (
                <li key={i} className="panel p-3">
                  <p className="font-semibold">
                    {ASSET_ACTIONS[a.action]?.label ?? a.action} <span className="tabular font-normal text-ink-3">· {formatDateTime(a.at)}</span>
                  </p>
                  <p className="mt-1 whitespace-pre-line text-ink-2">{a.reasons}</p>
                </li>
              ))}
            </ol>
          ) : null}
        </section>
      </div>
    </>
  );
}
