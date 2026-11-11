"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, inputClass, textareaClass } from "@/components/ui/form";
import { callApi } from "@/lib/client-api";
import { cn } from "@/lib/cn";
import type { AssetDeliveryMatch, AssetLookupResult, AssetReportRow } from "@/lib/contract";
import { formatBytes, formatDateTime, shortHash } from "@/lib/format";
import { licenseMeta, metaFor } from "@/lib/status";

type Mode = "file" | "sha256" | "record";

/** Hashing happens in the browser, which holds the whole file to do it; past this, ask for the hash. */
const MAX_LOCAL_HASH = 512 * 1024 * 1024;

async function sha256Hex(file: File): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

const MATCHED_BY: Record<AssetDeliveryMatch["matchedBy"], string> = {
  copy_sha256: "the whole copy",
  container_sha256: "a package inside it",
  marker: "its fingerprint record",
};

/**
 * Finds which delivered copy a file came from: by its SHA-256 (hashed here, the file never leaves the
 * browser) or by the fingerprint record found in it (`scriptgo assets fingerprint <file>` prints it).
 * Staff see the account behind a copy; a creator sees the licence only. `resolveReport` adds a
 * "this is the copy" button that ties a report to one result.
 */
export function AssetLookup({ staff, resolveReport }: { staff: boolean; resolveReport?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("file");
  const [hash, setHash] = useState("");
  const [record, setRecord] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssetLookupResult | null>(null);
  const [resolved, setResolved] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    let body: { sha256: string } | { record: Record<string, unknown> };
    if (mode === "record") {
      let parsed: unknown;
      try {
        parsed = JSON.parse(record);
      } catch {
        return setError("Paste the fingerprint record as JSON: the .scriptgo/fingerprint.json found in the copy.");
      }
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return setError("The record is a JSON object.");
      body = { record: parsed as Record<string, unknown> };
    } else if (mode === "sha256") {
      const h = hash.trim().toLowerCase();
      if (!/^[0-9a-f]{64}$/.test(h)) return setError("A SHA-256 is 64 hexadecimal characters.");
      body = { sha256: h };
    } else {
      if (!file) return setError("Choose the file you found.");
      if (file.size > MAX_LOCAL_HASH) return setError(`This file is ${formatBytes(file.size)}: too large to hash in a browser. Paste its SHA-256 instead (sha256sum, or certutil -hashfile <file> SHA256).`);
      setBusy("Hashing the file here…");
      try {
        body = { sha256: await sha256Hex(file) };
      } catch {
        setBusy(null);
        return setError("The browser could not read this file. Paste its SHA-256 instead.");
      }
      setHash((body as { sha256: string }).sha256);
    }
    setBusy("Looking up…");
    const res = await callApi<AssetLookupResult>("POST", staff ? "/v1/admin/assets/lookup" : "/v1/creator/assets/lookup", body);
    setBusy(null);
    if (!res.ok) return setError(res.message);
    setResult(res.data);
  }

  async function resolve(deliveryId: string) {
    if (!resolveReport) return;
    setBusy("Saving…");
    const res = await callApi<AssetReportRow>("POST", `/v1/admin/assets/reports/${encodeURIComponent(resolveReport)}/resolve`, { deliveryId });
    setBusy(null);
    if (!res.ok) return setError(res.message);
    setResolved(deliveryId);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-5">
      <form onSubmit={submit} className="panel grid grid-cols-1 gap-4 p-4">
        <fieldset>
          <legend className="text-[14.5px] font-bold">Look up by</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                ["file", "The file"],
                ["sha256", "Its SHA-256"],
                ["record", "Its fingerprint record"],
              ] as const
            ).map(([v, label]) => (
              <label key={v} className="inline-flex items-center gap-2 rounded-full border-2 border-line-soft bg-surface px-3 py-1.5 text-[14px] has-[:checked]:border-line has-[:checked]:bg-sun-soft">
                <input type="radio" name="lookup-mode" value={v} checked={mode === v} onChange={() => setMode(v)} className="h-4 w-4 accent-[var(--cobalt)]" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        {mode === "file" ? (
          <Field id="lookup-file" label="File" hint="A copy, or a package from inside one. It is hashed in this browser and never uploaded.">
            <input id="lookup-file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className={cn(inputClass, "py-2")} aria-describedby="lookup-file-hint" />
          </Field>
        ) : mode === "sha256" ? (
          <Field id="lookup-hash" label="SHA-256" hint="Of the whole copy, or of a package (.zip) inside it.">
            <input id="lookup-hash" value={hash} onChange={(e) => setHash(e.target.value)} spellCheck={false} className={cn(inputClass, "font-mono text-[13px]")} aria-describedby="lookup-hash-hint" />
          </Field>
        ) : (
          <Field
            id="lookup-record"
            label="Fingerprint record"
            hint={
              <>
                The <span className="font-mono">.scriptgo/fingerprint.json</span> in the copy. <span className="font-mono">scriptgo assets fingerprint &lt;file&gt;</span>{" "}
                prints it. It still names the licence after the files were re-packed, as long as the record was kept.
              </>
            }
          >
            <textarea
              id="lookup-record"
              value={record}
              onChange={(e) => setRecord(e.target.value)}
              rows={5}
              spellCheck={false}
              className={`${textareaClass} font-mono text-[12.5px]`}
              aria-describedby="lookup-record-hint"
            />
          </Field>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={Boolean(busy)}>
            <Search aria-hidden="true" size={16} /> {busy ?? "Look up"}
          </Button>
          {error ? <FormMessage tone="error">{error}</FormMessage> : null}
        </div>
        {staff ? <p className="text-[12.5px] text-ink-3">Every lookup is written to the audit log.</p> : null}
      </form>

      {result ? (
        <div className="space-y-3" role="status" aria-live="polite" data-lookup-matches={result.matches.length}>
          {result.by === "sha256" && hash ? (
            <p className="break-all font-mono text-[12.5px] text-ink-3">sha256 {hash}</p>
          ) : null}
          {result.record ? (
            <div className="panel p-4 text-[14px]" data-record-valid={result.record.signatureValid && result.record.signerKnown && result.record.markerValid ? "yes" : "no"}>
              <p className="font-bold">
                {result.record.signatureValid && result.record.signerKnown && result.record.markerValid
                  ? "The record is genuine: signed by SCRIPT//GO, with its own marker."
                  : "The record does not check out."}
              </p>
              <ul className="mt-1 space-y-0.5 text-[13.5px] text-ink-2">
                <li>Signature: {result.record.signatureValid ? "valid" : "invalid"}{result.record.signatureValid ? (result.record.signerKnown ? ", by a SCRIPT//GO key" : ", by a key SCRIPT//GO does not know") : ""}</li>
                <li>Marker: {result.record.markerValid ? "issued by SCRIPT//GO" : "not one SCRIPT//GO issued"}</li>
                {result.record.package ? (
                  <li>
                    Names <span className="font-mono">{result.record.package}@{result.record.version}</span>
                    {result.record.container ? <> · {result.record.container}</> : null}
                  </li>
                ) : null}
                {result.record.reason ? <li>{result.record.reason}</li> : null}
              </ul>
            </div>
          ) : null}
          {result.matches.length === 0 ? (
            <div className="panel p-4 text-[14px]">
              <p className="font-bold">No copy matches.</p>
              <p className="mt-1 text-[13.5px] text-ink-2">
                {result.by === "sha256"
                  ? "A copy that was unzipped and re-packed has a new hash. Look for its fingerprint record instead."
                  : staff
                    ? "No delivery carries this record."
                    : "No delivery of your packages carries this record."}
              </p>
            </div>
          ) : (
            result.matches.map((m) => (
              <div key={m.deliveryId} className="panel p-4" data-delivery={m.deliveryId}>
                <p className="font-bold">
                  <span className="font-mono">
                    {m.package}@{m.version}
                  </span>{" "}
                  <span className="font-normal text-ink-2">· matched by {MATCHED_BY[m.matchedBy]}</span>
                </p>
                <dl className="mt-2 grid grid-cols-1 gap-y-1.5 text-[14px] sm:grid-cols-[10rem_minmax(0,1fr)]">
                  {m.container ? (
                    <>
                      <dt className="text-ink-3">Package</dt>
                      <dd className="break-all font-mono text-[13px]">{m.container}</dd>
                    </>
                  ) : null}
                  <dt className="text-ink-3">Fingerprinted to</dt>
                  <dd>
                    {m.license ? (
                      <span className="inline-flex flex-wrap items-center gap-2">
                        <span className="break-all font-mono text-[13px]" data-match-license>
                          {staff ? (
                            <Link href={`/admin/audit?subject=${encodeURIComponent(m.license.id)}`} className="text-cobalt-ink underline">
                              {m.license.id}
                            </Link>
                          ) : (
                            m.license.id
                          )}
                        </span>
                        <StatusBadge meta={metaFor(licenseMeta, m.license.status)} size="sm" />
                      </span>
                    ) : m.accountCopy ? (
                      "An account copy (the creator's or staff's own), not a licence."
                    ) : (
                      "—"
                    )}
                  </dd>
                  {m.account ? (
                    <>
                      <dt className="text-ink-3">Account</dt>
                      <dd data-match-account>
                        {m.account.name} <span className="text-ink-2">&lt;{m.account.email}&gt;</span>
                      </dd>
                    </>
                  ) : null}
                  {m.deployment ? (
                    <>
                      <dt className="text-ink-3">Deployment</dt>
                      <dd>
                        <span className="font-mono text-[13px]">{m.deployment.name}</span>{" "}
                        <span className="text-ink-2">
                          ({m.deployment.environment}, {m.deployment.status})
                        </span>
                      </dd>
                    </>
                  ) : null}
                  <dt className="text-ink-3">Copy</dt>
                  <dd className="tabular">
                    {formatBytes(m.size)} · {shortHash(m.sha256, 16)} · {m.downloadCount} {m.downloadCount === 1 ? "download" : "downloads"}
                  </dd>
                  <dt className="text-ink-3">Built</dt>
                  <dd className="tabular">
                    {formatDateTime(m.createdAt)}
                    {m.lastDownloadedAt ? <> · last downloaded {formatDateTime(m.lastDownloadedAt)}</> : null}
                  </dd>
                </dl>
                {resolveReport ? (
                  <div className="mt-3">
                    {resolved === m.deliveryId ? (
                      <FormMessage tone="success">The report now points at this copy.</FormMessage>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => resolve(m.deliveryId)} disabled={Boolean(busy)}>
                        This is the copy
                      </Button>
                    )}
                  </div>
                ) : null}
              </div>
            ))
          )}
          <p className="text-[13px] text-ink-2">
            A match says which copy a file came from. It is evidence for a report, not a verdict: an account can be compromised, and a copy
            passed on.
          </p>
        </div>
      ) : null}
    </div>
  );
}
