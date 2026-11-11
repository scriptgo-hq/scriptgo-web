<p align="center"><img src="docs/readme/banner.png" alt="SCRIPT//GO" width="100%"></p>

# scriptgo.dev

The SCRIPT//GO website: the marketplace, the creator and buyer dashboards, the staff console and the
documentation. Next.js 15, React 19, Tailwind 4, in the Ink design.

The website holds no data of its own. Everything comes from the SCRIPT//GO API (`scriptgo-api`):
the browser calls `/v1/*` and `/api/auth/*` on the website's own origin, and Next.js forwards them
to the API, so sign-in cookies stay first-party.

```text
browser ─► scriptgo.dev (this repository) ─► api.scriptgo.dev (scriptgo-api)
                │
                └─ built with the docs/ of scriptgo-sdk at the pinned tag
```

## Run it

Requirements: Node 22+, Corepack (pnpm), and a SCRIPT//GO API to talk to (see `scriptgo-api`).

```bash
corepack pnpm install
cp .env.example .env.local        # API_URL: the API this site proxies to
corepack pnpm run dev             # http://localhost:3100
corepack pnpm run typecheck
corepack pnpm run build && corepack pnpm run start
```

`API_URL` is read when the site is built (the proxy rules) and when it runs (server-side fetches):
set it for both.

## The SDK it uses

[`scriptgo-sdk`](https://github.com/scriptgo-hq/scriptgo-sdk) (public, MIT), at one tag, pinned in
`package.json`:

- `"scriptgo": { "sdk": "v0.1.4" }`: `scripts/fetch-sdk.mjs` downloads that tag's `docs/` into
  `.sdk/` before `dev` and `build`. The documentation pages (`/docs/*`) are rendered from it, and
  each page links to its source. To preview a documentation change, point `SCRIPTGO_SDK_DIR` at a
  local checkout of the SDK.
- `@scriptgo/shared`, the API contract, comes from the same tag: the release tarball for now, npm
  once the `@scriptgo` scope is published. The script refuses a dependency from another tag.

To move to a new SDK release: change the tag and the dependency URL together, `pnpm install`, build.

## Deploying on Vercel

| Setting | Value |
|---|---|
| Framework | Next.js (detected) |
| Root directory | the repository root |
| Install / build commands | the defaults (`pnpm install`, `pnpm run build`) |
| Node.js | 22 or later |
| Environment variables | `API_URL=https://api.scriptgo.dev` (Production and Preview), `ENABLE_EXPERIMENTAL_COREPACK=1` (so Vercel uses the pnpm version in `packageManager`) |
| Domain | `scriptgo.dev`, and `www.scriptgo.dev` redirecting to it. In Cloudflare: DNS only (grey cloud) for both |

Every browser call to `/v1/*` goes browser → Vercel → API. The website sends only small forms that
way: release files are uploaded by the CLI, straight to `api.scriptgo.dev`. Vercel documents a
4.5 MB request body limit for functions and says nothing clear about external rewrites: before
adding a file upload to the website, send it to the API directly or measure the limit first.

The website can also run as a container next to the API (`next start`, port 3100); `scriptgo-api`'s
production stack did that before the move to Vercel.

## Licence

Proprietary, all rights reserved ([`LICENSE`](LICENSE)). The documentation it renders is the SDK's,
under MIT.
