import Link from "next/link";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { KeyValue } from "@/components/ui/data";
import { Banner } from "@/components/ui/feedback";
import type { EnvironmentProtection, PackageVersion } from "@/lib/contract";
import { countOf, formatDate } from "@/lib/format";
import { buyerProtection, formatFingerprint, protectionLead, tierMeta } from "@/lib/protection";
import type { StatusMeta } from "@/lib/status";

const signedMeta: StatusMeta = { label: "Signed", tone: "success", icon: "check", hint: "The registry signed this release. scriptgo add checks the signature before it writes a file." };
const unsignedMeta: StatusMeta = { label: "Not signed", tone: "neutral", icon: "dashed", hint: "Published before release signing existed. Only the SHA-256 can be checked." };
const escrowMeta: StatusMeta = { label: "Encrypted release", tone: "success", icon: "shield", hint: "Delivered as an encrypted bundle. The key is released to a licensed, bound server only." };
const plainMeta: StatusMeta = { label: "Not encrypted", tone: "neutral", icon: "minus", hint: "Delivered as a plain archive." };

/** Small badges for a version row: signed or not, encrypted or not. */
export function ReleaseProtectionBadges({ version: v }: { version: Pick<PackageVersion, "escrow" | "signature"> }) {
  return (
    <>
      {v.escrow ? <StatusBadge meta={escrowMeta} size="sm" /> : null}
      <StatusBadge meta={v.signature ? signedMeta : unsignedMeta} size="sm" />
    </>
  );
}

function FileList({ title, files, mono = true }: { title: string; files: string[]; mono?: boolean }) {
  if (files.length === 0) return null;
  return (
    <details className="border-2 border-line bg-surface px-3 py-2">
      <summary className="cursor-pointer text-[13.5px] font-semibold">{title}</summary>
      <ul className={`mt-2 space-y-0.5 text-[12.5px] text-ink-2 ${mono ? "font-mono" : ""}`}>
        {files.map((f) => (
          <li key={f} className="break-all">
            {f}
          </li>
        ))}
      </ul>
    </details>
  );
}

/**
 * The package page's "Protection" tab: what the release is (signed, encrypted or not, with the
 * clear-text allowlist) and, per environment, what a buyer's server gets. Everything shown is public
 * metadata. A content key is never part of a page: it only leaves the master wrapped to one server.
 */
export function ProtectionPanel({
  version,
  environments,
  paid,
}: {
  version: PackageVersion | null;
  environments: { slug: string; name: string; protection: EnvironmentProtection | null }[];
  /** The package has at least one paid offer, so a licence exists to check. */
  paid: boolean;
}) {
  if (!version) return <p className="text-[14.5px] text-ink-2">No release has been published yet, so there is nothing to protect.</p>;
  const esc = version.escrow;
  const sig = version.signature;
  let signedAt: string | null = null;
  if (sig) {
    try {
      signedAt = (JSON.parse(sig.payload) as { publishedAt?: string }).publishedAt ?? null;
    } catch {
      signedAt = null;
    }
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="prot-release">
        <h3 id="prot-release" className="font-display text-[19px] font-extrabold">
          This release
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge meta={esc ? escrowMeta : plainMeta} />
          <StatusBadge meta={sig ? signedMeta : unsignedMeta} />
        </div>
        <KeyValue
          className="mt-4"
          labelWidth="9rem"
          items={[
            {
              label: "Signature",
              value: sig ? (
                <>
                  ed25519, registry key <span className="font-mono text-[13px]">{formatFingerprint(sig.keyId)}</span>
                  {signedAt ? <span className="text-ink-3"> · signed {formatDate(signedAt)}</span> : null}
                  <span className="block text-[13px] text-ink-3">
                    It covers the package, the version and the SHA-256 of the file you download. <code className="font-mono">scriptgo add</code>{" "}
                    refuses a file that does not match.
                  </span>
                </>
              ) : (
                "None. This release was published before release signing. Check its SHA-256 by hand."
              ),
            },
            ...(esc
              ? [
                  { label: "Cipher", value: <span className="font-mono text-[13px]">{esc.cipher}</span> },
                  { label: "Key wrapping", value: <span className="font-mono text-[13px]">{esc.kdf}</span> },
                  {
                    label: "Bundle signer",
                    value: (
                      <>
                        <span className="font-mono text-[13px]">{formatFingerprint(esc.signerKeyId)}</span>
                        <span className="text-ink-3">
                          {esc.signerOrigin === "creator"
                            ? " · the creator's own key"
                            : esc.signerOrigin === "master"
                              ? " · the creator's key, held sealed by SCRIPT//GO"
                              : ""}
                        </span>
                        <span className="block text-[13px] text-ink-3">Pin this fingerprint in your loader, so a bundle signed by anyone else is refused.</span>
                      </>
                    ),
                  },
                  {
                    label: "Content key",
                    value: esc.sealedKeyPresent
                      ? "Held sealed by SCRIPT//GO. It is never in the bundle and never shown; a licensed, bound server gets it wrapped to its own key."
                      : "Not held by SCRIPT//GO: no server can be given a key for this release.",
                  },
                  {
                    label: "Files",
                    value: (
                      <span className="tabular">
                        {countOf(esc.encryptedFiles.length, "encrypted file")}, {countOf(esc.clearFiles.length, "clear file")}
                      </span>
                    ),
                  },
                  {
                    label: "Watermark",
                    value: esc.watermarked
                      ? "A release watermark is in the signed manifest, and each delivery is marked. Traceability, not prevention."
                      : "Each delivery is marked. Traceability, not prevention.",
                  },
                ]
              : []),
          ]}
        />
        {esc ? (
          <div className="mt-4 space-y-3">
            <div>
              <p className="font-mono text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">Left in clear text (allowlist)</p>
              <p className="mt-1 flex flex-wrap gap-1.5">
                {esc.allowlist.length ? (
                  esc.allowlist.map((g) => (
                    <Tag key={g} mono>
                      {g}
                    </Tag>
                  ))
                ) : (
                  <span className="text-[14px] text-ink-2">Only the manifest.</span>
                )}
              </p>
              <p className="mt-1.5 text-[13px] text-ink-3">Readable and editable. Everything else is encrypted.</p>
            </div>
            <FileList title={`Clear files (${esc.clearFiles.length})`} files={esc.clearFiles} />
            <FileList title={`Encrypted files (${esc.encryptedFiles.length}): names only`} files={esc.encryptedFiles} />
          </div>
        ) : null}
      </section>

      <section aria-labelledby="prot-envs">
        <h3 id="prot-envs" className="font-display text-[19px] font-extrabold">
          What your server gets, per environment
        </h3>
        {environments.length === 0 ? (
          <p className="mt-2 text-[14.5px] text-ink-2">This release declares no environment.</p>
        ) : (
          <div className="panel relative mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-[14px]">
              <caption className="sr-only">Protection of this release by environment</caption>
              <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-ink-3">
                <tr>
                  <th scope="col" className="px-3 py-2.5">Environment</th>
                  <th scope="col" className="px-3 py-2.5">Tier there</th>
                  <th scope="col" className="px-3 py-2.5">For this release</th>
                </tr>
              </thead>
              <tbody>
                {environments.map((e) => {
                  const p = e.protection;
                  if (!p) {
                    return (
                      <tr key={e.slug} className="border-t border-line-soft align-top">
                        <th scope="row" className="px-3 py-2.5 font-semibold">{e.name}</th>
                        <td className="px-3 py-2.5 text-ink-3" colSpan={2}>
                          Not reported for this environment.
                        </td>
                      </tr>
                    );
                  }
                  // A free package has no licence to check: say so instead of promising a check.
                  const b =
                    !paid && !esc && p.tier !== "none"
                      ? { label: "Free package", sentence: "No licence is needed. The registry's signature shows the release was not altered." }
                      : buyerProtection(p, Boolean(esc));
                  const lead = protectionLead(p);
                  return (
                    <tr key={e.slug} className="border-t border-line-soft align-top">
                      <th scope="row" className="whitespace-nowrap px-3 py-2.5">
                        <Link href={`/environments/${encodeURIComponent(e.slug)}#protection-title`} className="font-semibold hover:underline">
                          {e.name}
                        </Link>
                      </th>
                      <td className="px-3 py-2.5">
                        <StatusBadge meta={tierMeta[p.tier]} size="sm" />
                        {lead ? <span className="mt-1 block text-[12px] leading-snug text-ink-3">{lead}</span> : null}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-semibold">{b.label}.</span> <span className="text-ink-2">{b.sentence}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {!sig ? (
        <Banner tone="info" title="This release carries no registry signature.">
          It was published before release signing.
        </Banner>
      ) : null}

      <p className="max-w-[72ch] text-[13.5px] text-ink-3">
        Deterrence, traceability and revocation: only server scripts are protected, and a copy stays traceable.{" "}
        <Link href="/docs/protect-your-work#what-it-does-not-do" className="font-semibold text-cobalt-ink underline">
          What protection does and does not do
        </Link>
      </p>
    </div>
  );
}
