import Link from "next/link";
import { LayoutGrid, List, Search, SearchX } from "lucide-react";
import type { Metadata } from "next";
import { ExploreArt, categoryLabel } from "@/components/illustrations";
import { AutoSubmitCheckbox, AutoSubmitSelect } from "@/components/site/auto-submit";
import { CreatorCta } from "@/components/site/creator-cta";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/data";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { PackageCard, PackageRow } from "@/components/ui/package";
import { api, qs } from "@/lib/api";
import { cn } from "@/lib/cn";
import { CAPABILITIES, CATEGORIES, type Environment, type Page, type PackageSummary } from "@/lib/contract";
import { formatCount } from "@/lib/format";
import { ENV_STATUS_ORDER, environmentMeta, metaFor } from "@/lib/status";

export const metadata: Metadata = {
  title: "Explore scripts",
  description: "Search game scripts by environment, category, capability and price.",
};

type SP = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const PAGE_SIZE = 24;

export default async function ExplorePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = one(sp.q).slice(0, 200);
  const environment = one(sp.environment);
  const category = CATEGORIES.includes(one(sp.category) as never) ? one(sp.category) : "";
  const capability = one(sp.capability);
  const pricing = ["free", "paid"].includes(one(sp.pricing)) ? one(sp.pricing) : "";
  const sort = ["updated", "downloads", "name"].includes(one(sp.sort)) ? one(sp.sort) : "updated";
  const verifiedOnly = one(sp.verifiedOnly) === "true";
  const view = one(sp.view) === "list" ? "list" : "covers";
  const page = Math.max(1, Number.parseInt(one(sp.page) || "1", 10) || 1);

  const filters = {
    q,
    environment,
    category,
    capability,
    pricing,
    sort: sort === "updated" ? "" : sort,
    verifiedOnly: verifiedOnly ? "true" : "",
  };

  const [envRes, res] = await Promise.all([
    api<Environment[]>("/v1/environments"),
    api<Page<PackageSummary>>(`/v1/packages${qs({ ...filters, sort, page, pageSize: PAGE_SIZE })}`),
  ]);

  const envs = envRes.ok
    ? [...envRes.data].sort(
        (a, b) => (ENV_STATUS_ORDER[a.status] ?? 9) - (ENV_STATUS_ORDER[b.status] ?? 9) || a.name.localeCompare(b.name),
      )
    : [];
  const hrefWith = (over: Record<string, string | number>) => `/explore${qs({ ...filters, view: view === "list" ? "list" : "", page: "", ...over })}`;
  const activeFilters = [q, environment, category, capability, pricing, verifiedOnly ? "1" : ""].filter(Boolean).length;

  return (
    <>
      <section aria-labelledby="explore-title" className="relative isolate overflow-hidden border-b-2 border-line-soft">
        <div
          aria-hidden="true"
          className="absolute -right-[5%] top-0 -z-10 hidden h-full w-[55%] bg-sun md:block"
          style={{ clipPath: "polygon(22% 0, 100% 0, 100% 100%, 0 100%)" }}
        />
        <div className="container-page grid items-end gap-4 pb-8 pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <h1 id="explore-title" className="display text-[56px] sm:text-[72px]">
              Explore
              <br />
              scripts.
            </h1>
            <p className="mt-4 max-w-[48ch] text-[16px] text-ink-2">
              Discover scripts made by creators. Tools, systems, frameworks and more, with the environments each one has
              actually been run in.
            </p>
          </div>
          <ExploreArt className="hidden w-full max-w-[520px] justify-self-end md:block" />
        </div>
      </section>

      <div className="container-page py-8">
        <form action="/explore" method="get" role="search" aria-label="Filter scripts" className="space-y-3">
          {view === "list" ? <input type="hidden" name="view" value="list" /> : null}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <label htmlFor="explore-q" className="sr-only">
                Search scripts, creators, tags
              </label>
              <Search aria-hidden="true" size={18} strokeWidth={2.25} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                id="explore-q"
                name="q"
                type="search"
                defaultValue={q}
                maxLength={200}
                placeholder="Search scripts, creators, tags…"
                className="h-11 w-full rounded-full border-2 border-line bg-surface pl-11 pr-4 text-[15px] placeholder:text-ink-3"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="f-env">
                Environment
              </label>
              <AutoSubmitSelect id="f-env" name="environment" defaultValue={environment}>
                <option value="">All environments</option>
                {envs.map((e) => (
                  <option key={e.slug} value={e.slug}>
                    {e.name} ({metaFor(environmentMeta, e.status).label})
                  </option>
                ))}
                {environment && !envs.some((e) => e.slug === environment) ? <option value={environment}>{environment}</option> : null}
              </AutoSubmitSelect>
              <label className="sr-only" htmlFor="f-cat">
                Type
              </label>
              <AutoSubmitSelect id="f-cat" name="category" defaultValue={category}>
                <option value="">All types</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel(c)}
                  </option>
                ))}
              </AutoSubmitSelect>
              <ViewToggle view={view} hrefWith={hrefWith} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[14px]">
            <label className="sr-only" htmlFor="f-cap">
              Capability
            </label>
            <AutoSubmitSelect id="f-cap" name="capability" defaultValue={capability} className="h-9 text-[13px]">
              <option value="">Any capability</option>
              {CAPABILITIES.map((c) => (
                <option key={c} value={c}>
                  Needs {c}
                </option>
              ))}
            </AutoSubmitSelect>
            <label className="sr-only" htmlFor="f-price">
              Price
            </label>
            <AutoSubmitSelect id="f-price" name="pricing" defaultValue={pricing} className="h-9 text-[13px]">
              <option value="">Free and paid</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </AutoSubmitSelect>
            <label className="sr-only" htmlFor="f-sort">
              Sort
            </label>
            <AutoSubmitSelect id="f-sort" name="sort" defaultValue={sort} className="h-9 text-[13px]">
              <option value="updated">Recently updated</option>
              <option value="downloads">Most downloaded</option>
              <option value="name">Name</option>
            </AutoSubmitSelect>
            <label className="inline-flex h-9 items-center gap-2 rounded-full border-2 border-line-soft bg-surface px-3 font-semibold">
              <AutoSubmitCheckbox name="verifiedOnly" value="true" defaultChecked={verifiedOnly} />
              Verified runs only
            </label>
            <Button type="submit" variant="secondary" size="sm">
              Apply
            </Button>
            {activeFilters > 0 ? (
              <Link href={view === "list" ? "/explore?view=list" : "/explore"} className="px-2 font-semibold text-cobalt-ink underline-offset-2 hover:underline">
                Clear filters
              </Link>
            ) : null}
          </div>
        </form>

        <div className="mt-8" aria-live="polite">
          {!res.ok ? (
            <ApiError failure={res} title="Scripts could not be loaded." />
          ) : (
            <Results data={res.data} view={view} hrefWith={hrefWith} filtered={activeFilters > 0} />
          )}
          {!envRes.ok && res.ok ? (
            <p className="mt-4 text-[13px] text-ink-3">Environment names could not be loaded; the environment filter lists only the current value.</p>
          ) : null}
        </div>
      </div>
      <CreatorCta className="mb-4" />
    </>
  );
}

function ViewToggle({ view, hrefWith }: { view: "covers" | "list"; hrefWith: (o: Record<string, string | number>) => string }) {
  const item = (v: "covers" | "list", label: string, Icon: typeof List) => (
    <Link
      href={hrefWith({ view: v === "list" ? "list" : "" })}
      aria-current={view === v ? "true" : undefined}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold",
        view === v ? "bg-ink text-paper" : "text-ink-2 hover:bg-surface-2",
      )}
    >
      <Icon aria-hidden="true" size={14} strokeWidth={2.5} />
      {label}
    </Link>
  );
  return (
    <div role="group" aria-label="Result layout" className="inline-flex items-center gap-1 rounded-full border-2 border-line bg-surface p-[3px]">
      {item("covers", "Covers", LayoutGrid)}
      {item("list", "List", List)}
    </div>
  );
}

function Results({
  data,
  view,
  hrefWith,
  filtered,
}: {
  data: Page<PackageSummary>;
  view: "covers" | "list";
  hrefWith: (o: Record<string, string | number>) => string;
  filtered: boolean;
}) {
  if (data.items.length === 0) {
    return (
      <EmptyState icon={SearchX} title={filtered ? "No scripts match these filters" : "No scripts published yet"}>
        {filtered ? "Try fewer filters, or a different environment." : "Published packages appear here as soon as they are listed."}
      </EmptyState>
    );
  }
  const from = (data.page - 1) * data.pageSize + 1;
  const to = from + data.items.length - 1;
  return (
    <>
      <p className="tabular mb-4 text-[14px] text-ink-2">
        Showing {formatCount(from)}–{formatCount(to)} of {formatCount(data.total)} {data.total === 1 ? "script" : "scripts"}
      </p>
      {view === "covers" ? (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((p) => (
            <li key={p.id}>
              <PackageCard pkg={p} className="h-full" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="panel overflow-hidden">
          {data.items.map((p) => (
            <PackageRow key={p.id} pkg={p} />
          ))}
        </ul>
      )}
      <Pagination className="mt-10" page={data.page} total={data.total} pageSize={data.pageSize} hrefFor={(p) => hrefWith({ page: p > 1 ? p : "" })} />
    </>
  );
}
