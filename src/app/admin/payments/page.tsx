import { SectionTitle } from "@/components/admin/parts";
import { paymentEventMeta, signatureMeta } from "@/components/admin/status";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { api, asList } from "@/lib/api";
import type { OperationalError, PaymentEventRow } from "@/lib/contract";
import { formatDateTime, shortHash } from "@/lib/format";
import { metaFor } from "@/lib/status";

export const metadata = { title: "Payment events" };

const PROVIDERS: Record<string, string> = { tebex: "Tebex", mock: "Mock (sandbox)" };

export default async function PaymentsPage() {
  const [events, errors] = await Promise.all([
    api<PaymentEventRow[] | { items: PaymentEventRow[] }>("/v1/admin/payment-events", { auth: true }),
    api<OperationalError[] | { items: OperationalError[] }>("/v1/admin/errors", { auth: true }),
  ]);
  const rows = events.ok ? asList(events.data) : [];
  const errs = errors.ok ? asList(errors.data) : [];

  return (
    <>
      <PageHeader
        eyebrow="operations"
        title="Payment events."
        description="Provider webhooks as received. Licenses only change on a processed event with a valid signature, never on a checkout redirect."
      />

      <section aria-labelledby="events-title">
        <SectionTitle id="events-title">Webhook events</SectionTitle>
        {!events.ok ? (
          <ApiError className="mt-3" failure={events} title="Payment events could not be loaded." />
        ) : rows.length === 0 ? (
          <EmptyState className="mt-3" title="No payment events received yet" />
        ) : (
          <div className="panel mt-3 relative overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-[13.5px]">
              <caption className="sr-only">Payment provider webhook events</caption>
              <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                <tr>
                  <th scope="col" className="px-3 py-2.5">Received</th>
                  <th scope="col" className="px-3 py-2.5">Provider</th>
                  <th scope="col" className="px-3 py-2.5">Event</th>
                  <th scope="col" className="px-3 py-2.5">Type</th>
                  <th scope="col" className="px-3 py-2.5">Status</th>
                  <th scope="col" className="px-3 py-2.5">Signature</th>
                  <th scope="col" className="px-3 py-2.5">Occurred</th>
                  <th scope="col" className="px-3 py-2.5">Error</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id} className="border-t border-line-soft align-top">
                    <td className="tabular whitespace-nowrap px-3 py-2.5">
                      <time dateTime={e.receivedAt}>{formatDateTime(e.receivedAt)}</time>
                      {e.processedAt ? <span className="block text-[12px] text-ink-3">processed {formatDateTime(e.processedAt)}</span> : null}
                    </td>
                    <td className="px-3 py-2.5">{PROVIDERS[e.provider] ?? e.provider}</td>
                    <th scope="row" className="px-3 py-2.5 font-mono text-[12.5px] font-medium" title={e.eventId}>
                      {shortHash(e.eventId, 14)}
                    </th>
                    <td className="px-3 py-2.5 font-mono text-[12.5px]">{e.type}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge size="sm" meta={metaFor(paymentEventMeta, e.status)} />
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge size="sm" meta={signatureMeta[e.signatureValid ? "valid" : "invalid"]} />
                    </td>
                    <td className="tabular whitespace-nowrap px-3 py-2.5">{e.occurredAt ? formatDateTime(e.occurredAt) : "—"}</td>
                    <td className="max-w-[280px] break-words px-3 py-2.5 text-[13px] text-bad">{e.error ?? <span className="text-ink-3">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="errors-title" className="mt-10">
        <SectionTitle id="errors-title">Recent API errors</SectionTitle>
        <p className="mt-1 text-[13.5px] text-ink-3">Unexpected server errors (HTTP 500) recorded by the API, with the request reference users see.</p>
        {!errors.ok ? (
          <ApiError compact className="mt-3" failure={errors} title="API errors could not be loaded." />
        ) : errs.length === 0 ? (
          <p className="mt-3 text-[14px] text-ink-2">No server errors recorded.</p>
        ) : (
          <div className="panel mt-3 relative overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[13.5px]">
              <caption className="sr-only">Recent operational errors</caption>
              <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                <tr>
                  <th scope="col" className="px-3 py-2.5">Time</th>
                  <th scope="col" className="px-3 py-2.5">Route</th>
                  <th scope="col" className="px-3 py-2.5">Status</th>
                  <th scope="col" className="px-3 py-2.5">Code</th>
                  <th scope="col" className="px-3 py-2.5">Message</th>
                  <th scope="col" className="px-3 py-2.5">Reference</th>
                </tr>
              </thead>
              <tbody>
                {errs.map((e) => (
                  <tr key={e.id} className="border-t border-line-soft align-top">
                    <td className="tabular whitespace-nowrap px-3 py-2.5">{formatDateTime(e.at)}</td>
                    <th scope="row" className="px-3 py-2.5 font-mono text-[12.5px] font-medium">
                      {e.method} {e.route}
                    </th>
                    <td className="tabular px-3 py-2.5">{e.statusCode}</td>
                    <td className="px-3 py-2.5 font-mono text-[12.5px]">{e.code}</td>
                    <td className="max-w-[320px] break-words px-3 py-2.5">{e.message}</td>
                    <td className="break-all px-3 py-2.5 font-mono text-[12px]">{e.requestId ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
