import Link from "next/link";
import { notFound } from "next/navigation";
import { AddDeploymentForm, DeactivateButton, LicenseKeyField, ResetServerKeyButton } from "@/components/dashboard/license-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { SellerLine } from "@/components/package/seller-line";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Breadcrumb, Meter } from "@/components/ui/data";
import { ApiError, Banner, EmptyState } from "@/components/ui/feedback";
import { Tabs } from "@/components/ui/tabs";
import { Identifier } from "@/components/ui/typography";
import { api, asList } from "@/lib/api";
import type { Environment, LicenseDetail, PackageDetail } from "@/lib/contract";
import { envLongName } from "@/lib/env";
import { formatDate, formatDateTime, intervalLabel, relativeTime } from "@/lib/format";
import { buyerProtection, formatFingerprint, protectionMeta } from "@/lib/protection";
import { activationMeta, licenseMeta, metaFor } from "@/lib/status";

export const metadata = { title: "License" };

const SOURCE: Record<string, string> = { provider: "Provider event", user: "You", admin: "Administrator", system: "System", creator: "Creator" };

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
  // Granted for free by the package's creator (ADR-0036): no offer, no payment provider.
  const granted = l.origin.source === "creator";

  // The protected release this license opens, if the package has one, and what each environment gives.
  const [creatorName, packageName] = ident.split("//");
  const [pkgRes, envRes] = await Promise.all([
    api<PackageDetail>(`/v1/packages/${encodeURIComponent(creatorName ?? "")}/${encodeURIComponent(packageName ?? "")}`, { auth: true }),
    api<Environment[]>("/v1/environments"),
  ]);
  const version = pkgRes.ok ? (pkgRes.data.versions.find((v) => v.version === pkgRes.data.latestVersion) ?? null) : null;
  const escrow = version?.escrow ?? null;
  const allEnvs = envRes.ok ? asList(envRes.data) : [];
  const covered = (l.environments.length ? l.environments : (pkgRes.ok ? (pkgRes.data.manifest?.environments ?? []) : [])).map((slug) => allEnvs.find((e) => e.slug === slug)).filter((e): e is Environment => Boolean(e));
  const bundleHref = version ? `/v1/packages/${encodeURIComponent(creatorName ?? "")}/${encodeURIComponent(packageName ?? "")}/versions/${encodeURIComponent(version.version)}/download` : null;
  const bundleFile = `resources/${l.package.resourceName}-${version?.version ?? "x.y.z"}.escrow.zip`;
  const loaderSnippet = (e: Environment): { code: string; filename: string } => {
    const inMemory = e.protection.tier === "escrow" && e.protection.state === "available";
    const common = [`scriptgo add ${ident}        # saves ${bundleFile}, signature checked`, ""];
    if (inMemory && e.slug === "dotnet") {
      return {
        filename: "on the server: the .NET kit decrypts in memory",
        code: [
          ...common,
          "# The kit's example host. Your own host calls ScriptGo.Host.Escrow.EscrowLoader.LoadAsync the same way.",
          "dotnet run --project sdk/examples/custom-adapter-dotnet -- \\",
          `  --bundle ${bundleFile} --master "$SCRIPTGO_API" \\`,
          `  --deployment-token "$SCRIPTGO_DEPLOYMENT_TOKEN" --package ${ident} --environment ${e.slug} \\`,
          `  --trusted-signer ${escrow?.signerPublicKey ?? "<signer key>"} --identity ./server-identity.json`,
        ].join("\n"),
      };
    }
    return {
      filename: "on the server: reference loader, licence-only (the copy is written to disk)",
      code: [
        ...common,
        "# Reference loader, not a compiled host: it writes the decrypted copy to disk on this server.",
        "scriptgo escrow load \\",
        `  --bundle ${bundleFile} --package ${ident} --environment ${e.slug} \\`,
        `  --deployment-token "$SCRIPTGO_DEPLOYMENT_TOKEN" --identity ./server-identity.json \\`,
        `  --trusted-signer ${escrow?.signerPublicKey ?? "<signer key>"} --once --out resources/${l.package.resourceName}`,
      ].join("\n"),
    };
  };

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
              <Identifier value={ident} />
              {l.offer ? (
                <>
                  {" "}
                  · {l.offer.name} · {intervalLabel(l.offer.interval)}
                </>
              ) : null}
            </span>
            {granted ? (
              <span className="text-[13px] text-ink-2" data-license-origin="creator">
                {l.origin.recipient === "server_key" ? (
                  <>
                    Granted by you to a server key. You hold this license for the operator of that server.{" "}
                  </>
                ) : (
                  <>
                    Granted by <strong className="text-ink">{l.origin.grantedBy ?? l.seller.creator}</strong>.{" "}
                  </>
                )}
                A free license: nothing was sold and no payment provider is involved. License issued by <strong className="text-ink">SCRIPT//GO</strong>.
              </span>
            ) : (
              <SellerLine creator={l.seller.creator} provider={l.seller.provider} />
            )}
          </span>
        }
        actions={
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <StatusBadge meta={metaFor(licenseMeta, l.status)} />
            <span className="tabular text-[13px] text-ink-3">
              {l.status === "active" && l.currentPeriodEnd
                ? `${granted ? "ends" : "renews"} ${formatDate(l.currentPeriodEnd)}`
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
          l.revokedBy === "creator" ? (
            <Banner tone="danger" title={`Revoked by ${l.origin.grantedBy ?? l.seller.creator}, the creator who granted it.`}>
              {l.revokedReason ? <>Reason: {l.revokedReason}. </> : null}
              The key is refused from now on; a server that is running stops when its offline grace ends.
            </Banner>
          ) : (
            <Banner tone="danger" title="Revoked by SCRIPT//GO.">
              {l.revokedReason ? <>Reason: {l.revokedReason}. </> : null}
              Questions? Use the <Link href="/report" className="underline">contact form</Link> and quote this license.
            </Banner>
          )
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
              <table className="w-full min-w-[980px] text-left text-[14px]">
                <caption className="sr-only">Deployments of this license</caption>
                <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                  <tr>
                    <th scope="col" className="px-3 py-2.5">Name</th>
                    <th scope="col" className="px-3 py-2.5">Environment</th>
                    <th scope="col" className="px-3 py-2.5">Adapter</th>
                    <th scope="col" className="px-3 py-2.5">Last verified</th>
                    <th scope="col" className="px-3 py-2.5">Server key</th>
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
                        <td className="px-3 py-2.5" data-binding={a.binding.bound ? "bound" : "unbound"}>
                          {a.binding.bound ? (
                            <>
                              <span className="font-mono text-[13px]" title="Fingerprint of the server key this deployment is bound to">
                                {formatFingerprint(a.binding.serverKeyFingerprint)}
                              </span>
                              <span className="tabular block text-[12.5px] text-ink-3">
                                bound {a.binding.boundAt ? formatDate(a.binding.boundAt) : "at activation"}
                                {a.binding.lastKeyReleaseAt ? (
                                  <>
                                    {" · "}key released{" "}
                                    <time dateTime={a.binding.lastKeyReleaseAt} title={formatDateTime(a.binding.lastKeyReleaseAt)}>
                                      {relativeTime(a.binding.lastKeyReleaseAt)}
                                    </time>
                                  </>
                                ) : (
                                  " · no key released yet"
                                )}
                              </span>
                            </>
                          ) : (
                            <span className="text-ink-3">
                              Not bound yet
                              {a.binding.resets > 0 ? <span className="block text-[12.5px]">reset {a.binding.lastResetAt ? relativeTime(a.binding.lastResetAt) : ""}</span> : null}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusBadge meta={metaFor(activationMeta, a.status)} size="sm" suffix={graceLeft} />
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {a.status !== "deactivated" ? (
                            <span className="inline-flex flex-col items-end gap-1.5">
                              {a.binding.bound ? <ResetServerKeyButton licenseId={l.id} activationId={a.id} name={a.name} /> : null}
                              <DeactivateButton licenseId={l.id} activationId={a.id} name={a.name} />
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {escrow && version ? (
          <section aria-labelledby="escrow-title" data-protected-release={version.version}>
            <h2 id="escrow-title" className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">
              Protected release
            </h2>
            <div className="panel mt-3 space-y-3 p-4 text-[14.5px]">
              <p>
                <strong className="font-mono">{version.version}</strong> is delivered as an encrypted bundle. It opens only on a server that
                holds one of the deployment tokens above and the key pair bound to it. The key is released for a short time and asked for
                again; after {granted ? "a revocation by the creator or by SCRIPT//GO" : "a refund or a revocation"} the next request is refused and the server stops when its offline grace ends.
              </p>
              <dl className="grid grid-cols-1 gap-y-1 text-[14px] sm:grid-cols-[10rem_minmax(0,1fr)]">
                <dt className="text-ink-3">Signed by</dt>
                <dd>
                  <span className="font-mono text-[13px]">{formatFingerprint(escrow.signerKeyId)}</span>{" "}
                  <span className="text-ink-2">({l.seller.creator}&rsquo;s escrow key)</span>
                </dd>
                <dt className="text-ink-3">Readable files</dt>
                <dd className="font-mono text-[13px]">{escrow.clearFiles.join(", ")}</dd>
                <dt className="text-ink-3">Encrypted</dt>
                <dd className="tabular">
                  {escrow.encryptedFiles.length} {escrow.encryptedFiles.length === 1 ? "file" : "files"} ({escrow.cipher})
                </dd>
              </dl>
              <div className="flex flex-wrap items-center gap-3">
                {live && bundleHref ? (
                  <a href={bundleHref} className={buttonClass("secondary", "sm")} data-bundle-download>
                    Download the encrypted bundle
                  </a>
                ) : (
                  <span className="text-[13.5px] text-ink-3">The bundle is delivered while the license is active.</span>
                )}
                <span className="text-[13px] text-ink-3">The plain archive is never delivered. The bundle is useless without your server&rsquo;s key.</span>
              </div>
              <p className="text-[13px] text-ink-2">
                A copy that leaves your server carries a marker tied to this license and deployment. Moving or re-installing a server changes
                its key: use &ldquo;Reset server key&rdquo; on its row, then start it again.
              </p>
            </div>
            {covered.length > 0 ? (
              <Tabs
                className="mt-4"
                variant="pill"
                label="Loader per environment"
                items={covered.map((e) => {
                  const what = buyerProtection(e.protection, true);
                  const snip = loaderSnippet(e);
                  return {
                    id: `loader-${e.slug}`,
                    label: envLongName(e.slug),
                    content: (
                      <div className="mt-3 space-y-3">
                        <p className="flex flex-wrap items-center gap-2 text-[14px]">
                          <StatusBadge meta={protectionMeta(e.protection)} size="sm" />
                          <span>{what.sentence}</span>
                        </p>
                        {e.protection.tier === "none" ? null : <CodeBlock code={snip.code} lang="bash" filename={snip.filename} />}
                      </div>
                    ),
                  };
                })}
              />
            ) : null}
          </section>
        ) : null}

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
