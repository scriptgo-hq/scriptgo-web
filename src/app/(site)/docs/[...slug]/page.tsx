import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/ui/data";
import { Prose } from "@/components/ui/prose";
import { DOCS, findDoc, loadDoc, neighbours } from "@/lib/docs";
import { renderMarkdown } from "@/lib/markdown";

export const dynamic = "force-static";
export const dynamicParams = false;

type Params = { slug: string[] };

export function generateStaticParams(): Params[] {
  return DOCS.map((d) => ({ slug: d.slug.split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = findDoc(slug.join("/"));
  if (!entry) return {};
  const doc = await loadDoc(entry);
  return { title: `${doc.title} · Docs`, description: doc.description };
}

export default async function DocPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const key = slug.join("/");
  const entry = findDoc(key);
  if (!entry) notFound();
  const doc = await loadDoc(entry);
  const { html, headings } = await renderMarkdown(doc.markdown, { trusted: true, stripTitle: true });
  const { prev, next } = neighbours(key);
  const toc = headings.filter((h) => h.depth === 2 || h.depth === 3);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_220px]">
      <article className="min-w-0">
        <Breadcrumb items={[{ label: "Docs", href: "/docs" }, ...key.split("/").map((s) => ({ label: s }))]} />
        <h1 className="display mt-4 text-[40px] sm:text-[50px]">{doc.title.replace(/\.$/, "")}.</h1>
        <p className="mt-3 max-w-[64ch] text-[17px] text-ink-2">{doc.description}</p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[12px] text-ink-3">
          <span>SDK scriptgo_version 0.1</span>
          <span aria-hidden="true">·</span>
          <span>
            Source: <code>{doc.repoPath}</code>
          </span>
          {entry.source.kind === "spec" ? (
            <>
              <span aria-hidden="true">·</span>
              <span>Specification (normative)</span>
            </>
          ) : null}
        </div>
        {toc.length > 0 ? (
          <details className="panel mt-6 xl:hidden">
            <summary className="cursor-pointer px-4 py-2.5 text-[14px] font-bold">On this page</summary>
            <TocList toc={toc} className="border-t border-line-soft px-4 py-3" />
          </details>
        ) : null}
        <Prose html={html} className="mt-8" />
        <nav aria-label="Previous and next" className="mt-14 grid gap-3 border-t-2 border-line-soft pt-6 sm:grid-cols-2">
          {prev ? (
            <Link href={`/docs/${prev.slug}`} className="panel group flex flex-col p-4 hover:border-line">
              <span className="inline-flex items-center gap-1 text-[12.5px] text-ink-3">
                <ArrowLeft aria-hidden="true" size={14} /> Previous
              </span>
              <span className="font-bold group-hover:underline">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/docs/${next.slug}`} className="panel group flex flex-col items-end p-4 text-right hover:border-line">
              <span className="inline-flex items-center gap-1 text-[12.5px] text-ink-3">
                Next <ArrowRight aria-hidden="true" size={14} />
              </span>
              <span className="font-bold group-hover:underline">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      </article>
      {toc.length > 0 ? (
        <aside aria-label="On this page" className="hidden xl:block">
          <div className="sticky top-24">
            <p className="eyebrow">{"// on this page"}</p>
            <TocList toc={toc} className="mt-2" />
          </div>
        </aside>
      ) : null}
    </div>
  );
}

function TocList({ toc, className }: { toc: { id: string; text: string; depth: number }[]; className?: string }) {
  return (
    <ul className={`space-y-1 text-[13.5px] ${className ?? ""}`}>
      {toc.map((h) => (
        <li key={h.id} className={h.depth === 3 ? "pl-3" : ""}>
          <a href={`#${h.id}`} className="block py-0.5 text-ink-2 hover:text-ink hover:underline">
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );
}
