import type { NextConfig } from "next";

const API_URL = (process.env.API_URL ?? "http://localhost:4100").replace(/\/+$/, "");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // With a middleware in the app, Next keeps only the first 10 MB of any request body, the /v1
    // rewrite included: an upload past that reached the API cut off. Releases with assets are larger
    // (the API sets their cap; Cloudflare's free plan stops at 100 MB in front of it).
    middlewareClientMaxBodySize: "100mb",
  },
  // The browser talks to the API through the web origin so better-auth cookies stay first-party.
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        { source: "/v1/:path*", destination: `${API_URL}/v1/:path*` },
        { source: "/api/auth/:path*", destination: `${API_URL}/api/auth/:path*` },
      ],
      // The OpenID provider ("Sign in with SCRIPT//GO", issuer https://scriptgo.dev/oidc). A fallback
      // rewrite, so the interaction page /oidc/interaction/[uid] (a dynamic route here) wins over it.
      fallback: [{ source: "/oidc/:path*", destination: `${API_URL}/oidc/:path*` }],
    };
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default config;
