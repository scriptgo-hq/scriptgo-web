import { CircleCheck, CircleX } from "lucide-react";
import { ConnectStoreForm, TestEventButton } from "@/components/dashboard/store-forms";
import { PageHeader } from "@/components/dashboard/page-header";
import { TebexNotConnected, TebexStoreReadiness } from "@/components/dashboard/tebex-readiness";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { ApiError, Banner, EmptyState } from "@/components/ui/feedback";
import { api, type ApiResult } from "@/lib/api";
import type { Store, StoreReadiness } from "@/lib/contract";
import { formatDateTime, relativeTime } from "@/lib/format";
import { getMe } from "@/lib/session";
import { metaFor, storeMeta } from "@/lib/status";

export const metadata = { title: "Stores" };

const SYNC: Record<string, { label: string; cls: string }> = {
  synced: { label: "Synced", cls: "text-ok" },
  unverified: { label: "Not verified yet", cls: "text-warn" },
  error: { label: "Missing product id", cls: "text-bad" },
};

function StoreCard({ s, readiness }: { s: Store; readiness: ApiResult<StoreReadiness> | null }) {
  const name = s.provider === "tebex" ? "Tebex" : "Test provider";
  const testReason =
    s.provider !== "mock" ? "Tebex sends its own validation webhook; use its dashboard." : s.status === "sandbox" || s.status === "needs_attention" ? null : "Only sandbox stores accept test events.";
  return (
    <article className="sticker p-5" aria-labelledby={`store-${s.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id={`store-${s.id}`} className="font-display text-[22px] font-extrabold">
          {name}
        </h3>
        <StatusBadge meta={metaFor(storeMeta, s.status)} />
      </div>

      {s.status === "needs_attention" ? (
        <Banner tone="danger" className="mt-4" title="Webhook deliveries are failing.">
          Payments may not turn into licenses until this is fixed. Check the webhook URL and secret in your provider dashboard, then compare with
          the recent deliveries below.
        </Banner>
      ) : null}

      <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 text-[14px] sm:grid-cols-[10rem_minmax(0,1fr)]">
        <dt className="font-mono text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">Checkout</dt>
        <dd>
          {s.checkoutEnabled ? (
            <span className="inline-flex items-center gap-1 font-semibold text-ok">
              <CircleCheck aria-hidden="true" size={15} /> Open
            </span>
          ) : (
            <span className="inline-flex items-start gap-1">
              <CircleX aria-hidden="true" size={15} className="mt-0.5 shrink-0 text-ink-3" />
              <span>Off: {s.checkoutDisabledReason ?? "not available"}</span>
            </span>
          )}
        </dd>
        <dt className="font-mono text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">Approved</dt>
        <dd>{s.provider === "mock" ? "Not needed for the sandbox" : s.approved ? "Yes" : "Not yet"}</dd>
        <dt className="font-mono text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">Webhook URL</dt>
        <dd className="flex min-w-0 flex-wrap items-center gap-2">
          <code className="min-w-0 break-all rounded-md border-2 border-line-soft bg-surface-2 px-2 py-1 font-mono text-[12.5px]">{s.webhookUrl}</code>
          <CopyButton text={s.webhookUrl} label="Copy URL" tone="light" />
        </dd>
        <dt className="font-mono text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">Last 24 h</dt>
        <dd className="tabular">
          {s.webhook.deliveries24h} {s.webhook.deliveries24h === 1 ? "delivery" : "deliveries"} ·{" "}
          <span className={s.webhook.failures24h ? "font-semibold text-bad" : undefined}>{s.webhook.failures24h} failed</span>
          {" · "}last event{" "}
          {s.webhook.lastEventAt ? (
            <time dateTime={s.webhook.lastEventAt} title={formatDateTime(s.webhook.lastEventAt)}>
              {relativeTime(s.webhook.lastEventAt)}
            </time>
          ) : (
            "never"
          )}
        </dd>
      </dl>

      <div className="mt-4">
        <TestEventButton storeId={s.id} disabledReason={testReason} />
      </div>

      {readiness ? (
        <div className="mt-6">
          {readiness.ok ? (
            <TebexStoreReadiness readiness={readiness.data} headingId={`readiness-${s.id}`} />
          ) : (
            <ApiError compact failure={readiness} title="The readiness check of this store could not be loaded." />
          )}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">Products</p>
          {s.products.length === 0 ? (
            <p className="mt-2 text-[14px] text-ink-3">No paid offers use this store yet.</p>
          ) : (
            <div className="mt-2 relative overflow-x-auto rounded-[10px] border-2 border-line-soft">
              <table className="w-full min-w-[360px] text-left text-[13.5px]">
                <caption className="sr-only">Products mapped to offers</caption>
                <thead className="bg-surface-2 text-[11.5px] uppercase tracking-wide text-ink-3">
                  <tr>
                    <th scope="col" className="px-3 py-2">Provider product</th>
                    <th scope="col" className="px-3 py-2">Offer</th>
                    <th scope="col" className="px-3 py-2">Sync</th>
                  </tr>
                </thead>
                <tbody>
                  {s.products.map((p) => (
                    <tr key={`${p.offerId}-${p.providerProductId}`} className="border-t border-line-soft">
                      <td className="px-3 py-2 font-mono">{p.providerProductId || "—"}</td>
                      <td className="px-3 py-2 font-mono text-[12px] text-ink-3">{p.offerId}</td>
                      <td className={`px-3 py-2 font-semibold ${SYNC[p.syncStatus]?.cls ?? ""}`}>{SYNC[p.syncStatus]?.label ?? p.syncStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div>
          <p className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">Recent deliveries</p>
          {s.recentDeliveries.length === 0 ? (
            <p className="mt-2 text-[14px] text-ink-3">No webhook events received yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line-soft rounded-[10px] border-2 border-line-soft">
              {s.recentDeliveries.slice(0, 10).map((d) => (
                <li key={d.eventId} className="px-3 py-2 text-[13.5px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag>{d.status}</Tag>
                    <span className="font-mono">{d.type}</span>
                    <time dateTime={d.receivedAt} title={formatDateTime(d.receivedAt)} className="tabular ml-auto text-ink-3">
                      {relativeTime(d.receivedAt)}
                    </time>
                  </div>
                  {d.error ? <p className="mt-1 text-[13px] text-bad">{d.error}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function StoresPage() {
  const me = await getMe();
  if (!me.ok) return <ApiError failure={me} />;
  if (!me.data.creatorProfile) {
    return (
      <>
        <PageHeader eyebrow="publishing" title="Stores." />
        <EmptyState title="Stores belong to creators" action={<ButtonLink href="/dashboard/settings#creator">Create a creator profile</ButtonLink>} />
      </>
    );
  }
  const res = await api<Store[]>("/v1/creator/stores", { auth: true });
  const stores = res.ok ? res.data : [];
  // What is configured and what is missing, per Tebex store, computed by the API (never a secret).
  const readiness = new Map<string, ApiResult<StoreReadiness>>(
    await Promise.all(
      stores
        .filter((s) => s.provider === "tebex")
        .map(async (s) => [s.id, await api<StoreReadiness>(`/v1/creator/stores/${encodeURIComponent(s.id)}/readiness`, { auth: true })] as const),
    ),
  );
  return (
    <>
      <PageHeader
        eyebrow="publishing"
        title="Stores."
        description="SCRIPT//GO never takes payments itself. A store connects your account at a payment provider; its signed webhooks are what turn a payment into a license."
      />
      {!res.ok ? (
        <ApiError failure={res} title="Your stores couldn't be loaded." />
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {stores.length === 0 ? (
            <EmptyState title="No store connected">Paid offers need a store. Free offers work without one.</EmptyState>
          ) : (
            stores.map((s) => <StoreCard key={s.id} s={s} readiness={readiness.get(s.id) ?? null} />)
          )}
          {stores.some((s) => s.provider === "tebex") ? null : <TebexNotConnected />}
          <section aria-labelledby="connect-title" className="panel p-5">
            <h2 id="connect-title" className="font-display text-[22px] font-extrabold">
              {stores.length ? "Connect or update a store." : "Connect a store."}
            </h2>
            <p className="mt-1 max-w-prose text-[14px] text-ink-2">
              Tebex checkout stays off until Tebex approves SCRIPT//GO in writing; until then you can prepare products and test with the sandbox.
            </p>
            <div className="mt-4">
              {/* The API refuses mock stores with provider_disabled when the server turns the test provider off; the form shows that message. */}
              <ConnectStoreForm connected={stores.map((s) => s.provider)} mockAvailable />
            </div>
          </section>
        </div>
      )}
    </>
  );
}
