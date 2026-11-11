"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient, safeNext } from "@/lib/auth-client";
import { buttonClass } from "@/components/ui/button";
import { MIN_PASSWORD } from "@/components/site/password-forms";

const input =
  "w-full rounded-[10px] border-2 border-line-soft bg-surface px-3 py-2.5 text-[15px] placeholder:text-ink-3 focus:border-line";

export function AuthForm({
  mode,
  next,
  githubEnabled,
  canResetPassword = false,
}: {
  mode: "sign-in" | "sign-up";
  next: string | null;
  githubEnabled: boolean;
  /** The server delivers e-mail, so "forgot your password?" can work. */
  canResetPassword?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dest = safeNext(next);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    setBusy(true);
    setError(null);
    try {
      const res =
        mode === "sign-in"
          ? await authClient.signIn.email({ email, password })
          : // callbackURL: where the e-mailed confirmation link lands (when the server sends e-mail).
            await authClient.signUp.email({ email, password, name: String(fd.get("name") ?? "").trim() || email.split("@")[0]!, callbackURL: dest });
      if (res.error) {
        setError(res.error.message ?? (res.error.status ? `Request failed (HTTP ${res.error.status}).` : "Request failed."));
        setBusy(false);
        return;
      }
      router.replace(dest);
      router.refresh();
    } catch {
      setError("The SCRIPT//GO API is not reachable. Try again in a moment.");
      setBusy(false);
    }
  }

  async function github() {
    setError(null);
    try {
      const res = await authClient.signIn.social({ provider: "github", callbackURL: dest });
      if (res.error) setError(res.error.message ?? "GitHub sign-in failed.");
    } catch {
      setError("The SCRIPT//GO API is not reachable. Try again in a moment.");
    }
  }

  return (
    <div className="space-y-5">
      {error ? (
        <p role="alert" className="border-[2.5px] border-bad bg-bad-soft px-3 py-2 text-[14px] font-semibold text-ink">
          {error}
        </p>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "sign-up" ? (
          <div>
            <label htmlFor="name" className="block text-[14.5px] font-bold">
              Display name
            </label>
            <input id="name" name="name" autoComplete="name" maxLength={80} className={`${input} mt-1.5`} />
          </div>
        ) : null}
        <div>
          <label htmlFor="email" className="block text-[14.5px] font-bold">
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={`${input} mt-1.5`} />
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="password" className="block text-[14.5px] font-bold">
              Password
            </label>
            {mode === "sign-in" && canResetPassword ? (
              <Link href="/forgot-password" className="text-[13.5px] font-semibold text-cobalt-ink underline">
                Forgot your password?
              </Link>
            ) : null}
          </div>
          {mode === "sign-up" ? (
            <p id="password-hint" className="mt-1 text-[13px] text-ink-3">
              At least {MIN_PASSWORD} characters.
            </p>
          ) : null}
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={mode === "sign-up" ? MIN_PASSWORD : undefined}
            maxLength={256}
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            aria-describedby={mode === "sign-up" ? "password-hint" : undefined}
            className={`${input} mt-1.5`}
          />
        </div>
        <button type="submit" disabled={busy} className={buttonClass("primary", "lg", "w-full")}>
          {busy ? (mode === "sign-in" ? "Signing in…" : "Creating account…") : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </form>
      {/* GitHub sign-in only where the server has it configured: no disabled button and no excuse otherwise. */}
      {githubEnabled ? (
        <>
          <div className="flex items-center gap-3 text-[12.5px] text-ink-3">
            <span className="h-px flex-1 bg-line-soft" /> or <span className="h-px flex-1 bg-line-soft" />
          </div>
          <button type="button" onClick={github} className={buttonClass("secondary", "lg", "w-full")}>
            Continue with GitHub
          </button>
        </>
      ) : null}
      <p className="text-[14px] text-ink-2">
        {mode === "sign-in" ? (
          <>
            New here?{" "}
            <Link href={`/sign-up${next ? `?next=${encodeURIComponent(dest)}` : ""}`} className="font-bold text-cobalt-ink underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={`/sign-in${next ? `?next=${encodeURIComponent(dest)}` : ""}`} className="font-bold text-cobalt-ink underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
