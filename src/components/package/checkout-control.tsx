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

  const blockedReason =
    offer?.classification === "pending_review"
      ? "This offer is under review. There is no purchase path until a reviewer approves its classification."
      : offer?.classification === "rejected"
        ? "This offer is not allowed on SCRIPT//GO."
        : offer && !offer.checkoutEnabled
          ? (offer.checkoutDisabledReason ?? "Checkout is not live yet. It stays off, for every shop, until Tebex approves it in writing.")
          : null;

  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="mb-2 font-mono text-[11.5px] font-bold uppercase tracking-wide text-ink-3">Plans</legend>
        <ul className="space-y-2">
          {paid.map((o) => (
            <li key={o.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 border-2 border-line px-3 py-2.5 transition-transform duration-100",
                  selected === o.id ? "-translate-x-0.5 -translate-y-0.5 bg-sun text-on-sun shadow-[4px_4px_0_0_var(--line)]" : "bg-surface hover:bg-sun-soft",
                )}
              >
                <input
                  type="radio"
                  name="offer"
                  value={o.id}
                  checked={selected === o.id}
                  onChange={() => setSelected(o.id)}
                  className="h-[17px] w-[17px] accent-[var(--g-ink)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold leading-tight">{o.name}</span>
                  <span className="block text-[13px] opacity-75">
                    {intervalLabel(o.interval)} · {o.deployments} {o.deployments === 1 ? "deployment" : "deployments"}
                    {o.classification === "pending_review" ? " · under review" : ""}
                  </span>
                </span>
                <span className="tabular whitespace-nowrap font-display text-[18px] font-black">
                  {formatMoney(o.price)}
                  <span className="text-[12.5px] font-bold opacity-75">{intervalSuffix(o.interval)}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {blockedReason ? (
        <div className="space-y-2">
          <button type="button" disabled aria-describedby="checkout-reason" className={buttonClass("sun", "lg", "w-full")}>
            {offer?.classification === "pending_review" ? (
              <Hourglass aria-hidden="true" size={17} />
            ) : (
              <Lock aria-hidden="true" size={17} />
            )}
            {offer?.classification === "pending_review" ? "Under review" : "Checkout not available yet"}
          </button>
          <p id="checkout-reason" className="text-[13px] text-ink-2">
            {blockedReason}
          </p>
        </div>
      ) : !signedIn ? (
        <Link href={`/sign-in?next=${encodeURIComponent(returnTo)}`} className={buttonClass("sun", "lg", "w-full")}>
          Sign in to subscribe <ArrowRight aria-hidden="true" size={17} strokeWidth={2.5} />
        </Link>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={subscribe}
            disabled={state.kind === "busy"}
            className={buttonClass("sun", "lg", "w-full")}
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
        <p role="alert" className="border-2 border-bad bg-bad-soft px-3 py-2 text-[13px] font-semibold text-ink">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
