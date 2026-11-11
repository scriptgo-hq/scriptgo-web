import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Braces, Cpu, FileText, KeyRound, Plug, Server, SquareTerminal, Wrench, type LucideIcon } from "lucide-react";
import { Flow, PictureCard, ReadMore } from "@/components/site/diagrams";
import { PageHead, Ridge, SCENES } from "@/components/site/ink";
import { ProofBlock } from "@/components/site/proof-block";
import { SellerCases } from "@/components/site/seller-cases";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { DisplayTitle, Eyebrow } from "@/components/ui/typography";
import { api } from "@/lib/api";
import type { Environment } from "@/lib/contract";
import { escrowAdapterGuideHref } from "@/lib/docs";
import { LANGUAGE_STATES } from "@/lib/env";
import { environmentMeta } from "@/lib/status";

export const metadata: Metadata = {
  title: "SDK",
  description:
    "What the SCRIPT//GO SDK is: a portable Lua core, one adapter per host, a .NET host kit, a CLI and the specs, and how an engine integrates it.",
};

// One line each. The full description of every piece is in /docs/sdk#the-pieces.
const PIECES: { title: string; icon: LucideIcon; body: string }[] = [
  { title: "Lua core", icon: Cpu, body: "One API for scripts, on any Lua from 5.1 to 5.4 and LuaJIT." },
  { title: "Adapters", icon: Plug, body: "One per host: it maps the API onto what the host already has." },
  { title: ".NET host kit", icon: Wrench, body: "For C# engines and servers. Runs Lua and TypeScript side by side." },
  { title: "CLI", icon: SquareTerminal, body: "Create, test, publish and install scripts from the command line." },
  { title: "TypeScript types", icon: Braces, body: "Autocomplete for the whole API in your editor." },
  { title: "Specs", icon: FileText, body: "The runtime API, the manifest and the HTTP API, written down." },
];

// States come from LANGUAGE_STATES (lib/env.ts), the one place they change when the evidence does.
const LANGUAGES: { language: string; name: string; body: string }[] = [
  { language: "lua", name: "Lua", body: "On each host’s own Lua, 5.1 to 5.4 or LuaJIT." },
  { language: "ts", name: "TypeScript and JavaScript", body: "On the .NET kit, compiled when you pack or verify." },
];

function languageState(language: string) {
  return LANGUAGE_STATES.find((s) => s.language === language)?.meta;
}

const PLATFORM: { title: string; body: string; href: string; link: string }[] = [
  { title: "Licensing", body: "A key per buyer, one activation per server, checked again on a schedule.", href: "/docs/licensing-api", link: "Licensing API" },
  { title: "Shops on Tebex", body: "On the seller’s own store: a payment there issues a licence here.", href: "/docs/selling#open-a-shop", link: "Open a shop" },
  { title: "Proof by real runs", body: "Statuses come from reports written in the real runtime, never from a form.", href: "/docs/environments#how-a-status-is-earned", link: "How a status is earned" },
  { title: "Imports", body: "scriptgo add checks the hash and the signature before it writes a file.", href: "/docs/cli", link: "scriptgo add" },
];

async function AdapterCounts() {
  const res = await api<Environment[]>("/v1/environments");
  if (!res.ok || res.data.length === 0) return null;
  const runs = res.data.filter((e) => e.status !== "planned").length;
  const tiles = [
    { n: runs, meta: { ...environmentMeta.beta, label: "Runs today", icon: "check" as const, tone: "success" as const }, text: "platforms, each tested for real" },
    { n: res.data.length - runs, meta: environmentMeta.planned, text: "platforms on the roadmap" },
  ];
  return (
    <ul className="mt-9 grid max-w-[440px] grid-cols-2 gap-4 sm:gap-5">
      {tiles.map((t) => (
        <li key={t.meta.label}>
          <Link href="/environments" className="sticker sticker-hover flex h-full flex-col gap-2 p-3 sm:p-4">
            <span className="display tabular text-[40px] leading-none">{t.n}</span>
            <StatusBadge meta={t.meta} size="sm" className="self-start" />
            <span className="text-[13.5px] text-ink-2">{t.text}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ProtectSection() {
  const guide = escrowAdapterGuideHref();
  return (
    <section aria-labelledby="protect-title" className="sec g-night bleed sec-sweeps container-page">
      <Eyebrow className="mb-[18px]">Protection</Eyebrow>
      <DisplayTitle id="protect-title" className="scroll-mt-28 text-[38px] sm:text-[48px]">
        Protect <em>your work.</em>
      </DisplayTitle>
      <p className="one-line mt-4 text-ink-2">Signed releases, a licence per server, and encrypted delivery where the host can hold a key.</p>
      <h3 className="label mt-9">What a host needs for encrypted delivery</h3>
      <Flow
        className="mt-4"
        label="What a host needs for encrypted delivery"
        numbered
        steps={[
          { icon: KeyRound, title: "A server key", note: "Made on the server. The private half never leaves it." },
          { icon: Server, title: "The key endpoint", note: "Answers a short-lived key, wrapped to that server.", accent: "cobalt" },
          { icon: Cpu, title: "A loader in compiled code", note: "Checks the signature, decrypts in memory.", accent: "ink" },
        ]}
      />
      <div className="cta-row mt-9 items-center">
        <ButtonLink href="/protect" variant="sun" arrow>
          How protection works
        </ButtonLink>
        <ReadMore href={guide ?? "/docs/protect-your-work"}>{guide ? "Bring escrow to your platform" : "Read the protection guide"}</ReadMore>
      </div>
    </section>
  );
}

export default function SdkPage() {
  return (
    <div>
      <PageHead
        id="sdk-title"
        tag="SDK"
        art={{ ...SCENES.workbench, position: "70% 40%" }}
        title={
          <>
            The <em>SDK.</em>
          </>
        }
        lede="One API for your scripts, and the pieces that run it on every host."
      >
        <div className="cta-row mt-8 items-center">
          <ButtonLink href="/docs/create-adapter" variant="sun" size="lg" arrow>
            Write an adapter
          </ButtonLink>
          <ButtonLink href="/docs/dotnet-kit" variant="secondary" size="lg">
            Embed the .NET kit
          </ButtonLink>
        </div>
        <AdapterCounts />
      </PageHead>

      <section aria-labelledby="pieces-title" className="sec g-paper bleed sec-sweeps container-page !pt-12">
        <div className="sec-head">
          <div>
            <Eyebrow className="mb-[18px]">The pieces</Eyebrow>
            <DisplayTitle id="pieces-title" className="text-[38px] sm:text-[48px]">
              What is <em>in it.</em>
            </DisplayTitle>
          </div>
          <ReadMore href="/docs/sdk#the-pieces">Each piece, in detail</ReadMore>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PIECES.map((p) => (
            <li key={p.title} className="sticker flex gap-4 p-4">
              <span aria-hidden="true" className="flow-ic mt-0.5">
                <p.icon size={20} strokeWidth={2.4} />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-[19px] font-extrabold leading-tight">{p.title}</h3>
                <p className="mt-1.5 text-[14.5px] text-ink-2">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Ridge from="paper" to="paper2" ink="sun" n={1} />
      <section aria-labelledby="paths-title" className="sec g-paper2 sec-sweeps !pt-10">
        <div className="container-page">
          <Eyebrow className="mb-[18px]">Integrate</Eyebrow>
          <DisplayTitle id="paths-title" className="text-[38px] sm:text-[48px]">
            Two ways to <em>integrate.</em>
          </DisplayTitle>
          <div className="pcards pcards-2 mt-9">
            <PictureCard art={SCENES.adapter} label="Your host runs Lua" title="Write an adapter." more={{ href: "/docs/create-adapter", label: "Create an adapter" }}>
              One table maps the API onto your host, as an addon, a mod, a plugin or a shim.
            </PictureCard>
            <PictureCard
              art={SCENES.toolcase}
              label="Your engine has no Lua"
              title="Embed a host kit."
              more={{ href: "/docs/dotnet-kit", label: "Embed the .NET kit" }}
            >
              A C# engine references the kit and its users write Lua or TypeScript.
            </PictureCard>
          </div>
        </div>
      </section>

      <Ridge from="paper2" to="sun" ink="orange" n={2} />
      <section aria-labelledby="languages-title" className="sec g-sun bleed sec-sweeps container-page !pt-10">
        <div className="sec-head">
          <div>
            <Eyebrow className="mb-[18px]">Languages</Eyebrow>
            <DisplayTitle id="languages-title" className="text-[38px] sm:text-[48px]">
              One API, <em>every language.</em>
            </DisplayTitle>
          </div>
          <ReadMore href="/docs/sdk#languages">How languages meet</ReadMore>
        </div>
        <ul className="grid gap-7 md:grid-cols-2">
          {LANGUAGES.map((l) => (
            <li key={l.name} className="sticker flex flex-col gap-2.5 p-5">
              <h3 className="font-display text-[21px] font-extrabold leading-tight">{l.name}</h3>
              {languageState(l.language) ? <StatusBadge meta={languageState(l.language)!} size="sm" className="self-start" /> : null}
              <p className="text-[14.5px] text-ink-2">{l.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <Ridge from="sun" to="cobalt" ink="violet" n={3} />
      <section aria-labelledby="platform-title" className="sec g-cobalt sec-sweeps !pt-10">
        <div className="container-page">
          <Eyebrow className="mb-[18px]">The platform</Eyebrow>
          <DisplayTitle id="platform-title" className="text-[38px] sm:text-[48px]">
            On top of <em>the SDK.</em>
          </DisplayTitle>
          <ul className="mt-9 grid gap-7 md:grid-cols-2 lg:grid-cols-4">
            {PLATFORM.map((p) => (
              <li key={p.title} className="sticker flex flex-col gap-2.5 p-5">
                <h3 className="font-display text-[19px] font-extrabold leading-tight">{p.title}</h3>
                <p className="text-[14.5px] text-ink-2">{p.body}</p>
                <ReadMore href={p.href} className="mt-auto self-start !text-[14px]">
                  {p.link}
                </ReadMore>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Ridge from="cobalt" to="paper" ink="sun" n={2} />
      <section aria-labelledby="earn-title" className="sec g-paper bleed sec-sweeps container-page !pt-10">
        <Eyebrow className="mb-[18px]">Monetize</Eyebrow>
        <DisplayTitle id="earn-title" className="text-[38px] sm:text-[48px]">
          Two ways to <em>earn with it.</em>
        </DisplayTitle>
        <p className="one-line mt-4 text-ink-2">What is sold is the seller&rsquo;s own code, as a SCRIPT//GO script that runs on the environments it declares.</p>
        <SellerCases className="mt-9" />
      </section>

      <Ridge from="paper" to="night" ink="cobalt" n={0} />
      <ProtectSection />

      <Ridge from="night" to="paper2" ink="cobalt" n={1} />
      <section aria-labelledby="proof-title" className="sec g-paper2 bleed sec-sweeps container-page !pt-10">
        <Eyebrow className="mb-[18px]">One module, every runtime</Eyebrow>
        <DisplayTitle id="proof-title" className="text-[38px] sm:text-[48px]">
          Same code. <em>Real output.</em>
        </DisplayTitle>
        <p className="one-line mt-4 text-ink-2">A package&rsquo;s README example, and what each environment printed when it ran.</p>
        <div className="mt-8">
          <Suspense
            fallback={
              <div className="h-[340px] animate-pulse border-[2.5px] border-dashed border-line-soft" aria-busy="true">
                <span className="sr-only">Loading…</span>
              </div>
            }
          >
            <ProofBlock />
          </Suspense>
        </div>
      </section>

    </div>
  );
}
