/* eslint-disable @next/next/no-img-element */
import type { Category } from "@/lib/contract";
import { cn } from "@/lib/cn";
import { envMonogram } from "@/lib/env";
import { WORLD_CARD_SIZE, WORLD_SIZE, cover, tileGround, worldArt, worldCardSrc, worldSrc } from "@/lib/worlds";

/**
 * Card-size picture of an environment: its inked illustration when one exists, otherwise a
 * typographic tile with its monogram. Decorative: the name is always written next to it.
 */
export function EnvironmentCardArt({ slug, name, className, large = false }: { slug: string; name: string; className?: string; large?: boolean }) {
  const w = worldArt(slug);
  if (w) {
    const size = large ? WORLD_SIZE : WORLD_CARD_SIZE;
    return (
      <img
        src={large ? worldSrc(w.art) : worldCardSrc(w.art)}
        width={size.width}
        height={size.height}
        alt=""
        loading="lazy"
        decoding="async"
        className={cn("h-full w-full object-cover", className)}
        style={{ objectPosition: "72% 50%" }}
      />
    );
  }
  const g = tileGround(slug);
  return (
    <span
      aria-hidden="true"
      className={cn("relative flex h-full w-full items-center justify-center overflow-hidden", className)}
      style={{ background: g.bg, color: g.fg }}
    >
      <span
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(11,11,30,0.28) 1.5px, transparent 1.9px)",
          backgroundSize: "10px 10px",
          WebkitMaskImage: "linear-gradient(200deg, #000 0%, transparent 55%)",
          maskImage: "linear-gradient(200deg, #000 0%, transparent 55%)",
        }}
      />
      <span className="relative flex items-center gap-[0.14em] font-display font-black italic leading-none" style={{ fontStretch: "125%", fontSize: large ? 96 : 40, letterSpacing: "-0.03em" }}>
        <span className="flex gap-[0.1em]">
          <i className="block h-[0.9em] w-[0.2em] -skew-x-[16deg] border-2 border-[#0b0b1e]" style={{ background: g.slash }} />
          <i className="block h-[0.9em] w-[0.2em] -skew-x-[16deg] border-2 border-[#0b0b1e]" style={{ background: g.slash }} />
        </span>
        {envMonogram(slug, name)}
      </span>
    </span>
  );
}

/** Inked cover of a package category. Decorative. */
export function CategoryArt({ category, className, eager = false }: { category: Category; className?: string; eager?: boolean }) {
  const c = cover(category);
  return (
    <img
      src={c.src}
      width={c.width}
      height={c.height}
      alt=""
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
