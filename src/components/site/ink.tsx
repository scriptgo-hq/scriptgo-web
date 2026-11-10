/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/ui/typography";

/**
 * Building blocks of the public pages: grounds, the hand-drawn ridge between two of them, the
 * night page head. Server components, no state.
 */

export type Ground = "paper" | "paper2" | "sheet" | "cobalt" | "night" | "sun" | "ink";

const GROUND_VAR: Record<Ground, string> = {
  paper: "var(--g-paper)",
  paper2: "var(--g-paper2)",
  sheet: "var(--g-sheet)",
  cobalt: "var(--g-cobalt)",
  night: "var(--g-night)",
  sun: "var(--g-sun)",
  ink: "var(--g-ink)",
};
const GROUND_CLASS: Record<Ground, string> = {
  paper: "g-paper",
  paper2: "g-paper2",
  sheet: "g-sheet",
  cobalt: "g-cobalt",
  night: "g-night",
  sun: "g-sun",
  ink: "g-night",
};

/** Far-range inks that read on each pair of grounds: [far range, its lit facets]. */
const RANGE_INKS = {
  violet: ["#7a5cf0", "#b9a8ff"],
  cobalt: ["#2f3ce0", "#8790ff"],
  sun: ["#ffc83d", "#ffe9a8"],
  orange: ["#ff8a3d", "#ffc27a"],
  deep: ["#232b88", "#4550cf"],
  sand: ["#d2c19a", "#efe4c6"],
} as const;
export type RangeInk = keyof typeof RANGE_INKS;

// Two ranges with uneven peaks, drawn by hand. Shapes alternate and flip so no two ridges on a
// page look the same.
const RANGES = [
  {
    far: "M0,84 L110,70 L200,78 L330,44 L400,54 L520,30 L590,40 L720,72 L850,60 L960,76 L1070,50 L1150,22 L1200,8 L1260,24 L1350,62 L1440,50 V150 H0Z",
    facets: "M1150,22 L1200,8 L1260,24 L1222,32 L1196,22 L1168,30Z M330,44 L400,54 L372,58 L346,52Z M520,30 L590,40 L560,44Z",
    strokes:
      "M1216,36 Q1266,50 1322,80 Q1262,60 1216,36Z M540,54 Q594,64 656,86 Q592,74 540,54Z M304,66 Q252,72 196,92 Q254,78 304,66Z M880,74 Q930,80 986,98 Q928,88 880,74Z",
    near: "M0,116 L100,104 L180,110 L300,86 L380,96 L480,74 L540,84 L660,108 L790,100 L900,114 L1020,94 L1110,72 L1170,82 L1280,108 L1370,98 L1440,110 V150 H0Z",
  },
  {
    far: "M0,70 L130,84 L240,58 L330,66 L450,34 L540,48 L640,20 L720,38 L840,70 L950,58 L1080,80 L1200,50 L1290,62 L1380,40 L1440,54 V150 H0Z",
    facets: "M640,20 L720,38 L690,44 L660,36 L630,42Z M450,34 L540,48 L500,50Z M1380,40 L1440,54 L1404,56Z",
    strokes:
      "M662,48 Q718,60 782,86 Q716,70 662,48Z M432,58 Q380,66 316,86 Q382,72 432,58Z M1214,70 Q1262,78 1318,98 Q1260,88 1214,70Z M150,92 Q196,96 246,112 Q194,104 150,92Z",
    near: "M0,108 L120,116 L250,96 L360,106 L470,84 L580,100 L690,76 L780,90 L900,112 L1030,100 L1150,116 L1270,92 L1360,104 L1440,94 V150 H0Z",
  },
] as const;

/**
 * A hand-drawn ridge between two grounds: a far range in its own ink with lit facets and a few
 * brush strokes, then a near range in the colour of the next section. `n` picks the drawing.
 */
export function Ridge({
  from,
  to,
  ink = "violet",
  n = 0,
  small = false,
  className,
}: {
  from: Ground | "transparent";
  to: Ground;
  ink?: RangeInk;
  n?: number;
  small?: boolean;
  className?: string;
}) {
  const r = RANGES[n % 2]!;
  const flip = n % 4 >= 2 ? "translate(1440 0) scale(-1 1)" : undefined;
  const [far, facet] = RANGE_INKS[ink];
  const outline = { stroke: "#0b0b1e", strokeWidth: 3, strokeLinejoin: "round" as const, vectorEffect: "non-scaling-stroke" as const };
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={cn("ridge", small && "ridge-sm", className)}
      viewBox="0 0 1440 130"
      preserveAspectRatio="none"
      style={{ background: from === "transparent" ? "transparent" : GROUND_VAR[from] }}
    >
      <g transform={flip}>
        <path d={r.far} fill={far} {...outline} />
        <path d={r.facets} fill={facet} />
        <path d={r.strokes} fill="#0b0b1e" />
        <path d={r.near} fill={GROUND_VAR[to]} {...outline} />
      </g>
    </svg>
  );
}

/** A full-width section on a ground. `sweeps` adds the brush strokes in its corners. */
export function Section({
  ground = "paper",
  sweeps = true,
  className,
  innerClassName,
  children,
  ...rest
}: {
  ground?: Ground;
  sweeps?: boolean;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children">) {
  return (
    <section className={cn("sec", GROUND_CLASS[ground], sweeps && "sec-sweeps", className)} {...rest}>
      <div className={cn("container-page", innerClassName)}>{children}</div>
    </section>
  );
}

/** Tag, title and an optional lede that open a section. */
export function SectionHead({
  tag,
  title,
  id,
  children,
  aside,
  className,
  size = "l",
}: {
  tag?: React.ReactNode;
  title: React.ReactNode;
  id?: string;
  children?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  size?: "l" | "m";
}) {
  return (
    <div className={cn("sec-head", className)}>
      <div className="min-w-0">
        {tag ? <Eyebrow className="mb-[18px]">{tag}</Eyebrow> : null}
        <h2 id={id} className={cn("display scroll-mt-28", size === "l" ? "text-[clamp(32px,3.7vw,52px)]" : "text-[clamp(28px,3vw,40px)]")}>
          {title}
        </h2>
        {children ? <div className="mt-3 max-w-[60ch] text-[17px] text-ink-2">{children}</div> : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}

/**
 * The head of a public page: a night band with the tag, the title and what the page is for.
 * `art` paints an inked illustration on its right half. `to` is the ground of what follows.
 */
export function PageHead({
  tag,
  title,
  lede,
  children,
  art,
  to = "paper",
  ink = "cobalt",
  n = 0,
  aside,
  id,
}: {
  tag: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
  art?: { src: string; width: number; height: number; position?: string };
  to?: Ground;
  ink?: RangeInk;
  n?: number;
  aside?: React.ReactNode;
  id?: string;
}) {
  return (
    <section className={cn("page-head g-night", art && "has-art")} aria-labelledby={id}>
      {art ? (
        <img
          className="page-head-art"
          src={art.src}
          width={art.width}
          height={art.height}
          alt=""
          decoding="async"
          fetchPriority="high"
          style={art.position ? { objectPosition: art.position } : undefined}
        />
      ) : null}
      <div className={cn("container-page grid gap-10 pb-10 pt-12 lg:pt-16", aside ? "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-center" : "")}>
        <div className="min-w-0 max-w-[760px]">
          <Eyebrow className="mb-5">{tag}</Eyebrow>
          <h1 id={id} className="display">
            {title}
          </h1>
          {lede ? <p className="one-line mt-5 text-[#e6e2f3]">{lede}</p> : null}
          {children}
        </div>
        {aside ? <div className="min-w-0">{aside}</div> : null}
      </div>
      <Ridge from="transparent" to={to} ink={ink} n={n} small className="relative z-[1]" />
    </section>
  );
}

/** A decorative inked illustration with real dimensions. */
export function Art({
  src,
  width,
  height,
  className,
  eager = false,
  alt = "",
}: {
  src: string;
  width: number;
  height: number;
  className?: string;
  eager?: boolean;
  alt?: string;
}) {
  return <img src={src} width={width} height={height} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" className={className} />;
}

export const SCENES = {
  stall: { src: "/ink/scene-stall.webp", width: 1152, height: 691 },
  pass: { src: "/ink/scene-pass.webp", width: 1152, height: 691 },
  strongbox: { src: "/ink/scene-strongbox.webp", width: 1152, height: 691 },
  signpost: { src: "/ink/scene-signpost.webp", width: 1152, height: 691 },
  // drawn for the site: one concept each
  adapter: { src: "/ink/scene-adapter.webp", width: 1152, height: 720 },
  workbench: { src: "/ink/scene-workbench.webp", width: 1152, height: 720 },
  toolcase: { src: "/ink/scene-toolcase.webp", width: 1152, height: 720 },
  seal: { src: "/ink/scene-seal.webp", width: 1152, height: 720 },
  serverkey: { src: "/ink/scene-serverkey.webp", width: 1152, height: 720 },
  watchtower: { src: "/ink/scene-watchtower.webp", width: 1152, height: 720 },
  logbook: { src: "/ink/scene-logbook.webp", width: 1152, height: 720 },
  gate: { src: "/ink/scene-gate.webp", width: 1152, height: 720 },
  depot: { src: "/ink/scene-depot.webp", width: 1152, height: 720 },
  beacon: { src: "/ink/scene-beacon.webp", width: 1152, height: 720 },
  scaffold: { src: "/ink/scene-scaffold.webp", width: 1152, height: 720 },
  scales: { src: "/ink/scene-scales.webp", width: 1152, height: 720 },
  band: { src: "/ink/band-ridge.webp", width: 2000, height: 750 },
  /** The same country without the traveller, drawn as a wide panorama: the home page's closing band. */
  ranges: { src: "/ink/band-ranges.webp", width: 2560, height: 720 },
  /** The home hero: the traveller on the right, a calm left half for the headline. 16:9, three widths. */
  hero: {
    src: "/ink/hero-ridge-1920.webp",
    srcSet: "/ink/hero-ridge-1280.webp 1280w, /ink/hero-ridge-1920.webp 1920w, /ink/hero-ridge-2560.webp 2560w",
    width: 2560,
    height: 1440,
  },
} as const;
