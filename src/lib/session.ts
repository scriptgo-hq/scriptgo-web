import { cache } from "react";
import { cookies } from "next/headers";
import { api, type ApiResult } from "./api";
import type { Me } from "./contract";

export const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

/** Cheap check for the header: a session cookie exists (validity is checked by the API). */
export async function hasSessionCookie(): Promise<boolean> {
  const jar = await cookies();
  return SESSION_COOKIES.some((n) => jar.has(n));
}

/** The signed-in account, or the API failure (401 when signed out). */
export const getMe = cache(async (): Promise<ApiResult<Me>> => api<Me>("/v1/me", { auth: true }));

export function isStaff(me: Me): boolean {
  return me.roles.includes("admin") || me.roles.includes("moderator");
}
