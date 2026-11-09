"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Click-to-open popover (evidence, details). Escape or an outside click closes it and focus
 * returns to the trigger. The trigger is a real button, so it is keyboard operable.
 */
export function Popover({
  trigger,
  triggerLabel,
  children,
  align = "start",
  className,
  triggerClassName,
  panelClassName,
}: {
  trigger: React.ReactNode;
  /** Accessible name for the trigger when its content is not descriptive. */
  triggerLabel?: string;
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={triggerLabel}
        onClick={() => setOpen((o) => !o)}
        className={triggerClassName}
      >
        {trigger}
      </button>
      <div
        id={id}
        role="dialog"
        aria-label={triggerLabel}
        hidden={!open}
        className={cn(
          "sticker-sm absolute top-[calc(100%+8px)] z-40 w-[min(320px,calc(100vw-32px))] p-4 text-[13.5px]",
          align === "end" ? "right-0" : "left-0",
          panelClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
