import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { CreateTokenForm, CreatorProfileForm, RevokeTokenButton } from "@/components/dashboard/settings-forms";
import { PageHeader } from "@/components/dashboard/page-header";
import { KeyValue } from "@/components/ui/data";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { api } from "@/lib/api";
import type { TokenSummary } from "@/lib/contract";
import { formatDate, formatDateTime, relativeTime } from "@/lib/format";
import { getMe } from "@/lib/session";
import { mailEnabled } from "@/lib/platform";
import { VerifyEmailButton } from "@/components/site/password-forms";

export const metadata = { title: "Settings" };

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-display text-[24px] font-extrabold tracking-[-0.02em]">
      {children}
    </h2>
  );
}

export default async function SettingsPage() {
  const me = await getMe();
  if (!me.ok) return <ApiError failure={me} />;
  const { user, creatorProfile: cp, roles } = me.data;
  const [tokens, mail] = await Promise.all([api<TokenSummary[]>("/v1/me/tokens", { auth: true }), mailEnabled()]);

  return (
    <>
      <PageHeader eyebrow="settings" title="Settings." />

      <div className="grid grid-cols-1 gap-12">
        <section aria-labelledby="account-title" className="scroll-mt-20">
          <SectionTitle id="account-title">Account</SectionTitle>
          <div className="panel mt-4 p-4">
            <KeyValue
              items={[
                { label: "Name", value: user.name },
                {
                  label: "Email",
                  value: (
                    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                      {user.email} {user.emailVerified ? <span className="text-ok">· verified</span> : <span className="text-ink-3">· not verified</span>}
                      {!user.emailVerified && mail ? <VerifyEmailButton email={user.email} /> : null}
                    </span>
                  ),
                },
                {
                  label: "Account id",
                  value: (
                    <span className="inline-flex flex-col">
                      <code className="break-all font-mono text-[13px]" data-account-id>
                        {user.id}
                      </code>
                      <span className="text-[12.5px] text-ink-3">Not a secret. Give it to a creator who wants to grant you a free license.</span>
                    </span>
                  ),
                },
                { label: "Roles", value: roles.length ? roles.join(", ") : "customer" },
                { label: "Member since", value: formatDate(user.createdAt) },
              ]}
            />
          </div>
        </section>

        <section id="creator" aria-labelledby="creator-title" className="scroll-mt-20">
          <SectionTitle id="creator-title">Creator profile</SectionTitle>
          {cp ? (
            <div className="panel mt-4 p-4">
              <KeyValue
                items={[
                  {
                    label: "Namespace",
                    value: (
                      <span className="font-mono">
                        {cp.username}
                        <span className="text-cobalt-ink">//</span>
                      </span>
                    ),
                  },
                  {
                    label: "Display name",
                    value: (
                      <span className="inline-flex items-center gap-1">
                        {cp.displayName}
                        {cp.firstParty ? (
                          <>
                            <BadgeCheck aria-hidden="true" size={15} className="text-cobalt-ink" /> <span className="text-[13px]">First party</span>
                          </>
                        ) : null}
                      </span>
                    ),
                  },
                  { label: "Bio", value: cp.bio || <span className="text-ink-3">None</span> },
                  {
                    label: "Links",
                    value: cp.links.length ? (
                      <ul className="space-y-0.5">
                        {cp.links.map((l) => (
                          <li key={l} className="break-all font-mono text-[13px]">
                            {l}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-ink-3">None</span>
                    ),
                  },
                  { label: "Joined", value: formatDate(cp.joinedAt) },
                ]}
              />
              <p className="mt-4 text-[13.5px] text-ink-3">
                Public page:{" "}
                <Link href={`/creators/${encodeURIComponent(cp.username)}`} className="font-semibold text-cobalt-ink underline">
                  /creators/{cp.username}
                </Link>
                . Profile edits are not available yet: the API has no update endpoint.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <p className="max-w-prose text-[15px] text-ink-2">
                A creator profile lets you publish packages under your own namespace and connect a store. It&rsquo;s free. Nothing you sell
                waits for a review: you declare your rights and answer for what you sell, and SCRIPT//GO acts on reports.
              </p>
              <div className="sticker p-5">
                <CreatorProfileForm suggestedName={user.name} />
              </div>
            </div>
          )}
        </section>

        <section id="tokens" aria-labelledby="tokens-title" className="scroll-mt-20">
          <SectionTitle id="tokens-title">Access tokens</SectionTitle>
          <p className="mt-2 max-w-prose text-[14.5px] text-ink-2">
            Personal access tokens let the <Link href="/docs/cli" className="font-semibold text-cobalt-ink underline">CLI</Link> act as you. Each token
            is shown once. Revoke any token you no longer use.
          </p>
          <div className="mt-4">
            <CreateTokenForm />
          </div>
          {!tokens.ok ? (
            <ApiError compact className="mt-4" failure={tokens} title="Your tokens couldn't be loaded." />
          ) : tokens.data.length === 0 ? (
            <EmptyState title="No active tokens" className="mt-4" />
          ) : (
            <div className="panel mt-4 relative overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[14px]">
                <caption className="sr-only">Active access tokens</caption>
                <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                  <tr>
                    <th scope="col" className="px-3 py-2.5">Name</th>
                    <th scope="col" className="px-3 py-2.5">Token</th>
                    <th scope="col" className="px-3 py-2.5">Created</th>
                    <th scope="col" className="px-3 py-2.5">Last used</th>
                    <th scope="col" className="px-3 py-2.5">Expires</th>
                    <th scope="col" className="px-3 py-2.5"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.data.map((t) => (
                    <tr key={t.id} className="border-t border-line-soft">
                      <th scope="row" className="px-3 py-2.5 font-semibold">{t.name}</th>
                      <td className="px-3 py-2.5 font-mono text-[13px]">{t.preview}</td>
                      <td className="tabular px-3 py-2.5">{formatDate(t.createdAt)}</td>
                      <td className="tabular px-3 py-2.5">
                        {t.lastUsedAt ? (
                          <time dateTime={t.lastUsedAt} title={formatDateTime(t.lastUsedAt)}>
                            {relativeTime(t.lastUsedAt)}
                          </time>
                        ) : (
                          "never"
                        )}
                      </td>
                      <td className="tabular px-3 py-2.5">{t.expiresAt ? formatDate(t.expiresAt) : "never"}</td>
                      <td className="px-3 py-2.5 text-right">
                        <RevokeTokenButton id={t.id} name={t.name} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
