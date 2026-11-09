import Link from "next/link";
import { notFound } from "next/navigation";
import { AddDeploymentForm, DeactivateButton, LicenseKeyField } from "@/components/dashboard/license-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { SellerLine } from "@/components/package/seller-line";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { Breadcrumb, Meter } from "@/components/ui/data";
import { ApiError, Banner, EmptyState } from "@/components/ui/feedback";
import { Tabs } from "@/components/ui/tabs";
import { Identifier } from "@/components/ui/typography";
import { api } from "@/lib/api";
import type { LicenseDetail } from "@/lib/contract";
import { envLongName } from "@/lib/env";
import { formatDate, formatDateTime, intervalLabel, relativeTime } from "@/lib/format";
import { activationMeta, licenseMeta, metaFor } from "@/lib/status";

export const metadata = { title: "License" };

const SOURCE: Record<string, string> = { provider: "Provider event", user: "You", admin: "Administrator", system: "System" };

export default async function LicenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await api<LicenseDetail>(`/v1/me/licenses/${encodeURIComponent(id)}`, { auth: true });
  if (!res.ok) {
    if (res.status === 404) notFound();
    return <ApiError failure={res} title="This license could not be loaded." />;
  }
  const l = res.data;
  const live = l.status === "active" || l.status === "grace" || l.status === "cancelled_active";
  const full = l.deploymentsUsed >= l.deploymentsAllowed;
  const addReason = !live
    ? `This license is ${metaFor(licenseMeta, l.status).label.toLowerCase()}.`
    : full
      ? `All ${l.deploymentsAllowed} deployments are in use. Deactivate one to add another.`
      : null;
  const ident = l.package.identifier;
  const env = l.environments[0] ?? "standalone";

  const lua = `-- server/license.lua  (server side only; keep the key out of client scripts)
CreateThread(function()
  local result, code = ScriptGo.licensing.verify({
    licenseKey = GetConvar("${l.package.resourceName}_license_key", ""),
    package = "${ident}",
    environment = ScriptGo.runtime.environment(),
  })
  if not result then
    ScriptGo.log.error("License check could not run: " .. tostring(code))
    return
  end
  if not result.valid then
    ScriptGo.log.error("License check failed: " .. tostring(result.reason))
    return
  end
end)`;
  const curl = `curl -X POST "$SCRIPTGO_API/v1/licenses/verify" \\
  -H "content-type: application/json" \\
  -d '{
    "licenseKey": "'"$SCRIPTGO_LICENSE_KEY"'",
    "package": "${ident}",
    "environment": "${env}",
    "adapterVersion": null
  }'`;

  return (
    <>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: "Licenses", href: "/dashboard/licenses" }, { label: ident }]} />}
        title={`${l.package.title}.`}
        description={
          <span className="flex flex-col gap-1">
            <span>
              <Identifier value={ident} /> · {l.offer.name} · {intervalLabel(l.offer.interval)}
            </span>
            <SellerLine creator={l.seller.creator} provider={l.seller.provider} />
          </span>
        }
        actions={
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <StatusBadge meta={metaFor(licenseMeta, l.status)} />
            <span className="tabular text-[13px] text-ink-3">
              {l.status === "active" && l.currentPeriodEnd
                ? `renews ${formatDate(l.currentPeriodEnd)}`
                : l.currentPeriodEnd
                  ? `${live ? "active until" : "ended"} ${formatDate(l.currentPeriodEnd)}`
                  : ""}
            </span>
          </div>
        }
      />

      <div className="mb-8 space-y-3">
        {l.status === "grace" ? (
          <Banner tone="danger" title={`Payment failed. Active until ${formatDate(l.graceUntil ?? l.currentPeriodEnd)}.`}>
            Update your payment method with the provider. Deployments keep working until that date.
          </Banner>
        ) : null}
        {l.status === "cancelled_active" ? (
          <Banner tone="warning" title={`Cancelled. Active until ${formatDate(l.currentPeriodEnd)}.`}>
            After that date the license expires and deployments are blocked, after their offline grace period.
          </Banner>
        ) : null}
        {l.status === "expired" ? (
          <Banner tone="warning" title="Expired.">
            Deployments are blocked once their last signed token&rsquo;s offline grace runs out.
          </Banner>
        ) : null}
        {l.status === "revoked" ? (
          <Banner tone="danger" title="Revoked by SCRIPT//GO.">
            {l.revokedReason ? <>Reason: {l.revokedReason}. </> : null}
            Questions? Use the <Link href="/report" className="underline">contact form</Link> and quote this license.
          </Banner>
        ) : null}
        {l.status === "refunded" ? <Banner tone="info" title="Refunded. This license has ended." /> : null}
      </div>

      <div className="grid grid-cols-1 gap-10">
        <section aria-labelledby="key-title">
          <h2 id="key-title" className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">
            License key
          </h2>
          <div className="mt-3">
            <LicenseKeyField licenseId={l.id} preview={l.keyPreview} revealAvailable={l.keyRevealAvailable} disabledReason={live ? null : "the license is no longer active."} />
          </div>
          <p className="mt-3 text-[13.5px] font-semibold">Keep this key on your server. Never ship it inside client-side scripts.</p>
        </section>

        <section aria-labelledby="cov-title">
          <h2 id="cov-title" className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">
            Coverage
          </h2>
          <div className="panel mt-3 grid grid-cols-1 gap-4 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-[14px]">
                <span className="w-28 text-ink-3">Environments</span>
                {l.environments.length ? l.environments.map((e) => <Tag key={e}>{envLongName(e)}</Tag>) : <span>All declared environments</span>}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[14px]">
                <span className="w-28 text-ink-3">Deployments</span>
                <Meter used={l.deploymentsUsed} allowed={l.deploymentsAllowed} />
              </div>
            </div>
            <AddDeploymentForm licenseId={l.id} environments={l.environments.length ? l.environments : ["standalone"]} disabledReason={addReason} />
          </div>
        </section>

        <section aria-labelledby="dep-title">
          <h2 id="dep-title" className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">
            Deployments
          </h2>
          {l.activations.length === 0 ? (
            <EmptyState title="No deployments yet" className="mt-3">
              Add one above, or let your server call <code className="font-mono">/v1/licenses/activate</code> with the key.
            </EmptyState>
          ) : (
            <div className="panel mt-3 relative overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[14px]">
                <caption className="sr-only">Deployments of this license</caption>
                <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                  <tr>
                    <th scope="col" className="px-3 py-2.5">Name</th>
                    <th scope="col" className="px-3 py-2.5">Environment</th>
                    <th scope="col" className="px-3 py-2.5">Adapter</th>
                    <th scope="col" className="px-3 py-2.5">Last verified</th>
                    <th scope="col" className="px-3 py-2.5">Status</th>
                    <th scope="col" className="px-3 py-2.5"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {l.activations.map((a) => {
                    const graceLeft =
                      a.status === "offline_grace" && a.offlineGraceUntil
                        ? `· ${Math.max(0, Math.ceil((new Date(a.offlineGraceUntil).getTime() - Date.now()) / 86_400_000))} d left`
                        : undefined;
                    return (
                      <tr key={a.id} className="border-t border-line-soft">
                        <th scope="row" className="px-3 py-2.5 font-mono text-[13.5px] font-semibold">{a.name}</th>
                        <td className="px-3 py-2.5">{envLongName(a.environment)}</td>
                        <td className="tabular px-3 py-2.5 font-mono text-[13px]">{a.adapterVersion ?? "—"}</td>
                        <td className="tabular px-3 py-2.5">
                          {a.lastVerifiedAt ? (
                            <time dateTime={a.lastVerifiedAt} title={formatDateTime(a.lastVerifiedAt)}>
                              {relativeTime(a.lastVerifiedAt)}
                            </time>
                          ) : (
                            "never"
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusBadge meta={metaFor(activationMeta, a.status)} size="sm" suffix={graceLeft} />
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {a.status !== "deactivated" ? <DeactivateButton licenseId={l.id} activationId={a.id} name={a.name} /> : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section aria-labelledby="verify-title">
          <h2 id="verify-title" className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">
            Verify from your server
          </h2>
          <Tabs
            className="mt-3"
            variant="pill"
            label="Verify snippet language"
            items={[
              { id: "lua", label: "Lua", content: <CodeBlock className="mt-3" code={lua} lang="lua" filename="server/license.lua" /> },
              { id: "curl", label: "curl", content: <CodeBlock className="mt-3" code={curl} lang="bash" filename="POST /v1/licenses/verify" /> },
            ]}
          />
          <p className="mt-3 text-[13px] text-ink-3">
            The answer carries a short-lived signed token, so a deployment keeps running through brief outages.{" "}
            <Link href="/docs/licensing-api" className="font-semibold text-cobalt-ink underline">Licensing API</Link>
          </p>
        </section>

        <section aria-labelledby="hist-title">
          <h2 id="hist-title" className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">
            History
          </h2>
          {l.history.length === 0 ? (
            <p className="mt-3 text-[14px] text-ink-3">No events yet.</p>
          ) : (
            <ol className="panel mt-3 divide-y divide-line-soft">
              {l.history.map((h, i) => (
                <li key={`${h.at}-${i}`} className="grid grid-cols-1 gap-1 px-4 py-2.5 text-[14px] sm:grid-cols-[190px_minmax(0,1fr)_minmax(0,auto)]">
                  <time dateTime={h.at} className="tabular text-ink-3">
                    {formatDateTime(h.at)}
                  </time>
                  <span className="font-semibold">{h.event}</span>
                  <span className="text-ink-2 sm:text-right">
                    {SOURCE[h.source] ?? h.source}
                    {h.reference ? <span className="ml-1 break-all font-mono text-[12px] text-ink-3">{h.reference}</span> : null}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}
