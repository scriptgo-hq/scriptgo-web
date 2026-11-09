"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

export const NAV_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/environments", label: "Environments" },
  { href: "/sdk", label: "SDK" },
  { href: "/docs", label: "Docs" },
  { href: "/developers", label: "Developers" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname() ?? "/";
  return (
    <ul className="hidden items-center gap-1 lg:flex">
      {NAV_LINKS.map((l) => {
        const active = isActive(pathname, l.href);
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative rounded-md px-3 py-2 text-[14.5px] font-semibold",
                active ? "text-ink" : "text-ink-2 hover:text-ink",
              )}
            >
              {l.label}
              {active ? <span aria-hidden="true" className="absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full bg-cobalt" /> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Header search. Ctrl K / ⌘K focuses it; submitting goes to Explore. */
export function SearchBox({ className }: { className?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [q, setQ] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
        ref.current?.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
      <Search aria-hidden="true" size={16} strokeWidth={2.25} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
      <input
        ref={ref}
        id="site-search"
        name="q"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search scripts"
        autoComplete="off"
        className="h-9 w-full rounded-full border-2 border-line-soft bg-surface pl-9 pr-14 text-[14px] placeholder:text-ink-3 focus:border-line"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-line-soft px-1.5 font-mono text-[10.5px] text-ink-3">
        Ctrl K
      </kbd>
    </form>
  );
}

/** Mobile drawer with the same links, search and account actions. */
export function MobileMenu({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-line bg-surface"
      >
        {open ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>
      <div
        id="mobile-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full z-50 border-b-2 border-line bg-paper px-4 pb-5 pt-3 shadow-[0_6px_0_0_var(--shadow)]"
      >
        <SearchBox className="mb-3" />
        <ul className="flex flex-col">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="block rounded-md px-2 py-2.5 text-[16px] font-semibold hover:bg-surface-2">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          {signedIn ? (
            <Link href="/dashboard" className="inline-flex h-10 flex-1 items-center justify-center rounded-[10px] border-2 border-line bg-cobalt font-bold text-on-cobalt">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="inline-flex h-10 flex-1 items-center justify-center rounded-[10px] border-2 border-line bg-surface font-bold">
                Sign in
              </Link>
              <Link href="/sign-up" className="inline-flex h-10 flex-1 items-center justify-center rounded-[10px] border-2 border-line bg-cobalt font-bold text-on-cobalt">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
