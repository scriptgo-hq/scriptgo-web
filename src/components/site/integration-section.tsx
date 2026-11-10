import Link from "next/link";
import { ReadMore } from "@/components/site/diagrams";
import { CalendarClock } from "lucide-react";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { KeyValue } from "@/components/ui/data";
import { Banner, EmptyState } from "@/components/ui/feedback";
import { AdapterStateBadge, InlineCodeText } from "@/components/ui/integration";
import type { Environment, EnvironmentDetail, EnvironmentProtection, ProofRun } from "@/lib/contract";
import { formatDate } from "@/lib/format";
import { integrationTypeLabel, sidesLabel } from "@/lib/integration";
import { platformRulesInfo } from "@/lib/platform-rules";
import { groupByTier, protectionLead, protectionNote, tierMeta, tierShort } from "@/lib/protection";
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

/** First sentence of a registry text, and what follows it. Backtick spans are never cut. */
function splitFirstSentence(text: string): [string, string] {
  const m = /^((?:`[^`]*`|[^`])*?[.!?])\s+(?=[A-Z`])([\s\S]+)$/.exec(text.trim());
  return m ? [m[1]!, m[2]!] : [text.trim(), ""];
}

/** The environment page's "Integration" section: how packages run there, and what real runs proved. */
export function IntegrationSection({ env: e }: { env: EnvironmentDetail }) {
  const i = e.integration;
  // The registry writes a paragraph; the page shows its first sentence and keeps the rest one click away.
  const [first, rest] = splitFirstSentence(i?.summary ?? "");
  return (
    <section aria-labelledby="integration-title" className="mt-10">
      <h2 id="integration-title" className="display text-[30px]">
        Integration.
      </h2>
      {!i ? (
        <EmptyState icon={CalendarClock} title="Not started" className="mt-4">
          No adapter code exists for {e.name} yet. The summary above is the intended approach.
        </EmptyState>
      ) : (
        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <p className="max-w-[62ch] text-[15.5px] leading-relaxed text-ink-2">
              <InlineCodeText text={first} />
            </p>
            {rest ? (
              <details className="mt-2 max-w-[62ch] text-[15px] text-ink-2">
                <summary className="cursor-pointer text-[14px] font-semibold text-cobalt-ink">How it is wired, in full</summary>
                <p className="mt-2 leading-relaxed">
                  <InlineCodeText text={rest} />
                </p>
              </details>
            ) : null}
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
                    <a href="#platform-rule-title" className="inline-flex" title={platformRulesInfo(e).note}>
                      <StatusBadge meta={platformRulesInfo(e).meta} size="sm" />
                    </a>
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
                <p className="mt-3">
                  <ReadMore href="/docs/environments#how-a-status-is-earned" className="!text-[14px]">
                    What counts as a real run
                  </ReadMore>
                </p>
              </>
            ) : e.adapterState === "written" ? (
              <Banner tone="info" title="Adapter written, awaiting a real run." className="mt-3">
                {e.blockedOn || "No run in the real runtime has passed yet."}
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
          <p className="max-w-[70ch] font-semibold text-ink">{lead ?? tierShort[p.tier]}</p>
          <details className="mt-2 max-w-[70ch]">
            <summary className="cursor-pointer text-[14px] font-semibold text-cobalt-ink">What a buyer&rsquo;s server gets in {e.name}, in full</summary>
            <p className="mt-2">{protectionNote(p)}</p>
          </details>
          <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13.5px] text-ink-3">
            Deterrence, traceability and revocation; never a promise that code cannot be copied.
            <ReadMore href="/protect" className="!text-[14px] text-ink">
              How protection works
            </ReadMore>
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Every environment by protection tier, from the API: one sheet per tier, the strongest first. Used
 * by the directory and by /protect, so the two can never disagree. The registry's own sentence for
 * an environment is on its page.
 */
export function ProtectionTierTable({ envs, caption = "Protection tier by environment" }: { envs: Environment[]; caption?: string }) {
  const groups = groupByTier(envs);
  return (
    <div className="grid gap-7 lg:grid-cols-3 lg:items-start">
      {groups.map((g) => (
        <section key={g.tier} className="sticker" aria-label={tierMeta[g.tier].label}>
          <div className="border-b-[2.5px] border-line bg-paper p-4">
            <StatusBadge meta={tierMeta[g.tier]} />
            <p className="mt-2.5 text-[14.5px] text-ink-2">{tierShort[g.tier]}</p>
          </div>
          <table className="w-full text-left text-[14.5px]">
            <caption className="sr-only">
              {caption}: {tierMeta[g.tier].label}
            </caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Environment</th>
                <th scope="col">State</th>
              </tr>
            </thead>
            <tbody>
              {g.envs.map((e) => (
                <tr key={e.slug} className="border-t-[1.5px] border-line-soft first:border-t-0">
                  <th scope="row" className="px-4 py-2.5">
                    <Link href={`/environments/${encodeURIComponent(e.slug)}`} className="font-bold hover:underline">
                      {e.name}
                    </Link>
                  </th>
                  <td className="px-4 py-2.5 text-right">
                    {e.protection.tier === "none" ? <span className="text-ink-3">Signed releases</span> : <StateBadge p={e.protection} />}
                    {e.protection.optIn ? <span className="mt-1 block text-[12.5px] leading-snug text-ink-3">opt-in server feature</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
