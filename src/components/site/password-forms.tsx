"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { buttonClass } from "@/components/ui/button";

const input =
  "w-full rounded-[10px] border-2 border-line-soft bg-surface px-3 py-2.5 text-[15px] placeholder:text-ink-3 focus:border-line";

/** Passwords are 10 to 256 characters (the API's better-auth settings). */
export const MIN_PASSWORD = 10;

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-[10px] border-2 border-bad/50 bg-bad-soft px-3 py-2 text-[14px] font-semibold text-bad">
      {children}
    </p>
  );
}

export function ForgotPasswordForm() {
  const [state, setState] = useState<{ kind: "idle" | "sending" | "sent" } | { kind: "error"; message: string }>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setState({ kind: "sending" });
    try {
      const res = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
      if (res.error) setState({ kind: "error", message: res.error.message ?? `Request failed (HTTP ${res.error.status}).` });
      else setState({ kind: "sent" });
    } catch {
      setState({ kind: "error", message: "The SCRIPT//GO API is not reachable. Try again in a moment." });
    }
  }

  if (state.kind === "sent") {
    return (
      <div role="status" className="space-y-3 text-[15px] text-ink-2">
        <p className="font-bold text-ink">Check your inbox.</p>
        <p>
          If an account uses this address, a message with a reset link is on its way. The link works once, for one hour. Nothing
          arrives? Look in your spam folder, then ask again.
        </p>
        <p>
          <Link href="/sign-in" className="font-bold text-cobalt-ink underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {state.kind === "error" ? <Alert>{state.message}</Alert> : null}
      <div>
        <label htmlFor="email" className="block text-[14.5px] font-bold">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={`${input} mt-1.5`} />
      </div>
      <button type="submit" disabled={state.kind === "sending"} className={buttonClass("primary", "lg", "w-full")}>
        {state.kind === "sending" ? "Sending…" : "Send the reset link"}
      </button>
      <p className="text-[14px] text-ink-2">
        Remembered it?{" "}
        <Link href="/sign-in" className="font-bold text-cobalt-ink underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token, linkError }: { token: string | null; linkError: string | null }) {
  const [state, setState] = useState<{ kind: "idle" | "sending" | "done" } | { kind: "error"; message: string }>({ kind: "idle" });

  if (!token || linkError) {
    return (
      <div className="space-y-3 text-[15px] text-ink-2">
        <Alert>This reset link is invalid or has expired. Links work once, for one hour.</Alert>
        <p>
          <Link href="/forgot-password" className="font-bold text-cobalt-ink underline">
            Ask for a new link
          </Link>
        </p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newPassword = String(fd.get("password") ?? "");
    if (newPassword !== String(fd.get("confirm") ?? "")) {
      setState({ kind: "error", message: "The two passwords differ." });
      return;
    }
    setState({ kind: "sending" });
    try {
      const res = await authClient.resetPassword({ newPassword, token: token! });
      if (res.error?.code === "INVALID_TOKEN") setState({ kind: "error", message: "This link was already used or has expired. Ask for a new one from the sign-in page." });
      else if (res.error) setState({ kind: "error", message: res.error.message ?? `Request failed (HTTP ${res.error.status}).` });
      else setState({ kind: "done" });
    } catch {
      setState({ kind: "error", message: "The SCRIPT//GO API is not reachable. Try again in a moment." });
    }
  }

  if (state.kind === "done") {
    return (
      <div role="status" className="space-y-3 text-[15px] text-ink-2">
        <p className="font-bold text-ink">Password changed.</p>
        <p>Every session of this account was signed out. Sign in with the new password.</p>
        <Link href="/sign-in" className={buttonClass("primary", "lg", "w-full")}>
          Sign in
        </Link>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {state.kind === "error" ? <Alert>{state.message}</Alert> : null}
      <div>
        <label htmlFor="password" className="block text-[14.5px] font-bold">
          New password
        </label>
        <p id="password-hint" className="mt-1 text-[13px] text-ink-3">
          At least {MIN_PASSWORD} characters.
        </p>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={MIN_PASSWORD}
          maxLength={256}
          autoComplete="new-password"
          aria-describedby="password-hint"
          className={`${input} mt-1.5`}
        />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-[14.5px] font-bold">
          Repeat it
        </label>
        <input id="confirm" name="confirm" type="password" required minLength={MIN_PASSWORD} maxLength={256} autoComplete="new-password" className={`${input} mt-1.5`} />
      </div>
      <button type="submit" disabled={state.kind === "sending"} className={buttonClass("primary", "lg", "w-full")}>
        {state.kind === "sending" ? "Saving…" : "Set the new password"}
      </button>
    </form>
  );
}

/** Settings: ask for the verification message again (sent on sign-up when e-mail is on). */
export function VerifyEmailButton({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function send() {
    setState("sending");
    try {
      const res = await authClient.sendVerificationEmail({ email, callbackURL: "/dashboard/settings" });
      setState(res.error ? "error" : "sent");
    } catch {
      setState("error");
    }
  }
  if (state === "sent") return <span className="text-[13.5px] text-ink-2">Sent. The link works for 24 hours.</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button type="button" onClick={send} disabled={state === "sending"} className={buttonClass("secondary", "sm")}>
        {state === "sending" ? "Sending…" : "Send the confirmation e-mail"}
      </button>
      {state === "error" ? <span className="text-[13.5px] text-bad">Could not send it. Try again in a moment.</span> : null}
    </span>
  );
}
