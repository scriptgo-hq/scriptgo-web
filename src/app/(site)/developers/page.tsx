import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { StepAdaptArt, StepBuildArt, StepMonetizeArt } from "@/components/illustrations";
import { ButtonLink } from "@/components/ui/button";
import { CodeBlock, CommandLine } from "@/components/ui/code-block";
import { DisplayTitle, Eyebrow, Stroke } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "Developers",
  description: "Publish portable Lua resources, prove where they run, and sell licenses. Or bring SCRIPT//GO to your engine.",
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
    body: "A folder with a scriptgo.lua manifest and your shared, server and client scripts. The resource shape multiplayer scripters already know.",
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
    title: "Connect a store (optional)",
    body: "Free packages need nothing else. To sell, connect a payment provider in Dashboard → Stores and map its products to your offers.",
    cmd: null,
  },
];

export default function DevelopersPage() {
  return (
    <div>
      <section className="border-b-2 border-line-soft">
        <div className="container-page grid gap-8 py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <Eyebrow>developers</Eyebrow>
            <DisplayTitle as="h1" className="mt-2 text-[52px] sm:text-[68px]">
              Build once.
              <br />
              <span className="display-italic text-cobalt-ink">Ship everywhere.</span>
            </DisplayTitle>
            <p className="mt-5 max-w-[56ch] text-[17px] text-ink-2">
              Write a resource against standard capabilities. SCRIPT//GO runs it in each environment you declare, shows only the
              results that real runs proved, and issues licenses when your customers pay through your own store.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/docs/quickstart" size="lg" arrow>
                Read the quickstart
              </ButtonLink>
              <ButtonLink href="/sign-up" variant="secondary" size="lg">
                Create an account
              </ButtonLink>
            </div>
          </div>
          <div className="grid grid-cols-3 items-end gap-3">
            <StepBuildArt className="w-full" />
            <StepAdaptArt className="w-full" />
            <StepMonetizeArt className="w-full" />
          </div>
        </div>
      </section>

      <section aria-labelledby="creators-title" className="container-page py-12">
        <DisplayTitle id="creators-title" className="text-[38px] sm:text-[44px]">
          For creators.
        </DisplayTitle>
        <Stroke className="mt-1" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ol className="space-y-6">
            {steps.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-line bg-sun font-display text-[18px] font-black text-on-sun"
                >
                  {s.n}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-[20px] font-extrabold">
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
        <div className="mt-8 rounded-[10px] border-2 border-dashed border-line-soft p-4 text-[14px] text-ink-2">
          The <code className="font-mono">scriptgo</code> CLI is in preview and ships as <code className="font-mono">@scriptgo/cli</code>. Sign it in with a
          personal access token from{" "}
          <Link href="/dashboard/settings" className="font-semibold text-cobalt-ink underline">
            Dashboard → Settings
          </Link>
          . Details on the <Link href="/docs/cli" className="font-semibold text-cobalt-ink underline">CLI page</Link>.
        </div>
      </section>

      <section aria-labelledby="builders-title" className="border-t-2 border-line-soft bg-paper-2/60">
        <div className="container-page grid gap-8 py-12 lg:grid-cols-2">
          <div>
            <DisplayTitle id="builders-title" className="text-[38px] sm:text-[44px]">
              For platform builders.
            </DisplayTitle>
            <p className="mt-4 max-w-[56ch] text-[16px] text-ink-2">
              An adapter supplies a clock and a tick, persistence, players, privileges, notification output and, optionally,
              HTTP. The Lua core knows nothing about engines, so adding an environment means writing one adapter.
            </p>
            <ul className="mt-5 space-y-2 text-[15px]">
              {[
                ["/sdk", "The SDK: adapters, host kits and what is planned"],
                ["/docs/create-adapter", "Create an adapter"],
                ["/docs/runtime", "Runtime API and capabilities"],
                ["/environments", "Current environments and their status"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href!} className="inline-flex items-center gap-1.5 font-bold text-cobalt-ink hover:underline">
                    {label} <ArrowRight aria-hidden="true" size={15} strokeWidth={2.5} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <DisplayTitle as="h2" className="text-[38px] sm:text-[44px]">
              Selling, plainly.
            </DisplayTitle>
            <ul className="mt-4 space-y-3 text-[15px] text-ink-2">
              <li>
                <strong className="text-ink">You sell.</strong> Offers belong to you: free, monthly, annual or perpetual.
              </li>
              <li>
                <strong className="text-ink">The provider takes the payment.</strong> Checkout stays off until your store is
                approved by the provider.
              </li>
              <li>
                <strong className="text-ink">SCRIPT//GO issues the license</strong>, only after a verified payment event, and your
                resource checks it with <Link className="font-semibold text-cobalt-ink underline" href="/docs/licensing-api">the licensing API</Link>.
              </li>
              <li>
                <strong className="text-ink">Third-party game content is reviewed first.</strong> Paid offers that target a
                proprietary game have no purchase path until a reviewer approves them.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
