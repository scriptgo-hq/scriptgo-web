import { GrantForm, RevokeGrantButton } from "@/components/dashboard/grant-forms";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { Meter } from "@/components/ui/data";
import { ApiError } from "@/components/ui/feedback";
import { api } from "@/lib/api";
import type { GrantList } from "@/lib/contract";
import { envName } from "@/lib/env";
import { formatDate, formatDateTime, relativeTime } from "@/lib/format";
import { formatFingerprint } from "@/lib/protection";
import { licenseMeta, metaFor } from "@/lib/status";

/**
 * "Protect without selling": the free licenses a creator granted for one package, the form to grant
 * another one and the button to revoke. Nothing here involves a price or a payment provider.
 */
export async function GrantsPanel({
  packageName,
  identifier,
  environments,
  isPrivate = false,
}: {
  packageName: string;
  identifier: string;
  environments: { slug: string; name: string }[];
  isPrivate?: boolean;
}) {
  const res = await api<GrantList>(`/v1/creator/packages/${encodeURIComponent(packageName)}/grants`, { auth: true });
  if (!res.ok) return <ApiError compact className="mt-4" failure={res} title="The granted licenses couldn't be loaded." />;
  const { grants, canGrant, blockedReason, perDay, grantedToday } = res.data;
  return (
    <div className="mt-4 space-y-4" data-grants>
      {grants.length === 0 ? (
        <p className="text-[14.5px] text-ink-3">No license granted yet.</p>
      ) : (
        <div className="panel relative overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[14px]">
            <caption className="sr-only">Free licenses granted for {identifier}</caption>
            <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
              <tr>
                <th scope="col" className="px-3 py-2.5">Granted to</th>
                <th scope="col" className="px-3 py-2.5">Status</th>
                <th scope="col" className="px-3 py-2.5">Covers</th>
                <th scope="col" className="px-3 py-2.5">Since</th>
                <th scope="col" className="px-3 py-2.5">Last key released</th>
                <th scope="col" className="px-3 py-2.5"><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {grants.map((g) => {
                const live = g.status === "active";
                const who = g.recipient.kind === "server_key" ? `server ${g.recipient.name}` : g.recipient.name;
                return (
                  <tr key={g.id} className="border-t border-line-soft align-top" data-grant={g.id} data-grant-status={g.status}>
                    <th scope="row" className="px-3 py-2.5 font-normal">
                      {g.recipient.kind === "server_key" ? (
                        <>
                          <span className="font-semibold">Server key</span>{" "}
                          <span className="font-mono text-[13px]" title="Fingerprint of the server key this license is bound to">
                            {g.recipient.serverKeyFingerprint ? formatFingerprint(g.recipient.serverKeyFingerprint) : "reset, not bound"}
                          </span>
                          <span className="block text-[12.5px] text-ink-3">deployment {g.recipient.name} · held by you</span>
                        </>
                      ) : (
                        <>
                          <span className="font-mono text-[13.5px] font-semibold">{g.recipient.name}</span>
                          <span className="block text-[12.5px] text-ink-3">account</span>
                        </>
                      )}
                      {g.note ? <span className="block text-[12.5px] text-ink-2">{g.note}</span> : null}
                    </th>
                    <td className="px-3 py-2.5">
                      <StatusBadge meta={g.status === "revoked" ? { ...licenseMeta.revoked, hint: "Revoked." } : metaFor(licenseMeta, g.status)} size="sm" />
                      {g.status === "revoked" && g.revokedReason ? <span className="mt-1 block max-w-[220px] text-[12.5px] text-ink-2">{g.revokedReason}</span> : null}
                      {live && g.expiresAt ? <span className="tabular mt-1 block text-[12.5px] text-ink-3">until {formatDate(g.expiresAt)}</span> : null}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="flex flex-wrap gap-1">
                        {g.environments.length ? g.environments.map((e) => <Tag key={e}>{envName(e)}</Tag>) : <span className="text-ink-2">All environments</span>}
                      </span>
                      <Meter used={g.deploymentsUsed} allowed={g.deploymentsAllowed} className="mt-1" />
                    </td>
                    <td className="tabular px-3 py-2.5">{formatDate(g.createdAt)}</td>
                    <td className="tabular px-3 py-2.5">
                      {g.lastKeyReleaseAt ? (
                        <time dateTime={g.lastKeyReleaseAt} title={formatDateTime(g.lastKeyReleaseAt)}>
                          {relativeTime(g.lastKeyReleaseAt)}
                        </time>
                      ) : (
                        <span className="text-ink-3">never</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">{g.status !== "revoked" && g.status !== "expired" && g.status !== "refunded" ? <RevokeGrantButton id={g.id} who={who} /> : null}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <GrantForm
        packageName={packageName}
        identifier={identifier}
        environments={environments}
        isPrivate={isPrivate}
        blockedReason={canGrant ? null : (blockedReason ?? "Granting is not available right now.")}
      />
      {perDay > 0 ? (
        <p className="tabular text-[12.5px] text-ink-3">
          {grantedToday} of {perDay} grants used for this package in the last 24 hours. Every grant and every revocation is recorded.
        </p>
      ) : null}
    </div>
  );
}
