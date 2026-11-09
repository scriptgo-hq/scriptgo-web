import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { SeriesChart } from "@/components/dashboard/series-chart";
import { AutoSubmitSelect } from "@/components/site/auto-submit";
import { ButtonLink } from "@/components/ui/button";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { api, qs } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { Analytics, PackageSummary, Series } from "@/lib/contract";
import { getMe } from "@/lib/session";

export const metadata = { title: "Analytics" };

const RANGES = [7, 30, 90, 365] as const;

const SERIES: { key: keyof Analytics; label: string; hint: string }[] = [
  { key: "downloads", label: "Downloads", hint: "Archive downloads through the registry and the CLI." },
  { key: "activations", label: "Activations", hint: "New deployments activated against your licenses." },
  { key: "verifications", label: "Verifications", hint: "License checks answered for running deployments." },
];

function shortDate(d: string): string {
  const t = Date.parse(d.length === 10 ? `${d}T00:00:00Z` : d);
  return Number.isNaN(t) ? d : new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string; package?: string }> }) {
  const sp = await searchParams;
  const me = await getMe();
  if (!me.ok) return <ApiError failure={me} />;
  if (!me.data.creatorProfile) {
    return (
      <>
        <PageHeader eyebrow="publishing" title="Analytics." />
        <EmptyState title="Analytics belong to creators" action={<ButtonLink href="/dashboard/settings#creator">Create a creator profile</ButtonLink>} />
      </>
    );
  }
  const days = RANGES.includes(Number(sp.days) as (typeof RANGES)[number]) ? Number(sp.days) : 30;
  const pkg = sp.package && /^[a-z0-9][a-z0-9_-]{0,63}$/.test(sp.package) ? sp.package : undefined;
  const [res, pkgRes] = await Promise.all([
    api<Analytics>(`/v1/creator/analytics${qs({ days, package: pkg })}`, { auth: true }),
    api<PackageSummary[]>("/v1/creator/packages", { auth: true }),
  ]);
  const packages = pkgRes.ok ? pkgRes.data : [];
  const empty = res.ok && SERIES.every((s) => res.data[s.key].total === 0);
  const dates = res.ok ? res.data.downloads.points.map((p) => p.date) : [];
  const valueAt = (s: Series, d: string) => s.points.find((p) => p.date === d)?.value ?? 0;

  return (
    <>
      <PageHeader eyebrow="publishing" title="Analytics." description="Counts recorded by SCRIPT//GO for your packages. No revenue figures: payments stay with your provider." />

      <form method="get" className="mb-8 flex flex-wrap items-end gap-4" aria-label="Analytics filters">
        <fieldset>
          <legend className="text-[13px] font-bold">Period</legend>
          <div className="mt-1 inline-flex overflow-hidden rounded-lg border-2 border-line bg-surface">
            {RANGES.map((r) => (
              <Link
                key={r}
                href={`/dashboard/analytics${qs({ days: r, package: pkg })}`}
                aria-current={r === days ? "true" : undefined}
                className={cn("tabular px-3 py-1.5 text-[13.5px] font-semibold", r === days ? "bg-ink text-paper" : "text-ink-2 hover:bg-surface-2")}
              >
                {r === 365 ? "1 year" : `${r} days`}
              </Link>
            ))}
          </div>
        </fieldset>
        <input type="hidden" name="days" value={days} />
        <div>
          <label htmlFor="an-package" className="block text-[13px] font-bold">
            Package
          </label>
          <AutoSubmitSelect id="an-package" name="package" defaultValue={pkg ?? ""} className="mt-1 block h-[38px] w-60 max-w-full">
            <option value="">All packages</option>
            {packages.map((p) => (
              <option key={p.id} value={p.name}>
                {p.title}
              </option>
            ))}
          </AutoSubmitSelect>
        </div>
        <noscript>
          <button type="submit" className="h-[38px] rounded-lg border-2 border-line px-3 font-bold">
            Apply
          </button>
        </noscript>
      </form>

      {!res.ok ? (
        <ApiError failure={res} title="Analytics couldn't be loaded." />
      ) : (
        <>
          <dl className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {SERIES.map((s) => (
              <div key={s.key} className="panel p-4">
                <dt className="text-[14px] font-semibold text-ink-2">{s.label}</dt>
                <dd className="mt-1 font-sans text-[34px] font-semibold leading-none tracking-[-0.02em]">{res.data[s.key].total.toLocaleString("en-GB")}</dd>
                <dd className="mt-1 text-[12.5px] text-ink-3">{days === 365 ? "last 12 months" : `last ${days} days`}</dd>
              </div>
            ))}
          </dl>

          {empty ? (
            <EmptyState title="Nothing recorded in this period" className="mb-8">
              Downloads, activations and verifications appear here as they happen. Nothing is estimated.
            </EmptyState>
          ) : null}

          <div className="grid grid-cols-1 gap-6">
            {SERIES.map((s) => (
              <section key={s.key} aria-labelledby={`ch-${s.key}`} className="panel p-4">
                <h2 id={`ch-${s.key}`} className="font-bold">
                  {s.label} per day
                </h2>
                <p className="text-[13px] text-ink-3">{s.hint}</p>
                <div className="mt-3">
                  <SeriesChart series={res.data[s.key]} label={`${s.label} per day`} />
                </div>
              </section>
            ))}
          </div>

          <details className="panel mt-6 p-4">
            <summary className="cursor-pointer font-bold">Show the numbers as a table</summary>
            <div className="relative mt-3 max-h-[420px] overflow-auto">
              <table className="w-full min-w-[480px] text-left text-[13.5px]">
                <caption className="sr-only">Daily counts</caption>
                <thead className="sticky top-0 bg-surface text-[11.5px] uppercase tracking-wide text-ink-3">
                  <tr>
                    <th scope="col" className="py-1.5 pr-3">Date</th>
                    {SERIES.map((s) => (
                      <th key={s.key} scope="col" className="py-1.5 pr-3 text-right">
                        {s.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="tabular">
                  {[...dates].reverse().map((d) => (
                    <tr key={d} className="border-t border-line-soft">
                      <th scope="row" className="py-1.5 pr-3 font-normal">{shortDate(d)}</th>
                      {SERIES.map((s) => (
                        <td key={s.key} className="py-1.5 pr-3 text-right">
                          {valueAt(res.data[s.key], d).toLocaleString("en-GB")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </>
  );
}
