import { adapterMetaFor } from "@/lib/integration";
import { StatusBadge } from "./badge";

/** Plain text from the registry, with `backtick` spans shown as inline code. Never parses HTML. */
export function InlineCodeText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("`") && p.endsWith("`") && p.length > 2 ? (
          <code key={i} className="border border-line-soft bg-surface-2 px-1 py-[1px] font-mono text-[0.88em]">
            {p.slice(1, -1)}
          </code>
        ) : (
          p
        ),
      )}
    </>
  );
}

/**
 * Whether an environment's adapter exists and has passed a real run. Shown for planned entries,
 * where it separates "adapter written, awaiting a real run" from "not started".
 */
export function AdapterStateBadge({
  state,
  blockedOn,
  size = "sm",
  long = false,
  className,
}: {
  state: string;
  blockedOn?: string;
  size?: "sm" | "md";
  /** The full wording ("Adapter written, awaiting a real run") instead of the short label. */
  long?: boolean;
  className?: string;
}) {
  const meta = adapterMetaFor(state);
  return (
    <StatusBadge
      meta={{ ...meta, label: long ? meta.long : meta.label, hint: blockedOn ? `${meta.long}. ${blockedOn}` : meta.hint }}
      size={size}
      className={className}
    />
  );
}
