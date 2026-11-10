"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Hourglass, Lock } from "lucide-react";
import type { CheckoutCreated, ErrorBody, Offer } from "@/lib/contract";
import { cn } from "@/lib/cn";
import { formatMoney, intervalLabel, intervalSuffix } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";

const PROVIDER_NAME: Record<string, string> = { tebex: "Tebex", mock: "the mock provider (development)" };

/**
 * Offer picker + Subscribe. Payment finishes on the provider's checkout; the license is issued only
 * when the provider's signed webhook arrives (see /checkout/[id]).
 */
export function CheckoutControl({
  offers,
  signedIn,
  returnTo,
}: {
  offers: Offer[];
  signedIn: boolean;
  returnTo: string;
}) {
  const paid = offers.filter((o) => o.interval !== "free" && o.classification !== "free");
  const [selected, setSelected] = useState(paid[0]?.id ?? "");
  const [state, setState] = useState<{ kind: "idle" } | { kind: "busy" } | { kind: "error"; message: string }>({ kind: "idle" });
  const offer = paid.find((o) => o.id === selected);

  if (paid.length === 0) return null;

  async function subscribe() {
    if (!offer) return;
    setState({ kind: "busy" });
    try {
      const res = await fetch("/v1/checkout", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ offerId: offer.id }),
      });
      const body = (await res.json().catch(() => null)) as CheckoutCreated | ErrorBody | null;
      if (!res.ok || !body || !("redirectUrl" in body)) {
        const msg = body && "error" in body ? body.error.message : `Checkout could not start (HTTP ${res.status}).`;
        setState({ kind: "error", message: msg });
        return;
      }
      window.location.assign(body.redirectUrl);
    } catch {
      setState({ kind: "error", message: "The SCRIPT//GO API is not reachable. Nothing was charged." });
    }
  }

  // The API states the reason for every closed purchase path (packages/commerce gating.ts): the
  // seller has not declared their rights yet, a moderation decision holds the offer, the listing or
  // the store, or the payment provider is not open. Nothing here waits for a reviewer (ADR-0037).
  const held = offer?.classification === "on_hold" || offer?.classification === "rejected";
  const undeclared = offer?.classification === "undeclared";
  const blockedReason = offer && !offer.checkoutEnabled ? (offer.checkoutDisabledReason ?? "Checkout is not available for this offer.") : null;

  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="mb-2 font-mono text-[11.5px] font-bold uppercase tracking-wide text-ink-3">Plans</legend>
        <ul className="space-y-2">
          {paid.map((o) => (
            <li key={o.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-[10px] border-2 px-3 py-2.5",
                  selected === o.id ? "border-line bg-cobalt-soft" : "border-line-soft bg-surface hover:border-line",
                )}
              >
                <input
                  type="radio"
                  name="offer"
                  value={o.id}
                  checked={selected === o.id}
                  onChange={() => setSelected(o.id)}
                  className="h-4 w-4 accent-[var(--cobalt)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold leading-tight">{o.name}</span>
                  <span className="block text-[12.5px] text-ink-3">
                    {intervalLabel(o.interval)} · {o.deployments} {o.deployments === 1 ? "deployment" : "deployments"}
                    {o.classification === "on_hold" ? " · on hold" : o.classification === "undeclared" ? " · rights not declared yet" : ""}
                  </span>
                </span>
                <span className="tabular whitespace-nowrap font-display text-[17px] font-extrabold">
                  {formatMoney(o.price)}
                  <span className="text-[13px] font-bold text-ink-3">{intervalSuffix(o.interval)}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {blockedReason ? (
        <div className="space-y-2">
          <button type="button" disabled aria-describedby="checkout-reason" className={buttonClass("primary", "lg", "w-full")}>
            {undeclared ? <Hourglass aria-hidden="true" size={17} /> : <Lock aria-hidden="true" size={17} />}
            {undeclared ? "Not on sale yet" : held ? "On hold" : "Checkout not available yet"}
          </button>
          <p id="checkout-reason" className="text-[13px] text-ink-2">
            {blockedReason}
          </p>
        </div>
      ) : !signedIn ? (
        <Link href={`/sign-in?next=${encodeURIComponent(returnTo)}`} className={buttonClass("primary", "lg", "w-full")}>
          Sign in to subscribe <ArrowRight aria-hidden="true" size={17} strokeWidth={2.5} />
        </Link>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={subscribe}
            disabled={state.kind === "busy"}
            className={buttonClass("primary", "lg", "w-full")}
          >
            {state.kind === "busy" ? "Opening checkout…" : offer?.interval === "perpetual" ? "Buy license" : "Subscribe"}
            <ArrowRight aria-hidden="true" size={17} strokeWidth={2.5} />
          </button>
          <p className="text-[12.5px] text-ink-3">
            You pay on the checkout page of {offer?.provider ? PROVIDER_NAME[offer.provider] ?? offer.provider : "the payment provider"}, then come
            back here while the license is issued.
          </p>
        </div>
      )}
      {state.kind === "error" ? (
        <p role="alert" className="rounded-md border-2 border-bad/50 bg-bad-soft px-3 py-2 text-[13px] text-bad">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
