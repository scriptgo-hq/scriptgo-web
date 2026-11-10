"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Field, FormMessage, describedBy, fieldErrors, inputClass, selectClass } from "@/components/ui/form";
import { callApi } from "@/lib/client-api";
import type { Perk, Provider, ServerLink, ServerLinkCreated } from "@/lib/contract";

const KEY_RE = /^[a-z0-9][a-z0-9_.-]{0,63}$/;

/**
 * Create a perk offer (POST /v1/creator/perks). The seller declares their rights on this form: with
 * the declaration the perk can be bought at once; nobody reviews it before sale (ADR-0037).
 */
export function PerkForm({ providers }: { providers: Provider[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const local: Record<string, string> = {};
    const key = String(fd.get("key") ?? "").trim();
    const name = String(fd.get("name") ?? "").trim();
    const price = Number(String(fd.get("price") ?? "").replace(",", "."));
    const currency = String(fd.get("currency") ?? "").trim().toUpperCase();
    if (!KEY_RE.test(key)) local.key = "Lowercase letters, digits, “_”, “.” and “-”, up to 64 characters. Your script asks for it by this key.";
    if (!name) local.name = "Give the perk a name: players see it on the purchase page.";
    if (!Number.isFinite(price) || price <= 0) local.price = "A price above zero.";
    if (!/^[A-Z]{3}$/.test(currency)) local.currency = "A three-letter currency code, such as EUR.";
    setErrors(local);
    if (Object.keys(local).length) return;
    setBusy(true);
    setMessage(null);
    const owns = fd.get("ownsCode") === "on";
    const res = await callApi<Perk>("POST", "/v1/creator/perks", {
      key,
      name,
      description: String(fd.get("description") ?? "").trim(),
      interval: String(fd.get("interval") ?? "month"),
      price: { amount: Math.round(price * 100), currency },
      provider: String(fd.get("provider") ?? providers[0]),
      providerProductId: String(fd.get("providerProductId") ?? "").trim() || null,
      // Without the first box there is no declaration: the perk is created, and waits for it.
      ...(owns ? { rights: { ownsCode: true, targetsProprietaryGame: fd.get("targetsProprietaryGame") === "on" } } : {}),
    });
    setBusy(false);
    if (!res.ok) {
      setErrors(fieldErrors(res.details));
      return setMessage(res.message);
    }
    setOpen(false);
    router.refresh();
  }

  if (providers.length === 0) {
    return (
      <p className="max-w-prose text-[14px] text-ink-2" data-perk-blocked>
        Connect a store first: the payment for a perk goes to your own store, never to SCRIPT//GO.
      </p>
    );
  }
  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)} data-perk-new>
        New perk
      </Button>
    );
  }
  return (
    <form onSubmit={submit} noValidate className="sticker grid grid-cols-1 gap-4 p-5 md:grid-cols-2" data-perk-form>
      <p className="font-display text-[20px] font-extrabold md:col-span-2">New perk.</p>
      <Field id="pk-key" label="Key" hint="What your script asks for: ScriptGo.perks.has(player, &quot;vip&quot;). It cannot be changed later." error={errors.key}>
        <input id="pk-key" name="key" maxLength={64} autoComplete="off" spellCheck={false} placeholder="vip" className={`${inputClass} font-mono`} {...describedBy("pk-key", true, errors.key)} />
      </Field>
      <Field id="pk-name" label="Name" hint="Shown to the player on the purchase page." error={errors.name}>
        <input id="pk-name" name="name" maxLength={80} placeholder="VIP" className={inputClass} {...describedBy("pk-name", true, errors.name)} />
      </Field>
      <Field id="pk-desc" label="Description" optional hint="One or two sentences: what the player gets on your server." className="md:col-span-2">
        <input id="pk-desc" name="description" maxLength={500} className={inputClass} {...describedBy("pk-desc", true, null)} />
      </Field>
      <Field id="pk-interval" label="Billing">
        <select id="pk-interval" name="interval" defaultValue="month" className={selectClass}>
          <option value="month">Monthly: renewed by your store, ends when it is not</option>
          <option value="perpetual">One-time: no end date</option>
        </select>
      </Field>
      <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-3">
        <Field id="pk-price" label="Price" error={errors.price}>
          <input id="pk-price" name="price" inputMode="decimal" placeholder="5.00" className={`${inputClass} tabular`} {...describedBy("pk-price", false, errors.price)} />
        </Field>
        <Field id="pk-currency" label="Currency" error={errors.currency}>
          <input id="pk-currency" name="currency" maxLength={3} defaultValue="EUR" className={`${inputClass} font-mono uppercase`} {...describedBy("pk-currency", false, errors.currency)} />
        </Field>
      </div>
      <Field id="pk-provider" label="Store" hint="The payment goes to this store of yours.">
        <select id="pk-provider" name="provider" defaultValue={providers[0]} className={selectClass} {...describedBy("pk-provider", true, null)}>
          {providers.map((p) => (
            <option key={p} value={p}>
              {p === "tebex" ? "Tebex" : "Test provider (no real money)"}
            </option>
          ))}
        </select>
      </Field>
      <Field id="pk-product" label="Product id in your store" optional hint="The package of your store this perk maps to. The payment is checked against it." error={errors.providerProductId}>
        <input id="pk-product" name="providerProductId" maxLength={128} autoComplete="off" className={`${inputClass} font-mono`} {...describedBy("pk-product", true, errors.providerProductId)} />
      </Field>

      <fieldset className="md:col-span-2">
        <legend className="text-[14px] font-bold">Your declaration</legend>
        <p className="text-[13px] text-ink-3">
          You decide what you sell and you answer for it. SCRIPT//GO does not review a perk before it is sold; it acts on reports.
        </p>
        <label className="mt-2 flex items-start gap-2 text-[14px]">
          <input type="checkbox" name="ownsCode" defaultChecked className="mt-1 h-4 w-4 accent-[var(--cobalt)]" />
          <span>This perk is a feature of my own script, running on my own server, and I have the right to sell it.</span>
        </label>
        <label className="mt-1.5 flex items-start gap-2 text-[14px]">
          <input type="checkbox" name="targetsProprietaryGame" defaultChecked className="mt-1 h-4 w-4 accent-[var(--cobalt)]" />
          <span>My script runs on a third-party game platform. I answer to that platform&rsquo;s rights holder for what I sell there.</span>
        </label>
        <p className="mt-1 text-[13px] text-ink-3">Without the first box the perk is created but cannot be bought until you declare.</p>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Creating…" : "Create the perk"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        {message ? <FormMessage tone="error">{message}</FormMessage> : null}
      </div>
    </form>
  );
}

/** Declare rights for a perk created without a declaration (POST /v1/creator/perks/:id/declare). */
export function DeclarePerkButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function declare() {
    setBusy(true);
    setError(null);
    const res = await callApi<Perk>("POST", `/v1/creator/perks/${encodeURIComponent(id)}/declare`, { ownsCode: true, targetsProprietaryGame: true });
    setBusy(false);
    if (!res.ok) return setError(res.message);
    router.refresh();
  }
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button size="sm" onClick={declare} disabled={busy} title="This perk is a feature of my own script, on my own server, which runs on a third-party game platform; I have the right to sell it.">
        {busy ? "…" : "Declare my rights"}
      </Button>
      {error ? (
        <span role="alert" className="text-[12.5px] font-semibold text-bad">
          {error}
        </span>
      ) : null}
    </span>
  );
}

/** Stop selling a perk (DELETE /v1/creator/perks/:id). Players who hold it keep it. */
export function WithdrawPerkButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function withdraw() {
    setBusy(true);
    const res = await callApi<null>("DELETE", `/v1/creator/perks/${encodeURIComponent(id)}`);
    setBusy(false);
    if (!res.ok) return setError(res.message);
    setConfirming(false);
    router.refresh();
  }
  if (!confirming)
    return (
      <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
        Stop selling
      </Button>
    );
  return (
    <span className="inline-flex max-w-[300px] flex-col items-end gap-1.5 text-left text-[12.5px]">
      <span className="self-start font-bold">Stop selling {name}? Players who have it keep it until it ends.</span>
      <span className="inline-flex gap-1.5">
        <Button size="sm" variant="danger" onClick={withdraw} disabled={busy}>
          {busy ? "…" : "Stop selling"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
          Keep
        </Button>
      </span>
      {error ? (
        <span role="alert" className="self-start font-semibold text-bad">
          {error}
        </span>
      ) : null}
    </span>
  );
}

/** Link a game server to the account (POST /v1/creator/server-links). The token is shown once. */
export function ServerLinkForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<ServerLinkCreated | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = String(new FormData(form).get("name") ?? "").trim();
    if (!name) return setError("Give the server a name, such as eu-1.");
    setBusy(true);
    setError(null);
    const res = await callApi<ServerLinkCreated>("POST", "/v1/creator/server-links", { name });
    setBusy(false);
    if (!res.ok) return setError(res.message);
    setCreated(res.data);
    form.reset();
    router.refresh();
  }

  return (
    <div className="space-y-3" data-server-link-form>
      {created ? (
        <div className="space-y-2 rounded-[10px] border-2 border-line bg-sun-soft p-3" role="status" data-server-link-created>
          <p className="text-[13.5px] font-bold">{created.link.name} is linked. This is its token: it is shown once.</p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-md bg-code-bg px-2 py-1.5 font-mono text-[13px] text-code-fg" data-server-link-token>
              {created.token}
            </code>
            <CopyButton text={created.token} tone="light" />
          </div>
          <p className="text-[13px] text-ink-2">
            Put it in that server&rsquo;s configuration as <code className="font-mono">scriptgo_server_token</code>, next to{" "}
            <code className="font-mono">scriptgo_api</code>. Treat it as a secret: whoever has it can ask which of your players have which perk. If it
            leaks, revoke the link and make a new one.
          </p>
        </div>
      ) : null}
      <form onSubmit={submit} noValidate className="flex flex-wrap items-end gap-3">
        <Field id="sl-name" label="Link a server" hint="A name for it in this list.">
          <input id="sl-name" name="name" maxLength={64} placeholder="eu-1" autoComplete="off" className={`${inputClass} font-mono sm:w-[16rem]`} {...describedBy("sl-name", true, error)} />
        </Field>
        <Button type="submit" size="sm" disabled={busy} className="mb-[26px]">
          {busy ? "Linking…" : "Create the link"}
        </Button>
      </form>
      {error ? <FormMessage tone="error">{error}</FormMessage> : null}
    </div>
  );
}

/** Revoke a server link (POST /v1/creator/server-links/:id/revoke): its token stops working at once. */
export function RevokeServerLinkButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function revoke() {
    setBusy(true);
    const res = await callApi<ServerLink>("POST", `/v1/creator/server-links/${encodeURIComponent(id)}/revoke`);
    setBusy(false);
    if (!res.ok) return setError(res.message);
    setConfirming(false);
    router.refresh();
  }
  if (!confirming)
    return (
      <Button size="sm" variant="danger" onClick={() => setConfirming(true)}>
        Revoke
      </Button>
    );
  return (
    <span className="inline-flex max-w-[320px] flex-col items-end gap-1.5 text-left text-[12.5px]" data-revoke-server-link>
      <span className="self-start font-bold">Revoke {name}? Its token stops working at once and the server is told nothing more. This cannot be undone.</span>
      <span className="inline-flex gap-1.5">
        <Button size="sm" variant="danger" onClick={revoke} disabled={busy}>
          {busy ? "…" : "Revoke"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
          Keep
        </Button>
      </span>
      {error ? (
        <span role="alert" className="self-start font-semibold text-bad">
          {error}
        </span>
      ) : null}
    </span>
  );
}
