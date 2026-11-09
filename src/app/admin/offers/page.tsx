import Link from "next/link";
import { OfferDecisionForm } from "@/components/admin/decision-forms";
import { RightsSummary } from "@/components/admin/parts";
import { packagePath } from "@/components/admin/status";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { Identifier } from "@/components/ui/typography";
import { api, asList } from "@/lib/api";
import type { ReviewOffer } from "@/lib/contract";
import { envName } from "@/lib/env";
import { formatDateTime, formatMoney, intervalLabel, intervalSuffix } from "@/lib/format";
import { classificationMeta, metaFor } from "@/lib/status";

export const metadata = { title: "Offer review" };

export default async function OfferReviewPage() {
  const res = await api<ReviewOffer[] | { items: ReviewOffer[] }>("/v1/admin/review/offers", { auth: true });
  const offers = res.ok ? asList(res.data) : [];

  return (
    <>
      <PageHeader
        eyebrow="review"
        title="Offers."
        description="A paid offer has no purchase path until its classification is approved. Check the rights declaration before allowing a software license."
      />
      {!res.ok ? (
        <ApiError failure={res} title="The offer review queue could not be loaded." />
      ) : offers.length === 0 ? (
        <EmptyState title="No offers waiting for review">New paid offers appear here when their classification needs a reviewer.</EmptyState>
      ) : (
        <ul className="space-y-5">
          {offers.map((o) => {
            const href = packagePath(o.package.identifier);
            return (
              <li key={o.id} className="panel grid grid-cols-1 gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
                <article aria-labelledby={`offer-${o.id}`} className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge meta={metaFor(classificationMeta, o.classification)} />
                    <span className="tabular text-[13px] text-ink-3">submitted {formatDateTime(o.createdAt)}</span>
                  </div>
                  <h2 id={`offer-${o.id}`} className="text-[19px] font-extrabold">
                    {o.name}
                    <span className="ml-2 tabular font-mono text-[15px] font-semibold text-ink-2">
                      {o.interval === "free" ? "Free" : `${formatMoney(o.price)}${intervalSuffix(o.interval)}`}
                    </span>
                  </h2>
                  <p className="text-[14px]">
                    {href ? (
                      <Link href={href} className="font-semibold hover:underline">
                        <Identifier value={o.package.identifier} />
                      </Link>
                    ) : (
                      <Identifier value={o.package.identifier} />
                    )}{" "}
                    · {o.package.title}
                  </p>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 text-[13.5px] sm:grid-cols-[9rem_minmax(0,1fr)]">
                    <dt className="text-ink-3">Billing</dt>
                    <dd>{intervalLabel(o.interval)}</dd>
                    <dt className="text-ink-3">Provider</dt>
                    <dd>{o.provider === "tebex" ? "Tebex" : o.provider === "mock" ? "Mock provider (sandbox)" : "None connected"}</dd>
                    <dt className="text-ink-3">Deployments</dt>
                    <dd className="tabular">{o.deployments}</dd>
                    <dt className="text-ink-3">Environments</dt>
                    <dd className="flex flex-wrap gap-1">{o.environments.length ? o.environments.map((e) => <Tag key={e}>{envName(e)}</Tag>) : "All declared"}</dd>
                    <dt className="text-ink-3">Why it is here</dt>
                    <dd>{o.classificationReason ?? "—"}</dd>
                  </dl>
                  <div>
                    <p className="mb-1 font-mono text-[11.5px] font-bold uppercase tracking-wider text-ink-3">Rights declaration (latest release)</p>
                    <RightsSummary rights={o.rights} />
                  </div>
                </article>
                <div className="min-w-0 rounded-[10px] border-2 border-line-soft bg-paper-2/60 p-4">
                  <p className="mb-2 font-mono text-[11.5px] font-bold uppercase tracking-wider text-ink-3">Decision</p>
                  <OfferDecisionForm offerId={o.id} current={o.classification} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
