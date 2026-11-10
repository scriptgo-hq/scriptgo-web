import Link from "next/link";
import type { Metadata } from "next";
import { StatusBadge } from "@/components/ui/badge";
import { ProtectionTierTable } from "@/components/site/integration-section";
import { EnvironmentSlotTile, EnvironmentTile } from "@/components/ui/environment";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { Tabs } from "@/components/ui/tabs";
import { PageHead, SCENES } from "@/components/site/ink";
import { StatusIcon } from "@/components/ui/icon";
import { api } from "@/lib/api";
import { CAPABILITIES, type Environment } from "@/lib/contract";
import { ENV_KINDS, envKind, languageLabels } from "@/lib/env";
import { formatDate, relativeTime } from "@/lib/format";
import { ENV_STATUS_ORDER, capabilityMeta, compatibilityMeta, environmentMeta, metaFor, salesMeta } from "@/lib/status";
import { cn } from "@/lib/cn";
import { adapterMetaFor } from "@/lib/integration";
import { protectionMeta } from "@/lib/protection";
import { TONE_CLASSES } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Environments",
  description: "Every engine, runtime and mod platform SCRIPT//GO targets, its status, languages and capability support.",
};

/** Section header row inside a table: the group name across every column. */
function GroupRow({ title, span }: { title: string; span: number }) {
  return (
    <tr className="border-t-[2.5px] border-line bg-paper-2">
      <th scope="colgroup" colSpan={span} className="px-3 py-2 text-[12.5px] font-bold uppercase tracking-wide text-ink">
        {title}
      </th>
    </tr>
  );
}

export default async function EnvironmentsPage() {
  const res = await api<Environment[]>("/v1/environments");
  const envs = res.ok
    ? [...res.data].sort((a, b) => (ENV_STATUS_ORDER[a.status] ?? 9) - (ENV_STATUS_ORDER[b.status] ?? 9) || a.name.localeCompare(b.name))
    : [];
  const groups = ENV_KINDS.map((k) => ({ ...k, envs: envs.filter((e) => envKind(e.kind).kind === k.kind) }));
  const filled = groups.filter((g) => g.envs.length > 0);
  const capKeys = Array.from(new Set([...CAPABILITIES, ...envs.flatMap((e) => Object.keys(e.capabilities))]));

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
    >
      <p className="lede mt-5 !max-w-[64ch] !text-[17px] text-[#e6e2f3]">
        Where packages run: engines and runtimes that run scripts themselves, and mod platforms that add scripting on top of an
        existing game. Every environment runs Lua; the .NET kit also runs TypeScript and JavaScript. Every environment is a
        peer, sorted by status, then by name. A status comes from the adapter&rsquo;s conformance runs, never from a form.
        Planned environments have no install steps yet. The{" "}
        <a href="#protection" className="font-semibold text-cobalt-ink underline">
          Protection
        </a>{" "}
        view says what a buyer&rsquo;s server gets in each one.
      </p>
    </PageHead>
    <div className="container-page pb-16 pt-10">
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
                    <div className="panel relative overflow-x-auto">
                      <table className="w-full min-w-[860px] text-left text-[14px]">
                        <caption className="sr-only">Environment directory</caption>
                        <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                          <tr>
                            <th scope="col" className="px-3 py-2.5">Environment</th>
                            <th scope="col" className="px-3 py-2.5">Status</th>
                            <th scope="col" className="px-3 py-2.5">Selling</th>
                            <th scope="col" className="px-3 py-2.5">Protection</th>
                            <th scope="col" className="px-3 py-2.5">Languages</th>
                            <th scope="col" className="px-3 py-2.5">Runtime</th>
                            <th scope="col" className="px-3 py-2.5">Capabilities</th>
                            <th scope="col" className="px-3 py-2.5">Verified packages</th>
                            <th scope="col" className="px-3 py-2.5">Last conformance run</th>
                          </tr>
                        </thead>
                        {filled.map((g) => (
                          <tbody key={g.kind}>
                            <GroupRow title={g.title} span={9} />
                            {g.envs.map((e) => {
                              const supported = Object.values(e.capabilities).filter((s) => s === "supported").length;
                              return (
                                <tr key={e.slug} className="border-t border-line-soft">
                                  <th scope="row" className="px-3 py-2.5">
                                    <Link href={`/environments/${encodeURIComponent(e.slug)}`} className="font-bold hover:underline">
                                      {e.name}
                                    </Link>
                                  </th>
                                  <td className="px-3 py-2.5">
                                    <StatusBadge meta={metaFor(environmentMeta, e.status)} size="sm" />
                                    {e.status === "planned" ? (
                                      <span className="mt-1 block text-[12px] leading-snug text-ink-3" title={e.blockedOn || undefined}>
                                        {adapterMetaFor(e.adapterState).long}
                                      </span>
                                    ) : null}
                                  </td>
                                  <td className="px-3 py-2.5" title={e.salesNote || undefined}><StatusBadge meta={metaFor(salesMeta, e.sales)} size="sm" /></td>
                                  <td className="px-3 py-2.5"><StatusBadge meta={protectionMeta(e.protection)} size="sm" /></td>
                                  <td className="px-3 py-2.5">{languageLabels(e).join(" · ")}</td>
                                  <td className="tabular px-3 py-2.5">{e.runtimeVersions.join(", ") || "—"}</td>
                                  <td className="tabular px-3 py-2.5">
                                    {supported} of {capKeys.length} supported
                                  </td>
                                  <td className="tabular px-3 py-2.5">{e.verifiedPackages}</td>
                                  <td className="px-3 py-2.5">
                                    {e.lastRun ? (
                                      <span className="inline-flex flex-wrap items-center gap-2">
                                        <StatusBadge meta={metaFor(compatibilityMeta, e.lastRun.status)} size="sm" />
                                        <time dateTime={e.lastRun.ranAt} title={formatDate(e.lastRun.ranAt)} className="tabular text-ink-3">
                                          {relativeTime(e.lastRun.ranAt)}
                                        </time>
                                      </span>
                                    ) : (
                                      <span className="text-ink-3">No run yet</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        ))}
                      </table>
                    </div>
                  </div>
                ),
              },
              {
                id: "protection",
                label: "Protection",
                content: (
                  <div className="pt-6">
                    <p className="max-w-[70ch] text-[15px] text-ink-2">
                      What a buyer&rsquo;s server gets in each environment. Code escrow needs a host that runs compiled code and can
                      hold a key. A host that runs plain script gets a licence check and signed releases, and no code-secrecy
                      claim. Where the rights holder allows free packages only, nothing is sold.
                    </p>
                    <div className="mt-4">
                      <ProtectionTierTable envs={envs} />
                    </div>
                    <p className="mt-3 text-[13px] text-ink-3">
                      Each sentence comes from the adapter registry, as written. Protection is deterrence, traceability and
                      revocation.{" "}
                      <Link href="/protect" className="font-semibold text-cobalt-ink underline">
                        How protection works, and what it does not do
                      </Link>
                    </p>
                  </div>
                ),
              },
              {
                id: "matrix",
                label: "Capability matrix",
                content: (
                  <div className="pt-6">
                    <div className="panel relative overflow-x-auto">
                      <table className="w-full min-w-[820px] border-collapse text-left text-[13px]">
                        <caption className="sr-only">Capability support by environment</caption>
                        <thead className="bg-surface-2">
                          <tr>
                            <th scope="col" className="sticky left-0 z-[1] bg-surface-2 px-3 py-2.5 text-[12px] uppercase tracking-wide text-ink-3">
                              Environment
                            </th>
                            {capKeys.map((c) => (
                              <th key={c} scope="col" className="px-2 py-2.5 font-mono text-[12px] font-semibold">
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        {filled.map((g) => (
                          <tbody key={g.kind}>
                            <GroupRow title={g.title} span={capKeys.length + 1} />
                            {g.envs.map((e) => (
                              <tr key={e.slug} className="border-t border-line-soft">
                                <th scope="row" className="sticky left-0 z-[1] bg-surface px-3 py-2 font-bold">
                                  {e.name}
                                </th>
                                {capKeys.map((c) => {
                                  const v = e.capabilities[c];
                                  const meta = v ? metaFor(capabilityMeta, v) : null;
                                  const note = e.capabilityNotes?.[c];
                                  return (
                                    <td key={c} className="px-2 py-2" title={meta ? `${e.name} · ${c}: ${meta.label}${note ? ` — ${note}` : ""}` : undefined}>
                                      {meta ? (
                                        <span className={cn("tok", TONE_CLASSES[meta.tone])}>
                                          <StatusIcon name={meta.icon} size={11} />
                                          {meta.label}
                                        </span>
                                      ) : (
                                        <span className="text-ink-3">—<span className="sr-only">not reported</span></span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        ))}
                      </table>
                    </div>
                    <p className="mt-3 text-[13px] text-ink-3">Hover or focus a cell for its note. Data from each adapter&rsquo;s capability registry.</p>
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
