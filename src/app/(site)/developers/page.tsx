import type { Metadata } from "next";
import { FlaskConical, FolderPlus, Lock, Store, Upload } from "lucide-react";
import { Flow, PictureCard, ReadMore } from "@/components/site/diagrams";
import { PageHead, Ridge, SCENES } from "@/components/site/ink";
import { ButtonLink } from "@/components/ui/button";
import { DisplayTitle, Eyebrow } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "Developers",
  description: "Publish game scripts, prove where they run, protect and sell them with licenses. Or integrate the SCRIPT//GO SDK into your engine.",
};

const CHECKOUT_OFF = { label: "Checkout opens on Tebex approval", tone: "info", icon: "lock", hint: "A shop can be set up and tested today. Real checkout opens for every shop once Tebex approves it in writing." } as const;

export default function DevelopersPage() {
  return (
    <div>
      <PageHead
        id="developers-h1"
        tag="Monetize"
        art={{ ...SCENES.stall, position: "80% 40%" }}
        title={
          <>
            Build once. <em>Protect your work.</em> Monetize it.
          </>
        }
        lede="Publish a script once, prove where it runs, and sell it from your own Tebex store."
      >
        <div className="cta-row mt-8">
          <ButtonLink href="/sign-up" variant="sun" size="lg" arrow>
            Create an account
          </ButtonLink>
          <ButtonLink href="/docs/quickstart" variant="secondary" size="lg">
            Read the quickstart
          </ButtonLink>
        </div>
      </PageHead>

      <section aria-labelledby="creators-title" className="sec g-paper bleed sec-sweeps container-page !pt-12">
        <div className="sec-head">
          <div>
            <Eyebrow className="mb-[18px]">For creators</Eyebrow>
            <DisplayTitle id="creators-title" className="text-[38px] sm:text-[48px]">
              From folder <em>to store.</em>
            </DisplayTitle>
          </div>
          <ReadMore href="/docs/selling#from-folder-to-store">Each step, in detail</ReadMore>
        </div>
        <Flow
          numbered
          label="From a folder to a store"
          steps={[
            { icon: FolderPlus, title: "Create", note: "a manifest and your scripts", code: "scriptgo init" },
            { icon: FlaskConical, title: "Test", note: "in the standalone host", code: "scriptgo test", accent: "cobalt" },
            { icon: Upload, title: "Publish", note: "real runs set each status", code: "scriptgo publish", accent: "ink" },
            { icon: Lock, title: "Protect", note: "optional: deliver it encrypted", code: "--escrow" },
            { icon: Store, title: "Open your shop", note: "on your own Tebex store", chip: CHECKOUT_OFF, accent: "cobalt" },
          ]}
        />
        <p className="mt-7">
          <ReadMore href="/docs/cli" className="!text-[14.5px]">The CLI</ReadMore>
        </p>
      </section>

      <Ridge from="paper" to="cobalt" ink="violet" n={1} />
      <section aria-labelledby="selling-title" className="sec g-cobalt sec-sweeps !pt-10">
        <div className="container-page">
          <div className="sec-head">
            <div>
              <Eyebrow className="mb-[18px]">The rules</Eyebrow>
              <DisplayTitle id="selling-title" className="text-[38px] sm:text-[48px]">
                Selling, <em>plainly.</em>
              </DisplayTitle>
              <p className="one-line mt-4 text-ink-2">You sell, Tebex takes the payment, SCRIPT//GO issues the licence.</p>
            </div>
            <ReadMore href="/docs/selling">How selling works</ReadMore>
          </div>
          <div className="pcards pcards-4">
            <PictureCard art={SCENES.stall} title="Sold as a SCRIPT//GO script.">
              It &ldquo;runs on&rdquo; environments. It is never sold &ldquo;for&rdquo; a platform.
            </PictureCard>
            <PictureCard art={SCENES.scales} title="You declare, you answer.">
              A declaration of rights puts an offer on sale. No pre-approval.
            </PictureCard>
            <PictureCard art={SCENES.watchtower} title="We act on reports.">
              Restrict, suspend or take down, with notice and appeal.
            </PictureCard>
            <PictureCard art={SCENES.gate} title="Anyone can open a shop.">
              On your own Tebex store. No staff approves it.
            </PictureCard>
          </div>
        </div>
      </section>

      <Ridge from="cobalt" to="paper2" ink="sun" n={2} />
      <section aria-labelledby="builders-title" className="sec g-paper2 bleed sec-sweeps container-page !pt-10">
        <div className="sec-head">
          <div>
            <Eyebrow className="mb-[18px]">For platforms</Eyebrow>
            <DisplayTitle id="builders-title" className="text-[38px] sm:text-[48px]">
              For <em>platform builders.</em>
            </DisplayTitle>
            <p className="one-line mt-4 text-ink-2">Bring SCRIPT//GO to your engine, and your creators can protect and sell what they build on it.</p>
          </div>
          <ReadMore href="/sdk">The SDK</ReadMore>
        </div>
        <div className="pcards pcards-2">
          <PictureCard art={SCENES.adapter} label="Your host runs Lua" title="Write an adapter." more={{ href: "/docs/create-adapter", label: "Create an adapter" }}>
            One table maps the API onto your host.
          </PictureCard>
          <PictureCard art={SCENES.toolcase} label="Your engine has no Lua" title="Embed the .NET host kit." more={{ href: "/docs/dotnet-kit", label: "Embed the .NET kit" }}>
            It runs Lua and TypeScript side by side.
          </PictureCard>
        </div>
      </section>
    </div>
  );
}
