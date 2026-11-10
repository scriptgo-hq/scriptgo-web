import Link from "next/link";
import type { Metadata } from "next";
import { ReportForm } from "@/components/site/report-form";
import { DisplayTitle, Eyebrow } from "@/components/ui/typography";
import { mailEnabled } from "@/lib/platform";

export const metadata: Metadata = {
  title: "Report a package",
  description: "Report an intellectual property infringement or abuse. No account required; you get a case number right away.",
};

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => ((Array.isArray(v) ? v[0] : v) ?? "").slice(0, 200);

export default async function ReportPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const mail = await mailEnabled();
  return (
    <div className="container-page grid gap-10 pb-16 pt-10 lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)]">
      <div className="min-w-0">
        <Eyebrow className="mb-4">Trust</Eyebrow>
        <DisplayTitle as="h1" className="text-[44px] sm:text-[60px]">
          Report <em>a package.</em>
        </DisplayTitle>
        <p className="mt-4 max-w-[58ch] text-[16.5px] text-ink-2">
          Tell us what infringes your rights or causes harm. A moderator reviews every report. You don&rsquo;t need an account.
        </p>
        <div className="mt-8">
          <ReportForm defaultPackage={one(sp.package)} defaultVersion={one(sp.version)} mailEnabled={mail} />
        </div>
      </div>
      <aside className="space-y-5 lg:pt-28">
        <div className="panel p-5 text-[14px] text-ink-2">
          <h2 className="font-display text-[17px] font-extrabold text-ink">Before you send</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>One report per package is enough; add every release concerned in the description.</li>
            <li>Evidence helps: the original work, dates, links, file names.</li>
            <li>False or abusive reports can lead to action against the reporter.</li>
          </ul>
        </div>
        <div className="panel p-5 text-[14px] text-ink-2">
          <h2 className="font-display text-[17px] font-extrabold text-ink">How decisions are made</h2>
          <p className="mt-2">
            Read the <Link href="/legal#ip-policy" className="font-semibold text-cobalt-ink underline">IP policy</Link> (draft pending
            legal review) for the review process, possible outcomes and appeals.
          </p>
        </div>
      </aside>
    </div>
  );
}
