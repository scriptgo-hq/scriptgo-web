import type { PackageVersion, ParsedManifest, Release, ReleaseProtection } from "./contract";
import type { StatusMeta } from "./status";

/**
 * What one release protects (ReleaseProtection, docs/spec/api.md), in plain words, for the package
 * page and the creator's release page. The detail lives in the docs: these sentences never name a
 * cipher, and never promise secrecy. The ceiling, stated on every row that encrypts something:
 * whoever runs the code (the server's operator, the player's game) can still read it with effort.
 */

/** Where the docs say what protection does and does not do. */
export const PROTECTION_LIMITS_DOC = "/docs/protect-your-work#what-it-does-not-do";
export const CLIENT_ESCROW_DOC = "/docs/protect-your-work#client-scripts-on-open77";

/**
 * The release's protection. An API older than SDK 0.1.12 sends no `protection`: then the server code
 * is read from `escrow` and the assets from `assets.escrow`, and client code is unknown (null).
 */
export function protectionOf(v: Pick<PackageVersion | Release, "escrow" | "assets"> & { protection?: ReleaseProtection | null }): ReleaseProtection {
  if (v.protection) return v.protection;
  return { serverCode: Boolean(v.escrow), clientCode: null, assets: v.assets?.escrow ?? null, perBuyerCopies: Boolean(v.assets) };
}

export type ProtectionRow = {
  id: "server" | "client" | "assets";
  label: string;
  meta: StatusMeta;
  /** This part is delivered encrypted. */
  encrypted: boolean;
  sentence: string;
};

const encrypted = (hint: string): StatusMeta => ({ label: "Encrypted", tone: "success", icon: "shield", hint });
const plain = (label: string, hint: string): StatusMeta => ({ label, tone: "neutral", icon: "minus", hint });

/**
 * One row per part of the release: server scripts, client scripts, assets. A part the release does
 * not have is left out when the manifest says so (`manifest` null: the rows are shown anyway, so
 * nothing protected is hidden). Assets appear only on a release that carries them.
 */
export function protectionRows(
  v: Pick<PackageVersion | Release, "escrow" | "assets"> & { protection?: ReleaseProtection | null },
  manifest: Pick<ParsedManifest, "serverScripts" | "clientScripts" | "sharedScripts" | "environmentScripts"> | null,
): ProtectionRow[] {
  const p = protectionOf(v);
  const rows: ProtectionRow[] = [];
  const envScripts = Object.values(manifest?.environmentScripts ?? {}).flat();
  const hasServer = !manifest || manifest.serverScripts.length > 0 || envScripts.length > 0 || p.serverCode;
  const hasClient = !manifest || manifest.clientScripts.length > 0 || p.clientCode !== null;

  if (hasServer) {
    rows.push(
      p.serverCode
        ? {
            id: "server",
            label: "Server scripts",
            encrypted: true,
            meta: encrypted("Delivered as an encrypted bundle. The key goes to a licensed, bound server only."),
            sentence: "Delivered encrypted. Only a server bound to a valid licence gets the key, and its operator could still read what it runs.",
          }
        : {
            id: "server",
            label: "Server scripts",
            encrypted: false,
            meta: plain("Not encrypted", "Delivered as plain files."),
            sentence: "Delivered as plain files.",
          },
    );
  }
  if (hasClient) {
    const c = p.clientCode;
    rows.push(
      c
        ? {
            id: "client",
            label: "Client scripts",
            encrypted: true,
            meta: encrypted("Sent to players compiled, never as source, and decrypted only inside the game."),
            sentence:
              "Players' games get them compiled, never as source, encrypted for each licensed server and decrypted only inside the game. " +
              "A decompiler can still turn them back into working logic, without the original local names or comments." +
              (c.lineNumbers === "creator_only" ? " Line numbers stay with the creator." : ""),
          }
        : {
            id: "client",
            label: "Client scripts",
            encrypted: false,
            meta: plain("Readable", "Sent to players as plain files."),
            sentence: "Sent to players as plain files, which they can read.",
          },
    );
  }
  if (v.assets || p.assets) {
    rows.push(
      p.assets
        ? {
            id: "assets",
            label: "Assets",
            encrypted: true,
            meta: encrypted("Encrypted for each licensed server, decrypted only inside the game client."),
            sentence:
              "Encrypted for each licensed server and decrypted only inside the game client. Each licence holder downloads their own fingerprinted copy, " +
              "and a player can still capture what their game loads.",
          }
        : {
            id: "assets",
            label: "Assets",
            encrypted: false,
            meta: { label: "Fingerprinted", tone: "info", icon: "check", hint: "Each licence holder downloads their own copy, with a signed record of their licence in it." },
            sentence:
              "Not encrypted. Its copies are licensed, fingerprinted and traceable: each licence holder downloads their own signed copy, " +
              "so a copy found elsewhere leads back to its licence.",
          },
    );
  }
  return rows;
}

/** True when anything in the release is encrypted (server code, client code or assets). */
export function anyEncrypted(p: ReleaseProtection): boolean {
  return p.serverCode || p.clientCode !== null || p.assets !== null;
}
