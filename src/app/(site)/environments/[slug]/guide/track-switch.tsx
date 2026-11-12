"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { buttonClass, type ButtonSize } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * The guide shows one track at a time (sell a script, or sell bonuses). The choice lives in the URL
 * hash, so a link to a track or to one of its steps opens that track. Without JavaScript every track
 * is shown, one after the other.
 */

const EVENT = "sg-guide-track";
/** Where the tracks start: the hero buttons scroll there. */
export const TRACKS_ANCHOR = "guide-tracks";

export interface TrackChoice {
  id: string;
  label: string;
  /** Step anchors (`<track>-<step>`) that open this track. */
  steps: string[];
}

function trackFromHash(choices: TrackChoice[]): string | null {
  const h = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (!h) return null;
  return choices.find((c) => c.id === h || c.steps.includes(h))?.id ?? null;
}

function useActiveTrack(choices: TrackChoice[]): [string | null, (id: string) => void] {
  // null until hydrated: the server renders every track, the client then keeps one.
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setActive(trackFromHash(choices) ?? choices[0]?.id ?? null);
    sync();
    const onPick = (e: Event) => setActive((e as CustomEvent<string>).detail);
    window.addEventListener("hashchange", sync);
    window.addEventListener(EVENT, onPick);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener(EVENT, onPick);
    };
  }, [choices]);

  const pick = (id: string) => {
    history.replaceState(null, "", `#${id}`);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: id }));
  };
  return [active, pick];
}

/** One button per track; the chosen one is lit. `scroll` brings the tracks into view (hero buttons). */
export function TrackButtons({
  choices,
  size = "lg",
  scroll = false,
  className,
}: {
  choices: TrackChoice[];
  size?: ButtonSize;
  scroll?: boolean;
  className?: string;
}) {
  const [active, pick] = useActiveTrack(choices);
  const current = active ?? choices[0]?.id;
  return (
    <div role="group" aria-label="What do you want to do?" className={cn("cta-row", className)}>
      {choices.map((c) => {
        const on = c.id === current;
        return (
          <a
            key={c.id}
            href={`#${c.id}`}
            aria-pressed={on}
            className={buttonClass(on ? "sun" : "secondary", size)}
            onClick={(e) => {
              e.preventDefault();
              pick(c.id);
              if (scroll) {
                // After the switch has rendered, so the page measures the track now shown.
                requestAnimationFrame(() => document.getElementById(TRACKS_ANCHOR)?.scrollIntoView({ behavior: "smooth", block: "start" }));
              }
            }}
          >
            {c.label}
            {on ? <ArrowRight aria-hidden="true" size={size === "sm" ? 14 : 17} strokeWidth={2.5} /> : null}
          </a>
        );
      })}
    </div>
  );
}

/** The tracks, server-rendered; only the chosen one stays visible once the page is live. */
export function TrackPanels({ choices, panels }: { choices: TrackChoice[]; panels: Record<string, React.ReactNode> }) {
  const [active] = useActiveTrack(choices);

  // A link to a step: scroll to it once its track is shown.
  useEffect(() => {
    if (!active) return;
    const h = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (h && h !== active) document.getElementById(h)?.scrollIntoView({ block: "start" });
  }, [active]);

  return (
    <>
      {choices.map((c) => (
        <div key={c.id} hidden={active !== null && active !== c.id}>
          {panels[c.id]}
        </div>
      ))}
    </>
  );
}
