import Link from "next/link";
import { CircleAlert, Info, PlugZap, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ApiFailure } from "@/lib/api";
import { cn } from "@/lib/cn";
import { buttonClass } from "./button";

/**
 * Explicit error state for API failures. Never replaced by invented content.
 */
export function ApiError({
  failure,
  title,
  className,
  compact,
}: {
  failure: ApiFailure;
  title?: string;
  className?: string;
  compact?: boolean;
}) {
  const unreachable = failure.kind === "unreachable";
  const auth = failure.status === 401;
  const forbidden = failure.status === 403;
  const heading =
    title ??
    (unreachable
      ? "The SCRIPT//GO API is not reachable."
      : auth
        ? "Sign in to see this."
        : forbidden
          ? "You don't have access to this."
          : "This couldn't be loaded.");
  const Icon = unreachable ? PlugZap : CircleAlert;
  return (
    <div
      role="alert"
      className={cn(
        "sheet border-[2.5px] border-dashed border-bad bg-bad-soft text-ink",
        compact ? "p-3 text-[13.5px]" : "p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-bad" size={compact ? 18 : 22} strokeWidth={2.25} />
        <div className="min-w-0">
          <p className={cn("font-display font-extrabold", compact ? "text-[14.5px]" : "text-[17px]")}>{heading}</p>
          <p className="mt-1 text-ink-2">
            {unreachable
              ? "Nothing is shown instead of real data. The service may be starting or down; try again in a moment."
              : failure.message}
          </p>
          <p className="mt-1 font-mono text-[12px] text-ink-3">
            {failure.code}
            {failure.status ? ` · HTTP ${failure.status}` : ""}
          </p>
          {!compact ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {auth ? (
                <Link className={buttonClass("primary", "sm")} href="/sign-in">
                  Sign in
                </Link>
              ) : null}
              <Link className={buttonClass("secondary", "sm")} href="/status">
                Platform status
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Info,
  title,
  children,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-[2.5px] border-dashed border-line-soft px-5 py-8 text-center", className)}>
      <Icon aria-hidden="true" className="mx-auto text-ink-3" size={26} strokeWidth={1.75} />
      <p className="mt-2 font-display text-[17px] font-extrabold">{title}</p>
      {children ? <div className="mx-auto mt-1 max-w-prose text-[14.5px] text-ink-2">{children}</div> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

const BANNER_TONES = {
  info: { cls: "bg-info-soft border-info", icon: Info, iconCls: "text-info" },
  warning: { cls: "bg-sun-soft border-line", icon: TriangleAlert, iconCls: "text-warn" },
  danger: { cls: "bg-bad-soft border-bad", icon: CircleAlert, iconCls: "text-bad" },
} as const;

/** Page-level banner: restricted listing, checkout off, grace period, drafts pending review. */
export function Banner({
  tone = "info",
  title,
  children,
  className,
  action,
}: {
  tone?: keyof typeof BANNER_TONES;
  title: string;
  children?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  const t = BANNER_TONES[tone];
  const Icon = t.icon;
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("sheet border-[2.5px] p-4", t.cls, className)}>
      <div className="flex flex-wrap items-start gap-3">
        <Icon aria-hidden="true" className={cn("mt-0.5 shrink-0", t.iconCls)} size={20} strokeWidth={2.25} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[16px] font-extrabold">{title}</p>
          {children ? <div className="mt-0.5 text-[14.5px] text-ink-2">{children}</div> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
