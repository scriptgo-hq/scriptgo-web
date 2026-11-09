import { cookies } from "next/headers";
import { connection } from "next/server";
import type { ErrorBody as ApiErrorBody } from "./contract";

/** Base URL for server-side calls. The browser uses same-origin `/v1/*` through Next rewrites. */
export const API_URL = (process.env.API_URL ?? "http://localhost:4100").replace(/\/+$/, "");

export type ApiFailure =
  | { ok: false; kind: "unreachable"; status: null; code: "api_unreachable"; message: string }
  | { ok: false; kind: "http"; status: number; code: string; message: string; details?: Record<string, unknown> };

export type ApiResult<T> = { ok: true; status: number; data: T } | ApiFailure;

interface ApiOptions {
  /** Forward the visitor's session cookie (account, creator and admin endpoints). */
  auth?: boolean;
  method?: string;
  body?: unknown;
  /** Abort after this many milliseconds (default 8 s). */
  timeoutMs?: number;
}

/**
 * Server-side API call. Never throws: callers render an explicit error state from the failure.
 * Always dynamic — pages backed by the API are rendered per request and never baked at build time.
 */
export async function api<T>(path: string, opts: ApiOptions = {}): Promise<ApiResult<T>> {
  await connection();
  const headers: Record<string, string> = { accept: "application/json" };
  if (opts.auth) {
    const jar = await cookies();
    const cookieHeader = jar
      .getAll()
      .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
      .join("; ");
    if (cookieHeader) headers.cookie = cookieHeader;
  }
  let body: string | undefined;
  if (opts.body !== undefined) {
    headers["content-type"] = "application/json";
    body = JSON.stringify(opts.body);
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(opts.timeoutMs ?? 8000),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      kind: "unreachable",
      status: null,
      code: "api_unreachable",
      message: `The SCRIPT//GO API did not answer (${reason}).`,
    };
  }
  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }
  if (!res.ok) {
    const e = (json as ApiErrorBody | null)?.error;
    return {
      ok: false,
      kind: "http",
      status: res.status,
      code: e?.code ?? `http_${res.status}`,
      message: e?.message ?? `The API answered ${res.status} ${res.statusText}.`,
      details: e?.details,
    };
  }
  return { ok: true, status: res.status, data: json as T };
}

/** Build a query string from defined, non-empty values. */
export function qs(params: Record<string, string | number | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** List endpoints may answer an array or a Page; accept both. */
export function asList<T>(data: T[] | { items: T[] } | null | undefined): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.items ?? []);
}
