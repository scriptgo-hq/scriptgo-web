import Link from "next/link";
import { KeyRound } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Meter } from "@/components/ui/data";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { Identifier } from "@/components/ui/typography";
import { api, asList } from "@/lib/api";
import type { LicenseSummary } from "@/lib/contract";
import { formatDate, intervalLabel } from "@/lib/format";
import { licenseMeta, metaFor } from "@/lib/status";

export const metadata = { title: "Licenses" };

function periodLabel(l: LicenseSummary) {
  if (!l.currentPeriodEnd) return !l.offer || l.offer.interval === "perpetual" ? "No end date" : "—";
  // A granted license does not renew: it ends on the date its creator set.
  if (l.status === "active") return `${l.offer ? "Renews" : "Ends"} ${formatDate(l.currentPeriodEnd)}`;
  if (l.status === "grace" || l.status === "cancelled_active") return `Active until ${formatDate(l.currentPeriodEnd)}`;
  return `Ended ${formatDate(l.currentPeriodEnd)}`;
}

export default async function LicensesPage() {
  const res = await api<LicenseSummary[] | { items: LicenseSummary[] }>("/v1/me/licenses", { auth: true });
  const items = res.ok ? asList(res.data) : [];
  return (
    <>
      <PageHeader eyebrow="using" title="Licenses." description="Licenses you hold, bought or granted to you by a creator, and where they are deployed. Licenses you issued as a creator are under Customers." />
      {!res.ok ? (
        <ApiError failure={res} />
      ) : items.length === 0 ? (
        <EmptyState icon={KeyRound} title="No licenses yet" action={<ButtonLink href="/explore?pricing=paid" size="sm" arrow>Browse paid scripts</ButtonLink>}>
          A license appears here once a creator&rsquo;s payment provider confirms your payment, or when a creator grants you one for free.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {items.map((l) => (
            <li key={l.id} className="panel relative flex flex-wrap items-center gap-x-6 gap-y-3 p-4 hover:border-line">
              <div className="min-w-0 flex-1">
                <Link href={`/dashboard/licenses/${encodeURIComponent(l.id)}`} className="font-display text-[18px] font-extrabold after:absolute after:inset-0">
                  {l.package.title}
                </Link>
                <p className="text-[13px] text-ink-3">
                  <Identifier value={l.package.identifier} /> ·{" "}
                  {l.offer ? (
                    <>
                      {l.offer.name} · {intervalLabel(l.offer.interval)}
                    </>
                  ) : l.origin.recipient === "server_key" ? (
                    <span data-license-origin="creator">Granted by you to a server key · free, no payment</span>
                  ) : (
                    <span data-license-origin="creator">Granted by {l.origin.grantedBy ?? "the creator"} · free, no payment</span>
                  )}
                </p>
              </div>
              <StatusBadge meta={metaFor(licenseMeta, l.status)} />
              <span className="tabular w-44 text-[13.5px] text-ink-2">{periodLabel(l)}</span>
              <Meter used={l.deploymentsUsed} allowed={l.deploymentsAllowed} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
