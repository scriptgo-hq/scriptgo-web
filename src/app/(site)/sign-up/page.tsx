import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/site/auth-form";
import { AuthShell } from "@/components/site/auth-shell";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

type SP = Record<string, string | string[] | undefined>;

export default async function SignUpPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : null;
  return (
    <AuthShell eyebrow="account" title="Create account." intro="One account to install, license and publish. Creating a creator profile is a separate, later step.">
      <AuthForm mode="sign-up" next={next} githubEnabled={Boolean(process.env.GITHUB_CLIENT_ID)} />
      <p className="mt-5 text-[12.5px] text-ink-3">
        Read the <Link href="/legal#terms" className="underline">terms</Link> and the <Link href="/legal#privacy" className="underline">privacy policy</Link>.
      </p>
    </AuthShell>
  );
}
