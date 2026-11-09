"use client";

import { useRef, useState } from "react";
import { CircleCheck, Paperclip, X } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/cn";
import type { ReportReceipt } from "@/lib/contract";
import { formatBytes } from "@/lib/format";

const MAX_FILES = 10;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

type State =
  | { kind: "idle" }
  | { kind: "sending"; progress: number }
  | { kind: "error"; message: string; fields?: Record<string, string> }
  | { kind: "done"; receipt: ReportReceipt };

const input =
  "w-full rounded-[10px] border-2 border-line-soft bg-surface px-3 py-2.5 text-[15px] placeholder:text-ink-3 focus:border-line aria-[invalid=true]:border-bad";
const label = "block text-[14.5px] font-bold";
const hint = "mt-1 text-[13px] text-ink-3";

function Field({ id, title, hintText, error, children }: { id: string; title: string; hintText?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={label}>
        {title}
      </label>
      {hintText ? (
        <p id={`${id}-hint`} className={hint}>
          {hintText}
        </p>
      ) : null}
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-[13px] font-semibold text-bad">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Public IP / abuse report. No account required. Posts multipart to /v1/reports. */
export function ReportForm({ defaultPackage, defaultVersion }: { defaultPackage: string; defaultVersion: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [files, setFiles] = useState<File[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const fieldErrors = state.kind === "error" ? (state.fields ?? {}) : {};

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (next.length >= MAX_FILES) break;
      if (f.size > MAX_FILE_BYTES) continue;
      next.push(f);
    }
    setFiles(next);
    if (fileInput.current) fileInput.current.value = "";
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.delete("evidence");
    for (const f of files) fd.append("evidence", f, f.name);
    fd.set("goodFaith", fd.get("goodFaith") ? "true" : "false");
    fd.set("accuracy", fd.get("accuracy") ? "true" : "false");

    const local: Record<string, string> = {};
    if (String(fd.get("description") ?? "").trim().length < 20) local.description = "Describe the issue in at least 20 characters.";
    if (!String(fd.get("packageIdentifier") ?? "").trim() && !String(fd.get("url") ?? "").trim())
      local.packageIdentifier = "Give the package identifier or a URL.";
    if (fd.get("goodFaith") !== "true") local.goodFaith = "This statement is required.";
    if (fd.get("accuracy") !== "true") local.accuracy = "This statement is required.";
    if (Object.keys(local).length) {
      setState({ kind: "error", message: "Some fields need attention.", fields: local });
      return;
    }

    setState({ kind: "sending", progress: 0 });
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/v1/reports");
    xhr.setRequestHeader("accept", "application/json");
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setState({ kind: "sending", progress: Math.round((ev.loaded / ev.total) * 100) });
    };
    xhr.onerror = () => setState({ kind: "error", message: "The SCRIPT//GO API is not reachable. Your report was not sent; try again." });
    xhr.onload = () => {
      let body: unknown = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        body = null;
      }
      if (xhr.status >= 200 && xhr.status < 300 && body && typeof body === "object" && "caseId" in body) {
        setState({ kind: "done", receipt: body as ReportReceipt });
        window.scrollTo({ top: 0 });
        return;
      }
      const err = (body as { error?: { message?: string; details?: Record<string, unknown> } } | null)?.error;
      const fields: Record<string, string> = {};
      const issues = err?.details?.fields ?? err?.details;
      if (issues && typeof issues === "object") {
        for (const [k, v] of Object.entries(issues as Record<string, unknown>)) {
          if (typeof v === "string") fields[k] = v;
          else if (Array.isArray(v) && typeof v[0] === "string") fields[k] = v[0];
        }
      }
      setState({ kind: "error", message: err?.message ?? `The report was not accepted (HTTP ${xhr.status}).`, fields });
    };
    xhr.send(fd);
  }

  if (state.kind === "done") {
    return (
      <div className="sticker space-y-5 p-6" role="status">
        <div className="flex items-center gap-3">
          <CircleCheck aria-hidden="true" className="text-ok" size={28} />
          <h2 className="font-display text-[26px] font-extrabold">Report received.</h2>
        </div>
        <div>
          <p className="text-[14px] text-ink-3">Your case number</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="tabular rounded-lg border-2 border-line bg-sun px-3 py-1.5 font-mono text-[22px] font-bold text-on-sun">
              {state.receipt.caseId}
            </span>
            <CopyButton text={state.receipt.caseId} tone="light" />
          </div>
          <p className="mt-2 text-[13.5px] text-ink-2">Keep it. Quote it in any message about this report.</p>
        </div>
        <div>
          <h3 className="font-bold">What happens next</h3>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[14.5px] text-ink-2">
            <li>This case number is your acknowledgment. SCRIPT//GO does not send e-mail yet, so nothing arrives in your inbox.</li>
            <li>A moderator reviews your claim next to a snapshot of the listing as it was when you reported it.</li>
            <li>
              The decision (no action, restrict a release, restrict sales, or suspend the listing) is recorded with its reasons and
              shown to the creator in their dashboard. Until e-mail is live, quote your case number to ask about it.
            </li>
            <li>The creator may appeal once. A different reviewer decides the appeal.</li>
          </ol>
          <p className="mt-3 text-[13.5px] text-ink-3">
            Cases are reviewed in order of age and type. The creator will see the substance of your claim; your email address is not
            shown to them.
          </p>
        </div>
      </div>
    );
  }

  const sending = state.kind === "sending";
  const err = (k: string) => fieldErrors[k];
  const aria = (k: string, withHint = false) => ({
    "aria-invalid": err(k) ? true : undefined,
    "aria-describedby": [withHint ? `${k}-hint` : "", err(k) ? `${k}-error` : ""].filter(Boolean).join(" ") || undefined,
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      {state.kind === "error" ? (
        <div role="alert" className="rounded-[10px] border-2 border-bad/50 bg-bad-soft px-4 py-3 text-[14px] font-semibold text-bad">
          {state.message}
        </div>
      ) : null}

      <fieldset className="space-y-4">
        <legend className="font-display text-[21px] font-extrabold">1. What are you reporting?</legend>
        <div className="flex flex-wrap gap-3">
          {[
            ["ip", "Intellectual property infringement"],
            ["abuse", "Abuse or malicious code"],
          ].map(([v, t]) => (
            <label key={v} className="inline-flex items-center gap-2 rounded-[10px] border-2 border-line-soft bg-surface px-3 py-2 text-[14.5px] font-semibold has-[:checked]:border-line has-[:checked]:bg-cobalt-soft">
              <input type="radio" name="kind" value={v} defaultChecked={v === "ip"} className="h-4 w-4 accent-[var(--cobalt)]" />
              {t}
            </label>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
          <Field id="packageIdentifier" title="Package" hintText="Identifier, for example kestrel//inventory-pro." error={err("packageIdentifier")}>
            <input id="packageIdentifier" name="packageIdentifier" defaultValue={defaultPackage} maxLength={200} className={cn(input, "font-mono")} {...aria("packageIdentifier", true)} />
          </Field>
          <Field id="releaseVersion" title="Release (optional)" hintText="Leave empty for all.">
            <input id="releaseVersion" name="releaseVersion" defaultValue={defaultVersion} maxLength={64} className={cn(input, "font-mono")} aria-describedby="releaseVersion-hint" />
          </Field>
        </div>
        <Field id="url" title="Or a URL" hintText="If the content isn't a package listing." error={err("url")}>
          <input id="url" name="url" type="url" maxLength={1000} className={input} {...aria("url", true)} />
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-[21px] font-extrabold">2. Your claim</legend>
        <Field id="claimedWork" title="The work you claim rights over" hintText="Name it and say where the original can be found." error={err("claimedWork")}>
          <textarea id="claimedWork" name="claimedWork" rows={3} maxLength={5000} className={input} {...aria("claimedWork", true)} />
        </Field>
        <Field id="reporterRole" title="Your role" error={err("reporterRole")}>
          <select id="reporterRole" name="reporterRole" defaultValue="rights_holder" className={input} {...aria("reporterRole")}>
            <option value="rights_holder">I hold the rights</option>
            <option value="authorized_agent">I am an authorized agent of the rights holder</option>
            <option value="user">I am a user reporting abuse</option>
          </select>
        </Field>
        <Field id="description" title="Description" hintText="What is infringing or harmful, and where (files, lines, screenshots). At least 20 characters." error={err("description")}>
          <textarea id="description" name="description" rows={6} required minLength={20} maxLength={20000} className={input} {...aria("description", true)} />
        </Field>
        <div>
          <p className={label} id="evidence-label">
            Evidence (optional)
          </p>
          <p className={hint}>Up to {MAX_FILES} files, {formatBytes(MAX_FILE_BYTES)} each. Files over the limit are skipped.</p>
          <div className="mt-2 rounded-[10px] border-2 border-dashed border-line-soft bg-surface p-4">
            <input
              ref={fileInput}
              id="evidence"
              type="file"
              multiple
              onChange={(e) => addFiles(e.target.files)}
              aria-labelledby="evidence-label"
              className="block w-full text-[14px] file:mr-3 file:rounded-lg file:border-2 file:border-line file:bg-surface-2 file:px-3 file:py-1.5 file:font-bold"
            />
            {files.length ? (
              <ul className="mt-3 space-y-1.5 text-[13.5px]">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center gap-2">
                    <Paperclip aria-hidden="true" size={14} className="text-ink-3" />
                    <span className="min-w-0 flex-1 truncate">{f.name}</span>
                    <span className="tabular text-ink-3">{formatBytes(f.size)}</span>
                    <button
                      type="button"
                      onClick={() => setFiles(files.filter((_, j) => j !== i))}
                      className="rounded p-1 hover:bg-surface-2"
                      aria-label={`Remove ${f.name}`}
                    >
                      <X aria-hidden="true" size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-[21px] font-extrabold">3. Contact and statements</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="reporterName" title="Your name" error={err("reporterName")}>
            <input id="reporterName" name="reporterName" required maxLength={200} autoComplete="name" className={input} {...aria("reporterName")} />
          </Field>
          <Field id="reporterEmail" title="Email" error={err("reporterEmail")}>
            <input id="reporterEmail" name="reporterEmail" type="email" required maxLength={320} autoComplete="email" className={input} {...aria("reporterEmail")} />
          </Field>
        </div>
        {[
          ["goodFaith", "I believe in good faith that the use described is not authorized by the rights holder, its agent, or the law."],
          ["accuracy", "The information in this report is accurate, and I am the rights holder or authorized to act for them."],
        ].map(([k, t]) => (
          <div key={k}>
            <label className="flex items-start gap-3 text-[14.5px]">
              <input type="checkbox" name={k} value="true" className="mt-1 h-4 w-4 shrink-0 accent-[var(--cobalt)]" {...aria(k!)} />
              <span>{t}</span>
            </label>
            {err(k!) ? (
              <p id={`${k}-error`} className="ml-7 mt-1 text-[13px] font-semibold text-bad">
                {err(k!)}
              </p>
            ) : null}
          </div>
        ))}
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={sending} className={buttonClass("primary", "lg")}>
          {sending ? "Sending…" : "Send report"}
        </button>
        {sending ? (
          <div className="flex items-center gap-2 text-[13.5px]" role="status">
            <progress value={state.progress} max={100} className="h-2 w-40 accent-[var(--cobalt)]" aria-label="Upload progress" />
            <span className="tabular">{state.progress}%</span>
          </div>
        ) : (
          <p className="text-[13px] text-ink-3">No account needed. You get a case number right away.</p>
        )}
      </div>
    </form>
  );
}
