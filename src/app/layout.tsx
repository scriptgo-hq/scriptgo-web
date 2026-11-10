import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/archivo/wdth-italic.css";
import "@fontsource-variable/hanken-grotesk/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "./globals.css";

const DESCRIPTION =
  "A scripting sandbox you plug into a game engine, a mod platform or a multiplayer server. Build on top of it, protect what you wrote, and sell it from your own Tebex store. Compatibility is shown only when a real run passed.";

/** Link previews (Discord, X, Slack) take the image from opengraph-image.jpg / twitter-image.jpg next to this file; they need absolute URLs, hence metadataBase. */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://scriptgo.dev"),
  title: { default: "SCRIPT//GO — Scripts for every world you run.", template: "%s · SCRIPT//GO" },
  description: DESCRIPTION,
  applicationName: "SCRIPT//GO",
  // No title or description here: previews then fall back to each page's own <title> and description.
  openGraph: { type: "website", siteName: "SCRIPT//GO" },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.png", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#f3ecdc",
};

/** Applies the stored night theme before first paint (no flash). Paper is the default; the OS setting is not followed. */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('sg-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
