"use client";

import { createAuthClient } from "better-auth/react";

/**
 * better-auth client. In the browser it talks to same-origin /api/auth/*, which Next rewrites to
 * the API, so the session cookie is first-party.
 */
export const authClient = createAuthClient();

/** Only same-site relative paths are accepted as post-sign-in destinations. */
export function safeNext(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
