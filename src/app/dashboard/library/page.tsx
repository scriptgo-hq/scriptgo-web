import { LibraryBig } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ButtonLink } from "@/components/ui/button";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { PackageRow } from "@/components/ui/package";
import { api, asList } from "@/lib/api";
import type { PackageSummary } from "@/lib/contract";

export const metadata = { title: "Library" };

export default async function LibraryPage() {
  const res = await api<PackageSummary[] | { items: PackageSummary[] }>("/v1/me/library", { auth: true });
  return (
    <>
      <PageHeader eyebrow="using" title="Library." description="Packages you installed with your account or hold a license for." />
      {!res.ok ? (
        <ApiError failure={res} />
      ) : asList(res.data).length === 0 ? (
        <EmptyState icon={LibraryBig} title="Your library is empty" action={<ButtonLink href="/explore" size="sm" arrow>Explore scripts</ButtonLink>}>
          Packages appear here when you install them signed in, or when you get a license.
        </EmptyState>
      ) : (
        <ul className="panel overflow-hidden">
          {asList(res.data).map((p) => (
            <PackageRow key={p.id} pkg={p} />
          ))}
        </ul>
      )}
    </>
  );
}
