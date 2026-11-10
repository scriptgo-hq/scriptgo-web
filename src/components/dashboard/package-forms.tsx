"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, describedBy, fieldErrors, inputClass, selectClass, textareaClass } from "@/components/ui/form";
import { callApi } from "@/lib/client-api";
import type { Category, CreatorPackageDetail, Offer, OfferInterval, Provider, Visibility } from "@/lib/contract";

const NAME_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/;

const CATEGORY_OPTIONS: [Category, string][] = [
  ["inventory", "Inventory"],
  ["permissions", "Permissions"],
  ["economy", "Economy"],
  ["events", "Events"],
  ["ui", "UI"],
  ["admin", "Admin"],
  ["framework", "Framework"],
  ["vehicles", "Vehicles"],
  ["housing", "Housing"],
  ["quests", "Quests"],
  ["library", "Library"],
  ["other", "Other"],
];

const VISIBILITY_OPTIONS: [Visibility, string][] = [
  ["public", "Public — listed in Explore once a release is published"],
  ["unlisted", "Unlisted — reachable by link only"],
  ["private", "Private — only you"],
];

interface PackageInitial {
  name: string;
  title: string;
  summary: string;
  category: Category;
  license: string;
  visibility: Visibility;
  repository: string | null;
}

/** Create a package (POST /v1/creator/packages) or edit one (PATCH /v1/creator/packages/:name). */
export function PackageForm({ creator, initial }: { creator: string; initial?: PackageInitial }) {
  const router = useRouter();
  const editing = Boolean(initial);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [name, setName] = useState(initial?.name ?? "");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const repo = String(fd.get("repository") ?? "").trim();
    const body = {
      title: String(fd.get("title") ?? "").trim(),
      summary: String(fd.get("summary") ?? "").trim(),
      category: String(fd.get("category") ?? "other"),
      license: String(fd.get("license") ?? "").trim(),
      visibility: String(fd.get("visibility") ?? "public"),
      repository: repo || null,
    };
    const local: Record<string, string> = {};
    if (!editing && !NAME_RE.test(name)) local.name = "Use lowercase letters, digits, '-' and '_', starting with a letter or digit.";
    if (!body.title) local.title = "Enter a title.";
    if (!body.license) local.license = "Enter the code license, for example MIT or a proprietary license name.";
    if (repo && !/^https?:\/\/\S+$/.test(repo)) local.repository = "Enter a full URL starting with https://.";
    setErrors(local);
    if (Object.keys(local).length) return;
    setBusy(true);
    setMessage(null);
    const res = editing
      ? await callApi<CreatorPackageDetail>("PATCH", `/v1/creator/packages/${encodeURIComponent(initial!.name)}`, body)
      : await callApi<CreatorPackageDetail>("POST", "/v1/creator/packages", { ...body, name });
    setBusy(false);
    if (!res.ok) {
      const fe = fieldErrors(res.details);
      if (res.code === "package_exists") fe.name = res.message;
      setErrors(fe);
      return setMessage({ tone: "error", text: res.message });
    }
    if (editing) {
      setMessage({ tone: "success", text: "Saved." });
      router.refresh();
    } else {
      router.push(`/dashboard/packages/${encodeURIComponent(res.data.name)}`);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {editing ? null : (
        <Field
          id="pk-name"
          label="Name"
          hint={
            <>
              Identifier: <span className="font-mono">{creator}//{name || "name"}</span>. It can&rsquo;t be changed later.
            </>
          }
          error={errors.name}
        >
          <input
            id="pk-name"
            name="name"
            required
            spellCheck={false}
            maxLength={64}
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase())}
            className={`${inputClass} font-mono`}
            {...describedBy("pk-name", true, errors.name)}
          />
        </Field>
      )}
      <Field id="pk-title" label="Title" error={errors.title} className={editing ? "md:col-span-2" : undefined}>
        <input id="pk-title" name="title" required maxLength={120} defaultValue={initial?.title} className={inputClass} {...describedBy("pk-title", false, errors.title)} />
      </Field>
      <Field id="pk-summary" label="Summary" optional hint="One sentence, shown on cards. Up to 300 characters." className="md:col-span-2" error={errors.summary}>
        <textarea
          id="pk-summary"
          name="summary"
          maxLength={300}
          defaultValue={initial?.summary}
          className={`${textareaClass} min-h-[72px]`}
          {...describedBy("pk-summary", true, errors.summary)}
        />
      </Field>
      <Field id="pk-category" label="Category" error={errors.category}>
        <select id="pk-category" name="category" defaultValue={initial?.category ?? "other"} className={selectClass}>
          {CATEGORY_OPTIONS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </Field>
      <Field id="pk-license" label="Code license" hint="SPDX id such as MIT, or the name of your own license." error={errors.license}>
        <input
          id="pk-license"
          name="license"
          required
          maxLength={128}
          defaultValue={initial?.license}
          className={`${inputClass} font-mono`}
          {...describedBy("pk-license", true, errors.license)}
        />
      </Field>
      <Field id="pk-visibility" label="Visibility" error={errors.visibility}>
        <select id="pk-visibility" name="visibility" defaultValue={initial?.visibility ?? "public"} className={selectClass}>
          {VISIBILITY_OPTIONS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </Field>
      <Field id="pk-repo" label="Repository" optional error={errors.repository}>
        <input
          id="pk-repo"
          name="repository"
          type="url"
          inputMode="url"
          maxLength={500}
          placeholder="https://"
          defaultValue={initial?.repository ?? ""}
          className={`${inputClass} font-mono text-[13.5px]`}
          {...describedBy("pk-repo", false, errors.repository)}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : editing ? "Save changes" : "Create package"}
        </Button>
        {message ? <FormMessage tone={message.tone}>{message.text}</FormMessage> : null}
      </div>
    </form>
  );
}

const CURRENCIES = ["EUR", "USD", "GBP"] as const;

/** POST /v1/creator/packages/:name/offers. Paid offers need a connected store; they stand on the creator's rights declaration, with no review. */
export function OfferForm({
  packageName,
  environments,
  stores,
}: {
  packageName: string;
  environments: { slug: string; name: string }[];
  stores: Provider[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [interval, setInterval] = useState<OfferInterval>("month");
  const [provider, setProvider] = useState<Provider | "">(stores.includes("tebex") ? "tebex" : (stores[0] ?? ""));
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const paid = interval !== "free";
  const noStore = paid && stores.length === 0;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const local: Record<string, string> = {};
    const name = String(fd.get("name") ?? "").trim();
    if (!name) local.name = "Name the offer, for example “Server license”.";
    let price: { amount: number; currency: string } | null = null;
    if (paid) {
      const raw = String(fd.get("price") ?? "").replace(",", ".").trim();
      const major = Number(raw);
      if (!raw || !Number.isFinite(major) || major <= 0) local.price = "Enter a price above zero, for example 6 or 6.50.";
      else price = { amount: Math.round(major * 100), currency: String(fd.get("currency") ?? "EUR") };
    }
    const deployments = Number(fd.get("deployments") ?? 1);
    if (!Number.isInteger(deployments) || deployments < 1 || deployments > 10000) local.deployments = "Whole number from 1 to 10,000.";
    const productId = String(fd.get("providerProductId") ?? "").trim();
    if (paid && provider === "tebex" && !productId) local.providerProductId = "Tebex offers need the Tebex package id.";
    setErrors(local);
    if (Object.keys(local).length) return;
    setBusy(true);
    setMessage(null);
    const res = await callApi<Offer>("POST", `/v1/creator/packages/${encodeURIComponent(packageName)}/offers`, {
      name,
      interval,
      price,
      environments: fd.getAll("environments").map(String),
      deployments,
      providerProductId: productId || null,
      ...(paid && provider ? { provider } : {}),
    });
    setBusy(false);
    if (!res.ok) {
      setErrors(fieldErrors(res.details));
      return setMessage(res.message);
    }
    setOpen(false);
    router.refresh();
  }

  if (!open)
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        New offer
      </Button>
    );

  return (
    <form onSubmit={submit} noValidate className="sticker grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
      <p className="font-display text-[20px] font-extrabold md:col-span-2">New offer.</p>
      <Field id="of-name" label="Name" error={errors.name}>
        <input id="of-name" name="name" required maxLength={80} placeholder="Server license" className={inputClass} {...describedBy("of-name", false, errors.name)} />
      </Field>
      <Field id="of-interval" label="Billing">
        <select id="of-interval" name="interval" value={interval} onChange={(e) => setInterval(e.target.value as OfferInterval)} className={selectClass}>
          <option value="free">Free</option>
          <option value="month">Monthly subscription</option>
          <option value="year">Yearly subscription</option>
          <option value="perpetual">One-time payment</option>
        </select>
      </Field>
      {paid ? (
        <>
          <div className="flex gap-2">
            <Field id="of-price" label="Price" error={errors.price} className="flex-1">
              <input
                id="of-price"
                name="price"
                inputMode="decimal"
                placeholder="6.00"
                className={`${inputClass} tabular`}
                {...describedBy("of-price", false, errors.price)}
              />
            </Field>
            <Field id="of-currency" label="Currency" className="w-28">
              <select id="of-currency" name="currency" defaultValue="EUR" className={selectClass}>
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field
            id="of-provider"
            label="Payment provider"
            hint={noStore ? "Connect a store first (Dashboard → Stores). Paid offers can't be saved without one." : "The store that takes the payment."}
          >
            <select
              id="of-provider"
              name="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as Provider)}
              disabled={noStore}
              className={selectClass}
              {...describedBy("of-provider", true, null)}
            >
              {stores.map((s) => (
                <option key={s} value={s}>
                  {s === "tebex" ? "Tebex" : "Mock (sandbox)"}
                </option>
              ))}
            </select>
          </Field>
          {provider === "tebex" ? (
            <Field id="of-product" label="Tebex package id" hint="The id of the matching package in your Tebex webstore." error={errors.providerProductId}>
              <input
                id="of-product"
                name="providerProductId"
                maxLength={128}
                className={`${inputClass} font-mono`}
                {...describedBy("of-product", true, errors.providerProductId)}
              />
            </Field>
          ) : null}
        </>
      ) : null}
      <Field id="of-deployments" label="Deployments per license" hint="How many servers may run it at once under one license." error={errors.deployments}>
        <input
          id="of-deployments"
          name="deployments"
          type="number"
          min={1}
          max={10000}
          step={1}
          defaultValue={1}
          className={`${inputClass} tabular`}
          {...describedBy("of-deployments", true, errors.deployments)}
        />
      </Field>
      <fieldset className="md:col-span-2">
        <legend className="text-[14px] font-bold">Runs on</legend>
        <p className="text-[13px] text-ink-3">
          The environments this license covers. Leave all unchecked to cover every environment the package lists. An environment is a place where the script
          runs, never what you sell; a platform&rsquo;s own rules are for the operator who runs it there.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {environments.map((env) => (
            <label key={env.slug} className="inline-flex items-center gap-2 rounded-full border-2 border-line-soft bg-surface px-3 py-1 text-[14px] has-[:checked]:border-line has-[:checked]:bg-sun-soft">
              <input type="checkbox" name="environments" value={env.slug} className="h-4 w-4 accent-[var(--cobalt)]" />
              {env.name}
            </label>
          ))}
        </div>
      </fieldset>
      {paid ? (
        <p className="text-[13.5px] text-ink-2 md:col-span-2">
          A paid offer can be bought once you have <strong>declared your rights</strong> for a published release. Nobody reviews it first: you decide what you
          sell and you answer for it, whatever environments it runs on. SCRIPT//GO acts on reports, and can put an offer on hold with a notice you can appeal.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <Button type="submit" disabled={busy || noStore} aria-describedby={noStore ? "of-provider-hint" : undefined}>
          {busy ? "Saving…" : "Create offer"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        {message ? <FormMessage tone="error">{message}</FormMessage> : null}
      </div>
    </form>
  );
}

export function WithdrawOfferButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run() {
    setBusy(true);
    const res = await callApi("DELETE", `/v1/creator/offers/${encodeURIComponent(id)}`);
    setBusy(false);
    if (!res.ok) return setError(res.message);
    router.refresh();
  }
  if (!confirming)
    return (
      <span className="inline-flex flex-col items-end">
        <Button size="sm" variant="danger" onClick={() => setConfirming(true)}>
          Withdraw
        </Button>
        {error ? <span className="mt-1 text-[12px] text-bad">{error}</span> : null}
      </span>
    );
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-1.5 text-[12.5px]">
      Withdraw {name}? It stops being offered for sale.
      <Button size="sm" variant="danger" onClick={run} disabled={busy}>
        {busy ? "…" : "Withdraw"}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
        Keep
      </Button>
    </span>
  );
}
