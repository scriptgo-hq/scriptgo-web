import Link from "next/link";
import { HikerRidgeArt } from "@/components/illustrations";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { Wordmark } from "@/components/ui/typography";
import { hasSessionCookie } from "@/lib/session";
import { MobileMenu, NavLinks, SearchBox } from "./nav";
import { ThemeToggle } from "./theme-toggle";

export async function SiteHeader() {
  const signedIn = await hasSessionCookie();
  return (
    <header className="sticky top-0 z-40 border-b-2 border-line-soft bg-paper/95 backdrop-blur-[2px]">
      <nav aria-label="Main" className="container-page relative flex h-16 items-center gap-3">
        <Link href="/" className="mr-2 shrink-0 rounded-md" aria-label="SCRIPT//GO home">
          <Wordmark />
        </Link>
        <NavLinks />
        <div className="ml-auto hidden w-56 xl:block">
          <SearchBox />
        </div>
        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <ThemeToggle />
          <div className="hidden items-center gap-2 lg:flex">
            {signedIn ? (
              <ButtonLink href="/dashboard" variant="primary" size="sm">
                Dashboard
              </ButtonLink>
            ) : (
              <>
                <Link href="/sign-in" className={buttonClass("secondary", "sm")}>
                  Sign in
                </Link>
                <ButtonLink href="/sign-up" variant="primary" size="sm">
                  Create account
                </ButtonLink>
              </>
            )}
          </div>
          <MobileMenu signedIn={signedIn} />
        </div>
      </nav>
    </header>
  );
}

/** Cobalt band with the hiker, then the plain footer with the operator disclosure. */
export function SiteFooter({ band = true }: { band?: boolean }) {
  return (
    <footer className="mt-auto">
      {band ? (
        <div className="relative isolate overflow-hidden pt-10">
          <div aria-hidden="true" className="band-cobalt absolute inset-x-0 bottom-0 top-8 -z-10" />
          <div className="container-page grid items-end gap-6 pb-10 md:grid-cols-[260px_1fr]">
            <HikerRidgeArt className="hidden h-[200px] w-auto md:block" />
            <div className="flex flex-col items-start gap-4 pt-12 md:flex-row md:items-center md:justify-end md:pt-16">
              <p className="display-italic text-[34px] leading-[0.95] text-white sm:text-[44px]">
                Build once.
                <br />
                Protect your work.
                <br />
                Monetize it.
              </p>
              <ButtonLink href="/docs/quickstart" variant="secondary" size="lg" arrow className="md:ml-6">
                Start building
              </ButtonLink>
            </div>
          </div>
        </div>
      ) : null}
      {/* Always dark, in both themes: fixed values rather than the ink/paper tokens, which swap in dark mode. */}
      <div className="border-t-2 border-line bg-[#15130f] text-[#f5efe3]">
        <div className="container-page grid gap-8 py-10 text-[14px] md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <span className="font-display text-[22px] font-black uppercase tracking-[-0.02em]" style={{ fontStretch: "105%" }}>
              SCRIPT<span className="text-[#a2abff]">//</span>GO
            </span>
            <p className="mt-3 max-w-sm text-[#cfc7b7]">
              Game scripts proven by real runs, protected and sold by their creators.
            </p>
          </div>
          <FooterCol
            title="Product"
            links={[
              ["/explore", "Explore"],
              ["/environments", "Environments"],
              ["/sdk", "SDK"],
              ["/docs", "Docs"],
              ["/developers", "Developers"],
            ]}
          />
          <FooterCol
            title="Platform"
            links={[
              ["/status", "Status"],
              ["/docs/licensing-api", "Licensing API"],
              ["/docs/create-adapter", "Create an adapter"],
              ["/dashboard", "Dashboard"],
            ]}
          />
          <FooterCol
            title="Trust"
            links={[
              ["/legal", "Legal"],
              ["/legal#ip-policy", "IP policy"],
              ["/legal#privacy", "Privacy"],
              ["/report", "Report a package"],
            ]}
          />
        </div>
        <div className="container-page flex flex-wrap justify-between gap-2 border-t border-[#3a362e] py-4 text-[12.5px] text-[#ada594]">
          <span>SCRIPT//GO is a working name. Engine and provider names are trademarks of their owners; no endorsement implied.</span>
          <span className="font-mono">{"// "}build once, protect your work, monetize it</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="font-mono text-[11.5px] font-bold uppercase tracking-wider text-[#ada594]">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="hover:text-sun hover:underline">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
