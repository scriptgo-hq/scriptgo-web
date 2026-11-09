import Link from "next/link";
import { Bell } from "lucide-react";
import { appealMeta, moderationActionLabel } from "@/components/admin/status";
import { AppealForm } from "@/components/dashboard/appeal-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { Identifier } from "@/components/ui/typography";
import { api } from "@/lib/api";
import type { Notice } from "@/lib/contract";
import { formatDate, formatDateTime } from "@/lib/format";
import { metaFor } from "@/lib/status";

export const metadata = { title: "Notices" };

function packageHref(identifier: string): string | null {
  const [creator, name] = identifier.split("//");
  return creator && name ? `/packages/${encodeURIComponent(creator)}/${encodeURIComponent(name)}` : null;
}

function NoticeCard({ n }: { n: Notice }) {
  const href = n.package ? packageHref(n.package.identifier) : null;
  return (
    <article aria-labelledby={`n-${n.id}`} className={n.readAt ? "panel p-5" : "sticker p-5"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-[13px] text-ink-3">
            {!n.readAt ? <Tag className="border-line bg-sun text-on-sun">New</Tag> : null}
            <span>{n.kind === "appeal_outcome" ? "Appeal outcome" : "Moderation decision"}</span>
            {n.caseId ? <span className="font-mono">{n.caseId}</span> : null}
            <time dateTime={n.createdAt} className="tabular">
              {formatDateTime(n.createdAt)}
            </time>
          </p>
          <h2 id={`n-${n.id}`} className="mt-1 font-display text-[22px] font-extrabold leading-tight">
            {n.title}
          </h2>
        </div>
        {n.action ? <Tag>{moderationActionLabel(n.action)}</Tag> : null}
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 text-[14px] sm:grid-cols-[8rem_minmax(0,1fr)]">
        {n.package ? (
          <>
            <dt className="text-ink-3">Package</dt>
            <dd>
              {href ? (
                <Link href={href} className="hover:underline">
                  <Identifier value={n.package.identifier} />
                </Link>
              ) : (
                <Identifier value={n.package.identifier} />
              )}
              {n.releaseVersion ? <span className="font-mono text-[13px]"> @ {n.releaseVersion}</span> : null}
            </dd>
          </>
        ) : null}
        <dt className="text-ink-3">Applies to</dt>
        <dd>{n.scope}</dd>
      </dl>

      <div className="mt-4">
        <p className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">Statement of reasons</p>
        <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed">{n.body}</p>
      </div>

      <div className="mt-5 border-t-2 border-line-soft pt-4">
        {n.appeal ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge meta={metaFor(appealMeta, n.appeal.status)} size="sm" />
              <span className="tabular text-[13px] text-ink-3">
                sent {formatDate(n.appeal.createdAt)}
                {n.appeal.decidedAt ? ` · decided ${formatDate(n.appeal.decidedAt)}` : ""}
              </span>
            </div>
            <details>
              <summary className="cursor-pointer text-[13.5px] font-semibold text-cobalt-ink">Your appeal</summary>
              <p className="mt-1 whitespace-pre-wrap text-[14px] text-ink-2">{n.appeal.statement}</p>
            </details>
            {n.appeal.outcome ? (
              <div>
                <p className="text-[13.5px] font-bold">Reviewer&rsquo;s reasons</p>
                <p className="whitespace-pre-wrap text-[14px] text-ink-2">{n.appeal.outcome}</p>
              </div>
            ) : null}
          </div>
        ) : n.appealable ? (
          <AppealForm noticeId={n.id} deadline={n.appealDeadline ? formatDate(n.appealDeadline) : null} />
        ) : n.kind === "moderation_decision" ? (
          <p className="text-[13.5px] text-ink-3">
            {n.appealDeadline && Date.parse(n.appealDeadline) <= Date.now()
              ? `The appeal window closed on ${formatDate(n.appealDeadline)}.`
              : "This decision can't be appealed here."}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export default async function NoticesPage() {
  const res = await api<Notice[]>("/v1/me/notices", { auth: true });
  return (
    <>
      <PageHeader
        eyebrow="account"
        title="Notices."
        description="Decisions SCRIPT//GO took about your packages or account, each with its reasons and how to appeal."
      />
      {!res.ok ? (
        <ApiError failure={res} title="Your notices couldn't be loaded." />
      ) : res.data.length === 0 ? (
        <EmptyState icon={Bell} title="No notices">
          When a moderation decision affects your packages, it appears here with the reasons.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {res.data.map((n) => (
            <NoticeCard key={n.id} n={n} />
          ))}
        </div>
      )}
    </>
  );
}
