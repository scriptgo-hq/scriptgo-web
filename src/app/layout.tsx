import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/archivo/wdth-italic.css";
import "@fontsource-variable/hanken-grotesk/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SCRIPT//GO — Your scripts. Every environment.", template: "%s · SCRIPT//GO" },
  description:
    "Create, protect and sell game scripts that run across engines, games and multiplayer platforms. Compatibility is shown only when a real run passed.",
  applicationName: "SCRIPT//GO",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f1e5" },
    { media: "(prefers-color-scheme: dark)", color: "#191813" },
  ],
};

/** Applies the stored theme before first paint (no flash). "system" = no attribute. */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('sg-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

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
