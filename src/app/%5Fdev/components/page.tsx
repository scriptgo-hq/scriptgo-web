import { notFound } from "next/navigation";
import {
  CategoryCover,
  CreatorBoxArt,
  EnvironmentArt,
  ExploreArt,
  HeroScene,
  HikerRidgeArt,
  StepAdaptArt,
  StepBuildArt,
  StepMonetizeArt,
  categoryLabel,
} from "@/components/illustrations";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock, CommandLine } from "@/components/ui/code-block";
import { Meter } from "@/components/ui/data";
import { Banner } from "@/components/ui/feedback";
import { PackageCard, PackageRow } from "@/components/ui/package";
import { DisplayTitle, Eyebrow, Wordmark } from "@/components/ui/typography";
import { CATEGORIES } from "@/lib/contract";
import {
  activationMeta,
  capabilityMeta,
  caseMeta,
  checkMeta,
  classificationMeta,
  compatibilityMeta,
  environmentMeta,
  licenseMeta,
  listingMeta,
  releaseMeta,
  storeMeta,
  type StatusMeta,
} from "@/lib/status";
import { SAMPLE_PACKAGES } from "./fixtures";

export const metadata = { title: "Component gallery (dev)", robots: { index: false } };

const TABLES: [string, Record<string, StatusMeta>][] = [
  ["Compatibility", compatibilityMeta],
  ["Environment", environmentMeta],
  ["Capability", capabilityMeta],
  ["Release", releaseMeta],
  ["Listing", listingMeta],
  ["Classification", classificationMeta],
  ["License", licenseMeta],
  ["Activation", activationMeta],
  ["Store", storeMeta],
  ["Case", caseMeta],
  ["Check", checkMeta],
];

const ENVS: [string, string][] = [
  ["standalone", "Standalone Lua"],
  ["love2d", "LÖVE"],
  ["godot", "Godot"],
  ["luanti", "Luanti"],
  ["open77", "OPEN//77"],
  ["openresty", "OpenResty"],
  ["defold", "Defold"],
  ["neovim", "Neovim"],
];

/** Dev-only gallery: fixtures are allowed here and nowhere else. */
export default function DevGallery() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main id="main" className="container-page space-y-14 py-10">
      <Banner tone="warning" title="Development gallery">
        Fictional fixtures from the UX brief. This page returns 404 outside development.
      </Banner>
      <section className="space-y-4">
        <Wordmark className="text-[40px]" />
        <DisplayTitle className="text-[56px]">
          Your scripts. <span className="display-italic text-cobalt-ink">Every environment.</span>
        </DisplayTitle>
        <Eyebrow>environments</Eyebrow>
        <div className="flex flex-wrap gap-3">
          <Button arrow>Start building</Button>
          <Button variant="secondary">Explore scripts</Button>
          <Button variant="sun">Sun</Button>
          <Button variant="ink" arrow>
            Publish a script
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Deactivate</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-extrabold">Illustrations</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="relative rounded-xl bg-cobalt p-4">
            <HeroScene className="w-full" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <StepBuildArt className="w-full" />
            <StepAdaptArt className="w-full" />
            <StepMonetizeArt className="w-full" />
            <CreatorBoxArt className="w-24 rounded-lg bg-sun p-2" />
            <div className="col-span-2 rounded-lg bg-cobalt p-2">
              <HikerRidgeArt className="h-40 w-auto" />
            </div>
          </div>
        </div>
        <ExploreArt className="w-full max-w-2xl" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((c) => (
            <figure key={c} className="sticker overflow-hidden">
              <CategoryCover category={c} className="aspect-[2/1] w-full" />
              <figcaption className="border-t-2 border-line p-2 text-sm font-bold">{categoryLabel(c)}</figcaption>
            </figure>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {ENVS.map(([slug, name]) => (
            <figure key={slug} className="sticker overflow-hidden">
              <EnvironmentArt slug={slug} name={name} className="aspect-[5/3] w-full" />
              <figcaption className="border-t-2 border-line p-2 text-sm font-bold">{name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-extrabold">Status vocabulary</h2>
        {TABLES.map(([name, table]) => (
          <div key={name} className="flex flex-wrap items-center gap-2">
            <span className="w-32 font-mono text-xs text-ink-3">{name}</span>
            {Object.values(table).map((m) => (
              <StatusBadge key={m.label} meta={m} />
            ))}
          </div>
        ))}
        <Meter used={3} allowed={5} />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-extrabold">Packages</h2>
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {SAMPLE_PACKAGES.map((p) => (
            <li key={p.id}>
              <PackageCard pkg={p} showSummary className="h-full" />
            </li>
          ))}
        </ul>
        <ul className="panel">
          {SAMPLE_PACKAGES.map((p) => (
            <PackageRow key={p.id} pkg={p} />
          ))}
        </ul>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <CodeBlock
          filename="shared/core.lua"
          code={`local Inventory = {}\n\nfunction Inventory.add(owner, item, count)\n  local key = "inventory/" .. owner\n  local bag = ScriptGo.storage.get(key) or {}\n  bag[item] = (bag[item] or 0) + (count or 1)\n  ScriptGo.storage.set(key, bag)\n  TriggerEvent("inventory:added", owner, item, bag[item])\n  return bag[item]\nend\n\nreturn Inventory`}
        />
        <div className="space-y-3">
          <CommandLine command="scriptgo add kestrel//inventory-pro" />
          <CodeBlock lang="bash" code={`curl -X POST https://example.invalid/v1/licenses/verify \\\n  -H 'content-type: application/json' \\\n  -d '{"licenseKey":"sg_live_…","package":"kestrel//inventory-pro","environment":"luanti"}'`} />
        </div>
      </section>
    </main>
  );
}
