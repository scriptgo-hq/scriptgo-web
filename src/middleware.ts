import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

/** Signed-out visitors to account areas go to sign-in first; the API still validates every session. */
export function middleware(req: NextRequest) {
  const hasSession = SESSION_COOKIES.some((n) => req.cookies.has(n));
  if (hasSession) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/sign-in";
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*", "/checkout/:path*"] };
