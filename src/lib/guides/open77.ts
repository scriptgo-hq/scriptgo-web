import { platformDocHref } from "@/lib/docs";
import { API_HOST, CLI_INSTALL, type Guide, type GuideImage } from "./shared";

/**
 * Selling on OPEN//77, from an empty account to a running server. Sources, at the SDK tag in
 * package.json: docs/site/{selling,quickstart,cli,protect-your-work,licensing-api}.md,
 * docs/spec/{perks,open77}.md, sdk/adapters/open77/SETUP.md and escrow/README.md, and the OPEN//77
 * entry of sdk/environments.json. Where they disagree, the dashboard code of this site wins (a paid
 * offer needs a connected store, so the store comes before the offer).
 *
 * Screens: the real dashboard, on a throwaway local stack with demo data (Kestrel Works, Harbor City
 * RP), light theme, every token and secret blurred.
 */

const W = 1132;
const screen = (file: string, width: number, height: number, alt: string, caption?: string): GuideImage => ({
  src: `/guides/open77/${file}.webp`,
  width,
  height,
  alt,
  kind: "screen",
  caption,
});
const scene = (name: string, alt: string): GuideImage => ({ src: `/ink/scene-${name}.webp`, width: 1152, height: 720, alt, kind: "scene" });

const MANIFEST = `resource "inventory_pro"
version "1.0.0"
scriptgo_version ">=0.1.0"
title "Inventory Pro"
license "LicenseRef-Proprietary"
licensed true

lua { "5.1", "5.4", "luajit" }
environments { "standalone", "open77" }
capabilities { "events", "storage", "licensing" }

shared_script "shared/core.lua"
server_script "server/main.lua"
server_script "server/license.lua"
client_script "client/main.lua"
test_script "tests/core_test.lua"`;

const LICENSE_CHECK = `CreateThread(function()
  local result, code = ScriptGo.licensing.verify({
    -- on OPEN//77: the convar inventory_pro:license_key
    licenseKey = ScriptGo.config.get("license_key"),
    package = "kestrel//inventory-pro",
  })
  if not result or not result.valid then
    local why = result and result.reason or code
    ScriptGo.log.error("licence: " .. tostring(why))
  end
end)`;

const SERVER_JSON_SCRIPT = `"http": { "enabled": true, "allowedHosts": ["${API_HOST}"] },
"convars": {
  "scriptgo_api": "https://${API_HOST}",
  "inventory_pro:license_key": "<your licence key>"
}`;

const SERVER_JSON_PERKS = `"http": { "enabled": true, "allowedHosts": ["${API_HOST}"] },
"convars": {
  "scriptgo_api": "https://${API_HOST}",
  "scriptgo_server_token": "sg_srv_..."
}`;

const PERK_SCRIPT = `AddEventHandler("playerJoining", function()
  local player = source
  CreateThread(function()   -- has() waits for the API
    local has = ScriptGo.perks.has(player, "vip")
    if has then --[[ the VIP garage slot ]] end
  end)
end)

ScriptGo.perks.on("granted", function(player, key, info)
  -- a purchase
end)
ScriptGo.perks.on("removed", function(player, key, info)
  -- a refund, a chargeback, the end of the period
end)

RegisterCommand("vip", function(player)
  local url = ScriptGo.perks.purchaseLink(player, "vip")
  -- send url to that player: it is signed for them
end)`;

export const OPEN77_GUIDE: Guide = {
  slug: "open77",
  name: "OPEN//77",
  title: "Sell on OPEN//77,",
  titleEm: "step by step.",
  lede: "Two ways to earn: sell a script to server operators, or sell bonuses to the players of your own server.",
  notLive: {
    title: "Checkout opens on Tebex approval.",
    text: "Every step here can be set up and tested today; payments through Tebex start once Tebex approves them.",
  },
  tracks: [
    {
      id: "sell-a-script",
      tag: "Track 1",
      title: "Sell a",
      titleEm: "script.",
      lede: "A studio sells a script to the people who run OPEN//77 servers. Example: Kestrel Works sells Inventory Pro.",
      steps: [
        {
          id: "account",
          title: "Create your account and creator profile.",
          text: "Sign up, then open Dashboard → Settings → Creator profile. Its username names your packages: `kestrel//inventory-pro`.",
          images: [screen("creator-profile", W, 299, "The Creator profile section of Dashboard Settings: namespace kestrel//, display name Kestrel Works, a one-line bio.")],
          link: { href: "/sign-up", label: "Create an account" },
        },
        {
          id: "token",
          title: "Make an access token.",
          text: "Dashboard → Settings → Access tokens. It starts with `sg_pat_` and is shown once: copy it then.",
          notes: ["Keep it out of resource folders and repositories."],
          images: [screen("access-token", W, 478, "The Access tokens section: a token named laptop-cli has just been created and its value, blurred here, is shown once with a Copy button.")],
          link: { href: "/dashboard/settings#tokens", label: "Your access tokens" },
        },
        {
          id: "cli",
          title: "Install the CLI.",
          text: `It needs Node.js ${CLI_INSTALL.node} or later. Then sign it in with your token.`,
          commands: [CLI_INSTALL.command, CLI_INSTALL.login],
          images: [scene("toolcase", "An open tool case on a mountain ledge at dusk.")],
          link: { href: "/docs/cli", label: "The CLI" },
        },
        {
          id: "write",
          title: "Write the resource.",
          text: "A folder with a `scriptgo.lua` manifest and your shared, server and client scripts. `scriptgo init inventory_pro` writes one to start from.",
          code: [
            { lang: "lua", filename: "inventory_pro/scriptgo.lua", code: MANIFEST },
            { lang: "lua", filename: "inventory_pro/server/license.lua", code: LICENSE_CHECK },
          ],
          notes: [
            "OPEN//77 sends shared and client scripts to players' game clients: keep valuable logic in server scripts.",
            "OPEN//77's sandbox has no `os`, `io`, `debug`, `package` or `load`; `scriptgo validate` checks it.",
          ],
          images: [scene("workbench", "A workbench under a canvas awning, with gears, a toolbox and a rolled plan.")],
          link: { href: "/docs/quickstart", label: "Quickstart" },
        },
        {
          id: "test",
          title: "Test it.",
          text: "`scriptgo test` runs your test scripts on Lua 5.4, 5.1 and LuaJIT. `verify` starts a real OPEN//77 dedicated server with your resource and reads its log.",
          commands: ["scriptgo test inventory_pro", "scriptgo verify inventory_pro --env open77 --open77-server <path to Open77.Server.exe>"],
          notes: ["Only the server half runs in `verify`: no game client joins."],
          images: [scene("scaffold", "A stone tower going up inside wooden scaffolding.")],
          link: { href: "/docs/environments", label: "How a status is earned" },
        },
        {
          id: "publish",
          title: "Publish it, and protect it if you like.",
          text: "`--owns-code` declares your rights. With `--escrow` your server scripts are encrypted before they leave your machine, and run only on the server their licence is bound to.",
          commands: ["scriptgo publish --owns-code", "scriptgo publish --escrow --owns-code"],
          notes: [
            "Only server scripts are encrypted: shared and client scripts go to game clients, so they stay readable.",
            "A licence can be revoked and a leaked copy traced. It does not make copying impossible: an operator can still inspect their own server.",
            "A published version never changes: to fix 1.0.0, publish 1.0.1.",
          ],
          images: [
            screen(
              "new-release",
              W,
              827,
              "The Upload a release page with “Protect this release (escrow)” ticked, a box for files left readable, and the same two commands for the CLI.",
              "Or upload a zip on the site, with the same option.",
            ),
          ],
          link: { href: "/protect", label: "How protection works" },
        },
        {
          id: "store",
          title: "Connect your own Tebex store.",
          text: "Create a package for the script in your Tebex store. Then, in Dashboard → Stores, paste its webhook secret and public token, and add the webhook URL the page shows in Tebex → Developers → Webhooks.",
          notes: ["Both values are stored sealed and never shown again. No staff approves your store."],
          images: [
            screen("tebex-connect", W, 488, "The Connect a store form with Tebex selected: a webhook secret field (Tebex → Developers → Webhooks) and a public token field (Tebex → Integrations → Headless API)."),
            screen("tebex-store", 1100, 267, "The connected Tebex store card: checkout off while Tebex approval is awaited, no staff approval needed, and the webhook URL to copy (blurred here)."),
          ],
          link: { href: "/dashboard/stores", label: "Your stores" },
        },
        {
          id: "offer",
          title: "Set the offer and its price.",
          text: "On your package's page: New offer. Pick the billing, the price, Tebex and its package id, how many servers one licence covers, and OPEN//77 under Runs on.",
          notes: ["With your rights declared on a published release, the offer is on sale. Nobody reviews it first."],
          images: [
            screen("offer-form", W, 690, "The New offer form: Server licence, monthly, 9.99 EUR, Tebex, Tebex package id 6012345, one deployment, OPEN//77 ticked under Runs on."),
            screen("offers", W, 360, "The Offers table of the package: Server licence, €9.99 monthly via Tebex, runs on OPEN//77, checkout off until Tebex approves."),
          ],
          link: { href: "/dashboard/packages", label: "Your packages" },
        },
        {
          id: "buyer-licence",
          who: "Then your buyer, on their OPEN//77 server",
          title: "The buyer adds a deployment.",
          text: "After a verified payment the licence is in their Dashboard → Licences. They add a deployment for OPEN//77; its token is shown once.",
          images: [screen("licence", W, 324, "A licence page: covered environment OPEN//77, one of one deployment in use, and the deployment harbor-eu-1 waiting for its first check.")],
          link: { href: "/dashboard/licenses", label: "Licences" },
        },
        {
          id: "buyer-install",
          title: "They install it on the server.",
          text: "`pack` turns the package into a folder OPEN//77 loads as is. A protected release installs still encrypted, with its own steps.",
          commands: [
            "scriptgo add kestrel//inventory-pro",
            "scriptgo pack resources/inventory_pro --target open77 --out dist",
          ],
          images: [scene("adapter", "A plug about to meet its socket on a rocky slope.")],
          link: { href: platformDocHref("open77", true), label: "Set up on OPEN//77, in full" },
        },
        {
          id: "buyer-config",
          title: "They allow the API and set the key.",
          text: "OPEN//77 keeps outbound HTTP off until the operator lists a host. The licence key goes in a convar, never in the resource folder.",
          code: [{ lang: "json", filename: "server.jsonc", code: SERVER_JSON_SCRIPT }],
          images: [scene("gate", "A striped barrier gate beside a guard hut, closed across a mountain road.")],
          link: { href: "/docs/licensing-api", label: "Licensing API" },
        },
      ],
    },
    {
      id: "sell-bonuses",
      tag: "Track 2",
      title: "Sell bonuses to",
      titleEm: "your players.",
      lede: "A server operator sells a perk, such as a monthly VIP, to the players of their own servers. Example: Harbor City RP sells “vip”.",
      before: [
        "You need a creator profile and a connected store, as in Track 1.",
        "Perks need players authenticated by the OPEN//77 master: a masterless (`devLocalAuth`) server gives its players no identifier, so they have no perk there.",
      ],
      steps: [
        {
          id: "perk",
          title: "Create the perk.",
          text: "Dashboard → Perks → New perk: the key your script asks for, the name players see, monthly or one-time, the price, your store and its product id, and your declaration.",
          notes: ["The key cannot be changed later. What you sell is a feature of your own script, on your own server."],
          images: [
            screen("perk-form", 1091, 722, "The New perk form: key vip, name VIP, a one-line description, monthly billing, 4.99 EUR, Tebex with product id 6098765, and both declaration boxes ticked."),
            screen("perk-offers", W, 230, "The Perk offers table: vip, €4.99 per month through Tebex, sold on the seller's declaration, checkout off until Tebex approves."),
          ],
          link: { href: "/dashboard/perks", label: "Your perks" },
        },
        {
          id: "link",
          title: "Link your server.",
          text: "Dashboard → Perks → Servers: name it and create the link. Its `sg_srv_` token is shown once.",
          notes: ["Treat it as a secret. If it leaks, revoke the link and make a new one."],
          images: [screen("server-link", W, 520, "The Servers section: server harbor-eu-1 is linked and its token, blurred here, is shown once with a reminder to set it as scriptgo_server_token.")],
        },
        {
          id: "token",
          title: "Give the token to your OPEN//77 server.",
          text: "Allow the API host and set two convars. Nothing about payments is in OPEN//77: the server only asks SCRIPT//GO.",
          code: [{ lang: "json", filename: "server.jsonc", code: SERVER_JSON_PERKS }],
          images: [scene("serverkey", "A server cabinet on a mountain ridge, with a key hanging from its lock.")],
          link: { href: "/docs/perks", label: "Player perks" },
        },
        {
          id: "script",
          title: "Ask in your script.",
          text: "`ScriptGo.perks.has` tells you if a player holds the perk; `on` hears purchases and refunds; `purchaseLink` gives a player their own link to buy it.",
          code: [{ lang: "lua", filename: "server/vip.lua", code: PERK_SCRIPT }],
          notes: [
            "Add `perks` to the manifest’s `capabilities`.",
            "While Tebex checkout is off, `purchaseLink` answers `nil, \"not_purchasable\"` for a Tebex perk.",
          ],
          images: [scene("beacon", "A lit beacon tower above a small cabin, signalling over the sea.")],
          link: { href: "/docs/perks#the-script-api", label: "The script API" },
        },
        {
          id: "player",
          title: "The player buys it.",
          text: "The link opens a page with the perk, the price, the seller and the player's identifier, and a button to your store. No account needed.",
          images: [
            screen(
              "perk-purchase",
              716,
              504,
              "The purchase page a player opens: VIP, €4.99 per month, sold by Harbor City RP, for the player demo-player-0042, with a button to continue to the store.",
              "Shown with the test store. With Tebex, the button opens your Tebex store once checkout is live.",
            ),
          ],
        },
        {
          id: "active",
          title: "It holds on every server you linked.",
          text: "Granted when your store confirms the payment, renewed with the subscription, removed on a refund, a chargeback or the end of the period.",
          notes: ["A server that loses the API keeps what it knew until the period ends or its offline grace runs out, whichever is first."],
          images: [scene("pass", "A gold pass hanging at the open door of a cabin, behind a velvet rope.")],
        },
      ],
    },
  ],
  more: [
    { href: "/docs/selling", label: "Selling" },
    { href: "/docs/perks", label: "Player perks" },
    { href: "/docs/protect-your-work", label: "Protect your work" },
    { href: "/docs/cli", label: "The CLI" },
  ],
};
