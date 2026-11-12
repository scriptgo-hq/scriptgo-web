import { platformDocHref } from "@/lib/docs";
import {
  assetManifest,
  assetsTrack,
  fingerprintStep,
  NOT_LIVE,
  publishAssetsStep,
  SCENE,
  scriptTrack,
  sellLikeAScriptStep,
  validateStep,
} from "./common";
import { API_HOST, type Guide } from "./shared";

/**
 * Selling on Hytale. Sources, at the SDK tag in package.json: docs/site/platforms/hytale.md,
 * docs/site/selling-assets.md, docs/spec/assets.md, sdk/adapters/hytale (README, SETUP). The plugin
 * and the asset pack target are built and checked with the CLI of that tag (validate and pack
 * --target hytale); no Hytale server has run either.
 */

const DOCS = platformDocHref("hytale", true);

const LAYOUT = `harbor_blocks/
  scriptgo.lua
  dist/harbor_blocks.zip                   -- the asset pack
    manifest.json                          -- "IncludesAssetPack": true, no "Main"
    Common/...                             -- models, textures, sounds
    Server/...                             -- block and item definitions`;

export const HYTALE_GUIDE: Guide = {
  slug: "hytale",
  name: "Hytale",
  title: "Sell on Hytale,",
  titleEm: "step by step.",
  lede: "Two ways to earn: sell a script to server operators, or sell an asset pack.",
  notLive: NOT_LIVE,
  tracks: [
    scriptTrack({
      slug: "hytale",
      name: "Hytale",
      keyComment: 'on Hytale: "license_key" in the plugin\'s scriptgo.json',
      before: ["Not run on a real Hytale server yet: the plugin waits for the server files, which come with a Hytale account."],
      writeNotes: ["Hytale plugins run on the server, and players install nothing: server scripts only."],
      test: {
        text: "`scriptgo test` runs your test scripts on Lua 5.4, 5.1 and LuaJIT.",
        commands: ["scriptgo test inventory_pro"],
      },
      noEscrow: "Encrypted releases are planned on Hytale. Until then: the licence check and signed releases.",
      install: {
        text: "They build and install the SCRIPT//GO plugin as its setup says, then put the resource in `mods/ScriptGo_ScriptGo/resources/inventory_pro/`.",
        commands: ["scriptgo add kestrel//inventory-pro"],
      },
      config: {
        text: "HTTP is off until the operator lists the API host. The key goes in the plugin's settings, never in the resource folder.",
        filename: "mods/ScriptGo_ScriptGo/scriptgo.json",
        code: `{
  "http": { "allowedHosts": ["${API_HOST}"] },
  "resources": {
    "inventory_pro": { "license_key": "<your licence key>" }
  }
}`,
      },
      docs: DOCS,
    }),
    assetsTrack({
      tag: "Track 2",
      lede: "Blocks, models, textures and sounds as an asset pack, sold like a script. Example: Kestrel Works sells Harbor Blocks.",
      before: [
        "You need a creator profile, an access token and the CLI, as in Track 1.",
        "Packed and checked by the CLI, not yet loaded by a real Hytale server.",
      ],
      steps: [
        {
          id: "package",
          title: "Zip the asset pack.",
          text: "A `.zip` with a `manifest.json` that says it includes an asset pack and has no `Main`, then `Common/` and `Server/`.",
          code: [{ lang: "bash", filename: "the package folder", code: LAYOUT }],
          images: [SCENE.workbench()],
          link: { href: "/docs/selling-assets#how-each-platform-delivers-them", label: "What each platform delivers" },
        },
        {
          id: "declare",
          title: "Declare it.",
          text: "`environment_asset` names the pack. A package can hold the pack and scripts, or the pack only.",
          code: [{ lang: "lua", filename: "harbor_blocks/scriptgo.lua", code: assetManifest("harbor_blocks", "Harbor Blocks", "hytale", 'environment_asset "hytale" "dist/harbor_blocks.zip"') }],
          images: [SCENE.signpost()],
          link: { href: "/docs/manifest", label: "The manifest" },
        },
        validateStep("harbor_blocks", "Hytale"),
        publishAssetsStep({ why: "Not encrypted: the game client is Hytale's own." }),
        fingerprintStep("harbor_blocks-1.0.0.zip", "The record sits inside the pack's zip: installed as is, it stays; repacking the zip removes it."),
        sellLikeAScriptStep("Hytale", "sell-a-script"),
        {
          id: "buyer-install",
          who: "Then your buyer, on their Hytale server",
          title: "The buyer installs the pack.",
          text: "`pack` gives them the pack's zip. They copy it into the server's `mods/` folder.",
          commands: ["scriptgo add kestrel//harbor-blocks", "scriptgo pack resources/harbor_blocks --target hytale --out dist"],
          images: [SCENE.adapter()],
          link: { href: DOCS, label: "Hytale, in full" },
        },
        {
          id: "players",
          title: "Players get it when they join.",
          text: "The server sends the pack's assets to the players who join.",
          images: [SCENE.depot()],
        },
      ],
    }),
  ],
  more: [
    { href: "/docs/selling", label: "Selling" },
    { href: "/docs/selling-assets", label: "Selling assets" },
    { href: "/docs/licensing-api", label: "Licensing API" },
    { href: "/docs/cli", label: "The CLI" },
  ],
};
