import pkg from "../../package.json" with { type: "json" };

/**
 * The public SDK repository (scriptgo-hq/scriptgo-sdk, MIT) and the tag this site is built from.
 * Only the SDK is linked from the site: the platform's own repository is private.
 */
export const SDK_REPO = "https://github.com/scriptgo-hq/scriptgo-sdk";
export const SDK_TAG: string = (pkg as { scriptgo: { sdk: string } }).scriptgo.sdk;
export const SDK_RELEASES = `${SDK_REPO}/releases`;
export const SDK_LICENSE = `${SDK_REPO}/blob/${SDK_TAG}/LICENSE`;

/** A file of the SDK at the pinned tag. */
export function sdkFileUrl(repoPath: string): string {
  return `${SDK_REPO}/blob/${SDK_TAG}/${repoPath}`;
}
/** A folder of the SDK at the pinned tag. */
export function sdkTreeUrl(repoPath: string): string {
  return `${SDK_REPO}/tree/${SDK_TAG}/${repoPath}`;
}
/** Where to suggest a change to a file: its edit page on main, where changes land. */
export function sdkEditUrl(repoPath: string): string {
  return `${SDK_REPO}/edit/main/${repoPath}`;
}
/** A platform's adapter folder (the .NET kit is not under sdk/adapters). */
export function adapterPath(slug: string): string {
  return slug === "dotnet" ? "sdk/dotnet" : `sdk/adapters/${slug}`;
}
