"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitHubMark } from "@/components/ui/github-mark";
import { cn } from "@/lib/cn";
import { sdkTreeUrl } from "@/lib/repo";

export interface DocsNavGroup {
  group: string;
  items: { slug: string; title: string }[];
}

function NavList({ groups, pathname }: { groups: DocsNavGroup[]; pathname: string }) {
  return (
    <div className="space-y-5">
      <Link
        href="/docs"
        aria-current={pathname === "/docs" ? "page" : undefined}
        className={cn("block px-2 py-1.5 font-display text-[14.5px] font-extrabold", pathname === "/docs" ? "bg-ink text-paper" : "hover:bg-sun hover:text-on-sun")}
      >
        Docs home
      </Link>
      {groups.map((g) => (
        <div key={g.group}>
          <p className="eyebrow px-2">{g.group}</p>
          <ul className="mt-1.5 space-y-0.5">
            {g.items.map((it) => {
              const href = `/docs/${it.slug}`;
              const active = pathname === href;
              return (
                <li key={it.slug}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block border-l-[5px] px-2.5 py-1.5 text-[14.5px]",
                      active ? "border-cobalt bg-sun font-bold text-on-sun" : "border-transparent text-ink-2 hover:border-line hover:text-ink",
                    )}
                  >
                    {it.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <a href={sdkTreeUrl("docs")} className="flex items-center gap-2 px-2 py-1.5 text-[14px] text-ink-2 hover:text-ink hover:underline">
        <GitHubMark size={16} /> These docs on GitHub
      </a>
    </div>
  );
}

/** Desktop: sticky tree. Mobile: a disclosure drawer at the top of the page. */
export function DocsNav({ groups }: { groups: DocsNavGroup[] }) {
  const pathname = usePathname() ?? "/docs";
  return (
    <>
      <nav aria-label="Documentation" className="sticky top-28 hidden max-h-[calc(100dvh-7rem)] overflow-y-auto pb-8 pr-2 lg:block">
        <NavList groups={groups} pathname={pathname} />
      </nav>
      <details className="panel mb-6 lg:hidden">
        <summary className="cursor-pointer px-4 py-3 font-display font-extrabold">Docs menu</summary>
        <nav aria-label="Documentation" className="border-t border-line-soft px-2 py-3">
          <NavList groups={groups} pathname={pathname} />
        </nav>
      </details>
    </>
  );
}
