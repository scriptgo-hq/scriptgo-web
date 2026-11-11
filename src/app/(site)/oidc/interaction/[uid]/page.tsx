import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/site/auth-shell";
import { buttonClass } from "@/components/ui/button";
import { api } from "@/lib/api";

/**
 * "Sign in with SCRIPT//GO" for another app (Tebex, for one). The API runs the OpenID provider on
 * /oidc/* (proxied by next.config.ts, so its cookies and the account session are both first-party
 * here); this page is its interaction step: sign in, then agree to what the app receives.
 * The consent form posts to the API through the same proxy (a plain form: it works without JS).
 */

export const metadata: Metadata = { title: "Sign in with SCRIPT//GO", robots: { index: false } };

interface Interaction {
  uid: string;
  prompt: string;
  client: { name: string };
  methods: string[];
  scopes: ("openid" | "profile" | "email")[];
  remembered: string[];
  signedIn: { name: string; email: string; emailVerified: boolean } | null;
  formToken: string | null;
  confirmUrl: string;
}

const link = "font-bold text-cobalt-ink underline";

export default async function OidcInteractionPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
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
  const next = encodeURIComponent(here);

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
      </div>
    </AuthShell>
  );
}
