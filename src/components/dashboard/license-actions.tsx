"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { callApi } from "@/lib/client-api";
import type { AddDeploymentResult } from "@/lib/contract";
import { envLongName } from "@/lib/env";

function Secret({ value, label }: { value: string; label: string }) {
  return (
    <div className="space-y-2 rounded-[10px] border-2 border-line bg-sun-soft p-3" role="status">
      <p className="text-[13.5px] font-bold">{label} It is shown once: copy it now and keep it on your server.</p>
      <div className="flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 break-all rounded-md bg-code-bg px-2 py-1.5 font-mono text-[13px] text-code-fg">{value}</code>
        <CopyButton text={value} tone="light" />
      </div>
    </div>
  );
}

/** Masked key with an inline-confirmed rotate. The full key is only ever shown right after rotation. */
export function LicenseKeyField({
  licenseId,
  preview,
  revealAvailable,
  disabledReason,
}: {
  licenseId: string;
  preview: string;
  /** The freshly issued key has not been shown yet: one reveal is allowed. */
  revealAvailable: boolean;
  disabledReason: string | null;
}) {
  const [confirming, setConfirming] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const router = useRouter();

  async function rotate() {
    setBusy(true);
    setError(null);
    const res = await callApi<{ key: string }>("POST", `/v1/me/licenses/${encodeURIComponent(licenseId)}/rotate`);
    setBusy(false);
    setConfirming(false);
    if (!res.ok) return setError(res.message);
    setKey(res.data.key);
    router.refresh();
  }

  async function reveal() {
    setRevealing(true);
    setError(null);
    const res = await callApi<{ key: string }>("POST", `/v1/me/licenses/${encodeURIComponent(licenseId)}/reveal`);
    setRevealing(false);
    if (!res.ok) return setError(res.message);
    setKey(res.data.key);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <code className="tabular rounded-lg border-2 border-line bg-surface px-3 py-2 font-mono text-[15px]" aria-label="License key, masked">
          {preview}
        </code>
        {revealAvailable && !key ? (
          <Button variant="sun" size="sm" onClick={reveal} disabled={revealing}>
            {revealing ? "Revealing…" : "Reveal key once"}
          </Button>
        ) : null}
        {!confirming ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setConfirming(true)}
            disabled={Boolean(disabledReason)}
            aria-describedby={disabledReason ? "rotate-reason" : undefined}
          >
            <RotateCw aria-hidden="true" size={14} /> Rotate
          </Button>
        ) : (
          <span className="inline-flex flex-wrap items-center gap-2 rounded-lg border-2 border-warn/50 bg-warn-soft px-3 py-1.5 text-[13.5px]">
            The current key stops working immediately.
            <Button size="sm" variant="primary" onClick={rotate} disabled={busy}>
              {busy ? "Rotating…" : "Rotate key"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </span>
        )}
      </div>
      {disabledReason ? (
        <p id="rotate-reason" className="text-[13px] text-ink-3">
          Rotate unavailable: {disabledReason}
        </p>
      ) : (
        <p className="text-[13px] text-ink-3">The full key is shown once after the license is issued and once after each rotation. Lost it? Rotate to get a new one.</p>
      )}
      {key ? <Secret value={key} label="Your license key." /> : null}
      {error ? (
        <p role="alert" className="text-[13.5px] font-semibold text-bad">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AddDeploymentForm({
  licenseId,
  environments,
  disabledReason,
}: {
  licenseId: string;
  environments: string[];
  disabledReason: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const res = await callApi<AddDeploymentResult>("POST", `/v1/me/licenses/${encodeURIComponent(licenseId)}/deployments`, {
      name: String(fd.get("name") ?? "").trim(),
      environment: String(fd.get("environment") ?? ""),
    });
    setBusy(false);
    if (!res.ok) return setError(res.message);
    setToken(res.data.deploymentToken);
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {!open ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" onClick={() => setOpen(true)} disabled={Boolean(disabledReason)} aria-describedby={disabledReason ? "add-dep-reason" : undefined}>
            <Plus aria-hidden="true" size={15} /> Add deployment
          </Button>
          {disabledReason ? (
            <span id="add-dep-reason" className="text-[13px] text-ink-3">
              {disabledReason}
            </span>
          ) : null}
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-[10px] border-2 border-line bg-surface p-3">
          <div>
            <label htmlFor="dep-name" className="block text-[13px] font-bold">
              Name
            </label>
            <input
              id="dep-name"
              name="name"
              required
              maxLength={64}
              placeholder="prod-eu-1"
              className="mt-1 h-9 w-48 rounded-lg border-2 border-line-soft bg-surface px-2 font-mono text-[14px] focus:border-line"
            />
          </div>
          <div>
            <label htmlFor="dep-env" className="block text-[13px] font-bold">
              Environment
            </label>
            <select id="dep-env" name="environment" required className="mt-1 h-9 rounded-lg border-2 border-line-soft bg-surface px-2 text-[14px] focus:border-line">
              {environments.map((e) => (
                <option key={e} value={e}>
                  {envLongName(e)}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? "Adding…" : "Add deployment"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </form>
      )}
      {token ? <Secret value={token} label="Deployment token created. The row shows “Waiting for first check” until your server calls verify." /> : null}
      {error ? (
        <p role="alert" className="text-[13.5px] font-semibold text-bad">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Unbinds the deployment's server key so a moved or re-installed server can bind its new one. The
 * API audits each reset and allows three per deployment per day.
 */
export function ResetServerKeyButton({ licenseId, activationId, name }: { licenseId: string; activationId: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function run() {
    setBusy(true);
    setError(null);
    const res = await callApi<unknown>("POST", `/v1/me/licenses/${encodeURIComponent(licenseId)}/deployments/${encodeURIComponent(activationId)}/reset-server-key`);
    setBusy(false);
    setConfirming(false);
    if (!res.ok) return setError(res.message);
    setDone(true);
    router.refresh();
  }

  if (!confirming)
    return (
      <span className="inline-flex flex-col items-end">
        <Button size="sm" variant="secondary" onClick={() => setConfirming(true)}>
          Reset server key
        </Button>
        {done ? (
          <span role="status" className="mt-1 text-[12px] text-ink-2">
            Reset. The next key request binds the server that makes it.
          </span>
        ) : null}
        {error ? (
          <span role="alert" className="mt-1 max-w-[260px] text-right text-[12px] text-bad">
            {error}
          </span>
        ) : null}
      </span>
    );
  return (
    <span className="inline-flex max-w-[300px] flex-wrap items-center justify-end gap-1.5 text-right text-[12.5px]">
      Unbind {name} from its server key? Do it after moving or re-installing that server. The next server to ask with this deployment&rsquo;s
      token is bound. Recorded; 3 per day.
      <Button size="sm" variant="primary" onClick={run} disabled={busy}>
        {busy ? "…" : "Reset key"}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
        Keep
      </Button>
    </span>
  );
}

export function DeactivateButton({ licenseId, activationId, name }: { licenseId: string; activationId: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function run() {
    setBusy(true);
    const res = await callApi<unknown>("DELETE", `/v1/me/licenses/${encodeURIComponent(licenseId)}/deployments/${encodeURIComponent(activationId)}`);
    setBusy(false);
    if (!res.ok) return setError(res.message);
    setConfirming(false);
    router.refresh();
  }

  if (!confirming)
    return (
      <span className="inline-flex flex-col items-end">
        <Button size="sm" variant="danger" onClick={() => setConfirming(true)}>
          Deactivate
        </Button>
        {error ? <span className="mt-1 text-[12px] text-bad">{error}</span> : null}
      </span>
    );
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-1.5 text-[12.5px]">
      Deactivate {name}? It frees one slot.
      <Button size="sm" variant="danger" onClick={run} disabled={busy}>
        {busy ? "…" : "Deactivate"}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
        Keep
      </Button>
    </span>
  );
}
