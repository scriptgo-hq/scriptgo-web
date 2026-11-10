import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, ExternalLink, Package } from "lucide-react";
import { Breadcrumb } from "@/components/ui/data";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { Avatar, PackageCard } from "@/components/ui/package";
import { api } from "@/lib/api";
import type { CreatorProfile } from "@/lib/contract";
import { envLongName } from "@/lib/env";
import { formatDate } from "@/lib/format";
import { Tag } from "@/components/ui/badge";

type Params = { username: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { username } = await params;
  return { title: `Creator ${username}` };
}

export default async function CreatorPage({ params }: { params: Promise<Params> }) {
  const { username } = await params;
  const res = await api<CreatorProfile>(`/v1/creators/${encodeURIComponent(username)}`);
  if (!res.ok) {
    if (res.status === 404) notFound();
    return (
      <div className="container-page py-12">
        <ApiError failure={res} title="This creator profile could not be loaded." />
      </div>
    );
  }
  const c = res.data;
  const envs = Array.from(new Set(c.packages.flatMap((p) => p.environments.filter((e) => e.status === "verified").map((e) => e.slug)))).sort();
  return (
    <div className="container-page pb-16 pt-8">
      <Breadcrumb items={[{ label: "Explore", href: "/explore" }, { label: "creators" }, { label: c.username }]} />
      <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar name={c.displayName || c.username} size={88} className="border-[3px] shadow-[4px_4px_0_0_var(--shadow)]" />
        <div className="min-w-0">
          <h1 className="display flex flex-wrap items-center gap-3 text-[44px] sm:text-[56px]">
            {c.displayName || c.username}.
            {c.firstParty ? (
              <span className="stamp stamp-info">
                <BadgeCheck aria-hidden="true" size={15} /> First party
              </span>
            ) : null}
          </h1>
          <p className="mt-2 font-mono text-[14px] text-ink-3">@{c.username} · member since {formatDate(c.joinedAt)}</p>
          {c.bio ? <p className="mt-3 max-w-[64ch] whitespace-pre-line text-[16px] text-ink-2">{c.bio}</p> : null}
          {c.links.length ? (
            <ul className="mt-3 flex flex-wrap gap-3 text-[14px]">
              {c.links.map((l) => (
                <li key={l}>
                  <a href={l} rel="nofollow noopener ugc" className="inline-flex items-center gap-1 font-semibold text-cobalt-ink underline-offset-2 hover:underline">
                    {l.replace(/^https?:\/\//, "")}
                    <ExternalLink aria-hidden="true" size={13} />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {envs.length ? (
            <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[13px]">
              <span className="text-ink-3">Verified in:</span>
              {envs.map((e) => (
                <Tag key={e}>{envLongName(e)}</Tag>
              ))}
            </div>
          ) : null}
        </div>
      </header>
      <section aria-labelledby="creator-packages" className="mt-10">
        <h2 id="creator-packages" className="display text-[32px]">
          Packages.
        </h2>
        {c.packages.length === 0 ? (
          <EmptyState icon={Package} title="No public packages yet" className="mt-4" />
        ) : (
          <ul className="mt-6 grid gap-x-7 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {c.packages.map((p) => (
              <li key={p.id}>
                <PackageCard pkg={p} showSummary className="h-full" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
