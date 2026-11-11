/**
 * The visitor's address, signed for the API (ADR-0042 in scriptgo-api).
 *
 * Browsers reach the API through this website, so the API sees the website's addresses. The website
 * tells it the visitor's address in one header the API trusts only when signed with the secret both
 * share (SITE_FORWARD_SECRET):
 *
 *   x-sg-client: v1;ip=<address>;t=<unix seconds>;sig=<base64url HMAC-SHA256>
 *
 * signed over "v1\n<address>\n<t>\n<METHOD>\n<path>". The signature binds the request's method and
 * path and is fresh for two minutes, so a header seen once cannot be reused elsewhere. Any
 * x-sg-client a browser sends is dropped before ours is set (src/middleware.ts).
 *
 * The visitor's address comes from the hosting platform: on Vercel, x-forwarded-for, which Vercel
 * overwrites with the address it saw (a browser cannot choose it). SITE_CLIENT_IP_HEADER names
 * another header for another host. Web Crypto only, so this runs in middleware and in server code.
 */

export const SITE_FORWARD_HEADER = "x-sg-client";

const IP_CHARS = /^[0-9A-Fa-f:.]{2,45}$/;

/** The visitor's address as the hosting platform reports it, or null. */
export function visitorAddress(headers: Headers): string | null {
  const name = (process.env.SITE_CLIENT_IP_HEADER || "x-forwarded-for").toLowerCase();
  const raw = headers.get(name)?.split(",")[0]?.trim() ?? "";
  return IP_CHARS.test(raw) ? raw : null;
}

const encoder = new TextEncoder();

function base64url(bytes: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** The header value for a request to the API, or null when the secret or the address is missing. */
export async function signSiteForward(ip: string | null, method: string, path: string, secret = process.env.SITE_FORWARD_SECRET ?? ""): Promise<string | null> {
  if (!secret || !ip) return null;
  const t = Math.floor(Date.now() / 1000);
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(`v1\n${ip}\n${t}\n${method.toUpperCase()}\n${path}`));
  return `v1;ip=${ip};t=${t};sig=${base64url(sig)}`;
}
