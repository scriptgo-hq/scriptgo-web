/* Shared drawing helpers for the illustrations (internal, not re-exported). */
import type { ReactNode } from "react";
import { INK, PAPER, SUN, SUN_DARK, SUN_LIGHT, r1 } from "./palette";

const pts = (list: number[][]) => list.map(([x, y]) => `${r1(x!)},${r1(y!)}`).join(" ");

/** Polygon with an optional hard offset shadow drawn first. */
export function Poly({
  p,
  fill,
  sw = 3,
  shadow = false,
  dx = 4,
  dy = 4,
}: {
  p: number[][];
  fill: string;
  sw?: number;
  shadow?: boolean;
  dx?: number;
  dy?: number;
}) {
  return (
    <>
      {shadow ? <polygon points={pts(p.map(([x, y]) => [x! + dx, y! + dy]))} fill={INK} /> : null}
      <polygon points={pts(p)} fill={fill} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
    </>
  );
}

/**
 * Isometric cube. (x, y) is the left corner of the top face; s is the half-width (= side height).
 */
export function IsoCube({
  x,
  y,
  s,
  top,
  left,
  right,
  sw = 1.5,
}: {
  x: number;
  y: number;
  s: number;
  top: string;
  left: string;
  right: string;
  sw?: number;
}) {
  const h = s / 2;
  return (
    <g stroke={INK} strokeWidth={sw} strokeLinejoin="round">
      <polygon points={pts([[x, y], [x + s, y + h], [x + s, y + h + s], [x, y + s]])} fill={left} />
      <polygon points={pts([[x + s, y + h], [x + 2 * s, y], [x + 2 * s, y + s], [x + s, y + h + s]])} fill={right} />
      <polygon points={pts([[x, y], [x + s, y - h], [x + 2 * s, y], [x + s, y + h]])} fill={top} />
    </g>
  );
}

/** A stack of coins seen slightly from above. */
export function CoinStack({
  cx,
  base,
  rx,
  ry,
  count,
  coinH = 7,
  side = SUN_DARK,
  top = SUN,
  rim = SUN_LIGHT,
  sw = 3,
  shadow = true,
}: {
  cx: number;
  base: number;
  rx: number;
  ry: number;
  count: number;
  coinH?: number;
  side?: string;
  top?: string;
  rim?: string;
  sw?: number;
  shadow?: boolean;
}) {
  const topY = base - count * coinH;
  const body = `M${r1(cx - rx)} ${r1(topY)}L${r1(cx - rx)} ${r1(base)}A${rx} ${ry} 0 0 0 ${r1(cx + rx)} ${r1(base)}L${r1(cx + rx)} ${r1(topY)}Z`;
  const ridges: ReactNode[] = [];
  for (let k = 1; k < count; k++) {
    const y = r1(base - k * coinH);
    ridges.push(
      <path
        key={k}
        d={`M${r1(cx - rx)} ${y}A${rx} ${ry} 0 0 0 ${r1(cx + rx)} ${y}`}
        fill="none"
        stroke={INK}
        strokeWidth={sw * 0.5}
      />,
    );
  }
  return (
    <g>
      {shadow ? (
        <g transform="translate(4 4)" fill={INK}>
          <path d={body} />
          <ellipse cx={cx} cy={topY} rx={rx} ry={ry} />
        </g>
      ) : null}
      <path d={body} fill={side} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      {ridges}
      <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill={top} stroke={INK} strokeWidth={sw} />
      <ellipse cx={cx} cy={topY} rx={r1(rx * 0.6)} ry={r1(ry * 0.6)} fill="none" stroke={rim} strokeWidth={sw * 0.7} />
      <path
        d={`M${r1(cx - rx * 0.75)} ${r1(topY + coinH * 0.9)}L${r1(cx - rx * 0.75)} ${r1(base - 2)}`}
        stroke={PAPER}
        strokeOpacity={0.55}
        strokeWidth={sw * 0.8}
        strokeLinecap="round"
      />
    </g>
  );
}

/** Satellite dish on a pedestal. (x, y) is the rim centre; tilt in degrees. */
export function SatelliteDish({
  x,
  y,
  scale = 1,
  tilt = -28,
  dish = PAPER,
  dishDark = "#C9C2B2",
  metal = "#8F8A9C",
  metalDark = "#5E5A6E",
  sw = 3,
  signal = true,
  signalColor = SUN,
}: {
  x: number;
  y: number;
  scale?: number;
  tilt?: number;
  dish?: string;
  dishDark?: string;
  metal?: string;
  metalDark?: string;
  sw?: number;
  signal?: boolean;
  signalColor?: string;
}) {
  const s = sw / scale;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} strokeLinejoin="round" strokeLinecap="round">
      {/* pedestal */}
      <polygon points="-12,22 12,22 20,74 -20,74" fill={INK} transform="translate(4 4)" />
      <polygon points="-12,22 12,22 20,74 -20,74" fill={metal} stroke={INK} strokeWidth={s} />
      <path d="M-4 30L-6 70" stroke={PAPER} strokeOpacity={0.5} strokeWidth={s * 0.8} />
      <rect x={-34} y={72} width={68} height={12} rx={3} fill={metalDark} stroke={INK} strokeWidth={s} />
      <circle cx={0} cy={20} r={9} fill={metalDark} stroke={INK} strokeWidth={s} />
      <g transform={`rotate(${tilt})`}>
        <path d="M-46 0Q0 52 46 0Z" fill={INK} transform="translate(4 4)" />
        <path d="M-46 0Q0 52 46 0Z" fill={dishDark} stroke={INK} strokeWidth={s} />
        <ellipse cx={0} cy={0} rx={46} ry={15} fill={dish} stroke={INK} strokeWidth={s} />
        <ellipse cx={0} cy={1} rx={30} ry={9} fill="none" stroke={dishDark} strokeWidth={s * 0.7} />
        <path d="M-40 -3L0 -44M40 -3L0 -44" stroke={INK} strokeWidth={s * 0.6} fill="none" />
        <path d="M0 0L0 -44" stroke={INK} strokeWidth={s} />
        <rect x={-7} y={-54} width={14} height={11} rx={2} fill={SUN} stroke={INK} strokeWidth={s} />
        {signal ? (
          <g fill="none" stroke={signalColor} strokeWidth={s * 1.1}>
            <path d="M-10 -62Q0 -68 10 -62" />
            <path d="M-17 -72Q0 -81 17 -72" />
            <path d="M-24 -82Q0 -94 24 -82" />
          </g>
        ) : null}
      </g>
    </g>
  );
}

/** Outlined sun-yellow dash (sparkle tick). */
export function Tick({ x1, y1, x2, y2, w = 5 }: { x1: number; y1: number; x2: number; y2: number; w?: number }) {
  return (
    <g strokeLinecap="round">
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={w + 3.5} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={SUN} strokeWidth={w} />
    </g>
  );
}

/** Four-point sparkle star. */
export function Sparkle({ x, y, r, fill = SUN, sw = 2 }: { x: number; y: number; r: number; fill?: string; sw?: number }) {
  const k = r * 0.28;
  const d = `M${x} ${y - r}Q${x + k} ${y - k} ${x + r} ${y}Q${x + k} ${y + k} ${x} ${y + r}Q${x - k} ${y + k} ${x - r} ${y}Q${x - k} ${y - k} ${x} ${y - r}Z`;
  return <path d={d} fill={fill} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />;
}

/** Pixel heart, 7 x 6 cells. */
export function PixelHeart({ x, y, u, fill, sw = 1.2 }: { x: number; y: number; u: number; fill: string; sw?: number }) {
  const cells = [
    [1, 0], [3, 0], [3, 1], [4, 1], [4, 0], [6, 0], [6, 1], [7, 1], [7, 3], [6, 3], [6, 4], [5, 4], [5, 5],
    [4, 5], [4, 6], [3, 6], [3, 5], [2, 5], [2, 4], [1, 4], [1, 3], [0, 3], [0, 1], [1, 1],
  ];
  return (
    <polygon
      points={pts(cells.map(([cx, cy]) => [x + cx! * u, y + cy! * u]))}
      fill={fill}
      stroke={INK}
      strokeWidth={sw}
      strokeLinejoin="round"
    />
  );
}

/** Rounded sticker capsule with a label, text forced to fit. */
export function StickerLabel({
  x,
  y,
  w,
  h = 26,
  text,
  fill = PAPER,
  color = INK,
  rotate = 0,
  size = 15,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  text?: string;
  fill?: string;
  color?: string;
  rotate?: number;
  size?: number;
  children?: ReactNode;
}) {
  return (
    <g transform={`rotate(${rotate} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x + 3} y={y + 3} width={w} height={h} rx={6} fill={INK} />
      <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} stroke={INK} strokeWidth={3} />
      <text
        x={x + w / 2}
        y={y + h / 2 + size * 0.36}
        textAnchor="middle"
        fontSize={size}
        fill={color}
        textLength={w - 18}
        lengthAdjust="spacingAndGlyphs"
        style={{ fontFamily: "var(--font-display)", fontWeight: 850 }}
      >
        {children ?? text}
      </text>
    </g>
  );
}
