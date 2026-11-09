/* Hero composition: one Lua badge, four environment windows. */
import type { ReactNode } from "react";
import { GodotScene, LoveScene, LuantiScene, StandaloneScene } from "./environment-art";
import { Sparkle, StickerLabel, Tick } from "./parts";
import { INK, PAPER, SUN, svgA11y, r1 } from "./palette";

function Win({
  x,
  y,
  w,
  h,
  rot,
  label,
  labelW,
  labelFill = PAPER,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  label: ReactNode;
  labelW: number;
  labelFill?: string;
  children: ReactNode;
}) {
  const bar = 24;
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x + 7} y={y + 7} width={w} height={h} rx={10} fill={INK} />
      <rect x={x} y={y} width={w} height={h} rx={10} fill={PAPER} />
      <svg
        x={x + 2}
        y={y + bar}
        width={w - 4}
        height={h - bar - 2}
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid slice"
      >
        {children}
      </svg>
      <line x1={x} y1={y + bar} x2={x + w} y2={y + bar} stroke={INK} strokeWidth={3} />
      <g fill={PAPER} stroke={INK} strokeWidth={2}>
        <circle cx={x + w - 16} cy={y + 12} r={4.5} />
        <circle cx={x + w - 31} cy={y + 12} r={4.5} />
        <circle cx={x + w - 46} cy={y + 12} r={4.5} />
      </g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill="none" stroke={INK} strokeWidth={4} />
      <StickerLabel x={x + 14} y={y - 16} w={labelW} h={30} size={17} fill={labelFill} rotate={-4}>
        {label}
      </StickerLabel>
    </g>
  );
}

function Arrow({ s, c, e }: { s: [number, number]; c: [number, number]; e: [number, number] }) {
  const a = Math.atan2(e[1] - c[1], e[0] - c[0]);
  const L = 15;
  const k = 0.6;
  const p1 = [r1(e[0] - L * Math.cos(a - k)), r1(e[1] - L * Math.sin(a - k))];
  const p2 = [r1(e[0] - L * Math.cos(a + k)), r1(e[1] - L * Math.sin(a + k))];
  const d = `M${s[0]} ${s[1]}Q${c[0]} ${c[1]} ${e[0]} ${e[1]}M${p1[0]} ${p1[1]}L${e[0]} ${e[1]}L${p2[0]} ${p2[1]}`;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={PAPER} strokeWidth={12} />
      <path d={d} stroke={INK} strokeWidth={5.5} />
    </g>
  );
}

export function HeroScene({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 640 500" className={className} {...svgA11y(title)}>
      {title ? <title>{title}</title> : null}
      <Win x={16} y={58} w={222} h={160} rot={-5} label="GODOT" labelW={84}>
        <GodotScene />
      </Win>
      <Win x={326} y={22} w={292} h={200} rot={3} label="LUA" labelW={64} labelFill={SUN}>
        <StandaloneScene />
      </Win>
      <Win x={12} y={296} w={226} h={168} rot={-3} label="LÖVE" labelW={74}>
        <LoveScene />
      </Win>
      <Win x={392} y={282} w={236} h={180} rot={4} label="LUANTI" labelW={94}>
        <LuantiScene />
      </Win>

      <Arrow s={[262, 214]} c={[236, 200]} e={[222, 178]} />
      <Arrow s={[372, 206]} c={[392, 188]} e={[396, 162]} />
      <Arrow s={[260, 318]} c={[236, 330]} e={[226, 352]} />
      <Arrow s={[378, 314]} c={[402, 322]} e={[420, 342]} />

      <Tick x1={296} y1={186} x2={290} y2={172} />
      <Tick x1={318} y1={180} x2={318} y2={165} />
      <Tick x1={340} y1={184} x2={347} y2={171} />
      <Tick x1={300} y1={344} x2={295} y2={357} />
      <Tick x1={322} y1={348} x2={323} y2={362} />
      <Tick x1={344} y1={343} x2={351} y2={355} />

      <g transform="rotate(-5 318 262)">
        <rect x={252} y={198} width={140} height={136} rx={16} fill={INK} />
        <rect x={246} y={192} width={140} height={136} rx={16} fill="#FFF4D6" stroke={INK} strokeWidth={4} />
        <rect x={292} y={204} width={48} height={30} rx={8} fill={PAPER} stroke={INK} strokeWidth={3} />
        <text
          x={316}
          y={226}
          textAnchor="middle"
          fontSize={19}
          fill={INK}
          style={{ fontFamily: "var(--font-mono)", fontWeight: 800 }}
        >
          {"</>"}
        </text>
        <text
          x={316}
          y={276}
          textAnchor="middle"
          fontSize={44}
          fill={INK}
          style={{ fontFamily: "var(--font-display)", fontWeight: 850, letterSpacing: "-0.03em" }}
        >
          Lua
        </text>
        <g
          fontSize={15.5}
          fill={INK}
          textAnchor="middle"
          style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontStyle: "italic" }}
        >
          <text x={316} y={299}>
            One script,
          </text>
          <text x={316} y={316}>
            many worlds.
          </text>
        </g>
      </g>

      <Sparkle x={292} y={34} r={11} />
      <Sparkle x={622} y={252} r={8} />
      <Sparkle x={250} y={478} r={8} />
    </svg>
  );
}
