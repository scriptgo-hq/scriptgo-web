/* Open cardboard box line drawing for the creator call-to-action band. */
import { CREAM, INK, PAPER, svgA11y } from "./palette";

export function CreatorBoxArt({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} {...svgA11y(title)}>
      {title ? <title>{title}</title> : null}
      <g stroke={INK} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round">
        <polygon points="24,52 64,70 104,52 104,94 64,112 24,94" fill={INK} stroke="none" transform="translate(5 4)" />
        <polygon points="20,48 60,30 52,12 10,30" fill={CREAM} />
        <polygon points="60,30 100,48 112,30 70,12" fill={PAPER} />
        <polygon points="20,48 60,30 100,48 60,66" fill="#3A3227" />
        <polygon points="20,48 60,30 60,40 30,53" fill="#5A4E3C" strokeWidth={0} />
        <polygon points="20,48 60,66 60,106 20,88" fill={PAPER} />
        <polygon points="60,66 100,48 100,88 60,106" fill="#EFE6D4" />
        <polygon points="20,48 60,66 46,76 6,58" fill={CREAM} />
        <polygon points="60,66 100,48 114,58 74,76" fill={PAPER} />
        <path d="M32 82L48 89M32 74L42 78.5" strokeWidth={2.5} />
      </g>
    </svg>
  );
}
