"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Field, FormMessage, describedBy, fieldErrors, inputClass, selectClass } from "@/components/ui/form";
import { callApi } from "@/lib/client-api";
import type { GrantCreated, GrantRow } from "@/lib/contract";

type Recipient = "account" | "server_key";

/**
 * Grant a free license for one of the creator's own packages (POST /v1/creator/packages/:name/grants).
 * Nothing is sold: there is no price field and no payment provider on this form, on purpose.
 */
export function GrantForm({
  packageName,
  identifier,
  environments,
  blockedReason,
}: {
  packageName: string;
  identifier: string;
  /** The environments the package declares. */
  environments: { slug: string; name: string }[];
  /** Why no license can be granted right now (shown next to the disabled button), or null. */
  blockedReason: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState<Recipient>("account");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [created, setCreated] = useState<GrantCreated | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const local: Record<string, string> = {};
    const to = String(fd.get("to") ?? "").trim();
    const serverKey = String(fd.get("serverKey") ?? "").trim();
    if (recipient === "account") {
      if (!to) local.to = "Enter the recipient's account id, or a creator username.";
      else if (to.includes("@")) local.to = "An e-mail address is not accepted. Ask the recipient for their account id (Dashboard → Settings).";
    } else if (!/^[A-Za-z0-9_-]{43}$/.test(serverKey)) {
      local.serverKey = "A server public key is 43 characters, as “scriptgo escrow identity” prints it.";
    }
    const deployments = Number(fd.get("deployments") ?? 1);
    if (recipient === "account" && (!Number.isInteger(deployments) || deployments < 1 || deployments > 100)) local.deployments = "Whole number from 1 to 100.";
    const rawDays = String(fd.get("expiresInDays") ?? "").trim();
    const days = rawDays === "" ? null : Number(rawDays);
    if (days !== null && (!Number.isInteger(days) || days < 1 || days > 3650)) local.expiresInDays = "Whole number of days from 1 to 3650, or leave it empty.";
    setErrors(local);
    if (Object.keys(local).length) return;
    setBusy(true);
    setMessage(null);
    const note = String(fd.get("note") ?? "").trim();
    const res = await callApi<GrantCreated>("POST", `/v1/creator/packages/${encodeURIComponent(packageName)}/grants`, {
      ...(recipient === "account"
        ? { to, deployments, environments: fd.getAll("environments").map(String) }
        : { serverKey, environment: String(fd.get("environment") ?? ""), deploymentName: String(fd.get("deploymentName") ?? "").trim() || "server" }),
      expiresInDays: days,
      note,
    });
    setBusy(false);
    if (!res.ok) {
      setErrors(fieldErrors(res.details));
      return setMessage(res.message);
    }
    setCreated(res.data);
    setOpen(false);
    router.refresh();
  }

  const token = created?.deploymentToken ?? null;

  return (
    <div className="space-y-3" data-grant-form>
      {created ? (
        <div className="space-y-2 rounded-[10px] border-2 border-line bg-sun-soft p-3" role="status" data-grant-created={created.grant.recipient.kind}>
          <p className="text-[13.5px] font-bold">
            Free license granted{created.grant.recipient.kind === "account" ? ` to ${created.grant.recipient.name}` : " to that server key"}. No payment is involved.
          </p>
          {token ? (
            <>
              <p className="text-[13.5px]">
                This is the deployment token of that server. It is shown once: copy it now and hand it to the operator over a private channel.
                It only works with the server key you entered.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="min-w-0 flex-1 break-all rounded-md bg-code-bg px-2 py-1.5 font-mono text-[13px] text-code-fg" data-grant-token>
                  {token}
                </code>
                <CopyButton text={token} tone="light" />
              </div>
              <p className="text-[13px] text-ink-2">
                On their server: <code className="font-mono">scriptgo add {identifier} --deployment-token &lt;the token&gt;</code>, then their loader with
                the same token and identity file.
              </p>
            </>
          ) : (
            <p className="text-[13.5px]">They find it under Dashboard → Licenses, reveal the key once and add a deployment, as with any license.</p>
          )}
        </div>
      ) : null}

      {!open ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" onClick={() => { setCreated(null); setOpen(true); }} disabled={Boolean(blockedReason)} aria-describedby={blockedReason ? "grant-blocked-reason" : undefined}>
            Grant a free license
          </Button>
          {blockedReason ? (
            <span id="grant-blocked-reason" className="max-w-prose text-[13px] text-ink-2" data-grant-blocked>
              {blockedReason}
            </span>
          ) : null}
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="sticker grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <p className="font-display text-[20px] font-extrabold md:col-span-2">Grant a free license.</p>
          <fieldset className="md:col-span-2">
            <legend className="text-[14px] font-bold">Who is it for</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["account", "A SCRIPT//GO account"],
                  ["server_key", "A server key the operator sent me"],
                ] as [Recipient, string][]
              ).map(([value, label]) => (
                <label key={value} className="inline-flex items-center gap-2 rounded-full border-2 border-line-soft bg-surface px-3 py-1 text-[14px] has-[:checked]:border-line has-[:checked]:bg-sun-soft">
                  <input type="radio" name="recipient" value={value} checked={recipient === value} onChange={() => setRecipient(value)} className="h-4 w-4 accent-[var(--cobalt)]" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {recipient === "account" ? (
            <>
              <Field
                id="gr-to"
                label="Account id or creator username"
                hint="The recipient finds their account id in Dashboard → Settings. E-mail addresses are not accepted."
                error={errors.to}
                className="md:col-span-2"
              >
                <input id="gr-to" name="to" maxLength={64} autoComplete="off" className={`${inputClass} font-mono`} {...describedBy("gr-to", true, errors.to)} />
              </Field>
              <Field id="gr-deployments" label="Deployments" hint="How many servers may run it at once under this license." error={errors.deployments}>
                <input id="gr-deployments" name="deployments" type="number" min={1} max={100} step={1} defaultValue={1} className={`${inputClass} tabular`} {...describedBy("gr-deployments", true, errors.deployments)} />
              </Field>
            </>
          ) : (
            <>
              <Field
                id="gr-key"
                label="Server public key"
                hint="The operator runs “scriptgo escrow identity --identity <file>” on the server and sends you the public key it prints. You hold the license; it is bound to that server."
                error={errors.serverKey}
                className="md:col-span-2"
              >
                <input id="gr-key" name="serverKey" maxLength={43} autoComplete="off" spellCheck={false} className={`${inputClass} font-mono`} {...describedBy("gr-key", true, errors.serverKey)} />
              </Field>
              <Field id="gr-env" label="Environment of that server" error={errors.environment}>
                <select id="gr-env" name="environment" required className={selectClass} {...describedBy("gr-env", false, errors.environment)}>
                  {environments.map((env) => (
                    <option key={env.slug} value={env.slug}>
                      {env.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="gr-depname" label="Deployment name" hint="A name for that server in your list.">
                <input id="gr-depname" name="deploymentName" maxLength={64} placeholder="server" className={`${inputClass} font-mono`} {...describedBy("gr-depname", true, null)} />
              </Field>
            </>
          )}

          <Field id="gr-days" label="Ends after (days)" hint="Leave empty for no end date: it runs until you revoke it." error={errors.expiresInDays}>
            <input id="gr-days" name="expiresInDays" type="number" min={1} max={3650} step={1} className={`${inputClass} tabular`} {...describedBy("gr-days", true, errors.expiresInDays)} />
          </Field>
          <Field id="gr-note" label="Note" hint="For you: who this is for. The recipient does not see it.">
            <input id="gr-note" name="note" maxLength={200} className={inputClass} {...describedBy("gr-note", true, null)} />
          </Field>

          {recipient === "account" && environments.length > 1 ? (
            <fieldset className="md:col-span-2">
              <legend className="text-[14px] font-bold">Environments covered</legend>
              <p className="text-[13px] text-ink-3">Leave all unchecked to cover every environment the package declares.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {environments.map((env) => (
                  <label key={env.slug} className="inline-flex items-center gap-2 rounded-full border-2 border-line-soft bg-surface px-3 py-1 text-[14px] has-[:checked]:border-line has-[:checked]:bg-sun-soft">
                    <input type="checkbox" name="environments" value={env.slug} className="h-4 w-4 accent-[var(--cobalt)]" />
                    {env.name}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          <p className="text-[13.5px] text-ink-2 md:col-span-2">
            This is not a sale: no price, no checkout, no payment provider. You can revoke it at any time.
          </p>
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Granting…" : "Grant the license"}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {message ? <FormMessage tone="error">{message}</FormMessage> : null}
          </div>
        </form>
      )}
    </div>
  );
}

/** Revoke a granted license (POST /v1/creator/grants/:id/revoke). A reason is required: the holder sees it. */
export function RevokeGrantButton({ id, who }: { id: string; who: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const reason = String(new FormData(e.currentTarget).get("reason") ?? "").trim();
    if (reason.length < 3) return setError("Give a reason: it is recorded and shown to the license holder.");
    setBusy(true);
    setError(null);
    const res = await callApi<GrantRow>("POST", `/v1/creator/grants/${encodeURIComponent(id)}/revoke`, { reason });
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
    <form onSubmit={submit} className="inline-flex max-w-[340px] flex-col items-end gap-1.5 text-left text-[12.5px]" data-revoke-grant>
      <label htmlFor={`rv-${id}`} className="self-start font-bold">
        Revoke the license of {who}? Its server stops when its offline grace ends.
      </label>
      <input id={`rv-${id}`} name="reason" required minLength={3} maxLength={2000} placeholder="Reason (shown to the holder)" className="h-8 w-full rounded-lg border-2 border-line-soft bg-surface px-2 text-[13px] focus:border-line" />
      <span className="inline-flex gap-1.5">
        <Button type="submit" size="sm" variant="danger" disabled={busy}>
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
    </form>
  );
}
