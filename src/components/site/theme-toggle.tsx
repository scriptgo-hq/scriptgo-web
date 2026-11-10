"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

type Theme = "light" | "dark";
const LABEL: Record<Theme, string> = { light: "Paper", dark: "Night" };

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.setAttribute("data-theme", "dark");
  else root.removeAttribute("data-theme");
  try {
    if (theme === "dark") localStorage.setItem("sg-theme", "dark");
    else localStorage.removeItem("sg-theme");
  } catch {
    // Storage blocked: the theme still applies to this page view.
  }
}

/**
 * Paper (the printed poster, the default) or Night. The site does not follow the OS setting: it
 * is paper until someone asks for night. With `label`, the name of the current theme is shown.
 */
export function ThemeToggle({ className, label = false }: { className?: string; label?: boolean }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
  }, []);

  const next: Theme = theme === "light" ? "dark" : "light";
  const Icon = theme === "light" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={() => {
        apply(next);
        setTheme(next);
      }}
      aria-label={`Theme: ${LABEL[theme]}. Switch to ${LABEL[next]}.`}
      title={`Theme: ${LABEL[theme]}`}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 border-2 border-current font-display text-[13px] font-bold hover:bg-[#ffc83d] hover:text-[#0b0b1e]",
        label ? "px-3" : "w-9",
        className,
      )}
    >
      <Icon aria-hidden="true" size={17} strokeWidth={2.5} />
      {label ? <span>{LABEL[theme]}</span> : null}
    </button>
  );
}
