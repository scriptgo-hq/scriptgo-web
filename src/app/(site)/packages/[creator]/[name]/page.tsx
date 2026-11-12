import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Download, Flag, ScrollText } from "lucide-react";
import { categoryLabel } from "@/components/illustrations";
import { ReadMore } from "@/components/site/diagrams";
import { CategoryArt } from "@/components/site/world-art";
import { CheckoutControl } from "@/components/package/checkout-control";
import { CompatStrip, EvidencePanel, sortCompat } from "@/components/package/compat-strip";
import { AssetContents } from "@/components/package/asset-contents";
import { ProtectionPanel, ReleaseProtectionBadges } from "@/components/package/protection-panel";
import { anyEncrypted, protectionOf } from "@/lib/release-protection";
import { SellerLine } from "@/components/package/seller-line";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { CommandLine } from "@/components/ui/code-block";
import { Breadcrumb, KeyValue } from "@/components/ui/data";
import { ApiError, Banner, EmptyState } from "@/components/ui/feedback";
import { CreatorLine } from "@/components/ui/package";
import { Popover } from "@/components/ui/popover";
import { Prose } from "@/components/ui/prose";
import { Tabs } from "@/components/ui/tabs";
import { Eyebrow, Identifier } from "@/components/ui/typography";
import { api, API_URL, qs } from "@/lib/api";
import type { EnvironmentDetail, Offer, PackageDetail } from "@/lib/contract";
import { dialectLabel, envLongName } from "@/lib/env";
import { formatBytes, formatCount, formatDate, formatMoney, intervalLabel, intervalSuffix, relativeTime } from "@/lib/format";
import { platformDocHref } from "@/lib/docs";
import { renderMarkdown } from "@/lib/markdown";
import { hasSessionCookie } from "@/lib/session";
import { classificationMeta, compatibilityMeta, listingMeta, metaFor, releaseMeta } from "@/lib/status";

type Params = { creator: string; name: string };
type SP = { version?: string | string[] };

async function load(params: Params, version?: string) {
  return api<PackageDetail>(
    `/v1/packages/${encodeURIComponent(params.creator)}/${encodeURIComponent(params.name)}${qs({ version })}`,
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = await params;
  const res = await load(p);
  if (!res.ok) return { title: `${p.creator}//${p.name}` };
  return { title: `${res.data.title} (${res.data.identifier})`, description: res.data.summary };
}

export default async function PackagePage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<SP> }) {
  const p = await params;
  const sp = await searchParams;
  const requested = Array.isArray(sp.version) ? sp.version[0] : sp.version;
  const res = await load(p, requested);
  if (!res.ok) {
    if (res.status === 404) notFound();
    return (
      <div className="container-page py-12">
        <Breadcrumb items={[{ label: "Explore", href: "/explore" }, { label: p.creator }, { label: p.name }]} />
        <ApiError failure={res} className="mt-6" title="This package could not be loaded." />
      </div>
    );
  }
  const d = res.data;
  const signedIn = await hasSessionCookie();
  const viewing = d.viewingVersion ?? d.latestVersion;
  const viewingRow = d.versions.find((v) => v.version === viewing) ?? null;
  const compat = d.compatibility.filter((c) => !viewing || c.version === viewing);
  const href = `/packages/${encodeURIComponent(d.creator.username)}/${encodeURIComponent(d.name)}`;
  const readme = d.readme ? await renderMarkdown(d.readme, { trusted: false }) : null;
  const declaredEnvs = Array.from(new Set([...(d.manifest?.environments ?? []), ...compat.map((c) => c.environment)]));
  const envDetails = await Promise.all(
    declaredEnvs.slice(0, 8).map(async (slug) => {
      const r = await api<EnvironmentDetail>(`/v1/environments/${encodeURIComponent(slug)}`, { timeoutMs: 4000 });
      // Setup steps live on the platform's docs page; the package page links there.
      return { slug, detail: r.ok ? r.data : null, docs: r.ok && r.data.status !== "planned" ? platformDocHref(slug, r.data.adapterState !== "none") : null };
    }),
  );
  const freeOffers = d.offers.filter((o) => o.interval === "free" || o.classification === "free");
  const paidOffers = d.offers.filter((o) => !freeOffers.includes(o));
  const blockedDownload = d.listingStatus !== "active" || viewingRow?.restricted || viewingRow?.status === "yanked";
  const installCmd = `scriptgo add ${d.identifier}${viewing && viewing !== d.latestVersion ? `@${viewing}` : ""}`;
  const escrowed = Boolean(viewingRow?.escrow);
  const protection = viewingRow ? protectionOf(viewingRow) : null;
  const assets = viewingRow?.assets ?? null;
  const protectionEnvs = envDetails.map(({ slug, detail }) => ({ slug, name: envLongName(slug, detail?.name), protection: detail?.protection ?? null, platformRules: detail?.platformRules ?? null, platformRulesNote: detail?.platformRulesNote ?? "" }));
  const downloadPath = viewing ? `/v1/packages/${encodeURIComponent(d.creator.username)}/${encodeURIComponent(d.name)}/versions/${encodeURIComponent(viewing)}/download` : null;

  return (
    <div className="container-page pb-16 pt-8">
      <Breadcrumb
        items={[{ label: "Explore", href: "/explore" }, { label: d.creator.username, href: `/creators/${encodeURIComponent(d.creator.username)}` }, { label: d.name }]}
      />

      <div className="mt-4 space-y-3">
        {d.listingStatus === "restricted" ? (
          <Banner tone="warning" title="This listing is restricted.">
            It stays visible with this notice, but it can&rsquo;t be downloaded or purchased while a moderation decision applies.
          </Banner>
        ) : null}
        {d.isDemo ? (
          <Banner tone="info" title="Example data.">
            This package is development demo data, flagged by the API. It does not represent real activity.
          </Banner>
        ) : null}
        {viewing && d.latestVersion && viewing !== d.latestVersion ? (
          <Banner tone="info" title={`You're viewing ${viewing}. Latest is ${d.latestVersion}.`} action={<Link className="font-bold text-cobalt-ink underline" href={href}>View latest</Link>} />
        ) : null}
        {viewingRow?.status === "deprecated" ? (
          <Banner tone="warning" title={`${viewingRow.version} is deprecated.`}>
            It still installs, but the creator recommends a newer release.
          </Banner>
        ) : null}
        {viewingRow?.status === "yanked" ? (
          <Banner tone="danger" title={`${viewingRow.version} was yanked.`}>
            The creator withdrew this release. It can&rsquo;t be installed.
          </Banner>
        ) : null}
        {viewingRow?.restricted ? (
          <Banner tone="warning" title={`${viewingRow.version} is restricted by moderation.`}>
            It is visible with this notice and not downloadable.
          </Banner>
        ) : null}
      </div>

      <div className="mt-6 grid gap-x-11 gap-y-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Header */}
        <header className="min-w-0 lg:col-start-1">
          <div className="mr-[9px] aspect-[16/9] border-[2.5px] border-line bg-paper-2 shadow-[9px_9px_0_0_var(--cobalt)] max-sm:shadow-[6px_6px_0_0_var(--cobalt)]">
            <CategoryArt category={d.category} eager />
          </div>
          <div className="mt-10 min-w-0">
            <Eyebrow className="mb-[18px]">{categoryLabel(d.category)}</Eyebrow>
            <h1 className="display text-[clamp(34px,4vw,52px)]">{d.title}</h1>
            <p className="mt-2.5 text-[14.5px] text-ink-2">
              <Identifier value={d.identifier} className="font-semibold text-ink" />
            </p>
          </div>
          <p className="lede mt-4 !max-w-[60ch] text-ink-2">{d.summary}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13.5px]">
            <CreatorLine creator={d.creator} />
            {viewing ? (
              <span className="tabular font-mono">
                v{viewing}
                {viewingRow?.publishedAt ? (
                  <span className="font-sans text-ink-3" title={formatDate(viewingRow.publishedAt)}>
                    {" "}
                    · released {relativeTime(viewingRow.publishedAt)}
                  </span>
                ) : null}
              </span>
            ) : (
              <span className="text-ink-3">No release yet</span>
            )}
            <Tag>{d.license}</Tag>
            <Tag>{categoryLabel(d.category)}</Tag>
            <span className="tabular text-ink-3">{formatCount(d.downloads)} downloads</span>
          </div>
          <div className="mt-6">
            <h2 className="label mb-2.5">
              Runs on{viewing ? ` · ${viewing}` : ""}
            </h2>
            <CompatStrip entries={compat} />
          </div>
        </header>

        {/* Right rail: Get it */}
        <aside aria-label="Get it" className="space-y-8 lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <div className="sticker space-y-4 p-5" style={{ "--plate": "var(--sun)" } as React.CSSProperties}>
            <h2 className="display text-[28px]">Get it.</h2>
            {!viewing ? (
              <p className="text-[14px] text-ink-2">No release has been published yet, so there is nothing to install.</p>
            ) : blockedDownload ? (
              <p className="text-[14px] text-ink-2">Downloads are unavailable for this release (see the notice above).</p>
            ) : (
              <div className="space-y-2">
                {freeOffers.length > 0 || paidOffers.length === 0 ? (
                  <p className="text-[13px] font-semibold text-ok">
                    {paidOffers.length > 0 ? "Free tier included." : "Free to install."}
                  </p>
                ) : null}
                <CommandLine command={installCmd} />
                {escrowed ? (
                  <p className="text-[13px] text-ink-2">
                    Protected release: delivered as an encrypted bundle, to licence holders.{" "}
                    <Link href="#protection" className="font-semibold text-cobalt-ink underline">
                      What your server gets
                    </Link>
                  </p>
                ) : protection && anyEncrypted(protection) ? (
                  <p className="text-[13px] text-ink-2" data-encrypted-parts>
                    {protection.clientCode && protection.assets
                      ? "Its client scripts and assets are encrypted for each licensed server."
                      : protection.clientCode
                        ? "Its client scripts are encrypted for each licensed server."
                        : "Its assets are encrypted for each licensed server."}{" "}
                    <Link href="#protection" className="font-semibold text-cobalt-ink underline">
                      What it protects
                    </Link>
                  </p>
                ) : null}
                {assets ? (
                  <p className="text-[13px] text-ink-2" data-assets-rail>
                    Includes assets: each licence holder downloads their own fingerprinted copy.{" "}
                    <Link href="#contents" className="font-semibold text-cobalt-ink underline">
                      What it contains
                    </Link>
                  </p>
                ) : null}
              </div>
            )}
            {paidOffers.length > 0 && d.listingStatus === "active" ? (
              <CheckoutControl offers={paidOffers} signedIn={signedIn} returnTo={href} />
            ) : null}
            {paidOffers.length > 0 || d.seller.provider ? (
              <SellerLine creator={d.creator.displayName || d.seller.creator} provider={d.seller.provider} className="border-t-2 border-dashed border-line-soft pt-3 text-[13.5px] text-ink-2" />
            ) : null}
          </div>
          <div className="sticker p-5" style={{ "--plate": "var(--cobalt)" } as React.CSSProperties}>
            <KeyValue
              labelWidth="5.5rem"
              items={[
                {
                  label: "Needs",
                  value: d.capabilities.length ? (
                    <span className="flex flex-wrap gap-1">
                      {d.capabilities.map((c) => (
                        <Tag key={c} mono>
                          {c}
                        </Tag>
                      ))}
                    </span>
                  ) : (
                    "No required capabilities"
                  ),
                },
                ...(d.manifest?.optionalCapabilities?.length
                  ? [
                      {
                        label: "Optional",
                        value: (
                          <span className="flex flex-wrap gap-1">
                            {d.manifest.optionalCapabilities.map((c) => (
                              <Tag key={c} mono>
                                {c}
                              </Tag>
                            ))}
                          </span>
                        ),
                      },
                    ]
                  : []),
                {
                  label: "Lua",
                  value: d.manifest?.lua?.length ? d.manifest.lua.map(dialectLabel).join(" · ") : "Not declared",
                },
                {
                  label: "Rights",
                  value: d.rights ? (
                    <Link href="#rights" className="font-semibold text-cobalt-ink underline-offset-2 hover:underline">
                      Declared {formatDate(d.rights.declaredAt)}
                    </Link>
                  ) : (
                    "Not declared yet"
                  ),
                },
              ]}
            />
            <Link
              href={`/report?package=${encodeURIComponent(d.identifier)}${viewing ? `&version=${encodeURIComponent(viewing)}` : ""}`}
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-2 underline-offset-2 hover:text-ink hover:underline"
            >
              <Flag aria-hidden="true" size={14} />
              Report this package
            </Link>
          </div>
        </aside>

        {/* Tabs */}
        <div className="min-w-0 lg:col-start-1">
          <Tabs
            label="Package sections"
            hashSync
            items={[
              {
                id: "overview",
                label: "Overview",
                content: (
                  <div className="pt-6">
                    {readme ? <Prose html={readme.html} /> : <EmptyState icon={ScrollText} title="No README">The creator hasn&rsquo;t published a README for this release.</EmptyState>}
                  </div>
                ),
              },
              {
                id: "install",
                label: "Install",
                content: (
                  <div className="space-y-6 pt-6">
                    {!viewing || blockedDownload ? (
                      <EmptyState title="Nothing to install">
                        {!viewing ? "No release has been published yet." : "This release is not downloadable."}
                      </EmptyState>
                    ) : (
                      <>
                        <section className="space-y-2">
                          <h3 className="font-display text-[19px] font-extrabold">With the CLI</h3>
                          <CommandLine command={installCmd} />
                        </section>
                        <section className="space-y-2">
                          <h3 className="font-display text-[19px] font-extrabold">Manual download</h3>
                          <p className="text-[14.5px] text-ink-2">
                            {escrowed ? "Encrypted bundle" : "Zip"} of {viewing}
                            {viewingRow ? ` · ${formatBytes(viewingRow.size)}` : ""}.{" "}
                            {assets
                              ? "Your own copy, fingerprinted to your licence: sign in with the account that holds it. Its SHA-256 is your copy's, sent with the download."
                              : "Check the SHA-256 before unpacking."}
                            {escrowed
                              ? " The download needs a licence: sign in with the account that holds it. The bundle only opens on a server bound to that licence."
                              : ""}
                          </p>
                          {downloadPath ? (
                            <a
                              href={downloadPath}
                              className="btn btn-secondary"
                            >
                              <Download aria-hidden="true" size={16} /> Download {d.resourceName}-{viewing}{escrowed ? ".escrow" : ""}.zip
                            </a>
                          ) : null}
                          {viewingRow?.sha256 && !assets ? (
                            <p className="break-all font-mono text-[12.5px] text-ink-2">
                              <span className="text-ink-3">sha256 </span>
                              {viewingRow.sha256}
                            </p>
                          ) : null}
                        </section>
                        {envDetails.some((x) => x.docs) ? (
                          <section className="space-y-3">
                            <h3 className="font-display text-[19px] font-extrabold">Set it up</h3>
                            <ul className="flex flex-wrap gap-x-6 gap-y-2">
                              {envDetails
                                .filter((x) => x.docs)
                                .map(({ slug, detail, docs }) => (
                                  <li key={slug}>
                                    <ReadMore href={docs!} className="!text-[14.5px]">
                                      On {envLongName(slug, detail?.name)}
                                    </ReadMore>
                                  </li>
                                ))}
                            </ul>
                          </section>
                        ) : null}
                      </>
                    )}
                  </div>
                ),
              },
              ...(assets
                ? [
                    {
                      id: "contents",
                      label: "Contents",
                      content: (
                        <div className="space-y-4 pt-6">
                          <p className="max-w-prose text-[14.5px] text-ink-2">What {viewing} holds on each platform, and what a player downloads there.</p>
                          <AssetContents assets={assets} manifest={d.manifest} />
                          <p className="text-[13.5px] text-ink-2">
                            Found a copy where it shouldn&rsquo;t be?{" "}
                            <Link
                              className="font-semibold text-cobalt-ink underline"
                              href={`/dashboard/assets?package=${encodeURIComponent(d.identifier)}${viewing ? `&version=${encodeURIComponent(viewing)}` : ""}`}
                            >
                              Report it
                            </Link>
                            .
                          </p>
                        </div>
                      ),
                    },
                  ]
                : []),
              {
                id: "environments",
                label: "Environments",
                content: (
                  <div className="pt-6">
                    {compat.length === 0 ? (
                      <EmptyState title="No environments yet">No compatibility runs or declarations exist for this release.</EmptyState>
                    ) : (
                      <div className="panel relative overflow-x-auto">
                        <table className="w-full min-w-[420px] text-left text-[14px]">
                          <caption className="sr-only">Compatibility of {viewing} by environment</caption>
                          <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                            <tr>
                              <th scope="col" className="px-3 py-2.5">Environment</th>
                              <th scope="col" className="px-3 py-2.5">Status</th>
                              <th scope="col" className="px-3 py-2.5">Tested</th>
                              <th scope="col" className="px-3 py-2.5"><span className="sr-only">Details</span></th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortCompat(compat).map((c) => (
                              <tr key={c.environment} className="border-t border-line-soft">
                                <th scope="row" className="px-3 py-2.5 font-semibold">{envLongName(c.environment)}</th>
                                <td className="px-3 py-2.5"><StatusBadge meta={metaFor(compatibilityMeta, c.status)} size="sm" /></td>
                                <td className="tabular px-3 py-2.5">
                                  {c.ranAt ? <time dateTime={c.ranAt} title={formatDate(c.ranAt)}>{formatDate(c.ranAt)}</time> : "—"}
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  <Popover
                                    align="end"
                                    triggerLabel={`Details for ${envLongName(c.environment)}`}
                                    triggerClassName="rounded-md border-2 border-line-soft px-2 py-1 text-[12.5px] font-semibold hover:border-line"
                                    trigger="Details"
                                  >
                                    <EvidencePanel entry={c} />
                                  </Popover>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                id: "protection",
                label: "Protection",
                content: (
                  <div className="pt-6">
                    <ProtectionPanel version={viewingRow} manifest={d.manifest} environments={protectionEnvs} paid={paidOffers.length > 0} />
                  </div>
                ),
              },
              {
                id: "versions",
                label: "Versions",
                content: (
                  <div className="pt-6">
                    {d.versions.length === 0 ? (
                      <EmptyState title="No releases yet" />
                    ) : (
                      <ul className="space-y-3">
                        {d.versions.map((v) => (
                          <li key={v.version} className="panel p-4">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <Link href={`${href}?version=${encodeURIComponent(v.version)}`} className="tabular font-mono text-[16px] font-bold hover:underline">
                                {v.version}
                              </Link>
                              <StatusBadge meta={metaFor(releaseMeta, v.status)} size="sm" />
                              {v.restricted ? <StatusBadge meta={listingMeta.restricted} size="sm" /> : null}
                              <ReleaseProtectionBadges version={v} />
                              {v.version === viewing ? <Tag>viewing</Tag> : null}
                              <span className="tabular text-[13px] text-ink-3">{v.publishedAt ? formatDate(v.publishedAt) : "unpublished"} · {formatBytes(v.size)}</span>
                            </div>
                            <p className="mt-1 break-all font-mono text-[12px] text-ink-3">sha256 {v.sha256}</p>
                            {v.changelog ? <p className="mt-2 whitespace-pre-line text-[14px] text-ink-2">{v.changelog}</p> : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ),
              },
              {
                id: "license",
                label: "License",
                content: (
                  <div className="space-y-5 pt-6">
                    <KeyValue items={[{ label: "Code license", value: <span className="font-mono">{d.license}</span> }]} />
                    {d.offers.length === 0 ? (
                      <p className="text-[14.5px] text-ink-2">No offers. Use the package under its code license ({d.license}).</p>
                    ) : (
                      <div className="panel relative overflow-x-auto">
                        <table className="w-full min-w-[620px] text-left text-[14px]">
                          <caption className="sr-only">Offers for {d.identifier}</caption>
                          <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                            <tr>
                              <th scope="col" className="px-3 py-2.5">Plan</th>
                              <th scope="col" className="px-3 py-2.5">Price</th>
                              <th scope="col" className="px-3 py-2.5">Class</th>
                              <th scope="col" className="px-3 py-2.5">Covers</th>
                              <th scope="col" className="px-3 py-2.5">Deployments</th>
                            </tr>
                          </thead>
                          <tbody>
                            {d.offers.map((o: Offer) => (
                              <tr key={o.id} className="border-t border-line-soft align-top">
                                <th scope="row" className="px-3 py-2.5 font-semibold">
                                  {o.name}
                                  <span className="block text-[12.5px] font-normal text-ink-3">{intervalLabel(o.interval)}</span>
                                </th>
                                <td className="tabular px-3 py-2.5">{o.price ? `${formatMoney(o.price)}${intervalSuffix(o.interval)}` : "Free"}</td>
                                <td className="px-3 py-2.5"><StatusBadge meta={metaFor(classificationMeta, o.classification)} size="sm" /></td>
                                <td className="px-3 py-2.5">{o.environments.length ? `Runs on ${o.environments.map((e) => envLongName(e)).join(", ")}` : "Runs on every environment the release lists"}</td>
                                <td className="tabular px-3 py-2.5">{o.deployments}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <SellerLine creator={d.creator.displayName || d.seller.creator} provider={d.seller.provider} />
                    <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13.5px] text-ink-3">
                      A license is granted only on a verified payment event.
                      <ReadMore href="/docs/licensing-api#who-does-what" className="!text-[14px] text-ink">
                        Who does what
                      </ReadMore>
                    </p>
                  </div>
                ),
              },
              {
                id: "rights",
                label: "Rights",
                content: (
                  <div id="rights" className="space-y-5 pt-6">
                    {!d.rights ? (
                      <EmptyState title="No rights declaration yet">The creator has not declared rights for this release.</EmptyState>
                    ) : (
                      <>
                        <KeyValue
                          items={[
                            { label: "Declared", value: formatDate(d.rights.declaredAt) },
                            {
                              label: "Ownership",
                              value: d.rights.ownsCode
                                ? "The creator states they own this code or are authorized to distribute it."
                                : "The creator did not state ownership of all code.",
                            },
                            {
                              label: "Third-party game",
                              value: d.rights.targetsProprietaryGame
                                ? "The seller declares that it targets a third-party game platform. It is sold on that declaration: SCRIPT//GO does not review offers before sale, and acts on reports."
                                : "Does not target or include proprietary third-party game content.",
                            },
                          ]}
                        />
                        <RightsTable
                          title="Third-party assets"
                          empty="No third-party assets declared."
                          head={["File", "Source", "License"]}
                          rows={d.rights.thirdPartyAssets.map((a) => [a.path, a.source, a.license])}
                        />
                        <RightsTable
                          title="Dependencies"
                          empty="No dependencies."
                          head={["Dependency", "License"]}
                          rows={d.rights.dependencies.map((x) => [x.name, x.license])}
                        />
                      </>
                    )}
                    <p className="text-[13.5px] text-ink-2">
                      Think this package infringes your rights?{" "}
                      <Link className="font-semibold text-cobalt-ink underline" href={`/report?package=${encodeURIComponent(d.identifier)}`}>
                        Report it
                      </Link>
                      . No account needed.
                    </p>
                  </div>
                ),
              },
            ]}
          />
          <p className="mt-10 text-[12px] text-ink-3">
            Data from the SCRIPT//GO API{API_URL.includes("localhost") ? " (development)" : ""}. Only recorded runs count.
          </p>
        </div>
      </div>
    </div>
  );
}

function RightsTable({ title, head, rows, empty }: { title: string; head: string[]; rows: string[][]; empty: string }) {
  return (
    <section>
      <h3 className="mb-2 font-display text-[17px] font-extrabold">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-[14px] text-ink-3">{empty}</p>
      ) : (
        <div className="panel relative overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-[13.5px]">
            <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
              <tr>
                {head.map((h) => (
                  <th key={h} scope="col" className="px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-line-soft">
                  {r.map((c, j) => (
                    <td key={j} className={j === 0 ? "break-all px-3 py-2 font-mono text-[12.5px]" : "px-3 py-2"}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
