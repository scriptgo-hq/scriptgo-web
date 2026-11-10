import Link from "next/link";
import { PerkCheckoutButton } from "@/components/package/perk-purchase";
import { ApiError, Banner } from "@/components/ui/feedback";
import { api } from "@/lib/api";
import type { PerkPurchaseInfo } from "@/lib/contract";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "Buy a perk", robots: { index: false } };

/**
 * The page behind a purchase link a game server handed to a player (player perks, ADR-0038). The
 * signed link names the perk, the seller and the player; no account is needed. The payment happens
 * in the seller's own store.
 */
export default async function PerkPurchasePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const res = await api<PerkPurchaseInfo>(`/v1/perks/purchase?token=${encodeURIComponent(token)}`);
  if (!res.ok) {
    const expired = res.status === 410;
    return (
      <div className="container-page py-16">
        {res.status === 404 || expired ? (
          <div className="sticker mx-auto max-w-[640px] p-8 text-center" data-perk-link={expired ? "expired" : "invalid"}>
            <h1 className="display text-[30px]">{expired ? "This link has expired." : "This link is not valid."}</h1>
            <p className="mt-3 text-[15px] text-ink-2">
              {expired ? "A purchase link works for a few minutes. Ask for a new one on the server." : "Ask for a new purchase link on the server."}
            </p>
          </div>
        ) : (
          <ApiError failure={res} title="This purchase link couldn't be loaded." />
        )}
      </div>
    );
  }
  const p = res.data;
  const storeName = p.provider === "tebex" ? "the seller's Tebex store" : "the test store";
  return (
    <div className="container-page py-12 sm:py-16">
      <article className="sticker mx-auto max-w-[680px] p-6 sm:p-8" data-perk-link="valid" data-perk-key={p.perk.key}>
        <p className="eyebrow">{"// "}a perk on {p.operator.displayName}&rsquo;s server</p>
        <h1 className="display mt-1 text-[34px]">{p.perk.name}</h1>
        {p.perk.description ? <p className="mt-2 text-[15.5px] text-ink-2">{p.perk.description}</p> : null}

        <dl className="mt-5 grid grid-cols-1 gap-x-4 gap-y-2 text-[14.5px] sm:grid-cols-[9rem_minmax(0,1fr)]">
          <dt className="font-mono text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">Price</dt>
          <dd className="tabular font-semibold" data-perk-price>
            {formatMoney(p.perk.price)} {p.perk.interval === "month" ? "per month, renewed by the store until you cancel there" : "once"}
          </dd>
          <dt className="font-mono text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">Sold by</dt>
          <dd>
            {p.operator.displayName} <span className="font-mono text-[13px] text-ink-3">({p.operator.username})</span>
          </dd>
          <dt className="font-mono text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">For the player</dt>
          <dd className="break-all font-mono text-[13.5px]" data-perk-player>
            {p.player}
          </dd>
        </dl>

        <div className="mt-6">
          {p.purchasable ? (
            <PerkCheckoutButton token={token} storeName={storeName} />
          ) : (
            <Banner tone="warning" title="This perk can't be bought right now.">
              <span data-perk-reason>{p.notPurchasableReason ?? "It is not on sale."}</span>
            </Banner>
          )}
        </div>

        <ul className="mt-6 list-disc space-y-1 pl-5 text-[13.5px] text-ink-2">
          <li>
            You buy from {p.operator.displayName}, in their own store. SCRIPT//GO does not take or hold the payment; refunds and cancellations are
            handled by the seller and their store.
          </li>
          <li>
            What you get is a feature of that server&rsquo;s own script, tied to the player identifier above. Check that it is yours before paying.
          </li>
          <li>
            SCRIPT//GO does not review offers before sale and acts on reports. <Link href="/report" className="font-semibold underline">Report a problem</Link>.
          </li>
        </ul>
      </article>
    </div>
  );
}
