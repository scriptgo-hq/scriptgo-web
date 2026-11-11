"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { StatusBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import type { StatusMeta } from "@/lib/status";
import { WORLD_CARD_SIZE, worldCardSrc } from "@/lib/worlds";
import { WORLD_EVENT } from "./nav";

/** One ticket of the picker. Everything but `art`, `tint` and `kind` is read from the registry. */
export interface World {
  slug: string;
  name: string;
  kind: string;
  art: string;
  tint: string;
  status: StatusMeta;
  /** A real test passed on the platform. */
  tested: boolean;
  /** "server" for a mod platform, "runtime" for an engine. */
  kindNoun: string;
  /** Where the platform's setup is explained (its docs page). */
  docsHref: string;
}

interface Ctx {
  worlds: World[];
  current: World;
  select: (slug: string) => void;
}
const WorldContext = createContext<Ctx | null>(null);

function useWorld(): Ctx {
  const ctx = useContext(WorldContext);
  if (!ctx) throw new Error("useWorld outside <WorldProvider>");
  return ctx;
}

function envHref(w: World): string {
  return `/environments/${encodeURIComponent(w.slug)}`;
}

/**
 * Holds the picked platform for the top of the home page. The picture behind the hero is fixed:
 * picking a platform changes the tag, its real status, and where the links below lead.
 */
export function WorldProvider({ worlds, initial, children }: { worlds: World[]; initial: string; children: React.ReactNode }) {
  const [slug, setSlug] = useState(initial);
  const current = worlds.find((w) => w.slug === slug) ?? worlds[0]!;

  // The key in the header is pressed each time the platform changes (not on the first paint).
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.dispatchEvent(new Event(WORLD_EVENT));
  }, [slug]);

  const select = useCallback((next: string) => setSlug(next), []);
  const value = useMemo(() => ({ worlds, current, select }), [worlds, current, select]);
  return (
    <WorldContext.Provider value={value}>
      <div style={{ "--w": current.tint } as React.CSSProperties}>{children}</div>
    </WorldContext.Provider>
  );
}

/** "The SDK on <platform>" and the platform's real status, above the headline. */
export function WorldNow() {
  const { current } = useWorld();
  return (
    <div className="lobby-now" aria-live="polite">
      <p className="tag">
        <span aria-hidden="true" className="tag-slashes" />
        <span className="tag-plate">
          The SDK on <span>{current.name}</span>
        </span>
      </p>
      <StatusBadge meta={current.status} />
    </div>
  );
}

/**
 * The hero's calls to action. Signing up is the same everywhere (the key is made in the dashboard);
 * the docs button leads to the picked platform's own install steps when it has some, and the link
 * under them goes to that platform's page.
 */
export function WorldCtas() {
  const { current } = useWorld();
  return (
    <>
      <div className="cta-row mt-8">
        <Link href="/sign-up" className={buttonClass("sun", "lg")}>
          Create your account
          <ArrowRight aria-hidden="true" size={17} strokeWidth={2.5} />
        </Link>
        <Link href={current.docsHref} className={buttonClass("secondary", "lg")}>
          Read the SDK docs
        </Link>
      </div>
      <p className="mt-6">
        <Link href={envHref(current)} className="ink-link">
          See {current.name} <ArrowRight aria-hidden="true" strokeWidth={2.5} />
        </Link>
      </p>
    </>
  );
}

/** The name of the picked platform, inline. */
export function WorldName() {
  const { current } = useWorld();
  return <>{current.name}</>;
}

/** Where the picked platform stands, from the registry, with the way to its page. */
export function WorldPlugLine() {
  const { current } = useWorld();
  return (
    <p className="text-[14px] [overflow-wrap:anywhere]">
      <Link href={envHref(current)} className="font-bold underline underline-offset-2">
        {current.name}
      </Link>
      : {current.tested ? `tested on a real ${current.kindNoun}.` : "on the roadmap."}
    </p>
  );
}

/** The platform picker: one ticket per platform, the picked one raised. `more` counts the rest. */
export function WorldPicker({ more }: { more: number }) {
  const { worlds, current, select } = useWorld();
  const row = useRef<HTMLDivElement>(null);
  // On a narrow screen the row scrolls sideways: keep the picked ticket in view (the page itself never moves).
  useEffect(() => {
    const el = row.current;
    const picked = el?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!el || !picked || el.scrollWidth <= el.clientWidth) return;
    el.scrollTo({ left: picked.offsetLeft - (el.clientWidth - picked.offsetWidth) / 2, behavior: "auto" });
  }, [current.slug]);
  return (
    <div ref={row} className="worlds" role="group" aria-label="Pick a platform">
      {worlds.map((w) => (
        <button
          key={w.slug}
          type="button"
          className="world"
          aria-pressed={w.slug === current.slug}
          onClick={() => select(w.slug)}
          style={{ "--wc": w.tint } as React.CSSProperties}
        >
          <img src={worldCardSrc(w.art)} width={WORLD_CARD_SIZE.width} height={WORLD_CARD_SIZE.height} alt="" decoding="async" />
          <span className="world-text">
            <strong>{w.name}</strong>
            <small>{w.kind}</small>
          </span>
        </button>
      ))}
      <Link className="world more" href="/environments">
        <span className="world-text">
          <strong>{more > 0 ? `+${more}` : "All"}</strong>
          <small>All platforms</small>
        </span>
      </Link>
    </div>
  );
}
