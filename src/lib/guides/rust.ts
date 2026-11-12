import { platformDocHref } from "@/lib/docs";
import { assetManifest, assetsTrack, NOT_LIVE, protectOwnServerTrack, publishAssetsStep, SCENE, scriptTrack, sellLikeAScriptStep, validateStep } from "./common";
import { API_HOST, type Guide } from "./shared";

/**
 * Selling on Rust (Oxide or Carbon). Sources, at the SDK tag in package.json:
 * docs/site/platforms/rust.md, docs/site/selling-assets.md, docs/spec/assets.md, sdk/adapters/rust
 * (README, SETUP). Code escrow runs there (measured on Oxide and Carbon). Assets: one custom map, for
 * server.levelurl; checked with the CLI of that tag (validate and pack --target rust), not run.
 */

const DOCS = platformDocHref("rust", true);

export const RUST_GUIDE: Guide = {
  slug: "rust",
  name: "Rust",
  title: "Sell on Rust,",
  titleEm: "step by step.",
  lede: "Sell a script to server operators, or sell a custom map. Or sell nothing, and keep your own server's scripts from leaking.",
  notLive: NOT_LIVE,
  tracks: [
    scriptTrack({
      slug: "rust",
      name: "Rust",
      keyComment: 'on Rust: "license_key" in the plugin config, ScriptGo.json',
      writeNotes: ["Rust has no client-side plugins: server scripts only."],
      test: {
        text: "`scriptgo test` runs your test scripts on Lua 5.4, 5.1 and LuaJIT.",
        commands: ["scriptgo test inventory_pro"],
        notes: ["A `verify` run on a Rust server builds the SCRIPT//GO plugin: it runs from a checkout of the SDK."],
      },
      escrow: true,
      install: {
        text: "They install the SCRIPT//GO plugin for Oxide or Carbon, then put the resource in `oxide/data/ScriptGo/resources/inventory_pro/` (Carbon: `carbon/data/...`). A protected release installs still encrypted, with its own steps.",
        commands: ["scriptgo add kestrel//inventory-pro"],
      },
      config: {
        text: "The API host must be allowed, and the key goes in the plugin config, never in the resource folder.",
        filename: "oxide/config/ScriptGo.json",
        code: `{
  "httpAllowedHosts": ["${API_HOST}"],
  "resources": {
    "inventory_pro": { "license_key": "<your licence key>" }
  }
}`,
      },
      docs: DOCS,
    }),
    assetsTrack({
      tag: "Track 2",
      lede: "A custom map, sold like a script. Example: Kestrel Works sells Harbor Island.",
      before: [
        "You need a creator profile, an access token and the CLI, as in Track 1.",
        "One map per package: a Rust plugin cannot send other files to players. Packed and checked by the CLI, not yet run on a real server.",
      ],
      steps: [
        {
          id: "declare",
          title: "Declare the map.",
          text: "`environment_asset` names your `.map` file. A package can hold the map and scripts, or the map only.",
          code: [{ lang: "lua", filename: "harbor_island/scriptgo.lua", code: assetManifest("harbor_island", "Harbor Island", "rust", 'environment_asset "rust" "harbor_island.map"') }],
          images: [SCENE.signpost()],
          link: { href: "/docs/selling-assets#how-each-platform-delivers-them", label: "What each platform delivers" },
        },
        validateStep("harbor_island", "Rust"),
        publishAssetsStep({ why: "Not encrypted: the Rust client is Facepunch's." }),
        {
          id: "copies",
          title: "A licensed download.",
          text: "Only licence holders can download the release, and every release is signed.",
          notes: ["The map is one loose file that players download from the operator's URL: copies are not fingerprinted per buyer."],
          images: [SCENE.logbook()],
          link: { href: "/docs/selling-assets#protection", label: "What protects an asset" },
        },
        sellLikeAScriptStep("Rust", "sell-a-script"),
        {
          id: "buyer-install",
          who: "Then your buyer, on their Rust server",
          title: "The buyer hosts the map.",
          text: "`pack` gives them the `.map` file. They put it at a web address the server and players can reach and start the server with `+server.levelurl` set to it.",
          commands: ["scriptgo add kestrel//harbor-island", "scriptgo pack resources/harbor_island --target rust --out dist"],
          images: [SCENE.adapter()],
          link: { href: DOCS, label: "Set up on Rust, in full" },
        },
        {
          id: "players",
          title: "Players download it when they join.",
          text: "The server and every player fetch the map from that address.",
          images: [SCENE.depot()],
        },
      ],
    }),
    protectOwnServerTrack({
      tag: "Track 3",
      name: "Rust",
      slug: "rust",
      tested: "Protected scripts were run on real Rust servers, with Oxide and with Carbon on Windows and with Oxide on Linux: licensed, bound to the server, refused elsewhere, stopped on a refund.",
      keyStep: {
        text: "Install the SCRIPT//GO plugin with its native library, then turn escrow on in the plugin config. The first protected start logs `this server's public key is` followed by 43 characters.",
        code: [{ lang: "json", filename: "oxide/config/ScriptGo.json", code: `"escrow": { "enabled": true, "master": "https://${API_HOST}", "trustedSigners": [] }` }],
        notes: ["Carbon: `carbon/configs/ScriptGo.json`. The identity is kept in `oxide/data/ScriptGo/escrow/identity.key`: back it up."],
      },
      installStep: {
        text: "Download the encrypted release with the token, install it without decrypting anything, and write the token in its own file. Then `scriptgo start my_scripts` in the server console.",
        commands: [
          "scriptgo add <you>//my-scripts --deployment-token <sg_dep_...>",
          "scriptgo escrow install resources/my_scripts-1.0.0.escrow.zip --target rust --out oxide/data/ScriptGo/resources",
        ],
        code: [{ lang: "bash", filename: "oxide/data/ScriptGo/escrow/tokens/my_scripts.token", code: "sg_dep_..." }],
        notes: ["`scriptgo status` shows `started [escrow licensed, ...]`, or why it was refused."],
      },
      docs: DOCS,
    }),
  ],
  more: [
    { href: "/docs/selling", label: "Selling" },
    { href: "/docs/selling-assets", label: "Selling assets" },
    { href: "/docs/protect-your-own-server", label: "Protect your own server" },
    { href: "/docs/protect-your-work", label: "Protect your work" },
    { href: "/docs/cli", label: "The CLI" },
  ],
};
