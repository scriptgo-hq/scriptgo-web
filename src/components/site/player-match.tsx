"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * While the page shows a code: asks the API every two seconds whether a game server confirmed it.
 * Linked: submits "Yes" for that player (the form `formId`, its `offer` field filled in). The code
 * expired: reloads, which shows a new one. Without JavaScript the page's "I typed it" link does it.
 */
export function CodeWatcher({ codeUrl, formId }: { codeUrl: string; formId: string }) {
  const router = useRouter();
  const done = useRef(false);
  useEffect(() => {
    let stop = false;
    const started = Date.now();
    const tick = async () => {
      if (stop || done.current || Date.now() - started > 15 * 60_000) return;
      try {
        const res = await fetch(codeUrl, { cache: "no-store", credentials: "same-origin" });
        if (res.ok) {
          const s = (await res.json()) as { state: "waiting" | "linked" | "none"; offer?: { id: string } };
          if (s.state === "linked" && s.offer) {
            done.current = true;
            const form = document.getElementById(formId) as HTMLFormElement | null;
            const field = form?.elements.namedItem("offer") as HTMLInputElement | null;
            if (form && field) {
              field.value = s.offer.id;
              form.requestSubmit();
            } else router.refresh();
            return;
          }
          if (s.state === "none") {
            done.current = true;
            router.refresh();
            return;
          }
        }
      } catch {
        // Offline for a moment: try again.
      }
      if (!stop) setTimeout(tick, 2000);
    };
    const first = setTimeout(tick, 2000);
    return () => {
      stop = true;
      clearTimeout(first);
    };
  }, [codeUrl, formId, router]);
  return null;
}

/**
 * The browser reached us over IPv6: asks the IPv4-only address once, so the API also knows the
 * browser's IPv4 address (the one most game servers see), then reloads. At most once per page.
 */
export function AddressProbe({ url, token }: { url: string; token: string }) {
  const router = useRouter();
  const tried = useRef(false);
  useEffect(() => {
    if (tried.current) return;
    tried.current = true;
    const key = `sg-probe:${token.split(".")[0]}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // No storage: the ref above still limits it to this page.
    }
    fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token }), signal: AbortSignal.timeout(5000) })
      .then((res) => {
        if (res.ok) router.refresh();
      })
      .catch(() => undefined);
  }, [url, token, router]);
  return null;
}
