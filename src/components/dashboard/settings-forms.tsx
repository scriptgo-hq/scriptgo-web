"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Field, FormMessage, describedBy, fieldErrors, inputClass, selectClass, textareaClass } from "@/components/ui/form";
import { callApi } from "@/lib/client-api";
import type { CreatedToken } from "@/lib/contract";

/** Same rule as USERNAME_RE in @scriptgo/shared. */
const USERNAME_RE = /^[a-z0-9][a-z0-9-]{1,38}$/;

export function CreatorProfileForm({ suggestedName }: { suggestedName: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [username, setUsername] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      username: String(fd.get("username") ?? "").trim(),
      displayName: String(fd.get("displayName") ?? "").trim(),
      bio: String(fd.get("bio") ?? ""),
      links: String(fd.get("links") ?? "")
        .split(/\s+/)
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const local: Record<string, string> = {};
    if (!USERNAME_RE.test(body.username)) local.username = "Use 2–39 lowercase letters, digits or '-', starting with a letter or digit.";
    if (!body.displayName) local.displayName = "Enter the name shown on your packages.";
    if (body.links.length > 8) local.links = "Up to 8 links.";
    setErrors(local);
    if (Object.keys(local).length) return;
    setBusy(true);
    setMessage(null);
    const res = await callApi("POST", "/v1/creator/profile", body);
    setBusy(false);
    if (!res.ok) {
      const fe = fieldErrors(res.details);
      if (res.code === "username_taken" || res.code === "username_reserved") fe.username = res.message;
      setErrors(fe);
      return setMessage(res.message);
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field
        id="cp-username"
        label="Username"
        hint={
          <>
            Your namespace: <span className="font-mono">{username || "username"}//package</span>. It can&rsquo;t be changed later.
          </>
        }
        error={errors.username}
      >
        <input
          id="cp-username"
          name="username"
          required
          autoComplete="username"
          spellCheck={false}
          maxLength={39}
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          className={`${inputClass} font-mono`}
          {...describedBy("cp-username", true, errors.username)}
        />
      </Field>
      <Field id="cp-display" label="Display name" error={errors.displayName}>
        <input
          id="cp-display"
          name="displayName"
          required
          maxLength={80}
          defaultValue={suggestedName}
          className={inputClass}
          {...describedBy("cp-display", false, errors.displayName)}
        />
      </Field>
      <Field id="cp-bio" label="Bio" optional className="md:col-span-2" error={errors.bio}>
        <textarea id="cp-bio" name="bio" maxLength={2000} className={textareaClass} {...describedBy("cp-bio", false, errors.bio)} />
      </Field>
      <Field id="cp-links" label="Links" optional hint="Full URLs separated by spaces or new lines, up to 8." className="md:col-span-2" error={errors.links}>
        <textarea id="cp-links" name="links" className={`${textareaClass} min-h-[70px] font-mono text-[13.5px]`} {...describedBy("cp-links", true, errors.links)} />
      </Field>
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Creating…" : "Create creator profile"}
        </Button>
        {message ? <FormMessage tone="error">{message}</FormMessage> : null}
      </div>
    </form>
  );
}

export function CreateTokenForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedToken | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const days = String(fd.get("expires") ?? "90");
    setBusy(true);
    setError(null);
    const res = await callApi<CreatedToken>("POST", "/v1/me/tokens", {
      name: String(fd.get("name") ?? "").trim() || "cli",
      expiresInDays: days === "never" ? null : Number(days),
    });
    setBusy(false);
    if (!res.ok) return setError(res.message);
    setCreated(res.data);
    form.reset();
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
        <Field id="tok-name" label="Name" className="w-full sm:w-56">
          <input id="tok-name" name="name" maxLength={80} placeholder="laptop-cli" className={inputClass} />
        </Field>
        <Field id="tok-exp" label="Expires" className="w-full sm:w-44">
          <select id="tok-exp" name="expires" defaultValue="90" className={selectClass}>
            <option value="7">in 7 days</option>
            <option value="30">in 30 days</option>
            <option value="90">in 90 days</option>
            <option value="365">in 1 year</option>
            <option value="never">never</option>
          </select>
        </Field>
        <Button type="submit" disabled={busy}>
          <Plus aria-hidden="true" size={16} /> {busy ? "Creating…" : "Create token"}
        </Button>
      </form>
      {created ? (
        <div role="status" className="space-y-2 rounded-[10px] border-2 border-line bg-sun-soft p-3">
          <p className="text-[13.5px] font-bold">
            Token &ldquo;{created.name}&rdquo; created. It is shown once: copy it now and give it to the CLI, which sends it as a Bearer token.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-md bg-code-bg px-2 py-1.5 font-mono text-[13px] text-code-fg">{created.token}</code>
            <CopyButton text={created.token} tone="light" />
          </div>
        </div>
      ) : null}
      {error ? <FormMessage tone="error">{error}</FormMessage> : null}
    </div>
  );
}

export function RevokeTokenButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    const res = await callApi("DELETE", `/v1/me/tokens/${encodeURIComponent(id)}`);
    setBusy(false);
    if (!res.ok) return setError(res.message);
    router.refresh();
  }

  if (!confirming)
    return (
      <span className="inline-flex flex-col items-end">
        <Button size="sm" variant="danger" onClick={() => setConfirming(true)}>
          Revoke
        </Button>
        {error ? <span className="mt-1 text-[12px] text-bad">{error}</span> : null}
      </span>
    );
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-1.5 text-[12.5px]">
      Revoke {name}? Tools using it stop working.
      <Button size="sm" variant="danger" onClick={run} disabled={busy}>
        {busy ? "…" : "Revoke"}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
        Keep
      </Button>
    </span>
  );
}
