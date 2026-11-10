"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, CircleX, Hourglass, TriangleAlert, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Field, FormMessage, inputClass } from "@/components/ui/form";
import { callApi } from "@/lib/client-api";
import { cn } from "@/lib/cn";
import type { ReadinessCheck, ReadinessStatus, ReadinessSummary, StoreReadiness } from "@/lib/contract";

/**
 * Tebex readiness: what is configured and what is missing, as the API computed it from real
 * configuration and recorded deliveries (GET /v1/creator/stores/:id/readiness and
 * GET /v1/admin/commerce/readiness). The panel shows; it never switches anything on.
 */

const STATUS: Record<ReadinessStatus, { label: string; icon: LucideIcon; cls: string }> = {
  ok: { label: "Done", icon: CircleCheck, cls: "text-ok" },
  missing: { label: "Missing", icon: CircleX, cls: "text-bad" },
  warning: { label: "To check", icon: TriangleAlert, cls: "text-warn" },
  blocked: { label: "Waiting", icon: Hourglass, cls: "text-ink-2" },
};

function CheckRow({ check }: { check: ReadinessCheck }) {
  const s = STATUS[check.status];
  const Icon = s.icon;
  return (
    <li className="grid grid-cols-1 gap-x-4 gap-y-1 border-t border-line-soft px-4 py-3 first:border-t-0 sm:grid-cols-[7.5rem_minmax(0,1fr)]" data-check={check.id} data-status={check.status}>
      <span className={cn("inline-flex items-center gap-1.5 self-start text-[13px] font-bold", s.cls)}>
        <Icon aria-hidden="true" size={16} strokeWidth={2.25} className="shrink-0" />
        {s.label}
      </span>
      <div className="min-w-0">
        <p className="font-semibold">{check.label}</p>
        <p className="mt-0.5 break-words text-[14px] text-ink-2">{check.detail}</p>
        {check.fix ? (
          <p className="mt-1 break-words text-[13.5px]">
            <span className="font-mono text-[11.5px] font-bold uppercase tracking-wide text-ink-3">To do </span>
            {check.fix}
          </p>
        ) : null}
      </div>
    </li>
  );
}

function Remaining({ summary, subject }: { summary: ReadinessSummary; subject: string }) {
  if (summary.ready) {
    return (
      <p role="status" className="inline-flex items-start gap-2 rounded-lg border-2 border-ok/50 bg-ok-soft px-3 py-2 text-[14px] font-semibold">
        <CircleCheck aria-hidden="true" size={17} className="mt-0.5 shrink-0 text-ok" />
        Nothing is missing: {subject} can open checkout.
      </p>
    );
  }
  return (
    <div role="status" className="rounded-lg border-2 border-line-soft bg-surface-2 px-3 py-2 text-[14px]">
      <p className="font-bold">
        {summary.remaining.length} {summary.remaining.length === 1 ? "thing is" : "things are"} left before {subject} can open checkout:
      </p>
      <ol className="mt-1 list-decimal space-y-0.5 pl-5">
        {summary.remaining.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ol>
    </div>
  );
}

export function ReadinessChecklist({ checks, summary, subject, caption }: { checks: ReadinessCheck[]; summary: ReadinessSummary; subject: string; caption: string }) {
  return (
    <div className="space-y-3">
      <Remaining summary={summary} subject={subject} />
      <ul aria-label={caption} className="rounded-[10px] border-2 border-line-soft">
        {checks.map((c) => (
          <CheckRow key={c.id} check={c} />
        ))}
      </ul>
    </div>
  );
}

function WebhookUrl({ url }: { url: string }) {
  return (
    <p className="flex min-w-0 flex-wrap items-center gap-2 text-[14px]">
      <span className="font-mono text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">Webhook URL for Tebex</span>
      <code className="min-w-0 break-all rounded-md border-2 border-line-soft bg-surface-2 px-2 py-1 font-mono text-[12.5px]">{url}</code>
      <CopyButton text={url} label="Copy URL" tone="light" />
    </p>
  );
}

/** One connected Tebex store: its checklist, for the creator (stores page) and for staff. */
export function TebexStoreReadiness({ readiness, headingId, showCreator = false, children }: { readiness: StoreReadiness; headingId: string; showCreator?: boolean; children?: React.ReactNode }) {
  return (
    <section aria-labelledby={headingId} className="space-y-3" data-readiness-store={readiness.storeId}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={headingId} className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">
          {showCreator ? `Tebex store of ${readiness.creator}` : "Tebex readiness"}
        </h3>
        <span className="text-[12.5px] text-ink-3">Read from this server&rsquo;s configuration and recorded webhooks. No secret is shown.</span>
      </div>
      <WebhookUrl url={readiness.webhookUrl} />
      <ReadinessChecklist checks={readiness.checks} summary={readiness.summary} subject="this store" caption="Tebex readiness checks of this store" />
      {children}
    </section>
  );
}

/** Shown on the stores page while no Tebex store is connected: the same steps, none of them done. */
export function TebexNotConnected() {
  const steps: [string, string][] = [
    ["Create the package in your own Tebex store", "Shops run on your own Tebex store: SCRIPT//GO never takes payments itself."],
    ["Connect the store below", "Paste the webhook secret (Tebex > Developers > Webhooks) and the public token (Tebex > Integrations > Headless API). Both are stored sealed and never shown again."],
    ["Add the webhook endpoint in Tebex", "After connecting, this page shows the URL to paste in Tebex > Developers > Webhooks > Endpoints. Tebex validates it at once."],
    ["Map each paid offer to its Tebex package id", "The id goes in the offer's provider product when you create the offer."],
    ["Wait for the approvals", "SCRIPT//GO staff approve the store, and checkout opens once Tebex has approved SCRIPT//GO in writing. Until then nothing can be bought."],
  ];
  return (
    <section aria-labelledby="tebex-steps-title" className="panel p-5">
      <h2 id="tebex-steps-title" className="font-display text-[22px] font-extrabold">
        Selling through Tebex: not connected yet.
      </h2>
      <p className="mt-1 max-w-prose text-[14px] text-ink-2">Once a Tebex store is connected, this list turns into a readiness check of what is configured and what is missing.</p>
      <ol className="mt-3 rounded-[10px] border-2 border-line-soft">
        {steps.map(([title, body], i) => (
          <li key={title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2 border-t border-line-soft px-4 py-3 first:border-t-0">
            <span aria-hidden="true" className="tabular font-mono text-[13px] font-bold text-ink-3">
              {i + 1}.
            </span>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="mt-0.5 text-[14px] text-ink-2">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Staff: approve a Tebex store, or withdraw the approval (POST /v1/admin/stores/:id/approval, audited
 * with the reason). Approval alone opens nothing: COMMERCE_CHECKOUT_ENABLED must be true as well.
 */
export function StoreApprovalControl({ storeId, creator, approved }: { storeId: string; creator: string; approved: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = !approved;
  const fieldId = `approval-reason-${storeId}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (reason.trim().length < 3) return setError("Give the reason (3 characters or more). It is written to the audit log.");
    setBusy(true);
    setError(null);
    const res = await callApi<unknown>("POST", `/v1/admin/stores/${encodeURIComponent(storeId)}/approval`, { approved: next, reason: reason.trim() });
    setBusy(false);
    if (!res.ok) return setError(res.message);
    setOpen(false);
    setReason("");
    router.refresh();
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" variant={next ? "primary" : "danger"} onClick={() => setOpen(true)}>
          {next ? "Approve this store…" : "Withdraw the approval…"}
        </Button>
        <span className="text-[13px] text-ink-3">
          {approved ? "Approved. Withdrawing closes its checkout; existing licenses keep working." : "Approve only after Tebex's written approval of SCRIPT//GO."}
        </span>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 rounded-[10px] border-2 border-line bg-surface p-3">
      <Field id={fieldId} label={next ? `Why is ${creator}'s store approved?` : `Why is the approval of ${creator}'s store withdrawn?`} hint="Recorded in the audit log with your account.">
        <input id={fieldId} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={5000} className={inputClass} aria-describedby={`${fieldId}-hint`} />
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" variant={next ? "primary" : "danger"} disabled={busy}>
          {busy ? "Saving…" : next ? "Approve store" : "Withdraw approval"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        {error ? <FormMessage tone="error">{error}</FormMessage> : null}
      </div>
    </form>
  );
}
