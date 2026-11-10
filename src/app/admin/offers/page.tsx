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

export const metadata = { title: "Offers on hold" };

/** GET form: the offers of one package, so that staff can put one on hold after a report. */
function PackageOffersForm({ current }: { current: string }) {
  return (
    <form method="get" action="/admin/offers" className="panel mb-5 flex flex-wrap items-end gap-3 p-4">
      <label className="min-w-[260px] flex-1 text-[14px] font-bold">
        Offers of a package
        <input
          name="package"
          defaultValue={current}
          placeholder="creator//name"
          maxLength={200}
          className="mt-1 block w-full rounded-[10px] border-2 border-line-soft bg-surface px-3 py-2 font-mono text-[14px] font-normal"
        />
      </label>
      <button type="submit" className="rounded-[10px] border-2 border-line bg-surface px-3 py-2 text-[14px] font-bold">
        Show its offers
      </button>
      {current ? (
        <Link href="/admin/offers" className="text-[14px] font-semibold underline">
          Back to the offers on hold
        </Link>
      ) : null}
    </form>
  );
}

export default async function OfferReviewPage({ searchParams }: { searchParams: Promise<{ package?: string | string[] }> }) {
  const sp = await searchParams;
  const pkgFilter = (Array.isArray(sp.package) ? sp.package[0] : sp.package)?.trim() ?? "";
  const res = await api<ReviewOffer[] | { items: ReviewOffer[] }>(pkgFilter ? `/v1/admin/review/offers?package=${encodeURIComponent(pkgFilter)}` : "/v1/admin/review/offers", { auth: true });
  const offers = res.ok ? asList(res.data) : [];

  return (
    <>
      <PageHeader
        eyebrow="after a report"
        title="Offers on hold."
        description="SCRIPT//GO does not review offers before sale: the seller declares their rights and answers for what they sell, and a declared offer can be bought at once. This list shows only the offers staff put on hold after a report. Lift a hold here, or put an offer on hold from its package: the decision is audited, the creator is notified and can appeal."
      />
      <PackageOffersForm current={pkgFilter} />
      {!res.ok ? (
        <ApiError failure={res} title="The offers on hold could not be loaded." />
      ) : offers.length === 0 ? (
        pkgFilter ? (
          <EmptyState title={`No offer found for ${pkgFilter}`}>Check the identifier: creator//name, as on the package page.</EmptyState>
        ) : (
          <EmptyState title="No offer is on hold">Nothing arrives here by itself. An offer appears when a staff member puts it on hold after a report.</EmptyState>
        )
      ) : (
        <ul className="space-y-5">
          {offers.map((o) => {
            const href = packagePath(o.package.identifier);
            return (
              <li key={o.id} className="panel grid grid-cols-1 gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
                <article aria-labelledby={`offer-${o.id}`} className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge meta={metaFor(classificationMeta, o.classification)} />
                    <span className="tabular text-[13px] text-ink-3">offer created {formatDateTime(o.createdAt)}</span>
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
                    <dt className="text-ink-3">Runs on</dt>
                    <dd className="flex flex-wrap gap-1">{o.environments.length ? o.environments.map((e) => <Tag key={e}>{envName(e)}</Tag>) : "All declared"}</dd>
                    <dt className="text-ink-3">{o.classification === "on_hold" || o.classification === "rejected" ? "Why it is held" : "Stands on"}</dt>
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
