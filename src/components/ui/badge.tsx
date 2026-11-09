import { cn } from "@/lib/cn";
import type { StatusMeta, Tone } from "@/lib/status";
import { StatusIcon } from "./icon";

export const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-ok-soft text-ok border-ok/45",
  danger: "bg-bad-soft text-bad border-bad/45",
  warning: "bg-warn-soft text-warn border-warn/45",
  info: "bg-info-soft text-info border-info/45",
  neutral: "bg-neutral-soft text-neutral border-neutral/50 border-dashed",
  muted: "bg-transparent text-ink-3 border-line-soft",
  accent: "bg-sun text-on-sun border-line",
};

/** Status badge: icon + label + tone, never colour alone. */
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
    <span
      title={meta.hint}
      className={cn(
        "inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-full border font-semibold leading-none",
        size === "sm" ? "px-2 py-[3px] text-[11.5px]" : "px-2.5 py-1 text-[13px]",
        TONE_CLASSES[meta.tone],
        className,
      )}
    >
      <StatusIcon name={meta.icon} size={size === "sm" ? 12 : 14} className="shrink-0" />
      <span className="truncate">
        {meta.label}
        {suffix ? <span className="font-medium"> {suffix}</span> : null}
      </span>
    </span>
  );
}

/** Small neutral capsule (environment names, capabilities, tags). */
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
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-line-soft bg-surface-2 px-2 py-[3px] text-[11.5px] font-semibold leading-none text-ink-2",
        mono && "font-mono font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}
