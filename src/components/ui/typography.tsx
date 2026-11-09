import { cn } from "@/lib/cn";

/** SCRIPT//GO wordmark: a type treatment only, the `//` is the single accent. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn("font-display text-[22px] font-black uppercase leading-none tracking-[-0.02em]", className)}
      style={{ fontStretch: "105%" }}
    >
      SCRIPT<span className="text-cobalt-ink">//</span>GO
    </span>
  );
}

/** `// eyebrow` reading as a code comment. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{"// "}{children}</p>;
}

/** Heavy display headline. Headlines end with a period. */
export function DisplayTitle({
  as: Tag = "h2",
  children,
  className,
  id,
}: {
  as?: "h1" | "h2" | "h3";
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <Tag id={id} className={cn("display text-ink", className)}>
      {children}
    </Tag>
  );
}

/** Hand-drawn sun-yellow underline stroke beneath inline text. */
export function Underlined({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-[1]">{children}</span>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 300 24"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-[0.18em] left-[-2%] z-0 h-[0.32em] w-[104%]"
      >
        <path
          d="M4 16 C 60 6, 130 4, 200 8 S 280 14, 296 9"
          fill="none"
          stroke="var(--sun)"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/** Small sun-yellow brush stroke under a section title (the mockup's "How it works." underline). */
export function Stroke({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 140 18" className={cn("h-3 w-28", className)}>
      <path d="M4 12 C 40 4, 90 3, 136 8" fill="none" stroke="var(--sun)" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

/** Package identifier in mono: `creator//package`. */
export function Identifier({ value, className }: { value: string; className?: string }) {
  const [creator, name] = value.includes("//") ? value.split("//") : [null, value];
  return (
    <span className={cn("font-mono", className)}>
      {creator !== null ? (
        <>
          {creator}
          <span className="text-cobalt-ink">//</span>
          {name}
        </>
      ) : (
        value
      )}
    </span>
  );
}
