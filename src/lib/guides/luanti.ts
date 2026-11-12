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
 * Selling on Luanti. Sources, at the SDK tag in package.json: docs/site/platforms/luanti.md,
 * docs/site/selling-assets.md, docs/spec/assets.md (delivery table and notes), sdk/adapters/luanti.
 * The asset steps were checked with the CLI of that tag (validate and pack --target luanti).
 */

const DOCS = platformDocHref("luanti", true);

const LAYOUT = `harbor_media/
  scriptgo.lua
  textures/harbor_media_dock.png
  textures/harbor_media_rope.png
  sounds/harbor_media_gulls.ogg`;

export const LUANTI_GUIDE: Guide = {
  slug: "luanti",
  name: "Luanti",
  title: "Sell on Luanti,",
  titleEm: "step by step.",
  lede: "Two ways to earn: sell a script to server operators, or sell media such as textures and sounds.",
  notLive: NOT_LIVE,
  tracks: [
    scriptTrack({
      slug: "luanti",
      name: "Luanti",
      keyComment: 'on Luanti: "license_key" in <world>/scriptgo.json',
      writeNotes: ["Luanti mods run on the server only: so do SCRIPT//GO scripts there."],
      test: {
        text: "`scriptgo test` runs your test scripts on Lua 5.4, 5.1 and LuaJIT. `verify` runs the official Luanti server image in Docker with your resource and reads its log.",
        commands: ["scriptgo test inventory_pro", "scriptgo verify inventory_pro --env luanti"],
      },
      install: {
        text: "`pack` builds the SCRIPT//GO mod with the resource in it. They copy it into the server's `mods/` folder and enable it for the world.",
        commands: ["scriptgo add kestrel//inventory-pro", "scriptgo pack resources/inventory_pro --target luanti --out dist"],
        notes: ["Enable it with `load_mod_scriptgo = true` in the world's `world.mt`."],
      },
      config: {
        text: "Licence checks need HTTP: the server owner lists the `scriptgo` mod in `secure.http_mods`. The key goes in the world's SCRIPT//GO settings.",
        filename: "<world>/scriptgo.json",
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
      lede: "Textures, sounds, models and translations, sold like a script. Example: Kestrel Works sells Harbor Media.",
      before: [
        "You need a creator profile, an access token and the CLI, as in Track 1.",
        "On Luanti the world belongs to the server: what players download is media.",
      ],
      steps: [
        {
          id: "layout",
          title: "Lay out the media.",
          text: "The folders a Luanti mod uses: `textures/`, `sounds/`, `models/`, `locale/`. Start every file name with your resource's name.",
          code: [{ lang: "bash", filename: "the package folder", code: LAYOUT }],
          notes: ["Media names are shared by every mod on a server: the prefix keeps yours apart."],
          images: [SCENE.workbench()],
          link: { href: "/docs/selling-assets#how-each-platform-delivers-them", label: "What each platform delivers" },
        },
        {
          id: "declare",
          title: "Declare it.",
          text: "`assets` lists the media. A package can hold assets and scripts, or assets only.",
          code: [{ lang: "lua", filename: "harbor_media/scriptgo.lua", code: assetManifest("harbor_media", "Harbor Media", "luanti", 'assets { "textures/*.png", "sounds/*.ogg" }') }],
          images: [SCENE.signpost()],
          link: { href: "/docs/manifest", label: "The manifest" },
        },
        validateStep("harbor_media", "Luanti", ["Luanti handles media files of about 16 MB at most."]),
        publishAssetsStep({ why: "Not encrypted: the Luanti client hashes and caches media itself, and nothing could decrypt it there without changing the engine." }),
        fingerprintStep("harbor_media-1.0.0.zip", "Media files are the same in every copy: the record in the mod's `.scriptgo` folder names the buyer, as long as it is kept."),
        sellLikeAScriptStep("Luanti", "sell-a-script"),
        {
          id: "buyer-install",
          who: "Then your buyer, on their Luanti server",
          title: "The buyer installs the media mod.",
          text: "`pack` writes a media mod. They copy it into the server's `mods/` folder and enable it for the world.",
          commands: ["scriptgo add kestrel//harbor-media", "scriptgo pack resources/harbor_media --target luanti --out dist"],
          notes: ["Enable it with `load_mod_sgmedia_harbor_media = true` in the world's `world.mt`."],
          images: [SCENE.adapter()],
          link: { href: DOCS, label: "Set up on Luanti, in full" },
        },
        {
          id: "players",
          title: "Players download it when they join.",
          text: "The server sends the media to every player who joins, and their game caches it.",
          notes: ["Tested on a Luanti 5.18 server: every packed file was announced to players."],
          images: [SCENE.depot()],
        },
      ],
    }),
    noProtectOwnServerTrack({
      tag: "Track 3",
      name: "Luanti",
      why: "Luanti runs plain Lua: the server would have to write the decrypted scripts to disk to load them, and a licence check written in Lua can be deleted by whoever has the files. That does not stop a leaked folder.",
    }),
  ],
  more: [
    { href: "/docs/selling", label: "Selling" },
    { href: "/docs/selling-assets", label: "Selling assets" },
    { href: "/docs/licensing-api", label: "Licensing API" },
    { href: "/docs/cli", label: "The CLI" },
  ],
};
