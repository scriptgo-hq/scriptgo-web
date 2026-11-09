import type { Metadata } from "next";
import { AuthShell } from "@/components/site/auth-shell";
import { ResetPasswordForm } from "@/components/site/password-forms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false }, referrer: "no-referrer" };

type SP = Record<string, string | string[] | undefined>;

// The e-mailed link goes through /api/auth/reset-password/<token>, which lands here with
// ?token=… when the token is valid and ?error=INVALID_TOKEN when it is not.
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" && sp.token.length <= 200 ? sp.token : null;
  const error = typeof sp.error === "string" ? sp.error : null;
  return (
    <AuthShell eyebrow="account" title="Choose a new password." intro="Every session of the account is signed out once it is saved.">
      <ResetPasswordForm token={token} linkError={error} />
    </AuthShell>
  );
}
