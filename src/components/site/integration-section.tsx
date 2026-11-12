import Link from "next/link";
import { ReadMore, Flow } from "@/components/site/diagrams";
import { FileCode2, KeyRound, Lock, Play, Server } from "lucide-react";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { GitHubMark } from "@/components/ui/github-mark";
import type { Environment, EnvironmentDetail, EnvironmentProtection } from "@/lib/contract";
import { CAPABILITIES } from "@/lib/contract";
import { capabilityPlain, deliveryStep } from "@/lib/integration";
import { groupByTier, tierMeta, tierShort } from "@/lib/protection";
import type { StatusMeta } from "@/lib/status";

/**
 * The environment page's "How it works": one drawing (your script, how it reaches the platform, where
 * it runs) and what a script can use there, in plain words. Everything technical (the adapter, the
 * setup, the API names, the real runs) is on the platform's docs page, linked as `more`.
 */
export function HowItWorksSection({ env: e, more, source }: { env: EnvironmentDetail; more: string; source?: string | null }) {
  const step = deliveryStep(e.integration?.type, e.name);
  const server = e.sides.includes("server");
  const client = e.sides.includes("client");
  const caps = Array.from(new Set([...CAPABILITIES, ...Object.keys(e.capabilities)]));
  const usable = caps.filter((c) => e.capabilities[c] === "supported" || e.capabilities[c] === "partial" || e.capabilities[c] === "fallback");
  return (
    <section aria-labelledby="how-title" className="mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="how-title" className="display scroll-mt-28 text-[30px]">
          How it works.
        </h2>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <ReadMore href={more} className="!text-[14.5px]">
            How it works, in full
          </ReadMore>
          {source ? (
            <a href={source} className="inline-flex items-center gap-1.5 text-[14px] text-ink-2 underline underline-offset-2 hover:text-ink">
              <GitHubMark size={15} /> Adapter source
            </a>
          ) : null}
        </div>
      </div>
      <Flow
        className="mt-5"
        label={`How a script runs on ${e.name}`}
        steps={[
          { icon: FileCode2, title: "Your script", note: "written once" },
          { icon: KeyRound, title: step.title, note: step.note, accent: "cobalt" },
          { icon: Play, title: `Runs on ${e.name}`, note: server && client ? "server and players" : server ? "on the server" : "in the game", accent: "ink" },
        ]}
      />
      {usable.length > 0 ? (
        <div className="mt-6">
          <h3 className="label">What a script can use here</h3>
          <ul className="mt-2.5 flex flex-wrap gap-2" aria-label={`What a script can use on ${e.name}`}>
            {usable.map((c) => (
              <li key={c}>
                <Tag>{capabilityPlain(c)}</Tag>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

/** State of a tier in one environment: "Available" or "Planned", with its icon. Never colour alone. */
function StateBadge({ p }: { p: EnvironmentProtection }) {
  const meta: StatusMeta =
    p.state === "available"
      ? { label: "Available", tone: "success", icon: "check", hint: "This tier works in the environment today." }
      : { label: "Planned", tone: "neutral", icon: "hourglass", hint: "This tier does not work in the environment yet." };
  return <StatusBadge meta={meta} size="sm" />;
}

/** What protection gives a seller and a buyer on one platform, in plain words. True claims only. */
function protectionWords(p: EnvironmentProtection): string {
  if (p.tier === "escrow" && p.state === "available") {
    return `Protect a release and its server scripts ship encrypted, then run only on the server their licence is bound to. A licence can be revoked, and a leaked copy can be traced.${p.optIn ? " The server's operator switches it on." : ""}`;
  }
  if (p.tier === "escrow") return "Every release is signed and each server checks its licence. Encrypted delivery is planned here.";
  if (p.tier === "license" && p.state === "available") {
    return "Every release is signed and each server checks its licence. The host runs plain script, so its operator can read the code.";
  }
  if (p.tier === "license") return "Every release is signed. Licence checks are planned here.";
  return "Every release is signed. No licence check runs here.";
}

/**
 * The environment page's "Protection" section: the tier, one or two sentences, and a drawing of the
 * path from your script to the licensed server. How it works and what it does not do: /protect.
 */
export function ProtectionSection({ env: e }: { env: Pick<Environment, "name" | "protection"> }) {
  const p = e.protection;
  const escrow = p.tier === "escrow" && p.state === "available";
  const licensed = p.tier !== "none";
  return (
    <section aria-labelledby="protection-title" className="mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="protection-title" className="display scroll-mt-28 text-[30px]">
          Protection.
        </h2>
        <ReadMore href="/protect" className="!text-[14.5px]">
          How protection works
        </ReadMore>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge meta={tierMeta[p.tier]} />
        {p.tier !== "none" ? <StateBadge p={p} /> : null}
      </div>
      <p className="mt-3 max-w-[70ch] text-[15.5px] text-ink-2">{protectionWords(p)}</p>
      {licensed ? (
        <Flow
          className="mt-5"
          label={`What a buyer's server gets on ${e.name}`}
          steps={[
            { icon: FileCode2, title: "Your release", note: "signed when you publish" },
            escrow
              ? { icon: Lock, title: "Encrypted", note: "if you protect it; the key never ships with it", accent: "cobalt" }
              : { icon: KeyRound, title: "A licence per server", note: "checked when it runs", accent: "cobalt" },
            { icon: Server, title: "The licensed server", note: escrow ? "the only one that can run it" : "runs it; revocable", accent: "ink" },
          ]}
        />
      ) : null}
    </section>
  );
}

/**
 * Every environment by protection tier, from the API: one sheet per tier, the strongest first. Used
 * by the directory and by /protect, so the two can never disagree. The registry's own sentence for
 * an environment is on its page.
 */
export function ProtectionTierTable({ envs, caption = "Protection tier by environment" }: { envs: Environment[]; caption?: string }) {
  const groups = groupByTier(envs);
  return (
    <div className="grid gap-7 lg:grid-cols-3 lg:items-start">
      {groups.map((g) => (
        <section key={g.tier} className="sticker" aria-label={tierMeta[g.tier].label}>
          <div className="border-b-[2.5px] border-line bg-paper p-4">
            <StatusBadge meta={tierMeta[g.tier]} />
            <p className="mt-2.5 text-[14.5px] text-ink-2">{tierShort[g.tier]}</p>
          </div>
          <table className="w-full text-left text-[14.5px]">
            <caption className="sr-only">
              {caption}: {tierMeta[g.tier].label}
            </caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Environment</th>
                <th scope="col">State</th>
              </tr>
            </thead>
            <tbody>
              {g.envs.map((e) => (
                <tr key={e.slug} className="border-t-[1.5px] border-line-soft first:border-t-0">
                  <th scope="row" className="px-4 py-2.5">
                    <Link href={`/environments/${encodeURIComponent(e.slug)}`} className="font-bold hover:underline">
                      {e.name}
                    </Link>
                  </th>
                  <td className="px-4 py-2.5 text-right">
                    {e.protection.tier === "none" ? <span className="text-ink-3">Signed releases</span> : <StateBadge p={e.protection} />}
                    {e.protection.optIn ? <span className="mt-1 block text-[12.5px] leading-snug text-ink-3">opt-in server feature</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
