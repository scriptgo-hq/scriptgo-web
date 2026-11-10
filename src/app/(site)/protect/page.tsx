import type { Metadata } from "next";
import { Check, FileCode2, Image as ImageIcon, KeyRound, Minus, Play, Puzzle, Server, Settings2, Store } from "lucide-react";
import { Flow, OneLiners, PictureCard, ReadMore } from "@/components/site/diagrams";
import { ProtectionTierTable } from "@/components/site/integration-section";
import { PageHead, Ridge, SCENES } from "@/components/site/ink";
import { InDevelopmentList, SellerCases } from "@/components/site/seller-cases";
import { ButtonLink } from "@/components/ui/button";
import { CommandLine } from "@/components/ui/code-block";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { DisplayTitle, Eyebrow } from "@/components/ui/typography";
import { api } from "@/lib/api";
import type { Environment } from "@/lib/contract";

export const metadata: Metadata = {
  title: "Protect your work",
  description:
    "How SCRIPT//GO protects scripts their creators own: signed releases, per-server licences and encrypted releases. What it does, where it applies, and what it does not do.",
};

// Everything on this page is one line. The reasons and the edge cases are in /docs/protect-your-work.
const OWNED = [
  { icon: FileCode2, title: "Your scripts", note: "Lua or TypeScript" },
  { icon: Settings2, title: "Your configs and data", note: "made for them" },
  { icon: ImageIcon, title: "Your own assets", note: "interface, images, sounds" },
];

const CLAIMS = [
  "Encrypted at rest and in transit.",
  "The key is never shipped with the file.",
  "A copied release does not open on another server.",
  "A refund or a revocation stops the next key release.",
  "Each delivery is marked, so a leak can be traced.",
];

const LIMITS = [
  "Only server scripts are protected. What a client receives can be read.",
  "It does not stop a server’s operator from reading code that runs on their own machine.",
  "It hides nothing on a host that runs plain script.",
  "It is not obfuscation, and it is not DRM.",
  "It deters copying and traces leaks. It does not make copying impossible.",
];

const NEVER = [
  "We do not sell a game, its content, or access to it.",
  "We do not ship, host or redistribute a game’s files.",
  "We do not decrypt, unpack or modify a game’s files.",
  "Encryption never covers for them: such a package is removed.",
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
      <PageHead
        id="protect-h1"
        tag="Protect"
        art={{ ...SCENES.strongbox, position: "78% 45%" }}
        title={
          <>
            You wrote it. <em>You own it.</em> Keep it that way.
          </>
        }
        lede="Every release is signed, a paid script runs only on licensed servers, and a release can be delivered encrypted."
      >
        <div className="cta-row mt-8 items-center">
          <ButtonLink href="#how-title" variant="sun" size="lg" arrow>
            How it works
          </ButtonLink>
          <ButtonLink href="#limits-title" variant="secondary" size="lg">
            What it does not do
          </ButtonLink>
        </div>
      </PageHead>

      <section aria-labelledby="layers-title" className="sec g-paper bleed sec-sweeps container-page !pt-12">
        <div className="sec-head">
          <div>
            <Eyebrow className="mb-[18px]">Three layers</Eyebrow>
            <DisplayTitle id="layers-title" className="text-[38px] sm:text-[48px]">
              Signed, licensed, <em>encrypted.</em>
            </DisplayTitle>
          </div>
          <ReadMore href="/docs/protect-your-work#three-layers">The three layers</ReadMore>
        </div>
        <div className="pcards">
          <PictureCard art={SCENES.seal} label="Every release" title="Signed.">
            An altered file is refused before it is installed.
          </PictureCard>
          <PictureCard art={SCENES.serverkey} label="Paid scripts" title="One licence per server.">
            A copy on another machine gets no key.
          </PictureCard>
          <PictureCard art={SCENES.strongbox} label="Your choice" title="Delivered encrypted.">
            Decrypted in memory, where the host can hold a key.
          </PictureCard>
        </div>
      </section>

      <Ridge from="paper" to="paper2" ink="sun" n={1} />
      <section aria-labelledby="owned-title" className="sec g-paper2 bleed sec-sweeps container-page !pt-10">
        <div className="sec-head">
          <div>
            <Eyebrow className="mb-[18px]">Ownership</Eyebrow>
            <DisplayTitle id="owned-title" className="text-[38px] sm:text-[48px]">
              What is <em>protected.</em>
            </DisplayTitle>
            <p className="one-line mt-4 text-ink-2">The game stays its publisher&rsquo;s. What you wrote for it stays yours.</p>
          </div>
          <ReadMore href="/docs/protect-your-work#what-is-yours">What is yours</ReadMore>
        </div>
        <ul className="grid gap-5 sm:grid-cols-3">
          {OWNED.map((o) => (
            <li key={o.title} className="flow-node !flex-row items-center !gap-4">
              <span aria-hidden="true" className="flow-ic">
                <o.icon size={20} strokeWidth={2.4} />
              </span>
              <span>
                <strong className="flow-title">{o.title}</strong>
                <span className="flow-note">{o.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Ridge from="paper2" to="paper" ink="sand" n={2} />
      <section aria-labelledby="how-title" className="sec g-paper bleed sec-sweeps container-page scroll-mt-24 !pt-10">
        <div className="sec-head">
          <div>
            <Eyebrow className="mb-[18px]">Escrow</Eyebrow>
            <DisplayTitle id="how-title" className="scroll-mt-28 text-[38px] sm:text-[48px]">
              From a payment <em>to a running server.</em>
            </DisplayTitle>
          </div>
          <ReadMore href="/docs/protect-your-work#buy-bind-and-run">Buy, bind and run</ReadMore>
        </div>
        <Flow
          numbered
          label="From a payment to a running server"
          steps={[
            { icon: Store, title: "The buyer pays", note: "on the seller’s own Tebex store", chip: { label: "Not live yet", tone: "warning", icon: "lock", hint: "Real checkout stays off, for every shop, until Tebex approves it in writing." } },
            { icon: Puzzle, title: "A licence is issued", note: "after a verified payment event", accent: "ink" },
            { icon: Server, title: "The server binds", note: "with a key it makes itself", accent: "cobalt" },
            { icon: KeyRound, title: "The key is released", note: "wrapped to that server only" },
            { icon: Play, title: "It runs", note: "checked again, and revocable", accent: "cobalt" },
          ]}
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <div className="min-w-0">
            <h3 className="font-display text-[22px] font-black leading-tight tracking-[-0.02em]">Protect a release.</h3>
            <p className="mt-2 text-[15.5px] text-ink-2">From the command line, or with the option on the upload form.</p>
            <div className="cta-row mt-5 items-center">
              <ButtonLink href="/dashboard/packages" variant="sun" arrow prefetch={false}>
                Open your packages
              </ButtonLink>
              <ReadMore href="/docs/protect-your-work#publish-an-encrypted-release">Publish an encrypted release</ReadMore>
            </div>
          </div>
          <div className="min-w-0 space-y-4">
            <CommandLine command="scriptgo publish --escrow" />
            <CommandLine command={'scriptgo publish --escrow --escrow-ignore "config.lua"'} />
          </div>
        </div>
      </section>

      <Ridge from="paper" to="cobalt" ink="violet" n={3} />
      <section aria-labelledby="cases-title" className="sec g-cobalt sec-sweeps !pt-10">
        <div className="container-page">
          <Eyebrow className="mb-[18px]">Monetize</Eyebrow>
          <DisplayTitle id="cases-title" className="text-[38px] sm:text-[48px]">
            Two ways <em>creators sell.</em>
          </DisplayTitle>
          <SellerCases className="mt-9" />
        </div>
      </section>

      <Ridge from="cobalt" to="paper2" ink="sun" n={0} />
      <section aria-labelledby="tiers-title" className="sec g-paper2 sec-sweeps scroll-mt-24 !pt-10">
        <div className="container-page">
          <div className="sec-head">
            <div>
              <Eyebrow className="mb-[18px]">By host</Eyebrow>
              <DisplayTitle id="tiers-title" className="scroll-mt-28 text-[38px] sm:text-[48px]">
                Where it <em>applies.</em>
              </DisplayTitle>
              <p className="one-line mt-4 text-ink-2">What a buyer&rsquo;s server gets depends on the host. Read from the registry.</p>
            </div>
            <ReadMore href="/docs/protect-your-work#tiers">The tiers</ReadMore>
          </div>
          <Tiers />
        </div>
      </section>

      <Ridge from="paper2" to="night" ink="cobalt" n={1} />
      <section aria-labelledby="claims-title" className="sec g-night bleed sec-sweeps container-page !pt-10">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="min-w-0">
            <Eyebrow className="mb-[18px]">The promise</Eyebrow>
            <DisplayTitle id="claims-title" className="text-[34px] sm:text-[42px]">
              What we <em>claim.</em>
            </DisplayTitle>
            <OneLiners className="mt-6" icon={Check} items={CLAIMS} />
            <p className="mt-6">
              <ReadMore href="/docs/protect-your-work#what-we-claim">What we claim</ReadMore>
            </p>
          </div>
          <div className="min-w-0">
            <Eyebrow className="mb-[18px]">The limits</Eyebrow>
            <DisplayTitle id="limits-title" className="scroll-mt-28 text-[34px] sm:text-[42px]">
              What this <em>does not do.</em>
            </DisplayTitle>
            <OneLiners className="mt-6" icon={Minus} items={LIMITS} />
            <p className="mt-6">
              <ReadMore href="/docs/protect-your-work#what-it-does-not-do">What it does not do</ReadMore>
            </p>
          </div>
        </div>
      </section>

      <Ridge from="night" to="sun" ink="cobalt" n={2} />
      <section aria-labelledby="game-ip-title" className="sec g-sun sec-sweeps !pt-10">
        <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0">
            <Eyebrow className="mb-[18px]">The game&rsquo;s IP</Eyebrow>
            <DisplayTitle id="game-ip-title" className="text-[38px] sm:text-[46px]">
              What we never touch: <em>the game&rsquo;s IP.</em>
            </DisplayTitle>
            <OneLiners className="mt-6" icon={Minus} items={NEVER} />
          </div>
          <div className="pcards pcards-2 min-w-0 !gap-6">
            <PictureCard art={SCENES.scales} title="Sellers declare, and answer." more={{ href: "/docs/selling#the-rules", label: "The rules" }}>
              An offer with a declaration of rights is on sale. No pre-approval.
            </PictureCard>
            <PictureCard art={SCENES.watchtower} title="We act on reports." more={{ href: "/report", label: "Report a package" }}>
              Restrict, suspend or take down, with notice and appeal.
            </PictureCard>
          </div>
        </div>
      </section>

      <Ridge from="sun" to="paper" ink="orange" n={3} />
      <section aria-labelledby="next-title" className="sec g-paper bleed sec-sweeps container-page !pt-10">
        <div className="sec-head">
          <div>
            <Eyebrow className="mb-[18px]">Next</Eyebrow>
            <DisplayTitle id="next-title" className="text-[34px] sm:text-[42px]">
              Being built, <em>not usable yet.</em>
            </DisplayTitle>
          </div>
          <ReadMore href="/docs/selling#in-development">In development</ReadMore>
        </div>
        <InDevelopmentList />
      </section>
    </div>
  );
}
