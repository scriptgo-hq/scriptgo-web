import Link from "next/link";
import { ACTOR_LABELS } from "@/components/admin/status";
import { PageHeader } from "@/components/dashboard/page-header";
import { buttonClass } from "@/components/ui/button";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { inputClass } from "@/components/ui/form";
import { api, asList, qs } from "@/lib/api";
import type { AuditEntry } from "@/lib/contract";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Audit log" };

type SP = { subject?: string | string[]; actor?: string | string[] };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim().slice(0, 200) || undefined;

export default async function AuditPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const subject = one(sp.subject);
  const actor = one(sp.actor);
  const res = await api<AuditEntry[] | { items: AuditEntry[] }>(`/v1/admin/audit${qs({ subject, actor })}`, { auth: true });
  const entries = res.ok ? asList(res.data) : [];

  return (
    <>
      <PageHeader eyebrow="operations" title="Audit log." description="Every state change on licenses, listings, offers, stores, cases and tokens, with who did it." />

      <form method="get" role="search" aria-label="Filter the audit log" className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <div>
          <label htmlFor="subject" className="block text-[13px] font-bold">
            Subject id
          </label>
          <input id="subject" name="subject" defaultValue={subject ?? ""} placeholder="license, package, report id…" className={inputClass} aria-describedby="filter-hint" />
        </div>
        <div>
          <label htmlFor="actor" className="block text-[13px] font-bold">
            Actor id
          </label>
          <input id="actor" name="actor" defaultValue={actor ?? ""} placeholder="user id" className={inputClass} aria-describedby="filter-hint" />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className={buttonClass("secondary", "md")}>
            Filter
          </button>
          {subject || actor ? (
            <Link href="/admin/audit" className="text-[14px] font-semibold text-cobalt-ink hover:underline">
              Clear
            </Link>
          ) : null}
        </div>
        <p id="filter-hint" className="text-[12.5px] text-ink-3 sm:col-span-3">
          Exact ids, as shown in the Subject column or in a case&rsquo;s audit trail.
        </p>
      </form>

      {!res.ok ? (
        <ApiError failure={res} title="The audit log could not be loaded." />
      ) : entries.length === 0 ? (
        <EmptyState title={subject || actor ? "No entries match these filters" : "The audit log is empty"} />
      ) : (
        <>
          <p className="tabular mb-2 text-[13.5px] text-ink-3">
            {entries.length} {entries.length === 1 ? "entry" : "entries"} shown
          </p>
          <div className="panel relative overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-[13.5px]">
              <caption className="sr-only">Audit log entries, newest as returned by the API</caption>
              <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                <tr>
                  <th scope="col" className="px-3 py-2.5">Time</th>
                  <th scope="col" className="px-3 py-2.5">Actor</th>
                  <th scope="col" className="px-3 py-2.5">Action</th>
                  <th scope="col" className="px-3 py-2.5">Subject</th>
                  <th scope="col" className="px-3 py-2.5">Reference</th>
                  <th scope="col" className="px-3 py-2.5">Data</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  const hasData = e.data && Object.keys(e.data).length > 0;
                  return (
                    <tr key={e.id} className="border-t border-line-soft align-top">
                      <td className="tabular whitespace-nowrap px-3 py-2.5">
                        <time dateTime={e.at}>{formatDateTime(e.at)}</time>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-semibold">{ACTOR_LABELS[e.actor.type] ?? e.actor.type}</span>
                        {e.actor.label ? <span className="block text-ink-2">{e.actor.label}</span> : null}
                        {e.actor.id ? (
                          <Link href={`/admin/audit${qs({ actor: e.actor.id })}`} className="block break-all font-mono text-[11.5px] text-ink-3 hover:underline" title="Filter by this actor">
                            {e.actor.id}
                          </Link>
                        ) : null}
                      </td>
                      <th scope="row" className="px-3 py-2.5 font-mono text-[12.5px] font-semibold">
                        {e.action}
                      </th>
                      <td className="px-3 py-2.5">
                        <span className="text-ink-2">{e.subject.type}</span>
                        <Link href={`/admin/audit${qs({ subject: e.subject.id })}`} className="block break-all font-mono text-[11.5px] hover:underline" title="Filter by this subject">
                          {e.subject.id}
                        </Link>
                      </td>
                      <td className="break-all px-3 py-2.5 font-mono text-[12px]">{e.reference ?? "—"}</td>
                      <td className="px-3 py-2.5">
                        {hasData ? (
                          <details>
                            <summary className="cursor-pointer text-[12.5px] font-semibold text-cobalt-ink">
                              {Object.keys(e.data).length} {Object.keys(e.data).length === 1 ? "field" : "fields"}
                            </summary>
                            <pre className="mt-1 max-w-[340px] relative overflow-x-auto rounded-md bg-code-bg p-2 font-mono text-[11.5px] text-code-fg">{JSON.stringify(e.data, null, 2)}</pre>
                          </details>
                        ) : (
                          <span className="text-ink-3">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
