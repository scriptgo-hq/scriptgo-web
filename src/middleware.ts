import { NextResponse, type NextRequest } from "next/server";
import { SITE_FORWARD_HEADER, signSiteForward, visitorAddress } from "@/lib/site-forward";

const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"];
const ACCOUNT_AREAS = ["/dashboard", "/admin", "/checkout"];
const PROXIED = ["/v1/", "/api/auth/", "/oidc/"];

const under = (path: string, prefixes: string[]) => prefixes.some((p) => path === p.replace(/\/$/, "") || path.startsWith(p.endsWith("/") ? p : `${p}/`));

/**
 * Two jobs:
 * - signed-out visitors to account areas go to sign-in first (the API still validates every session);
 * - requests proxied to the API (next.config.ts rewrites) carry the visitor's address, signed
 *   (src/lib/site-forward.ts). A header of that name sent by the browser is always dropped.
 */
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (under(path, PROXIED)) {
    const headers = new Headers(req.headers);
    headers.delete(SITE_FORWARD_HEADER);
    const signed = await signSiteForward(visitorAddress(req.headers), req.method, path);
    if (signed) headers.set(SITE_FORWARD_HEADER, signed);
    return NextResponse.next({ request: { headers } });
  }
  if (!under(path, ACCOUNT_AREAS)) return NextResponse.next();
  const hasSession = SESSION_COOKIES.some((n) => req.cookies.has(n));
  if (hasSession) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/sign-in";
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/checkout/:path*", "/v1/:path*", "/api/auth/:path*", "/oidc/:path*"],
};
