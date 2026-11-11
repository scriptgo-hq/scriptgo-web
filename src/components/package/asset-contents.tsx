import { StatusBadge, Tag } from "@/components/ui/badge";
import { ASSETS_DOC, needLabel, rightsCaseLabel, supportMeta } from "@/lib/assets";
import type { ParsedManifest, ReleaseAssetsInfo } from "@/lib/contract";
import { envLongName } from "@/lib/env";
import { countOf, formatBytes, shortHash } from "@/lib/format";

/**
 * What a release's assets are, per platform: files, what each player downloads, what the server
 * needs, the game builds they were made for (information only) and the seller's rights case.
 * Shared by the package page and the seller's release page.
 */
export function AssetContents({
  assets: a,
  manifest,
  showContainers = false,
}: {
  assets: ReleaseAssetsInfo;
  /** For the script count per platform (shared, server and client scripts, plus that platform's own). */
  manifest?: Pick<ParsedManifest, "sharedScripts" | "serverScripts" | "clientScripts" | "environmentScripts"> | null;
  showContainers?: boolean;
}) {
  const baseScripts = manifest ? manifest.sharedScripts.length + manifest.serverScripts.length + manifest.clientScripts.length : 0;
  const scriptsOn = (env: string) => baseScripts + (manifest?.environmentScripts[env]?.length ?? 0);
  const builds = Array.from(new Set(a.environments.flatMap((e) => e.gameBuilds)));
  return (
    <div className="space-y-4" data-assets>
      <dl className="grid grid-cols-1 gap-y-1.5 text-[14px] sm:grid-cols-[10rem_minmax(0,1fr)]">
        <dt className="text-ink-3">Assets</dt>
        <dd className="tabular">
          {countOf(a.files, "file")}, {formatBytes(a.totalBytes)}
        </dd>
        <dt className="text-ink-3">Rights</dt>
        <dd data-asset-rights={a.rightsCase ?? "none"}>
          {rightsCaseLabel(a.rightsCase)}
          {a.rightsCase ? <span className="text-ink-3"> · the seller&rsquo;s statement</span> : null}
        </dd>
        {builds.length ? (
          <>
            <dt className="text-ink-3">Made for</dt>
            <dd className="flex flex-wrap gap-1">
              {builds.map((b) => (
                <Tag key={b} mono>
                  {b}
                </Tag>
              ))}
              <span className="w-full text-[12.5px] text-ink-3">Game builds the seller names. Information only: nothing checks them.</span>
            </dd>
          </>
        ) : null}
        <dt className="text-ink-3">Each download</dt>
        <dd>
          Licensed, fingerprinted, traceable: every licence holder gets their own signed copy.{" "}
          <a href={ASSETS_DOC} className="font-semibold text-cobalt-ink underline">
            What that means
          </a>
        </dd>
      </dl>

      <div className="panel relative overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-[14px]">
          <caption className="sr-only">Assets by platform</caption>
          <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
            <tr>
              <th scope="col" className="px-3 py-2.5">Platform</th>
              <th scope="col" className="px-3 py-2.5">Delivery</th>
              {manifest ? <th scope="col" className="px-3 py-2.5 text-right">Scripts</th> : null}
              <th scope="col" className="px-3 py-2.5 text-right">Asset files</th>
              <th scope="col" className="px-3 py-2.5 text-right">Per player</th>
              <th scope="col" className="px-3 py-2.5">Server needs</th>
            </tr>
          </thead>
          <tbody>
            {a.environments.map((e) => (
              <tr key={e.environment} className="border-t border-line-soft align-top" data-asset-env={e.environment}>
                <th scope="row" className="px-3 py-2.5 font-semibold">{envLongName(e.environment)}</th>
                <td className="px-3 py-2.5">
                  <StatusBadge meta={supportMeta[e.support]} size="sm" />
                </td>
                {manifest ? (
                  <td className="tabular px-3 py-2.5 text-right" data-asset-scripts={scriptsOn(e.environment)}>
                    {scriptsOn(e.environment) || "—"}
                  </td>
                ) : null}
                <td className="tabular px-3 py-2.5 text-right">{e.files}</td>
                <td className="tabular px-3 py-2.5 text-right" data-asset-download={e.downloadBytes}>
                  {e.downloadBytes > 0 ? formatBytes(e.downloadBytes) : "—"}
                </td>
                <td className="px-3 py-2.5 text-[13.5px]">{e.needs.length ? e.needs.map(needLabel).join(", ") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {a.warnings.length ? (
        <ul className="space-y-1 text-[13.5px] text-ink-2">
          {a.warnings.map((w, i) => (
            <li key={`${w.code}-${i}`}>
              <span className="font-mono text-[12px] text-ink-3">{w.code}</span> {w.message}
            </li>
          ))}
        </ul>
      ) : null}

      {showContainers ? (
        <details className="panel p-4">
          <summary className="cursor-pointer font-bold">
            Packages <span className="tabular font-normal text-ink-3">({a.environments.reduce((n, e) => n + e.containers.length, 0)})</span>
          </summary>
          <ul className="mt-2 space-y-1.5 text-[13px]">
            {a.environments.flatMap((e) =>
              e.containers.map((c) => (
                <li key={`${e.environment}-${c.path}`} className="break-all">
                  <span className="font-mono">{c.path}</span>{" "}
                  <span className="tabular text-ink-3">
                    · {formatBytes(c.bytes)} · {countOf(c.entries, "entry", "entries")} · {shortHash(c.sha256, 12)}
                  </span>
                </li>
              )),
            )}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
