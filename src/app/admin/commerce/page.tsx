import { SectionTitle } from "@/components/admin/parts";
import { PageHeader } from "@/components/dashboard/page-header";
import { ReadinessChecklist, StoreStaffNote, TebexStoreReadiness } from "@/components/dashboard/tebex-readiness";
import { ApiError, Banner, EmptyState } from "@/components/ui/feedback";
import { api } from "@/lib/api";
import type { CommerceReadiness } from "@/lib/contract";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Tebex readiness" };

/**
 * Platform-wide Tebex readiness (GET /v1/admin/commerce/readiness, admin only): this server's
 * settings, then every connected Tebex store. The checklist is computed, never asserted, and this
 * page has no action: a store needs no staff approval (ADR-0037). A store is suspended by deciding
 * a report about its seller. Go-live steps: docs/ops/TEBEX-GO-LIVE.md.
 */
export default async function CommerceReadinessPage() {
  const res = await api<CommerceReadiness>("/v1/admin/commerce/readiness", { auth: true });

  return (
    <>
      <PageHeader
        eyebrow="operations"
        title="Tebex readiness."
        description="What is configured and what is missing before creators can sell through their own Tebex stores. Computed from this server's settings and the webhooks it recorded. No secret is shown, and reading this page switches nothing on."
      />
      {!res.ok ? (
        <ApiError failure={res} title="The readiness check could not be loaded." />
      ) : (
        <div className="grid grid-cols-1 gap-10">
          <section aria-labelledby="platform-title">
            <SectionTitle id="platform-title">This server</SectionTitle>
            <p className="mt-1 text-[13.5px] text-ink-3">
              Environment settings of the API, read at {formatDateTime(res.data.generatedAt)}. Changing one means editing the environment and restarting the API.
            </p>
            <div className="mt-3">
              <ReadinessChecklist checks={res.data.platform.checks} summary={res.data.platform.summary} subject="this server" caption="Tebex readiness checks of this server" />
            </div>
            {res.data.platform.checks.some((c) => c.id === "checkout_flag" && c.status === "blocked") ? (
              <Banner tone="info" className="mt-4" title="Checkout through Tebex is off.">
                It stays off until Tebex approves SCRIPT//GO in writing. With that approval on file, the operator sets COMMERCE_CHECKOUT_ENABLED=true and restarts the API:
                every store whose own configuration is complete can then sell, with no approval by staff. To go back: set the flag to false. Licenses already issued keep
                working either way.
              </Banner>
            ) : null}
          </section>

          <section aria-labelledby="stores-title">
            <SectionTitle id="stores-title">Connected Tebex stores</SectionTitle>
            {res.data.stores.length === 0 ? (
              <EmptyState className="mt-3" title="No Tebex store is connected yet">
                A creator connects one from Dashboard, Stores. It then appears here with its own checklist.
              </EmptyState>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-8">
                {res.data.stores.map((s) => (
                  <article key={s.storeId} className="sticker p-5">
                    <TebexStoreReadiness readiness={s} headingId={`store-${s.storeId}`} showCreator>
                      <StoreStaffNote creator={s.creator} suspended={s.suspended} />
                    </TebexStoreReadiness>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
