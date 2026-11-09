import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { AppealDecisionForm, ReportDecisionForm, StartReviewButton } from "@/components/admin/decision-forms";
import { RightsSummary, SectionTitle, YesNo } from "@/components/admin/parts";
import { ACTOR_LABELS, appealMeta, moderationActionLabel, packagePath } from "@/components/admin/status";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { Breadcrumb, KeyValue } from "@/components/ui/data";
import { ApiError, Banner } from "@/components/ui/feedback";
import { Identifier } from "@/components/ui/typography";
import { api } from "@/lib/api";
import type { AuditEntry, CaseDetail } from "@/lib/contract";
import { getMe } from "@/lib/session";
import { formatBytes, formatDateTime, shortHash } from "@/lib/format";
import { caseMeta, metaFor } from "@/lib/status";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Case ${decodeURIComponent(id)}` };
}

const ROLE_LABELS: Record<string, string> = { rights_holder: "Rights holder", authorized_agent: "Authorized agent", user: "User" };
const DECIDABLE = new Set(["received", "under_review", "escalated"]);

/** Untrusted reporter text: rendered as plain, pre-wrapped text only. */
function Plain({ text, empty = "—" }: { text: string | null | undefined; empty?: string }) {
  if (!text || !text.trim()) return <span className="text-ink-3">{empty}</span>;
  return <span className="whitespace-pre-wrap break-words">{text}</span>;
}

function snapshotValue(v: unknown): React.ReactNode {
  if (v === null || v === undefined || v === "") return <span className="text-ink-3">—</span>;
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return <span className="break-words">{String(v)}</span>;
  return null;
}

function AuditList({ entries }: { entries: AuditEntry[] }) {
  if (entries.length === 0) return <p className="mt-3 text-[14px] text-ink-3">No audit entries yet.</p>;
  return (
    <ol className="panel mt-3 divide-y divide-line-soft">
      {entries.map((a) => (
        <li key={a.id} className="grid grid-cols-1 gap-1 px-4 py-2.5 text-[13.5px] sm:grid-cols-[190px_minmax(0,1fr)_minmax(0,auto)]">
          <time dateTime={a.at} className="tabular text-ink-3">
            {formatDateTime(a.at)}
          </time>
          <span className="font-mono text-[13px] font-semibold">{a.action}</span>
          <span className="text-ink-2 sm:text-right">
            {ACTOR_LABELS[a.actor.type] ?? a.actor.type}
            {a.actor.label ? ` · ${a.actor.label}` : ""}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await api<CaseDetail>(`/v1/admin/reports/${encodeURIComponent(decodeURIComponent(id))}`, { auth: true });
  const me = await getMe();
  const viewerId = me.ok ? me.data.user.id : null;
  if (!res.ok) {
    if (res.status === 404) notFound();
    return (
      <>
        <Breadcrumb items={[{ label: "Reports", href: "/admin/reports" }, { label: decodeURIComponent(id) }]} />
        <ApiError className="mt-4" failure={res} title="This case could not be loaded." />
      </>
    );
  }
  const c = res.data;
  const href = packagePath(c.package?.identifier);
  const snap = c.snapshot ?? null;
  const snapRelease = (snap?.release ?? null) as { version?: string; status?: string; sha256?: string; publishedAt?: string | null } | null;
  const snapFiles = Array.isArray(snap?.files) ? (snap!.files as { path: string; sha256: string; size: number }[]) : [];
  const snapOffers = Array.isArray(snap?.offers)
    ? (snap!.offers as { name: string; interval: string; price: number | null; currency: string | null; classification: string }[])
    : [];
  const scalarKeys: [string, string][] = [
    ["identifier", "Identifier"],
    ["title", "Title"],
    ["summary", "Summary"],
    ["license", "License"],
    ["visibility", "Visibility"],
    ["listingStatus", "Listing status"],
  ];
  const decidable = DECIDABLE.has(c.status);
  const disabledReason = decidable
    ? null
    : c.status === "appeal_open"
      ? "A decision was already recorded. The creator appealed: decide the appeal below instead."
      : `This case is “${metaFor(caseMeta, c.status).label}”. Decisions are recorded once; only an appeal reopens a case.`;
  const openAppeals = c.appeals.filter((a) => a.status === "open");

  return (
    <>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: "Reports", href: "/admin/reports" }, { label: c.caseId }]} />}
        eyebrow={c.kind === "ip" ? "intellectual property report" : "abuse report"}
        title={`${c.caseId}.`}
        description={
          <span className="tabular">
            Received {formatDateTime(c.receivedAt)}
            {c.acknowledgedAt ? ` · acknowledged ${formatDateTime(c.acknowledgedAt)}` : " · not acknowledged yet"}
          </span>
        }
        actions={
          <div className="flex flex-col items-end gap-1">
            <StatusBadge meta={metaFor(caseMeta, c.status)} />
            {c.status === "received" ? <StartReviewButton caseRef={c.id} /> : null}
            {c.escalated ? <span className="text-[12.5px] font-semibold text-bad">Escalated to legal review</span> : null}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section aria-labelledby="claim-title" className="panel min-w-0 p-5">
          <SectionTitle id="claim-title">Claim</SectionTitle>
          <div className="mt-3 space-y-4 text-[14px]">
            <KeyValue
              labelWidth="8rem"
              items={[
                { label: "Reporter", value: <Plain text={c.claim.reporterName} /> },
                { label: "Email", value: <span className="break-all font-mono text-[13px]">{c.claim.reporterEmail}</span> },
                { label: "Role", value: ROLE_LABELS[c.reporterRole] ?? c.reporterRole },
                { label: "Target", value: c.package ? <Identifier value={`${c.package.identifier}${c.releaseVersion ? `@${c.releaseVersion}` : ""}`} /> : "Not a listed package" },
                // Untrusted URL: shown as text, never as a link.
                { label: "URL", value: c.claim.url ? <span className="break-all font-mono text-[13px]">{c.claim.url}</span> : "—" },
                { label: "Good faith", value: <YesNo value={c.claim.goodFaith} yes="Stated" no="Not stated" /> },
                { label: "Accuracy", value: <YesNo value={c.claim.accuracy} yes="Stated" no="Not stated" /> },
              ]}
            />
            <div>
              <p className="font-mono text-[11.5px] font-bold uppercase tracking-wide text-ink-3">Claimed work</p>
              <p className="mt-1">
                <Plain text={c.claim.claimedWork} empty="Not given" />
              </p>
            </div>
            <div>
              <p className="font-mono text-[11.5px] font-bold uppercase tracking-wide text-ink-3">Description</p>
              <p className="mt-1 rounded-lg border border-line-soft bg-surface px-3 py-2">
                <Plain text={c.claim.description} />
              </p>
            </div>
            <div>
              <p className="font-mono text-[11.5px] font-bold uppercase tracking-wide text-ink-3">Evidence ({c.evidence.length})</p>
              {c.evidence.length === 0 ? (
                <p className="mt-1 text-ink-3">No files attached.</p>
              ) : (
                <ul className="mt-1.5 space-y-1.5">
                  {c.evidence.map((e) => {
                    const safe = e.url.startsWith("/v1/");
                    return (
                      <li key={e.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-line-soft bg-surface px-3 py-2">
                        <FileText aria-hidden="true" size={16} className="shrink-0 text-ink-3" />
                        <span className="min-w-0 flex-1 break-all font-semibold">{e.fileName}</span>
                        <span className="tabular text-[12.5px] text-ink-3">
                          {formatBytes(e.size)} · {e.contentType}
                        </span>
                        <span className="font-mono text-[12px] text-ink-3" title={e.sha256}>
                          sha256 {shortHash(e.sha256, 10)}
                        </span>
                        {safe ? (
                          <a href={e.url} download={e.fileName} className="inline-flex items-center gap-1 text-[13px] font-bold text-cobalt-ink hover:underline">
                            <Download aria-hidden="true" size={14} /> Download
                            <span className="sr-only"> {e.fileName}</span>
                          </a>
                        ) : (
                          <span className="text-[12.5px] text-ink-3">Download unavailable: unexpected file location</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section aria-labelledby="snap-title" className="panel min-w-0 p-5">
          <SectionTitle id="snap-title">Listing as received</SectionTitle>
          {!snap ? (
            <p className="mt-3 text-[14px] text-ink-3">No snapshot: the report does not target a listed package.</p>
          ) : (
            <div className="mt-3 space-y-4 text-[14px]">
              <p className="tabular text-[13px] text-ink-3">
                Captured {typeof snap.capturedAt === "string" ? formatDateTime(snap.capturedAt) : "when the report was received"}
                {href ? (
                  <>
                    {" · "}
                    <Link href={href} className="font-semibold text-cobalt-ink hover:underline">
                      Current public page
                    </Link>
                  </>
                ) : null}
              </p>
              <KeyValue labelWidth="8rem" items={scalarKeys.map(([k, label]) => ({ label, value: snapshotValue(snap[k]) }))} />
              {snapRelease ? (
                <KeyValue
                  labelWidth="8rem"
                  items={[
                    { label: "Release", value: <span className="font-mono">{snapRelease.version ?? "—"}</span> },
                    { label: "Release status", value: snapRelease.status ?? "—" },
                    { label: "SHA-256", value: <span className="break-all font-mono text-[12.5px]">{snapRelease.sha256 ?? "—"}</span> },
                    { label: "Published", value: <span className="tabular">{formatDateTime(snapRelease.publishedAt ?? null)}</span> },
                  ]}
                />
              ) : null}
              {snapOffers.length ? (
                <div>
                  <p className="font-mono text-[11.5px] font-bold uppercase tracking-wide text-ink-3">Offers at the time</p>
                  <ul className="mt-1 space-y-0.5 text-[13.5px]">
                    {snapOffers.map((o, i) => (
                      <li key={`${o.name}-${i}`} className="tabular">
                        {o.name} · {o.interval}
                        {o.price !== null && o.currency ? ` · ${(o.price / 100).toFixed(2)} ${o.currency}` : ""} · {o.classification.replace(/_/g, " ")}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {snapFiles.length ? (
                <details className="rounded-lg border border-line-soft bg-surface px-3 py-2">
                  <summary className="cursor-pointer text-[13.5px] font-bold">
                    Files in the release (<span className="tabular">{snapFiles.length}</span>)
                  </summary>
                  <ul className="mt-2 space-y-0.5 font-mono text-[12px]">
                    {snapFiles.map((f) => (
                      <li key={f.path} className="flex flex-wrap gap-x-3">
                        <span className="break-all">{f.path}</span>
                        <span className="tabular text-ink-3">{formatBytes(f.size)}</span>
                        <span className="text-ink-3" title={f.sha256}>
                          {shortHash(f.sha256, 10)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
              <details>
                <summary className="cursor-pointer text-[13.5px] font-bold">Raw snapshot (JSON)</summary>
                <CodeBlock className="mt-2" code={JSON.stringify(snap, null, 2)} lang="json" filename="snapshot.json" />
              </details>
            </div>
          )}
          <div className="mt-5 border-t-2 border-line-soft pt-4">
            <p className="mb-2 font-mono text-[11.5px] font-bold uppercase tracking-wide text-ink-3">Rights declaration</p>
            <RightsSummary rights={c.rights} detailed />
          </div>
        </section>
      </div>

      <section aria-labelledby="decisions-title" className="mt-10">
        <SectionTitle id="decisions-title">Decisions</SectionTitle>
        {c.decisions.length === 0 ? (
          <p className="mt-3 text-[14px] text-ink-3">No decision recorded yet.</p>
        ) : (
          <ol className="mt-3 space-y-3">
            {c.decisions.map((d) => (
              <li key={d.id} className="panel p-4 text-[14px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{moderationActionLabel(d.action)}</span>
                  {d.escalated ? <span className="text-[12.5px] font-semibold text-bad">· escalated</span> : null}
                  {d.reversedAt ? <span className="tabular text-[12.5px] font-semibold text-ok">· reversed {formatDateTime(d.reversedAt)}</span> : null}
                  <span className="tabular ml-auto text-[13px] text-ink-3">
                    {formatDateTime(d.decidedAt)}
                    {d.decidedBy ? ` · by ${d.decidedBy === viewerId ? "you" : (d.decidedByName ?? "a former reviewer")}` : ""}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-ink-3">
                  Scope: <span className="font-mono">{d.scope}</span>
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words">{d.reasons}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="appeals-title" className="mt-10">
        <SectionTitle id="appeals-title">Appeals</SectionTitle>
        {c.appeals.length === 0 ? (
          <p className="mt-3 text-[14px] text-ink-3">No appeal.</p>
        ) : (
          <ol className="mt-3 space-y-3">
            {c.appeals.map((a) => (
              <li key={a.id} className="panel p-4 text-[14px]">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge size="sm" meta={metaFor(appealMeta, a.status)} />
                  <span className="tabular ml-auto text-[13px] text-ink-3">filed {formatDateTime(a.createdAt)}</span>
                </div>
                <p className="mt-2 font-mono text-[11.5px] font-bold uppercase tracking-wide text-ink-3">Creator&rsquo;s statement</p>
                <p className="mt-1">
                  <Plain text={a.statement} />
                </p>
                {a.outcome ? (
                  <p className="mt-2 text-ink-2">
                    <span className="font-bold">Outcome ({formatDateTime(a.decidedAt)}): </span>
                    <span className="whitespace-pre-wrap">{a.outcome}</span>
                  </p>
                ) : null}
                {a.status === "open" ? (
                  viewerId && c.decisions.find((d) => d.id === a.decisionId)?.decidedBy === viewerId ? (
                    <p role="note" className="mt-3 rounded-lg border-2 border-line-soft bg-surface px-3 py-2 text-[14px]">
                      <span className="font-bold">You took the decision under appeal.</span> The creator was told a different reviewer
                      decides: another moderator or admin records the outcome.
                    </p>
                  ) : (
                    <AppealDecisionForm appealId={a.id} />
                  )
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="decide-title" className="mt-10">
        <SectionTitle id="decide-title">Record a decision</SectionTitle>
        {openAppeals.length ? (
          <Banner className="mt-3" tone="info" title="An appeal is open on this case.">
            A reviewer who did not take the original decision decides the appeal; the API refuses the one who did.
          </Banner>
        ) : null}
        <div className="sticker mt-3 p-5">
          <ReportDecisionForm caseRef={c.id} caseLabel={c.caseId} targetsPackage={Boolean(c.package)} disabledReason={disabledReason} />
        </div>
      </section>

      <section aria-labelledby="audit-title" className="mt-10">
        <SectionTitle id="audit-title">Audit trail</SectionTitle>
        <AuditList entries={c.audit} />
      </section>
    </>
  );
}
