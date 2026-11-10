import { OPEN77_GUIDE } from "./open77";
import type { Guide } from "./shared";

export * from "./shared";

/**
 * Step-by-step guides for selling on one environment, at /environments/<slug>/guide. The words live
 * here, one file per environment, and come from the SDK docs at the pinned tag and from the dashboard
 * routes of this site; the page only lays them out. An environment without an entry has no guide
 * (the route answers 404 and the environment page shows no link).
 */

const GUIDES: Record<string, Guide> = {
  [OPEN77_GUIDE.slug]: OPEN77_GUIDE,
};

export function guideFor(slug: string): Guide | null {
  return GUIDES[slug] ?? null;
}

export function guideHref(slug: string): string | null {
  return GUIDES[slug] ? `/environments/${encodeURIComponent(slug)}/guide` : null;
}
