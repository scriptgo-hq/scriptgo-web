import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHead, Ridge, SCENES } from "@/components/site/ink";
import { ButtonLink } from "@/components/ui/button";
import { CodeBlock, CommandLine } from "@/components/ui/code-block";
import { DisplayTitle, Eyebrow } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "Developers",
  description: "Publish game scripts, prove where they run, protect and sell them with licenses. Or integrate the SCRIPT//GO SDK into your engine.",
};

const MANIFEST = `resource "inventory_pro"
version "1.4.1"
scriptgo_version ">=0.1.0"

title "Inventory Pro"
license "MIT"
category "inventory"

lua { "5.1", "5.4", "luajit" }
environments { "standalone", "love2d", "godot", "luanti" }
capabilities { "events", "storage" }
optional_capabilities { "ui" }

shared_script "shared/core.lua"
server_script "server/main.lua"
test_script "tests/core_test.lua"`;

const steps = [
  {
    n: 1,
    title: "Create a resource",
    body: "A folder with a manifest and your shared, server and client scripts: the resource shape multiplayer scripters already know. Lua runs in every environment; TypeScript on the .NET kit.",
    cmd: "scriptgo init inventory_pro",
  },
  {
    n: 2,
    title: "Test it locally",
    body: "Runs your test_script files in the standalone host, the reference environment.",
    cmd: "scriptgo test",
  },
  {
    n: 3,
    title: "Publish a release",
    body: "Uploads the archive. Validation checks archive safety, the manifest and hashes; compatibility runs decide each environment's status.",
    cmd: "scriptgo publish",
  },
  {
    n: 4,
    title: "Protect a paid release (optional)",
    body: "Publish it encrypted. The key is released only to a licensed server bound by its own key, and you choose which files stay readable. The site offers the same option on the new-release page.",
    cmd: "scriptgo publish --escrow",
  },
  {
    n: 5,
    title: "Connect a store (optional)",
    body: "Free packages need nothing else. To sell, open your shop: connect your own Tebex store in Dashboard → Stores and map its products to your offers. It works as soon as its Tebex configuration is complete. Real checkout is not live yet: it stays off, for every shop, until Tebex approves it in writing.",
    cmd: null,
  },
];

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
      >
            <p className="lede mt-5 !max-w-[58ch] text-[#e6e2f3]">
              Write a resource against standard capabilities: in Lua for every environment, or in TypeScript for the .NET kit.
              SCRIPT//GO runs it in each environment you declare, shows only the results that real runs proved, and issues
              licenses when your customers pay through your own Tebex store.
            </p>
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
        <Eyebrow className="mb-[18px]">From folder to store</Eyebrow>
        <DisplayTitle id="creators-title" className="text-[38px] sm:text-[48px]">
          For <em>creators.</em>
        </DisplayTitle>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ol className="space-y-6">
            {steps.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="num-slab mt-0.5"
                >
                  {s.n}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-[21px] font-extrabold tracking-[-0.015em]">
                    <span className="sr-only">Step {s.n}: </span>
                    {s.title}
                  </h3>
                  <p className="mt-1 text-[15px] text-ink-2">{s.body}</p>
                  {s.cmd ? <CommandLine command={s.cmd} className="mt-3" /> : null}
                </div>
              </li>
            ))}
          </ol>
          <div className="min-w-0 space-y-3">
            <CodeBlock code={MANIFEST} lang="lua" filename="inventory_pro/scriptgo.lua" />
            <p className="text-[13.5px] text-ink-3">
              The manifest is parsed, never executed. Unknown directives are kept as warnings, so one file can serve several
              environments. <Link href="/docs/manifest" className="font-semibold text-cobalt-ink underline">Manifest reference</Link>
            </p>
          </div>
        </div>
        <div className="mt-10 border-[2.5px] border-dashed border-line-soft p-4 text-[14.5px] text-ink-2">
          The <code className="font-mono">scriptgo</code> CLI is in preview and ships as <code className="font-mono">@scriptgo/cli</code>. Sign it in with a
          personal access token from{" "}
          <Link href="/dashboard/settings" prefetch={false} className="font-semibold text-cobalt-ink underline">
            Dashboard → Settings
          </Link>
          . Details on the <Link href="/docs/cli" className="font-semibold text-cobalt-ink underline">CLI page</Link>.
        </div>
      </section>

      <Ridge from="paper" to="cobalt" ink="violet" n={1} />
      <section aria-labelledby="selling-title" className="sec g-cobalt sec-sweeps !pt-10">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow className="mb-[18px]">For platforms</Eyebrow>
            <DisplayTitle id="builders-title" className="text-[38px] sm:text-[46px]">
              For <em>platform builders.</em>
            </DisplayTitle>
            <p className="mt-4 max-w-[56ch] text-[16px] text-ink-2">
              Two ways in. A host that runs Lua writes one adapter: a clock and a tick, persistence, players, privileges,
              notification output and, optionally, HTTP. The portable core knows nothing about engines. An engine or server
              written in .NET embeds the .NET host kit instead, which runs Lua and TypeScript side by side (experimental).
              Either way, your creators can protect and monetize what they build on your platform.
            </p>
            <ul className="mt-5 space-y-2 text-[15px]">
              {[
                ["/sdk", "The SDK: adapters, host kits and what is planned"],
                ["/docs/create-adapter", "Create an adapter"],
                ["/sdk#protect-title", "Let your creators protect their work"],
                ["/environments/dotnet", "The .NET host kit"],
                ["/docs/runtime", "Runtime API and capabilities"],
                ["/environments", "Current environments and their status"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href!} className="inline-flex items-center gap-1.5 font-bold text-cobalt-ink underline-offset-4 hover:underline">
                    {label} <ArrowRight aria-hidden="true" size={15} strokeWidth={2.5} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="sticker p-6 sm:p-8">
            <Eyebrow className="mb-[18px]">Monetize</Eyebrow>
            <DisplayTitle as="h2" id="selling-title" className="text-[34px] sm:text-[40px]">
              Selling, <em>plainly.</em>
            </DisplayTitle>
            <ul className="mt-5 space-y-3 text-[15px] text-ink-2">
              <li>
                <strong className="text-ink">You sell.</strong> Offers belong to you: free, monthly, annual or perpetual. A script
                is sold as a SCRIPT//GO script that runs on the environments it declares, never &ldquo;for&rdquo; a platform.
              </li>
              <li>
                <strong className="text-ink">Tebex takes the payment.</strong> Anyone can open a shop, on their own Tebex store.
                Real checkout is not live yet: it stays off, for every shop, until Tebex approves it in writing.
              </li>
              <li>
                <strong className="text-ink">SCRIPT//GO issues the license</strong>, only after a verified payment event, and your
                resource checks it with <Link className="font-semibold text-cobalt-ink underline" href="/docs/licensing-api">the licensing API</Link>.
              </li>
              <li>
                <strong className="text-ink">Licenses guard paid resources.</strong> One key per buyer, activation per server,
                signed answers with offline grace. A refund, a lost dispute or an ended subscription closes the license.
              </li>
              <li>
                <strong className="text-ink">Every release is signed. A release can also be encrypted.</strong> The key of an
                encrypted release goes only to a licensed server bound by its own key, and each delivery is marked. On a host
                that runs compiled code it is decrypted in memory; on a host that runs plain script the protection is the
                licence and the signature. It deters copying and makes leaks traceable. It does not make copying impossible.{" "}
                <Link className="font-semibold text-cobalt-ink underline" href="/protect">
                  How protection works
                </Link>
              </li>
              <li>
                <strong className="text-ink">You declare your rights, and answer for what you sell.</strong> An offer with a
                declaration is on sale. SCRIPT//GO does not pre-approve offers or stores; it acts on reports, and can restrict,
                suspend or take down a listing, with notice and appeal.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
