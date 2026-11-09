/* Explore page header art: a satellite dish on a rocky outcrop. */
import { SatelliteDish, Sparkle } from "./parts";
import { INK, SUN, PAPER, svgA11y } from "./palette";

export function ExploreArt({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 520 240" className={className} {...svgA11y(title)}>
      {title ? <title>{title}</title> : null}
      <polygon points="176,26 520,0 520,204 128,226" fill={SUN} />
      <polygon points="40,122 72,106 64,150 32,166" fill={SUN} />
      <SatelliteDish x={352} y={126} scale={1.45} tilt={-30} sw={4} signalColor={INK} />
      <g strokeLinejoin="round">
        <polygon
          points="222,242 256,196 290,182 330,190 362,170 404,178 438,156 488,172 522,186 522,242"
          fill={INK}
        />
        <g fill="#2E2A23">
          <polygon points="290,182 330,190 312,222 278,230" />
          <polygon points="404,178 438,156 430,200 396,212" />
          <polygon points="488,172 522,186 522,214 492,206" />
        </g>
        <polygon points="170,242 186,222 206,226 216,242" fill={INK} />
      </g>
      <Sparkle x={150} y={70} r={10} fill={PAPER} />
      <Sparkle x={470} y={40} r={8} fill={PAPER} />
    </svg>
  );
}
