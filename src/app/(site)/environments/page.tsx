import Link from "next/link";
import type { Metadata } from "next";
import { StatusBadge } from "@/components/ui/badge";
import { EnvironmentTile } from "@/components/ui/environment";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { Tabs } from "@/components/ui/tabs";
import { DisplayTitle, Eyebrow } from "@/components/ui/typography";
import { StatusIcon } from "@/components/ui/icon";
import { api } from "@/lib/api";
import { CAPABILITIES, type Environment } from "@/lib/contract";
import { dialectLabel } from "@/lib/env";
import { formatDate, relativeTime } from "@/lib/format";
import { ENV_STATUS_ORDER, capabilityMeta, compatibilityMeta, environmentMeta, metaFor } from "@/lib/status";
import { cn } from "@/lib/cn";
import { TONE_CLASSES } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Environments",
  description: "Every runtime SCRIPT//GO targets, its status, Lua flavour and capability support.",
};

export default async function EnvironmentsPage() {
  const res = await api<Environment[]>("/v1/environments");
  const envs = res.ok
    ? [...res.data].sort((a, b) => (ENV_STATUS_ORDER[a.status] ?? 9) - (ENV_STATUS_ORDER[b.status] ?? 9) || a.name.localeCompare(b.name))
    : [];
  const capKeys = Array.from(new Set([...CAPABILITIES, ...envs.flatMap((e) => Object.keys(e.capabilities))]));

  return (
    <div className="container-page py-10">
      <Eyebrow>environments</Eyebrow>
      <DisplayTitle as="h1" className="mt-2 text-[52px] sm:text-[64px]">
        Environments.
      </DisplayTitle>
      <p className="mt-4 max-w-[62ch] text-[16.5px] text-ink-2">
        Every runtime is a peer: sorted by status, then by name. A status comes from the adapter&rsquo;s conformance runs, never
        from a form. Planned environments have no install steps yet.
      </p>
      <div className="mt-8">
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
                  <div className="space-y-8 pt-6">
                    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                      {envs.map((e) => (
                        <li key={e.slug}>
                          <EnvironmentTile env={e} className="h-full" />
                        </li>
                      ))}
                    </ul>
                    <div className="panel relative overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-[14px]">
                        <caption className="sr-only">Environment directory</caption>
                        <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                          <tr>
                            <th scope="col" className="px-3 py-2.5">Environment</th>
                            <th scope="col" className="px-3 py-2.5">Status</th>
                            <th scope="col" className="px-3 py-2.5">Lua</th>
                            <th scope="col" className="px-3 py-2.5">Runtime</th>
                            <th scope="col" className="px-3 py-2.5">Capabilities</th>
                            <th scope="col" className="px-3 py-2.5">Verified packages</th>
                            <th scope="col" className="px-3 py-2.5">Last conformance run</th>
                          </tr>
                        </thead>
                        <tbody>
                          {envs.map((e) => {
                            const supported = Object.values(e.capabilities).filter((s) => s === "supported").length;
                            return (
                              <tr key={e.slug} className="border-t border-line-soft">
                                <th scope="row" className="px-3 py-2.5">
                                  <Link href={`/environments/${encodeURIComponent(e.slug)}`} className="font-bold hover:underline">
                                    {e.name}
                                  </Link>
                                </th>
                                <td className="px-3 py-2.5"><StatusBadge meta={metaFor(environmentMeta, e.status)} size="sm" /></td>
                                <td className="px-3 py-2.5">{e.luaDialects.map(dialectLabel).join(", ") || "—"}</td>
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
                      </table>
                    </div>
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
                        <tbody>
                          {envs.map((e) => (
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
                                      <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11.5px] font-semibold", TONE_CLASSES[meta.tone])}>
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
  );
}
