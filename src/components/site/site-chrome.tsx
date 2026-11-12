/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { BRAND } from "@/components/ui/typography";
import { SDK_LICENSE, SDK_REPO } from "@/lib/repo";
import { hasSessionCookie } from "@/lib/session";
import { SCENES } from "./ink";
import { TopBar } from "./nav";
import { ThemeToggle } from "./theme-toggle";

export async function SiteHeader() {
  const signedIn = await hasSessionCookie();
  return <TopBar signedIn={signedIn} />;
}

/** The closing band (the traveller above the ranges), then the footer with the operator disclosure. */
export function SiteFooter({ band = true }: { band?: boolean }) {
  return (
    <footer className="mt-auto">
      {band ? (
        <section className="closing" aria-labelledby="closing-title">
          <img className="closing-bg closing-bg-traveller" src={SCENES.band.src} width={SCENES.band.width} height={SCENES.band.height} alt="" loading="lazy" decoding="async" />
          <img className="closing-bg closing-bg-ranges" src={SCENES.ranges.src} width={SCENES.ranges.width} height={SCENES.ranges.height} alt="" loading="lazy" decoding="async" />
          <div className="container-page closing-in">
            <h2 id="closing-title" className="display">
              One script.
              <br />
              <em>Every world.</em>
            </h2>
            <div className="cta-row">
              <ButtonLink href="/sign-up" variant="sun" size="lg">
                Create your account
              </ButtonLink>
              <ButtonLink href="/docs/sdk" variant="secondary" size="lg">
                Read the SDK docs
              </ButtonLink>
            </div>
          </div>
        </section>
      ) : null}
      {/* Always ink, in both themes. */}
      <div className="site-foot">
        <div className="container-page">
          <div className="foot-grid">
            <div>
              <img className="foot-logo" src={BRAND.word.src} width={BRAND.word.width} height={BRAND.word.height} alt="SCRIPT//GO" loading="lazy" decoding="async" />
              <p className="mt-[18px] max-w-[34ch] opacity-80">The scripting sandbox for the games you run. Build once, protect your work, monetize it.</p>
              <p className="mt-3 max-w-[34ch] text-[14px] opacity-80">
                The SDK is open source,{" "}
                <a href={SDK_LICENSE} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-100">
                  MIT
                </a>
                .
              </p>
            </div>
            <FooterCol
              title="SDK"
              links={[
                ["/sdk", "The SDK"],
                ["/docs", "Docs"],
                ["/environments", "Platforms"],
                ["/docs/create-adapter", "Write an adapter"],
                [SDK_REPO, "Source on GitHub"],
                ["/status", "Status"],
              ]}
            />
            <FooterCol
              title="Monetize"
              links={[
                ["/developers", "Sell from your own store"],
                ["/protect", "Protect your work"],
                ["/docs/licensing-api", "Licensing API"],
                ["/explore", "Scripts directory"],
                ["/dashboard", "Dashboard"],
              ]}
            />
            <FooterCol
              title="Trust"
              links={[
                ["/legal", "Legal"],
                ["/legal#ip-policy", "IP policy"],
                ["/legal#protection", "Code protection terms"],
                ["/legal#privacy", "Privacy"],
                ["/report", "Report a package"],
              ]}
            />
          </div>
          <div className="foot-fine">
            <span className="max-w-[78ch]">
              Game, engine and provider names are trademarks of their owners; no endorsement is implied.
            </span>
            <ThemeToggle label />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h2 className="label !text-[#ffc83d]">{title}</h2>
      <ul>
        {links.map(([href, label]) => (
          <li key={href}>
            {/* Account pages redirect a signed-out visitor: never prefetch them, or the redirect is what the router remembers after sign-in. */}
            {/^https?:/.test(href) ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            ) : (
              <Link href={href} prefetch={href.startsWith("/dashboard") ? false : undefined}>
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
