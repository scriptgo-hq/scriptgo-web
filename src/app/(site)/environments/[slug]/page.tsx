import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";
import { EnvironmentArt } from "@/components/illustrations";
import { StatusBadge } from "@/components/ui/badge";
import { Breadcrumb, KeyValue } from "@/components/ui/data";
import { ApiError, Banner, EmptyState } from "@/components/ui/feedback";
import { PackageCard } from "@/components/ui/package";
import { Prose } from "@/components/ui/prose";
import { api } from "@/lib/api";
import { CAPABILITIES, type EnvironmentDetail } from "@/lib/contract";
import { dialectLabel } from "@/lib/env";
import { formatDateTime, relativeTime } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
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

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: "Environments", href: "/environments" }, { label: e.slug }]} />
      <header className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_320px] md:items-center">
        <div className="min-w-0">
          <h1 className="display text-[48px] sm:text-[64px]">{e.name}.</h1>
          <div className="mt-3">
            <StatusBadge meta={metaFor(environmentMeta, e.status)} />
          </div>
          <p className="mt-4 max-w-[62ch] text-[16.5px] text-ink-2">{e.summary}</p>
          <KeyValue
            className="mt-5 max-w-xl"
            items={[
              { label: "Adapter", value: <span className="tabular font-mono">{e.adapterVersion || "—"}</span> },
              { label: "Lua", value: e.luaDialects.map(dialectLabel).join(" · ") || "—" },
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
                    <span className="font-mono text-[12.5px] text-ink-3">run {e.lastRun.runId}</span>
                  </span>
                ) : (
                  "No conformance run recorded yet"
                ),
              },
            ]}
          />
        </div>
        <div className="sticker overflow-hidden">
          <EnvironmentArt slug={e.slug} name={e.name} className="aspect-[5/3] w-full" />
        </div>
      </header>

      {e.status === "experimental" ? (
        <Banner tone="warning" title="Experimental environment." className="mt-8">
          Its integration tests or its review are still pending. Expect changes, and don&rsquo;t rely on it for production.
        </Banner>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-labelledby="caps-title">
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
        <section aria-labelledby="setup-title">
          <h2 id="setup-title" className="display text-[30px]">Setup.</h2>
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
  );
}
