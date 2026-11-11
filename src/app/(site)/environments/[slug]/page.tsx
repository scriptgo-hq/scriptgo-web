import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CircleCheck } from "lucide-react";
import { Ridge } from "@/components/site/ink";
import { EnvironmentCardArt } from "@/components/site/world-art";
import { worldArt, worldSrc, WORLD_SIZE } from "@/lib/worlds";
import { HowItWorksSection, ProtectionSection } from "@/components/site/integration-section";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/data";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { PackageCard } from "@/components/ui/package";
import { api } from "@/lib/api";
import type { EnvironmentDetail } from "@/lib/contract";
import { platformDocHref } from "@/lib/docs";
import { envKind, languageLabels } from "@/lib/env";
import { guideHref } from "@/lib/guides";
import { plainText, sidesLabel } from "@/lib/integration";
import { protectionMeta } from "@/lib/protection";
import { PLATFORM_RULES_LEAD, platformRulesInfo } from "@/lib/platform-rules";
import { environmentMeta, metaFor } from "@/lib/status";

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
  const art = worldArt(e.slug);
  const rule = platformRulesInfo(e);
  const guide = guideHref(e.slug);
  // The detail (setup, capabilities, limits, the real runs) lives in the docs, generated from the SDK.
  const docs = platformDocHref(e.slug, e.adapterState !== "none");
  const runsHref = docs.startsWith("/docs/platforms/") ? `${docs}#real-runs` : docs;
  const tested = e.adapterState === "verified";

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
          <p className="mt-4 max-w-[62ch] text-[16.5px] text-ink-2">{plainText(e.summary)}</p>
          <p className="mt-2 text-[14px] text-ink-3">
            {languageLabels(e).join(" · ")} · {sidesLabel(e.sides)}
          </p>
          {guide || !planned ? (
            <div className="cta-row mt-6 items-center">
              {guide ? (
                <ButtonLink href={guide} variant="sun" size="lg" arrow>
                  Sell on {e.name}: step by step
                </ButtonLink>
              ) : null}
              {!planned ? (
                <ButtonLink href={docs} variant="secondary" size="lg">
                  How it works, in full
                </ButtonLink>
              ) : null}
            </div>
          ) : null}
          {tested ? (
            <p className="mt-5 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[14.5px] font-semibold">
              <CircleCheck aria-hidden="true" size={18} strokeWidth={2.5} className="text-ok" />
              Tested on a real {e.name} {e.kind === "mod_platform" ? "server" : "runtime"}.
              <a href={runsHref} className="font-normal text-ink-2 underline underline-offset-2 hover:text-ink">
                See the runs
              </a>
            </p>
          ) : null}
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


      {planned ? null : <HowItWorksSection env={e} more={docs} />}

      <ProtectionSection env={e} />

      {rule.notable ? (
        <section aria-labelledby="platform-rule-title" className="mt-10">
          <h2 id="platform-rule-title" className="display scroll-mt-28 text-[30px]">
            The platform&rsquo;s own rules.
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge meta={rule.meta} />
          </div>
          <p className="mt-3 max-w-[70ch] text-[15.5px] text-ink-2">{rule.note}</p>
          <p className="mt-1.5 max-w-[70ch] text-[13.5px] text-ink-3">{PLATFORM_RULES_LEAD}</p>
        </section>
      ) : null}

      <section aria-labelledby="pkgs-title" className="mt-12">
        <h2 id="pkgs-title" className="display text-[30px]">Scripts tested here.</h2>
        {e.packages.length === 0 ? (
          <EmptyState title={`Scripts tested on ${e.name} appear here`} className="mt-4">
            A script shows here once one of its releases passes a test on {e.name}.
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
