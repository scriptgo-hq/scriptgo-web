"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CircleCheck, CircleX, Clock, LoaderCircle } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { callApi } from "@/lib/client-api";
import type { CheckoutState } from "@/lib/contract";

const POLL_MS = 2000;
const SLOW_MS = 30_000;
const GIVE_UP_MS = 10 * 60_000;

/** Polls GET /v1/checkout/:id until the provider's signed webhook settles it. The redirect alone never grants a license. */
export function CheckoutStatus({ initial, cancelled }: { initial: CheckoutState; cancelled: boolean }) {
  const [state, setState] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const started = useRef(Date.now());
  const terminal = state.status !== "pending";
  const gaveUp = !terminal && elapsed >= GIVE_UP_MS;

  useEffect(() => {
    if (terminal || gaveUp) return;
    const t = window.setInterval(async () => {
      setElapsed(Date.now() - started.current);
      const res = await callApi<CheckoutState>("GET", `/v1/checkout/${encodeURIComponent(initial.checkoutId)}`);
      if (res.ok) {
        setState(res.data);
        setError(null);
      } else setError(res.message);
    }, POLL_MS);
    return () => window.clearInterval(t);
  }, [terminal, gaveUp, initial.checkoutId]);

  let icon = <LoaderCircle aria-hidden="true" size={40} className="animate-spin text-cobalt-ink motion-reduce:animate-none" />;
  let title = "Waiting for the payment provider.";
  let body: React.ReactNode = "Your license is issued as soon as the provider sends its signed confirmation to SCRIPT//GO. This usually takes a few seconds.";
  let actions: React.ReactNode = null;

  if (state.status === "completed") {
    icon = <CircleCheck aria-hidden="true" size={40} className="text-ok" />;
    title = "Payment confirmed. Your license is ready.";
    body = "The provider confirmed the payment. Open the license to get your key and add deployments.";
    actions = state.licenseId ? (
      <Link href={`/dashboard/licenses/${encodeURIComponent(state.licenseId)}`} className={buttonClass("primary", "lg")}>
        Open the license
      </Link>
    ) : (
      <Link href="/dashboard/licenses" className={buttonClass("primary", "lg")}>
        Go to licenses
      </Link>
    );
  } else if (state.status === "failed") {
    icon = <CircleX aria-hidden="true" size={40} className="text-bad" />;
    title = "The payment didn't go through.";
    body = "The provider reported a failure, so no license was issued. You can try again from the package page.";
    actions = (
      <Link href="/dashboard/licenses" className={buttonClass("secondary", "md")}>
        Your licenses
      </Link>
    );
  } else if (state.status === "expired") {
    icon = <Clock aria-hidden="true" size={40} className="text-warn" />;
    title = "This checkout expired.";
    body = "No confirmation arrived within two hours, so no license was issued. If you were charged, the provider's receipt is your proof: contact the creator or the provider.";
  } else if (cancelled) {
    icon = <CircleX aria-hidden="true" size={40} className="text-ink-3" />;
    title = "Checkout cancelled.";
    body = "You left the provider's checkout. No license was issued. This page keeps checking in case the payment still completes.";
  } else if (gaveUp) {
    icon = <Clock aria-hidden="true" size={40} className="text-warn" />;
    title = "Still no confirmation.";
    body = "We stopped checking automatically. If the payment completes later, the license appears in your licenses.";
    actions = (
      <button type="button" className={buttonClass("secondary", "md")} onClick={() => {
          started.current = Date.now();
          setElapsed(0);
        }}>
        Check again
      </button>
    );
  } else if (elapsed >= SLOW_MS) {
    title = "Still waiting for the provider.";
    body = "Confirmations are sometimes slow. You can leave this page: the license appears in your licenses once the provider confirms.";
    actions = (
      <Link href="/dashboard/licenses" className={buttonClass("secondary", "md")}>
        Go to licenses
      </Link>
    );
  }

  return (
    <div className="sticker mx-auto max-w-[620px] p-6 text-center sm:p-8">
      <div className="flex justify-center">{icon}</div>
      <h1 className="display mt-4 text-[30px] sm:text-[36px]" aria-live="polite">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-prose text-[15.5px] text-ink-2">{body}</p>
      {actions ? <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div> : null}
      {error ? (
        <p role="status" className="mt-4 text-[13.5px] text-bad">
          Last check failed: {error}
        </p>
      ) : null}
      <p className="mt-6 font-mono text-[12px] text-ink-3">checkout {state.checkoutId}</p>
    </div>
  );
}
