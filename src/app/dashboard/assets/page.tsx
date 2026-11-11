import { AssetLookup } from "@/components/assets/asset-lookup";
import { AssetReportForm } from "@/components/assets/asset-report-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { ASSETS_DOC } from "@/lib/assets";
import { getMe } from "@/lib/session";

export const metadata = { title: "Leaked copies" };

type SP = { package?: string | string[]; version?: string | string[] };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim().slice(0, 200) ?? "";

export default async function LeakedCopiesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const me = await getMe();
  const creator = me.ok && Boolean(me.data.creatorProfile);
  return (
    <>
      <PageHeader
        eyebrow="assets"
        title="Leaked copies."
        description="Every download of your assets is its own fingerprinted copy. Found one where it shouldn't be? Look it up, then report it."
      />
      <div className="grid grid-cols-1 gap-12">
        {creator ? (
          <section aria-labelledby="find-title">
            <h2 id="find-title" className="font-display text-[24px] font-extrabold tracking-[-0.02em]">
              Find the copy
            </h2>
            <p className="mt-2 max-w-prose text-[14px] text-ink-2">
              Shows which licence of your packages a file was built for. The account behind it stays with staff: report it to act.{" "}
              <a href={`${ASSETS_DOC}#check-a-copy`} className="font-semibold text-cobalt-ink underline">
                Check a copy
              </a>
            </p>
            <div className="mt-4 max-w-[760px]">
              <AssetLookup staff={false} />
            </div>
          </section>
        ) : null}
        <section aria-labelledby="report-title">
          <h2 id="report-title" className="font-display text-[24px] font-extrabold tracking-[-0.02em]">
            Report it
          </h2>
          <p className="mt-2 max-w-prose text-[14px] text-ink-2">
            Staff find the copy, then can revoke its licence, stop its server or hold the release. The seller is told and can appeal.
          </p>
          <div className="mt-4 max-w-[760px]">
            <AssetReportForm initialPackage={one(sp.package)} initialVersion={one(sp.version)} />
          </div>
        </section>
      </div>
    </>
  );
}
