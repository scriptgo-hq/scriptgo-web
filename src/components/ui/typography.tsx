import { cn } from "@/lib/cn";

/** Public paths of the brand art (keycap mark and plate wordmark). */
export const BRAND = {
  mark: { src: "/ink/logo-mark.webp", width: 240, height: 200 },
  word: { src: "/ink/logo-word.webp", width: 560, height: 152 },
} as const;

/**
 * The brand: keycap mark and SCRIPT//GO plate wordmark. Hovering presses the key (`.brand` in
 * globals.css). `compact` is the small version used in the dashboard sidebar.
 */
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("brand", compact && "brand-sm", className)}>
      <span className="brand-key">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="brand-mark" src={BRAND.mark.src} width={BRAND.mark.width} height={BRAND.mark.height} alt="" decoding="async" />
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="brand-word" src={BRAND.word.src} width={BRAND.word.width} height={BRAND.word.height} alt="SCRIPT//GO" decoding="async" />
    </span>
  );
}

/** The tag that opens a section: two slashes, then a slanted plate. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("tag", className)}>
      <span aria-hidden="true" className="tag-slashes" />
      <span className="tag-plate">{children}</span>
    </p>
  );
}

/** Heavy wide display headline. Wrap the accent words in <em>. */
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

/** A marker stroke behind inline text. */
export function Underlined({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn("px-[0.04em]", className)}
      style={{ background: "linear-gradient(var(--g-sun), var(--g-sun)) 0 88% / 100% 0.28em no-repeat" }}
    >
      {children}
    </span>
  );
}

/** Two slanted sun slashes under a section title: the brand's `//`. */
export function Stroke({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("tag-slashes mt-3 flex", className)} />;
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
