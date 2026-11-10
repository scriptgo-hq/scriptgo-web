# Working on scriptgo.dev

Read this before changing anything. It applies to people and coding agents alike. Machine-specific
notes (accounts, local folders, ports) are never committed: if a `CLAUDE.local.md` exists next to
this file, read it too.

## Repositories

| Repository | What it holds |
|---|---|
| `scriptgo-hq/scriptgo-web` (this one, public; proprietary licence) | The website: pages, dashboards, staff console. Deployed on Vercel |
| `scriptgo-hq/scriptgo-api` (private) | The API, the worker, the database. The website's only data source |
| `scriptgo-hq/scriptgo-sdk` (public, MIT) | The SDK, the API contract (`@scriptgo/shared`) and the documentation pages this site renders |
| `scriptgo-hq/.github` (public) | The organisation's profile page |

The documentation (`/docs/*`) is written in `scriptgo-sdk` (`docs/site`, `docs/spec`,
`docs/guides`), never here. A change to the API contract starts in `scriptgo-sdk`, is tagged, adopted
by `scriptgo-api`, then by this site (tag and dependency URL in `package.json`, together).

## Rules

**Owner's decisions**
- Never merge into `main`, push, open a pull request or deploy without the owner's go.
- Never create accounts, obtain keys, or accept licence agreements or terms on the owner's behalf.
- Never enable real checkout without the owner's go: the API decides it, the site only shows it.

**What gets committed**
- No secrets, `.env`, keys, tokens, absolute local paths, usernames or e-mail addresses.
- No build output (`.next/`, `out/`) and not `.sdk/` (downloaded at build time).
- Commits are made with the project's own Git identity, never a personal one.

**Git**
- Work on a branch. Never `git stash` bare.
- Never rewrite history that has been pushed.

**Copy and design**
- The Ink design: drawn panels, few words, one sentence where a paragraph would do.
- Never oversell protection: encryption at rest and in transit, keys never shipped, per-server
  binding, revocation, traceability. Never "unbreakable".
- Selling rules (ADR-0037, ADR-0038 in `scriptgo-api`): the seller decides, no review before sale,
  no environment gates a sale. A script *runs on* platforms, never "for" one; a platform's own rules
  are information for the operator (`src/lib/platform-rules.ts` is the one place that words them).

## Proving a change

```bash
corepack pnpm install
corepack pnpm run typecheck
API_URL=http://127.0.0.1:<api port> corepack pnpm run build
API_URL=http://127.0.0.1:<api port> corepack pnpm run start -- -p <port>
```

Against an API built from `scriptgo-api`'s `main`, on a throwaway database (its README says how);
never a developer's own API or database. Look at the pages you changed, in a browser, at desktop and
phone widths. The browser-driven journeys (sign-up, creator, grants, escrow, takedown) live in
`scriptgo-api/tools/*-ui.mjs` and take the website's URL.
