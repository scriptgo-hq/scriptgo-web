"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";

/** Copy to clipboard with a visible "Copied" confirmation and a polite live announcement. */
export function CopyButton({
  text,
  label = "Copy",
  className,
  tone = "dark",
}: {
  text: string;
  label?: string;
  className?: string;
  tone?: "dark" | "light";
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1800);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className={cn(
          "inline-flex h-7 items-center gap-1.5 border-[1.5px] px-2 text-[12px] font-bold transition-colors duration-150",
          tone === "dark"
            ? "border-[#6d6b91] text-[#f3ecdc] hover:border-[#ffc83d] hover:bg-[#ffc83d] hover:text-[#0b0b1e]"
            : "border-line bg-surface text-ink hover:bg-sun hover:text-on-sun",
          className,
        )}
      >
        {state === "copied" ? (
          <Check aria-hidden="true" size={13} strokeWidth={2.5} />
        ) : (
          <Copy aria-hidden="true" size={13} strokeWidth={2.25} />
        )}
        {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied" ? "Copied to clipboard" : state === "failed" ? "Copy failed. Select the text and copy it manually." : ""}
      </span>
    </>
  );
}
