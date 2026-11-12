import { BEAMMP_GUIDE } from "./beammp";
import { FIVEM_GUIDE } from "./fivem";
import { GARRYSMOD_GUIDE } from "./garrysmod";
import { HYTALE_GUIDE } from "./hytale";
import { LUANTI_GUIDE } from "./luanti";
import { OPEN77_GUIDE } from "./open77";
import { RUST_GUIDE } from "./rust";
import type { Guide } from "./shared";

export * from "./shared";

/**
 * Step-by-step guides for selling on one environment, at /environments/<slug>/guide. The words live
 * here, one file per environment, and come from the SDK docs at the pinned tag and from the dashboard
 * routes of this site; the page only lays them out. An environment without an entry has no guide
 * (the route answers 404 and the environment page shows no link).
 */

const GUIDES: Record<string, Guide> = Object.fromEntries(
  [OPEN77_GUIDE, GARRYSMOD_GUIDE, LUANTI_GUIDE, FIVEM_GUIDE, BEAMMP_GUIDE, RUST_GUIDE, HYTALE_GUIDE].map((g) => [g.slug, g]),
);

export function guideFor(slug: string): Guide | null {
  return GUIDES[slug] ?? null;
}

export function guideHref(slug: string): string | null {
  return GUIDES[slug] ? `/environments/${encodeURIComponent(slug)}/guide` : null;
}
