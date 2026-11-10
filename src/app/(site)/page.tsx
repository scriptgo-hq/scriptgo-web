import Link from "next/link";
import { FileSignature, KeyRound, Lock, Server } from "lucide-react";
import { WorldCtas, WorldName, WorldNow, WorldPicker, WorldPlugLine, WorldProvider, type World } from "@/components/site/home-worlds";
import { ReadMore } from "@/components/site/diagrams";
import { Art, Ridge, SCENES, Section, SectionHead } from "@/components/site/ink";
import { SellerCases } from "@/components/site/seller-cases";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CommandLine } from "@/components/ui/code-block";
import { EnvMonogramTile } from "@/components/ui/environment";
import { ApiError } from "@/components/ui/feedback";
import { StatusIcon } from "@/components/ui/icon";
import { api } from "@/lib/api";
import type { Environment } from "@/lib/contract";
import { LANGUAGE_STATES, envMonogram } from "@/lib/env";
import { formatDate } from "@/lib/format";
import { adapterMetaFor } from "@/lib/integration";
import { groupByTier, tierHeading } from "@/lib/protection";
import { environmentMeta, metaFor } from "@/lib/status";
import { DEFAULT_WORLD, PICKER_ORDER, shortEnvName, worldArt } from "@/lib/worlds";

type SP = Record<string, string | string[] | undefined>;

const BUILD_TILES: { label: string; art: string; c: string; ct?: string }[] = [
  { label: "Economies", art: "cover-economy", c: "#7a3cc8" },
  { label: "Inventories", art: "cover-inventory", c: "#0f8a8a" },
  { label: "Garages", art: "cover-garage", c: "#d6383d" },
  { label: "Jobs & quests", art: "cover-quests", c: "#2f8f4e" },
  { label: "Housing", art: "cover-housing", c: "#f08a2c", ct: "#0b0b1e" },
  { label: "Admin tools", art: "cover-admin", c: "#51607f" },
  { label: "HUDs", art: "cover-hud", c: "#2f3ce0" },
  { label: "Frameworks", art: "cover-permissions", c: "#ffc83d", ct: "#0b0b1e" },
];

const MATRIX_ORDER = ["standalone", "godot", "garrysmod", "cctweaked", "rust", "open77", "fivem"];

function toWorld(e: Environment): World | null {
  const w = worldArt(e.slug);
  if (!w) return null;
  return {
    slug: e.slug,
    name: shortEnvName(e.name),
    kind: w.kind,
    art: w.art,
    tint: w.tint,
    status: metaFor(environmentMeta, e.status),
    adapter: adapterMetaFor(e.adapterState).long,
    runtime: e.runtimeVersions[0] ?? null,
    hasSetup: e.status !== "planned",
  };
}

export default async function HomePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const asked = Array.isArray(sp.w) ? sp.w[0] : sp.w;
  const res = await api<Environment[]>("/v1/environments");
  const envs = res.ok ? res.data : [];
  const worlds = PICKER_ORDER.map((slug) => envs.find((e) => e.slug === slug))
    .map((e) => (e ? toWorld(e) : null))
    .filter((w): w is World => w !== null);
  // Godot 4 unless a link asks for another one (/?w=rust).
  const initial = worlds.find((w) => w.slug === asked)?.slug ?? worlds.find((w) => w.slug === DEFAULT_WORLD)?.slug ?? worlds[0]?.slug ?? "";

  return (
    <>
      {worlds.length > 0 ? (
        <WorldProvider worlds={worlds} initial={initial}>
          <Hero now={<WorldNow />} cta={<WorldCtas />} />
          <div className="container-page worlds-wrap">
            <WorldPicker more={Math.max(0, envs.length - worlds.length)} />
          </div>
          <Setup platform={<WorldName />} plug={<WorldPlugLine />} />
        </WorldProvider>
      ) : (
        <>
          <Hero
            now={
              <div className="lobby-now">
                <p className="tag">
                  <span aria-hidden="true" className="tag-slashes" />
                  <span className="tag-plate">The SDK</span>
                </p>
              </div>
            }
            cta={
              <div className="cta-row mt-8">
                <ButtonLink href="/sign-up" variant="sun" size="lg" arrow>
                  Create your account
                </ButtonLink>
                <ButtonLink href="/docs/sdk" variant="secondary" size="lg">
                  Read the SDK docs
                </ButtonLink>
              </div>
            }
          />
          <div className="container-page worlds-wrap">
            {!res.ok ? <ApiError failure={res} title="The platform list could not be loaded." /> : null}
          </div>
          <Setup platform="your platform" plug={null} />
        </>
      )}

      <Ridge from="paper" to="paper2" ink="sun" n={1} />
      <Build />

      <Ridge from="paper2" to="cobalt" ink="violet" n={2} />
      <Earn />

      <Ridge from="cobalt" to="night" ink="deep" n={3} />
      <Protection envs={envs} />

      <Ridge from="night" to="sun" ink="cobalt" n={0} />
      <Platforms envs={envs} failure={res.ok ? null : res} />

      <Ridge from="sun" to="paper" ink="orange" n={1} />
      <ForPlatforms />
    </>
  );
}

/** The lobby: the traveller on the ridge (one fixed picture), the promise, and the ways in. */
function Hero({ now, cta }: { now: React.ReactNode; cta: React.ReactNode }) {
  return (
    <section className="lobby" aria-labelledby="hero-title">
      <div className="lobby-art" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SCENES.hero.src}
          srcSet={SCENES.hero.srcSet}
          sizes="(max-width: 700px) 260vw, 125vw"
          width={SCENES.hero.width}
          height={SCENES.hero.height}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      </div>
      <div className="container-page">
        <div className="lobby-main">
          <div className="min-w-0">
            {now}
            <h1 id="hero-title" className="display">
              Scripts for every world <em>you run.</em>
            </h1>
            <p className="lede">
              A scripting sandbox for the games you run: build on it, protect what you wrote, sell it from your own Tebex shop.
            </p>
            {cta}
            <p className="langs mt-[22px]">
              {LANGUAGE_STATES.map((l) => {
                const [name, where] = l.meta.label.split(": ");
                return (
                  <span key={l.language} title={l.meta.hint}>
                    <b>{name}</b> {where}
                  </span>
                );
              })}
            </p>
          </div>
        </div>
      </div>
      <div className="lobby-ridge">
        <Ridge from="transparent" to="paper" ink="cobalt" n={0} />
      </div>
    </section>
  );
}

/** A real sequence, so it is numbered: account, SDK, script, store. One sentence per step. */
function Setup({ platform, plug }: { platform: React.ReactNode; plug: React.ReactNode }) {
  return (
    <Section ground="paper" id="setup" aria-labelledby="setup-title" className="!pt-14">
      <SectionHead
        tag="Set up"
        id="setup-title"
        title={
          <>
            From sign-up to first sale, on <em>{platform}</em>
          </>
        }
        aside={<ReadMore href="/docs/quickstart">Full quickstart</ReadMore>}
      />

      <ol className="flow">
        <li className="step">
          <span className="step-n" aria-hidden="true">
            1
          </span>
          <h3 className="font-display text-[19px] font-extrabold leading-tight">
            <span className="sr-only">Step 1: </span>Create your account
          </h3>
          <p className="text-[15.5px]">Sign up and make your key in the dashboard settings.</p>
          <div className="ink-line">
            <KeyRound aria-hidden="true" size={16} strokeWidth={2.25} className="shrink-0" />
            <span>sg_pat_••••••••••••</span>
          </div>
        </li>
        <li className="step">
          <span className="step-n" aria-hidden="true">
            2
          </span>
          <h3 className="font-display text-[19px] font-extrabold leading-tight">
            <span className="sr-only">Step 2: </span>Plug the SDK in
          </h3>
          {plug ?? <p className="text-[15.5px]">One adapter maps the sandbox onto your platform.</p>}
          <CommandLine command="scriptgo init my_resource" className="!shadow-none" />
        </li>
        <li className="step">
          <span className="step-n" aria-hidden="true">
            3
          </span>
          <h3 className="font-display text-[19px] font-extrabold leading-tight">
            <span className="sr-only">Step 3: </span>Build on top
          </h3>
          <p className="text-[15.5px]">Write your scripts in Lua, or in TypeScript on the .NET kit.</p>
          <CommandLine command="scriptgo test" className="!shadow-none" />
        </li>
        <li className="step step-pay">
          <span className="step-n" aria-hidden="true">
            4
          </span>
          <h3 className="font-display text-[19px] font-extrabold leading-tight">
            <span className="sr-only">Step 4: </span>Open your shop
          </h3>
          <p className="text-[15.5px]">On your own Tebex store. A payment there issues a licence here.</p>
          <div className="sheet flex flex-wrap items-center justify-between gap-2 border-2 border-line bg-surface px-3 py-2 text-[14px]">
            <b>Your store</b>
            <StatusBadge size="sm" meta={{ label: "Checkout not live yet", tone: "warning", icon: "lock", hint: "Real checkout stays off, for every shop, until Tebex approves it in writing." }} />
          </div>
        </li>
      </ol>
    </Section>
  );
}

/** What the sandbox is for. The tiles are pictures, not a catalogue. */
function Build() {
  return (
    <Section ground="paper2" aria-labelledby="build-title" className="!pt-10">
      <SectionHead
        tag="On top of the SDK"
        id="build-title"
        title={
          <>
            What will you <em>build?</em>
          </>
        }
        aside={<ReadMore href="/docs/runtime">The runtime API</ReadMore>}
      >
        Events, storage, players, permissions and more. What you make with them is yours to sell.
      </SectionHead>
      <ul className="cats">
        {BUILD_TILES.map((t) => (
          <li key={t.label} className="cat" style={{ "--c": t.c, "--ct": t.ct } as React.CSSProperties}>
            <Art src={`/ink/${t.art}.webp`} width={800} height={500} />
            <span className="cat-name">{t.label}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** The two seller cases: the same pictures as on /sdk and /protect (components/site/seller-cases). */
function Earn() {
  return (
    <Section ground="cobalt" id="earn" aria-labelledby="earn-title">
      <SectionHead
        tag="Monetize"
        id="earn-title"
        title={
          <>
            Two ways to <em>earn with it.</em>
          </>
        }
        aside={<ReadMore href="/docs/selling">How selling works</ReadMore>}
      >
        You sell your own code, from your own Tebex store. Real checkout is not live yet.
      </SectionHead>
      <SellerCases />
    </Section>
  );
}

/** What protection is, in three lines and one limit. Counts come from the registry. */
function Protection({ envs }: { envs: Environment[] }) {
  const tiers = groupByTier(envs);
  return (
    <Section ground="night" aria-labelledby="protection-title">
      <div className="split">
        <div className="plate">
          <Art src={SCENES.strongbox.src} width={SCENES.strongbox.width} height={SCENES.strongbox.height} />
          {tiers.length > 0 ? (
            <div className="sheet-card pin left">
              <div className="sheet-head">
                <strong className="font-display text-[18px] font-extrabold">Protection by host</strong>
                <span className="label">Platforms</span>
              </div>
              <ul className="divide-y-[1.5px] divide-line-soft">
                {tiers.map((g) => {
                  const planned = g.envs.filter((e) => e.protection.state === "planned").length;
                  return (
                    <li key={g.tier} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-[18px] py-2.5 text-[14.5px]">
                      <b>{tierHeading(g.tier)}</b>
                      <span className="tabular text-ink-2">
                        {g.envs.length - planned} today{planned > 0 ? `, ${planned} planned` : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="min-w-0">
          <SectionHead
            tag="Protection"
            id="protection-title"
            className="!mb-5"
            title={
              <>
                Your code stays yours <em>after the sale.</em>
              </>
            }
          >
            A buyer gets a licence, not a zip to pass around.
          </SectionHead>
          <ul className="facts text-[16px]" style={{ "--fact": "#ffc83d" } as React.CSSProperties}>
            <li>
              <FileSignature aria-hidden="true" strokeWidth={2.4} />
              <span>
                <b>Signed releases.</b> An altered file is refused.
              </span>
            </li>
            <li>
              <Server aria-hidden="true" strokeWidth={2.4} />
              <span>
                <b>One licence per server.</b> A copy elsewhere gets no key.
              </span>
            </li>
            <li>
              <Lock aria-hidden="true" strokeWidth={2.4} />
              <span>
                <b>Encrypted delivery</b> where the host can hold a key. Server scripts only.
              </span>
            </li>
          </ul>
          <p className="mt-5 text-[15px] text-ink-2">It deters copying and traces leaks. It does not make copying impossible.</p>
          <div className="cta-row mt-7 items-center">
            <ButtonLink href="/protect" variant="sun" arrow>
              How protection works
            </ButtonLink>
            <ReadMore href="/docs/protect-your-work#what-it-does-not-do">What it does not do</ReadMore>
          </div>
        </div>
      </div>
    </Section>
  );
}

/** Statuses as the directory shows them today: registry rows, real runtimes, real run dates. */
function Platforms({ envs, failure }: { envs: Environment[]; failure: Parameters<typeof ApiError>[0]["failure"] | null }) {
  const rows = MATRIX_ORDER.map((slug) => envs.find((e) => e.slug === slug)).filter((e): e is Environment => Boolean(e));
  return (
    <Section ground="sun" aria-labelledby="platforms-title">
      <div className="split">
        <div className="min-w-0">
          <SectionHead
            tag="Platforms"
            id="platforms-title"
            className="!mb-5"
            title={
              <>
                Checked by a real run, <em>not promised.</em>
              </>
            }
          >
            Every status comes from a recorded run, never from a form.
          </SectionHead>
          <ul className="facts text-[16px]">
            {(["available", "beta", "experimental", "planned"] as const).map((s) => {
              const m = environmentMeta[s];
              return (
                <li key={s}>
                  <StatusIcon name={m.icon} size={22} />
                  <span>
                    <b>{m.label}.</b> {m.hint}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-7">
            <ButtonLink href="/environments" variant="ink" size="lg" arrow>
              {envs.length > 0 ? `See all ${envs.length} platforms` : "See all platforms"}
            </ButtonLink>
          </div>
        </div>
        <div className="min-w-0">
          {failure ? (
            <ApiError failure={failure} title="Platform statuses could not be loaded." />
          ) : (
            <div className="sheet-card lg:rotate-[0.8deg]">
              <div className="sheet-head">
                <strong className="font-display text-[18px] font-extrabold">SCRIPT//GO SDK</strong>
                <span className="label">Recorded runs</span>
              </div>
              <div className="overflow-x-auto">
                <table className="matrix">
                  <caption className="sr-only">Status, runtime and last recorded run of a few platforms</caption>
                  <thead>
                    <tr>
                      <th scope="col">Platform</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="hide-s">
                        Runtime
                      </th>
                      <th scope="col" className="hide-s">
                        Last run
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((e) => (
                      <tr key={e.slug}>
                        <td>
                          <Link href={`/environments/${encodeURIComponent(e.slug)}`} className="inline-flex items-center gap-2.5 whitespace-nowrap font-bold hover:underline">
                            <EnvMonogramTile label={envMonogram(e.slug, e.name)} className={e.adapterState === "verified" ? undefined : "tok-muted"} />
                            {shortEnvName(e.name)}
                          </Link>
                        </td>
                        <td>
                          <StatusBadge meta={metaFor(environmentMeta, e.status)} size="sm" />
                        </td>
                        <td className="num hide-s max-w-[190px] truncate" title={e.runtimeVersions[0]}>
                          {e.runtimeVersions[0] ?? "—"}
                        </td>
                        <td className="num hide-s whitespace-nowrap">{e.lastRun ? formatDate(e.lastRun.ranAt) : "No run yet"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

/** For the people who run an engine or a mod platform. */
function ForPlatforms() {
  return (
    <Section ground="paper" id="sdk" aria-labelledby="add-title">
      <div className="split">
        <div className="plate">
          <Art src={SCENES.adapter.src} width={SCENES.adapter.width} height={SCENES.adapter.height} />
        </div>
        <div className="min-w-0">
          <SectionHead
            tag="For platforms"
            id="add-title"
            className="!mb-5"
            title={
              <>
                Your platform is not on the list? <em>Add it.</em>
              </>
            }
          >
            Write one adapter, or embed the .NET host kit, and SCRIPT//GO scripts run on your platform.
          </SectionHead>
          <div className="cta-row mt-7">
            <ButtonLink href="/docs/create-adapter" variant="primary" size="lg">
              Write an adapter
            </ButtonLink>
            <ButtonLink href="/sdk" variant="secondary" size="lg">
              See the SDK
            </ButtonLink>
          </div>
        </div>
      </div>
    </Section>
  );
}
