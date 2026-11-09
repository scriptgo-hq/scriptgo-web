import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Puzzle, Scale } from "lucide-react";
import { HeroScene, StepAdaptArt, StepBuildArt, StepMonetizeArt } from "@/components/illustrations";
import { CreatorCta } from "@/components/site/creator-cta";
import { ProofBlock } from "@/components/site/proof-block";
import { ButtonLink } from "@/components/ui/button";
import { EnvironmentTile } from "@/components/ui/environment";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { PackageCard } from "@/components/ui/package";
import { DisplayTitle, Eyebrow, Stroke, Underlined } from "@/components/ui/typography";
import { api } from "@/lib/api";
import type { Environment, Page, PackageSummary, Stats } from "@/lib/contract";
import { formatCount } from "@/lib/format";
import { ENV_STATUS_ORDER } from "@/lib/status";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <section aria-labelledby="proof-title" className="border-t-2 border-line-soft bg-paper-2/60 py-14">
        <div className="container-page">
          <Eyebrow>one module, every runtime</Eyebrow>
          <DisplayTitle id="proof-title" className="mt-2 text-[40px] sm:text-[48px]">
            Same code. Real output.
          </DisplayTitle>
          <p className="mt-3 max-w-2xl text-[16px] text-ink-2">
            A shared module on the left, and what each environment printed when CI ran it. Every line on the right comes
            from a recorded compatibility run.
          </p>
          <div className="mt-8">
            <Suspense fallback={<SkeletonBlock h={340} />}>
              <ProofBlock />
            </Suspense>
          </div>
        </div>
      </section>
      <Suspense fallback={<SkeletonBlock h={260} />}>
        <EnvironmentsStrip />
      </Suspense>
      <Suspense fallback={<SkeletonBlock h={320} />}>
        <Featured />
      </Suspense>
      <SideDoors />
      <CreatorCta className="mt-6" />
    </>
  );
}

function SkeletonBlock({ h }: { h: number }) {
  return (
    <div className="container-page py-6" aria-busy="true" aria-live="polite">
      <div className="animate-pulse rounded-[10px] border-2 border-dashed border-line-soft bg-surface-2/60" style={{ height: h }}>
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}

async function HeroStats() {
  const res = await api<Stats>("/v1/stats", { timeoutMs: 3000 });
  if (!res.ok || res.data.packages === 0) return null;
  const s = res.data;
  return (
    <p className="tabular mt-6 font-mono text-[12.5px] text-ink-3">
      {formatCount(s.packages)} packages · {formatCount(s.creators)} creators · {formatCount(s.environmentsVerified)} environments with
      verified runs
    </p>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -right-[10%] bottom-0 top-[30%] -z-10 hidden w-[75%] bg-cobalt lg:block"
        style={{ clipPath: "polygon(38% 22%, 100% 0, 100% 100%, 0 100%)" }}
      />
      <div className="container-page grid items-center gap-8 pb-12 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:pb-16 lg:pt-14">
        <div className="min-w-0">
          <h1 id="hero-title" className="display text-[52px] sm:text-[72px] xl:text-[84px]">
            Your scripts.
            <br />
            <span className="display-italic text-cobalt-ink">
              Every <Underlined>environment.</Underlined>
            </span>
          </h1>
          <p className="mt-6 max-w-[34ch] text-[18px] leading-relaxed text-ink-2 sm:text-[19px]">
            Create, license and run Lua resources across games, multiplayer platforms and applications.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/docs/quickstart" variant="primary" size="lg" arrow>
              Start building
            </ButtonLink>
            <ButtonLink href="/explore" variant="secondary" size="lg">
              Explore scripts
            </ButtonLink>
            <Link href="/environments" className="inline-flex h-12 items-center px-2 font-bold text-ink underline-offset-4 hover:underline">
              Environments
            </Link>
          </div>
          <Suspense fallback={null}>
            <HeroStats />
          </Suspense>
        </div>
        <div className="relative min-w-0">
          <div aria-hidden="true" className="band-cobalt absolute inset-x-[-16px] bottom-[6%] top-[22%] -z-10 lg:hidden" />
          <HeroScene
            className="mx-auto w-full max-w-[640px]"
            title="Illustration: one Lua script connected to four environment windows labelled Godot, LÖVE, Luanti and OPEN//77."
          />
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: 1,
      title: "Build.",
      body: "Write a Lua resource once, against standard capabilities like events and storage.",
      Art: StepBuildArt,
    },
    {
      n: 2,
      title: "Adapt.",
      body: "Adapters map those capabilities onto each runtime. CI runs it there to prove it.",
      Art: StepAdaptArt,
    },
    {
      n: 3,
      title: "Monetize.",
      body: "Sell licenses or subscriptions through your own store. Free stays free.",
      Art: StepMonetizeArt,
    },
  ];
  return (
    <section aria-labelledby="how-title" className="border-t-2 border-line-soft py-12">
      <div className="container-page grid gap-8 lg:grid-cols-[220px_1fr] lg:items-center">
        <div>
          <DisplayTitle id="how-title" className="text-[44px] sm:text-[52px]">
            How
            <br />
            it works.
          </DisplayTitle>
          <Stroke className="mt-2" />
        </div>
        <ol className="grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.n} className="relative">
              <div className="flex items-end gap-2">
                <span
                  aria-hidden="true"
                  className="mb-6 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-line bg-sun font-display text-[18px] font-black text-on-sun"
                >
                  {s.n}
                </span>
                <s.Art className="h-[120px] w-auto max-w-full" />
                {i < steps.length - 1 ? (
                  <ArrowRight aria-hidden="true" className="mb-12 ml-auto hidden shrink-0 text-ink xl:block" size={30} strokeWidth={2.75} />
                ) : null}
              </div>
              <h3 className="mt-2 font-display text-[24px] font-extrabold tracking-[-0.02em]">
                <span className="sr-only">Step {s.n}: </span>
                {s.title}
              </h3>
              <p className="mt-1 max-w-[30ch] text-[15px] text-ink-2">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

async function EnvironmentsStrip() {
  const res = await api<Environment[]>("/v1/environments");
  return (
    <section aria-labelledby="envs-title" className="relative isolate py-14">
      <div className="container-page grid gap-6 lg:grid-cols-[290px_1fr] lg:items-center">
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -left-[60px] -right-2 -top-6 -bottom-6 -z-10 bg-cobalt lg:-left-[200px]"
            style={{ clipPath: "polygon(0 8%, 100% 0, 88% 100%, 0 92%)" }}
          />
          <h2 id="envs-title" className="display-italic py-6 pr-6 text-[32px] leading-[0.95] text-white sm:text-[36px]">
            Supported
            <br />
            environments.
          </h2>
        </div>
        <div className="min-w-0">
          {!res.ok ? (
            <ApiError failure={res} title="Environment statuses could not be loaded." />
          ) : res.data.length === 0 ? (
            <EmptyState title="No environments registered yet" />
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
                {[...res.data]
                  .sort((a, b) => (ENV_STATUS_ORDER[a.status] ?? 9) - (ENV_STATUS_ORDER[b.status] ?? 9) || a.name.localeCompare(b.name))
                  .slice(0, 5)
                  .map((env) => (
                    <li key={env.slug}>
                      <EnvironmentTile env={env} className="h-full" />
                    </li>
                  ))}
              </ul>
              <div className="mt-4 flex justify-end">
                <Link href="/environments" className="inline-flex items-center gap-1 font-bold text-cobalt-ink hover:underline">
                  View all environments <ArrowRight aria-hidden="true" size={16} strokeWidth={2.5} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

async function Featured() {
  const res = await api<Page<PackageSummary>>("/v1/packages?sort=downloads&pageSize=4");
  return (
    <section aria-labelledby="featured-title" className="border-t-2 border-line-soft py-14">
      <div className="container-page grid gap-6 lg:grid-cols-[220px_1fr]">
        <div>
          <DisplayTitle id="featured-title" className="text-[40px] sm:text-[44px]">
            Featured
            <br />
            scripts.
          </DisplayTitle>
          <Eyebrow className="mt-3">most downloaded</Eyebrow>
          <Link href="/explore" className="mt-4 inline-flex items-center gap-1 font-bold text-cobalt-ink hover:underline">
            Explore all <ArrowRight aria-hidden="true" size={16} strokeWidth={2.5} />
          </Link>
        </div>
        <div className="min-w-0">
          {!res.ok ? (
            <ApiError failure={res} title="Scripts could not be loaded." />
          ) : res.data.items.length === 0 ? (
            <EmptyState title="No scripts published yet">Published packages appear here as soon as they are listed.</EmptyState>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {res.data.items.map((p) => (
                <li key={p.id}>
                  <PackageCard pkg={p} showSummary className="h-full" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function SideDoors() {
  const doors = [
    {
      href: "/docs/create-adapter",
      icon: Puzzle,
      eyebrow: "for platform builders",
      title: "Add SCRIPT//GO to your engine.",
      body: "Implement the capability contracts in one adapter file, run the shared tests, and your users get every portable package.",
    },
    {
      href: "/legal",
      icon: Scale,
      eyebrow: "rights and licensing",
      title: "Who sells, who charges, who licenses.",
      body: "Creators sell. A payment provider takes the payment. SCRIPT//GO issues the license. Read the IP policy and who operates the platform.",
    },
    {
      href: "/docs",
      icon: BookOpen,
      eyebrow: "docs",
      title: "Manifest, runtime and API.",
      body: "The scriptgo.lua manifest, the runtime globals, capabilities and the HTTP contract, in plain language.",
    },
  ];
  return (
    <section aria-label="Where to go next" className="py-10">
      <ul className="container-page grid gap-5 md:grid-cols-3">
        {doors.map((d) => (
          <li key={d.href}>
            <Link href={d.href} className="sticker sticker-hover flex h-full flex-col gap-2 p-5">
              <d.icon aria-hidden="true" size={22} strokeWidth={2.25} className="text-cobalt-ink" />
              <Eyebrow>{d.eyebrow}</Eyebrow>
              <span className="font-display text-[21px] font-extrabold leading-tight tracking-[-0.015em]">{d.title}</span>
              <span className="text-[14.5px] text-ink-2">{d.body}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
