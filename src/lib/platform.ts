import { api } from "./api";
import type { Health } from "./contract";

/**
 * Whether this deployment delivers e-mail. Pages word their promises on it ("we sent you…",
 * "forgot your password?"), so the site never promises a message that cannot arrive.
 */
export async function mailEnabled(): Promise<boolean> {
  const r = await api<Health>("/v1/health", { timeoutMs: 3000 });
  return r.ok && r.data.mail === true;
}
