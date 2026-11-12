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
 * Selling on BeamMP. Sources, at the SDK tag in package.json: docs/site/platforms/beammp.md,
 * docs/site/selling-assets.md, docs/spec/assets.md, sdk/adapters/beammp (README, SETUP). The asset
 * steps were checked with the CLI of that tag (validate and pack --target beammp); no BeamMP server
 * ran them (BeamMP-Server needs an AuthKey).
 */

const DOCS = platformDocHref("beammp", true);
const NOT_RUN = "Not run on a real BeamMP server yet: BeamMP-Server starts only with an AuthKey its owner requests.";

const LAYOUT = `harbor_track/
  scriptgo.lua
  dist/harbor_track.zip                    -- the BeamNG mod
    levels/harbor_track/info.json
    levels/harbor_track/main.level.json
    levels/harbor_track/art/...`;

export const BEAMMP_GUIDE: Guide = {
  slug: "beammp",
  name: "BeamMP",
  title: "Sell on BeamMP,",
  titleEm: "step by step.",
  lede: "Two ways to earn: sell a script to server operators, or sell assets such as a map.",
  notLive: NOT_LIVE,
  tracks: [
    scriptTrack({
      slug: "beammp",
      name: "BeamMP",
      keyComment: 'on BeamMP: "license_key" in scriptgo.json',
      before: [NOT_RUN],
      writeNotes: ["Server scripts run in the BeamMP server plugin; BeamNG client mods are not a script target."],
      test: {
        text: "`scriptgo test` runs your test scripts on Lua 5.4, 5.1 and LuaJIT.",
        commands: ["scriptgo test inventory_pro"],
        notes: ["A `verify` run on BeamMP needs a server with its AuthKey: none has run yet."],
      },
      install: {
        text: "`pack` builds the SCRIPT//GO server plugin with the resource in it. They copy `dist/beammp/Resources` over the server's folder.",
        commands: ["scriptgo add kestrel//inventory-pro", "scriptgo pack resources/inventory_pro --target beammp --out dist"],
      },
      config: {
        text: "Licence checks need `curl` on the server's PATH and the API host allowed. The key goes in the plugin's settings, never in the package folder.",
        filename: "Resources/Server/scriptgo/scriptgo.json",
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
      lede: "Maps, vehicles and props as BeamNG mods, sold like a script. Example: Kestrel Works sells Harbor Track, a map.",
      before: ["You need a creator profile, an access token and the CLI, as in Track 1.", NOT_RUN],
      steps: [
        {
          id: "package",
          title: "Zip the mod as BeamNG loads it.",
          text: "One `.zip` per mod, with BeamNG's own layout: a map's level under `levels/<name>/`.",
          code: [{ lang: "bash", filename: "the package folder", code: LAYOUT }],
          images: [SCENE.workbench()],
          link: { href: "/docs/selling-assets#how-each-platform-delivers-them", label: "What each platform delivers" },
        },
        {
          id: "declare",
          title: "Declare it.",
          text: "`environment_asset` names the mod zip. A package can hold assets and scripts, or assets only.",
          code: [{ lang: "lua", filename: "harbor_track/scriptgo.lua", code: assetManifest("harbor_track", "Harbor Track", "beammp", 'environment_asset "beammp" "dist/harbor_track.zip"') }],
          images: [SCENE.signpost()],
          link: { href: "/docs/manifest", label: "The manifest" },
        },
        validateStep("harbor_track", "BeamMP", ["A mod with Lua inside is refused: an asset package carries data only."]),
        publishAssetsStep({ why: "Not encrypted: BeamNG mounts mod zips from disk, and a server package cannot run a decryptor in every player's game." }),
        fingerprintStep("harbor_track-1.0.0.zip", "The record sits inside the mod zip: installed as is, it stays; repacking the zip removes it."),
        sellLikeAScriptStep("BeamMP", "sell-a-script"),
        {
          id: "buyer-install",
          who: "Then your buyer, on their BeamMP server",
          title: "The buyer installs the mod.",
          text: "`pack` puts the mod zip in `Resources/Client/`. They copy the `Resources` folder over the server's.",
          commands: ["scriptgo add kestrel//harbor-track", "scriptgo pack resources/harbor_track --target beammp --out dist"],
          images: [SCENE.adapter()],
          link: { href: DOCS, label: "BeamMP, in full" },
        },
        {
          id: "players",
          title: "Players download it when they join.",
          text: "BeamMP sends every mod in `Resources/Client/` to each player who joins.",
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
