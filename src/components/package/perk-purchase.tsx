"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheck, CircleX, Clock, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { callApi } from "@/lib/client-api";
import type { PerkCheckoutCreated, PerkCheckoutState } from "@/lib/contract";

/** Starts the checkout a purchase link leads to, in the operator's own store, and sends the player there. */
export function PerkCheckoutButton({ token, storeName }: { token: string; storeName: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function start() {
    setBusy(true);
    setError(null);
    const res = await callApi<PerkCheckoutCreated>("POST", "/v1/perks/purchase/checkout", { token });
    if (!res.ok) {
      setBusy(false);
      return setError(res.message);
    }
    window.location.assign(res.data.redirectUrl);
  }
  return (
    <div className="flex flex-col items-start gap-2">
      <Button size="lg" onClick={start} disabled={busy} data-perk-pay>
        {busy ? "Opening the store…" : `Continue to ${storeName}`}
      </Button>
      {error ? (
        <p role="alert" className="text-[14px] font-semibold text-bad">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const POLL_MS = 2000;
const GIVE_UP_MS = 10 * 60_000;

/** Polls GET /v1/perks/checkouts/:id until the store's signed webhook settles it. Returning from the store grants nothing by itself. */
export function PerkCheckoutStatus({ initial, cancelled }: { initial: PerkCheckoutState; cancelled: boolean }) {
  const [state, setState] = useState(initial);
  const [elapsed, setElapsed] = useState(0);
  const started = useRef(Date.now());
  const terminal = state.status !== "pending" || cancelled;
  const gaveUp = !terminal && elapsed >= GIVE_UP_MS;

  useEffect(() => {
    if (terminal || gaveUp) return;
    const t = window.setInterval(async () => {
      setElapsed(Date.now() - started.current);
      const res = await callApi<PerkCheckoutState>("GET", `/v1/perks/checkouts/${encodeURIComponent(initial.checkoutId)}`);
      if (res.ok) setState(res.data);
    }, POLL_MS);
    return () => window.clearInterval(t);
  }, [terminal, gaveUp, initial.checkoutId]);

  let icon = <LoaderCircle aria-hidden="true" size={40} className="animate-spin text-cobalt-ink motion-reduce:animate-none" />;
  let title = "Waiting for the store's confirmation.";
  let body = "The perk is granted as soon as the store sends its signed confirmation. This usually takes a few seconds.";
  if (state.status === "completed") {
    icon = <CircleCheck aria-hidden="true" size={40} className="text-ok" />;
    title = `${state.perk.name} is yours.`;
    body = `The payment is confirmed. Go back to the server: ${state.operator.displayName}'s script applies the perk to ${state.player}.`;
  } else if (cancelled || state.status === "failed") {
    icon = <CircleX aria-hidden="true" size={40} className="text-bad" />;
    title = cancelled ? "Checkout cancelled." : "The payment didn't go through.";
    body = "Nothing was charged for this perk here and nothing was granted. Ask for a new link on the server to try again.";
  } else if (state.status === "expired" || gaveUp) {
    icon = <Clock aria-hidden="true" size={40} className="text-ink-3" />;
    title = "This checkout expired.";
    body = "No confirmation arrived. If you paid, the perk is granted when the store's confirmation arrives; otherwise ask for a new link on the server.";
  }
  return (
    <div className="sticker mx-auto max-w-[640px] p-8 text-center" role="status" data-perk-checkout={cancelled ? "cancelled" : state.status}>
      <div className="flex justify-center">{icon}</div>
      <h1 className="display mt-4 text-[30px]">{title}</h1>
      <p className="mt-3 text-[15px] text-ink-2">{body}</p>
    </div>
  );
}
