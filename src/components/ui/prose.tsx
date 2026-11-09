"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/cn";
import { readStoredEnv, storeEnv } from "./tabs";

function selectEnv(group: Element, env: string, focus = false): boolean {
  const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>("[data-env-tab]"));
  if (!tabs.some((t) => t.dataset.envTab === env)) return false;
  for (const t of tabs) {
    const on = t.dataset.envTab === env;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    if (on && focus) t.focus();
  }
  for (const p of Array.from(group.querySelectorAll<HTMLElement>("[data-env-panel]"))) {
    p.hidden = p.dataset.envPanel !== env;
  }
  return true;
}

/**
 * Rendered Markdown with progressive enhancement: copy buttons on code blocks and synced
 * environment tabs (the choice is shared across the site). Without JavaScript the first tab shows.
 */
export function Prose({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Give each env group stable ARIA wiring.
    root.querySelectorAll("[data-env-group]").forEach((group, gi) => {
      group.querySelectorAll<HTMLElement>("[data-env-tab]").forEach((tab) => {
        const env = tab.dataset.envTab!;
        const panel = group.querySelector<HTMLElement>(`[data-env-panel="${CSS.escape(env)}"]`);
        const tabId = `${uid}-g${gi}-t-${env}`;
        const panelId = `${uid}-g${gi}-p-${env}`;
        tab.id = tabId;
        tab.setAttribute("aria-controls", panelId);
        if (panel) {
          panel.id = panelId;
          panel.setAttribute("aria-labelledby", tabId);
          panel.tabIndex = 0;
        }
      });
    });

    const applyAll = (env: string) => root.querySelectorAll("[data-env-group]").forEach((g) => selectEnv(g, env));
    const stored = readStoredEnv();
    if (stored) applyAll(stored);

    const onEnv = (e: Event) => applyAll((e as CustomEvent<string>).detail);
    window.addEventListener("sg-env-change", onEnv);

    const onClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tab = target.closest<HTMLButtonElement>("[data-env-tab]");
      if (tab) {
        storeEnv(tab.dataset.envTab!);
        return;
      }
      const copy = target.closest<HTMLButtonElement>("[data-copy]");
      if (copy) {
        const code = copy.closest("[data-code]")?.querySelector("pre")?.textContent ?? "";
        const label = copy.querySelector("[data-copy-label]");
        try {
          await navigator.clipboard.writeText(code);
          if (label) label.textContent = "Copied";
        } catch {
          if (label) label.textContent = "Copy failed";
        }
        setTimeout(() => {
          if (label) label.textContent = "Copy";
        }, 1800);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      const tab = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-env-tab]");
      if (!tab) return;
      const group = tab.closest("[data-env-group]");
      if (!group) return;
      const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>("[data-env-tab]"));
      const i = tabs.indexOf(tab);
      let n = -1;
      if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = tabs.length - 1;
      if (n < 0) return;
      e.preventDefault();
      const env = tabs[n]!.dataset.envTab!;
      selectEnv(group, env, true);
      storeEnv(env);
    };

    root.addEventListener("click", onClick);
    root.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("sg-env-change", onEnv);
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKey);
    };
  }, [html, uid]);

  return <div ref={ref} className={cn("prose-sg", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
