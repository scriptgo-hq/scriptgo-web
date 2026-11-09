"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { describedBy, Field, fieldErrors, FormMessage, selectClass, textareaClass } from "@/components/ui/form";
import { callApi } from "@/lib/client-api";
import { classificationMeta } from "@/lib/status";
import { MODERATION_ACTIONS, type ModerationActionKey } from "./status";

type Result = { tone: "error" | "success"; text: string } | null;

function useSubmit() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  async function submit(path: string, body: unknown, success: string): Promise<boolean> {
    setBusy(true);
    setResult(null);
    setErrors({});
    const res = await callApi<unknown>("POST", path, body);
    setBusy(false);
    if (!res.ok) {
      setErrors(fieldErrors(res.details));
      setResult({ tone: "error", text: `${res.message} (${res.code})` });
      return false;
    }
    setResult({ tone: "success", text: success });
    router.refresh();
    return true;
  }
  return { busy, result, errors, submit };
}

// ---------------------------------------------------------------- report: start review

/** POST /v1/admin/reports/:id/review — moves a received case to "under review". */
export function StartReviewButton({ caseRef }: { caseRef: string }) {
  const { busy, result, submit } = useSubmit();
  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" onClick={() => void submit(`/v1/admin/reports/${encodeURIComponent(caseRef)}/review`, undefined, "Case moved to under review.")} disabled={busy}>
        {busy ? "Starting…" : "Start review"}
      </Button>
      {result ? <FormMessage tone={result.tone}>{result.text}</FormMessage> : null}
    </div>
  );
}

// ---------------------------------------------------------------- offers

const OFFER_CLASSIFICATIONS = ["software_license", "authorized_app_feature", "free", "rejected", "pending_review"] as const;

export function OfferDecisionForm({ offerId, current }: { offerId: string; current: string }) {
  const uid = useId();
  const [classification, setClassification] = useState<string>(current === "pending_review" ? "software_license" : current);
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const { busy, result, errors, submit } = useSubmit();
  const reasonOk = reason.trim().length >= 3;

  async function send() {
    const ok = await submit(
      `/v1/admin/review/offers/${encodeURIComponent(offerId)}/decision`,
      { classification, reason: reason.trim() },
      `Recorded as ${classificationMeta[classification as keyof typeof classificationMeta]?.label ?? classification}.`,
    );
    setConfirming(false);
    if (ok) setReason("");
  }

  return (
    <form
      className="grid grid-cols-1 gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!reasonOk) return;
        if (classification === "rejected" && !confirming) return setConfirming(true);
        void send();
      }}
    >
      <Field id={`${uid}-cls`} label="Classification" error={errors.classification}>
        <select
          id={`${uid}-cls`}
          value={classification}
          onChange={(e) => {
            setClassification(e.target.value);
            setConfirming(false);
          }}
          className={selectClass}
          {...describedBy(`${uid}-cls`, false, errors.classification)}
        >
          {OFFER_CLASSIFICATIONS.map((c) => (
            <option key={c} value={c}>
              {classificationMeta[c].label}
            </option>
          ))}
        </select>
      </Field>
      <Field id={`${uid}-reason`} label="Reason" hint="Recorded in the audit log and shown to the creator. At least 3 characters." error={errors.reason}>
        <textarea
          id={`${uid}-reason`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          minLength={3}
          maxLength={5000}
          className={textareaClass}
          {...describedBy(`${uid}-reason`, true, errors.reason)}
        />
      </Field>
      {confirming ? (
        <div role="alert" className="rounded-lg border-2 border-bad/50 bg-bad-soft p-3 text-[14px]">
          <p className="font-bold">Reject this offer?</p>
          <p className="mt-0.5 text-ink-2">It gets no purchase path and the creator is told why. This is recorded in the audit log.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="submit" size="sm" variant="danger" disabled={busy}>
              {busy ? "Recording…" : "Reject offer"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="sm" disabled={busy || !reasonOk}>
            {busy ? "Recording…" : "Record decision"}
          </Button>
          {!reasonOk ? <span className="text-[13px] text-ink-3">Write a reason to enable the decision.</span> : null}
        </div>
      )}
      {result ? <FormMessage tone={result.tone}>{result.text}</FormMessage> : null}
    </form>
  );
}

// ---------------------------------------------------------------- releases

const RELEASE_DECISIONS = {
  approve: { label: "Approve", effect: "The release stays listed and installable." },
  restrict: { label: "Restrict", effect: "The release is no longer downloadable or installable; the creator gets a notice with your reason." },
  reinstate: { label: "Reinstate", effect: "Lifts an earlier restriction: the release becomes installable again." },
} as const;

/** `:id` is the review id (ReviewRelease.review.id), per apps/api/src/routes/admin.ts. */
export function ReleaseDecisionForm({ reviewId, restricted }: { reviewId: string; restricted: boolean }) {
  const uid = useId();
  const options = restricted ? (["reinstate", "restrict"] as const) : (["approve", "restrict"] as const);
  const [decision, setDecision] = useState<keyof typeof RELEASE_DECISIONS>(options[0]);
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const { busy, result, errors, submit } = useSubmit();
  const reasonOk = reason.trim().length >= 3;

  async function send() {
    const ok = await submit(
      `/v1/admin/review/releases/${encodeURIComponent(reviewId)}/decision`,
      { decision, reason: reason.trim() },
      `Recorded: ${RELEASE_DECISIONS[decision].label.toLowerCase()}.`,
    );
    setConfirming(false);
    if (ok) setReason("");
  }

  return (
    <form
      className="grid grid-cols-1 gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!reasonOk) return;
        if (decision === "restrict" && !confirming) return setConfirming(true);
        void send();
      }}
    >
      <fieldset>
        <legend className="text-[14px] font-bold">Decision</legend>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {options.map((d) => (
            <label key={d} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-line-soft bg-surface px-3 py-1.5 text-[14px] font-semibold has-[:checked]:border-line has-[:checked]:bg-surface-2">
              <input
                type="radio"
                name={`${uid}-decision`}
                value={d}
                checked={decision === d}
                onChange={() => {
                  setDecision(d);
                  setConfirming(false);
                }}
                className="accent-[var(--cobalt)]"
              />
              {RELEASE_DECISIONS[d].label}
            </label>
          ))}
        </div>
        <p className="mt-1 text-[13px] text-ink-3">{RELEASE_DECISIONS[decision].effect}</p>
      </fieldset>
      <Field id={`${uid}-reason`} label="Reason" hint="Recorded in the audit log. At least 3 characters." error={errors.reason}>
        <textarea
          id={`${uid}-reason`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          minLength={3}
          maxLength={5000}
          className={textareaClass}
          {...describedBy(`${uid}-reason`, true, errors.reason)}
        />
      </Field>
      {confirming ? (
        <div role="alert" className="rounded-lg border-2 border-bad/50 bg-bad-soft p-3 text-[14px]">
          <p className="font-bold">Restrict this release?</p>
          <p className="mt-0.5 text-ink-2">{RELEASE_DECISIONS.restrict.effect}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="submit" size="sm" variant="danger" disabled={busy}>
              {busy ? "Recording…" : "Restrict release"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="sm" disabled={busy || !reasonOk}>
            {busy ? "Recording…" : "Record decision"}
          </Button>
          {!reasonOk ? <span className="text-[13px] text-ink-3">Write a reason to enable the decision.</span> : null}
        </div>
      )}
      {result ? <FormMessage tone={result.tone}>{result.text}</FormMessage> : null}
    </form>
  );
}

// ---------------------------------------------------------------- reports

export function ReportDecisionForm({
  caseRef,
  caseLabel,
  targetsPackage,
  disabledReason,
}: {
  /** Internal id or RPT- case id (the API accepts both). */
  caseRef: string;
  caseLabel: string;
  targetsPackage: boolean;
  disabledReason: string | null;
}) {
  const uid = useId();
  const [action, setAction] = useState<ModerationActionKey>("no_action");
  const [reasons, setReasons] = useState("");
  const [escalate, setEscalate] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { busy, result, errors, submit } = useSubmit();
  const reasonsOk = reasons.trim().length >= 10;
  const locked = Boolean(disabledReason);

  async function send() {
    const ok = await submit(
      `/v1/admin/reports/${encodeURIComponent(caseRef)}/decision`,
      { action, reasons: reasons.trim(), escalate },
      `Decision recorded for ${caseLabel}. The creator receives the statement of reasons as a notice.`,
    );
    setConfirming(false);
    if (ok) setReasons("");
  }

  return (
    <form
      className="grid grid-cols-1 gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (locked || !reasonsOk) return;
        if (!confirming) return setConfirming(true);
        void send();
      }}
    >
      {disabledReason ? <FormMessage tone="error">{disabledReason}</FormMessage> : null}
      <fieldset disabled={locked}>
        <legend className="text-[14px] font-bold">Action</legend>
        <div className="mt-2 grid grid-cols-1 gap-2">
          {(Object.keys(MODERATION_ACTIONS) as ModerationActionKey[]).map((k) => {
            const needsPackage = k !== "no_action" && !targetsPackage;
            return (
              <label
                key={k}
                className="flex cursor-pointer items-start gap-2.5 rounded-lg border-2 border-line-soft bg-surface px-3 py-2 has-[:checked]:border-line has-[:checked]:bg-surface-2 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
              >
                <input
                  type="radio"
                  name={`${uid}-action`}
                  value={k}
                  checked={action === k}
                  disabled={needsPackage}
                  onChange={() => {
                    setAction(k);
                    setConfirming(false);
                  }}
                  className="mt-1 accent-[var(--cobalt)]"
                />
                <span className="min-w-0">
                  <span className="block text-[14px] font-bold">{MODERATION_ACTIONS[k].label}</span>
                  <span className="block text-[13px] text-ink-2">
                    {needsPackage ? "Unavailable: this report does not target a package on SCRIPT//GO." : MODERATION_ACTIONS[k].effect}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <Field
        id={`${uid}-reasons`}
        label="Statement of reasons — sent to the creator"
        hint="Facts relied on, the rule applied and the scope. At least 10 characters. The creator can appeal."
        error={errors.reasons}
      >
        <textarea
          id={`${uid}-reasons`}
          value={reasons}
          onChange={(e) => setReasons(e.target.value)}
          disabled={locked}
          required
          minLength={10}
          maxLength={10000}
          className={textareaClass}
          {...describedBy(`${uid}-reasons`, true, errors.reasons)}
        />
      </Field>
      <label className="flex items-start gap-2.5 text-[14px]">
        <input type="checkbox" checked={escalate} disabled={locked} onChange={(e) => setEscalate(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--cobalt)]" />
        <span>
          <span className="font-bold">Escalate to legal review</span>
          <span className="block text-[13px] text-ink-2">The case stays open with the status “Escalated to legal” after this decision.</span>
        </span>
      </label>
      {confirming ? (
        <div role="alert" className="rounded-lg border-2 border-warn/50 bg-warn-soft p-3 text-[14px]">
          <p className="font-bold">
            Record “{MODERATION_ACTIONS[action].label}” for {caseLabel}
            {escalate ? " and escalate" : ""}?
          </p>
          <p className="mt-0.5 text-ink-2">{MODERATION_ACTIONS[action].effect} Decisions are recorded once; only an appeal reopens the case.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="submit" size="sm" variant={action === "no_action" ? "primary" : "danger"} disabled={busy}>
              {busy ? "Recording…" : "Confirm decision"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={busy || locked || !reasonsOk}>
            Review decision
          </Button>
          {!locked && !reasonsOk ? <span className="text-[13px] text-ink-3">Write the statement of reasons (10 characters or more) to continue.</span> : null}
        </div>
      )}
      {result ? <FormMessage tone={result.tone}>{result.text}</FormMessage> : null}
    </form>
  );
}

// ---------------------------------------------------------------- appeals

export function AppealDecisionForm({ appealId }: { appealId: string }) {
  const uid = useId();
  const [outcome, setOutcome] = useState<"upheld" | "reversed">("upheld");
  const [reasons, setReasons] = useState("");
  const [confirming, setConfirming] = useState(false);
  const { busy, result, errors, submit } = useSubmit();
  const reasonsOk = reasons.trim().length >= 10;

  async function send() {
    const ok = await submit(
      `/v1/admin/appeals/${encodeURIComponent(appealId)}/decision`,
      { outcome, reasons: reasons.trim() },
      outcome === "reversed" ? "Appeal accepted: the decision is reversed and the case is closed." : "Appeal rejected: the decision stands and the case is closed.",
    );
    setConfirming(false);
    if (ok) setReasons("");
  }

  return (
    <form
      className="mt-3 grid grid-cols-1 gap-3 rounded-[10px] border-2 border-line-soft bg-surface p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!reasonsOk) return;
        if (!confirming) return setConfirming(true);
        void send();
      }}
    >
      <fieldset>
        <legend className="text-[14px] font-bold">Appeal outcome</legend>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {(
            [
              ["upheld", "Uphold the decision"],
              ["reversed", "Reverse the decision"],
            ] as const
          ).map(([v, label]) => (
            <label key={v} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-line-soft bg-surface px-3 py-1.5 text-[14px] font-semibold has-[:checked]:border-line has-[:checked]:bg-surface-2">
              <input
                type="radio"
                name={`${uid}-outcome`}
                value={v}
                checked={outcome === v}
                onChange={() => {
                  setOutcome(v);
                  setConfirming(false);
                }}
                className="accent-[var(--cobalt)]"
              />
              {label}
            </label>
          ))}
        </div>
        <p className="mt-1 text-[13px] text-ink-3">
          {outcome === "reversed" ? "Lifts the restriction and notifies the creator." : "Keeps the restriction and notifies the creator."} Either way the case closes.
        </p>
      </fieldset>
      <Field id={`${uid}-reasons`} label="Reasons — sent to the creator" hint="At least 10 characters." error={errors.reasons}>
        <textarea
          id={`${uid}-reasons`}
          value={reasons}
          onChange={(e) => setReasons(e.target.value)}
          required
          minLength={10}
          maxLength={10000}
          className={textareaClass}
          {...describedBy(`${uid}-reasons`, true, errors.reasons)}
        />
      </Field>
      {confirming ? (
        <div role="alert" className="rounded-lg border-2 border-warn/50 bg-warn-soft p-3 text-[14px]">
          <p className="font-bold">{outcome === "reversed" ? "Reverse the decision and close the case?" : "Uphold the decision and close the case?"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? "Recording…" : "Confirm"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="sm" disabled={busy || !reasonsOk}>
            Review outcome
          </Button>
          {!reasonsOk ? <span className="text-[13px] text-ink-3">Write the reasons (10 characters or more) to continue.</span> : null}
        </div>
      )}
      {result ? <FormMessage tone={result.tone}>{result.text}</FormMessage> : null}
    </form>
  );
}
