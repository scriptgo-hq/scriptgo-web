import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Suspense } from "react";
import { PageHead, Ridge, SCENES } from "@/components/site/ink";
import { ProofBlock } from "@/components/site/proof-block";
import { IN_DEVELOPMENT_ITEMS, SellerCases } from "@/components/site/seller-cases";
import { DisplayTitle, Eyebrow } from "@/components/ui/typography";
import { api } from "@/lib/api";
import type { Environment } from "@/lib/contract";
import { escrowAdapterGuideHref } from "@/lib/docs";
import { LANGUAGE_STATES } from "@/lib/env";
import { adapterMeta } from "@/lib/integration";
import { IN_DEVELOPMENT, type StatusMeta } from "@/lib/status";

export const metadata: Metadata = {
  title: "SDK",
  description:
    "What the SCRIPT//GO SDK is: a portable Lua core, one adapter per host, a .NET host kit, a CLI and the specs. How an engine integrates it, and what is not built yet.",
};

// The template from the adapter guide (/docs/create-adapter), trimmed to a server-only host.
const ADAPTER = `-- adapters/myengine.lua
return {
  environment = "myengine",
  adapterVersion = "myengine-0.1.0",
  sides = { server = true, client = false },   -- a server-only host
  capabilities = {
    storage = true, players = true, permissions = true, commands = true,
    config = true, ui = true, http = false, licensing = false,
  },

  now = function() return MyEngine.time_seconds() end,          -- monotonic, in seconds
  log = function(level, origin, message) MyEngine.log(level, origin .. ": " .. message) end,
  readFile = function(path) return MyEngine.read_text(path) end, -- nil when missing

  storage = {
    load = function(key) return MyEngine.kv_get(key) end,       -- JSON text or nil
    save = function(key, text) MyEngine.kv_set(key, text) end,
  },
  permissions = {
    has = function(playerId, privilege) return MyEngine.has_priv(playerId, privilege) end,
  },
  config = {
    get = function(resourceName, key) return MyEngine.setting(resourceName, key) end,
  },
  ui = {
    notify = function(target, n) MyEngine.toast(target, n.title, n.message) end,
  },
}`;

const HOST = `local scriptgo = dofile("sdk/lua/scriptgo/init.lua")
local host = scriptgo.newHost({ adapter = dofile("adapters/myengine.lua") })
host:addResource("resources/sg_inventory")
host:startAll()

-- then, once per frame or server step, from the engine's own loop:
host:tick()`;

// The embedding example of sdk/dotnet/README.md; the kit's test suite runs it (EmbeddingTests).
const DOTNET = `using ScriptGo.Host;

var services = new HostServices
{
    Log = new ConsoleLog(),
    Storage = new FolderStorage("data/storage"),
    // Players, Permissions, Config, Ui and Http are the engine's: implement IHostPlayers, ...
};
using var host = new ScriptGoHost(services, new HostOptions { Environment = "dotnet" });

// Natives the engine offers, described once (docs/spec/native-module.schema.json).
var world = NativeModule.FromJson("""
    { "name": "world", "global": true,
      "functions": [{ "name": "greet", "params": [{ "name": "who", "type": "string" }], "returns": "string" }] }
    """);
world.Bind("greet", call => [SgValue.Of($"hi {call.Arg(0).AsText()} from {call.Language}")]);
host.RegisterNativeModule(world);

host.AddResource("resources/sg_inventory");
var started = host.Start("sg_inventory");
if (!started.Ok) Console.WriteLine($"not started: {started.Reason}");

host.PlayerJoin(1, "Ann");
host.RunFor(100);          // or host.Tick() once per engine frame
host.StopAll();`;

const PIECES: { title: string; path: string; badge?: StatusMeta; body: React.ReactNode; foot?: React.ReactNode }[] = [
  {
    title: "Lua core",
    path: "sdk/lua/scriptgo",
    body: (
      <>
        Pure Lua that runs on any Lua host, from Lua 5.1 to 5.4 and LuaJIT. It gives packages one API: threads and timers,
        events on a host-wide bus, exports between packages, promises, storage, players, permissions, commands, config, HTTP,
        licensing, notifications and logging. It knows nothing about engines.
      </>
    ),
  },
  {
    title: "Adapters",
    path: "sdk/adapters/<host>/",
    body: (
      <>
        One per host. An adapter maps the API onto what the host already has: its clock and tick, files, storage, players,
        privileges, config, notifications and HTTP. Depending on the host it ships as an addon, a mod, a plugin, an in-game
        computer program or a shim.
      </>
    ),
    foot: (
      <Link href="/docs/create-adapter" className="font-semibold text-cobalt-ink underline">
        The adapter contract
      </Link>
    ),
  },
  {
    title: ".NET host kit",
    path: "sdk/dotnet",
    badge: { label: "Experimental", tone: "warning", icon: "flask", hint: "Measured on Windows x64; its test suite also passes on Linux x64 in a container. Not published to NuGet." },
    body: (
      <>
        <code className="font-mono text-[0.9em]">ScriptGo.Host</code>, a .NET 10 library any C# engine or server can embed,
        and <code className="font-mono text-[0.9em]">scriptgo-dotnet</code>, its console host. Lua 5.4 (KeraLua) and
        JavaScript or TypeScript (Jint) run side by side, one VM per resource side and language. Natives are described once
        and reach every language with generated typings; quotas apply to each call from the host.
      </>
    ),
    foot: (
      <>
        Measured on Windows x64; its test suite also passes on Linux x64 in a container. Not on NuGet yet.{" "}
        <Link href="/docs/dotnet-kit" className="font-semibold text-cobalt-ink underline">
          Embed it
        </Link>
      </>
    ),
  },
  {
    title: "CLI",
    path: "packages/cli",
    body: (
      <>
        <code className="font-mono text-[0.9em]">scriptgo</code>: <code className="font-mono text-[0.9em]">init</code>,{" "}
        <code className="font-mono text-[0.9em]">validate</code>, <code className="font-mono text-[0.9em]">test</code>,{" "}
        <code className="font-mono text-[0.9em]">run</code>, <code className="font-mono text-[0.9em]">pack --target</code>,{" "}
        <code className="font-mono text-[0.9em]">verify --env</code>, <code className="font-mono text-[0.9em]">publish</code>,{" "}
        <code className="font-mono text-[0.9em]">add</code>,{" "}
        <code className="font-mono text-[0.9em]">license activate|verify</code> and{" "}
        <code className="font-mono text-[0.9em]">escrow load</code>. It compiles TypeScript at pack and verify time, so
        hosts never do.
      </>
    ),
    foot: (
      <Link href="/docs/cli" className="font-semibold text-cobalt-ink underline">
        CLI reference
      </Link>
    ),
  },
  {
    title: "@scriptgo/types",
    path: "packages/types",
    body: (
      <>
        TypeScript declarations for resources, generated from the language-neutral runtime IDL (
        <code className="font-mono text-[0.9em]">docs/spec/runtime-idl.json</code>). The same IDL defines the API in every
        language.
      </>
    ),
  },
  {
    title: "Specs",
    path: "docs/spec",
    body: (
      <>
        The runtime API (<code className="font-mono text-[0.9em]">runtime.md</code>), the manifest (
        <code className="font-mono text-[0.9em]">manifest.md</code>), how values, events and exports cross languages (
        <code className="font-mono text-[0.9em]">multi-language.md</code>), the IDL format (
        <code className="font-mono text-[0.9em]">runtime-idl.md</code>) and the HTTP API (
        <code className="font-mono text-[0.9em]">api.md</code>). Native modules follow{" "}
        <code className="font-mono text-[0.9em]">native-module.schema.json</code>.
      </>
    ),
    foot: (
      <>
        <Link href="/docs/runtime" className="font-semibold text-cobalt-ink underline">
          Runtime
        </Link>
        {" · "}
        <Link href="/docs/manifest" className="font-semibold text-cobalt-ink underline">
          Manifest
        </Link>
        {" · "}
        <Link href="/docs/api" className="font-semibold text-cobalt-ink underline">
          HTTP API
        </Link>
      </>
    ),
  },
];

// States come from LANGUAGE_STATES (lib/env.ts), the one place they change when the evidence does.
const LANGUAGES: { language: string; name: string; body: React.ReactNode }[] = [
  {
    language: "lua",
    name: "Lua",
    body: <>Runs on each host&rsquo;s own Lua: 5.1, 5.2, 5.3, 5.4 or LuaJIT, depending on the host.</>,
  },
  {
    language: "ts",
    name: "TypeScript and JavaScript",
    body: (
      <>
        Through the .NET kit. TypeScript is compiled by esbuild when you pack or verify. Real runs on the kit passed the
        conformance probe in TypeScript, and a Lua package and a TypeScript package calling each other&rsquo;s exports.
      </>
    ),
  },
  {
    language: "cs",
    name: "C#",
    body: <>Planned as guest scripts compiled against an allowed API, with quotas. A spike and a security review come first.</>,
  },
];

function languageState(language: string) {
  return LANGUAGE_STATES.find((s) => s.language === language)?.meta;
}

const PLATFORM: { title: string; body: React.ReactNode; href: string; link: string }[] = [
  {
    title: "Licensing and verification",
    body: (
      <>
        License keys, one activation per deployment, verification with an offline grace period, and signed verification
        tokens. A package checks its license with <code className="font-mono text-[0.9em]">ScriptGo.licensing</code>.
      </>
    ),
    href: "/docs/licensing-api",
    link: "Licensing API",
  },
  {
    title: "Shops on Tebex",
    body: (
      <>
        Anyone can open a shop on their own Tebex store; it works as soon as its Tebex configuration is complete, and SCRIPT//GO
        issues the license after a verified payment event. Real checkout is not live yet: it stays off, for every shop, until
        Tebex approves it in writing.
      </>
    ),
    href: "/developers",
    link: "Selling, plainly",
  },
  {
    title: "Compatibility proof",
    body: (
      <>
        <code className="font-mono text-[0.9em]">scriptgo verify</code> runs a package and its README example in the real
        runtime and writes a report. Statuses and badges come from those reports, never from a form.
      </>
    ),
    href: "/environments",
    link: "Environments",
  },
  {
    title: "Imports",
    body: (
      <>
        <code className="font-mono text-[0.9em]">scriptgo add creator//name</code> downloads a release into{" "}
        <code className="font-mono text-[0.9em]">./resources</code> and checks its SHA-256 and the registry&rsquo;s signature
        before it writes a file. Packages declare dependencies in their manifest and call each other through exports.
      </>
    ),
    href: "/docs/cli",
    link: "scriptgo add",
  },
];

const notStarted = (hint: string): StatusMeta => ({ label: "Not started", tone: "muted", icon: "dashed", hint });

const ROADMAP: { title: string; status: StatusMeta; body: React.ReactNode }[] = [
  ...IN_DEVELOPMENT_ITEMS.map((it) => ({ title: it.title, status: IN_DEVELOPMENT, body: it.body as React.ReactNode })),
  {
    title: "Native C ABI kit",
    status: notStarted("Phase 4 of the plan."),
    body: (
      <>
        <code className="font-mono text-[0.9em]">libscriptgo</code> with C headers, for C and C++ engines: Lua 5.4 or
        LuaJIT, and JavaScript on QuickJS. Phase 4.
      </>
    ),
  },
  {
    title: "Node kit",
    status: notStarted("Phase 4 of the plan, after the C kit."),
    body: <>For Node, Bun and Deno servers: Lua and JavaScript each in WebAssembly, isolated per resource. Phase 4, after the C kit.</>,
  },
  {
    title: "JVM kit",
    status: { label: "Later", tone: "muted", icon: "calendar", hint: "After the C and Node kits." },
    body: (
      <>
        For Java servers. The Lua core already runs on Cobalt inside one JVM plugin (Hytale, written, awaiting a real run); a
        general kit, with JavaScript, is not started.
      </>
    ),
  },
  {
    title: "C# guests",
    status: notStarted("Phase 3 of the plan."),
    body: <>Scripts written in C#. Phase 3, after a spike and a security review. Until then a .cs script is refused.</>,
  },
  {
    title: "In-memory escrow on more hosts",
    status: { label: "Planned", tone: "muted", icon: "hourglass", hint: "Each host is listed as planned on the environments page until its loader exists." },
    body: (
      <>
        Signed releases, per-server licences and encrypted releases are built. The loader that decrypts in memory is in the
        .NET kit today. Other hosts that run compiled code are marked planned on the{" "}
        <Link href="/environments#protection" className="font-semibold text-cobalt-ink underline">
          environments page
        </Link>
        ; hosts that run plain script stay on licence and signing.
      </>
    ),
  },
  {
    title: "SDK packages on NuGet and npm",
    status: { label: "Not published", tone: "muted", icon: "dashed", hint: "Not published to a package registry yet." },
    body: <>The .NET kit is not on NuGet, and the CLI and @scriptgo/types are not on npm yet.</>,
  },
  {
    title: "Linux and macOS measurements",
    status: { label: "Partly measured", tone: "muted", icon: "dashed", hint: "No measured run on macOS, and none on Linux for the desktop hosts." },
    body: <>The desktop hosts (LÖVE, Godot, Neovim) were measured on Windows only. The .NET kit's test suite and the native escrow library also pass on Linux x64, in a container; nothing was measured on macOS.</>,
  },
];

async function AdapterCounts() {
  const res = await api<Environment[]>("/v1/environments");
  if (!res.ok || res.data.length === 0) return null;
  const count = (s: string) => res.data.filter((e) => e.adapterState === s).length;
  const tiles = [
    { n: count("verified"), meta: adapterMeta.verified, text: "environments where a real run passed" },
    { n: count("written"), meta: adapterMeta.written, text: "adapters written, each awaiting its first real run" },
    { n: count("none"), meta: adapterMeta.none, text: "planned environments with no adapter code yet" },
  ];
  return (
    <ul className="mt-9 grid max-w-[760px] gap-5 sm:grid-cols-3">
      {tiles.map((t) => (
        <li key={t.meta.label}>
          <Link href="/environments" className="sticker sticker-hover flex h-full flex-col gap-2 p-4">
            <StatusBadge meta={t.meta} size="sm" className="self-start" />
            <span className="display tabular text-[40px] leading-none">{t.n}</span>
            <span className="text-[14px] text-ink-2">{t.text}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** What a host needs to load an encrypted release. Kept to what docs/spec/escrow.md fixes. */
const ESCROW_HOST_STEPS: { title: string; body: React.ReactNode }[] = [
  {
    title: "A server key",
    body: (
      <>
        The loader creates an X25519 key pair on the server and registers the public half with its deployment. The private
        half never leaves the machine. Binding follows that key, not the hardware, so an honest move is a reset.
      </>
    ),
  },
  {
    title: "The key endpoint",
    body: (
      <>
        <code className="font-mono text-[0.9em]">POST /v1/licenses/key</code> answers a short-lived content key wrapped to
        that server, or a refusal with a stable reason. A refund or a revocation makes the next answer a refusal.
      </>
    ),
  },
  {
    title: "A loader in compiled code",
    body: (
      <>
        It checks the bundle&rsquo;s signature against a pinned key, unwraps the content key, decrypts in memory and hands the
        files to the host. A loader written in the guest script language cannot keep a key from the operator.
      </>
    ),
  },
];

function ProtectSection() {
  const guide = escrowAdapterGuideHref();
  return (
    <section aria-labelledby="protect-title" className="sec g-night bleed sec-sweeps container-page">
      <Eyebrow className="mb-[18px]">Protection</Eyebrow>
      <DisplayTitle id="protect-title" className="scroll-mt-28 text-[38px] sm:text-[48px]">
        Protect <em>your work.</em>
      </DisplayTitle>
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="min-w-0">
          <p className="max-w-[60ch] text-[16px] text-ink-2">
            A creator owns the scripts they write. The platform makes that ownership enforceable in three layers. Every
            published release is signed. A paid package checks a licence per server. And a creator can publish a release
            encrypted, so that its key is released only to a licensed server bound by its own key.
          </p>
          <p className="mt-3 max-w-[60ch] text-[15px] text-ink-2">
            How far the third layer goes depends on the host. A host that runs compiled code can hold a key and decrypt in
            memory. A host that runs plain script cannot hide anything from its operator, so there we claim the licence check
            and the signature, and nothing more. It deters copying and makes leaks traceable. It does not make copying
            impossible.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/protect" variant="sun" arrow>
              How protection works
            </ButtonLink>
            <ButtonLink href={guide ?? "/docs/protect-your-work"} variant="secondary">
              {guide ? "Bring escrow to your platform" : "Read the protection guide"}
            </ButtonLink>
          </div>
          <p className="mt-3 text-[13.5px] text-ink-3">
            {guide ? (
              <>
                For creators and operators:{" "}
                <Link href="/docs/protect-your-work" className="font-semibold text-cobalt-ink underline">
                  Protect your work
                </Link>
                .{" "}
              </>
            ) : null}
            The tier of each environment is on the{" "}
            <Link href="/environments#protection" className="font-semibold text-cobalt-ink underline">
              environments page
            </Link>
            .
          </p>
        </div>
        <div className="min-w-0">
          <p className="label">For a platform that wants escrow</p>
          <h3 className="mt-1 font-display text-[24px] font-extrabold leading-tight">What a host needs.</h3>
          <ol className="mt-4 space-y-4">
            {ESCROW_HOST_STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="num-slab"
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-bold">
                    <span className="sr-only">Step {i + 1}: </span>
                    {s.title}
                  </p>
                  <p className="mt-0.5 text-[14.5px] text-ink-2">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-[13.5px] text-ink-3">
            The bundle format, the key wrapping and the signature are fixed in <code className="font-mono">docs/spec/escrow.md</code>.
            Integrating it is the platform&rsquo;s choice: nothing in the SDK turns it on by itself.
          </p>
        </div>
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
        art={{ ...SCENES.signpost, position: "62% 40%" }}
        title={
          <>
            The <em>SDK.</em>
          </>
        }
        lede={
          <>
            Packages are written once, against one API. The SDK is what runs that API on each host: a Lua core, one adapter per
            host, a host kit for engines that do not run Lua, a CLI, and the specs that tie them together. This page says what
            exists, how an engine integrates it, and what is not built yet.
          </>
        }
      >
          <div className="cta-row mt-8 items-center">
            <ButtonLink href="/docs/create-adapter" variant="sun" size="lg" arrow>
              Write an adapter
            </ButtonLink>
            <ButtonLink href="/docs/dotnet-kit" variant="secondary" size="lg">
              Embed the .NET kit
            </ButtonLink>
            <Link href="/docs/sdk" className="ink-link">
              Read the SDK guide
            </Link>
          </div>
          <AdapterCounts />
      </PageHead>

      <section aria-labelledby="pieces-title" className="sec g-paper bleed sec-sweeps container-page !pt-12">
        <Eyebrow className="mb-[18px]">The pieces</Eyebrow>
        <DisplayTitle id="pieces-title" className="text-[38px] sm:text-[48px]">
          What is <em>in it.</em>
        </DisplayTitle>
        <ul className="mt-9 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {PIECES.map((p) => (
            <li key={p.title} className="sticker flex flex-col gap-2.5 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-[21px] font-extrabold leading-tight">{p.title}</h3>
                {p.badge ? <StatusBadge meta={p.badge} size="sm" /> : null}
              </div>
              <Tag mono className="self-start">
                {p.path}
              </Tag>
              <p className="text-[14.5px] text-ink-2">{p.body}</p>
              {p.foot ? <p className="mt-auto pt-1 text-[13.5px] text-ink-3">{p.foot}</p> : null}
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
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <div className="min-w-0">
              <p className="label !text-cobalt-ink">For a host that runs Lua</p>
              <h3 className="mt-1 font-display text-[28px] font-black leading-tight tracking-[-0.02em]">Write an adapter.</h3>
              <p className="mt-3 max-w-[60ch] text-[15px] text-ink-2">
                Engines, mod frameworks and game servers that already embed Lua keep their own VM. The core runs in it
                unchanged: you write one adapter table and tick the host from your loop. A host that already runs this resource
                shape (threads, events, exports) only needs a shim and a pack target.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["addon", "mod", "plugin", "computer program", "shim"].map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
              <div className="mt-5 space-y-5">
                <CodeBlock code={ADAPTER} lang="lua" filename="adapters/myengine.lua" />
                <CodeBlock code={HOST} lang="lua" filename="your engine" />
              </div>
              <p className="mt-3 text-[13.5px] text-ink-3">
                From the adapter guide. Then run the conformance probes with{" "}
                <code className="font-mono">scriptgo verify</code>.{" "}
                <Link href="/docs/create-adapter" className="font-semibold text-cobalt-ink underline">
                  Create an adapter
                </Link>
              </p>
            </div>
            <div className="min-w-0">
              <p className="label !text-cobalt-ink">For an engine without Lua</p>
              <h3 className="mt-1 font-display text-[28px] font-black leading-tight tracking-[-0.02em]">Embed a host kit.</h3>
              <p className="mt-3 max-w-[60ch] text-[15px] text-ink-2">
                A C# engine or server references <code className="font-mono text-[0.9em]">ScriptGo.Host</code>, supplies its
                services (storage, players, permissions, config, notifications, HTTP) and describes its natives once. Its users
                then write Lua, TypeScript or JavaScript. The .NET kit is the only kit today, and it is experimental; native C,
                Node and JVM kits are planned.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Tag>embedded kit</Tag>
                <Tag>.NET 10</Tag>
                <Tag>Lua 5.4 · TypeScript · JavaScript</Tag>
              </div>
              <div className="mt-5">
                <CodeBlock code={DOTNET} lang="csharp" filename="Program.cs" />
              </div>
              <p className="mt-3 text-[13.5px] text-ink-3">
                The embedding example of the kit&rsquo;s README; its test suite runs the same code.{" "}
                <Link href="/docs/dotnet-kit" className="font-semibold text-cobalt-ink underline">
                  Embed the .NET kit
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Ridge from="paper2" to="sun" ink="orange" n={2} />
      <section aria-labelledby="languages-title" className="sec g-sun bleed sec-sweeps container-page !pt-10">
        <Eyebrow className="mb-[18px]">Languages</Eyebrow>
        <DisplayTitle id="languages-title" className="text-[38px] sm:text-[48px]">
          One API, <em>every language.</em>
        </DisplayTitle>
        <ul className="mt-9 grid gap-7 md:grid-cols-3">
          {LANGUAGES.map((l) => (
            <li key={l.name} className="sticker flex flex-col gap-2 p-5">
              <h3 className="font-display text-[21px] font-extrabold leading-tight">{l.name}</h3>
              {languageState(l.language) ? <StatusBadge meta={languageState(l.language)!} size="sm" className="self-start" /> : null}
              <p className="text-[14.5px] text-ink-2">{l.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[14px] text-ink-2">
          One API in every language, defined by the runtime IDL: <code className="font-mono">nil, reason</code> in Lua, errors and
          promises in JavaScript. How values cross between languages is fixed in{" "}
          <code className="font-mono">docs/spec/multi-language.md</code>.
        </p>
      </section>

      <Ridge from="sun" to="cobalt" ink="violet" n={3} />
      <section aria-labelledby="platform-title" className="sec g-cobalt sec-sweeps !pt-10">
        <div className="container-page">
          <Eyebrow className="mb-[18px]">The platform</Eyebrow>
          <DisplayTitle id="platform-title" className="text-[38px] sm:text-[48px]">
            On top of <em>the SDK.</em>
          </DisplayTitle>
          <p className="mt-4 max-w-[64ch] text-[16px] text-ink-2">
            The SDK runs packages. The platform around it is what creators and server owners use it for.
          </p>
          <ul className="mt-9 grid gap-7 md:grid-cols-2 lg:grid-cols-4">
            {PLATFORM.map((p) => (
              <li key={p.title} className="sticker flex flex-col gap-2 p-5">
                <h3 className="font-display text-[19px] font-extrabold leading-tight">{p.title}</h3>
                <p className="text-[14.5px] text-ink-2">{p.body}</p>
                <Link href={p.href} className="mt-auto inline-flex items-center gap-1 pt-2 text-[13.5px] font-bold text-cobalt-ink hover:underline">
                  {p.link} <ArrowRight aria-hidden="true" size={14} strokeWidth={2.5} />
                </Link>
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
        <p className="mt-4 max-w-[66ch] text-[16px] text-ink-2">
          What is sold is the seller&rsquo;s own code, written against the SDK, as a SCRIPT//GO script that runs on the environments
          it declares. Sellers declare their rights when they publish and answer for what they sell.
        </p>
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
        <p className="mt-4 max-w-[64ch] text-[16px] text-ink-2">
          A package&rsquo;s README example on the left, and what each environment printed when{" "}
          <code className="font-mono text-[14px]">scriptgo verify</code> ran it next to the package. Every line on the right comes
          from a recorded compatibility run.
        </p>
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

      <Ridge from="paper2" to="paper" ink="sand" n={2} />
      <section aria-labelledby="roadmap-title" className="sec g-paper bleed sec-sweeps container-page !pt-10">
        <Eyebrow className="mb-[18px]">Roadmap</Eyebrow>
        <DisplayTitle id="roadmap-title" className="text-[38px] sm:text-[48px]">
          Not built <em>yet.</em>
        </DisplayTitle>
        <p className="mt-4 max-w-[64ch] text-[16px] text-ink-2">
          What is in development, then the plan in the order it is meant to land. Nothing here is usable today; each item is
          listed as available only once it passes real runs.
        </p>
        <div className="panel relative mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[14px]">
            <caption className="sr-only">SDK roadmap</caption>
            <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
              <tr>
                <th scope="col" className="px-3 py-2.5">Item</th>
                <th scope="col" className="px-3 py-2.5">State</th>
                <th scope="col" className="px-3 py-2.5">What it is</th>
              </tr>
            </thead>
            <tbody>
              {ROADMAP.map((r) => (
                <tr key={r.title} className="border-t border-line-soft align-top">
                  <th scope="row" className="px-3 py-2.5 font-bold">
                    {r.title}
                  </th>
                  <td className="px-3 py-2.5">
                    <StatusBadge meta={r.status} size="sm" />
                  </td>
                  <td className="px-3 py-2.5 text-ink-2">{r.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[14px] text-ink-2">
          Running a platform we do not list yet?{" "}
          <Link href="/docs/create-adapter" className="font-semibold text-cobalt-ink underline">
            One adapter brings every package to it
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
