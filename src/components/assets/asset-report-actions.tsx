"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, selectClass, textareaClass } from "@/components/ui/form";
import { callApi } from "@/lib/client-api";
import type { AssetReportAction, AssetReportRow } from "@/lib/contract";

export const ASSET_ACTIONS: Record<AssetReportAction, { label: string; effect: string; needsCopy: boolean; danger: boolean }> = {
  revoke_license: {
    label: "Revoke the licence",
    effect: "The licence behind the copy is revoked: no more downloads, and its servers stop verifying. Recorded with your reasons.",
    needsCopy: true,
    danger: true,
  },
  deactivate_deployment: {
    label: "Stop the deployment",
    effect: "Only the server the copy was built for stops verifying. The licence stays.",
    needsCopy: true,
    danger: true,
  },
  restrict_release: {
    label: "Hold the release",
    effect: "The release stays visible with a notice and can't be downloaded. The case is decided: the seller gets your reasons and can appeal.",
    needsCopy: false,
    danger: true,
  },
  takedown_notice: {
    label: "Record a takedown notice",
    effect: "Records that a notice was sent to the host where the copy was found. Nothing changes on SCRIPT//GO.",
    needsCopy: false,
    danger: false,
  },
  reject: {
    label: "Reject the report",
    effect: "Closes the report with no action. Its case is closed the same way.",
    needsCopy: false,
    danger: false,
  },
};

/** Staff decision on one asset report. Reasons are sent to whoever the action reaches, and kept. */
export function AssetReportActions({ report }: { report: Pick<AssetReportRow, "id" | "status" | "resolved"> }) {
  const router = useRouter();
  const options = (Object.keys(ASSET_ACTIONS) as AssetReportAction[]).filter((a) => {
    if (!ASSET_ACTIONS[a].needsCopy) return true;
    if (!report.resolved) return false;
    return a === "revoke_license" ? Boolean(report.resolved.license) : Boolean(report.resolved.deployment);
  });
  const [action, setAction] = useState<AssetReportAction>(options[0] ?? "takedown_notice");
  const [reasons, setReasons] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  if (report.status === "rejected") return <p className="text-[14px] text-ink-2">This report was rejected. A new report reopens the matter.</p>;

  async function send() {
    setBusy(true);
    setResult(null);
    const res = await callApi<AssetReportRow>("POST", `/v1/admin/assets/reports/${encodeURIComponent(report.id)}/action`, { action, reasons: reasons.trim() });
    setBusy(false);
    setConfirming(false);
    if (!res.ok) return setResult({ tone: "error", text: `${res.message} (${res.code})` });
    setResult({ tone: "success", text: `Done: ${ASSET_ACTIONS[action].label.toLowerCase()}.` });
    setReasons("");
    router.refresh();
  }

  const meta = ASSET_ACTIONS[action];
  const ready = reasons.trim().length >= 10;
  return (
    <div className="panel grid grid-cols-1 gap-4 p-4">
      {!report.resolved ? (
        <p className="text-[13.5px] text-ink-2">Revoking a licence or stopping a deployment needs the copy: look it up below, then choose &ldquo;This is the copy&rdquo;.</p>
      ) : null}
      <Field id="asset-action" label="Action">
        <select
          id="asset-action"
          value={action}
          onChange={(e) => {
            setAction(e.target.value as AssetReportAction);
            setConfirming(false);
          }}
          className={selectClass}
          aria-describedby="asset-action-effect"
        >
          {options.map((a) => (
            <option key={a} value={a}>
              {ASSET_ACTIONS[a].label}
            </option>
          ))}
        </select>
      </Field>
      <p id="asset-action-effect" className="-mt-2 text-[13.5px] text-ink-2">
        {meta.effect}
      </p>
      <Field id="asset-reasons" label="Reasons" hint="At least 10 characters. Kept with the report; a held release sends them to the seller.">
        <textarea id="asset-reasons" value={reasons} onChange={(e) => setReasons(e.target.value)} maxLength={10_000} className={`${textareaClass} min-h-[84px]`} aria-describedby="asset-reasons-hint" />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        {confirming ? (
          <>
            <Button variant={meta.danger ? "danger" : "primary"} onClick={send} disabled={busy}>
              {busy ? "Saving…" : `Confirm: ${meta.label.toLowerCase()}`}
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={busy}>
              Cancel
            </Button>
          </>
        ) : (
          <Button variant={meta.danger ? "danger" : "secondary"} onClick={() => setConfirming(true)} disabled={!ready}>
            {meta.label}…
          </Button>
        )}
        {result ? <FormMessage tone={result.tone}>{result.text}</FormMessage> : null}
      </div>
    </div>
  );
}
