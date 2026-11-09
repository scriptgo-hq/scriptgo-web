import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { KeyValue } from "@/components/ui/data";
import { Banner, EmptyState } from "@/components/ui/feedback";
import { AdapterStateBadge, InlineCodeText } from "@/components/ui/integration";
import type { EnvironmentDetail, ProofRun } from "@/lib/contract";
import { formatDate } from "@/lib/format";
import { integrationTypeLabel, sidesLabel } from "@/lib/integration";
import { metaFor, salesMeta } from "@/lib/status";

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
      runtimes: runs.map((r) => (r.lua && r.lua !== r.runtime ? `${r.runtime} · ${r.lua}` : r.runtime)),
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
              labelWidth="6.5rem"
              items={[
                {
                  label: "Type",
                  value: <Tag title={integrationTypeLabel(i.type).hint}>{integrationTypeLabel(i.type).label}</Tag>,
                },
                { label: "Runtime", value: <InlineCodeText text={i.runtime} /> },
                { label: "Sides", value: sidesLabel(e.sides) },
                {
                  label: "Selling",
                  value: (
                    <span className="inline-flex flex-wrap items-center gap-2">
                      <StatusBadge meta={metaFor(salesMeta, e.sales)} size="sm" />
                      {e.salesNote ? <span className="text-ink-2">{e.salesNote}</span> : null}
                    </span>
                  ),
                },
                { label: "Adapter", value: <AdapterStateBadge state={e.adapterState} long /> },
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
