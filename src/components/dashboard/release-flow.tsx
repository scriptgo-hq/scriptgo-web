"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileArchive, Plus, Rocket, Trash2, Upload } from "lucide-react";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, inputClass, textareaClass } from "@/components/ui/form";
import { callApi } from "@/lib/client-api";
import { cn } from "@/lib/cn";
import type { CheckStage, Release, ReleaseCheck, ThirdPartyAsset } from "@/lib/contract";
import { envName } from "@/lib/env";
import { formatBytes, formatDateTime, formatDuration, shortHash } from "@/lib/format";
import { formatFingerprint, tierMeta } from "@/lib/protection";
import { checkMeta, metaFor, releaseMeta } from "@/lib/status";

const MAX_BYTES = 20 * 1024 * 1024;

// ------------------------------------------------------------------ upload

export function UploadRelease({ packageName, identifier }: { packageName: string; identifier: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [protect, setProtect] = useState(false);
  const [allowlist, setAllowlist] = useState("");

  function pick(f: File | null | undefined) {
    setError(null);
    if (!f) return;
    if (!/\.zip$/i.test(f.name)) return setError("Choose a .zip archive of your resource folder.");
    if (f.size > MAX_BYTES) return setError(`This archive is ${formatBytes(f.size)}. The limit is ${formatBytes(MAX_BYTES)}.`);
    setFile(f);
  }

  function upload() {
    if (!file) return;
    const fd = new FormData();
    // Text fields first: the API reads the form in order and needs them with the archive.
    if (protect) {
      fd.append("escrow", "true");
      if (allowlist.trim()) fd.append("allowlist", allowlist);
    }
    fd.append("archive", file, file.name);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/v1/creator/packages/${encodeURIComponent(packageName)}/releases`);
    xhr.setRequestHeader("accept", "application/json");
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onerror = () => {
      setProgress(null);
      setError("The SCRIPT//GO API is not reachable. Nothing was uploaded; try again.");
    };
    xhr.onload = () => {
      let body: unknown = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        body = null;
      }
      if (xhr.status >= 200 && xhr.status < 300 && body && typeof body === "object" && "id" in body) {
        router.push(`/dashboard/packages/${encodeURIComponent(packageName)}/releases/${encodeURIComponent((body as Release).id)}`);
        return;
      }
      setProgress(null);
      const err = (body as { error?: { message?: string } } | null)?.error;
      setError(err?.message ?? `The upload was not accepted (HTTP ${xhr.status}).`);
    };
    setProgress(0);
    xhr.send(fd);
  }

  const busy = progress !== null;
  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          pick(e.dataTransfer.files[0]);
        }}
        className={cn(
          "flex flex-col items-center gap-3 rounded-[12px] border-[2.5px] border-dashed px-5 py-10 text-center transition-colors",
          drag ? "border-cobalt bg-cobalt/5" : "border-line-soft bg-surface",
        )}
      >
        <FileArchive aria-hidden="true" size={34} strokeWidth={1.75} className="text-cobalt-ink" />
        <p className="font-bold">{file ? file.name : "Drop the resource zip here"}</p>
        <p className="tabular text-[13.5px] text-ink-3">
          {file ? formatBytes(file.size) : <>The zip holds the folder with its <span className="font-mono">scriptgo.lua</span> manifest. Up to {formatBytes(MAX_BYTES)}.</>}
        </p>
        <input ref={input} id="archive" type="file" accept=".zip,application/zip" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        <Button variant="secondary" size="sm" onClick={() => input.current?.click()} disabled={busy}>
          {file ? "Choose another file" : "Choose a file"}
        </Button>
      </div>
      <fieldset className="rounded-[12px] border-2 border-line-soft bg-surface p-4" disabled={busy}>
        <legend className="sr-only">Protection</legend>
        <label className="flex items-start gap-3 text-[15px]">
          <input
            id="protect-release"
            type="checkbox"
            checked={protect}
            onChange={(e) => setProtect(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--cobalt)]"
            aria-describedby="protect-hint"
          />
          <span>
            <strong>Protect this release (escrow)</strong>
            <span id="protect-hint" className="mt-0.5 block text-[13.5px] text-ink-2">
              SCRIPT//GO encrypts your scripts before they are stored. Buyers download the encrypted bundle, and a server gets the key only
              while it is licensed and bound. The archive you upload is checked in memory and is not kept.
            </span>
          </span>
        </label>
        {protect ? (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-line-soft pt-4">
            <Field
              id="allowlist"
              label="Files left readable"
              hint="One pattern per line. The manifest, README, CHANGELOG and LICENSE are always readable. Add what an operator must be able to read or edit, for example config.lua or locales/*.json. Everything else is encrypted."
            >
              <textarea
                id="allowlist"
                value={allowlist}
                onChange={(e) => setAllowlist(e.target.value)}
                rows={3}
                spellCheck={false}
                placeholder={"config.lua\nlocales/*.json"}
                className={`${textareaClass} min-h-[84px] font-mono text-[13px]`}
                aria-describedby="allowlist-hint"
              />
            </Field>
            <ul className="list-disc space-y-1 pl-5 text-[13.5px] text-ink-2">
              <li>The key is created here, sealed on the master, and never shown, to you or to anyone.</li>
              <li>The bundle is signed with a key SCRIPT//GO holds for your account; its fingerprint is on the release page.</li>
              <li>
                This is deterrence and traceability, not DRM. A licensed operator can still read what their own host decrypts.{" "}
                <a href="/protect" className="font-semibold text-cobalt-ink underline">
                  What it does and does not do
                </a>
              </li>
            </ul>
          </div>
        ) : null}
      </fieldset>
      {busy ? (
        <div>
          <div
            role="progressbar"
            aria-label="Upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-3 overflow-hidden rounded-full border-2 border-line bg-surface"
          >
            <div className="h-full bg-cobalt transition-[width]" style={{ width: `${progress}%` }} />
          </div>
          <p className="tabular mt-1 text-[13px] text-ink-2" aria-live="polite">
            {progress! < 100 ? `Uploading… ${progress}%` : "Uploaded. Running the checks…"}
          </p>
        </div>
      ) : null}
      {error ? <FormMessage tone="error">{error}</FormMessage> : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={upload} disabled={!file || busy} aria-describedby={!file ? "upload-reason" : undefined}>
          <Upload aria-hidden="true" size={16} /> {protect ? "Upload and protect" : `Upload to ${identifier}`}
        </Button>
        {!file ? (
          <span id="upload-reason" className="text-[13px] text-ink-3">
            Choose a zip first.
          </span>
        ) : null}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ release view

const STAGES: { id: CheckStage; label: string }[] = [
  { id: "archive", label: "Archive" },
  { id: "manifest", label: "Manifest" },
  { id: "integrity", label: "Integrity" },
  { id: "static", label: "Static checks" },
  { id: "unit", label: "Unit tests" },
  { id: "environment", label: "Environments" },
  { id: "rights", label: "Rights" },
];

const DONE = new Set(["published", "deprecated", "yanked"]);

/** Required checks still queued or running. Advisory checks (environment runs) can stay pending for good. */
function stillRunning(r: Release): boolean {
  if (DONE.has(r.status)) return false;
  return r.checks.some((c) => c.required && c.stage !== "rights" && (c.status === "pending" || c.status === "running"));
}

function CheckRow({ c }: { c: ReleaseCheck }) {
  return (
    <li className="border-t border-line-soft px-4 py-3 first:border-t-0">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge meta={metaFor(checkMeta, c.status)} size="sm" />
        <span className="font-semibold">{c.name}</span>
        {c.required ? <Tag>required</Tag> : <Tag>advisory</Tag>}
        {c.durationMs !== null ? <span className="tabular ml-auto text-[12.5px] text-ink-3">{formatDuration(c.durationMs)}</span> : null}
      </div>
      {c.message ? <p className="mt-1 text-[14px] text-ink-2">{c.message}</p> : null}
      {c.log ? (
        <details className="mt-2">
          <summary className="cursor-pointer text-[13px] font-semibold text-cobalt-ink">Log</summary>
          <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-code-bg p-3 font-mono text-[12.5px] leading-relaxed text-code-fg">{c.log}</pre>
        </details>
      ) : null}
    </li>
  );
}

/**
 * What is protected in this release and what is not. Everything shown is public metadata of the
 * bundle; the content key is never fetched by this page, only whether the master holds it sealed.
 */
function ProtectionSection({ release: r, creator }: { release: Release; creator: string | null }) {
  const e = r.escrow;
  const published = DONE.has(r.status);
  if (!e) {
    return (
      <section aria-labelledby="prot-title">
        <h2 id="prot-title" className="font-display text-[24px] font-extrabold tracking-[-0.02em]">
          Protection
        </h2>
        <div className="panel mt-4 p-4 text-[14.5px]" data-escrow-state="plain">
          <p>
            <strong>Not encrypted.</strong> People download the archive as you uploaded it. A paid offer still checks a licence per server,
            and the published release is signed, so a changed copy is detected.
          </p>
          <p className="mt-2 text-[13.5px] text-ink-2">
            Protection is chosen at upload and a release can&rsquo;t change afterwards. To protect this code, upload a higher version with
            &ldquo;Protect this release (escrow)&rdquo;, or run <span className="font-mono">scriptgo publish --escrow</span>.
          </p>
          {r.signature ? <p className="tabular mt-2 text-[13px] text-ink-3">Release signature: registry key {formatFingerprint(r.signature.keyId)}</p> : null}
        </div>
      </section>
    );
  }
  const plainHref =
    creator && published ? `/v1/packages/${encodeURIComponent(creator)}/${encodeURIComponent(r.packageName)}/versions/${encodeURIComponent(r.version)}/download?variant=plain` : null;
  return (
    <section aria-labelledby="prot-title">
      <h2 id="prot-title" className="font-display text-[24px] font-extrabold tracking-[-0.02em]">
        Protection
      </h2>
      <div className="panel mt-4 p-4" data-escrow-state="escrow">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge meta={tierMeta.escrow} />
          <span className="text-[14.5px] font-semibold">Encrypted bundle. Buyers never get the plain archive.</span>
        </div>
        <dl className="mt-3 grid grid-cols-1 gap-y-1.5 text-[14px] sm:grid-cols-[11rem_minmax(0,1fr)]">
          <dt className="text-ink-3">Cipher</dt>
          <dd className="font-mono text-[13px]">{e.cipher}</dd>
          <dt className="text-ink-3">Key wrapping</dt>
          <dd className="font-mono text-[13px]">{e.kdf}, per server</dd>
          <dt className="text-ink-3">Signed by</dt>
          <dd>
            <span className="font-mono text-[13px]" data-signer-fingerprint={e.signerKeyId}>
              {formatFingerprint(e.signerKeyId)}
            </span>{" "}
            <span className="text-ink-2">
              {e.signerOrigin === "master" ? "(the key SCRIPT//GO holds sealed for your account)" : e.signerOrigin === "creator" ? "(your own key, from the CLI)" : null}
            </span>
          </dd>
          <dt className="text-ink-3">Content key</dt>
          <dd data-sealed-key={e.sealedKeyPresent ? "yes" : "no"}>
            {e.sealedKeyPresent ? "Sealed on the master: yes." : "Sealed on the master: no. Servers cannot get a key for this release."}{" "}
            <span className="text-ink-2">It is never shown, here or anywhere. A server gets it wrapped to its own key.</span>
          </dd>
          <dt className="text-ink-3">Left readable</dt>
          <dd>
            <span className="flex flex-wrap gap-1">
              {e.clearFiles.map((f) => (
                <Tag key={f} mono>
                  {f}
                </Tag>
              ))}
            </span>
            <span className="mt-1 block text-[12.5px] text-ink-3">Allowlist: {e.allowlist.join(", ")}</span>
          </dd>
          <dt className="text-ink-3">Encrypted</dt>
          <dd>
            <details>
              <summary className="cursor-pointer">
                <span className="tabular">{e.encryptedFiles.length}</span> {e.encryptedFiles.length === 1 ? "file" : "files"}
              </summary>
              <ul className="mt-1 space-y-0.5 font-mono text-[12.5px] text-ink-2">
                {e.encryptedFiles.map((f) => (
                  <li key={f} className="break-all">
                    {f}
                  </li>
                ))}
              </ul>
            </details>
          </dd>
          <dt className="text-ink-3">Watermark</dt>
          <dd>{e.watermarked ? "In the signed manifest. Each delivery also gets its own marker. Traceability, not prevention." : "None in the manifest. Each delivery still gets its own marker."}</dd>
          <dt className="text-ink-3">Release signature</dt>
          <dd className="tabular">{r.signature ? `Registry key ${formatFingerprint(r.signature.keyId)}` : "Added when you publish."}</dd>
        </dl>
        <p className="mt-3 text-[13px] text-ink-2">
          A key goes out only to a licensed, bound server, for a paid offer or a licence granted by staff. This is deterrence and
          traceability: a licensed operator can still read what their own host decrypts.{" "}
          <a href="/protect" className="font-semibold text-cobalt-ink underline">
            How it works
          </a>
        </p>
        {plainHref ? (
          <p className="mt-2 text-[13px]">
            <a href={plainHref} className="font-semibold text-cobalt-ink underline">
              Download the plain archive
            </a>{" "}
            <span className="text-ink-3">(you only; the download is recorded)</span>
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function ReleaseView({ initial, creator = null }: { initial: Release; creator?: string | null }) {
  const router = useRouter();
  const [r, setR] = useState<Release>(initial);
  const [pollError, setPollError] = useState<string | null>(null);
  const [stalled, setStalled] = useState(false);
  const startedAt = useRef(Date.now());
  const running = stillRunning(r);

  const reload = useCallback(async () => {
    const res = await callApi<Release>("GET", `/v1/creator/releases/${encodeURIComponent(initial.id)}`);
    if (res.ok) {
      setR(res.data);
      setPollError(null);
    } else setPollError(res.message);
    return res.ok;
  }, [initial.id]);

  useEffect(() => {
    if (!running || stalled) return;
    const t = window.setInterval(() => {
      // Stop after 10 minutes: the validation worker may be down. A reload resumes.
      if (Date.now() - startedAt.current > 10 * 60_000) return setStalled(true);
      void reload();
    }, 2500);
    return () => window.clearInterval(t);
  }, [running, stalled, reload]);

  const rightsDeclared = Boolean(r.rights);
  const failedRequired = r.checks.filter((c) => c.required && c.status === "failed");
  const steps = [
    { label: "Upload", done: true },
    { label: "Checks", done: !running && failedRequired.filter((c) => c.stage !== "rights").length === 0 },
    { label: "Rights", done: rightsDeclared },
    { label: "Publish", done: DONE.has(r.status) },
  ];
  const m = r.manifest;

  return (
    <div className="grid grid-cols-1 gap-10">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Release steps">
        {steps.map((s, i) => (
          <li
            key={s.label}
            aria-current={!s.done && steps.slice(0, i).every((x) => x.done) ? "step" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-[10px] border-2 px-3 py-2 text-[14px] font-bold",
              s.done ? "border-line bg-sun-soft" : "border-line-soft bg-surface text-ink-2",
            )}
          >
            <span
              aria-hidden="true"
              className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-line text-[12px]", s.done ? "bg-sun text-on-sun" : "bg-surface")}
            >
              {s.done ? "✓" : i + 1}
            </span>
            {s.label}
            <span className="sr-only">{s.done ? " (done)" : " (to do)"}</span>
          </li>
        ))}
      </ol>

      <section aria-labelledby="summary-title" className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="panel p-4">
          <h2 id="summary-title" className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">
            Release
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[20px] font-bold">{r.version}</span>
            <StatusBadge meta={metaFor(releaseMeta, r.status)} />
          </div>
          <dl className="tabular mt-3 grid grid-cols-[8rem_minmax(0,1fr)] gap-y-1 text-[14px]">
            <dt className="text-ink-3">Uploaded</dt>
            <dd>{formatDateTime(r.createdAt)}</dd>
            {r.publishedAt ? (
              <>
                <dt className="text-ink-3">Published</dt>
                <dd>{formatDateTime(r.publishedAt)}</dd>
              </>
            ) : null}
            <dt className="text-ink-3">Archive</dt>
            <dd>{formatBytes(r.size)}</dd>
            <dt className="text-ink-3">SHA-256</dt>
            <dd className="break-all font-mono text-[12.5px]" title={r.sha256}>
              {shortHash(r.sha256, 24)}
            </dd>
          </dl>
        </div>
        <div className="panel p-4">
          <p className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">Manifest</p>
          {m ? (
            <dl className="mt-2 grid grid-cols-[8rem_minmax(0,1fr)] gap-y-1 text-[14px]">
              <dt className="text-ink-3">Resource</dt>
              <dd className="font-mono">
                {m.name} <span className="text-ink-3">({m.format === "open77" ? "open77.lua" : "scriptgo.lua"})</span>
              </dd>
              <dt className="text-ink-3">Environments</dt>
              <dd className="flex flex-wrap gap-1">{m.environments.length ? m.environments.map((e) => <Tag key={e}>{envName(e)}</Tag>) : "—"}</dd>
              <dt className="text-ink-3">Needs</dt>
              <dd className="font-mono text-[13px]">{m.capabilities.join(", ") || "—"}</dd>
              {m.optionalCapabilities.length ? (
                <>
                  <dt className="text-ink-3">Optional</dt>
                  <dd className="font-mono text-[13px]">{m.optionalCapabilities.join(", ")}</dd>
                </>
              ) : null}
              <dt className="text-ink-3">Lua</dt>
              <dd className="font-mono text-[13px]">{m.lua.join(", ") || "—"}</dd>
              <dt className="text-ink-3">Depends on</dt>
              <dd className="font-mono text-[13px]">
                {m.dependencies.length ? m.dependencies.map((d) => `${d.name}${d.range ? ` ${d.range}` : ""}`).join(", ") : "nothing"}
              </dd>
            </dl>
          ) : (
            <p className="mt-2 text-[14px] text-ink-2">No manifest could be read. See the manifest check below.</p>
          )}
        </div>
      </section>

      <section aria-labelledby="checks-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="checks-title" className="font-display text-[24px] font-extrabold tracking-[-0.02em]">
            Checks
          </h2>
          <p className="text-[13px] text-ink-3" aria-live="polite">
            {!running ? "Required checks finished." : stalled ? "Still queued after 10 minutes. Reload the page to check again." : "Running… this page updates by itself."}
            {pollError ? <span className="text-bad"> Last update failed: {pollError}</span> : null}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4">
          {STAGES.map((st) => {
            const list = r.checks.filter((c) => c.stage === st.id);
            if (list.length === 0) return null;
            return (
              <div key={st.id} className="panel overflow-hidden">
                <p className="border-b-2 border-line-soft bg-surface-2 px-4 py-2 font-mono text-[12px] font-bold uppercase tracking-wider text-ink-3">{st.label}</p>
                <ul>
                  {list.map((c, i) => (
                    <CheckRow key={`${c.name}-${i}`} c={c} />
                  ))}
                </ul>
              </div>
            );
          })}
          {r.checks.length === 0 ? <p className="text-[14px] text-ink-3">No checks reported yet.</p> : null}
        </div>
      </section>

      <ProtectionSection release={r} creator={creator} />

      <RightsSection release={r} onChange={setR} />

      <PublishSection release={r} running={running} onChange={(next) => {
          setR(next);
          router.refresh();
        }} />

      {r.files.length ? (
        <details className="panel p-4">
          <summary className="cursor-pointer font-bold">
            Files <span className="tabular font-normal text-ink-3">({r.files.length})</span>
          </summary>
          <div className="mt-3 relative overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[13px]">
              <caption className="sr-only">Files in this release</caption>
              <thead className="text-[11.5px] uppercase tracking-wide text-ink-3">
                <tr>
                  <th scope="col" className="py-1.5 pr-3">Path</th>
                  <th scope="col" className="py-1.5 pr-3 text-right">Size</th>
                  <th scope="col" className="py-1.5">SHA-256</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {r.files.map((f) => (
                  <tr key={f.path} className="border-t border-line-soft">
                    <td className="break-all py-1.5 pr-3">{f.path}</td>
                    <td className="tabular py-1.5 pr-3 text-right">{formatBytes(f.size)}</td>
                    <td className="py-1.5 text-ink-3">{shortHash(f.sha256, 12)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}
    </div>
  );
}

// ------------------------------------------------------------------ rights

function RightsSection({ release: r, onChange }: { release: Release; onChange: (r: Release) => void }) {
  const locked = DONE.has(r.status);
  const [editing, setEditing] = useState(!r.rights && !locked);
  const [ownsCode, setOwnsCode] = useState(r.rights?.ownsCode ?? false);
  const [targets, setTargets] = useState<"yes" | "no" | "">(r.rights ? (r.rights.targetsProprietaryGame ? "yes" : "no") : "");
  const [assets, setAssets] = useState<ThirdPartyAsset[]>(r.rights?.thirdPartyAssets ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!targets) return setError("Answer whether the resource targets a proprietary game.");
    const clean = assets.map((a) => ({ path: a.path.trim(), source: a.source.trim(), license: a.license.trim() }));
    if (clean.some((a) => !a.path || !a.source || !a.license)) return setError("Fill path, source and license for every third-party asset, or remove the empty rows.");
    setBusy(true);
    setError(null);
    const res = await callApi<Release>("POST", `/v1/creator/releases/${encodeURIComponent(r.id)}/rights`, {
      ownsCode,
      targetsProprietaryGame: targets === "yes",
      thirdPartyAssets: clean,
    });
    setBusy(false);
    if (!res.ok) return setError(res.message);
    onChange(res.data);
    setEditing(false);
  }

  return (
    <section aria-labelledby="rights-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="rights-title" className="font-display text-[24px] font-extrabold tracking-[-0.02em]">
          Rights declaration
        </h2>
        {r.rights && !editing && !locked ? (
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            Change
          </Button>
        ) : null}
      </div>
      {r.rights && !editing ? (
        <div className="panel mt-4 p-4 text-[14.5px]">
          <ul className="space-y-1.5">
            <li>{r.rights.ownsCode ? "You declared that you wrote this code or have the right to distribute it." : "You did not confirm ownership of the code: publishing stays blocked."}</li>
            <li>
              {r.rights.targetsProprietaryGame
                ? "It targets a proprietary third-party game: paid offers go to review before checkout."
                : "It does not target a proprietary third-party game."}
            </li>
            <li className="tabular">
              {r.rights.thirdPartyAssets.length} third-party {r.rights.thirdPartyAssets.length === 1 ? "asset" : "assets"} declared.
            </li>
            {r.rights.dependencies.length ? (
              <li>
                Dependencies:{" "}
                <span className="font-mono text-[13px]">{r.rights.dependencies.map((d) => `${d.name} (${d.license})`).join(", ")}</span>
              </li>
            ) : null}
          </ul>
          <p className="tabular mt-2 text-[12.5px] text-ink-3">Declared {formatDateTime(r.rights.declaredAt)}{locked ? " · locked because the release is published" : ""}</p>
        </div>
      ) : locked ? (
        <p className="mt-3 text-[14px] text-ink-3">No rights declaration was recorded for this release.</p>
      ) : (
        <form onSubmit={submit} className="sticker mt-4 grid grid-cols-1 gap-5 p-5">
          <label className="flex items-start gap-3 text-[15px]">
            <input type="checkbox" checked={ownsCode} onChange={(e) => setOwnsCode(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--cobalt)]" />
            <span>
              <strong>I wrote this code, or I have the right to distribute it under the license I chose.</strong>
              <span className="block text-[13.5px] text-ink-2">Required to publish. False declarations can lead to removal and account action.</span>
            </span>
          </label>
          <fieldset>
            <legend className="text-[15px] font-bold">Does it target a proprietary third-party game or its assets?</legend>
            <p className="text-[13.5px] text-ink-2">For example a script that only works inside a commercial game you don&rsquo;t own. Paid offers for such resources are reviewed.</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {(["no", "yes"] as const).map((v) => (
                <label key={v} className="inline-flex items-center gap-2 rounded-full border-2 border-line-soft bg-surface px-3 py-1.5 text-[14px] has-[:checked]:border-line has-[:checked]:bg-sun-soft">
                  <input type="radio" name="targets" value={v} checked={targets === v} onChange={() => setTargets(v)} className="h-4 w-4 accent-[var(--cobalt)]" />
                  {v === "no" ? "No, it is independent" : "Yes"}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-[15px] font-bold">Third-party assets</legend>
            <p className="text-[13.5px] text-ink-2">Fonts, images, sounds or code you didn&rsquo;t write. Leave empty if there are none.</p>
            <div className="mt-3 space-y-3">
              {assets.map((a, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-[10px] border-2 border-line-soft p-3 sm:grid-cols-[1fr_1.4fr_0.8fr_auto] sm:items-end">
                  <Field id={`as-path-${i}`} label="Path in the archive">
                    <input
                      id={`as-path-${i}`}
                      value={a.path}
                      onChange={(e) => setAssets((x) => x.map((y, j) => (j === i ? { ...y, path: e.target.value } : y)))}
                      className={`${inputClass} font-mono text-[13px]`}
                    />
                  </Field>
                  <Field id={`as-src-${i}`} label="Source (URL or author)">
                    <input
                      id={`as-src-${i}`}
                      value={a.source}
                      onChange={(e) => setAssets((x) => x.map((y, j) => (j === i ? { ...y, source: e.target.value } : y)))}
                      className={inputClass}
                    />
                  </Field>
                  <Field id={`as-lic-${i}`} label="License">
                    <input
                      id={`as-lic-${i}`}
                      value={a.license}
                      onChange={(e) => setAssets((x) => x.map((y, j) => (j === i ? { ...y, license: e.target.value } : y)))}
                      className={`${inputClass} font-mono text-[13px]`}
                    />
                  </Field>
                  <Button variant="ghost" size="sm" onClick={() => setAssets((x) => x.filter((_, j) => j !== i))}>
                    <Trash2 aria-hidden="true" size={15} />
                    <span className="sr-only">Remove asset {i + 1}</span>
                  </Button>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={() => setAssets((x) => [...x, { path: "", source: "", license: "" }])}>
                <Plus aria-hidden="true" size={15} /> Add an asset
              </Button>
            </div>
          </fieldset>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save declaration"}
            </Button>
            {r.rights ? (
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            ) : null}
            {error ? <FormMessage tone="error">{error}</FormMessage> : null}
          </div>
        </form>
      )}
    </section>
  );
}

// ------------------------------------------------------------------ publish and lifecycle

function PublishSection({ release: r, running, onChange }: { release: Release; running: boolean; onChange: (r: Release) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; blockers: string[] } | null>(null);
  const [lifecycle, setLifecycle] = useState<"deprecate" | "yank" | null>(null);
  const [reason, setReason] = useState("");

  async function publish() {
    setBusy(true);
    setError(null);
    const res = await callApi<Release>("POST", `/v1/creator/releases/${encodeURIComponent(r.id)}/publish`);
    setBusy(false);
    if (!res.ok) {
      const b = res.details?.blockers;
      return setError({ message: res.message, blockers: Array.isArray(b) ? b.map(String) : [] });
    }
    onChange(res.data);
  }

  async function changeLifecycle() {
    if (!lifecycle) return;
    if (reason.trim().length < 3) return setError({ message: "Give a short reason (3 characters or more). It is shown to users.", blockers: [] });
    setBusy(true);
    setError(null);
    const res = await callApi<Release>("POST", `/v1/creator/releases/${encodeURIComponent(r.id)}/${lifecycle}`, { reason: reason.trim() });
    setBusy(false);
    if (!res.ok) return setError({ message: res.message, blockers: [] });
    setLifecycle(null);
    setReason("");
    onChange(res.data);
  }

  if (DONE.has(r.status)) {
    return (
      <section aria-labelledby="pub-title">
        <h2 id="pub-title" className="font-display text-[24px] font-extrabold tracking-[-0.02em]">
          {r.status === "published" ? "Published." : r.status === "deprecated" ? "Deprecated." : "Yanked."}
        </h2>
        <p className="mt-2 max-w-prose text-[14.5px] text-ink-2">
          Published releases are immutable: to change code, upload a new version.{" "}
          {r.status === "published" ? "You can deprecate this release (still installable, users see a notice) or yank it (no longer installable)." : null}
          {r.status === "deprecated" ? "You can still yank it if it must not be installed anymore." : null}
        </p>
        {r.status !== "yanked" ? (
          <div className="mt-4 space-y-3">
            {lifecycle ? (
              <div className="panel grid grid-cols-1 gap-3 p-4">
                <Field id="lc-reason" label={lifecycle === "yank" ? "Why are you yanking it?" : "Why are you deprecating it?"} hint="Shown on the package page.">
                  <textarea id="lc-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={2000} className={`${textareaClass} min-h-[72px]`} aria-describedby="lc-reason-hint" />
                </Field>
                <div className="flex flex-wrap gap-2">
                  <Button variant={lifecycle === "yank" ? "danger" : "primary"} onClick={changeLifecycle} disabled={busy}>
                    {busy ? "Saving…" : lifecycle === "yank" ? "Yank release" : "Deprecate release"}
                  </Button>
                  <Button variant="ghost" onClick={() => setLifecycle(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {r.status === "published" ? (
                  <Button variant="secondary" onClick={() => setLifecycle("deprecate")}>
                    Deprecate…
                  </Button>
                ) : null}
                <Button variant="danger" onClick={() => setLifecycle("yank")}>
                  Yank…
                </Button>
              </div>
            )}
            {error ? <FormMessage tone="error">{error.message}</FormMessage> : null}
          </div>
        ) : null}
      </section>
    );
  }

  const reasons = r.blockers.length ? r.blockers : running ? ["Checks are still running."] : r.status !== "ready" ? [`Release status is “${metaFor(releaseMeta, r.status).label}”.`] : [];
  const blocked = reasons.length > 0 || running;

  return (
    <section aria-labelledby="pub-title" className="sticker p-5">
      <h2 id="pub-title" className="font-display text-[24px] font-extrabold tracking-[-0.02em]">
        Publish.
      </h2>
      <p className="mt-1 max-w-prose text-[14.5px] text-ink-2">
        Publishing makes {r.version} installable by everyone who can see the package. It can&rsquo;t be edited afterwards.
      </p>
      {blocked ? (
        <div className="mt-3" id="publish-blockers">
          <p className="text-[14px] font-bold">Publishing is blocked:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[14px] text-ink-2">
            {reasons.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={publish} disabled={busy || blocked} aria-describedby={blocked ? "publish-blockers" : undefined}>
          <Rocket aria-hidden="true" size={18} /> {busy ? "Publishing…" : `Publish ${r.version}`}
        </Button>
      </div>
      {error ? (
        <div className="mt-3">
          <FormMessage tone="error">{error.message}</FormMessage>
          {error.blockers.length ? (
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-[14px] text-ink-2">
              {error.blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
