import { CountTile } from "@/components/admin/parts";
import { PageHeader } from "@/components/dashboard/page-header";
import { api, asList, type ApiResult } from "@/lib/api";
import type { CaseSummary, PaymentEventRow, ReviewOffer, ReviewRelease } from "@/lib/contract";
import { getMe } from "@/lib/session";

export const metadata = { title: "Overview" };

type List<T> = T[] | { items: T[] };

function count<T>(res: ApiResult<List<T>>, keep: (x: T) => boolean): { count: number | null; failure: string | null } {
  if (!res.ok) return { count: null, failure: `${res.code}${res.status ? ` · HTTP ${res.status}` : ""}` };
  return { count: asList(res.data).filter(keep).length, failure: null };
}

const OPEN_CASES = new Set(["received", "under_review", "escalated", "appeal_open"]);

export default async function AdminOverview() {
  const me = await getMe();
  const [offers, releases, reports, payments] = await Promise.all([
    api<List<ReviewOffer>>("/v1/admin/review/offers", { auth: true }),
    api<List<ReviewRelease>>("/v1/admin/review/releases", { auth: true }),
    api<List<CaseSummary>>("/v1/admin/reports", { auth: true }),
    api<List<PaymentEventRow>>("/v1/admin/payment-events", { auth: true }),
  ]);
  const roles = me.ok ? me.data.roles.filter((r) => r === "admin" || r === "moderator").join(" + ") : "";

  return (
    <>
      <PageHeader eyebrow="admin" title="Moderation desk." description={roles ? <>Signed in with the {roles} role. Every decision here is recorded in the audit log.</> : undefined} />
      <section aria-labelledby="queues-title">
        <h2 id="queues-title" className="sr-only">
          Queues
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <CountTile
            label="Offers on hold"
            href="/admin/offers"
            hint="Held by staff after a report. Nothing arrives here by itself: offers are not reviewed before sale."
            {...count(offers, (o) => o.classification === "on_hold")}
          />
          <CountTile label="Restricted releases" href="/admin/releases" hint="Releases a moderation decision restricted." {...count(releases, (r) => r.review.status === "restricted")} />
          <CountTile label="Reports not closed" href="/admin/reports" hint="Received, under review, escalated or in appeal." {...count(reports, (c) => OPEN_CASES.has(c.status))} />
          <CountTile label="Failed payment events" href="/admin/payments" hint="In the events the API returned." {...count(payments, (p) => p.status === "failed")} />
        </div>
      </section>
    </>
  );
}
