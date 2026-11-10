import Link from "next/link";
import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { CreatorBoxArt } from "@/components/illustrations";
import { ProtectionTierTable } from "@/components/site/integration-section";
import { ButtonLink } from "@/components/ui/button";
import { CommandLine } from "@/components/ui/code-block";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { DisplayTitle, Eyebrow, Stroke } from "@/components/ui/typography";
import { api } from "@/lib/api";
import type { Environment } from "@/lib/contract";

export const metadata: Metadata = {
  title: "Protect your work",
  description:
    "How SCRIPT//GO protects scripts their creators own: signed releases, per-server licences and encrypted releases. What it does, where it applies, and what it does not do.",
};

const OWNED = [
  "The scripts you wrote, in Lua or TypeScript. C# is next.",
  "The configs, data and schemas you made for them.",
  "The assets you created yourself: interface, images, sounds.",
];

const CASES: { eyebrow: string; title: string; body: string[]; sold: string }[] = [
  {
    eyebrow: "a script studio",
    title: "Ready-made scripts, sold to server owners.",
    body: [
      "A studio writes a job system and sells it to the people who run servers. Each buyer gets a licence for their own servers.",
      "The release is delivered encrypted and opens only on those servers. If a buyer is refunded, their key stops being released.",
    ],
    sold: "What is sold: a licence to run the studio's script.",
  },
  {
    eyebrow: "a server operator",
    title: "A perk on their own server.",
    body: [
      "An operator sells a monthly VIP pass to their players. The pass unlocks a feature of the script the operator wrote for their server.",
      "The licence renews with the subscription. When the subscription ends, the licence ends with it.",
    ],
    sold: "What is sold: a feature of the operator's own code. Not the game, not its content, not access to it.",
  },
];

const STEPS: { title: string; body: string }[] = [
  {
    title: "The buyer pays on the creator's Tebex store.",
    body: "Shops run on the creator's own Tebex store. In development a mock provider stands in. Checkout through Tebex stays off until Tebex approves it in writing.",
  },
  {
    title: "A licence is issued.",
    body: "Only after a payment event that SCRIPT//GO verified. Coming back from the checkout page grants nothing by itself.",
  },
  {
    title: "The server binds itself with its own key.",
    body: "The loader creates a key pair on the server. The public half is bound to that deployment the first time it is used. The private half never leaves the server.",
  },
  {
    title: "The key is released, wrapped to that server.",
    body: "The content key is short-lived and encrypted to the server's own key. A copy of the files on another machine has no matching key, so it gets nothing.",
  },
  {
    title: "It runs, is checked again, and can be revoked.",
    body: "The loader checks the signatures and decrypts. The licence is checked again on a schedule. A refund, a lost dispute, an ended subscription or a revocation stops the next key release. A server that is already running stops when its offline grace ends.",
  },
];

const CLAIMS = [
  "An encrypted release is encrypted at rest and in transit.",
  "The key is never shipped with the file. We hold it sealed and show it to no one.",
  "Per-server binding: a copied release does not open on a server that is not bound to the licence.",
  "Revocation at the next key release, on refund, lost dispute, ended subscription or admin decision.",
  "Signed releases: a modified file is detected before it is installed.",
  "Traceable leaks: each delivery is marked with the licence and the deployment it went to.",
  "Getting past it takes real effort and leaves traces.",
];

const LIMITS: { title: string; body: string }[] = [
  {
    title: "It does not stop a server's operator from reading code that runs on that server.",
    body: "A host that must decrypt and run code can be inspected by whoever controls the machine. Encryption raises the cost. The delivery marker makes the copy traceable. Neither makes it impossible.",
  },
  {
    title: "It does not hide code on a host that runs plain script.",
    body: "On a pure-Lua host the operator can read what the host loads. There the protection is the licence check and the signature. We make no code-secrecy claim.",
  },
  {
    title: "It is not obfuscation.",
    body: "Obfuscation is at most a speed bump. We do not build one.",
  },
  {
    title: "It is not DRM, and it does not promise to stop all copying.",
    body: "It is deterrence, traceability and revocation. A marker shows where a copy was delivered; it does not by itself prove who leaked it.",
  },
  {
    title: "It does not replace keeping secrets on the server.",
    body: "What is never shipped cannot be copied. Keep prices, economy rules and anti-cheat logic in server scripts, and send clients only what they display.",
  },
];

const NEVER = [
  "We do not sell a game, its content, or access to it.",
  "We do not ship, host or redistribute a game's code, models, textures, audio or maps.",
  "We do not decrypt, unpack or modify a game's files.",
  "We do not let encryption cover for them: a package that carries a game's files is refused or removed, encrypted or not.",
];

async function Tiers() {
  const res = await api<Environment[]>("/v1/environments");
  if (!res.ok) return <ApiError failure={res} title="The tier table could not be loaded." />;
  if (res.data.length === 0) return <EmptyState title="No environments registered yet" />;
  return <ProtectionTierTable envs={res.data} caption="What a buyer's server gets, by environment" />;
}

export default function ProtectPage() {
  return (
    <div>
      <section className="border-b-2 border-line-soft">
        <div className="container-page grid gap-8 py-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-center">
          <div>
            <Eyebrow>protect</Eyebrow>
            <DisplayTitle as="h1" className="mt-2 text-[44px] sm:text-[60px]">
              You wrote it.
              <br />
              <span className="display-italic text-cobalt-ink">You own it.</span>
              <br />
              Keep it that way.
            </DisplayTitle>
            <p className="mt-5 max-w-[58ch] text-[17px] text-ink-2">
              SCRIPT//GO sells and protects work that belongs to its creator: the scripts you wrote and the content you made for
              them. Every release is signed. A paid package runs only on servers that hold a licence. And a release can be
              delivered encrypted, with its key released to one licensed server at a time.
            </p>
            <p className="mt-3 max-w-[58ch] text-[15px] text-ink-2">
              We never sell, ship, decrypt or redistribute a game&rsquo;s own files. And we say plainly what protection does not
              do.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="#how-title" size="lg" arrow>
                How it works
              </ButtonLink>
              <ButtonLink href="/docs/protect-your-work" variant="secondary" size="lg">
                Read the guide
              </ButtonLink>
              <Link href="#limits-title" className="inline-flex h-12 items-center px-2 font-bold text-ink underline-offset-4 hover:underline">
                What it does not do
              </Link>
            </div>
          </div>
          <CreatorBoxArt className="mx-auto hidden w-full max-w-[260px] lg:block" />
        </div>
      </section>

      <section aria-labelledby="owned-title" className="container-page py-12">
        <DisplayTitle id="owned-title" className="text-[38px] sm:text-[44px]">
          What is protected.
        </DisplayTitle>
        <Stroke className="mt-1" />
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="min-w-0">
            <h3 className="font-display text-[22px] font-extrabold leading-tight">Your work.</h3>
            <ul className="mt-3 space-y-2 text-[15.5px]">
              {OWNED.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Check aria-hidden="true" size={18} strokeWidth={2.75} className="mt-[3px] shrink-0 text-ok" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-[58ch] text-[14.5px] text-ink-2">
              You declare your rights on every release. Publishing, protecting or selling through SCRIPT//GO transfers none of
              them to us.
            </p>
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-[22px] font-extrabold leading-tight">On someone else&rsquo;s game.</h3>
            <p className="mt-3 max-w-[60ch] text-[15.5px] text-ink-2">
              Take a multiplayer platform built on a AAA open-world game. The game belongs to its publisher. A server operator
              on that platform still owns every script they write for their server. They can license it, protect it and sell it
              from their own store, and the publisher&rsquo;s rights are untouched.
            </p>
            <p className="mt-3 max-w-[60ch] text-[15.5px] text-ink-2">
              Ownership only matters if it can be enforced. Per-server licences and encrypted releases are what enforce it: the
              script runs where a licence allows it, and stops where one ends.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="cases-title" className="border-t-2 border-line-soft bg-paper-2/60">
        <div className="container-page py-12">
          <DisplayTitle id="cases-title" className="text-[38px] sm:text-[44px]">
            Two ways creators sell.
          </DisplayTitle>
          <Stroke className="mt-1" />
          <ul className="mt-8 grid gap-5 md:grid-cols-2">
            {CASES.map((c) => (
              <li key={c.eyebrow} className="sticker flex flex-col gap-3 p-5">
                <Eyebrow>{c.eyebrow}</Eyebrow>
                <h3 className="font-display text-[23px] font-extrabold leading-tight">{c.title}</h3>
                {c.body.map((p) => (
                  <p key={p} className="text-[15px] text-ink-2">
                    {p}
                  </p>
                ))}
                <p className="mt-auto border-t-2 border-line-soft pt-3 text-[14.5px] font-semibold">{c.sold}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="how-title" className="container-page scroll-mt-24 py-12">
        <DisplayTitle id="how-title" className="scroll-mt-24 text-[38px] sm:text-[44px]">
          How escrow works.
        </DisplayTitle>
        <Stroke className="mt-1" />
        <p className="mt-4 max-w-[64ch] text-[16px] text-ink-2">
          Escrow means the release is delivered encrypted and SCRIPT//GO holds the key. Five steps take a payment to a running
          server.
        </p>
        <ol className="mt-8 grid gap-5 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.title} className="sticker flex flex-col gap-2 p-4">
              <span
                aria-hidden="true"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-line bg-sun font-display text-[18px] font-black text-on-sun"
              >
                {i + 1}
              </span>
              <h3 className="font-display text-[18px] font-extrabold leading-tight">
                <span className="sr-only">Step {i + 1}: </span>
                {s.title}
              </h3>
              <p className="text-[14px] text-ink-2">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="panel p-4">
            <h3 className="font-display text-[18px] font-extrabold">Every release is signed.</h3>
            <p className="mt-1 text-[14.5px] text-ink-2">
              Encrypted or not. <code className="font-mono text-[0.9em]">scriptgo add</code> checks the registry&rsquo;s signature
              before it writes a file, so an altered release is refused.
            </p>
          </div>
          <div className="panel p-4">
            <h3 className="font-display text-[18px] font-extrabold">You choose what stays readable.</h3>
            <p className="mt-1 text-[14.5px] text-ink-2">
              The manifest and the docs are always clear. You name the config files an operator must edit. Everything else is
              encrypted, and the list is shown on the package page.
            </p>
          </div>
          <div className="panel p-4">
            <h3 className="font-display text-[18px] font-extrabold">Moving a server is allowed.</h3>
            <p className="mt-1 text-[14.5px] text-ink-2">
              Binding follows the server&rsquo;s key, not its hardware. After a reinstall, the owner resets the server key on the
              licence page. Each reset is recorded.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="tiers-title" className="scroll-mt-24 border-t-2 border-line-soft bg-paper-2/60">
        <div className="container-page py-12">
          <DisplayTitle id="tiers-title" className="scroll-mt-24 text-[38px] sm:text-[44px]">
            Where it applies.
          </DisplayTitle>
          <Stroke className="mt-1" />
          <p className="mt-4 max-w-[68ch] text-[16px] text-ink-2">
            What a buyer&rsquo;s server gets depends on the host. Decrypting in memory needs a host that runs compiled code and
            can hold a key. A host that runs plain script gets the licence check and the signature. Where the game&rsquo;s rights
            holder allows free packages only, nothing is sold. &ldquo;Planned&rdquo; means it does not work there yet.
          </p>
          <div className="mt-6">
            <Tiers />
          </div>
          <p className="mt-3 text-[13px] text-ink-3">
            This table is read from the adapter registry, the same data as the{" "}
            <Link href="/environments#protection" className="font-semibold text-cobalt-ink underline">
              environments page
            </Link>
            . Each package page says what applies to that package.
          </p>
        </div>
      </section>

      <section aria-labelledby="claims-title" className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="min-w-0">
            <DisplayTitle id="claims-title" className="text-[34px] sm:text-[40px]">
              What we claim.
            </DisplayTitle>
            <Stroke className="mt-1" />
            <ul className="mt-6 space-y-2.5 text-[15.5px]">
              {CLAIMS.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Check aria-hidden="true" size={18} strokeWidth={2.75} className="mt-[3px] shrink-0 text-ok" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="min-w-0">
            <DisplayTitle id="limits-title" className="scroll-mt-24 text-[34px] sm:text-[40px]">
              What this does not do.
            </DisplayTitle>
            <Stroke className="mt-1" />
            <ul className="mt-6 space-y-4">
              {LIMITS.map((l) => (
                <li key={l.title} className="flex gap-2.5">
                  <Minus aria-hidden="true" size={18} strokeWidth={2.75} className="mt-[3px] shrink-0 text-ink-3" />
                  <div className="min-w-0">
                    <p className="text-[15.5px] font-bold">{l.title}</p>
                    <p className="mt-0.5 text-[14.5px] text-ink-2">{l.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="game-ip-title" className="border-t-2 border-line-soft bg-paper-2/60">
        <div className="container-page grid gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div>
            <DisplayTitle id="game-ip-title" className="text-[38px] sm:text-[44px]">
              What we never touch: the game&rsquo;s IP.
            </DisplayTitle>
            <Stroke className="mt-1" />
            <p className="mt-4 max-w-[52ch] text-[16px] text-ink-2">
              A game belongs to its publisher. A script written for it belongs to its author. SCRIPT//GO deals only in the
              second.
            </p>
          </div>
          <div className="min-w-0">
            <ul className="space-y-2.5 text-[15.5px]">
              {NEVER.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Minus aria-hidden="true" size={18} strokeWidth={2.75} className="mt-[3px] shrink-0 text-ink-3" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 max-w-[62ch] text-[14.5px] text-ink-2">
              Where a rights holder does not allow paid mods, packages for that environment are free only. A paid offer that
              targets a proprietary game is reviewed before it can be bought. Anyone can{" "}
              <Link href="/report" className="font-semibold text-cobalt-ink underline">
                report a package
              </Link>
              , with or without an account. The rules are in the{" "}
              <Link href="/legal#ip-policy" className="font-semibold text-cobalt-ink underline">
                IP policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="start-title" className="container-page py-12">
        <div className="sticker grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <div className="min-w-0">
            <DisplayTitle id="start-title" className="text-[32px] sm:text-[38px]">
              Protect a release.
            </DisplayTitle>
            <p className="mt-3 max-w-[56ch] text-[15.5px] text-ink-2">
              From the command line, or with the &ldquo;Protect this release (escrow)&rdquo; option when you upload a new release
              on the site. A published release cannot change; to rotate a key, publish a new version.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <ButtonLink href="/dashboard/packages" arrow>
                Open your packages
              </ButtonLink>
              <ButtonLink href="/docs/protect-your-work" variant="secondary">
                Read the guide
              </ButtonLink>
              <Link href="/legal#protection" className="inline-flex h-10 items-center px-2 font-bold text-ink underline-offset-4 hover:underline">
                The terms
              </Link>
            </div>
          </div>
          <div className="min-w-0 space-y-2">
            <CommandLine command="scriptgo publish --escrow" />
            <CommandLine command={'scriptgo publish --escrow --escrow-ignore "config.lua"'} />
            <p className="text-[13px] text-ink-3">
              The CLI is in preview. <code className="font-mono">--escrow-ignore</code> names a file that stays in clear text.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
