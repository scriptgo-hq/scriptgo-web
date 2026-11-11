import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/site/auth-shell";
import { AddressProbe, CodeWatcher } from "@/components/site/player-match";
import { buttonClass } from "@/components/ui/button";
import { api } from "@/lib/api";
import { envName } from "@/lib/env";

/**
 * "Sign in with SCRIPT//GO" for another app (Tebex, for one). The API runs the OpenID provider on
 * /oidc/* (proxied by next.config.ts, so its cookies and the account session are both first-party
 * here); this page is its interaction step. Two ways to finish it, as the app allows:
 * - a SCRIPT//GO account: sign in, then agree to what the app receives;
 * - a player (ADR-0042 in scriptgo-api): the player connected from this browser's address, the one
 *   this browser confirmed before, or a code typed in game on a linked server.
 * Every form posts to the API through the same proxy (plain forms: they work without JS).
 */

export const metadata: Metadata = { title: "Sign in with SCRIPT//GO", robots: { index: false } };

interface Offer {
  id: string;
  via: "remembered" | "presence" | "history" | "code";
  name: string;
  server: string | null;
  environment: string;
}

interface Game {
  offer: Offer | null;
  code: { code: string; expiresAt: string } | null;
  probe: { url: string; token: string } | null;
  remembered: boolean;
  formToken: string;
  actionUrl: string;
  codeUrl: string;
}

interface Interaction {
  uid: string;
  prompt: string;
  client: { name: string };
  methods: ("account" | "game")[];
  scopes: ("openid" | "profile" | "email")[];
  remembered: string[];
  signedIn: { name: string; email: string; emailVerified: boolean } | null;
  formToken: string | null;
  confirmUrl: string;
  game: Game | null;
}

const link = "font-bold text-cobalt-ink underline";

export default async function OidcInteractionPage({ params, searchParams }: { params: Promise<{ uid: string }>; searchParams: Promise<{ with?: string }> }) {
  const { uid } = await params;
  const { with: chosen } = await searchParams;
  const r = await api<Interaction>(`/oidc/interaction/${encodeURIComponent(uid)}/details`, { auth: true });

  if (!r.ok) {
    const expired = r.kind === "http" && r.status === 404;
    return (
      <AuthShell eyebrow="sign in" title={expired ? "This link expired." : "Not available."} intro={expired ? "Go back to the shop and sign in again." : r.message}>
        <p className="text-[14px] text-ink-3">{r.kind === "http" ? r.code : "api_unreachable"}</p>
      </AuthShell>
    );
  }

  const d = r.data;
  const here = `/oidc/interaction/${encodeURIComponent(d.uid)}`;
  const accounts = d.methods.includes("account");
  const game = d.methods.includes("game") ? d.game : null;

  // Which way to show: the one asked for, else a player found for this browser, else the account
  // the visitor is signed in with, else the player's code (when the app takes players).
  const asPlayer = game !== null && (chosen === "game" || !accounts || (chosen !== "account" && (game.offer !== null || !d.signedIn)));
  if (asPlayer) return <PlayerView d={d} game={game} here={here} accounts={accounts} />;
  return <AccountView d={d} here={here} players={game !== null} />;
}

function AccountView({ d, here, players }: { d: Interaction; here: string; players: boolean }) {
  const next = encodeURIComponent(`${here}?with=account`);
  const asPlayer = players ? (
    <p className="text-[14px] text-ink-2">
      Buying for your player?{" "}
      <Link href={`${here}?with=game`} className={link}>
        Continue as a player
      </Link>
    </p>
  ) : null;

  if (!d.signedIn) {
    return (
      <AuthShell eyebrow="sign in" title={`Sign in to ${d.client.name}.`} intro="With your SCRIPT//GO account.">
        <div className="space-y-4">
          <Link href={`/sign-in?next=${next}`} className={buttonClass("primary", "lg", "w-full")}>
            Sign in
          </Link>
          <p className="text-[14px] text-ink-2">
            No account?{" "}
            <Link href={`/sign-up?next=${next}`} className={link}>
              Create one
            </Link>
          </p>
          {asPlayer}
          <form method="post" action={d.confirmUrl}>
            <button type="submit" name="decision" value="deny" className={`${link} text-[14px]`}>
              Cancel and go back
            </button>
          </form>
        </div>
      </AuthShell>
    );
  }

  const u = d.signedIn;
  const wantsEmail = d.scopes.includes("email");
  const wantsProfile = d.scopes.includes("profile");
  return (
    <AuthShell eyebrow="sign in" title={`Continue to ${d.client.name}?`} intro={`As ${u.name}.`}>
      <div className="space-y-5">
        <div>
          <p className="text-[14.5px] font-bold">{d.client.name} receives</p>
          <ul className="mt-2 space-y-1.5 text-[15px] text-ink-2">
            <li>An ID for your account. Not your password.</li>
            {wantsProfile ? <li>Your name: {u.name}</li> : null}
            {wantsEmail ? <li>{u.emailVerified ? `Your e-mail: ${u.email}` : "Not your e-mail: it is not confirmed yet."}</li> : null}
          </ul>
        </div>
        <form method="post" action={d.confirmUrl} className="space-y-3">
          <input type="hidden" name="formToken" value={d.formToken ?? ""} />
          <button type="submit" name="decision" value="allow" className={buttonClass("primary", "lg", "w-full")}>
            Continue
          </button>
          <button type="submit" name="decision" value="deny" className={buttonClass("secondary", "lg", "w-full")}>
            Cancel
          </button>
        </form>
        <p className="text-[14px] text-ink-2">
          Not you?{" "}
          <Link href={`/sign-in?next=${next}`} className={link}>
            Use another account
          </Link>
        </p>
        {asPlayer}
      </div>
    </AuthShell>
  );
}

function PlayerView({ d, game, here, accounts }: { d: Interaction; game: Game; here: string; accounts: boolean }) {
  const hidden = <input type="hidden" name="formToken" value={game.formToken} />;
  const probe = game.probe ? <AddressProbe url={game.probe.url} token={game.probe.token} /> : null;

  const footer = (
    <div className="space-y-2 text-[14px] text-ink-2">
      {game.remembered ? (
        <form method="post" action={game.actionUrl}>
          {hidden}
          <button type="submit" name="action" value="forget" className={link}>
            Forget this browser and my addresses
          </button>
        </form>
      ) : null}
      {accounts ? (
        <p>
          <Link href={`${here}?with=account`} className={link}>
            Use a SCRIPT//GO account instead
          </Link>
        </p>
      ) : null}
      <form method="post" action={game.actionUrl}>
        {hidden}
        <button type="submit" name="action" value="cancel" className={link}>
          Cancel and go back
        </button>
      </form>
    </div>
  );

  const o = game.offer;
  if (o) {
    const where = o.server ? `${o.server}, ${envName(o.environment)}` : envName(o.environment);
    const title = o.via === "presence" ? `You are ${o.name} on ${o.server ?? envName(o.environment)}?` : `Continue as ${o.name}?`;
    const intro =
      o.via === "presence"
        ? "Playing there right now, from this connection."
        : o.via === "code"
          ? `Linked in game on ${where}.`
          : o.via === "remembered"
            ? "This browser was used by this player before."
            : "Confirmed from this connection before.";
    return (
      <AuthShell eyebrow="sign in" title={title} intro={intro}>
        <div className="space-y-5">
          <div>
            <p className="text-[14.5px] font-bold">{d.client.name} receives</p>
            <ul className="mt-2 space-y-1.5 text-[15px] text-ink-2">
              <li>An ID for this player.</li>
              {d.scopes.includes("profile") ? <li>The player name: {o.name}</li> : null}
            </ul>
          </div>
          <form method="post" action={game.actionUrl} className="space-y-3">
            {hidden}
            <input type="hidden" name="offer" value={o.id} />
            <button type="submit" name="action" value="yes" className={buttonClass("primary", "lg", "w-full")}>
              Yes, that&apos;s me
            </button>
            <button type="submit" name="action" value="no" className={buttonClass("secondary", "lg", "w-full")}>
              Not me
            </button>
          </form>
          {footer}
          {probe}
        </div>
      </AuthShell>
    );
  }

  if (!game.code) {
    return (
      <AuthShell eyebrow="sign in" title="Too many codes." intro="Wait a few minutes, then reload this page.">
        {footer}
      </AuthShell>
    );
  }

  const formId = `player-${d.uid}`;
  return (
    <AuthShell eyebrow="sign in" title="Link your player." intro="In the game, type this in the chat.">
      <div className="space-y-5">
        <p className="sticker inline-block px-4 py-3 font-mono text-[28px] font-bold tracking-[0.12em]" aria-label={`/link ${game.code.code.split("").join(" ")}`}>
          /link {game.code.code}
        </p>
        <p className="text-[14px] text-ink-2">This page continues on its own. The code works for 10 minutes.</p>
        <form id={formId} method="post" action={game.actionUrl}>
          {hidden}
          <input type="hidden" name="offer" value="" />
          <input type="hidden" name="action" value="yes" />
        </form>
        <Link href={`${here}?with=game`} className={buttonClass("secondary", "lg", "w-full")}>
          I typed it
        </Link>
        {footer}
        <CodeWatcher codeUrl={game.codeUrl} formId={formId} />
        {probe}
      </div>
    </AuthShell>
  );
}
