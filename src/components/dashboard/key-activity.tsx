import { ApiError } from "@/components/ui/feedback";
import { api } from "@/lib/api";
import type { KeyActivity } from "@/lib/contract";
import { formatDateTime } from "@/lib/format";
import { refusalMeaning } from "@/lib/protection";

/**
 * Key-endpoint activity of one package over the last 30 days. Every number is counted from the log
 * of POST /v1/licenses/key: nothing is estimated, and an empty log is said to be empty.
 */
export async function KeyActivityPanel({ packageName }: { packageName: string }) {
  const res = await api<KeyActivity>(`/v1/creator/packages/${encodeURIComponent(packageName)}/key-activity?days=30`, { auth: true });
  if (!res.ok) return <ApiError compact className="mt-4" failure={res} title="The key activity couldn't be loaded." />;
  const a = res.data;
  const reasons = Object.entries(a.refusalsByReason).sort((x, y) => y[1] - x[1]);
  const tiles: { label: string; value: string; hint: string }[] = [
    { label: "Keys released", value: String(a.released), hint: a.lastReleasedAt ? `last ${formatDateTime(a.lastReleasedAt)}` : "none yet" },
    { label: "Servers served", value: String(a.deployments), hint: "deployments that received a key" },
    { label: "Refusals", value: String(a.refused), hint: a.lastRefusedAt ? `last ${formatDateTime(a.lastRefusedAt)}` : "none" },
  ];
  return (
    <div className="mt-4 space-y-4" data-key-activity>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="panel p-4">
            <dt className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">{t.label}</dt>
            <dd className="tabular mt-1 font-display text-[30px] font-extrabold leading-none" data-key-activity-value={t.label}>
              {t.value}
            </dd>
            <dd className="tabular mt-1 text-[12.5px] text-ink-3">{t.hint}</dd>
          </div>
        ))}
      </dl>
      {a.released === 0 && a.refused === 0 ? (
        <p className="text-[14px] text-ink-3">No server has asked for a key in the last {a.days} days.</p>
      ) : null}
      {reasons.length > 0 ? (
        <div className="panel relative overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[14px]">
            <caption className="sr-only">Refused key requests by reason, last {a.days} days</caption>
            <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
              <tr>
                <th scope="col" className="px-3 py-2.5">Refusal reason</th>
                <th scope="col" className="px-3 py-2.5 text-right">Count</th>
                <th scope="col" className="px-3 py-2.5">What it means</th>
              </tr>
            </thead>
            <tbody>
              {reasons.map(([reason, n]) => (
                <tr key={reason} className="border-t border-line-soft align-top">
                  <th scope="row" className="px-3 py-2.5 font-mono text-[13px] font-semibold">{reason}</th>
                  <td className="tabular px-3 py-2.5 text-right">{n}</td>
                  <td className="px-3 py-2.5 text-ink-2">{refusalMeaning(reason)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <p className="text-[13px] text-ink-3">
        Counted from the key endpoint&rsquo;s log over the last {a.days} days. A refusal is a server that was told no: a refunded or revoked
        licence, or a copy on a machine that is not the bound one. Requests with a key that matches no licence are not attributed to a package.
      </p>
    </div>
  );
}
