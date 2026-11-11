import type { Metadata } from "next";
import { StatusBadge } from "@/components/ui/badge";
import { ProtectionTierTable } from "@/components/site/integration-section";
import { EnvironmentSlotTile, EnvironmentTile } from "@/components/ui/environment";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { Tabs } from "@/components/ui/tabs";
import { ReadMore } from "@/components/site/diagrams";
import { PageHead, SCENES } from "@/components/site/ink";
import { api } from "@/lib/api";
import type { Environment } from "@/lib/contract";
import { ENV_KINDS, envKind } from "@/lib/env";
import { ENV_STATUS_ORDER, environmentMeta } from "@/lib/status";

export const metadata: Metadata = {
  title: "Environments",
  description: "Every engine, runtime and mod platform SCRIPT//GO scripts run on, with its status, languages and protection.",
};

/** The four statuses, in as few words as the chips need. The full meaning is in /docs/environments. */
const STATUS_LEGEND = [
  ["available", "every check passing"],
  ["beta", "tested for real"],
  ["experimental", "first real tests passed"],
  ["planned", "on the roadmap"],
] as const;

export default async function EnvironmentsPage() {
  const res = await api<Environment[]>("/v1/environments");
  const envs = res.ok
    ? [...res.data].sort((a, b) => (ENV_STATUS_ORDER[a.status] ?? 9) - (ENV_STATUS_ORDER[b.status] ?? 9) || a.name.localeCompare(b.name))
    : [];
  const groups = ENV_KINDS.map((k) => ({ ...k, envs: envs.filter((e) => envKind(e.kind).kind === k.kind) }));

  return (
    <>
    <PageHead
      id="envs-h1"
      tag="Platforms"
      art={{ ...SCENES.signpost, position: "60% 45%" }}
      title={
        <>
          Environ&shy;ments, <em>by real status.</em>
        </>
      }
      lede="Every engine, runtime and mod platform a SCRIPT//GO script runs on, with the status its last real run earned."
    />
    <div className="container-page pb-16 pt-10">
      <div className="mb-9 flex flex-wrap items-center gap-x-6 gap-y-4">
        <ul className="flex flex-wrap gap-x-5 gap-y-3" aria-label="What each status means">
          {STATUS_LEGEND.map(([status, words]) => (
            <li key={status} className="flex items-center gap-2.5 text-[14px] text-ink-2">
              <StatusBadge meta={environmentMeta[status]} size="sm" />
              {words}
            </li>
          ))}
        </ul>
        <ReadMore href="/docs/environments" className="!text-[14.5px]">
          How a status is earned
        </ReadMore>
      </div>
      <div>
        {!res.ok ? (
          <ApiError failure={res} title="Environments could not be loaded." />
        ) : envs.length === 0 ? (
          <EmptyState title="No environments registered yet" />
        ) : (
          <Tabs
            label="Environment views"
            hashSync
            items={[
              {
                id: "directory",
                label: "Directory",
                content: (
                  <div className="space-y-12 pt-8">
                    {groups.map((g) => (
                      <section key={g.kind} aria-labelledby={`kind-${g.kind}`}>
                        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                          <h2 id={`kind-${g.kind}`} className="display text-[28px] sm:text-[30px]">
                            {g.title}.
                          </h2>
                          <p className="max-w-[70ch] text-[14.5px] text-ink-2">{g.blurb}</p>
                        </div>
                        <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
                          {g.envs.map((e) => (
                            <li key={e.slug}>
                              <EnvironmentTile env={e} className="h-full" />
                            </li>
                          ))}
                          {g.kind === "mod_platform" ? (
                            <li>
                              <EnvironmentSlotTile
                                href="/docs/create-adapter"
                                title="Your platform here"
                                body="Run a multiplayer or modding layer on a game? One adapter brings every package to it."
                                className="h-full"
                              />
                            </li>
                          ) : null}
                        </ul>
                      </section>
                    ))}
                  </div>
                ),
              },
              {
                id: "protection",
                label: "Protection",
                content: (
                  <div className="pt-6">
                    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                      <p className="text-[16px] text-ink-2">What a buyer&rsquo;s server gets on each host.</p>
                      <ReadMore href="/docs/protect-your-work#tiers" className="!text-[14.5px]">
                        The tiers
                      </ReadMore>
                    </div>
                    <div className="mt-5">
                      <ProtectionTierTable envs={envs} />
                    </div>
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>
    </div>
    </>
  );
}
