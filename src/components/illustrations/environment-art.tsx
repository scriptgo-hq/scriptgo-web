/*
 * Environment mini-scenes. Original drawings, no engine logos.
 * Scenes are drawn in a 200 x 120 space so the hero windows can reuse them.
 */
import type { ReactNode } from "react";
import { IsoCube, PixelHeart } from "./parts";
import {
  DIRT,
  DIRT_DARK,
  GRASS,
  GRASS_DARK,
  INK,
  OPEN77_CYAN,
  OPEN77_NAVY,
  PAPER,
  RED,
  SKIN,
  SKY,
  STONE,
  STONE_DARK,
  SUN,
  COBALT,
  CREAM,
  svgA11y,
} from "./palette";

const SW = 2;

export function GodotScene() {
  return (
    <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
      <rect width={200} height={120} fill="#A9DCCB" stroke="none" />
      <polygon points="160,12 171,18 171,31 160,37 149,31 149,18" fill={SUN} />
      <polygon points="14,30 26,20 42,22 52,30" fill={PAPER} />
      {/* faceted mountains */}
      <polygon points="34,44 -6,88 28,88" fill="#86C0A2" />
      <polygon points="34,44 28,88 74,88" fill="#4E8A6E" />
      <polygon points="96,26 52,88 90,88" fill="#93CBAE" />
      <polygon points="96,26 90,88 142,88" fill="#56937A" />
      <polygon points="158,46 118,90 150,90" fill="#7DB89A" />
      <polygon points="158,46 150,90 206,90" fill="#3F7A5E" />
      {/* faceted ground */}
      <polygon points="-2,86 50,80 110,90 162,82 202,88 202,122 -2,122" fill="#3E8E4F" />
      <polygon points="-2,86 50,80 24,122" fill="#5AAE66" />
      <polygon points="110,90 162,82 140,122" fill="#5AAE66" />
      <polygon points="50,80 110,90 76,122" fill="#4A9C5A" />
      {/* stone arch */}
      <path d="M28 100L28 62L52 48L76 62L76 100L64 100L64 72L52 64L40 72L40 100Z" fill="#CFC9DC" />
      <path d="M52 48L76 62L76 100L64 100L64 72L52 64Z" fill="#9A93B3" />
      <polygon points="96,102 102,93 112,95 116,103" fill={STONE} />
      {/* low-poly trees */}
      <rect x={156} y={78} width={6} height={20} fill="#6B4A2E" />
      <polygon points="159,36 140,70 159,82" fill="#3A9A55" />
      <polygon points="159,36 159,82 178,70" fill="#1E5E34" />
      <rect x={183} y={84} width={4} height={14} fill="#6B4A2E" />
      <polygon points="185,60 174,84 185,90" fill="#3A9A55" />
      <polygon points="185,60 185,90 196,84" fill="#1E5E34" />
    </g>
  );
}

export function LoveScene() {
  const tiles: ReactNode[] = [];
  for (let x = 20; x < 200; x += 20) {
    tiles.push(<line key={`v${x}`} x1={x} y1={99} x2={x} y2={120} />);
  }
  return (
    <g strokeLinejoin="round">
      <rect width={200} height={120} fill={SKY} />
      <polygon
        points="124,14 146,14 146,20 154,20 154,26 116,26 116,20 124,20"
        fill={PAPER}
        stroke={INK}
        strokeWidth={1.2}
      />
      <polygon points="60,32 74,32 74,37 80,37 80,42 54,42 54,37 60,37" fill={PAPER} stroke={INK} strokeWidth={1.2} />
      {/* hearts: three full, one empty */}
      <PixelHeart x={8} y={8} u={1.6} fill={RED} />
      <PixelHeart x={22} y={8} u={1.6} fill={RED} />
      <PixelHeart x={36} y={8} u={1.6} fill={RED} />
      <PixelHeart x={50} y={8} u={1.6} fill={PAPER} />
      {/* stepped hills */}
      <polygon points="0,92 0,72 16,72 16,64 40,64 40,72 56,72 56,92" fill="#86D07A" stroke={INK} strokeWidth={1.2} />
      <polygon points="120,92 120,80 136,80 136,74 164,74 164,92" fill="#86D07A" stroke={INK} strokeWidth={1.2} />
      {/* ground tiles */}
      <rect x={-2} y={92} width={204} height={8} fill={GRASS} stroke={INK} strokeWidth={SW} />
      <rect x={-2} y={99} width={204} height={23} fill={DIRT} stroke={INK} strokeWidth={SW} />
      <g stroke={DIRT_DARK} strokeWidth={1.5}>
        {tiles}
        <line x1={0} y1={110} x2={200} y2={110} />
      </g>
      {/* floating platform with coin */}
      <rect x={124} y={56} width={46} height={6} fill={GRASS} stroke={INK} strokeWidth={1.5} />
      <rect x={124} y={62} width={46} height={8} fill={DIRT} stroke={INK} strokeWidth={1.5} />
      <circle cx={147} cy={46} r={4.5} fill={SUN} stroke={INK} strokeWidth={1.5} />
      {/* hut */}
      <rect x={30} y={70} width={38} height={22} fill="#F2D29B" stroke={INK} strokeWidth={SW} />
      <polygon points="24,72 49,52 74,72" fill={RED} stroke={INK} strokeWidth={SW} />
      <rect x={45} y={78} width={10} height={14} fill={DIRT_DARK} stroke={INK} strokeWidth={1.5} />
      <rect x={33} y={75} width={8} height={8} fill={SKY} stroke={INK} strokeWidth={1.5} />
      {/* pixel tree */}
      <rect x={178} y={72} width={7} height={20} fill={DIRT_DARK} stroke={INK} strokeWidth={1.5} />
      <polygon points="172,50 192,50 192,54 198,54 198,74 166,74 166,54 172,54" fill={GRASS_DARK} stroke={INK} strokeWidth={SW} />
      <rect x={171} y={56} width={8} height={6} fill={GRASS} />
      {/* hero */}
      <rect x={97} y={86} width={3} height={6} fill={INK} />
      <rect x={103} y={86} width={3} height={6} fill={INK} />
      <rect x={95} y={76} width={13} height={11} fill={COBALT} stroke={INK} strokeWidth={1.5} />
      <rect x={96} y={66} width={11} height={10} fill={SKIN} stroke={INK} strokeWidth={1.5} />
      <rect x={95} y={63} width={13} height={4} fill={RED} stroke={INK} strokeWidth={1.2} />
      <rect x={103} y={69} width={2} height={3} fill={INK} />
    </g>
  );
}

type Cube = { i: number; j: number; k: number; top: string; left: string; right: string };

const GRASS_TOP = "#62C04F";
const SOIL_L = "#94603A";
const SOIL_R = "#744A2A";

export function LuantiScene() {
  const N = 9;
  const s = 12;
  const h = s / 2;
  const x0 = 100;
  const y0 = 42;
  const heights = [
    [3, 3, 3, 2, 2, 2, 2, 1, 1],
    [3, 3, 2, 2, 2, 1, 1, 1, 1],
    [2, 2, 2, 2, 1, 1, 1, 1, 1],
    [2, 2, 1, 1, 1, 1, 1, 1, 1],
    [2, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];
  const water = new Set(["6,6", "6,7", "7,6", "7,7", "7,5", "8,6"]);
  const cubes: Cube[] = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const H = heights[i]![j]!;
      const edge = i === N - 1 || j === N - 1;
      for (let k = edge ? -3 : 0; k < H; k++) {
        const isTop = k === H - 1;
        if (isTop && water.has(`${i},${j}`)) {
          cubes.push({ i, j, k, top: "#5DB8F0", left: "#3D8FC7", right: "#2E73A6" });
        } else {
          cubes.push({ i, j, k, top: isTop ? GRASS_TOP : SOIL_L, left: SOIL_L, right: SOIL_R });
        }
      }
    }
  }
  // stone tower on the left
  for (let k = 1; k <= 4; k++) cubes.push({ i: 2, j: 6, k, top: STONE, left: "#A9A397", right: STONE_DARK });
  // tree on the right
  cubes.push({ i: 4, j: 1, k: 1, top: "#8A5A32", left: "#7A4A26", right: "#5E3819" });
  cubes.push({ i: 4, j: 1, k: 2, top: "#8A5A32", left: "#7A4A26", right: "#5E3819" });
  for (const [i, j] of [
    [3, 0], [3, 1], [3, 2], [4, 0], [4, 1], [4, 2], [5, 0], [5, 1], [5, 2],
  ] as const) {
    cubes.push({ i, j, k: 3, top: "#3FA34D", left: "#2D7D38", right: "#1F5E29" });
  }
  cubes.push({ i: 4, j: 1, k: 4, top: "#3FA34D", left: "#2D7D38", right: "#1F5E29" });

  cubes.sort((a, b) => a.i + a.j + a.k - (b.i + b.j + b.k) || a.k - b.k);

  return (
    <g>
      <rect width={200} height={120} fill="#B4E1F2" />
      <polygon points="18,14 46,14 46,20 56,20 56,26 10,26 10,20 18,20" fill={PAPER} stroke={INK} strokeWidth={1.2} />
      <polygon points="150,10 172,10 172,16 182,16 182,22 142,22 142,16 150,16" fill={PAPER} stroke={INK} strokeWidth={1.2} />
      {cubes.map((c, n) => (
        <IsoCube
          key={n}
          x={x0 + (c.i - c.j) * s - s}
          y={y0 + (c.i + c.j) * h - c.k * s}
          s={s}
          top={c.top}
          left={c.left}
          right={c.right}
          sw={1.1}
        />
      ))}
    </g>
  );
}

export function Open77Scene() {
  const dots: ReactNode[] = [];
  for (let x = 10; x < 200; x += 18) {
    for (let y = 10; y < 120; y += 18) {
      dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={1.1} />);
    }
  }
  return (
    <g>
      <rect width={200} height={120} fill={OPEN77_NAVY} />
      <g fill={OPEN77_CYAN} opacity={0.22}>
        {dots}
      </g>
      <text
        x={100}
        y={72}
        textAnchor="middle"
        fontSize={34}
        fill="#EAF6F8"
        textLength={156}
        lengthAdjust="spacingAndGlyphs"
        style={{ fontFamily: "var(--font-display)", fontWeight: 850 }}
      >
        OPEN<tspan fill={OPEN77_CYAN}>//</tspan>77
      </text>
      <rect x={76} y={84} width={48} height={3} rx={1.5} fill={OPEN77_CYAN} opacity={0.8} />
    </g>
  );
}

export function StandaloneScene() {
  return (
    <g>
      <rect width={200} height={120} fill="#1B1E29" />
      <text x={16} y={24} fontSize={10} fill="#8C93A6" style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
        $ lua main.lua
      </text>
      <text x={16} y={38} fontSize={10} fill="#5E6578" style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
        [events] ready
      </text>
      <text x={18} y={96} fontSize={54} fill={PAPER} style={{ fontFamily: "var(--font-mono)", fontWeight: 800 }}>
        {">"}
        <tspan fill={SUN}>_</tspan>
      </text>
    </g>
  );
}

/** Two-letter monogram: OpenResty → OR, Defold → Df, Neovim → Nv, LÖVE → LÖ. */
export function monogram(name: string): string {
  const letters = Array.from(name.trim()).filter((ch) => /\p{L}/u.test(ch));
  if (letters.length === 0) return "?";
  const first = letters[0]!.toUpperCase();
  const capital = letters.slice(1).find((ch) => ch === ch.toUpperCase() && ch !== ch.toLowerCase());
  if (capital) return first + capital;
  const consonant = letters.slice(1).find((ch) => /[bcdfghjklmnpqrstvwxz]/i.test(ch));
  return first + (consonant ?? letters[1] ?? "").toLowerCase();
}

function MonogramScene({ name }: { name: string }) {
  return (
    <g>
      <rect width={200} height={120} fill={CREAM} />
      <rect x={19} y={17} width={168} height={92} rx={12} fill={INK} />
      <rect x={14} y={12} width={168} height={92} rx={12} fill={PAPER} stroke={INK} strokeWidth={4} />
      <text
        x={98}
        y={78}
        textAnchor="middle"
        fontSize={52}
        fill={INK}
        style={{ fontFamily: "var(--font-display)", fontWeight: 850, letterSpacing: "-0.03em" }}
      >
        {monogram(name)}
      </text>
    </g>
  );
}

const SCENES: Record<string, () => ReactNode> = {
  standalone: StandaloneScene,
  lua: StandaloneScene,
  love2d: LoveScene,
  love: LoveScene,
  godot: GodotScene,
  luanti: LuantiScene,
  open77: Open77Scene,
};

export function EnvironmentArt({
  slug,
  name,
  className,
  title,
}: {
  slug: string;
  name: string;
  className?: string;
  title?: string;
}) {
  const Scene = SCENES[slug];
  return (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" className={className} {...svgA11y(title)}>
      {title ? <title>{title}</title> : null}
      {Scene ? <Scene /> : <MonogramScene name={name} />}
    </svg>
  );
}
