import { cn } from "@/lib/cn";

/** Shared form styling. Labels are always visible; hints and errors are wired with aria-describedby. */
export const inputClass =
  "mt-1 block w-full border-[2.5px] border-line bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-ink-3 focus:bg-sun-soft aria-[invalid=true]:border-bad";
export const selectClass = cn(inputClass, "h-[42px] py-0");
export const textareaClass = cn(inputClass, "min-h-[110px] leading-relaxed");

export function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: React.ReactNode;
  error?: string | null;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block font-display text-[14.5px] font-bold">
        {label}
        {optional ? <span className="ml-1 font-normal text-ink-3">(optional)</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-[13px] text-ink-3">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-[13px] font-semibold text-bad">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** aria-describedby/aria-invalid props for an input inside <Field>. */
export function describedBy(id: string, hint: boolean, error: string | null | undefined) {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ");
  return { "aria-describedby": ids || undefined, "aria-invalid": error ? true : undefined } as const;
}

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn("sheet border-[2.5px] px-3 py-2 text-[14px] font-semibold", tone === "error" ? "border-bad bg-bad-soft text-ink" : "border-ok bg-ok-soft text-ink")}
    >
      {children}
    </p>
  );
}

/** Field-level messages from an API 422 (`details.fields` or `details.issues`), keyed by field name. */
export function fieldErrors(details: Record<string, unknown> | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!details) return out;
  const fields = details.fields;
  if (fields && typeof fields === "object" && !Array.isArray(fields)) {
    for (const [k, v] of Object.entries(fields as Record<string, unknown>)) {
      if (typeof v === "string") out[k] = v;
      else if (Array.isArray(v) && typeof v[0] === "string") out[k] = v[0];
    }
  }
  const issues = details.issues;
  if (Array.isArray(issues)) {
    for (const i of issues) {
      if (i && typeof i === "object" && "path" in i && "message" in i) {
        const path = (i as { path: unknown }).path;
        // The API sends "/body/name" (instancePath) or "name"; zod arrays send ["name"].
        const key = Array.isArray(path) ? String(path[0] ?? "") : (String(path).split(/[/.]/).filter(Boolean).pop() ?? "");
        if (key && !out[key]) out[key] = String((i as { message: unknown }).message);
      }
    }
  }
  return out;
}
