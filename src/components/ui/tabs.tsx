"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

/**
 * Accessible tabs (WAI-ARIA tablist): arrow keys move between tabs, Home/End jump, panels keep
 * their server-rendered content. With `hashSync`, the selected tab is mirrored in the URL hash.
 */
export function Tabs({
  items,
  defaultId,
  label,
  hashSync = false,
  variant = "underline",
  className,
  listClassName,
  onChange,
  selectedId,
}: {
  items: TabItem[];
  defaultId?: string;
  label: string;
  hashSync?: boolean;
  variant?: "underline" | "pill";
  className?: string;
  listClassName?: string;
  onChange?: (id: string) => void;
  /** Controlled selection (optional). */
  selectedId?: string;
}) {
  const base = useId();
  const [internal, setInternal] = useState(defaultId ?? items[0]?.id ?? "");
  const active = selectedId ?? internal;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!hashSync) return;
    const fromHash = () => {
      const h = window.location.hash.replace(/^#/, "");
      if (h && items.some((i) => i.id === h)) setInternal(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [hashSync, items]);

  const select = useCallback(
    (id: string, focus = false) => {
      setInternal(id);
      onChange?.(id);
      if (hashSync) history.replaceState(null, "", `#${id}`);
      if (focus) refs.current[id]?.focus();
    },
    [hashSync, onChange],
  );

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next >= 0) {
      e.preventDefault();
      select(items[next]!.id, true);
    }
  }

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        className={cn(
          "relative max-w-full gap-1 overflow-x-auto",
          variant === "underline" ? "flex border-b-[3px] border-line" : "flex flex-wrap gap-1.5 overflow-visible",
          listClassName,
        )}
      >
        {items.map((item, i) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              ref={(el) => {
                refs.current[item.id] = el;
              }}
              id={`${base}-tab-${item.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${base}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(item.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "shrink-0 whitespace-nowrap font-display font-extrabold transition-colors duration-150",
                variant === "underline"
                  ? cn(
                      "px-4 pb-2 pt-2.5 text-[15px] [clip-path:polygon(9px_0,100%_0,calc(100%-9px)_100%,0_100%)]",
                      selected ? "bg-ink text-paper" : "text-ink hover:bg-sun hover:text-on-sun",
                    )
                  : cn(
                      "sheet border-2 border-line px-3 py-1.5 text-[13.5px]",
                      selected ? "bg-ink text-paper" : "bg-surface text-ink hover:bg-sun hover:text-on-sun",
                    ),
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          id={`${base}-panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`${base}-tab-${item.id}`}
          tabIndex={0}
          hidden={item.id !== active}
          className="focus-visible:outline-offset-4"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

const ENV_KEY = "sg-env";
const ENV_EVENT = "sg-env-change";

export function readStoredEnv(): string | null {
  try {
    return window.localStorage.getItem(ENV_KEY);
  } catch {
    return null;
  }
}

export function storeEnv(slug: string) {
  try {
    window.localStorage.setItem(ENV_KEY, slug);
  } catch {
    // Storage blocked: the choice still applies on this page.
  }
  window.dispatchEvent(new CustomEvent(ENV_EVENT, { detail: slug }));
}

/** Environment tabs whose selection is shared across the whole site (docs, install, proof block). */
export function EnvTabs({
  items,
  label = "Environment",
  className,
  variant = "pill",
}: {
  items: TabItem[];
  label?: string;
  className?: string;
  variant?: "underline" | "pill";
}) {
  const [selected, setSelected] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const stored = readStoredEnv();
    if (stored && items.some((i) => i.id === stored)) setSelected(stored);
    const onChange = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      if (items.some((i) => i.id === slug)) setSelected(slug);
    };
    window.addEventListener(ENV_EVENT, onChange);
    return () => window.removeEventListener(ENV_EVENT, onChange);
  }, [items]);

  return (
    <Tabs
      items={items}
      label={label}
      variant={variant}
      className={className}
      selectedId={selected}
      onChange={(id) => {
        setSelected(id);
        storeEnv(id);
      }}
    />
  );
}
