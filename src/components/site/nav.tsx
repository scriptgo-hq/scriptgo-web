"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { GitHubMark } from "@/components/ui/github-mark";
import { BRAND } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { SDK_REPO } from "@/lib/repo";

export const NAV_LINKS = [
  { href: "/environments", label: "Platforms" },
  { href: "/sdk", label: "SDK" },
  { href: "/protect", label: "Protect" },
  { href: "/developers", label: "Monetize" },
  { href: "/docs", label: "Docs" },
];

/** Reachable from the drawer and the footer, not from the bar: the directory is not what the site leads with. */
const MORE_LINKS = [
  { href: "/explore", label: "Scripts directory" },
  { href: "/status", label: "Status" },
];

/** Fired by the home page picker when the platform changes: the key in the header gets pressed. */
export const WORLD_EVENT = "sg-world";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Search field of the mobile drawer; submitting goes to the scripts directory. */
export function SearchBox({ className }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      action="/explore"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/explore?q=${encodeURIComponent(q.trim())}` : "/explore");
      }}
      className={cn("relative", className)}
    >
      <label htmlFor="site-search" className="sr-only">
        Search scripts
      </label>
      <Search aria-hidden="true" size={16} strokeWidth={2.5} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
      <input
        id="site-search"
        name="q"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search scripts"
        autoComplete="off"
        className="h-11 w-full border-[2.5px] border-line bg-surface pl-9 pr-3 text-[15px] text-ink placeholder:text-ink-3"
      />
    </form>
  );
}

/**
 * The top bar: navigation on the left, the brand in the middle, account actions on the right.
 * On the home page it sits on the hero art and turns to paper once the page scrolls; everywhere
 * else it is paper from the start. Ctrl K / ⌘K opens the scripts directory and its search field.
 */
export function TopBar({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const overlay = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [kick, setKick] = useState(0);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Two thresholds, further apart than the bar's change of height (88 → 76 px on desktop). The bar
    // is sticky, so that change moves the page and the browser re-anchors the scroll position: with
    // one threshold, stopping just past it flipped the bar back and forth on every frame.
    const sync = () => setScrolled((was) => (was ? window.scrollY > 12 : window.scrollY > 48));
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onWorld = () => setKick((k) => k + 1);
    window.addEventListener(WORLD_EVENT, onWorld);
    return () => window.removeEventListener(WORLD_EVENT, onWorld);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const field = document.getElementById("explore-q") as HTMLInputElement | null;
        if (field) {
          field.focus();
          field.select();
        } else {
          router.push("/explore?focus=search");
        }
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        menuButton.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, router]);

  const solid = !overlay || scrolled || open;

  return (
    <header className={cn("top", solid && "solid")}>
      <div className="bar">
        <div className="container-page bar-in">
          <div className="flex min-w-0 items-center justify-self-start">
            <button
              ref={menuButton}
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
              className="icon-btn min-[1081px]:hidden"
            >
              {open ? <X aria-hidden="true" size={20} strokeWidth={2.5} /> : <Menu aria-hidden="true" size={20} strokeWidth={2.5} />}
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            </button>
            <nav aria-label="Main" className="top-nav">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} aria-current={isActive(pathname, l.href) ? "page" : undefined}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          {/* The key remounts on each platform change, which replays its press animation. */}
          <Link href="/" className={cn("brand", kick > 0 && "kick")} key={kick} aria-label="SCRIPT//GO home">
            <span className="brand-key">
              <img className="brand-mark" src={BRAND.mark.src} width={BRAND.mark.width} height={BRAND.mark.height} alt="" />
            </span>
            <img className="brand-word" src={BRAND.word.src} width={BRAND.word.width} height={BRAND.word.height} alt="SCRIPT//GO" />
          </Link>
          <div className="top-actions">
            <a href={SDK_REPO} target="_blank" rel="noopener noreferrer" className="icon-btn hidden min-[1081px]:inline-grid" title="The SDK on GitHub">
              <GitHubMark size={19} />
              <span className="sr-only">The SDK on GitHub</span>
            </a>
            {signedIn ? (
              <Link href="/dashboard" className={buttonClass("sun", "sm")}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className={buttonClass("secondary", "sm", "hidden min-[1081px]:inline-flex")}>
                  Sign in
                </Link>
                <Link href="/sign-up" className={buttonClass("sun", "sm", "max-[359px]:hidden")}>
                  Get your key
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div id="mobile-menu" hidden={!open} className="absolute inset-x-0 top-full z-50 border-b-[3px] border-line bg-paper px-4 pb-6 pt-4 text-ink min-[1081px]:hidden">
        <SearchBox className="mb-3" />
        <nav aria-label="Main, mobile">
          <ul className="flex flex-col">
            {[...NAV_LINKS, ...MORE_LINKS].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(pathname, l.href) ? "page" : undefined}
                  className="block border-b-2 border-dashed border-line-soft px-1 py-3 font-display text-[17px] font-extrabold hover:bg-sun hover:text-on-sun aria-[current]:bg-sun aria-[current]:text-on-sun"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <a href={SDK_REPO} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-1 text-[15px] font-bold underline underline-offset-2">
          <GitHubMark size={17} /> The SDK on GitHub
        </a>
        <div className="mt-5 flex flex-wrap gap-4 px-1">
          {signedIn ? (
            <Link href="/dashboard" className={buttonClass("sun", "md")}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className={buttonClass("secondary", "md")}>
                Sign in
              </Link>
              <Link href="/sign-up" className={buttonClass("sun", "md")}>
                Get your key
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
