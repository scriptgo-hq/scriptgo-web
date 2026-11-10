import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { ReleaseView } from "@/components/dashboard/release-flow";
import { Breadcrumb } from "@/components/ui/data";
import { ApiError } from "@/components/ui/feedback";
import { api } from "@/lib/api";
import type { Release } from "@/lib/contract";
import { getMe } from "@/lib/session";

export const metadata = { title: "Release" };

export default async function ReleasePage({ params }: { params: Promise<{ name: string; id: string }> }) {
  const { name, id } = await params;
  const res = await api<Release>(`/v1/creator/releases/${encodeURIComponent(id)}`, { auth: true });
  if (!res.ok) {
    if (res.status === 404) notFound();
    return <ApiError failure={res} title="This release couldn't be loaded." />;
  }
  const r = res.data;
  if (r.packageName !== name) notFound();
  // The creator's username builds the link to the plain archive of a protected release.
  const me = await getMe();
  const creator = me.ok ? (me.data.creatorProfile?.username ?? null) : null;
  return (
    <>
      <PageHeader
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Packages", href: "/dashboard/packages" },
              { label: r.packageName, href: `/dashboard/packages/${encodeURIComponent(r.packageName)}` },
              { label: r.version },
            ]}
          />
        }
        eyebrow="release"
        title={`${r.packageName} ${r.version}.`}
      />
      <ReleaseView initial={r} creator={creator} />
    </>
  );
}
