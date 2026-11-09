"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  ChartLine,
  FileClock,
  Gavel,
  KeyRound,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Menu,
  Package,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
  Store,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/site/theme-toggle";

export interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  badge?: number;
}
export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const ICONS = {
  overview: LayoutDashboard,
  library: LibraryBig,
  licenses: KeyRound,
  packages: Package,
  customers: Users,
  stores: Store,
  analytics: ChartLine,
  notices: Bell,
  settings: Settings,
  admin: ShieldCheck,
  offers: Receipt,
  releases: FileClock,
  reports: Gavel,
  audit: ScrollText,
  payments: Receipt,
} satisfies Record<string, LucideIcon>;

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function Nav({ groups, root }: { groups: NavGroup[]; root: string }) {
  const pathname = usePathname() ?? root;
  return (
    <div className="space-y-5">
      {groups.map((g, gi) => (
        <div key={g.label ?? gi}>
          {g.label ? <p className="mb-1.5 px-3 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-3">{g.label}</p> : null}
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const Icon = ICONS[it.icon];
              const active = isActive(pathname, it.href, it.href === root);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border-2 px-3 py-2 text-[14.5px] font-semibold",
                      active ? "border-line bg-surface shadow-[2px_2px_0_0_var(--shadow)]" : "border-transparent text-ink-2 hover:bg-surface-2 hover:text-ink",
                    )}
                  >
                    <Icon aria-hidden="true" size={17} strokeWidth={2.25} />
                    <span className="flex-1">{it.label}</span>
                    {it.badge ? (
                      <span className="tabular rounded-full border-2 border-line bg-sun px-1.5 text-[11.5px] font-bold text-on-sun">
                        {it.badge}
                        <span className="sr-only"> unread</span>
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await authClient.signOut();
        } finally {
          router.replace("/");
          router.refresh();
        }
      }}
      className={cn("inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink", className)}
    >
      <LogOut aria-hidden="true" size={16} />
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}

/** Left sidebar on desktop; a top bar with a drawer on mobile. Group labels stay visible. */
export function DashboardShell({
  groups,
  root,
  title,
  account,
  children,
}: {
  groups: NavGroup[];
  root: string;
  title: string;
  account: { name: string; email: string } | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  const brand = (
    <Link href="/" className="font-display text-[20px] font-black uppercase tracking-[-0.02em]" style={{ fontStretch: "105%" }}>
      SCRIPT<span className="text-cobalt-ink">//</span>GO
    </Link>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden border-r-2 border-line-soft bg-paper-2/70 lg:block">
        <div className="sticky top-0 flex h-dvh flex-col gap-6 overflow-y-auto px-3 py-5">
          <div className="flex items-center justify-between px-3">
            {brand}
            <ThemeToggle />
          </div>
          <p className="px-3 font-mono text-[11.5px] font-bold uppercase tracking-wider text-cobalt-ink">{"// "}{title}</p>
          <nav aria-label={title}>
            <Nav groups={groups} root={root} />
          </nav>
          <div className="mt-auto border-t-2 border-line-soft pt-4">
            {account ? (
              <p className="truncate px-3 text-[13px]">
                <span className="block font-bold">{account.name}</span>
                <span className="text-ink-3">{account.email}</span>
              </p>
            ) : null}
            <SignOutButton className="mt-2" />
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b-2 border-line-soft bg-paper/95 px-4 lg:hidden">
          {brand}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              aria-expanded={open}
              aria-controls="dash-drawer"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-line bg-surface"
            >
              {open ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
              <span className="sr-only">{open ? "Close navigation" : "Open navigation"}</span>
            </button>
          </div>
        </header>
        <div id="dash-drawer" hidden={!open} className="border-b-2 border-line bg-paper-2 px-3 py-4 lg:hidden">
          <nav aria-label={title}>
            <Nav groups={groups} root={root} />
          </nav>
          <SignOutButton className="mt-3" />
        </div>
        <main id="main" className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto max-w-[1180px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
