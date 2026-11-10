import { cn } from "@/lib/cn";
import type { StatusMeta, Tone } from "@/lib/status";
import { StatusIcon } from "./icon";

/** Stamp colours per tone (see `.stamp-*` in globals.css). */
const STAMP_TONES: Record<Tone, string> = {
  success: "stamp-ok",
  danger: "stamp-bad",
  warning: "stamp-warn",
  info: "stamp-info",
  neutral: "stamp-neutral",
  muted: "stamp-muted",
  accent: "stamp-accent",
};

/** Token colours per tone, for small boxed names that carry a status (see `.tok-*`). */
export const TONE_CLASSES: Record<Tone, string> = {
  success: "tok-ok",
  danger: "tok-bad",
  warning: "tok-warn",
  info: "tok-info",
  neutral: "tok-neutral",
  muted: "tok-muted",
  accent: "tok-accent",
};

/** Status stamp: icon + label + tone, never colour alone. */
export function StatusBadge({
  meta,
  size = "md",
  className,
  suffix,
}: {
  meta: StatusMeta;
  size?: "sm" | "md";
  className?: string;
  /** Extra text after the label, e.g. "· 4 d left". */
  suffix?: string;
}) {
  return (
    <span title={meta.hint} className={cn("stamp", size === "sm" && "stamp-sm", STAMP_TONES[meta.tone], className)}>
      <StatusIcon name={meta.icon} size={size === "sm" ? 12 : 13} className="shrink-0" />
      <span className="truncate">
        {meta.label}
        {suffix ? <span className="font-semibold"> {suffix}</span> : null}
      </span>
    </span>
  );
}

/** Small boxed name (environment names, capabilities, tags). */
export function Tag({
  children,
  className,
  mono,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  mono?: boolean;
  title?: string;
}) {
  return (
    <span title={title} className={cn("tok", mono && "tok-mono", className)}>
      {children}
    </span>
  );
}
