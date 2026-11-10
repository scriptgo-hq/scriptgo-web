import { FileCode2, Gamepad2, KeyRound, Puzzle, Server, Store, UserRound, type LucideIcon } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { IN_DEVELOPMENT } from "@/lib/status";
import { cn } from "@/lib/cn";
import { Flow, ReadMore, type FlowStep } from "./diagrams";
import { Art, SCENES } from "./ink";

/**
 * The two ways a seller earns with SCRIPT//GO, in one place so the home page, /sdk and /protect
 * can never tell them differently. What is sold is always the seller's own code. The detail is in
 * the docs (/docs/selling).
 */
const step = (icon: LucideIcon, title: string, note?: string, accent?: FlowStep["accent"]): FlowStep => ({ icon, title, note, accent });

export const SELLER_CASES = [
  {
    who: "a script studio",
    art: "stall",
    title: "A studio sells a script to server operators.",
    body: "Each buyer gets a licence for their own servers. The release can be delivered encrypted.",
    flowLabel: "How a script sale reaches the server",
    flow: [
      step(UserRound, "The operator", "buys the script"),
      step(Store, "The studio’s Tebex store", "takes the payment", "cobalt"),
      step(Puzzle, "SCRIPT//GO", "issues the licence", "ink"),
      step(KeyRound, "Licence and key", "bound to one server"),
      step(Server, "The server", "runs the script", "cobalt"),
    ],
    sold: "Sold: a licence to run the studio’s script.",
    inDevelopment: false,
    more: "/docs/selling#a-studio-sells-a-script",
  },
  {
    who: "a server operator",
    art: "pass",
    title: "An operator sells a perk to players.",
    body: "A monthly VIP pass, for example, unlocks a feature of the operator’s own script.",
    flowLabel: "How a perk reaches the script",
    flow: [
      step(Gamepad2, "The player", "buys the pass"),
      step(Store, "The operator’s Tebex store", "takes the payment", "cobalt"),
      step(Puzzle, "SCRIPT//GO", "records the perk", "ink"),
      step(Server, "The SDK on the server", "asks who has it"),
      step(FileCode2, "The operator’s script", "unlocks the feature", "cobalt"),
    ],
    sold: "Sold: a feature of the operator’s own code. Never the game, its content or access to it.",
    inDevelopment: true,
    more: "/docs/selling#an-operator-sells-a-perk",
  },
] as const;

export function SellerCases({ className }: { className?: string }) {
  return (
    <ul className={cn("grid gap-10", className)}>
      {SELLER_CASES.map((c, i) => (
        <li key={c.who} className={cn("way !rotate-0 lg:grid lg:grid-cols-[minmax(0,0.52fr)_minmax(0,1.48fr)]", i === 1 && "!shadow-[10px_10px_0_var(--g-ink)]")}>
          <Art src={SCENES[c.art].src} width={SCENES[c.art].width} height={SCENES[c.art].height} className="!aspect-auto h-full max-h-[260px] w-full object-cover lg:max-h-none lg:!border-b-0 lg:border-r-[2.5px] lg:border-line" />
          <div className="way-body">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="label">{c.who}</span>
              {c.inDevelopment ? <StatusBadge meta={IN_DEVELOPMENT} size="sm" /> : null}
            </p>
            <h3 className="font-display text-[26px] font-black leading-[1.05] tracking-[-0.025em]" style={{ fontStretch: "114%" }}>
              {c.title}
            </h3>
            <p className="text-[15.5px] text-ink-2">{c.body}</p>
            <Flow steps={[...c.flow]} label={c.flowLabel} className="flow-compact my-1" />
            <p className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[14.5px] font-semibold">
              <span>{c.sold}</span>
              <ReadMore href={c.more} className="!text-[14px]" />
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Things announced but not usable yet. Each one carries the same "In development" stamp. */
export const IN_DEVELOPMENT_ITEMS: { title: string; body: string }[] = [
  { title: "Perks for players", body: "An operator sells a perk tied to a feature of their own script." },
  { title: "Protection without a sale", body: "A creator gives a server a free licence; the release is still bound to it." },
  { title: "Minify at packaging", body: "Optional, and only a speed bump: never counted as protection." },
];

export function InDevelopmentList({ className }: { className?: string }) {
  return (
    <ul className={cn("grid gap-5 md:grid-cols-3", className)}>
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

