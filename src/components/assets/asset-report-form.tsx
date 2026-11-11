"use client";

import Link from "next/link";
import { useState } from "react";
import { Flag, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, inputClass, selectClass, textareaClass } from "@/components/ui/form";
import { callApi } from "@/lib/client-api";
import { cn } from "@/lib/cn";
import type { AssetEvidence, AssetReportRow } from "@/lib/contract";

const KINDS: { id: AssetEvidence["kind"]; label: string; hint: string }[] = [
  { id: "sha256", label: "SHA-256 of the file", hint: "64 hexadecimal characters" },
  { id: "record", label: "Fingerprint record", hint: "The JSON of .scriptgo/fingerprint.json" },
  { id: "url", label: "Where it is", hint: "https://…" },
  { id: "note", label: "Note", hint: "Anything else staff should know" },
];

/**
 * Reports a leaked copy or an infringing asset. It opens a compliance case: staff look the copy up,
 * then act (revoke the licence, stop the deployment, hold the release), with notice and appeal.
 */
export function AssetReportForm({ initialPackage = "", initialVersion = "" }: { initialPackage?: string; initialVersion?: string }) {
  const [pkg, setPkg] = useState(initialPackage);
  const [version, setVersion] = useState(initialVersion);
  const [evidence, setEvidence] = useState<AssetEvidence[]>([{ kind: "sha256", value: "" }]);
  const [description, setDescription] = useState("");
  const [goodFaith, setGoodFaith] = useState(false);
  const [accuracy, setAccuracy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<AssetReportRow | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = evidence.map((x) => ({ kind: x.kind, value: x.value.trim() })).filter((x) => x.value);
    if (!/^[^/\s]+\/\/[^/\s@]+$/.test(pkg.trim())) return setError("Name the package as creator//name.");
    if (clean.length === 0) return setError("Give at least one piece of evidence.");
    const bad = clean.find((x) => x.kind === "sha256" && !/^[0-9a-f]{64}$/i.test(x.value));
    if (bad) return setError("A SHA-256 is 64 hexadecimal characters.");
    if (description.trim().length < 10) return setError("Say what you found, in a sentence or two.");
    if (!goodFaith || !accuracy) return setError("Both statements are required to send a report.");
    setBusy(true);
    setError(null);
    const res = await callApi<AssetReportRow>("POST", "/v1/assets/reports", {
      package: pkg.trim(),
      ...(version.trim() ? { version: version.trim() } : {}),
      evidence: clean,
      description: description.trim(),
      goodFaith: true,
      accuracy: true,
    });
    setBusy(false);
    if (!res.ok) return setError(res.message);
    setDone(res.data);
  }

  if (done) {
    return (
      <div className="panel p-4" role="status" data-asset-report={done.id}>
        <p className="font-bold">Report sent{done.caseId ? <> as case <span className="font-mono">{done.caseId}</span></> : null}.</p>
        <p className="mt-1 text-[14px] text-ink-2">
          {done.resolved ? "Your evidence matched one delivered copy; staff will review it." : "Staff will look the copy up and review it."} What happens is
          posted to your{" "}
          <Link href="/dashboard/notices" className="font-semibold text-cobalt-ink underline">
            notices
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="sticker grid grid-cols-1 gap-5 p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <Field id="ar-package" label="Package" hint="creator//name, as on its page.">
          <input id="ar-package" value={pkg} onChange={(e) => setPkg(e.target.value)} spellCheck={false} className={cn(inputClass, "font-mono text-[13.5px]")} aria-describedby="ar-package-hint" />
        </Field>
        <Field id="ar-version" label="Version" optional>
          <input id="ar-version" value={version} onChange={(e) => setVersion(e.target.value)} spellCheck={false} className={cn(inputClass, "font-mono text-[13.5px]")} />
        </Field>
      </div>
      <fieldset>
        <legend className="text-[15px] font-bold">Evidence</legend>
        <p className="text-[13.5px] text-ink-2">The file&rsquo;s hash or its fingerprint record lets staff find the copy. Never upload the file itself.</p>
        <div className="mt-3 space-y-3">
          {evidence.map((x, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 rounded-[10px] border-2 border-line-soft p-3 sm:grid-cols-[12rem_minmax(0,1fr)_auto] sm:items-start">
              <div>
                <label htmlFor={`ar-kind-${i}`} className="sr-only">
                  Kind of evidence {i + 1}
                </label>
                <select
                  id={`ar-kind-${i}`}
                  value={x.kind}
                  onChange={(e) => setEvidence((list) => list.map((y, j) => (j === i ? { ...y, kind: e.target.value as AssetEvidence["kind"] } : y)))}
                  className={selectClass}
                >
                  {KINDS.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`ar-value-${i}`} className="sr-only">
                  Evidence {i + 1}
                </label>
                {x.kind === "record" || x.kind === "note" ? (
                  <textarea
                    id={`ar-value-${i}`}
                    value={x.value}
                    onChange={(e) => setEvidence((list) => list.map((y, j) => (j === i ? { ...y, value: e.target.value } : y)))}
                    rows={3}
                    spellCheck={x.kind === "note"}
                    placeholder={KINDS.find((k) => k.id === x.kind)?.hint}
                    className={cn(textareaClass, "min-h-[84px]", x.kind === "record" && "font-mono text-[12.5px]")}
                  />
                ) : (
                  <input
                    id={`ar-value-${i}`}
                    value={x.value}
                    onChange={(e) => setEvidence((list) => list.map((y, j) => (j === i ? { ...y, value: e.target.value } : y)))}
                    spellCheck={false}
                    placeholder={KINDS.find((k) => k.id === x.kind)?.hint}
                    className={cn(inputClass, "font-mono text-[13px]")}
                  />
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEvidence((list) => list.filter((_, j) => j !== i))} disabled={evidence.length === 1}>
                <Trash2 aria-hidden="true" size={15} />
                <span className="sr-only">Remove evidence {i + 1}</span>
              </Button>
            </div>
          ))}
          {evidence.length < 20 ? (
            <Button variant="secondary" size="sm" onClick={() => setEvidence((list) => [...list, { kind: "url", value: "" }])}>
              <Plus aria-hidden="true" size={15} /> Add evidence
            </Button>
          ) : null}
        </div>
      </fieldset>
      <Field id="ar-description" label="What you found">
        <textarea id="ar-description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={10_000} className={textareaClass} />
      </Field>
      <div className="space-y-2 text-[14.5px]">
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={goodFaith} onChange={(e) => setGoodFaith(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--cobalt)]" />
          <span>I believe in good faith that the use described is not authorized by the rights holder, its agent, or the law.</span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={accuracy} onChange={(e) => setAccuracy(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--cobalt)]" />
          <span>The information in this report is accurate.</span>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy}>
          <Flag aria-hidden="true" size={16} /> {busy ? "Sending…" : "Send report"}
        </Button>
        {error ? <FormMessage tone="error">{error}</FormMessage> : null}
      </div>
    </form>
  );
}
