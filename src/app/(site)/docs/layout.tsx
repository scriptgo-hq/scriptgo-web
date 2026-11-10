import { DocsNav } from "@/components/site/docs-nav";
import { DOCS, DOC_GROUPS } from "@/lib/docs";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const groups = DOC_GROUPS.map((g) => ({
    group: g,
    items: DOCS.filter((d) => d.group === g).map((d) => ({ slug: d.slug, title: d.title })),
  }));
  return (
    <div className="container-page grid gap-10 pb-16 pt-10 lg:grid-cols-[230px_minmax(0,1fr)]">
      <div>
        <DocsNav groups={groups} />
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
