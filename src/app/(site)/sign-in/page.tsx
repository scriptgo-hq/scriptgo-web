import type { Metadata } from "next";
import { AuthForm } from "@/components/site/auth-form";
import { AuthShell } from "@/components/site/auth-shell";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

type SP = Record<string, string | string[] | undefined>;

export default async function SignInPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : null;
  return (
    <AuthShell eyebrow="account" title="Sign in." intro="Your dashboard, licenses and packages.">
      <AuthForm mode="sign-in" next={next} githubEnabled={Boolean(process.env.GITHUB_CLIENT_ID)} />
    </AuthShell>
  );
}
