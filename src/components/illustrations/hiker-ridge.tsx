/* Hiker on a ridge, for the cobalt footer band. */
import { Sparkle } from "./parts";
import { COBALT_DARK, INK, PAPER, svgA11y } from "./palette";

export function HikerRidgeArt({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 300 260" className={className} {...svgA11y(title)}>
      {title ? <title>{title}</title> : null}
      <g strokeLinejoin="round" strokeLinecap="round">
        <Sparkle x={42} y={58} r={9} />
        <Sparkle x={252} y={44} r={7} />
        <g fill={PAPER} opacity={0.85}>
          <circle cx={96} cy={30} r={1.8} />
          <circle cx={208} cy={22} r={1.5} />
          <circle cx={282} cy={86} r={1.5} />
        </g>
        {/* far range */}
        <polygon
          points="-2,196 36,130 66,152 96,82 128,140 188,138 228,92 262,128 302,110 302,262 -2,262"
          fill="#5A66FF"
          stroke={INK}
          strokeWidth={2.5}
        />
        <polygon points="96,82 84,100 93,97 99,104 106,96 113,100" fill={PAPER} stroke={INK} strokeWidth={2} />
        <polygon points="228,92 216,108 225,105 231,111 238,104 244,108" fill={PAPER} stroke={INK} strokeWidth={2} />
        <polygon points="36,130 28,142 35,139 41,144 47,139" fill={PAPER} stroke={INK} strokeWidth={2} />
        {/* mid range */}
        <polygon
          points="-2,216 60,172 110,198 170,154 240,202 302,186 302,262 -2,262"
          fill={COBALT_DARK}
          stroke={INK}
          strokeWidth={2.5}
        />
        {/* ridge */}
        <polygon
          points="-2,262 -2,236 60,206 104,186 128,168 150,160 176,166 200,184 236,210 302,236 302,262"
          fill={INK}
        />
        <g fill="#2E2A23">
          <polygon points="128,168 150,160 138,196 112,206" />
          <polygon points="176,166 200,184 186,214 168,190" />
          <polygon points="60,206 104,186 88,226 40,236" />
          <polygon points="236,210 280,228 250,246" />
        </g>
        {/* hiker */}
        <g fill={INK}>
          <polygon points="141,126 151,126 147,160 137,160" />
          <polygon points="151,126 161,126 166,160 156,160" />
          <rect x={133} y={155} width={15} height={7} rx={2} />
          <rect x={154} y={155} width={15} height={7} rx={2} />
          <polygon points="139,94 161,94 162,130 140,130" />
          <rect x={125} y={92} width={18} height={34} rx={6} />
          <rect x={122} y={85} width={22} height={9} rx={4.5} />
          <circle cx={152} cy={84} r={9} />
          <path d="M142 82Q143 71 153 71Q163 72 163 82Z" />
          <path d="M160 81L170 82" stroke={INK} strokeWidth={3.5} />
          <polygon points="156,96 163,96 173,120 167,123" />
          <path d="M170 116L180 162" stroke={INK} strokeWidth={3} />
        </g>
        <path d="M128 98L128 120" stroke="#5A66FF" strokeWidth={2} opacity={0.9} />
        <path d="M145 76Q148 73 153 73" stroke="#5A66FF" strokeWidth={2} fill="none" opacity={0.9} />
      </g>
    </svg>
  );
}
