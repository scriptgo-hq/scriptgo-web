import Link from "next/link";
import { PackageForm } from "@/components/dashboard/package-forms";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { EnvCompatTags } from "@/components/ui/package";
import { Identifier } from "@/components/ui/typography";
import { api } from "@/lib/api";
import type { PackageSummary } from "@/lib/contract";
import { formatCount, formatDate } from "@/lib/format";
import { getMe } from "@/lib/session";
import { listingMeta, metaFor, visibilityMeta } from "@/lib/status";

export const metadata = { title: "Packages" };

export default async function PackagesPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const sp = await searchParams;
  const me = await getMe();
  if (!me.ok) return <ApiError failure={me} />;
  const creator = me.data.creatorProfile;
  if (!creator) {
    return (
      <>
        <PageHeader eyebrow="publishing" title="Packages." />
        <EmptyState title="You need a creator profile to publish" action={<ButtonLink href="/dashboard/settings#creator">Create a creator profile</ButtonLink>} />
      </>
    );
  }
  const res = await api<PackageSummary[]>("/v1/creator/packages", { auth: true });
  const showForm = sp.new === "1" || (res.ok && res.data.length === 0);

  return (
    <>
      <PageHeader
        eyebrow="publishing"
        title="Packages."
        description="Everything under your namespace, including private and unlisted packages."
        actions={showForm ? null : <ButtonLink href="/dashboard/packages?new=1#new-package">New package</ButtonLink>}
      />

      {showForm ? (
        <section id="new-package" aria-labelledby="new-title" className="sticker mb-10 scroll-mt-20 p-5">
          <h2 id="new-title" className="font-display text-[22px] font-extrabold">
            New package.
          </h2>
          <p className="mt-1 text-[14px] text-ink-2">
            A package holds releases and offers. Upload the first release after creating it, or run <span className="font-mono">scriptgo publish</span>.
          </p>
          <div className="mt-4">
            <PackageForm creator={creator.username} />
          </div>
        </section>
      ) : null}

      {!res.ok ? (
        <ApiError failure={res} title="Your packages couldn't be loaded." />
      ) : res.data.length === 0 ? null : (
        <div className="panel relative overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[14px]">
            <caption className="sr-only">Your packages</caption>
            <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
              <tr>
                <th scope="col" className="px-3 py-2.5">Package</th>
                <th scope="col" className="px-3 py-2.5">Latest</th>
                <th scope="col" className="px-3 py-2.5">Status</th>
                <th scope="col" className="px-3 py-2.5">Environments</th>
                <th scope="col" className="px-3 py-2.5 text-right">Downloads</th>
                <th scope="col" className="px-3 py-2.5">Updated</th>
              </tr>
            </thead>
            <tbody>
              {res.data.map((p) => (
                <tr key={p.id} className="border-t border-line-soft">
                  <th scope="row" className="px-3 py-2.5 font-normal">
                    <Link href={`/dashboard/packages/${encodeURIComponent(p.name)}`} className="font-semibold hover:underline">
                      {p.title}
                    </Link>
                    <span className="block text-[12.5px]">
                      <Identifier value={p.identifier} />
                    </span>
                  </th>
                  <td className="tabular px-3 py-2.5 font-mono text-[13px]">{p.latestVersion ?? <span className="text-ink-3">no release</span>}</td>
                  <td className="px-3 py-2.5">
                    <span className="flex flex-wrap gap-1">
                      {p.visibility ? <StatusBadge meta={metaFor(visibilityMeta, p.visibility)} size="sm" /> : null}
                      {p.listingStatus !== "active" ? <StatusBadge meta={metaFor(listingMeta, p.listingStatus)} size="sm" /> : null}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <EnvCompatTags envs={p.environments} max={4} />
                  </td>
                  <td className="tabular px-3 py-2.5 text-right">{formatCount(p.downloads)}</td>
                  <td className="tabular px-3 py-2.5">{formatDate(p.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
