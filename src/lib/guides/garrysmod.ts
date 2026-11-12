import { platformDocHref } from "@/lib/docs";
import {
  assetManifest,
  assetsTrack,
  fingerprintStep,
  noProtectOwnServerTrack,
  NOT_LIVE,
  publishAssetsStep,
  SCENE,
  scriptTrack,
  sellLikeAScriptStep,
  validateStep,
} from "./common";
import type { Guide } from "./shared";

/**
 * Selling on Garry's Mod. Sources, at the SDK tag in package.json: docs/site/platforms/garrysmod.md,
 * docs/site/selling-assets.md, docs/spec/assets.md (delivery table and notes), sdk/adapters/garrysmod.
 * The asset steps were checked with the CLI of that tag (validate and pack --target garrysmod).
 */

const DOCS = platformDocHref("garrysmod", true);

const LAYOUT = `gm_harbor/
  scriptgo.lua
  maps/gm_harbor.bsp
  materials/harbor/dock.vtf
  materials/harbor/dock.vmt`;

export const GARRYSMOD_GUIDE: Guide = {
  slug: "garrysmod",
  name: "Garry's Mod",
  title: "Sell on Garry's Mod,",
  titleEm: "step by step.",
  lede: "Two ways to earn: sell a script to server operators, or sell assets such as a map.",
  notLive: NOT_LIVE,
  tracks: [
    scriptTrack({
      slug: "garrysmod",
      name: "Garry's Mod",
      keyComment: 'on Garry\'s Mod: "license_key" in data/scriptgo/config.json',
      writeNotes: ["Server scripts run on Garry's Mod; client scripts do not run there yet."],
      test: {
        text: "`scriptgo test` runs your test scripts on Lua 5.4, 5.1 and LuaJIT. `verify` starts a Garry's Mod dedicated server from a folder you give it, with your resource, and reads its log.",
        commands: ["scriptgo test inventory_pro", "scriptgo verify inventory_pro --env garrysmod --gmod-server <server folder>"],
        notes: ["Give it a copy of a server folder, never a live server. The dedicated server is free on Steam."],
      },
      install: {
        text: "`pack` turns the package into an addon, with the SCRIPT//GO runtime addon next to it. They copy both into `garrysmod/addons/` and restart the map.",
        commands: ["scriptgo add kestrel//inventory-pro", "scriptgo pack resources/inventory_pro --target garrysmod --out dist"],
      },
      config: {
        text: "The key goes in the server's SCRIPT//GO settings, never in the addon. Licence checks call the SCRIPT//GO API over HTTPS.",
        filename: "garrysmod/data/scriptgo/config.json",
        code: `{
  "resources": {
    "inventory_pro": { "license_key": "<your licence key>" }
  }
}`,
      },
      docs: DOCS,
    }),
    assetsTrack({
      tag: "Track 2",
      lede: "Maps, models, materials and sounds, sold like a script. Example: Kestrel Works sells Harbor, a map.",
      before: ["You need a creator profile, an access token and the CLI, as in Track 1."],
      steps: [
        {
          id: "layout",
          title: "Lay out the content.",
          text: "The folders Garry's Mod already uses: the map in `maps/`, its materials, models and sounds next to it.",
          code: [{ lang: "bash", filename: "the package folder", code: LAYOUT }],
          images: [SCENE.workbench()],
          link: { href: "/docs/selling-assets#how-each-platform-delivers-them", label: "What each platform delivers" },
        },
        {
          id: "declare",
          title: "Declare it.",
          text: "`environment_asset` lists the content. A package can hold assets and scripts, or assets only.",
          code: [{ lang: "lua", filename: "gm_harbor/scriptgo.lua", code: assetManifest("gm_harbor", "Harbor", "garrysmod", 'environment_asset "garrysmod" { "maps/gm_harbor.bsp", "materials/harbor/*" }') }],
          images: [SCENE.signpost()],
          link: { href: "/docs/manifest", label: "The manifest" },
        },
        validateStep("gm_harbor", "Garry's Mod", ["Keep paths in lower case: Linux servers lower-case them."]),
        publishAssetsStep({ why: "Not encrypted: Garry's Mod clients do not load code a server sends, so nothing could decrypt it on their side." }),
        fingerprintStep("gm_harbor-1.0.0.zip", "Content files are the same in every copy: the record in the addon's `.scriptgo` folder names the buyer, as long as it is kept."),
        sellLikeAScriptStep("Garry's Mod", "sell-a-script"),
        {
          id: "buyer-install",
          who: "Then your buyer, on their Garry's Mod server",
          title: "The buyer installs the addon.",
          text: "`pack` writes an addon that adds every file to the download list. They copy it into `garrysmod/addons/` and start the server on the map.",
          commands: ["scriptgo add kestrel//gm-harbor", "scriptgo pack resources/gm_harbor --target garrysmod --out dist"],
          notes: ["By default, a file over 16 MB needs the server's FastDL."],
          images: [SCENE.adapter()],
          link: { href: DOCS, label: "Set up on Garry's Mod, in full" },
        },
        {
          id: "players",
          title: "Players download it when they join.",
          text: "Garry's Mod sends the map and its content to every player who joins.",
          notes: ["Tested on a Garry's Mod dedicated server: every packed file was added to the download list."],
          images: [SCENE.depot()],
        },
      ],
    }),
    noProtectOwnServerTrack({
      tag: "Track 3",
      name: "Garry's Mod",
      why: "Garry's Mod runs plain Lua: the server would have to write the decrypted scripts to disk to load them, and a licence check written in Lua can be deleted by whoever has the files. That does not stop a leaked folder.",
    }),
  ],
  more: [
    { href: "/docs/selling", label: "Selling" },
    { href: "/docs/selling-assets", label: "Selling assets" },
    { href: "/docs/licensing-api", label: "Licensing API" },
    { href: "/docs/cli", label: "The CLI" },
  ],
};
