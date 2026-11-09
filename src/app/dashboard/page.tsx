import Link from "next/link";
import { ArrowRight, Bell, CircleAlert, Info, KeyRound, TriangleAlert, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { buttonClass, ButtonLink } from "@/components/ui/button";
import { CommandLine } from "@/components/ui/code-block";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { EnvCompatTags } from "@/components/ui/package";
import { Identifier } from "@/components/ui/typography";
import { api, asList } from "@/lib/api";
import type { LicenseSummary, Notice, PackageSummary, Store } from "@/lib/contract";
import { formatDate } from "@/lib/format";
import { listingMeta, metaFor, visibilityMeta } from "@/lib/status";
import { getMe } from "@/lib/session";

type Attention = { tone: "danger" | "warning" | "info"; icon: LucideIcon; text: React.ReactNode; href: string; action: string };

const DAY = 86_400_000;

export default async function DashboardOverview() {
  const me = await getMe();
  if (!me.ok) return <ApiError failure={me} />;
  const creator = me.data.creatorProfile;
  const [licRes, noticeRes, pkgRes, storeRes] = await Promise.all([
    api<LicenseSummary[] | { items: LicenseSummary[] }>("/v1/me/licenses", { auth: true }),
    api<Notice[] | { items: Notice[] }>("/v1/me/notices", { auth: true }),
    creator ? api<PackageSummary[] | { items: PackageSummary[] }>("/v1/creator/packages", { auth: true }) : null,
    creator ? api<Store[] | { items: Store[] }>("/v1/creator/stores", { auth: true }) : null,
  ]);
  const licenses = licRes.ok ? asList(licRes.data) : [];
  const notices = noticeRes.ok ? asList(noticeRes.data) : [];
  const packages = pkgRes?.ok ? asList(pkgRes.data) : [];
  const stores = storeRes?.ok ? asList(storeRes.data) : [];
  const now = Date.now();

  const attention: Attention[] = [];
  for (const n of notices.filter((x) => !x.readAt)) {
    attention.push({ tone: "warning", icon: Bell, text: <>Moderation notice: {n.title}</>, href: "/dashboard/notices", action: "View" });
  }
  for (const s of stores.filter((x) => x.status === "needs_attention" || x.webhook.failures24h > 0)) {
    attention.push({
      tone: "danger",
      icon: CircleAlert,
      text: (
        <>
          {s.provider === "tebex" ? "Tebex" : "Mock"} webhook: <span className="tabular">{s.webhook.failures24h}</span> failed deliveries in 24 h
        </>
      ),
      href: "/dashboard/stores",
      action: "Diagnose",
    });
  }
  for (const l of licenses) {
    const end = l.currentPeriodEnd ? new Date(l.currentPeriodEnd).getTime() : null;
    if (l.status === "grace") {
      attention.push({
        tone: "danger",
        icon: TriangleAlert,
        text: <>Payment failed for {l.package.title}. Active until {formatDate(l.currentPeriodEnd)}.</>,
        href: `/dashboard/licenses/${encodeURIComponent(l.id)}`,
        action: "Open",
      });
    } else if (l.status === "cancelled_active") {
      attention.push({
        tone: "warning",
        icon: TriangleAlert,
        text: <>{l.package.title} is cancelled and ends on {formatDate(l.currentPeriodEnd)}.</>,
        href: `/dashboard/licenses/${encodeURIComponent(l.id)}`,
        action: "Open",
      });
    } else if (l.status === "active" && end && end - now < 14 * DAY && end > now) {
      attention.push({
        tone: "info",
        icon: Info,
        text: <>{l.package.title} renews on {formatDate(l.currentPeriodEnd)}.</>,
        href: `/dashboard/licenses/${encodeURIComponent(l.id)}`,
        action: "Open",
      });
    }
  }

  const activeLicenses = licenses.filter((l) => ["active", "grace", "cancelled_active"].includes(l.status));
  const used = activeLicenses.reduce((a, l) => a + l.deploymentsUsed, 0);
  const allowed = activeLicenses.reduce((a, l) => a + l.deploymentsAllowed, 0);
  const brandNew = licenses.length === 0 && !creator && notices.length === 0;
  const failed = !licRes.ok ? licRes : !noticeRes.ok ? noticeRes : storeRes && !storeRes.ok ? storeRes : null;
  const toneCls = { danger: "text-bad", warning: "text-warn", info: "text-info" } as const;

  return (
    <>
      <PageHeader eyebrow="overview" title={`Hello, ${me.data.user.name.split(" ")[0] || "there"}.`} />

      {brandNew ? (
        <section aria-labelledby="start-title" className="sticker mb-8 p-6">
          <h2 id="start-title" className="font-display text-[24px] font-extrabold">
            Get started in four steps.
          </h2>
          <ol className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            {[
              ["Create an access token for the CLI", null, "/dashboard/settings#tokens"],
              ["Create a resource", "scriptgo init my_resource", null],
              ["Test it in the standalone host", "scriptgo test", null],
              ["Publish it (needs a creator profile)", "scriptgo publish", "/dashboard/settings#creator"],
            ].map(([t, cmd, href], i) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden="true" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-line bg-sun font-display font-black text-on-sun">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{t}</p>
                  {cmd ? <CommandLine command={cmd} className="mt-2" /> : null}
                  {href ? (
                    <Link href={href} className="mt-1 inline-flex items-center gap-1 text-[14px] font-bold text-cobalt-ink hover:underline">
                      Open settings <ArrowRight aria-hidden="true" size={14} />
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section aria-labelledby="attn-title" className="mb-10">
        <h2 id="attn-title" className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">
          Needs attention
        </h2>
        {failed ? <ApiError compact className="mt-3" failure={failed} title="Some items could not be checked." /> : null}
        {attention.length === 0 ? (
          <p className="mt-3 text-[14.5px] text-ink-2">Nothing needs your attention.</p>
        ) : (
          <ul className="panel mt-3 divide-y divide-line-soft">
            {attention.map((a, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3">
                <a.icon aria-hidden="true" size={18} className={`shrink-0 ${toneCls[a.tone]}`} />
                <span className="min-w-0 flex-1 text-[14.5px]">{a.text}</span>
                <Link href={a.href} className={buttonClass("secondary", "sm")}>
                  {a.action}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="pub-title" className="mb-10">
        <div className="flex items-center justify-between gap-3">
          <h2 id="pub-title" className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">
            Publishing
          </h2>
          {creator ? (
            <Link href="/dashboard/packages" className="text-[14px] font-bold text-cobalt-ink hover:underline">
              All packages
            </Link>
          ) : null}
        </div>
        {!creator ? (
          <EmptyState title="You're not publishing yet" className="mt-3" action={<ButtonLink href="/dashboard/settings#creator" size="sm">Create a creator profile</ButtonLink>}>
            A creator profile gives you a <code className="font-mono">username//</code> namespace for your packages.
          </EmptyState>
        ) : pkgRes && !pkgRes.ok ? (
          <ApiError compact className="mt-3" failure={pkgRes} />
        ) : packages.length === 0 ? (
          <EmptyState title="No packages yet" className="mt-3" action={<ButtonLink href="/dashboard/packages" size="sm">New package</ButtonLink>} />
        ) : (
          <div className="panel mt-3 relative overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <caption className="sr-only">Your packages</caption>
              <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                <tr>
                  <th scope="col" className="px-3 py-2.5">Package</th>
                  <th scope="col" className="px-3 py-2.5">Latest</th>
                  <th scope="col" className="px-3 py-2.5">Status</th>
                  <th scope="col" className="px-3 py-2.5">Environments</th>
                </tr>
              </thead>
              <tbody>
                {packages.slice(0, 8).map((p) => (
                  <tr key={p.id} className="border-t border-line-soft">
                    <th scope="row" className="px-3 py-2.5 font-normal">
                      <Link href={`/dashboard/packages/${encodeURIComponent(p.name)}`} className="font-semibold hover:underline">
                        <Identifier value={p.identifier} className="whitespace-nowrap" />
                      </Link>
                    </th>
                    <td className="tabular px-3 py-2.5 font-mono text-[13px]">{p.latestVersion ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className="flex flex-wrap gap-1">
                        {p.visibility ? <StatusBadge meta={metaFor(visibilityMeta, p.visibility)} size="sm" /> : null}
                        {p.listingStatus !== "active" ? <StatusBadge meta={metaFor(listingMeta, p.listingStatus)} size="sm" /> : null}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <EnvCompatTags envs={p.environments} max={5} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="using-title">
        <h2 id="using-title" className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">
          Using
        </h2>
        <div className="panel mt-3 flex flex-wrap items-center justify-between gap-3 px-4 py-4">
          <p className="tabular flex items-center gap-2 text-[15px]">
            <KeyRound aria-hidden="true" size={18} className="text-cobalt-ink" />
            {licRes.ok ? (
              <>
                {activeLicenses.length} {activeLicenses.length === 1 ? "license" : "licenses"} active · {used} of {allowed} deployments in use
              </>
            ) : (
              "Licenses unavailable"
            )}
          </p>
          <Link href="/dashboard/licenses" className="inline-flex items-center gap-1 text-[14px] font-bold text-cobalt-ink hover:underline">
            Licenses <ArrowRight aria-hidden="true" size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
