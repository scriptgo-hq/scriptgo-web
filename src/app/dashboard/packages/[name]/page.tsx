import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Upload } from "lucide-react";
import { KeyActivityPanel } from "@/components/dashboard/key-activity";
import { OfferForm, PackageForm, WithdrawOfferButton } from "@/components/dashboard/package-forms";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { buttonClass, ButtonLink } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/data";
import { ApiError, Banner, EmptyState } from "@/components/ui/feedback";
import { Identifier } from "@/components/ui/typography";
import { api, asList } from "@/lib/api";
import type { CreatorPackageDetail, Environment, Provider, Store } from "@/lib/contract";
import { envName } from "@/lib/env";
import { formatBytes, formatDate, formatMoney, intervalLabel, shortHash } from "@/lib/format";
import { tierMeta } from "@/lib/protection";
import { classificationMeta, listingMeta, metaFor, releaseMeta, visibilityMeta } from "@/lib/status";

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return { title: name };
}

function H2({ id, children, action }: { id: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id={id} className="font-display text-[24px] font-extrabold tracking-[-0.02em]">
        {children}
      </h2>
      {action}
    </div>
  );
}

export default async function CreatorPackagePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const [res, envRes, storeRes] = await Promise.all([
    api<CreatorPackageDetail>(`/v1/creator/packages/${encodeURIComponent(name)}`, { auth: true }),
    api<Environment[]>("/v1/environments"),
    api<Store[]>("/v1/creator/stores", { auth: true }),
  ]);
  if (!res.ok) {
    if (res.status === 404) notFound();
    return <ApiError failure={res} title="This package couldn't be loaded." />;
  }
  const p = res.data;
  const envs = envRes.ok ? asList(envRes.data).filter((e) => e.status !== "planned") : [];
  const providers: Provider[] = storeRes.ok ? asList(storeRes.data).map((s) => s.provider) : [];
  const releases = [...p.releases].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const published = p.releases.some((r) => r.status === "published" || r.status === "deprecated");
  const publicHref = `/packages/${encodeURIComponent(p.creator.username)}/${encodeURIComponent(p.name)}`;
  const newRelease = `/dashboard/packages/${encodeURIComponent(p.name)}/releases/new`;
  const protectedReleases = p.releases.filter((r) => r.escrow);

  return (
    <>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: "Packages", href: "/dashboard/packages" }, { label: p.name }]} />}
        title={`${p.title}.`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Identifier value={p.identifier} />
            {p.visibility ? <StatusBadge meta={metaFor(visibilityMeta, p.visibility)} size="sm" /> : null}
            {p.listingStatus !== "active" ? <StatusBadge meta={metaFor(listingMeta, p.listingStatus)} size="sm" /> : null}
          </span>
        }
        actions={
          <>
            {published && p.visibility !== "private" ? (
              <Link href={publicHref} className={buttonClass("secondary", "md")}>
                <ExternalLink aria-hidden="true" size={16} /> Public page
              </Link>
            ) : null}
            <ButtonLink href={newRelease}>
              <Upload aria-hidden="true" size={16} /> New release
            </ButtonLink>
          </>
        }
      />

      {p.listingStatus !== "active" ? (
        <Banner
          tone={p.listingStatus === "suspended" ? "danger" : "warning"}
          title={p.listingStatus === "suspended" ? "This listing is suspended." : "This listing is restricted."}
          className="mb-8"
          action={<ButtonLink href="/dashboard/notices" size="sm" variant="secondary">Read the notice</ButtonLink>}
        >
          {metaFor(listingMeta, p.listingStatus).hint} The statement of reasons and the appeal form are in your notices.
        </Banner>
      ) : null}

      <div className="grid grid-cols-1 gap-12">
        <section aria-labelledby="rel-title">
          <H2 id="rel-title">Releases</H2>
          {releases.length === 0 ? (
            <EmptyState
              title="No releases yet"
              className="mt-4"
              action={
                <ButtonLink href={newRelease} size="sm">
                  Upload the first release
                </ButtonLink>
              }
            >
              Upload a zip of your resource, or run <span className="font-mono">scriptgo publish</span> from its folder.
            </EmptyState>
          ) : (
            <div className="panel mt-4 relative overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[14px]">
                <caption className="sr-only">Releases of {p.identifier}</caption>
                <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                  <tr>
                    <th scope="col" className="px-3 py-2.5">Version</th>
                    <th scope="col" className="px-3 py-2.5">Status</th>
                    <th scope="col" className="px-3 py-2.5">Checks</th>
                    <th scope="col" className="px-3 py-2.5">Uploaded</th>
                    <th scope="col" className="px-3 py-2.5">Archive</th>
                  </tr>
                </thead>
                <tbody>
                  {releases.map((r) => {
                    const req = r.checks.filter((c) => c.required);
                    const passed = req.filter((c) => c.status === "passed").length;
                    const failed = req.filter((c) => c.status === "failed").length;
                    return (
                      <tr key={r.id} className="border-t border-line-soft">
                        <th scope="row" className="px-3 py-2.5 font-normal">
                          <Link
                            href={`/dashboard/packages/${encodeURIComponent(p.name)}/releases/${encodeURIComponent(r.id)}`}
                            className="font-mono font-semibold text-cobalt-ink hover:underline"
                          >
                            {r.version}
                          </Link>
                        </th>
                        <td className="px-3 py-2.5">
                          <span className="flex flex-wrap gap-1">
                            <StatusBadge meta={metaFor(releaseMeta, r.status)} size="sm" />
                            {r.restricted ? <StatusBadge meta={listingMeta.restricted} size="sm" /> : null}
                            {r.escrow ? <StatusBadge meta={{ ...tierMeta.escrow, label: "Protected" }} size="sm" /> : null}
                          </span>
                        </td>
                        <td className="tabular px-3 py-2.5">
                          {req.length ? (
                            <>
                              {passed} of {req.length} required passed
                              {failed ? <span className="text-bad"> · {failed} failed</span> : null}
                            </>
                          ) : (
                            <span className="text-ink-3">none run</span>
                          )}
                        </td>
                        <td className="tabular px-3 py-2.5">{formatDate(r.createdAt)}</td>
                        <td className="tabular px-3 py-2.5 font-mono text-[12.5px]">
                          {formatBytes(r.size)} · {shortHash(r.sha256, 10)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {protectedReleases.length > 0 ? (
          <section aria-labelledby="keys-title">
            <H2 id="keys-title">Key releases</H2>
            <p className="mt-2 max-w-prose text-[14px] text-ink-2">
              {protectedReleases.length === 1 ? "One release is" : `${protectedReleases.length} releases are`} protected. A server asks for the
              key when it loads the package and again before each answer expires. This is what the key endpoint answered.
            </p>
            <KeyActivityPanel packageName={p.name} />
          </section>
        ) : null}

        <section aria-labelledby="off-title">
          <H2 id="off-title">Offers</H2>
          <p className="mt-2 max-w-prose text-[14px] text-ink-2">
            What people can get. Free offers need no checkout. Paid offers license your own original software, go through review, and are
            sold through your connected store.
          </p>
          {!storeRes.ok ? <ApiError compact className="mt-3" failure={storeRes} title="Your stores couldn't be checked." /> : null}
          {p.offers.length === 0 ? (
            <p className="mt-4 text-[14.5px] text-ink-3">No offers yet. Without an offer, the package can still be installed for free if it&rsquo;s public.</p>
          ) : (
            <div className="panel mt-4 relative overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-[14px]">
                <caption className="sr-only">Offers for {p.identifier}</caption>
                <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                  <tr>
                    <th scope="col" className="px-3 py-2.5">Offer</th>
                    <th scope="col" className="px-3 py-2.5">Price</th>
                    <th scope="col" className="px-3 py-2.5">Classification</th>
                    <th scope="col" className="px-3 py-2.5">Covers</th>
                    <th scope="col" className="px-3 py-2.5">Checkout</th>
                    <th scope="col" className="px-3 py-2.5"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {p.offers.map((o) => (
                    <tr key={o.id} className="border-t border-line-soft align-top">
                      <th scope="row" className="px-3 py-2.5 font-semibold">{o.name}</th>
                      <td className="tabular px-3 py-2.5">
                        {o.interval === "free" ? "Free" : `${formatMoney(o.price)} · ${intervalLabel(o.interval)}`}
                        {o.provider ? <span className="block text-[12.5px] text-ink-3">via {o.provider === "tebex" ? "Tebex" : "mock provider"}</span> : null}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge meta={metaFor(classificationMeta, o.classification)} size="sm" />
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="flex flex-wrap gap-1">
                          {o.environments.length ? o.environments.map((e) => <Tag key={e}>{envName(e)}</Tag>) : <span className="text-ink-2">All environments</span>}
                        </span>
                        <span className="tabular mt-1 block text-[12.5px] text-ink-3">
                          {o.deployments} {o.deployments === 1 ? "deployment" : "deployments"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[13.5px]">
                        {o.interval === "free" ? (
                          <span className="text-ink-3">Not needed</span>
                        ) : o.checkoutEnabled ? (
                          <span className="font-semibold text-ok">Open</span>
                        ) : (
                          <span className="text-ink-2">Off: {o.checkoutDisabledReason ?? "not available"}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <WithdrawOfferButton id={o.id} name={o.name} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            {envRes.ok ? (
              <OfferForm packageName={p.name} environments={envs.map((e) => ({ slug: e.slug, name: e.name }))} stores={providers} />
            ) : (
              <ApiError compact failure={envRes} title="New offers need the environment list, which couldn't be loaded." />
            )}
          </div>
        </section>

        <section aria-labelledby="det-title">
          <H2 id="det-title">Details</H2>
          <div className="panel mt-4 p-5">
            <PackageForm
              creator={p.creator.username}
              initial={{
                name: p.name,
                title: p.title,
                summary: p.summary,
                category: p.category,
                license: p.license,
                visibility: p.visibility ?? "public",
                repository: p.repository,
              }}
            />
          </div>
        </section>
      </div>
    </>
  );
}
