/* Package covers: one original scene per category, 320 x 160, full bleed. */
import type { ReactNode } from "react";
import type { Category } from "@/lib/contract";
import { CoinStack, IsoCube, Poly, SatelliteDish, Sparkle } from "./parts";
import {
  COBALT,
  DIRT_DARK,
  INK,
  PAPER,
  RED,
  SUN,
  SUN_DARK,
  TEAL,
  svgA11y,
} from "./palette";

const LABELS: Record<Category, string> = {
  inventory: "Inventory",
  permissions: "Permissions",
  economy: "Economy",
  events: "Events",
  ui: "UI",
  admin: "Admin",
  framework: "Framework",
  vehicles: "Vehicles",
  housing: "Housing",
  quests: "Quests",
  library: "Library",
  other: "Other",
};

export function categoryLabel(category: Category): string {
  return LABELS[category] ?? "Other";
}

function Stars({ list, fill = PAPER }: { list: [number, number, number?][]; fill?: string }) {
  return (
    <g fill={fill}>
      {list.map(([x, y, r], n) => (
        <circle key={n} cx={x} cy={y} r={r ?? 1.6} />
      ))}
    </g>
  );
}

function Inventory() {
  return (
    <>
      <rect width={320} height={160} fill="#133B4C" />
      <Stars list={[[30, 24], [70, 14], [228, 14], [292, 46], [18, 62, 1.2], [118, 26, 1.2], [200, 30, 1.2]]} />
      <circle cx={268} cy={34} r={12} fill="#F3E9C9" stroke={INK} strokeWidth={2.5} />
      <polygon points="0,128 320,118 320,160 0,160" fill="#0B2733" stroke={INK} strokeWidth={2.5} />
      <g stroke={INK} strokeWidth={3} strokeLinejoin="round">
        <polygon points="96,60 116,48 240,48 240,120 220,134 96,134" fill={INK} stroke="none" transform="translate(6 5)" />
        <polygon points="220,60 240,48 240,120 220,134" fill="#3B6878" />
        <polygon points="220,60 240,48 240,72 220,84" fill="#4E7E8E" />
        <polygon points="96,60 116,48 240,48 220,60" fill="#A6D2DD" />
        <rect x={96} y={60} width={124} height={74} fill="#6E9FB0" />
        <rect x={96} y={60} width={124} height={24} fill="#86B6C5" />
        <rect x={114} y={60} width={10} height={74} fill="#4E7E8E" />
        <rect x={192} y={60} width={10} height={74} fill="#4E7E8E" />
        <rect x={148} y={74} width={22} height={24} rx={3} fill={SUN} />
        <polygon points="226,94 234,89 234,104 226,109" fill="#2C4E5B" strokeWidth={2} />
      </g>
      <circle cx={159} cy={83} r={2.8} fill={INK} />
      <rect x={158} y={84} width={2.4} height={7} fill={INK} />
      <path d="M102 68L102 126M124 52L206 52" stroke={PAPER} strokeOpacity={0.55} strokeWidth={3} strokeLinecap="round" />
    </>
  );
}

function Permissions() {
  return (
    <>
      <rect width={320} height={160} fill="#F07B2C" />
      <polygon points="40,160 112,160 262,0 190,0" fill="#F5924A" />
      <polygon points="232,160 262,160 320,98 320,66" fill="#F5924A" />
      <Sparkle x={52} y={40} r={9} fill={SUN} />
      <Sparkle x={272} y={128} r={7} fill={PAPER} />
      <g stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
        <polygon points="180,-4 194,-4 167,52 157,52" fill={COBALT} />
        <polygon points="126,-4 140,-4 163,52 153,52" fill="#4A56F0" />
        <rect x={149} y={44} width={22} height={13} rx={3} fill="#C9C3B6" />
      </g>
      <rect x={110} y={66} width={112} height={86} rx={10} fill={INK} />
      <rect x={104} y={60} width={112} height={86} rx={10} fill={PAPER} stroke={INK} strokeWidth={3} />
      <path d="M107 80L107 70Q107 63 114 63L206 63Q213 63 213 70L213 80Z" fill={SUN} />
      <line x1={104} y1={81} x2={216} y2={81} stroke={INK} strokeWidth={2.5} />
      <rect x={146} y={67} width={28} height={7} rx={3.5} fill={INK} />
      <circle cx={160} cy={60} r={6} fill="none" stroke={INK} strokeWidth={3} />
      <rect x={116} y={90} width={34} height={44} rx={4} fill="#F6B26B" stroke={INK} strokeWidth={2.5} />
      <circle cx={133} cy={106} r={7} fill={INK} />
      <path d="M120 134Q120 116 133 116Q146 116 146 134Z" fill={INK} />
      <rect x={160} y={94} width={44} height={6} rx={3} fill={INK} />
      <rect x={160} y={106} width={32} height={6} rx={3} fill="#C9C3B6" />
      <rect x={160} y={118} width={22} height={6} rx={3} fill="#C9C3B6" />
      <circle cx={202} cy={128} r={9} fill={COBALT} stroke={INK} strokeWidth={2.5} />
      <path d="M197 128L201 132L207 124" fill="none" stroke={PAPER} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function Economy() {
  return (
    <>
      <rect width={320} height={160} fill="#6A3FC9" />
      <polygon points="0,126 320,116 320,160 0,160" fill="#4F2B9F" stroke={INK} strokeWidth={2.5} />
      <Sparkle x={62} y={42} r={9} />
      <Sparkle x={270} y={34} r={7} />
      <Sparkle x={250} y={84} r={5} fill={PAPER} />
      <CoinStack cx={166} base={114} rx={25} ry={8} count={8} coinH={7} />
      <CoinStack cx={120} base={126} rx={23} ry={7.5} count={5} coinH={7} />
      <CoinStack cx={210} base={136} rx={26} ry={8.5} count={4} coinH={7} />
      <g stroke={INK} strokeWidth={2.5}>
        <ellipse cx={248} cy={140} rx={15} ry={5} fill={INK} transform="translate(3 3)" />
        <ellipse cx={248} cy={140} rx={15} ry={5} fill={SUN} />
        <circle cx={82} cy={128} r={13} fill={SUN_DARK} />
        <circle cx={80} cy={127} r={12} fill={SUN} />
        <circle cx={80} cy={127} r={7} fill="none" stroke="#FFE38A" strokeWidth={2} />
      </g>
    </>
  );
}

function Events() {
  return (
    <>
      <rect width={320} height={160} fill="#2E2A6E" />
      <rect y={76} width={320} height={26} fill="#7B4B93" />
      <rect y={100} width={320} height={22} fill="#E07A5F" />
      <Stars list={[[24, 20], [64, 40, 1.2], [110, 14], [212, 22, 1.2], [252, 12], [296, 34], [280, 62, 1.2]]} />
      <path
        d="M-2 122Q40 104 80 116Q130 98 180 114Q240 100 322 112L322 162L-2 162Z"
        fill="#1D1838"
        stroke={INK}
        strokeWidth={2.5}
      />
      <SatelliteDish x={150} y={78} scale={0.86} tilt={-30} sw={3} />
      <SatelliteDish x={262} y={110} scale={0.42} tilt={-18} sw={2.5} signal={false} />
    </>
  );
}

function Quests() {
  return (
    <>
      <rect width={320} height={160} fill="#FFB24A" />
      <circle cx={238} cy={62} r={30} fill="#FFE08A" />
      <polygon
        points="-2,114 50,78 90,104 140,70 200,108 250,84 322,110 322,162 -2,162"
        fill="#B5486A"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <SatelliteDish x={112} y={80} scale={0.74} tilt={-32} sw={3} signalColor={PAPER} />
      <path d="M-2 134Q80 118 160 128Q240 138 322 124L322 162L-2 162Z" fill="#5A2A4E" stroke={INK} strokeWidth={2.5} />
      <path d="M212 132Q226 120 240 132Z" fill="#5A2A4E" stroke={INK} strokeWidth={2.5} />
      <line x1={226} y1={128} x2={226} y2={66} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <polygon points="230,70 264,79 230,90" fill={INK} />
      <polygon points="227,67 262,76 227,88" fill={RED} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <Sparkle x={282} y={130} r={6} />
    </>
  );
}

function Monitor({ x, y, w, h, screen, children }: { x: number; y: number; w: number; h: number; screen: string; children?: ReactNode }) {
  return (
    <g>
      <rect x={x + 5} y={y + 5} width={w} height={h} rx={7} fill={INK} />
      <rect x={x} y={y} width={w} height={h} rx={7} fill="#2B2D3A" stroke={INK} strokeWidth={3} />
      <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} rx={3} fill={screen} stroke={INK} strokeWidth={2} />
      {children}
    </g>
  );
}

function Ui() {
  return (
    <>
      <rect width={320} height={160} fill="#232C80" />
      <polygon points="0,130 320,122 320,160 0,160" fill="#159A92" stroke={INK} strokeWidth={2.5} />
      <Sparkle x={42} y={34} r={7} />
      <Sparkle x={286} y={104} r={6} fill={PAPER} />
      <Monitor x={72} y={30} w={96} h={64} screen="#3FD0C4">
        <rect x={86} y={44} width={44} height={6} rx={3} fill={INK} />
        <rect x={86} y={56} width={60} height={6} rx={3} fill="#1E8F86" />
      </Monitor>
      <Monitor x={170} y={20} w={100} h={66} screen={SUN}>
        <rect x={184} y={32} width={30} height={30} rx={4} fill={PAPER} stroke={INK} strokeWidth={2} />
        <rect x={220} y={34} width={38} height={6} rx={3} fill={INK} />
        <rect x={220} y={46} width={28} height={6} rx={3} fill={SUN_DARK} />
      </Monitor>
      <rect x={154} y={128} width={18} height={10} fill="#2B2D3A" stroke={INK} strokeWidth={2.5} />
      <rect x={138} y={136} width={50} height={8} rx={3} fill="#2B2D3A" stroke={INK} strokeWidth={2.5} />
      <Monitor x={104} y={60} w={118} h={72} screen={PAPER}>
        <rect x={110} y={66} width={106} height={12} fill={COBALT} />
        <line x1={110} y1={78} x2={216} y2={78} stroke={INK} strokeWidth={2} />
        <rect x={116} y={84} width={28} height={22} rx={3} fill="#DDE2FF" stroke={INK} strokeWidth={1.5} />
        <rect x={149} y={84} width={28} height={22} rx={3} fill="#FFE38A" stroke={INK} strokeWidth={1.5} />
        <rect x={182} y={84} width={28} height={22} rx={3} fill="#DDE2FF" stroke={INK} strokeWidth={1.5} />
        <rect x={116} y={112} width={40} height={10} rx={5} fill={COBALT} stroke={INK} strokeWidth={1.5} />
        <rect x={162} y={114} width={34} height={6} rx={3} fill="#C9C1B1" />
      </Monitor>
    </>
  );
}

function Admin() {
  const grid: ReactNode[] = [];
  for (let x = 20; x < 320; x += 20) grid.push(<line key={`x${x}`} x1={x} y1={0} x2={x} y2={160} />);
  for (let y = 20; y < 160; y += 20) grid.push(<line key={`y${y}`} x1={0} y1={y} x2={320} y2={y} />);
  return (
    <>
      <rect width={320} height={160} fill="#0E3B2E" />
      <g stroke="#17533F" strokeWidth={1}>
        {grid}
      </g>
      <rect x={76} y={30} width={180} height={108} rx={9} fill={INK} />
      <rect x={70} y={24} width={180} height={108} rx={9} fill="#0A1F18" stroke={INK} strokeWidth={3.5} />
      <path d="M70 44L70 33Q70 24 79 24L241 24Q250 24 250 33L250 44Z" fill="#1F5A44" />
      <line x1={70} y1={44} x2={250} y2={44} stroke={INK} strokeWidth={3} />
      <rect x={70} y={24} width={180} height={108} rx={9} fill="none" stroke={INK} strokeWidth={3.5} />
      <g stroke={INK} strokeWidth={1.5}>
        <circle cx={84} cy={34} r={4} fill={RED} />
        <circle cx={97} cy={34} r={4} fill={SUN} />
        <circle cx={110} cy={34} r={4} fill="#5BE39A" />
      </g>
      <g fill="#5BE39A">
        <rect x={84} y={56} width={56} height={6} rx={3} />
        <rect x={146} y={56} width={36} height={6} rx={3} fill="#2FA36B" />
        <rect x={84} y={70} width={100} height={6} rx={3} />
        <rect x={84} y={84} width={40} height={6} rx={3} fill="#2FA36B" />
        <rect x={130} y={84} width={64} height={6} rx={3} />
        <rect x={84} y={98} width={78} height={6} rx={3} fill="#2FA36B" />
      </g>
      <text x={84} y={126} fontSize={18} fill={SUN} style={{ fontFamily: "var(--font-mono)", fontWeight: 800 }}>
        {">_"}
      </text>
    </>
  );
}

function Vehicles() {
  const body =
    "M86 124L86 104Q86 94 96 92L122 88L140 68Q144 64 152 64L198 64Q206 64 212 70L228 88L236 90Q246 92 246 104L246 124Z";
  return (
    <>
      <rect width={320} height={160} fill="#FF9A48" />
      <circle cx={84} cy={56} r={26} fill="#FFD979" />
      <polygon points="168,106 184,72 234,72 250,106" fill="#D35F35" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <polygon points="250,106 262,84 300,84 322,100 322,106" fill="#C2512C" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <rect x={-2} y={104} width={324} height={26} fill="#E8823F" stroke={INK} strokeWidth={2.5} />
      <rect x={-2} y={128} width={324} height={34} fill="#3B2F45" stroke={INK} strokeWidth={2.5} />
      <g fill={SUN}>
        {[16, 76, 136, 196, 256].map((x) => (
          <rect key={x} x={x} y={144} width={32} height={4} rx={2} />
        ))}
      </g>
      <path d={body} fill={INK} transform="translate(5 5)" />
      <path d={body} fill={COBALT} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <rect x={90} y={105} width={152} height={5} fill={PAPER} />
      <g stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
        <polygon points="144,71 172,71 172,88 130,88" fill="#BFE6FF" />
        <polygon points="178,71 202,71 219,88 178,88" fill="#BFE6FF" />
        <rect x={238} y={95} width={9} height={8} rx={2} fill={SUN} />
        <rect x={84} y={96} width={7} height={8} rx={2} fill={RED} />
        <rect x={80} y={115} width={16} height={9} rx={3} fill={INK} />
        <rect x={236} y={115} width={16} height={9} rx={3} fill={INK} />
      </g>
      <line x1={175} y1={90} x2={175} y2={122} stroke={INK} strokeWidth={2} />
      <rect x={180} y={95} width={10} height={3} rx={1.5} fill={INK} />
      <path d="M150 68L196 68" stroke={PAPER} strokeOpacity={0.6} strokeWidth={2.5} strokeLinecap="round" />
      {[122, 210].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={126} r={16} fill={INK} />
          <circle cx={cx} cy={126} r={8} fill="#C9C3B8" stroke={INK} strokeWidth={2} />
          <circle cx={cx} cy={126} r={2.5} fill={INK} />
        </g>
      ))}
    </>
  );
}

function Housing() {
  return (
    <>
      <rect width={320} height={160} fill="#8FD6C8" />
      <path d="M24 40Q24 30 36 30Q40 22 52 24Q62 24 64 32Q74 32 74 40Z" fill={PAPER} stroke={INK} strokeWidth={2} />
      <path d="M238 28Q238 20 248 20Q252 14 262 16Q270 16 272 22Q280 22 280 28Z" fill={PAPER} stroke={INK} strokeWidth={2} />
      <path d="M-2 112Q60 90 120 104Q200 86 322 104L322 130L-2 130Z" fill="#5FB878" stroke={INK} strokeWidth={2.5} />
      <rect x={-2} y={124} width={324} height={38} fill="#3E9B57" stroke={INK} strokeWidth={2.5} />
      <g stroke={INK} strokeLinejoin="round">
        <polygon points="96,84 228,84 228,128 96,128" fill={INK} transform="translate(5 5)" />
        <polygon points="132,52 212,52 212,86 132,86" fill={INK} transform="translate(5 5)" />
        <rect x={132} y={52} width={80} height={34} fill="#E9E1D2" strokeWidth={3} />
        <rect x={186} y={52} width={26} height={34} fill="#C98A4B" strokeWidth={2.5} />
        <path d="M193 54L193 84M200 54L200 84M207 54L207 84" stroke="#8B5A2B" strokeWidth={1.5} />
        <rect x={96} y={84} width={132} height={44} fill={PAPER} strokeWidth={3} />
        <rect x={124} y={46} width={96} height={8} rx={2} fill="#2B2A28" strokeWidth={2.5} />
        <rect x={88} y={78} width={148} height={8} rx={2} fill="#2B2A28" strokeWidth={2.5} />
        <rect x={142} y={60} width={36} height={18} fill={SUN} strokeWidth={2.5} />
        <rect x={106} y={94} width={48} height={24} fill={SUN} strokeWidth={2.5} />
        <path d="M130 94L130 118M160 60L160 78" strokeWidth={2} />
        <rect x={186} y={94} width={22} height={34} fill="#8B5A2B" strokeWidth={2.5} />
      </g>
      <circle cx={203} cy={112} r={1.8} fill={SUN} />
      <polygon points="188,128 206,128 216,162 178,162" fill="#D9CFBC" stroke={INK} strokeWidth={2} />
      {[
        [56, 92, 18],
        [266, 96, 16],
      ].map(([cx, cy, r]) => (
        <g key={cx} stroke={INK}>
          <rect x={cx! - 3} y={cy!} width={6} height={30} fill={DIRT_DARK} strokeWidth={2} />
          <circle cx={cx} cy={cy} r={r} fill="#2F7A45" strokeWidth={3} />
          <circle cx={cx! - r! * 0.35} cy={cy! - r! * 0.35} r={r! * 0.32} fill="#4FA868" stroke="none" />
        </g>
      ))}
    </>
  );
}

function Framework() {
  const s = 26;
  const h = s / 2;
  const cx = 160;
  const cy = 80;
  const blocks: { i: number; j: number; k: number; c: [string, string, string] }[] = [
    { i: 0, j: 0, k: 0, c: ["#4A56F0", COBALT, "#1D27A6"] },
    { i: 1, j: 0, k: 0, c: [SUN, "#E8AE2A", "#C48A12"] },
    { i: 0, j: 1, k: 0, c: ["#3FD0C4", TEAL, "#167A74"] },
    { i: 1, j: 1, k: 0, c: [PAPER, "#E6DDCC", "#C9BFAC"] },
    { i: 0, j: 0, k: 1, c: ["#FF7A8A", RED, "#B32436"] },
    { i: 1, j: 0, k: 1, c: ["#3FD0C4", TEAL, "#167A74"] },
    { i: 0, j: 1, k: 1, c: [SUN, "#E8AE2A", "#C48A12"] },
    { i: 0, j: 0, k: 2, c: ["#4A56F0", COBALT, "#1D27A6"] },
  ];
  blocks.sort((a, b) => a.i + a.j + a.k - (b.i + b.j + b.k) || a.k - b.k);
  return (
    <>
      <rect width={320} height={160} fill="#C2389E" />
      <polygon points="0,0 90,0 0,110" fill="#D257B0" />
      <polygon points="320,160 220,160 320,40" fill="#A82A86" />
      <Sparkle x={66} y={118} r={9} />
      <Sparkle x={254} y={40} r={8} />
      <Sparkle x={278} y={110} r={5} fill={PAPER} />
      <polygon
        points={`${cx - 2 * s},${cy + 2 * h} ${cx},${cy + 2 * h + 2 * h} ${cx + 2 * s},${cy + 2 * h} ${cx + 2 * s},${cy + 2 * h + s} ${cx},${cy + 4 * h + s} ${cx - 2 * s},${cy + 2 * h + s}`}
        fill={INK}
        transform="translate(6 5)"
      />
      {blocks.map((b, n) => (
        <IsoCube
          key={n}
          x={cx + (b.i - b.j) * s - s}
          y={cy + (b.i + b.j) * h - b.k * s}
          s={s}
          top={b.c[0]}
          left={b.c[1]}
          right={b.c[2]}
          sw={3}
        />
      ))}
    </>
  );
}

function Library() {
  const books: [number, number, number, number, string, string][] = [
    [94, 112, 132, 18, COBALT, PAPER],
    [104, 94, 114, 18, RED, SUN],
    [90, 78, 118, 16, TEAL, PAPER],
    [110, 62, 100, 16, PAPER, COBALT],
    [122, 48, 76, 14, "#7B4FC9", SUN],
  ];
  return (
    <>
      <rect width={320} height={160} fill="#F2B03F" />
      <g fill="#E8A131">
        {[0, 40, 80, 120, 160, 200, 240, 280].map((x) => (
          <rect key={x} x={x} y={0} width={20} height={130} />
        ))}
      </g>
      <rect x={-2} y={130} width={324} height={32} fill="#B9682A" stroke={INK} strokeWidth={2.5} />
      <Sparkle x={48} y={40} r={8} fill={PAPER} />
      <Sparkle x={272} y={56} r={7} fill={PAPER} />
      <g fill={INK}>
        {books.map(([x, y, w, hh], n) => (
          <rect key={n} x={x + 5} y={y + 4} width={w} height={hh} rx={3} />
        ))}
      </g>
      {books.map(([x, y, w, hh, fill, band], n) => (
        <g key={n} stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
          <rect x={x} y={y} width={w} height={hh} rx={3} fill={fill} />
          <rect x={x + 12} y={y + 2} width={5} height={hh - 4} fill={band} strokeWidth={1.5} />
          <rect x={x + w - 17} y={y + 2} width={5} height={hh - 4} fill={band} strokeWidth={1.5} />
          <rect x={x + w / 2 - 16} y={y + hh / 2 - 3} width={32} height={6} rx={2} fill={PAPER} strokeWidth={1.5} />
        </g>
      ))}
      <circle cx={176} cy={38} r={9} fill={RED} stroke={INK} strokeWidth={2.5} />
      <path d="M176 29Q178 22 184 22Q182 28 176 29Z" fill="#3FA34D" stroke={INK} strokeWidth={1.5} />
    </>
  );
}

function Other() {
  return (
    <>
      <rect width={320} height={160} fill={COBALT} />
      <g fill="#4250F2">
        <polygon points="160,90 0,0 70,0" />
        <polygon points="160,90 130,0 196,0" />
        <polygon points="160,90 256,0 320,0 320,20" />
        <polygon points="160,90 320,74 320,124" />
        <polygon points="160,90 0,96 0,150" />
      </g>
      <Sparkle x={58} y={110} r={9} />
      <Sparkle x={268} y={40} r={7} />
      <polygon points="96,62 160,30 224,62 224,116 160,148 96,116" fill={INK} />
      <g transform="translate(-5 -5)">
        <Poly p={[[96, 62], [160, 94], [160, 148], [96, 116]]} fill="#D29A5C" sw={3} />
        <Poly p={[[160, 94], [224, 62], [224, 116], [160, 148]]} fill="#B07A40" sw={3} />
        <Poly p={[[96, 62], [160, 30], [224, 62], [160, 94]]} fill="#E8B57A" sw={3} />
        <Poly p={[[122, 49], [134, 43], [198, 75], [186, 81]]} fill="#F5D9A8" sw={2} />
        <Poly p={[[186, 81], [198, 75], [198, 129], [186, 135]]} fill="#F5D9A8" sw={2} />
        <Poly p={[[108, 86], [140, 102], [140, 122], [108, 106]]} fill={PAPER} sw={2} />
        <path d="M114 96L132 105M114 103L126 109" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      </g>
    </>
  );
}

const SCENES: Record<Category, () => ReactNode> = {
  inventory: Inventory,
  permissions: Permissions,
  economy: Economy,
  events: Events,
  quests: Quests,
  ui: Ui,
  admin: Admin,
  vehicles: Vehicles,
  housing: Housing,
  framework: Framework,
  library: Library,
  other: Other,
};

export function CategoryCover({
  category,
  className,
  title,
}: {
  category: Category;
  className?: string;
  title?: string;
}) {
  const Scene = SCENES[category] ?? Other;
  return (
    <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice" className={className} {...svgA11y(title)}>
      {title ? <title>{title}</title> : null}
      <Scene />
    </svg>
  );
}
