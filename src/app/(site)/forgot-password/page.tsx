import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/site/auth-shell";
import { ForgotPasswordForm } from "@/components/site/password-forms";
import { mailEnabled } from "@/lib/platform";

export const metadata: Metadata = { title: "Forgot your password", robots: { index: false } };

export default async function ForgotPasswordPage() {
  const mail = await mailEnabled();
  return (
    <AuthShell eyebrow="account" title="Forgot your password?" intro="We send a link to the address of your account. It works once, for one hour.">
      {mail ? (
        <ForgotPasswordForm />
      ) : (
        <div className="space-y-3 text-[15px] text-ink-2">
          <p>This SCRIPT//GO server does not send e-mail, so a password cannot be reset by link here.</p>
          <p>If you signed up with GitHub, sign in with GitHub. Otherwise the operator of this server can help.</p>
          <p>
            <Link href="/sign-in" className="font-bold text-cobalt-ink underline">
              Back to sign in
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  );
}
