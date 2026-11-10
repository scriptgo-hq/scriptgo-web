import { ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { IN_DEVELOPMENT } from "@/lib/status";
import { cn } from "@/lib/cn";
import { Art, SCENES } from "./ink";

/**
 * The two ways a seller earns with SCRIPT//GO, in one place so the home page, /sdk and /protect
 * can never tell them differently. What is sold is always the seller's own code.
 */
export const SELLER_CASES = [
  {
    who: "a script studio",
    art: "stall",
    title: "Ready-made scripts, sold to server operators.",
    body: [
      "A studio writes a job system and sells it to the people who run servers. Each buyer gets a licence for their own servers, and updates and renewals follow the licence.",
      "The release can be delivered encrypted; it then opens only on those servers. If a buyer is refunded, their key stops being released.",
    ],
    flow: null,
    sold: "What is sold: a licence to run the studio’s script.",
    inDevelopment: false,
  },
  {
    who: "a server operator",
    art: "pass",
    title: "A perk for players, in the operator’s own script.",
    body: [
      "An operator sells a perk to their players, for example a monthly VIP pass. The pass unlocks a feature of the script the operator wrote for their server.",
      "The perk renews with the subscription. When the subscription ends, the perk ends with it.",
    ],
    flow: ["The player", "The operator’s Tebex store", "SCRIPT//GO", "The SDK on the server", "The operator’s script"],
    sold: "What is sold: a feature of the operator’s own code. Not the game, not its content, not access to it.",
    inDevelopment: true,
  },
] as const;

export function SellerCases({ className }: { className?: string }) {
  return (
    <ul className={cn("ways", className)}>
      {SELLER_CASES.map((c) => (
        <li key={c.who} className="way">
          <Art src={SCENES[c.art].src} width={SCENES[c.art].width} height={SCENES[c.art].height} />
          <div className="way-body">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="label">{c.who}</span>
              {c.inDevelopment ? <StatusBadge meta={IN_DEVELOPMENT} size="sm" /> : null}
            </p>
            <h3 className="font-display text-[26px] font-black leading-[1.05] tracking-[-0.025em]" style={{ fontStretch: "114%" }}>
              {c.title}
            </h3>
            {c.body.map((p) => (
              <p key={p} className="text-[15.5px] text-ink-2">
                {p}
              </p>
            ))}
            {c.flow ? (
              <ol aria-label="How a perk reaches the script" className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[13px]">
                {c.flow.map((step, i) => (
                  <li key={step} className="flex items-center gap-1.5">
                    {i > 0 ? <ArrowRight aria-hidden="true" size={14} strokeWidth={2.75} className="shrink-0 text-cobalt-ink" /> : null}
                    <span className="tok">{step}</span>
                  </li>
                ))}
              </ol>
            ) : null}
            <p className="way-sold">{c.sold}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Things announced but not usable yet. Each one carries the same "In development" stamp. */
export const IN_DEVELOPMENT_ITEMS: { title: string; body: string }[] = [
  {
    title: "Perks for players",
    body: "An operator sells a perk to their players, tied to a feature of their own script: the player, the operator’s Tebex store, SCRIPT//GO, the SDK on the server, the operator’s script.",
  },
  {
    title: "Protection without a sale",
    body: "A creator gives a server a free licence. Nothing is sold, and the release is still bound to that server and delivered the same way.",
  },
  {
    title: "Minify at packaging",
    body: "An optional step that makes packaged script harder to read. It is a speed bump, never protection, and it is never counted as such.",
  },
];

export function InDevelopmentList({ className }: { className?: string }) {
  return (
    <ul className={cn("grid gap-6 md:grid-cols-3", className)}>
      {IN_DEVELOPMENT_ITEMS.map((it) => (
        <li key={it.title} className="panel flex flex-col gap-2.5 p-4">
          <StatusBadge meta={IN_DEVELOPMENT} size="sm" className="self-start" />
          <h3 className="font-display text-[19px] font-extrabold leading-tight">{it.title}</h3>
          <p className="text-[14.5px] text-ink-2">{it.body}</p>
        </li>
      ))}
    </ul>
  );
}
