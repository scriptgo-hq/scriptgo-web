import { CLI_INSTALL, type GuideCode, type GuideImage, type GuideStep, type GuideTrack } from "./shared";

/**
 * Pieces every guide shares: the drawings, the dashboard screens that show nothing of one platform
 * (profile, token, store), and the steps that read the same on every platform. A screen that shows
 * one platform (the offer form with OPEN//77 ticked, a licence for OPEN//77) stays in that platform's
 * guide; elsewhere the step gets a drawing.
 */

export const SCREEN_W = 1132;

export const screen = (file: string, width: number, height: number, alt: string, caption?: string): GuideImage => ({
  src: `/guides/open77/${file}.webp`,
  width,
  height,
  alt,
  kind: "screen",
  caption,
});

/** The Ink drawings under /ink. Most are 1152x720; the stall, pass, strongbox and signpost are 1152x691. */
export const scene = (name: string, alt: string, height = 720): GuideImage => ({ src: `/ink/scene-${name}.webp`, width: 1152, height, alt, kind: "scene" });

export const SCENE = {
  toolcase: () => scene("toolcase", "An open tool case on a mountain ledge at dusk."),
  workbench: () => scene("workbench", "A workbench under a canvas awning, with gears, a toolbox and a rolled plan."),
  scaffold: () => scene("scaffold", "A stone tower going up inside wooden scaffolding."),
  adapter: () => scene("adapter", "A plug about to meet its socket on a rocky slope."),
  gate: () => scene("gate", "A striped barrier gate beside a guard hut, closed across a mountain road."),
  serverkey: () => scene("serverkey", "A server cabinet on a mountain ridge, with a key hanging from its lock."),
  seal: () => scene("seal", "A parcel wrapped in paper and ribbon, closed with a gold wax seal, on a rock at night."),
  logbook: () => scene("logbook", "An open ledger on a rock beside a lantern, with an ink stamp resting on its page."),
  depot: () => scene("depot", "A supply depot under a canvas roof at dusk: shelves of labelled crates and jars, and a ladder."),
  stall: () => scene("stall", "A market stall with a striped awning on a mountain path, crates and stacks of coins on its counter.", 691),
  signpost: () => scene("signpost", "A traveller at a signpost with many arms, looking out over a city, a mesa, a forest and a castle.", 691),
};

/** The common start: an account, a token, the CLI. `example` is the package id shown on the profile. */
export function startSteps(example: string): GuideStep[] {
  return [
    {
      id: "account",
      title: "Create your account and creator profile.",
      text: `Sign up, then open Dashboard → Settings → Creator profile. Its username names your packages: \`${example}\`.`,
      images: [screen("creator-profile", SCREEN_W, 299, "The Creator profile section of Dashboard Settings: namespace kestrel//, display name Kestrel Works, a one-line bio.")],
      link: { href: "/sign-up", label: "Create an account" },
    },
    {
      id: "token",
      title: "Make an access token.",
      text: "Dashboard → Settings → Access tokens. It starts with `sg_pat_` and is shown once: copy it then.",
      notes: ["Keep it out of resource folders and repositories."],
      images: [screen("access-token", SCREEN_W, 478, "The Access tokens section: a token named laptop-cli has just been created and its value, blurred here, is shown once with a Copy button.")],
      link: { href: "/dashboard/settings#tokens", label: "Your access tokens" },
    },
    {
      id: "cli",
      title: "Install the CLI.",
      text: `It needs Node.js ${CLI_INSTALL.node} or later. Then sign it in with your token.`,
      commands: [CLI_INSTALL.command, CLI_INSTALL.login],
      images: [SCENE.toolcase()],
      link: { href: "/docs/cli", label: "The CLI" },
    },
  ];
}

/** Connect a Tebex store: the screens show no platform. */
export function storeStep(): GuideStep {
  return {
    id: "store",
    title: "Connect your own Tebex store.",
    text: "Create a package for it in your Tebex store. Then, in Dashboard → Stores, paste its webhook secret and public token, and add the webhook URL the page shows in Tebex → Developers → Webhooks.",
    notes: ["Both values are stored sealed and never shown again. No staff approves your store."],
    images: [
      screen("tebex-connect", SCREEN_W, 488, "The Connect a store form with Tebex selected: a webhook secret field (Tebex → Developers → Webhooks) and a public token field (Tebex → Integrations → Headless API)."),
      screen("tebex-store", 1100, 267, "The connected Tebex store card: checkout off while Tebex approval is awaited, no staff approval needed, and the webhook URL to copy (blurred here)."),
    ],
    link: { href: "/dashboard/stores", label: "Your stores" },
  };
}

export function offerStep(envName: string): GuideStep {
  return {
    id: "offer",
    title: "Set the offer and its price.",
    text: `On your package's page: New offer. Pick the billing, the price, Tebex and its package id, how many servers one licence covers, and ${envName} under Runs on.`,
    notes: ["With your rights declared on a published release, the offer is on sale. Nobody reviews it first."],
    images: [SCENE.stall()],
    link: { href: "/dashboard/packages", label: "Your packages" },
  };
}

/** Store and offer in one step, for a track that comes after a track that showed both. */
export function sellLikeAScriptStep(envName: string, scriptTrack: string | null): GuideStep {
  return {
    id: "sell",
    title: "Sell it like a script.",
    text: `Connect your Tebex store, then add an offer on the package with ${envName} under Runs on. Same licences, renewals and refunds as a script.`,
    notes: ["Nobody reviews an offer before it goes on sale."],
    images: [SCENE.stall()],
    link: scriptTrack ? { href: `#${scriptTrack}-store`, label: "The store and the offer, step by step" } : { href: "/docs/selling", label: "Selling" },
  };
}

export function buyerLicenceStep(envName: string, who: string): GuideStep {
  return {
    id: "buyer-licence",
    who,
    title: "The buyer adds a deployment.",
    text: `After a verified payment the licence is in their Dashboard → Licences. They add a deployment for ${envName}; its token is shown once.`,
    images: [SCENE.serverkey()],
    link: { href: "/dashboard/licenses", label: "Licences" },
  };
}

/** The licence check is the same Lua on every platform: only where the key comes from changes. */
export function licenceCheck(keyComment: string): string {
  return `CreateThread(function()
  local result, code = ScriptGo.licensing.verify({
    -- ${keyComment}
    licenseKey = ScriptGo.config.get("license_key"),
    package = "kestrel//inventory-pro",
  })
  if not result or not result.valid then
    local why = result and result.reason or code
    ScriptGo.log.error("licence: " .. tostring(why))
  end
end)`;
}

export function scriptManifest(env: string): string {
  return `resource "inventory_pro"
version "1.0.0"
scriptgo_version ">=0.1.0"
title "Inventory Pro"
license "LicenseRef-Proprietary"
licensed true

lua { "5.1", "5.4", "luajit" }
environments { "standalone", "${env}" }
capabilities { "events", "storage", "licensing" }

shared_script "shared/core.lua"
server_script "server/main.lua"
server_script "server/license.lua"
test_script "tests/core_test.lua"`;
}

/** An asset package's manifest head: the lines every one starts with. */
export function assetManifest(name: string, title: string, env: string, lines: string): string {
  return `resource "${name}"
version "1.0.0"
scriptgo_version ">=0.1.0"
title "${title}"
license "LicenseRef-Proprietary"
licensed true
environments { "${env}" }

${lines}`;
}

/** Validate, the same command and the same report everywhere. */
export function validateStep(dir: string, envName: string, extraNotes: string[] = []): GuideStep {
  return {
    id: "validate",
    title: "Check it.",
    text: `\`scriptgo validate\` checks every file, inside archives too, and prints what each player downloads on ${envName} and anything the server needs.`,
    commands: [`scriptgo validate ${dir}`],
    notes: ["Assets are data: a model, a texture, a map. Code in an asset package is refused, whatever its name: code goes in scripts.", ...extraNotes],
    images: [SCENE.scaffold()],
    link: { href: "/docs/selling-assets#what-you-can-sell", label: "What you can sell" },
  };
}

/** Publish an asset package. `escrow` adds the OPEN//77 encrypted variant. */
export function publishAssetsStep(opts: { escrow?: boolean; why?: string } = {}): GuideStep {
  return {
    id: "publish",
    title: opts.escrow ? "Publish it, encrypted if you like." : "Publish it.",
    text: opts.escrow
      ? "`--asset-rights` says whether you made it (`original`), edited the game's own files (`game-edits`) or included files taken from the game (`game-extracted`); operators see it. With `--asset-escrow`, each server's copy carries its archives encrypted for that server."
      : "`--asset-rights` says whether you made it (`original`), edited the game's own files (`game-edits`) or included files taken from the game (`game-extracted`); operators see it on the package page.",
    commands: opts.escrow
      ? ["scriptgo publish --asset-rights original --owns-code", "scriptgo publish --asset-escrow --asset-rights original --owns-code"]
      : ["scriptgo publish --asset-rights original --owns-code"],
    notes: opts.escrow
      ? [
          "A key per deployment, held by the licensed server, and given only to players the OPEN//77 master admits to it.",
          "Revoke the licence or stop the deployment: from the next key renewal, a game started after that cannot open the archives.",
          "While the game runs, the decrypted archives are on the player's disk: a player can copy what their game loads.",
          "It cannot be combined with `--escrow` on the same release.",
        ]
      : [opts.why ?? "Not encrypted: the game client is the platform's, and a server package cannot run a decryptor in it.", "A published version never changes: to fix 1.0.0, publish 1.0.1."],
    images: [opts.escrow ? SCENE.seal() : SCENE.depot()],
    link: { href: opts.escrow ? "/docs/selling-assets#encrypted-assets-on-open77" : "/docs/selling-assets#protection", label: opts.escrow ? "Encrypted assets on OPEN//77" : "What protects an asset" },
  };
}

/** Per-buyer fingerprinted copies. `copy` is the downloaded file shown in the command. */
export function fingerprintStep(copy: string, caveat?: string): GuideStep {
  return {
    id: "fingerprint",
    title: "Every buyer gets their own copy.",
    text: "Each download carries a signed record of its licence, so a copy found elsewhere names who downloaded it. Report a leak with the file: the licence can be revoked.",
    commands: [`scriptgo assets fingerprint ${copy}`],
    notes: [caveat ?? "Unzipping and repacking a copy removes its record: assets are licensed and traceable, not copy-proof."],
    images: [SCENE.logbook()],
    link: { href: "/docs/selling-assets#check-a-copy", label: "Check a copy" },
  };
}

export const NOT_LIVE = {
  title: "Checkout opens on Tebex approval.",
  text: "Every step here can be set up and tested today; payments through Tebex start once Tebex approves them.",
} as const;

export interface ScriptTrackOptions {
  slug: string;
  name: string;
  /** Where the licence key comes from on this platform, as a comment in the licence check. */
  keyComment: string;
  /** Said once, at the top of the track. */
  before?: string[];
  writeNotes?: string[];
  test: { text: string; commands: string[]; notes?: string[] };
  /** Code escrow exists on this platform (`--escrow`). */
  escrow?: boolean;
  /** Why releases are not encrypted here, when `escrow` is false. */
  noEscrow?: string;
  install: { text: string; commands?: string[]; notes?: string[] };
  config: { text: string; filename: string; code: string };
  docs: string;
}

/** "Sell a script" on a platform whose server runs SCRIPT//GO scripts: the same shape everywhere. */
export function scriptTrack(o: ScriptTrackOptions): GuideTrack {
  return {
    id: "sell-a-script",
    tag: "Track 1",
    title: "Sell a",
    titleEm: "script.",
    lede: `A studio sells a script to the people who run ${o.name} servers. Example: Kestrel Works sells Inventory Pro.`,
    before: o.before,
    steps: [
      ...startSteps("kestrel//inventory-pro"),
      {
        id: "write",
        title: "Write the resource.",
        text: "A folder with a `scriptgo.lua` manifest and your scripts. `scriptgo init inventory_pro` writes one to start from.",
        code: [
          { lang: "lua", filename: "inventory_pro/scriptgo.lua", code: scriptManifest(o.slug) },
          { lang: "lua", filename: "inventory_pro/server/license.lua", code: licenceCheck(o.keyComment) },
        ],
        notes: o.writeNotes,
        images: [SCENE.workbench()],
        link: { href: "/docs/quickstart", label: "Quickstart" },
      },
      {
        id: "test",
        title: "Test it.",
        text: o.test.text,
        commands: o.test.commands,
        notes: o.test.notes,
        images: [SCENE.scaffold()],
        link: { href: "/docs/environments", label: "How a status is earned" },
      },
      {
        id: "publish",
        title: o.escrow ? "Publish it, and protect it if you like." : "Publish it.",
        text: o.escrow
          ? "`--owns-code` declares your rights. With `--escrow` your server scripts are encrypted before they leave your machine, and run only on the server their licence is bound to."
          : "`--owns-code` declares your rights. Every release is signed, and the licence is checked on the server.",
        commands: o.escrow ? ["scriptgo publish --owns-code", "scriptgo publish --escrow --owns-code"] : ["scriptgo publish --owns-code"],
        notes: [
          ...(o.escrow
            ? ["A licence can be revoked and a leaked copy traced. It does not make copying impossible: an operator can still inspect their own server."]
            : [o.noEscrow ?? `${o.name} runs plain script, so a server's operator can read what it loads: no encryption here.`]),
          "A published version never changes: to fix 1.0.0, publish 1.0.1.",
        ],
        images: [o.escrow ? SCENE.seal() : SCENE.depot()],
        link: { href: "/protect", label: "How protection works" },
      },
      storeStep(),
      offerStep(o.name),
      buyerLicenceStep(o.name, `Then your buyer, on their ${o.name} server`),
      {
        id: "buyer-install",
        title: "They install it on the server.",
        text: o.install.text,
        commands: o.install.commands,
        notes: o.install.notes,
        images: [SCENE.adapter()],
        link: { href: o.docs, label: `Set up on ${o.name}, in full` },
      },
      {
        id: "buyer-config",
        title: "They set the licence key.",
        text: o.config.text,
        code: [{ lang: "json", filename: o.config.filename, code: o.config.code }],
        images: [SCENE.gate()],
        link: { href: "/docs/licensing-api", label: "Licensing API" },
      },
    ],
  };
}

/** The "Sell assets" track's frame: the steps are the platform's own. */
export function assetsTrack(o: { tag: string; lede: string; before?: string[]; steps: GuideStep[] }): GuideTrack {
  return { id: "sell-assets", tag: o.tag, title: "Sell", titleEm: "assets.", lede: o.lede, before: o.before, steps: o.steps };
}

/**
 * "Protect your own server": a server owner keeps their own scripts from leaking, with nothing sold
 * (no store, no offer, no Tebex). Only where SCRIPT//GO has a loader that decrypts on the server
 * (code escrow). Sources at the pinned SDK tag: docs/site/protect-your-own-server.md and the
 * platform's setup page.
 */
export interface ProtectOwnOptions {
  tag: string;
  name: string;
  /** The environment slug the grant names. */
  slug: string;
  /** One plain line on what was run for real. */
  tested: string;
  /** Turn the loader on and read the server's public key. */
  keyStep: { text: string; code?: GuideCode[]; notes?: string[] };
  /** Put the encrypted release and the token on the server. */
  installStep: { text: string; commands: string[]; code?: GuideCode[]; notes?: string[] };
  docs: string;
  /** Extra steps after the main ones (OPEN//77: maps and other assets). */
  extra?: GuideStep[];
}

export const PROTECT_OWN_DOC = "/docs/protect-your-own-server";

export function protectOwnServerTrack(o: ProtectOwnOptions): GuideTrack {
  return {
    id: "protect-own-server",
    tag: o.tag,
    title: "Protect your",
    titleEm: "own server.",
    lede: `You run a ${o.name} server and want its scripts not to leak: to staff who leave, to a host, to another server. Nothing is sold.`,
    before: [
      "You need an account, a creator profile, an access token and the CLI, as in Track 1. No store, no offer, no Tebex.",
      o.tested,
    ],
    steps: [
      {
        id: "server-side",
        title: "Keep what matters in server scripts.",
        text: "Only server scripts are encrypted. Client scripts, shared scripts and the UI are sent to every player's game, so they stay readable.",
        images: [SCENE.workbench()],
      },
      {
        id: "publish",
        title: "Publish it privately, encrypted.",
        text: "`--escrow` encrypts your server scripts before they leave your machine. `--private` keeps the package off every page and list: only you see it, and the servers you grant it to.",
        commands: ["scriptgo publish my_scripts --escrow --private --owns-code"],
        notes: ["`--escrow-ignore config.lua` keeps a file readable, such as a config your staff edit."],
        images: [SCENE.seal()],
      },
      {
        id: "key",
        title: "Turn protection on and read your server's key.",
        text: o.keyStep.text,
        code: o.keyStep.code,
        notes: o.keyStep.notes,
        images: [SCENE.serverkey()],
        link: { href: o.docs, label: `Set up on ${o.name}, in full` },
      },
      {
        id: "grant",
        title: "Grant the package to that key.",
        text: "A free licence, held by you and bound to your server from the start. Its deployment token is shown once: copy it.",
        commands: [`scriptgo grant create my-scripts --server-key <the key> --environment ${o.slug} --name main-server`],
        notes: [
          "Or on the site: your package → Free licenses → My own server.",
          "The token alone is useless: it works only together with your server's own key.",
        ],
        images: [scene("pass", "A gold pass hanging at the open door of a cabin, behind a velvet rope.", 691)],
        link: { href: "/dashboard/packages", label: "Your packages" },
      },
      {
        id: "install",
        title: "Install it, still encrypted, with its token.",
        text: o.installStep.text,
        commands: o.installStep.commands,
        code: o.installStep.code,
        notes: o.installStep.notes,
        images: [SCENE.adapter()],
      },
      {
        id: "result",
        title: "A copied folder runs nowhere else.",
        text: "The key goes to your server only. Another server with the same folder, token included, is refused. You can revoke the licence at any time, every delivery is marked with the server it went to, and a changed file is refused.",
        commands: ["scriptgo grant revoke <licence id> --reason \"server retired\""],
        notes: [
          "Whoever controls the machine can still, with real effort, read what their own server runs. Choose your host accordingly.",
          "It is not obfuscation, and it does not hide what players' games receive.",
        ],
        images: [SCENE.logbook()],
        link: { href: PROTECT_OWN_DOC, label: "What it does and does not do" },
      },
      ...(o.extra ?? []),
    ],
  };
}

/** The same track where SCRIPT//GO has no loader that decrypts on the server: said plainly, no steps. */
export function noProtectOwnServerTrack(o: { tag: string; name: string; why: string }): GuideTrack {
  return {
    id: "protect-own-server",
    tag: o.tag,
    title: "Protect your",
    titleEm: "own server.",
    lede: `Keeping a ${o.name} server's own scripts from leaking, with nothing sold.`,
    before: [
      `Not available on ${o.name}. ${o.why}`,
      "Where it works today: OPEN//77 and Rust, whose servers decrypt protected scripts themselves.",
    ],
    steps: [],
  };
}
