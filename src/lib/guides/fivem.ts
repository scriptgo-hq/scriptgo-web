import { platformDocHref } from "@/lib/docs";
import {
  assetManifest,
  assetsTrack,
  buyerLicenceStep,
  fingerprintStep,
  noProtectOwnServerTrack,
  NOT_LIVE,
  offerStep,
  publishAssetsStep,
  SCENE,
  startSteps,
  storeStep,
  validateStep,
} from "./common";
import type { Guide } from "./shared";

/**
 * Selling on FiveM: assets only. SCRIPT//GO's FiveM shim has no licence check, so `scriptgo pack
 * --target fivem` refuses a script that needs one; an asset-only package packs, its licence gating
 * the download. Sources, at the SDK tag in package.json: docs/site/platforms/fivem.md,
 * docs/site/selling-assets.md, docs/spec/assets.md, packages/cli/src/lib/fivem-pack.ts. The steps
 * were checked with the CLI of that tag (validate and pack --target fivem); no FXServer ran them.
 */

const DOCS = platformDocHref("fivem", true);

const LAYOUT = `harbor_pier/
  scriptgo.lua
  stream/harbor_pier.ymap          -- the map: where everything stands
  stream/harbor_pier.ytyp          -- the archetypes it places
  stream/harbor_pier_dock.ydr      -- a model
  stream/harbor_pier_dock.ytd      -- its textures`;

const MANIFEST = assetManifest(
  "harbor_pier",
  "Harbor Pier",
  "fivem",
  `environment_asset "fivem" { "stream/*" }
data_file "DLC_ITYP_REQUEST" "stream/harbor_pier.ytyp"
game_build "fivem" "3095"`,
);

export const FIVEM_GUIDE: Guide = {
  slug: "fivem",
  name: "FiveM",
  title: "Sell on FiveM,",
  titleEm: "step by step.",
  lede: "Sell assets such as a map to the people who run FiveM servers.",
  notLive: NOT_LIVE,
  tracks: [
    assetsTrack({
      tag: "Assets",
      lede: "Maps, interiors, vehicles and props, sold with a licence. Example: Kestrel Works sells Harbor Pier, a map.",
      before: [
        "Assets only: SCRIPT//GO has no licence check on FiveM, so a script that needs one cannot be packed for it. An asset package needs none: its licence gates the download.",
        "Packed and checked by the CLI, not yet run on a real FXServer.",
      ],
      steps: [
        ...startSteps("kestrel//harbor-pier"),
        {
          id: "layout",
          title: "Put the map files together.",
          text: "The files FiveM streams to players: the `.ymap`, the `.ytyp` it uses, the models and textures.",
          code: [{ lang: "bash", filename: "the package folder", code: LAYOUT }],
          images: [SCENE.workbench()],
          link: { href: "/docs/selling-assets#how-each-platform-delivers-them", label: "What each platform delivers" },
        },
        {
          id: "declare",
          title: "Declare it.",
          text: "`environment_asset` lists the streamed files, `data_file` tells the game to load the `.ytyp`, and `game_build` says which game build you made it for.",
          code: [{ lang: "lua", filename: "harbor_pier/scriptgo.lua", code: MANIFEST }],
          images: [SCENE.signpost()],
          link: { href: "/docs/manifest", label: "The manifest" },
        },
        validateStep("harbor_pier", "FiveM", [
          "A `.ymap` makes it a map: `pack` adds `this_is_a_map` for you.",
          "A file outside `stream/` must be named by a `data_file`, or it is refused: FiveM would ship it and never load it.",
        ]),
        publishAssetsStep({ why: "Not encrypted by SCRIPT//GO: the FiveM client is Cfx.re's, and a resource cannot run a decryptor in it. Cfx.re runs its own asset escrow." }),
        fingerprintStep("harbor_pier-1.0.0.zip", "Streamed files are the same in every copy: the record in the resource's `.scriptgo` folder names the buyer, as long as it is kept."),
        storeStep(),
        offerStep("FiveM"),
        buyerLicenceStep("FiveM", "Then your buyer, on their FiveM server"),
        {
          id: "buyer-install",
          title: "They install the resource.",
          text: "`pack` writes a FiveM resource with its `fxmanifest.lua`. They copy it into the server's resources and start it with `ensure harbor_pier`.",
          commands: ["scriptgo add kestrel//harbor-pier", "scriptgo pack resources/harbor_pier --target fivem --out dist"],
          images: [SCENE.adapter()],
          link: { href: DOCS, label: "FiveM, in full" },
        },
        {
          id: "players",
          title: "Players stream it in.",
          text: "FXServer streams the map to every player who joins.",
          notes: ["FiveM warns about streamed files over 16 MiB."],
          images: [SCENE.depot()],
        },
      ],
    }),
    noProtectOwnServerTrack({
      tag: "Scripts",
      name: "FiveM",
      why: "SCRIPT//GO has no loader and no licence check on FiveM, so an encrypted release cannot run there.",
    }),
  ],
  more: [
    { href: "/docs/selling-assets", label: "Selling assets" },
    { href: "/docs/selling", label: "Selling" },
    { href: "/docs/cli", label: "The CLI" },
  ],
};
