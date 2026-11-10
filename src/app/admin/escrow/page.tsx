import Link from "next/link";
import { MarkerLookup } from "@/components/admin/marker-lookup";
import { SectionTitle } from "@/components/admin/parts";
import { PageHeader } from "@/components/dashboard/page-header";
import { Tag } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { selectClass } from "@/components/ui/form";
import { api, asList, qs } from "@/lib/api";
import type { KeyEventRow } from "@/lib/contract";
import { formatDateTime } from "@/lib/format";
import { formatFingerprint, REFUSAL_MEANING, refusalMeaning } from "@/lib/protection";

export const metadata = { title: "Escrow" };

type SP = { outcome?: string | string[]; reason?: string | string[]; license?: string | string[] };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim().slice(0, 64) || undefined;

export default async function EscrowAdminPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const outcome = one(sp.outcome) === "released" || one(sp.outcome) === "refused" ? one(sp.outcome) : undefined;
  const reason = one(sp.reason);
  const license = one(sp.license);
  const res = await api<KeyEventRow[] | { items: KeyEventRow[] }>(`/v1/admin/escrow/key-events${qs({ outcome, reason, license, limit: 200 })}`, { auth: true });
  const events = res.ok ? asList(res.data) : [];
  const filtered = Boolean(outcome || reason || license);

  return (
    <>
      <PageHeader
        eyebrow="trust & safety"
        title="Escrow."
        description="Resolve a watermark found in a copy, and read what the key endpoint answered. Traceability, not prevention: these tools say where a copy came from."
      />

      <div className="grid grid-cols-1 gap-12">
        <section aria-labelledby="marker-title">
          <SectionTitle id="marker-title">Marker lookup</SectionTitle>
          <p className="mt-2 max-w-prose text-[14px] text-ink-2">
            Each key release stamps the decrypted copy with a marker tied to one licence and one deployment. Paste a marker to see which.
            Every lookup is written to the audit log with your reason.
          </p>
          <div className="mt-4 max-w-[760px]">
            <MarkerLookup />
          </div>
        </section>

        <section aria-labelledby="events-title">
          <SectionTitle id="events-title">Key releases and refusals</SectionTitle>
          <p className="mt-2 max-w-prose text-[14px] text-ink-2">
            Every answer of <span className="font-mono">POST /v1/licenses/key</span>, newest first. The log never holds a key, wrapped or not.
          </p>
          <form method="get" role="search" aria-label="Filter the key log" className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[200px_240px_auto] sm:items-end">
            <div>
              <label htmlFor="outcome" className="block text-[13px] font-bold">
                Outcome
              </label>
              <select id="outcome" name="outcome" defaultValue={outcome ?? ""} className={selectClass}>
                <option value="">All</option>
                <option value="released">Released</option>
                <option value="refused">Refused</option>
              </select>
            </div>
            <div>
              <label htmlFor="reason" className="block text-[13px] font-bold">
                Refusal reason
              </label>
              <select id="reason" name="reason" defaultValue={reason ?? ""} className={selectClass}>
                <option value="">Any</option>
                {Object.keys(REFUSAL_MEANING).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className={buttonClass("secondary", "md")}>
                Filter
              </button>
              {filtered ? (
                <Link href="/admin/escrow" className="text-[14px] font-semibold text-cobalt-ink hover:underline">
                  Clear
                </Link>
              ) : null}
            </div>
          </form>

          {!res.ok ? (
            <ApiError className="mt-4" failure={res} title="The key log could not be loaded." />
          ) : events.length === 0 ? (
            <EmptyState className="mt-4" title={filtered ? "No entries match these filters" : "No server has asked for a key yet"} />
          ) : (
            <>
              <p className="tabular mb-2 mt-4 text-[13.5px] text-ink-3">
                {events.length} {events.length === 1 ? "entry" : "entries"} shown{license ? <> for licence <span className="font-mono">{license}</span></> : null}
              </p>
              <div className="panel relative overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-[13.5px]" data-key-events>
                  <caption className="sr-only">Key endpoint log, newest first</caption>
                  <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                    <tr>
                      <th scope="col" className="px-3 py-2.5">Time</th>
                      <th scope="col" className="px-3 py-2.5">Outcome</th>
                      <th scope="col" className="px-3 py-2.5">Package</th>
                      <th scope="col" className="px-3 py-2.5">Deployment</th>
                      <th scope="col" className="px-3 py-2.5">Server key</th>
                      <th scope="col" className="px-3 py-2.5">Licence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e) => (
                      <tr key={e.id} className="border-t border-line-soft align-top" data-outcome={e.outcome}>
                        <td className="tabular whitespace-nowrap px-3 py-2.5">
                          <time dateTime={e.at}>{formatDateTime(e.at)}</time>
                        </td>
                        <th scope="row" className="px-3 py-2.5 font-normal">
                          {e.outcome === "released" ? (
                            <Tag className="border-ok/45 bg-ok-soft text-ok">✓ released</Tag>
                          ) : (
                            <>
                              <Tag className="border-bad/45 bg-bad-soft text-bad" mono>
                                ✕ {e.reason ?? "refused"}
                              </Tag>
                              <span className="mt-1 block max-w-[280px] text-[12.5px] text-ink-2">{refusalMeaning(e.reason)}</span>
                            </>
                          )}
                        </th>
                        <td className="px-3 py-2.5">
                          <span className="break-all font-mono text-[12.5px]">{e.package ?? e.packageRef}</span>
                          {e.version ? <span className="tabular block text-[12.5px] text-ink-3">{e.version}</span> : null}
                        </td>
                        <td className="px-3 py-2.5">
                          {e.deploymentName ? <span className="font-mono text-[12.5px]">{e.deploymentName}</span> : <span className="text-ink-3">—</span>}
                          <span className="block text-[12.5px] text-ink-3">{e.environment}</span>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[12.5px]">{formatFingerprint(e.serverKeyFingerprint)}</td>
                        <td className="px-3 py-2.5">
                          {e.licenseId ? (
                            <Link href={`/admin/escrow${qs({ license: e.licenseId })}`} className="break-all font-mono text-[11.5px] hover:underline" title="Only this licence">
                              {e.licenseId}
                            </Link>
                          ) : (
                            <span className="text-ink-3">no licence matched</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
