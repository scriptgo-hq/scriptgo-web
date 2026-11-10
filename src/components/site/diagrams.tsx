import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { StatusMeta } from "@/lib/status";
import { Art } from "./ink";

/**
 * Pictures instead of paragraphs: a flow of illustrated steps joined by hand-drawn arrows, a card
 * that makes one point under one drawing, a list of one-line facts. Server components, no state.
 */

export interface FlowStep {
  icon: LucideIcon;
  title: string;
  /** A few words under the title. */
  note?: string;
  /** A command or identifier shown in mono under the note. */
  code?: string;
  chip?: StatusMeta;
  accent?: "sun" | "cobalt" | "ink";
}

/** The arrow between two steps: one brush stroke, drawn by hand. */
function FlowArrow() {
  return (
    <li aria-hidden="true" className="flow-arrow">
      <svg viewBox="0 0 44 24" focusable="false">
        <path d="M3 13 C 11 8, 19 17, 33 12" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M27 5 L 39 12 L 27 19" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </li>
  );
}

/** Steps from left to right (top to bottom on a phone). `numbered` reads "Step n" to screen readers. */
export function Flow({ steps, label, numbered = false, className }: { steps: FlowStep[]; label: string; numbered?: boolean; className?: string }) {
  return (
    <ol aria-label={label} className={cn("flowline", className)}>
      {steps.map((s, i) => (
        <FlowItem key={s.title} step={s} index={i} numbered={numbered} last={i === steps.length - 1} />
      ))}
    </ol>
  );
}

function FlowItem({ step: s, index, numbered, last }: { step: FlowStep; index: number; numbered: boolean; last: boolean }) {
  return (
    <>
      <li className="flow-node">
        <span aria-hidden="true" className={cn("flow-ic", s.accent === "cobalt" && "flow-ic-cobalt", s.accent === "ink" && "flow-ic-ink")}>
          <s.icon size={20} strokeWidth={2.4} />
        </span>
        <span className="min-w-0">
          <strong className="flow-title">
            {numbered ? <span className="sr-only">Step {index + 1}: </span> : null}
            {s.title}
          </strong>
          {s.note ? <span className="flow-note">{s.note}</span> : null}
          {s.code ? <code className="flow-code">{s.code}</code> : null}
          {s.chip ? <StatusBadge meta={s.chip} size="sm" className="mt-2" /> : null}
        </span>
      </li>
      {last ? null : <FlowArrow />}
    </>
  );
}

/** "Read more" at the end of a section: the detail lives in the docs, at this exact place. */
export function ReadMore({ href, children = "Read more", className }: { href: string; children?: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("ink-link text-[15px]", className)}>
      {children} <ArrowRight aria-hidden="true" strokeWidth={2.5} />
    </Link>
  );
}

/** One point under one drawing: a title of a few words and one or two short sentences. */
export function PictureCard({
  art,
  title,
  children,
  chip,
  more,
  label,
  className,
}: {
  art: { src: string; width: number; height: number };
  title: string;
  children?: React.ReactNode;
  chip?: StatusMeta;
  more?: { href: string; label?: string };
  label?: string;
  className?: string;
}) {
  return (
    <article className={cn("pcard", className)}>
      <Art src={art.src} width={art.width} height={art.height} />
      <div className="pcard-body">
        {label || chip ? (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {label ? <span className="label !text-cobalt-ink">{label}</span> : null}
            {chip ? <StatusBadge meta={chip} size="sm" /> : null}
          </p>
        ) : null}
        <h3 className="pcard-title">{title}</h3>
        {children ? <p className="text-[15px] text-ink-2">{children}</p> : null}
        {more ? <ReadMore href={more.href} className="mt-auto self-start !text-[14px]">{more.label ?? "Read more"}</ReadMore> : null}
      </div>
    </article>
  );
}

/** Facts that each fit on one line, with an icon that says which kind of fact it is. */
export function OneLiners({ items, icon: Icon, className }: { items: React.ReactNode[]; icon: LucideIcon; className?: string }) {
  return (
    <ul className={cn("facts text-[16px]", className)}>
      {items.map((t, i) => (
        <li key={i}>
          <Icon aria-hidden="true" strokeWidth={2.6} />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
