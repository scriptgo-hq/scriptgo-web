import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { KeyValue } from "@/components/ui/data";
import { Banner, EmptyState } from "@/components/ui/feedback";
import { AdapterStateBadge, InlineCodeText } from "@/components/ui/integration";
import type { Environment, EnvironmentDetail, EnvironmentProtection, ProofRun } from "@/lib/contract";
import { formatDate } from "@/lib/format";
import { integrationTypeLabel, sidesLabel } from "@/lib/integration";
import { groupByTier, protectionLead, tierBlurb, tierMeta } from "@/lib/protection";
import { platformRulesInfo } from "@/lib/platform-rules";
import type { StatusMeta } from "@/lib/status";

interface ProofGroup {
  pkg: string;
  version: string;
  runtimes: string[];
  checks: string;
  ranAt: string;
}

/** One row per package version: its runtimes side by side (standalone runs three interpreters). */
function groupProof(proof: ProofRun[]): ProofGroup[] {
  const groups = new Map<string, ProofRun[]>();
  for (const r of proof) {
    const key = `${r.package}@${r.version}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.values()].map((runs) => {
    const first = runs[0]!;
    const counts = Array.from(new Set(runs.map((r) => `${r.checksPassed}/${r.checks}`)));
    return {
      pkg: first.package,
      version: first.version,
      // The .NET kit names its Lua inside the runtime string, and also runs TypeScript there: no Lua suffix then.
      runtimes: runs.map((r) => (r.lua && !r.runtime.includes(r.lua) ? `${r.runtime} · ${r.lua}` : r.runtime)),
      checks: counts.length === 1 && runs.length > 1 ? `${counts[0]} each` : counts.join(", "),
      ranAt: runs.map((r) => r.ranAt).sort().pop()!,
    };
  });
}

/** The environment page's "Integration" section: how packages run there, and what real runs proved. */
export function IntegrationSection({ env: e }: { env: EnvironmentDetail }) {
  const i = e.integration;
  return (
    <section aria-labelledby="integration-title" className="mt-10">
      <h2 id="integration-title" className="display text-[30px]">
        Integration.
      </h2>
      {!i ? (
        <EmptyState icon={CalendarClock} title="Not started" className="mt-4">
          No adapter code has been written for {e.name} yet. The summary above is the intended approach. The page shows the
          integration once its adapter exists, and the status moves past planned only after a real run passes.
        </EmptyState>
      ) : (
        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <p className="max-w-[62ch] text-[15.5px] leading-relaxed text-ink-2">
              <InlineCodeText text={i.summary} />
            </p>
            <KeyValue
              className="mt-5"
              labelWidth="7.5rem"
              items={[
                {
                  label: "Type",
                  value: <Tag title={integrationTypeLabel(i.type).hint}>{integrationTypeLabel(i.type).label}</Tag>,
                },
                { label: "Runtime", value: <InlineCodeText text={i.runtime} /> },
                { label: "Sides", value: sidesLabel(e.sides) },
                {
                  label: "Platform's rules",
                  value: (
                    <span className="inline-flex flex-wrap items-center gap-2">
                      <StatusBadge meta={platformRulesInfo(e).meta} size="sm" />
                      <span className="text-ink-2">{platformRulesInfo(e).note}</span>
                    </span>
                  ),
                },
                { label: "Adapter state", value: <AdapterStateBadge state={e.adapterState} long /> },
              ]}
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-[20px] font-extrabold">Proven on a real runtime</h3>
            {e.proof.length > 0 ? (
              <>
                <div className="panel relative mt-3 overflow-x-auto">
                  <table className="w-full min-w-[460px] text-left text-[13.5px]">
                    <caption className="sr-only">Verified runs of {e.name}</caption>
                    <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                      <tr>
                        <th scope="col" className="px-3 py-2.5">Package</th>
                        <th scope="col" className="px-3 py-2.5">Runtime</th>
                        <th scope="col" className="px-3 py-2.5">Checks</th>
                        <th scope="col" className="px-3 py-2.5">Ran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupProof(e.proof).map((g) => (
                        <tr key={`${g.pkg}@${g.version}`} className="border-t border-line-soft align-top">
                          <th scope="row" className="px-3 py-2 font-mono text-[12.5px] font-semibold">
                            {g.pkg} <span className="font-normal text-ink-3">{g.version}</span>
                          </th>
                          <td className="px-3 py-2">
                            <ul className="space-y-0.5">
                              {g.runtimes.map((r) => (
                                <li key={r}>{r}</li>
                              ))}
                            </ul>
                          </td>
                          <td className="tabular px-3 py-2">{g.checks}</td>
                          <td className="tabular whitespace-nowrap px-3 py-2 text-ink-3">{formatDate(g.ranAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-[13px] text-ink-3">
                  From the reports <code className="font-mono">scriptgo verify</code> wrote in the real runtime. Mocks, stubs and
                  emulators never write one. <Link href="/docs/create-adapter#conformance" className="font-semibold text-cobalt-ink underline">How runs work</Link>
                </p>
              </>
            ) : e.adapterState === "written" ? (
              <Banner tone="info" title="Adapter written, awaiting a real run." className="mt-3">
                {e.blockedOn || "No run in the real runtime has passed yet."} Tests against mocks, stubs or a plain VM do not
                count as a run; the known limitations say what has been tested so far.
              </Banner>
            ) : (
              <EmptyState title="No real run yet" className="mt-3">
                Runs appear here once a package passes <code className="font-mono">scriptgo verify</code> in {e.name}.
              </EmptyState>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/** State of a tier in one environment: "Available" or "Planned", with its icon. Never colour alone. */
function StateBadge({ p }: { p: EnvironmentProtection }) {
  const meta: StatusMeta =
    p.state === "available"
      ? { label: "Available", tone: "success", icon: "check", hint: "This tier works in the environment today." }
      : { label: "Planned", tone: "neutral", icon: "hourglass", hint: "This tier does not work in the environment yet." };
  return <StatusBadge meta={meta} size="sm" />;
}

/**
 * The environment page's "Protection" section: the tier a buyer's server gets there, whether it works
 * today, and the registry's one honest sentence. Every word of it comes from the registry fields.
 */
export function ProtectionSection({ env: e }: { env: Pick<Environment, "name" | "protection"> }) {
  const p = e.protection;
  const lead = protectionLead(p);
  return (
    <section aria-labelledby="protection-title" className="mt-10">
      <h2 id="protection-title" className="display text-[30px]">
        Protection.
      </h2>
      <div className="panel mt-4 grid gap-4 p-4 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:items-start">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge meta={tierMeta[p.tier]} />
          {p.tier !== "none" ? <StateBadge p={p} /> : null}
        </div>
        <div className="min-w-0 text-[15px] text-ink-2">
          <p className="max-w-[70ch]">
            {lead ? <strong className="text-ink">{lead} </strong> : null}
            {p.note || tierBlurb[p.tier]}
          </p>
          <p className="mt-2 text-[13.5px] text-ink-3">
            What a buyer&rsquo;s server gets in {e.name}. Protection is deterrence, traceability and revocation, never a promise
            that code cannot be copied.{" "}
            <Link href="/protect" className="font-semibold text-cobalt-ink underline">
              How protection works
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Every environment by protection tier, from the API. Used by the directory and by /protect, so the
 * two can never disagree. Each row carries the registry's note as written.
 */
export function ProtectionTierTable({ envs, caption = "Protection tier by environment" }: { envs: Environment[]; caption?: string }) {
  const groups = groupByTier(envs);
  return (
    <div className="panel relative overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-[14px]">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
          <tr>
            <th scope="col" className="px-3 py-2.5">Environment</th>
            <th scope="col" className="px-3 py-2.5">State</th>
            <th scope="col" className="px-3 py-2.5">What a buyer&rsquo;s server gets</th>
          </tr>
        </thead>
        {groups.map((g) => (
          <tbody key={g.tier}>
            <tr className="border-t border-line-soft bg-surface-2">
              <th scope="colgroup" colSpan={3} className="px-3 py-2.5">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <StatusBadge meta={tierMeta[g.tier]} size="sm" />
                  <span className="text-[13px] font-normal normal-case text-ink-2">{tierBlurb[g.tier]}</span>
                </span>
              </th>
            </tr>
            {g.envs.map((e) => (
              <tr key={e.slug} className="border-t border-line-soft align-top">
                <th scope="row" className="whitespace-nowrap px-3 py-2.5">
                  <Link href={`/environments/${encodeURIComponent(e.slug)}`} className="font-bold hover:underline">
                    {e.name}
                  </Link>
                </th>
                <td className="px-3 py-2.5">{e.protection.tier === "none" ? <span className="text-ink-3">No licence check</span> : <StateBadge p={e.protection} />}</td>
                <td className="px-3 py-2.5 text-ink-2">{e.protection.note || tierBlurb[e.protection.tier]}</td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
