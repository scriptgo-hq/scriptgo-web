import Link from "next/link";
import { DeclarePerkButton, PerkForm, RevokeServerLinkButton, ServerLinkForm, WithdrawPerkButton } from "@/components/dashboard/perk-forms";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ApiError, Banner, EmptyState } from "@/components/ui/feedback";
import { api } from "@/lib/api";
import type { Perk, PerkHolder, ServerLink, Store } from "@/lib/contract";
import { formatDate, formatDateTime, formatMoney, relativeTime } from "@/lib/format";
import { getMe } from "@/lib/session";
import { classificationMeta, licenseMeta, metaFor } from "@/lib/status";

export const metadata = { title: "Perks" };

const INTERVAL: Record<Perk["interval"], string> = { month: "per month", perpetual: "once" };

function PerkRow({ p }: { p: Perk }) {
  return (
    <tr className="border-t border-line-soft align-top" data-perk={p.key} data-perk-purchasable={p.purchasable ? "yes" : "no"}>
      <th scope="row" className="px-3 py-2.5 font-normal">
        <span className="font-mono text-[13.5px] font-semibold">{p.key}</span>
        <span className="block text-[13.5px]">{p.name}</span>
        {p.description ? <span className="block max-w-[320px] text-[12.5px] text-ink-3">{p.description}</span> : null}
      </th>
      <td className="tabular px-3 py-2.5">
        {formatMoney(p.price)} <span className="text-ink-3">{INTERVAL[p.interval]}</span>
        <span className="block text-[12.5px] text-ink-3">{p.provider === "tebex" ? "Tebex" : p.provider === "mock" ? "Test provider" : "no store"}</span>
      </td>
      <td className="px-3 py-2.5">
        {p.active ? <StatusBadge meta={metaFor(classificationMeta, p.classification)} size="sm" /> : <Tag>No longer sold</Tag>}
        {p.active && !p.purchasable && p.notPurchasableReason ? (
          <span className="mt-1 block max-w-[320px] text-[12.5px] text-ink-2" data-perk-reason>
            {p.notPurchasableReason}
          </span>
        ) : null}
        {p.active && p.purchasable ? <span className="mt-1 block text-[12.5px] text-ink-3">On sale: your servers can hand out purchase links.</span> : null}
      </td>
      <td className="tabular px-3 py-2.5">{p.holders}</td>
      <td className="px-3 py-2.5 text-right">
        <span className="inline-flex flex-wrap justify-end gap-2">
          {p.active && p.classification === "undeclared" ? <DeclarePerkButton id={p.id} /> : null}
          {p.active ? <WithdrawPerkButton id={p.id} name={p.name} /> : null}
        </span>
      </td>
    </tr>
  );
}

export default async function PerksPage() {
  const me = await getMe();
  if (!me.ok) return <ApiError failure={me} />;
  if (!me.data.creatorProfile) {
    return (
      <>
        <PageHeader eyebrow="publishing" title="Perks." />
        <EmptyState title="Perks belong to a seller profile" action={<ButtonLink href="/dashboard/settings#creator">Create a creator profile</ButtonLink>}>
          A server operator who sells perks to players is a seller here: it takes the same profile as publishing a package.
        </EmptyState>
      </>
    );
  }
  const [perks, holders, links, stores] = await Promise.all([
    api<Perk[]>("/v1/creator/perks", { auth: true }),
    api<PerkHolder[]>("/v1/creator/perk-holders", { auth: true }),
    api<ServerLink[]>("/v1/creator/server-links", { auth: true }),
    api<Store[]>("/v1/creator/stores", { auth: true }),
  ]);
  const providers = stores.ok ? stores.data.map((s) => s.provider) : [];
  const suspended = stores.ok && stores.data.some((s) => s.suspended);

  return (
    <>
      <PageHeader
        eyebrow="publishing"
        title="Perks."
        description="Sell a perk to the players of your own servers, such as a monthly VIP. Your store takes the payment, SCRIPT//GO tells your servers who has it, and your own script applies it."
      />

      <section aria-labelledby="perks-how" className="sticker p-5" data-perks-explained>
        <h2 id="perks-how" className="font-display text-[20px] font-extrabold">
          What this is, and what it is not.
        </h2>
        <ul className="mt-3 max-w-[78ch] list-disc space-y-1.5 pl-5 text-[14.5px] text-ink-2">
          <li>
            <strong className="text-ink">What is sold is a feature of your own script, on your own server.</strong> A perk is a key (&ldquo;vip&rdquo;) that
            your script asks about; what it gives the player is whatever your script does with the answer.
          </li>
          <li>
            <strong className="text-ink">Your own store takes the payment.</strong> The player pays in your Tebex store. SCRIPT//GO never holds the money:
            it only hears from the payment provider that a payment, a renewal, a cancellation or a refund happened.
          </li>
          <li>
            <strong className="text-ink">Your game server never talks to the payment provider.</strong> It asks SCRIPT//GO, with the token of a server link,
            and gets nothing without one.
          </li>
          <li>
            <strong className="text-ink">SCRIPT//GO does not review offers before sale and acts on reports.</strong> You declare your rights and answer for
            what you sell, and to the game platform&rsquo;s rights holder for selling it there. After a report, staff can put a perk on hold or suspend a
            store, with a notice and an appeal.
          </li>
          <li>
            <strong className="text-ink">A player is an identifier, as your platform gives it</strong> (a Steam id, an account id). It is only as trustworthy
            as that platform&rsquo;s own sign-in.
          </li>
        </ul>
        <p className="mt-3 text-[14px]">
          <Link href="/docs/perks" className="font-semibold underline">
            The protocol and the script API
          </Link>
        </p>
      </section>

      {suspended ? (
        <Banner tone="danger" className="mt-6" title="Your store is suspended.">
          Nothing can be bought through it, perks included. The decision is in your <Link href="/dashboard/notices" className="font-semibold underline">notices</Link>, where you can appeal.
        </Banner>
      ) : null}

      <section aria-labelledby="perks-offers" className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="perks-offers" className="font-display text-[24px] font-extrabold">
            Perk offers.
          </h2>
          {stores.ok ? <PerkForm providers={providers} /> : null}
        </div>
        {!perks.ok ? (
          <ApiError compact className="mt-4" failure={perks} title="Your perks couldn't be loaded." />
        ) : perks.data.length === 0 ? (
          <p className="mt-4 text-[14.5px] text-ink-3">No perk yet.</p>
        ) : (
          <div className="panel relative mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-[14px]">
              <caption className="sr-only">Your perk offers</caption>
              <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                <tr>
                  <th scope="col" className="px-3 py-2.5">Perk</th>
                  <th scope="col" className="px-3 py-2.5">Price</th>
                  <th scope="col" className="px-3 py-2.5">Sale</th>
                  <th scope="col" className="px-3 py-2.5">Holders</th>
                  <th scope="col" className="px-3 py-2.5"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {perks.data.map((p) => (
                  <PerkRow key={p.id} p={p} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="perks-servers" className="mt-10">
        <h2 id="perks-servers" className="font-display text-[24px] font-extrabold">
          Servers.
        </h2>
        <p className="mt-1 max-w-[70ch] text-[14.5px] text-ink-2">
          A game server is linked to your account with a token of its own. With it, the server can ask which of your players have which of your perks,
          and nothing else. A server without a link gets nothing.
        </p>
        {!links.ok ? (
          <ApiError compact className="mt-4" failure={links} title="Your linked servers couldn't be loaded." />
        ) : (
          <>
            {links.data.length > 0 ? (
              <div className="panel relative mt-4 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-[14px]">
                  <caption className="sr-only">Game servers linked to your account</caption>
                  <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                    <tr>
                      <th scope="col" className="px-3 py-2.5">Server</th>
                      <th scope="col" className="px-3 py-2.5">Token</th>
                      <th scope="col" className="px-3 py-2.5">Last seen</th>
                      <th scope="col" className="px-3 py-2.5">Events waiting</th>
                      <th scope="col" className="px-3 py-2.5"><span className="sr-only">Action</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.data.map((l) => (
                      <tr key={l.id} className="border-t border-line-soft align-top" data-server-link={l.name} data-server-link-revoked={l.revoked ? "yes" : "no"}>
                        <th scope="row" className="px-3 py-2.5 font-mono text-[13.5px] font-semibold">
                          {l.name}
                          <span className="block font-sans text-[12.5px] font-normal text-ink-3">linked {formatDate(l.createdAt)}</span>
                        </th>
                        <td className="px-3 py-2.5 font-mono text-[13px]">{l.revoked ? <Tag>Revoked</Tag> : l.tokenPreview}</td>
                        <td className="tabular px-3 py-2.5">
                          {l.lastSeenAt ? (
                            <>
                              <time dateTime={l.lastSeenAt} title={formatDateTime(l.lastSeenAt)}>
                                {relativeTime(l.lastSeenAt)}
                              </time>
                              <span className="block text-[12.5px] text-ink-3">{[l.environment, l.adapterVersion].filter(Boolean).join(" · ")}</span>
                            </>
                          ) : (
                            <span className="text-ink-3">never</span>
                          )}
                        </td>
                        <td className="tabular px-3 py-2.5">{l.revoked ? "—" : l.pendingEvents}</td>
                        <td className="px-3 py-2.5 text-right">{l.revoked ? null : <RevokeServerLinkButton id={l.id} name={l.name} />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            <div className="mt-4">
              <ServerLinkForm />
            </div>
          </>
        )}
      </section>

      <section aria-labelledby="perks-holders" className="mt-10">
        <h2 id="perks-holders" className="font-display text-[24px] font-extrabold">
          Holders.
        </h2>
        <p className="mt-1 max-w-[70ch] text-[14.5px] text-ink-2">
          The players who bought one of your perks. You see their player identifier and the payment references of your own store; SCRIPT//GO has no name,
          e-mail or card of theirs.
        </p>
        {!holders.ok ? (
          <ApiError compact className="mt-4" failure={holders} title="The holders couldn't be loaded." />
        ) : holders.data.length === 0 ? (
          <p className="mt-4 text-[14.5px] text-ink-3">Nobody yet. A perk appears here once your store confirms a payment.</p>
        ) : (
          <div className="panel relative mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-[14px]">
              <caption className="sr-only">Players who hold or held your perks</caption>
              <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                <tr>
                  <th scope="col" className="px-3 py-2.5">Player</th>
                  <th scope="col" className="px-3 py-2.5">Perk</th>
                  <th scope="col" className="px-3 py-2.5">Status</th>
                  <th scope="col" className="px-3 py-2.5">Period end</th>
                  <th scope="col" className="px-3 py-2.5">Payment</th>
                  <th scope="col" className="px-3 py-2.5">Since</th>
                </tr>
              </thead>
              <tbody>
                {holders.data.map((h) => (
                  <tr key={h.id} className="border-t border-line-soft align-top" data-holder={h.player} data-holder-perk={h.perkKey} data-holder-status={h.status} data-holder-has={h.has ? "yes" : "no"}>
                    <th scope="row" className="break-all px-3 py-2.5 font-mono text-[13px] font-semibold">
                      {h.player}
                      {h.serverLinkName ? <span className="block font-sans text-[12.5px] font-normal text-ink-3">bought from {h.serverLinkName}</span> : null}
                    </th>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-[13.5px]">{h.perkKey}</span>
                      <span className="block text-[12.5px] text-ink-3">{h.perkName}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge meta={metaFor(licenseMeta, h.status)} size="sm" />
                      {h.disputed ? <span className="mt-1 block text-[12.5px] font-semibold text-warn">Payment disputed</span> : null}
                      {h.status === "cancelled_active" ? <span className="mt-1 block text-[12.5px] text-ink-3">cancelled: keeps it until the period ends</span> : null}
                      {h.revokedReason ? <span className="mt-1 block max-w-[220px] text-[12.5px] text-ink-2">{h.revokedReason}</span> : null}
                    </td>
                    <td className="tabular px-3 py-2.5">{h.currentPeriodEnd ? formatDate(h.currentPeriodEnd) : h.has ? "no end" : "—"}</td>
                    <td className="px-3 py-2.5 font-mono text-[12.5px]">
                      {h.paymentRef ?? "—"}
                      {h.subscriptionRef ? <span className="block text-ink-3">{h.subscriptionRef}</span> : null}
                    </td>
                    <td className="tabular px-3 py-2.5">{formatDate(h.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
