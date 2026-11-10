"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, inputClass, textareaClass } from "@/components/ui/form";
import { callApi } from "@/lib/client-api";
import type { MarkerLookupResult } from "@/lib/contract";
import { formatDateTime } from "@/lib/format";
import { formatFingerprint } from "@/lib/protection";

/**
 * Staff tool: resolve a watermark found in a copy. The API audits every lookup with the reason
 * typed here. A marker says where a copy was delivered; it does not, by itself, say who leaked it.
 */
export function MarkerLookup() {
  const [marker, setMarker] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MarkerLookupResult | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (marker.trim().length < 8) return setError("Paste the marker: the token, the .scriptgo-escrow file, or an escrow.json.");
    if (reason.trim().length < 3) return setError("Say why you are looking this up. It is written to the audit log.");
    setBusy(true);
    setError(null);
    setResult(null);
    const res = await callApi<MarkerLookupResult>("POST", "/v1/admin/escrow/marker-lookup", { marker: marker.trim(), reason: reason.trim() });
    setBusy(false);
    if (!res.ok) return setError(res.message);
    setResult(res.data);
  }

  return (
    <div className="grid grid-cols-1 gap-5">
      <form onSubmit={submit} className="panel grid grid-cols-1 gap-4 p-4">
        <Field id="marker" label="Marker" hint="The token alone, the content of a .scriptgo-escrow file from a decrypted copy, or an escrow.json from a bundle.">
          <textarea
            id="marker"
            value={marker}
            onChange={(e) => setMarker(e.target.value)}
            rows={4}
            spellCheck={false}
            className={`${textareaClass} min-h-[96px] font-mono text-[13px]`}
            aria-describedby="marker-hint"
          />
        </Field>
        <Field id="marker-reason" label="Reason for the lookup" hint="For example the report or case it belongs to. Recorded with your account.">
          <input id="marker-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={2000} className={inputClass} aria-describedby="marker-reason-hint" />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={busy}>
            <Search aria-hidden="true" size={16} /> {busy ? "Looking up…" : "Resolve marker"}
          </Button>
          {error ? <FormMessage tone="error">{error}</FormMessage> : null}
        </div>
      </form>

      {result ? (
        <div className="panel p-4" role="status" aria-live="polite" data-marker-kind={result.kind}>
          {result.kind === "unknown" ? (
            <>
              <p className="font-bold">No record for this marker.</p>
              <p className="mt-1 text-[14px] text-ink-2">
                It is not a delivery marker this server issued, and no release carries it as a watermark. A copy that was never decrypted
                through a loader has no delivery marker.
              </p>
            </>
          ) : (
            <>
              <p className="font-bold">
                {result.kind === "delivery" ? "Delivery marker: one licence, one deployment." : "Release watermark: it names the release, not a customer."}
              </p>
              <dl className="mt-3 grid grid-cols-1 gap-y-1.5 text-[14px] sm:grid-cols-[11rem_minmax(0,1fr)]">
                <dt className="text-ink-3">Release</dt>
                <dd className="font-mono text-[13px]" data-marker-release>
                  {result.release ? `${result.release.package}@${result.release.version}` : "—"}
                </dd>
                {result.license ? (
                  <>
                    <dt className="text-ink-3">Licence</dt>
                    <dd>
                      <Link href={`/admin/audit?subject=${encodeURIComponent(result.license.id)}`} className="break-all font-mono text-[13px] text-cobalt-ink underline" data-marker-license>
                        {result.license.id}
                      </Link>{" "}
                      <span className="text-ink-2">({result.license.status})</span>
                    </dd>
                    <dt className="text-ink-3">Held by</dt>
                    <dd data-marker-holder>
                      {result.license.holderName} <span className="text-ink-2">&lt;{result.license.holderEmail}&gt;</span>
                    </dd>
                  </>
                ) : null}
                {result.deployment ? (
                  <>
                    <dt className="text-ink-3">Deployment</dt>
                    <dd data-marker-deployment>
                      <span className="font-mono text-[13px]">{result.deployment.name}</span>{" "}
                      <span className="text-ink-2">
                        ({result.deployment.environment}, {result.deployment.status}; server key {formatFingerprint(result.deployment.serverKeyFingerprint)})
                      </span>
                    </dd>
                  </>
                ) : null}
                {result.kind === "delivery" ? (
                  <>
                    <dt className="text-ink-3" title="Key releases still in the log. Old repeats are trimmed; the first and the last are kept.">Deliveries in the log</dt>
                    <dd className="tabular">
                      {result.deliveries.count}
                      {result.deliveries.firstAt ? <> · first {formatDateTime(result.deliveries.firstAt)}</> : null}
                      {result.deliveries.lastAt ? <> · last {formatDateTime(result.deliveries.lastAt)}</> : null}
                    </dd>
                  </>
                ) : null}
              </dl>
              {result.kind === "delivery" && result.deliveries.recent.length > 1 ? (
                <details className="mt-3">
                  <summary className="cursor-pointer text-[13px] font-semibold text-cobalt-ink">Latest delivery times (up to 20)</summary>
                  <ul className="tabular mt-1 space-y-0.5 text-[13px] text-ink-2">
                    {result.deliveries.recent.map((t, i) => (
                      <li key={`${t}-${i}`}>{formatDateTime(t)}</li>
                    ))}
                  </ul>
                </details>
              ) : null}
              <p className="mt-3 text-[13px] text-ink-2">
                This shows where the copy was delivered. It is evidence for a case, not a verdict: a server can be compromised, and a
                marker file can be removed from a copy. Decide in the report, and revoke the licence there if it applies.
              </p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
