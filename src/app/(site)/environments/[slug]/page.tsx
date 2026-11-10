import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";
import { Ridge } from "@/components/site/ink";
import { EnvironmentCardArt } from "@/components/site/world-art";
import { worldArt, worldSrc, WORLD_SIZE } from "@/lib/worlds";
import { IntegrationSection, ProtectionSection } from "@/components/site/integration-section";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumb, KeyValue } from "@/components/ui/data";
import { ApiError, Banner, EmptyState } from "@/components/ui/feedback";
import { PackageCard } from "@/components/ui/package";
import { Prose } from "@/components/ui/prose";
import { api } from "@/lib/api";
import { CAPABILITIES, type EnvironmentDetail } from "@/lib/contract";
import { envKind, languageLabels } from "@/lib/env";
import { formatDateTime, relativeTime } from "@/lib/format";
import { guideHref } from "@/lib/guides";
import { renderMarkdown } from "@/lib/markdown";
import { protectionMeta } from "@/lib/protection";
import { PLATFORM_RULES_LEAD, platformRulesInfo } from "@/lib/platform-rules";
import { capabilityMeta, compatibilityMeta, environmentMeta, metaFor } from "@/lib/status";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const res = await api<EnvironmentDetail>(`/v1/environments/${encodeURIComponent(slug)}`);
  return { title: res.ok ? `${res.data.name} environment` : "Environment" };
}

export default async function EnvironmentPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const res = await api<EnvironmentDetail>(`/v1/environments/${encodeURIComponent(slug)}`);
  if (!res.ok) {
    if (res.status === 404) notFound();
    return (
      <div className="container-page py-12">
        <ApiError failure={res} title="This environment could not be loaded." />
      </div>
    );
  }
  const e = res.data;
  const planned = e.status === "planned";
  const setup = !planned && e.setupMarkdown ? await renderMarkdown(e.setupMarkdown, { trusted: true }) : null;
  const capKeys = Array.from(new Set([...CAPABILITIES, ...Object.keys(e.capabilities)]));
  const art = worldArt(e.slug);
  const rule = platformRulesInfo(e);
  const guide = guideHref(e.slug);

  return (
    <>
    <div className={art ? "page-head has-art g-night" : "page-head g-night"}>
      {art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="page-head-art" src={worldSrc(art.art)} width={WORLD_SIZE.width} height={WORLD_SIZE.height} alt="" fetchPriority="high" decoding="async" />
      ) : null}
      <div className="container-page pb-8 pt-8">
      <Breadcrumb items={[{ label: "Environments", href: "/environments" }, { label: e.slug }]} />
      <header className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_300px] md:items-center">
        <div className="min-w-0">
          <h1 className="display">{e.name}.</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusBadge meta={metaFor(environmentMeta, e.status)} />
            {e.protection.tier !== "none" ? (
              <a href="#protection-title">
                <StatusBadge meta={protectionMeta(e.protection)} />
              </a>
            ) : null}
            <span className="label">{envKind(e.kind).singular}</span>
          </div>
          <p className="mt-4 max-w-[62ch] text-[16.5px] text-ink-2">{e.summary}</p>
          {guide ? (
            <div className="cta-row mt-6">
              <ButtonLink href={guide} variant="sun" size="lg" arrow>
                Sell on {e.name}: step by step
              </ButtonLink>
            </div>
          ) : null}
          <KeyValue
            className="mt-5 max-w-xl"
            items={[
              { label: "Adapter", value: <span className="tabular font-mono">{e.adapterVersion || "—"}</span> },
              { label: "Languages", value: languageLabels(e).join(" · ") },
              { label: "Engine versions", value: e.runtimeVersions.join(", ") || "—" },
              { label: "Verified pkgs", value: <span className="tabular">{e.verifiedPackages}</span> },
              {
                label: "Last run",
                value: e.lastRun ? (
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <StatusBadge meta={metaFor(compatibilityMeta, e.lastRun.status)} size="sm" />
                    <time dateTime={e.lastRun.ranAt} title={formatDateTime(e.lastRun.ranAt)}>
                      {relativeTime(e.lastRun.ranAt)}
                    </time>
                    <span className="break-all font-mono text-[12.5px] text-ink-3">run {e.lastRun.runId}</span>
                  </span>
                ) : e.proof.length > 0 ? (
                  <>
                    No package run yet.{" "}
                    <a href="#integration-title" className="font-semibold text-cobalt-ink underline">
                      Conformance runs below
                    </a>
                  </>
                ) : (
                  "No conformance run recorded yet"
                ),
              },
            ]}
          />
        </div>
        {art ? null : (
          <div className="sticker hidden aspect-[5/3] overflow-hidden md:block">
            <EnvironmentCardArt slug={e.slug} name={e.name} large />
          </div>
        )}
      </header>
      </div>
      <Ridge from="transparent" to="paper" ink="cobalt" n={1} small className="relative z-[1]" />
    </div>
    <div className="container-page pb-16 pt-2">


      {e.status === "experimental" ? (
        <Banner tone="warning" title="Experimental environment." className="mt-8">
          Expect changes. Do not rely on it for production yet.
        </Banner>
      ) : null}

      <IntegrationSection env={e} />

      <ProtectionSection env={e} />

      <section aria-labelledby="platform-rule-title" className="mt-10">
        <h2 id="platform-rule-title" className="display scroll-mt-28 text-[30px]">
          Paid scripts: the platform&rsquo;s own rules.
        </h2>
        <div className="panel mt-4 grid gap-4 p-4 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:items-start">
          <div>
            <StatusBadge meta={rule.meta} />
          </div>
          <div className="min-w-0 text-[15px] text-ink-2">
            <p className="max-w-[70ch] text-ink">{rule.note}</p>
            <p className="mt-2 max-w-[70ch] text-[13.5px] text-ink-3">{PLATFORM_RULES_LEAD}</p>
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-labelledby="caps-title" className="min-w-0">
          <h2 id="caps-title" className="display text-[30px]">Capabilities.</h2>
          <div className="panel mt-4 relative overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-[14px]">
              <caption className="sr-only">Capability support in {e.name}</caption>
              <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                <tr>
                  <th scope="col" className="px-3 py-2.5">Capability</th>
                  <th scope="col" className="px-3 py-2.5">Support</th>
                  <th scope="col" className="px-3 py-2.5">Note</th>
                </tr>
              </thead>
              <tbody>
                {capKeys.map((c) => {
                  const v = e.capabilities[c];
                  return (
                    <tr key={c} className="border-t border-line-soft">
                      <th scope="row" className="px-3 py-2 font-mono text-[13px] font-semibold">{c}</th>
                      <td className="px-3 py-2">
                        {v ? <StatusBadge meta={metaFor(capabilityMeta, v)} size="sm" /> : <span className="text-ink-3">Not reported</span>}
                      </td>
                      <td className="px-3 py-2 text-ink-2">{e.capabilityNotes?.[c] ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {e.limitations.length ? (
            <>
              <h3 className="mt-8 font-display text-[20px] font-extrabold">Known limitations</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[14.5px] text-ink-2">
                {e.limitations.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
        <section aria-labelledby="setup-title" className="min-w-0">
          <h2 id="setup-title" className="display scroll-mt-28 text-[30px]">Setup.</h2>
          <div className="mt-4">
            {planned ? (
              <EmptyState icon={CalendarClock} title="Planned, not usable yet">
                This environment is on the roadmap. Install instructions appear once its adapter is usable.
              </EmptyState>
            ) : setup ? (
              <Prose html={setup.html} />
            ) : (
              <EmptyState title="No setup steps published yet" />
            )}
          </div>
        </section>
      </div>

      <section aria-labelledby="pkgs-title" className="mt-12">
        <h2 id="pkgs-title" className="display text-[30px]">Verified packages.</h2>
        {e.packages.length === 0 ? (
          <EmptyState title="No verified packages yet" className="mt-4">
            Packages appear here once one of their releases passes a compatibility run in {e.name}.
          </EmptyState>
        ) : (
          <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {e.packages.map((p) => (
              <li key={p.id}>
                <PackageCard pkg={p} className="h-full" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
    </>
  );
}
