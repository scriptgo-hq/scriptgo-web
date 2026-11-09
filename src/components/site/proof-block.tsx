import Link from "next/link";
import { FileCode2 } from "lucide-react";
import { api } from "@/lib/api";
import type { CompatibilityEntry, CreatorProfile, Page, PackageDetail, PackageSummary } from "@/lib/contract";
import { envLongName } from "@/lib/env";
import { formatDate } from "@/lib/format";
import { readmeExample } from "@/lib/markdown";
import { COMPAT_ORDER, compatibilityMeta, metaFor } from "@/lib/status";
import { StatusBadge } from "@/components/ui/badge";
import { CodeBlock, TerminalOutput } from "@/components/ui/code-block";
import { ApiError, EmptyState } from "@/components/ui/feedback";
import { EnvTabs } from "@/components/ui/tabs";
import { Identifier } from "@/components/ui/typography";
import { packageHref } from "@/components/ui/package";

function verifiedCount(p: PackageSummary) {
  return p.environments.filter((e) => e.status === "verified").length;
}

export function EvidenceLine({ entry }: { entry: CompatibilityEntry }) {
  const meta = metaFor(compatibilityMeta, entry.status);
  const parts: string[] = [];
  if (entry.runtimeVersion) parts.push(entry.runtimeVersion);
  if (entry.adapterVersion) parts.push(`adapter ${entry.adapterVersion}`);
  if (entry.runId) parts.push(`run ${entry.runId}`);
  if (entry.ranAt) parts.push(formatDate(entry.ranAt));
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
      <StatusBadge meta={meta} size="sm" />
      {entry.status === "not_tested" ? (
        <span className="text-ink-3">Not tested yet. No run has been recorded for this environment.</span>
      ) : entry.status === "unsupported" && entry.missingCapability ? (
        <span className="text-ink-3">
          Needs <code className="font-mono">{entry.missingCapability}</code>, which this environment lacks.
        </span>
      ) : (
        <span className="tabular font-mono text-ink-2">{parts.join(" · ")}</span>
      )}
    </div>
  );
}

/**
 * Home centrepiece: one module's code next to its real output in each environment.
 * Everything comes from the API's compatibility runs; nothing is drawn or invented.
 */
export async function ProofBlock() {
  const first = await api<CreatorProfile>("/v1/creators/scriptgo");
  let candidates: PackageSummary[] = [];
  if (first.ok) {
    candidates = first.data.packages;
  } else if (first.kind === "unreachable") {
    return <ApiError failure={first} title="Live proof unavailable: the API is not reachable." />;
  }
  if (candidates.length === 0) {
    const list = await api<Page<PackageSummary>>("/v1/packages?sort=downloads&pageSize=12");
    if (!list.ok) return <ApiError failure={list} title="Live proof unavailable." />;
    candidates = list.data.items;
  }
  const pick = [...candidates].sort((a, b) => verifiedCount(b) - verifiedCount(a))[0];
  if (!pick) {
    return (
      <EmptyState title="No packages yet" icon={FileCode2}>
        The proof block shows a real module and its output in each environment once a package has compatibility runs.
      </EmptyState>
    );
  }
  const detailRes = await api<PackageDetail>(
    `/v1/packages/${encodeURIComponent(pick.creator.username)}/${encodeURIComponent(pick.name)}`,
  );
  if (!detailRes.ok) return <ApiError failure={detailRes} title="Live proof unavailable." />;
  const d = detailRes.data;
  const version = d.viewingVersion ?? d.latestVersion;
  const entries = d.compatibility
    .filter((c) => !version || c.version === version)
    .sort((a, b) => (COMPAT_ORDER[a.status] ?? 9) - (COMPAT_ORDER[b.status] ?? 9) || a.environment.localeCompare(b.environment));
  const example = readmeExample(d.readme);
  const code = example?.code ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="min-w-0">
        <p className="mb-2 text-[13.5px] text-ink-2">
          <Link href={packageHref(d)} className="font-semibold text-ink hover:underline">
            <Identifier value={d.identifier} />
          </Link>
          {version ? <span className="tabular"> · v{version}</span> : null}
          <span>
            {example?.runnable
              ? " · the README example, run in each environment on the right"
              : " · from the package README (not run by verification)"}
          </span>
        </p>
        {code ? (
          <CodeBlock code={code} lang="lua" filename={`${d.resourceName}/README.md · lua`} />
        ) : (
          <EmptyState title="No Lua example in this README" icon={FileCode2}>
            The package README has no Lua code block to show here.
          </EmptyState>
        )}
      </div>
      <div className="min-w-0">
        <p className="mb-2 text-[13.5px] text-ink-2">Output recorded by each environment&rsquo;s compatibility run</p>
        {entries.length === 0 ? (
          <EmptyState title="No compatibility runs recorded yet">
            Nothing is marked Verified until a run passes in the real runtime.
          </EmptyState>
        ) : (
          <EnvTabs
            label="Environment output"
            items={entries.map((e) => ({
              id: e.environment,
              label: envLongName(e.environment),
              content: (
                <div className="mt-3 space-y-2.5">
                  {e.log ? (
                    <TerminalOutput text={e.log} title={`${envLongName(e.environment)} · run output`} maxHeight={260} />
                  ) : (
                    <div className="codeblock px-4 py-6 text-[13px] text-[#cfc7b7]">
                      {e.status === "not_tested" ? "Not tested yet." : "No log attached to this run."}
                    </div>
                  )}
                  <EvidenceLine entry={e} />
                </div>
              ),
            }))}
          />
        )}
      </div>
    </div>
  );
}
