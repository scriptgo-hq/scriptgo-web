"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, describedBy, inputClass } from "@/components/ui/form";
import { callApi } from "@/lib/client-api";
import type { Provider, Store } from "@/lib/contract";

/** POST /v1/creator/stores. Credentials go to the API once and are never shown again. */
export function ConnectStoreForm({ connected, mockAvailable }: { connected: Provider[]; mockAvailable: boolean }) {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider>(connected.includes("tebex") ? "mock" : "tebex");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secretError, setSecretError] = useState<string | null>(null);
  const reconnect = connected.includes(provider);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const credentials: Record<string, string> = {};
    if (provider === "tebex") {
      const secret = String(fd.get("webhookSecret") ?? "").trim();
      if (!secret) return setSecretError("Paste the webhook secret from Tebex → Developers → Webhooks.");
      credentials.webhookSecret = secret;
      const token = String(fd.get("publicToken") ?? "").trim();
      if (token) credentials.publicToken = token;
    }
    setSecretError(null);
    setBusy(true);
    setError(null);
    const res = await callApi<Store>("POST", "/v1/creator/stores", { provider, credentials });
    setBusy(false);
    if (!res.ok) return setError(res.message);
    e.currentTarget?.reset();
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-4">
      <fieldset>
        <legend className="text-[14px] font-bold">Provider</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              ["tebex", "Tebex", "Real payments, once Tebex has approved SCRIPT//GO. No approval of your store by staff."],
              ["mock", "Test provider", mockAvailable ? "Sandbox: simulated payments and webhooks." : "Disabled on this server."],
            ] as const
          ).map(([v, label, hint]) => (
            <label
              key={v}
              className="flex min-w-[220px] flex-1 cursor-pointer items-start gap-2 rounded-[10px] border-2 border-line-soft bg-surface p-3 has-[:checked]:border-line has-[:checked]:bg-sun-soft has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
            >
              <input
                type="radio"
                name="provider"
                value={v}
                checked={provider === v}
                disabled={v === "mock" && !mockAvailable}
                onChange={() => setProvider(v)}
                className="mt-1 h-4 w-4 accent-[var(--cobalt)]"
              />
              <span>
                <span className="block font-bold">
                  {label}
                  {connected.includes(v) ? <span className="ml-1 font-normal text-ink-3">· connected</span> : null}
                </span>
                <span className="block text-[13px] text-ink-2">{hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {provider === "tebex" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field id="st-secret" label="Webhook secret" hint="Tebex → Developers → Webhooks. Stored encrypted; never shown again." error={secretError}>
            <input
              id="st-secret"
              name="webhookSecret"
              type="password"
              autoComplete="off"
              spellCheck={false}
              maxLength={512}
              className={`${inputClass} font-mono`}
              {...describedBy("st-secret", true, secretError)}
            />
          </Field>
          <Field id="st-token" label="Public token" optional hint="Tebex → Integrations → Headless API. Lets SCRIPT//GO open checkout baskets.">
            <input
              id="st-token"
              name="publicToken"
              autoComplete="off"
              spellCheck={false}
              maxLength={128}
              className={`${inputClass} font-mono`}
              {...describedBy("st-token", true, null)}
            />
          </Field>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy || (provider === "mock" && !mockAvailable)}>
          {busy ? "Connecting…" : reconnect ? "Update connection" : "Connect"}
        </Button>
        {error ? <FormMessage tone="error">{error}</FormMessage> : null}
      </div>
    </form>
  );
}

export function TestEventButton({ storeId, disabledReason }: { storeId: string; disabledReason: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  async function run() {
    setBusy(true);
    setResult(null);
    const res = await callApi<{ delivered: boolean; status: number }>("POST", `/v1/creator/stores/${encodeURIComponent(storeId)}/test-event`);
    setBusy(false);
    if (!res.ok) return setResult({ tone: "error", text: res.message });
    setResult(
      res.data.delivered
        ? { tone: "success", text: `Delivered: the webhook endpoint answered HTTP ${res.data.status}.` }
        : { tone: "error", text: `Not delivered: the webhook endpoint answered HTTP ${res.data.status}.` },
    );
    router.refresh();
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="secondary" size="sm" onClick={run} disabled={busy || Boolean(disabledReason)} aria-describedby={disabledReason ? `te-${storeId}` : undefined}>
        <Send aria-hidden="true" size={14} /> {busy ? "Sending…" : "Send a test event"}
      </Button>
      {disabledReason ? (
        <span id={`te-${storeId}`} className="text-[13px] text-ink-3">
          {disabledReason}
        </span>
      ) : null}
      {result ? <FormMessage tone={result.tone}>{result.text}</FormMessage> : null}
    </div>
  );
}
