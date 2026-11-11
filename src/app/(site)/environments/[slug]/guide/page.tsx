/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CornerDownRight, Info } from "lucide-react";
import { OneLiners, ReadMore } from "@/components/site/diagrams";
import { PageHead, Ridge, type Ground } from "@/components/site/ink";
import { StatusBadge } from "@/components/ui/badge";
import { CodeBlock, CommandLine } from "@/components/ui/code-block";
import { Breadcrumb } from "@/components/ui/data";
import { Banner } from "@/components/ui/feedback";
import { InlineCodeText } from "@/components/ui/integration";
import { DisplayTitle, Eyebrow } from "@/components/ui/typography";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { EnvironmentDetail } from "@/lib/contract";
import { guideFor, type GuideImage, type GuideStep, type GuideTrack } from "@/lib/guides";
import { protectionMeta } from "@/lib/protection";
import { capabilityMeta, environmentMeta, metaFor } from "@/lib/status";
import { worldArt, worldSrc, WORLD_SIZE } from "@/lib/worlds";
import { TrackButtons, TrackPanels, TRACKS_ANCHOR, type TrackChoice } from "./track-switch";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const g = guideFor(slug);
  if (!g) return { title: "Guide" };
  return { title: `Sell on ${g.name}: step by step`, description: g.lede };
}

/** A real dashboard screen or a drawing, framed like every sheet of the site. */
function Shot({ img }: { img: GuideImage }) {
  const picture = (
    <img
      src={img.src}
      width={img.width}
      height={img.height}
      alt={img.alt}
      loading="lazy"
      decoding="async"
      className={cn("block h-auto w-full", img.kind === "scene" && "aspect-[16/9] object-cover")}
    />
  );
  return (
    <figure className="min-w-0">
      {img.kind === "screen" ? (
        // A screen is shown smaller than it was taken: it opens at full size.
        <a href={img.src} target="_blank" rel="noopener" title="Open the screen at full size" className="sticker sticker-hover block overflow-hidden bg-[#f3ecdc]">
          {picture}
        </a>
      ) : (
        <div className="sticker overflow-hidden">{picture}</div>
      )}
      {img.caption ? <figcaption className="mt-3 text-[13.5px] text-ink-3">{img.caption}</figcaption> : null}
    </figure>
  );
}

/** A step's anchor: step ids repeat across tracks, so the track prefixes them. */
function stepAnchor(t: GuideTrack, s: GuideStep): string {
  return `${t.id}-${s.id}`;
}

function Step({ step: s, anchor, n, flip }: { step: GuideStep; anchor: string; n: number; flip: boolean }) {
  return (
    <li id={anchor} className="grid scroll-mt-28 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-12">
      <div className={cn("min-w-0", flip && "lg:order-2")}>
        <div className="flex items-start gap-4">
          <span aria-hidden="true" className="num-slab mt-0.5">
            {n}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[22px] font-black leading-tight tracking-[-0.02em] sm:text-[25px]">
              <span className="sr-only">Step {n}: </span>
              {s.title}
            </h3>
            <p className="mt-2 max-w-[60ch] text-[16px] leading-relaxed text-ink-2">
              <InlineCodeText text={s.text} />
            </p>
          </div>
        </div>
        {s.commands?.length ? (
          <div className="mt-5 space-y-2.5">
            {s.commands.map((c) => (
              <CommandLine key={c} command={c} />
            ))}
          </div>
        ) : null}
        {s.code?.map((c) => (
          <CodeBlock key={c.filename} className="mt-5" code={c.code} lang={c.lang} filename={c.filename} />
        ))}
        {s.notes?.length ? (
          <OneLiners className="mt-5 !gap-2.5 !text-[14.5px] text-ink-2" icon={CornerDownRight} items={s.notes.map((t) => <InlineCodeText key={t} text={t} />)} />
        ) : null}
        {s.link ? (
          <p className="mt-5">
            <ReadMore href={s.link.href} className="!text-[14.5px]">
              {s.link.label}
            </ReadMore>
          </p>
        ) : null}
      </div>
      <div className={cn("min-w-0 space-y-5", flip && "lg:order-1")}>
        {s.images.map((img) => (
          <Shot key={img.src} img={img} />
        ))}
      </div>
    </li>
  );
}

/** Consecutive steps, cut where the track changes hands (`who`). Numbers run on across the cut. */
function groups(steps: GuideStep[]): { who?: string; start: number; steps: GuideStep[] }[] {
  const out: { who?: string; start: number; steps: GuideStep[] }[] = [];
  steps.forEach((s, i) => {
    if (i === 0 || s.who) out.push({ who: s.who, start: i + 1, steps: [] });
    out[out.length - 1]!.steps.push(s);
  });
  return out;
}

function Track({ track: t, ground }: { track: GuideTrack; ground: Ground }) {
  let n = 0;
  return (
    <section id={t.id} aria-labelledby={`${t.id}-title`} className={cn("sec bleed sec-sweeps container-page scroll-mt-20 !pt-10", ground === "paper" ? "g-paper" : "g-paper2")}>
      <div className="sec-head">
        <div className="min-w-0">
          <Eyebrow className="mb-[18px]">{t.tag}</Eyebrow>
          <DisplayTitle id={`${t.id}-title`} className="text-[38px] sm:text-[48px]">
            {t.title} <em>{t.titleEm}</em>
          </DisplayTitle>
          <p className="one-line mt-4 text-ink-2">{t.lede}</p>
        </div>
      </div>
      {t.before?.length ? (
        <div className="panel mb-12 max-w-[78ch] p-4">
          <OneLiners className="!gap-2.5 !text-[15px]" icon={Info} items={t.before.map((b) => <InlineCodeText key={b} text={b} />)} />
        </div>
      ) : null}
      {groups(t.steps).map((g) => (
        <div key={g.start} className={g.who ? "mt-20" : undefined}>
          {g.who ? (
            <div className="mb-10 flex flex-wrap items-center gap-4 border-t-[2.5px] border-dashed border-line-soft pt-8">
              <Eyebrow>{g.who}</Eyebrow>
            </div>
          ) : null}
          <ol start={g.start} aria-label={g.who ?? `${t.title} ${t.titleEm}`} className="space-y-16 lg:space-y-20">
            {g.steps.map((s) => {
              n += 1;
              return <Step key={s.id} step={s} anchor={stepAnchor(t, s)} n={g.start + g.steps.indexOf(s)} flip={n % 2 === 0} />;
            })}
          </ol>
        </div>
      ))}
    </section>
  );
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guide = guideFor(slug);
  if (!guide) notFound();
  // The registry says where the environment stands today; the guide still reads without it.
  const res = await api<EnvironmentDetail>(`/v1/environments/${encodeURIComponent(slug)}`);
  const env = res.ok ? res.data : null;
  const name = env?.name ?? guide.name;
  const art = worldArt(slug);
  const perks = env?.capabilities.perks;
  // One track is shown at a time, so each sits on the same ground.
  const ground: Ground = "paper";
  const choices: TrackChoice[] = guide.tracks.map((t) => ({
    id: t.id,
    label: `${t.title} ${t.titleEm.replace(/.$/, "")}`,
    steps: t.steps.map((s) => stepAnchor(t, s)),
  }));

  return (
    <div>
      <PageHead
        id="guide-h1"
        tag={`${name} · guide`}
        art={art ? { src: worldSrc(art.art), width: WORLD_SIZE.width, height: WORLD_SIZE.height, position: "75% 40%" } : undefined}
        title={
          <>
            {guide.title} <em>{guide.titleEm}</em>
          </>
        }
        lede={guide.lede}
      >
        <TrackButtons choices={choices} scroll className="mt-8" />
      </PageHead>

      <section aria-label="Before you start" className="g-paper bleed container-page pb-4 pt-6">
        <Breadcrumb items={[{ label: "Environments", href: "/environments" }, { label: name, href: `/environments/${encodeURIComponent(slug)}` }, { label: "Guide" }]} />
        {env ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <StatusBadge meta={metaFor(environmentMeta, env.status)} />
            {env.protection.tier !== "none" ? <StatusBadge meta={protectionMeta(env.protection)} /> : null}
            {perks ? <StatusBadge meta={{ ...capabilityMeta[perks], label: `Perks: ${capabilityMeta[perks].label}` }} /> : null}
          </div>
        ) : null}
        <Banner tone="warning" className="mt-5" title={guide.notLive.title}>
          {guide.notLive.text}
        </Banner>
        <div id={TRACKS_ANCHOR} className="mt-8 scroll-mt-24">
          <Eyebrow className="mb-3">What do you sell?</Eyebrow>
          <TrackButtons choices={choices} size="md" />
        </div>
      </section>

      <TrackPanels choices={choices} panels={Object.fromEntries(guide.tracks.map((t) => [t.id, <Track key={t.id} track={t} ground={ground} />]))} />

      <Ridge from={ground} to="night" ink="cobalt" n={1} />
      <section aria-labelledby="guide-more" className="sec g-night bleed sec-sweeps container-page !pt-10">
        <Eyebrow className="mb-[18px]">Read more</Eyebrow>
        <DisplayTitle id="guide-more" className="text-[34px] sm:text-[42px]">
          Each step, <em>in detail.</em>
        </DisplayTitle>
        <ul className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
          {guide.more.map((l) => (
            <li key={l.href}>
              <ReadMore href={l.href} className="!text-[16px]">
                {l.label}
              </ReadMore>
            </li>
          ))}
          <li>
            <ReadMore href={`/environments/${encodeURIComponent(slug)}`} className="!text-[16px]">
              The {name} environment
            </ReadMore>
          </li>
        </ul>
      </section>
    </div>
  );
}
