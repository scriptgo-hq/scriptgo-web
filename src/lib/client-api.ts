"use client";

import type { ErrorBody } from "./contract";

export type ClientResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number | null; code: string; message: string; details?: Record<string, unknown> };

/** Browser-side call through the same-origin /v1 rewrite (session cookie included). Never throws. */
export async function callApi<T>(method: string, path: string, body?: unknown): Promise<ClientResult<T>> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? { accept: "application/json" } : { accept: "application/json", "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return { ok: false, status: null, code: "api_unreachable", message: "The SCRIPT//GO API is not reachable. Nothing was changed." };
  }
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) {
    const e = (json as ErrorBody | null)?.error;
    return { ok: false, status: res.status, code: e?.code ?? `http_${res.status}`, message: e?.message ?? `Request failed (HTTP ${res.status}).`, details: e?.details };
  }
  return { ok: true, status: res.status, data: json as T };
}
