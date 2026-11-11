import Link from "next/link";
import type { Metadata } from "next";
import { StatusBadge } from "@/components/ui/badge";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { PageHead, SCENES } from "@/components/site/ink";
import { api } from "@/lib/api";
import type { Environment, Health, Stats } from "@/lib/contract";
import { countOf, formatDateTime, relativeTime } from "@/lib/format";
import { ENV_STATUS_ORDER, compatibilityMeta, environmentMeta, metaFor, type StatusMeta } from "@/lib/status";

export const metadata: Metadata = { title: "Status", description: "Live status of the SCRIPT//GO API and the last real test on each platform." };

const UP: StatusMeta = { label: "Operational", tone: "success", icon: "check", hint: "Answered the health check." };
const DOWN: StatusMeta = { label: "Not reachable", tone: "danger", icon: "x", hint: "Did not answer the health check." };
const DEGRADED: StatusMeta = { label: "Degraded", tone: "warning", icon: "alert", hint: "Answered with an error." };

export default async function StatusPage() {
  const t0 = Date.now();
  const health = await api<Health>("/v1/health", { timeoutMs: 5000 });
  const latency = Date.now() - t0;
  const [envs, stats] = await Promise.all([api<Environment[]>("/v1/environments"), api<Stats>("/v1/stats")]);
  const checkedAt = new Date().toISOString();
  const apiMeta = health.ok ? (health.data.ok ? UP : DEGRADED) : health.kind === "unreachable" ? DOWN : DEGRADED;

  return (
    <>
    <PageHead
      id="status-h1"
      tag="Platform"
      art={{ ...SCENES.beacon, position: "74% 40%" }}
      title={
        <>
          Status<em>.</em>
        </>
      }
      lede={
        <>
          Checked <time dateTime={checkedAt}>{formatDateTime(checkedAt)}</time>. Reload to check again.
        </>
      }
    />
    <div className="container-page pb-16 pt-6">
      <section aria-labelledby="svc-title" className="mt-4">
        <h2 id="svc-title" className="font-display text-[26px] font-black tracking-[-0.02em]">Services</h2>
        <ul className="sticker mt-4 divide-y-[1.5px] divide-line-soft">
          <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-bold">API</p>
              <p className="tabular text-[13px] text-ink-3">
                {health.ok ? `version ${health.data.version} · answered in ${latency} ms` : health.message}
              </p>
            </div>
            <StatusBadge meta={apiMeta} />
          </li>
          <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-bold">Website</p>
              <p className="text-[13px] text-ink-3">You are reading it.</p>
            </div>
            <StatusBadge meta={UP} />
          </li>
          <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-bold">Registry</p>
              <p className="tabular text-[13px] text-ink-3">
                {stats.ok
                  ? `${countOf(stats.data.packages, "package")} · ${countOf(stats.data.creators, "creator")} · ${countOf(stats.data.environmentsVerified, "environment")} with verified runs`
                  : "Counts unavailable."}
              </p>
            </div>
            <StatusBadge meta={stats.ok ? UP : health.ok ? DEGRADED : DOWN} />
          </li>
        </ul>
      </section>

      <section aria-labelledby="ci-title" className="mt-10">
        <h2 id="ci-title" className="font-display text-[26px] font-black tracking-[-0.02em]">Last real test, per platform</h2>
        <div className="mt-3">
          {!envs.ok ? (
            <ApiError failure={envs} compact />
          ) : envs.data.length === 0 ? (
            <EmptyState title="No environments registered yet" />
          ) : (
            <div className="panel relative overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-[14px]">
                <caption className="sr-only">Last real test, per platform</caption>
                <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                  <tr>
                    <th scope="col" className="px-3 py-2.5">Platform</th>
                    <th scope="col" className="px-3 py-2.5">Result</th>
                    <th scope="col" className="px-3 py-2.5">When</th>
                  </tr>
                </thead>
                <tbody>
                  {[...envs.data]
                    .sort((a, b) => (ENV_STATUS_ORDER[a.status] ?? 9) - (ENV_STATUS_ORDER[b.status] ?? 9) || a.name.localeCompare(b.name))
                    .map((e) => (
                      <tr key={e.slug} className="border-t border-line-soft">
                        <th scope="row" className="px-3 py-2.5">
                          <Link href={`/environments/${encodeURIComponent(e.slug)}`} className="font-bold hover:underline">
                            {e.name}
                          </Link>
                          <span className="ml-2 align-middle">
                            <StatusBadge meta={metaFor(environmentMeta, e.status)} size="sm" />
                          </span>
                        </th>
                        <td className="px-3 py-2.5">
                          {e.lastRun ? <StatusBadge meta={metaFor(compatibilityMeta, e.lastRun.status)} size="sm" /> : <span className="text-ink-3">—</span>}
                        </td>
                        <td className="tabular px-3 py-2.5">
                          {e.lastRun ? (
                            <time dateTime={e.lastRun.ranAt} title={formatDateTime(e.lastRun.ranAt)}>
                              {relativeTime(e.lastRun.ranAt)}
                            </time>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
    </>
  );
}
