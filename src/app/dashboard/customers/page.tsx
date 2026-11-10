import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Meter } from "@/components/ui/data";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { Identifier } from "@/components/ui/typography";
import { api } from "@/lib/api";
import type { CustomerRow } from "@/lib/contract";
import { formatDate, formatMoney, intervalLabel } from "@/lib/format";
import { getMe } from "@/lib/session";
import { licenseMeta, metaFor } from "@/lib/status";

export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const me = await getMe();
  if (!me.ok) return <ApiError failure={me} />;
  if (!me.data.creatorProfile) {
    return (
      <>
        <PageHeader eyebrow="publishing" title="Customers." />
        <EmptyState title="Customers belong to creators" action={<ButtonLink href="/dashboard/settings#creator">Create a creator profile</ButtonLink>} />
      </>
    );
  }
  const res = await api<CustomerRow[]>("/v1/creator/customers", { auth: true });
  return (
    <>
      <PageHeader
        eyebrow="publishing"
        title="Customers."
        description="Licenses issued for your packages: sold through your offers, or granted by you for free. You see a username, never an email or payment details: those stay with the payment provider."
      />
      {!res.ok ? (
        <ApiError failure={res} title="Your customers couldn't be loaded." />
      ) : res.data.length === 0 ? (
        <EmptyState title="No customers yet">Licenses appear here once a payment provider confirms a purchase, or when you grant a free license to an account from a package&rsquo;s page.</EmptyState>
      ) : (
        <div className="panel relative overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[14px]">
            <caption className="sr-only">Licenses issued for your packages</caption>
            <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
              <tr>
                <th scope="col" className="px-3 py-2.5">Customer</th>
                <th scope="col" className="px-3 py-2.5">Package</th>
                <th scope="col" className="px-3 py-2.5">Offer</th>
                <th scope="col" className="px-3 py-2.5">Status</th>
                <th scope="col" className="px-3 py-2.5">Deployments</th>
                <th scope="col" className="px-3 py-2.5">Since</th>
                <th scope="col" className="px-3 py-2.5">Period end</th>
              </tr>
            </thead>
            <tbody>
              {res.data.map((r) => (
                <tr key={r.license.id} className="border-t border-line-soft">
                  <th scope="row" className="px-3 py-2.5 font-mono text-[13.5px] font-semibold">{r.customer.username}</th>
                  <td className="px-3 py-2.5">
                    <Identifier value={r.package.identifier} />
                  </td>
                  <td className="tabular px-3 py-2.5" data-license-source={r.source}>
                    {r.offer ? (
                      <>
                        {r.offer.name}
                        <span className="block text-[12.5px] text-ink-3">
                          {r.offer.interval === "free" ? "Free" : `${formatMoney(r.offer.price)} · ${intervalLabel(r.offer.interval)}`}
                        </span>
                      </>
                    ) : (
                      <>
                        Granted by you
                        <span className="block text-[12.5px] text-ink-3">Free · no payment</span>
                      </>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge meta={metaFor(licenseMeta, r.license.status)} size="sm" />
                  </td>
                  <td className="px-3 py-2.5">
                    <Meter used={r.license.deploymentsUsed} allowed={r.license.deploymentsAllowed} />
                  </td>
                  <td className="tabular px-3 py-2.5">{formatDate(r.license.createdAt)}</td>
                  <td className="tabular px-3 py-2.5">{r.license.currentPeriodEnd ? formatDate(r.license.currentPeriodEnd) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
