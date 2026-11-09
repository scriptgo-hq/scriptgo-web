import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CommandLine } from "@/components/ui/code-block";
import { DisplayTitle, Eyebrow, Stroke } from "@/components/ui/typography";
import { DOCS, DOC_GROUPS, loadDoc } from "@/lib/docs";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Docs",
  description: "Write a resource, run it in several environments, publish and license it.",
};

export default async function DocsHome() {
  const entries = await Promise.all(DOCS.map(async (d) => ({ entry: d, doc: await loadDoc(d) })));
  return (
    <div>
      <Eyebrow>docs</Eyebrow>
      <DisplayTitle as="h1" className="mt-2 text-[48px] sm:text-[60px]">
        Docs.
      </DisplayTitle>
      <Stroke className="mt-1" />
      <p className="mt-4 max-w-[62ch] text-[17px] text-ink-2">
        A SCRIPT//GO package is a resource: a declarative manifest (<code className="font-mono text-[0.9em]">scriptgo.lua</code>{" "}
        or <code className="font-mono text-[0.9em]">scriptgo.json</code>) plus shared, server and client scripts. Write it once
        against capabilities; each environment&rsquo;s adapter runs it. Lua runs in every environment; TypeScript and JavaScript
        run on the .NET kit.
      </p>
      <div className="mt-6 max-w-xl">
        <CommandLine command="scriptgo init my_resource" />
        <p className="mt-2 text-[13px] text-ink-3">The CLI is in preview; see the CLI page for what is available today.</p>
      </div>
      <div className="mt-10 space-y-10">
        {DOC_GROUPS.map((g) => (
          <section key={g} aria-labelledby={`g-${g}`}>
            <h2 id={`g-${g}`} className="eyebrow text-[13px]">
              {"// "}
              {g}
            </h2>
            <ul className="mt-3 grid gap-4 sm:grid-cols-2">
              {entries
                .filter(({ entry }) => entry.group === g)
                .map(({ entry, doc }) => (
                  <li key={entry.slug}>
                    <Link href={`/docs/${entry.slug}`} className="sticker sticker-hover flex h-full flex-col gap-1.5 p-4">
                      <span className="font-display text-[19px] font-extrabold leading-tight">{doc.title}</span>
                      <span className="text-[14px] text-ink-2">{doc.description}</span>
                      <span className="mt-auto inline-flex items-center gap-1 pt-2 text-[13px] font-bold text-cobalt-ink">
                        Read <ArrowRight aria-hidden="true" size={14} strokeWidth={2.5} />
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
