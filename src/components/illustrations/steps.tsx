/* "How it works" step illustrations: build, adapt, monetize. */
import type { ReactNode } from "react";
import { CoinStack } from "./parts";
import { COBALT, INK, PAPER, RED, SUN, svgA11y } from "./palette";

const BEIGE = "#EFE6D4";
const BEIGE_DARK = "#D9CDB6";

function Frame({ className, title, children }: { className?: string; title?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 200 140" className={className} {...svgA11y(title)}>
      {title ? <title>{title}</title> : null}
      <g strokeLinejoin="round" strokeLinecap="round">
        {children}
      </g>
    </svg>
  );
}

export function StepBuildArt({ className, title }: { className?: string; title?: string }) {
  const keys: ReactNode[] = [];
  for (let c = 0; c < 8; c++) {
    keys.push(<rect key={`a${c}`} x={57 + c * 12} y={112} width={9} height={4} rx={1} />);
    keys.push(<rect key={`b${c}`} x={53 + c * 12.6} y={119} width={9.5} height={4} rx={1} />);
  }
  return (
    <Frame className={className} title={title}>
      <path
        d="M14 120Q6 120 8 110Q6 98 22 98Q26 86 42 88Q56 88 58 100Q70 100 68 112Q68 120 60 120Z"
        fill="#E6DDCC"
        stroke={INK}
        strokeWidth={3}
      />
      <rect x={61} y={19} width={96} height={78} rx={10} fill={INK} />
      <rect x={56} y={14} width={96} height={78} rx={10} fill={BEIGE} stroke={INK} strokeWidth={3.5} />
      <rect x={66} y={24} width={76} height={50} rx={6} fill="#1C1F2B" stroke={INK} strokeWidth={3} />
      <path d="M72 32L80 32M72 38L76 38" stroke={PAPER} strokeOpacity={0.5} strokeWidth={2.5} />
      <text
        x={104}
        y={57}
        textAnchor="middle"
        fontSize={21}
        fill={PAPER}
        style={{ fontFamily: "var(--font-mono)", fontWeight: 800 }}
      >
        {"</>"}
      </text>
      <path d="M70 84L92 84" stroke={BEIGE_DARK} strokeWidth={3} />
      <circle cx={137} cy={83} r={3} fill={SUN} stroke={INK} strokeWidth={1.5} />
      <polygon points="90,92 118,92 122,102 86,102" fill={BEIGE_DARK} stroke={INK} strokeWidth={3} />
      <polygon points="56,111 158,111 168,131 46,131" fill={INK} />
      <polygon points="52,106 154,106 164,126 42,126" fill={BEIGE} stroke={INK} strokeWidth={3.5} />
      <g fill={BEIGE_DARK} stroke={INK} strokeWidth={1.2}>
        {keys}
      </g>
    </Frame>
  );
}

function AppWindow({ x, y, w, h, fill, children }: { x: number; y: number; w: number; h: number; fill: string; children?: ReactNode }) {
  return (
    <g>
      <rect x={x + 5} y={y + 5} width={w} height={h} rx={8} fill={INK} />
      <rect x={x} y={y} width={w} height={h} rx={8} fill={fill} stroke={INK} strokeWidth={3} />
      <line x1={x} y1={y + 15} x2={x + w} y2={y + 15} stroke={INK} strokeWidth={2.5} />
      <g fill={PAPER} stroke={INK} strokeWidth={1.5}>
        <circle cx={x + 9} cy={y + 7.5} r={3} />
        <circle cx={x + 19} cy={y + 7.5} r={3} />
        <circle cx={x + 29} cy={y + 7.5} r={3} />
      </g>
      {children}
    </g>
  );
}

export function StepAdaptArt({ className, title }: { className?: string; title?: string }) {
  return (
    <Frame className={className} title={title}>
      <AppWindow x={30} y={8} w={110} h={68} fill={PAPER}>
        <rect x={40} y={32} width={50} height={6} rx={3} fill="#C9C1B1" />
        <rect x={40} y={44} width={70} height={6} rx={3} fill="#C9C1B1" />
      </AppWindow>
      <AppWindow x={60} y={26} w={114} h={70} fill="#DDE2FF">
        <rect x={70} y={50} width={40} height={30} rx={4} fill={COBALT} stroke={INK} strokeWidth={2} />
        <rect x={116} y={50} width={48} height={6} rx={3} fill={COBALT} />
        <rect x={116} y={62} width={36} height={6} rx={3} fill="#9AA3F5" />
        <rect x={116} y={74} width={42} height={6} rx={3} fill="#9AA3F5" />
      </AppWindow>
      <path
        d="M66 102Q66 90 80 90L128 90Q142 90 142 102L150 122Q152 134 140 134Q132 134 126 124L82 124Q76 134 68 134Q56 134 58 122Z"
        fill={INK}
        transform="translate(4 4)"
      />
      <path
        d="M66 102Q66 90 80 90L128 90Q142 90 142 102L150 122Q152 134 140 134Q132 134 126 124L82 124Q76 134 68 134Q56 134 58 122Z"
        fill={PAPER}
        stroke={INK}
        strokeWidth={3.5}
      />
      <path d="M76 107L88 107M82 101L82 113" stroke={INK} strokeWidth={4.5} />
      <circle cx={120} cy={101} r={4} fill={COBALT} stroke={INK} strokeWidth={1.5} />
      <circle cx={129} cy={109} r={4} fill={SUN} stroke={INK} strokeWidth={1.5} />
      <circle cx={111} cy={109} r={4} fill={RED} stroke={INK} strokeWidth={1.5} />
      <circle cx={120} cy={117} r={4} fill="#3FB37F" stroke={INK} strokeWidth={1.5} />
    </Frame>
  );
}

export function StepMonetizeArt({ className, title }: { className?: string; title?: string }) {
  const stripes: ReactNode[] = [];
  const scallops: ReactNode[] = [];
  const n = 8;
  for (let i = 0; i < n; i++) {
    const fill = i % 2 === 0 ? COBALT : PAPER;
    const t0 = 32 + i * 17;
    const t1 = t0 + 17;
    const b0 = 22 + i * 19.5;
    const b1 = b0 + 19.5;
    stripes.push(<polygon key={`s${i}`} points={`${t0},26 ${t1},26 ${b1},50 ${b0},50`} fill={fill} />);
    scallops.push(
      <path
        key={`c${i}`}
        d={`M${b0} 50A9.75 8 0 0 0 ${b1} 50Z`}
        fill={fill}
        stroke={INK}
        strokeWidth={2.5}
      />,
    );
  }
  return (
    <Frame className={className} title={title}>
      <rect x={45} y={45} width={112} height={80} rx={4} fill={INK} />
      <rect x={40} y={40} width={112} height={80} rx={4} fill={PAPER} stroke={INK} strokeWidth={3.5} />
      <rect x={50} y={66} width={42} height={30} rx={3} fill="#CFE3F7" stroke={INK} strokeWidth={3} />
      <path d="M71 66L71 96M50 81L92 81" stroke={INK} strokeWidth={2} />
      <rect x={102} y={68} width={30} height={52} rx={3} fill={COBALT} stroke={INK} strokeWidth={3} />
      <circle cx={126} cy={95} r={2.5} fill={SUN} stroke={INK} strokeWidth={1} />
      <polygon points="32,26 168,26 178,50 22,50" fill={INK} transform="translate(4 4)" />
      {stripes}
      {scallops}
      <polygon points="32,26 168,26 178,50 22,50" fill="none" stroke={INK} strokeWidth={3.5} />
      <rect x={28} y={18} width={144} height={10} rx={4} fill={INK} />
      <path d="M14 123L188 123" stroke={INK} strokeWidth={3.5} />
      <CoinStack cx={44} base={128} rx={15} ry={5} count={3} coinH={6} />
      <CoinStack cx={150} base={126} rx={19} ry={6.5} count={6} coinH={7} />
      <CoinStack cx={178} base={130} rx={14} ry={5} count={3} coinH={6} />
    </Frame>
  );
}
