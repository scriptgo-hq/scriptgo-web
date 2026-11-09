import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { UploadRelease } from "@/components/dashboard/release-flow";
import { CommandLine } from "@/components/ui/code-block";
import { Breadcrumb } from "@/components/ui/data";
import { ApiError } from "@/components/ui/feedback";
import { api } from "@/lib/api";
import type { CreatorPackageDetail } from "@/lib/contract";

export const metadata = { title: "New release" };

export default async function NewReleasePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const res = await api<CreatorPackageDetail>(`/v1/creator/packages/${encodeURIComponent(name)}`, { auth: true });
  if (!res.ok) {
    if (res.status === 404) notFound();
    return <ApiError failure={res} title="This package couldn't be loaded." />;
  }
  const p = res.data;
  const latest = p.latestVersion;
  return (
    <>
      <PageHeader
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Packages", href: "/dashboard/packages" },
              { label: p.name, href: `/dashboard/packages/${encodeURIComponent(p.name)}` },
              { label: "New release" },
            ]}
          />
        }
        eyebrow="new release"
        title="Upload a release."
        description={
          <>
            The version comes from the manifest inside the zip{latest ? <>; it must be higher than {latest}</> : null}. Checks run right after
            the upload, then you declare rights and publish.
          </>
        }
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="sticker p-5">
          <UploadRelease packageName={p.name} identifier={p.identifier} />
        </div>
        <aside className="space-y-3 text-[14px] text-ink-2">
          <p className="font-bold text-ink">From the command line</p>
          <p>The CLI zips the folder, uploads it and shows the same checks.</p>
          <CommandLine command="scriptgo publish" />
        </aside>
      </div>
    </>
  );
}
