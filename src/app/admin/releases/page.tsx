import Link from "next/link";
import { ReleaseDecisionForm } from "@/components/admin/decision-forms";
import { RightsSummary } from "@/components/admin/parts";
import { packagePath, reviewStatusMeta } from "@/components/admin/status";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { Identifier } from "@/components/ui/typography";
import { api, asList } from "@/lib/api";
import type { ReviewRelease } from "@/lib/contract";
import { formatBytes, formatDateTime, shortHash } from "@/lib/format";
import { checkMeta, metaFor, releaseMeta } from "@/lib/status";

export const metadata = { title: "Release review" };

export default async function ReleaseReviewPage() {
  const res = await api<ReviewRelease[] | { items: ReviewRelease[] }>("/v1/admin/review/releases", { auth: true });
  const items = res.ok ? asList(res.data) : [];

  return (
    <>
      <PageHeader eyebrow="review" title="Releases." description="Releases flagged by a check, a report or a rights declaration. Approve, restrict, or reinstate a restricted release." />
      {!res.ok ? (
        <ApiError failure={res} title="The release review queue could not be loaded." />
      ) : items.length === 0 ? (
        <EmptyState title="No releases waiting for review" />
      ) : (
        <ul className="space-y-5">
          {items.map(({ release: r, package: p, review }) => {
            const href = packagePath(p.identifier);
            const failedRequired = r.checks.filter((c) => c.required && c.status === "failed");
            // Advisory failures do not block publishing but matter to a reviewer (e.g. the manifest
            // names another author than the publisher).
            const failedAdvisory = r.checks.filter((c) => !c.required && c.status === "failed");
            const passed = r.checks.filter((c) => c.status === "passed").length;
            const notRun = r.checks.filter((c) => c.status === "skipped" || c.status === "pending" || c.status === "running").length;
            const flagged = [...failedRequired, ...failedAdvisory];
            return (
              <li key={review.id} className="panel grid grid-cols-1 gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
                <article aria-labelledby={`rel-${review.id}`} className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge meta={metaFor(reviewStatusMeta, review.status)} />
                    <StatusBadge meta={metaFor(releaseMeta, r.status)} size="sm" />
                    {r.restricted ? <StatusBadge size="sm" meta={{ label: "Restricted", tone: "danger", icon: "shield", hint: "Not installable." }} /> : null}
                    <span className="tabular text-[13px] text-ink-3">flagged {formatDateTime(review.createdAt)}</span>
                  </div>
                  <h2 id={`rel-${review.id}`} className="text-[19px] font-extrabold">
                    <Identifier value={p.identifier} />
                    <span className="font-mono text-ink-2">@{r.version}</span>
                  </h2>
                  <p className="text-[14px] text-ink-2">
                    {p.title}
                    {href ? (
                      <>
                        {" · "}
                        <Link href={`${href}?version=${encodeURIComponent(r.version)}`} className="font-semibold text-cobalt-ink hover:underline">
                          Public page
                        </Link>
                      </>
                    ) : null}
                  </p>
                  <p className="rounded-lg border-2 border-line-soft bg-surface px-3 py-2 text-[14px]">
                    <span className="font-bold">Flag reason: </span>
                    {review.reason}
                  </p>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 text-[13.5px] sm:grid-cols-[9rem_minmax(0,1fr)]">
                    <dt className="text-ink-3">SHA-256</dt>
                    <dd className="font-mono" title={r.sha256}>
                      {shortHash(r.sha256, 16)}
                    </dd>
                    <dt className="text-ink-3">Size</dt>
                    <dd className="tabular">{formatBytes(r.size)}</dd>
                    <dt className="text-ink-3">Checks</dt>
                    <dd className="tabular">
                      {passed} passed
                      {failedRequired.length ? <span className="font-semibold text-bad"> · {failedRequired.length} required failed</span> : null}
                      {failedAdvisory.length ? <span className="font-semibold text-warn"> · {failedAdvisory.length} advisory failed</span> : null}
                      {notRun ? <span className="text-ink-3"> · {notRun} not run</span> : null}
                    </dd>
                  </dl>
                  {flagged.length ? (
                    <ul className="space-y-1.5">
                      {flagged.map((c) => (
                        <li key={`${c.stage}-${c.name}`} className="flex flex-wrap items-start gap-2 text-[13.5px]">
                          <StatusBadge size="sm" meta={metaFor(checkMeta, c.status)} />
                          {c.required ? null : <Tag>advisory</Tag>}
                          <span className="font-mono text-[12.5px]">
                            {c.stage}/{c.name}
                          </span>
                          {c.message ? <span className="text-ink-2">{c.message}</span> : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {r.blockers.length ? (
                    <div>
                      <p className="font-mono text-[11.5px] font-bold uppercase tracking-wider text-ink-3">Publish blockers</p>
                      <ul className="mt-1 list-disc pl-5 text-[13.5px]">
                        {r.blockers.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <div>
                    <p className="mb-1 font-mono text-[11.5px] font-bold uppercase tracking-wider text-ink-3">Rights declaration</p>
                    <RightsSummary rights={r.rights} />
                  </div>
                </article>
                <div className="min-w-0 rounded-[10px] border-2 border-line-soft bg-paper-2/60 p-4">
                  <p className="mb-2 font-mono text-[11.5px] font-bold uppercase tracking-wider text-ink-3">Decision</p>
                  <ReleaseDecisionForm reviewId={review.id} restricted={r.restricted} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
