import type { Money, OfferInterval } from "./contract";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "8 Dec 2026" (UTC, as the brief requires). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "8 Dec 2026 09:12 UTC" */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${formatDate(iso)} ${hh}:${mm} UTC`;
}

/** "14 s ago", "3 d ago", "in 4 d". */
export function relativeTime(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return "never";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const diff = Math.round((now - t) / 1000);
  const abs = Math.abs(diff);
  const fmt = (n: number, u: string) => (diff >= 0 ? `${n} ${u} ago` : `in ${n} ${u}`);
  if (abs < 60) return fmt(abs, "s");
  if (abs < 3600) return fmt(Math.floor(abs / 60), "min");
  if (abs < 86400) return fmt(Math.floor(abs / 3600), "h");
  if (abs < 86400 * 60) return fmt(Math.floor(abs / 86400), "d");
  if (abs < 86400 * 730) return fmt(Math.floor(abs / (86400 * 30)), "mo");
  return fmt(Math.floor(abs / (86400 * 365)), "y");
}

const SYMBOLS: Record<string, string> = { EUR: "€", USD: "$", GBP: "£" };

/** Money in minor units → "€6" / "€6.50". */
export function formatMoney(m: Money | null | undefined): string {
  if (!m) return "—";
  const major = m.amount / 100;
  const digits = Number.isInteger(major) ? 0 : 2;
  const num = major.toFixed(digits);
  const sym = SYMBOLS[m.currency.toUpperCase()];
  return sym ? `${sym}${num}` : `${num} ${m.currency.toUpperCase()}`;
}

export function intervalSuffix(interval: OfferInterval): string {
  switch (interval) {
    case "month":
      return "/mo";
    case "year":
      return "/yr";
    case "perpetual":
      return " once";
    default:
      return "";
  }
}

export function intervalLabel(interval: OfferInterval): string {
  switch (interval) {
    case "month":
      return "Monthly";
    case "year":
      return "Annual";
    case "perpetual":
      return "Perpetual";
    default:
      return "Free";
  }
}

export function formatBytes(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KiB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MiB`;
}

export function formatCount(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("en-GB").format(n);
}

/** "1 creator", "3 creators": the count and the noun, plural when needed. */
export function countOf(n: number | null | undefined, singular: string, plural = `${singular}s`): string {
  return `${formatCount(n)} ${n === 1 ? singular : plural}`;
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export function shortHash(h: string | null | undefined, n = 12): string {
  if (!h) return "—";
  return h.length > n ? `${h.slice(0, n)}…` : h;
}

/** Monogram for an avatar: "VectorNine" → "VN", "kestrel" → "K". */
export function monogram(name: string): string {
  const caps = name.match(/[A-Z]/g);
  if (caps && caps.length >= 2) return (caps[0]! + caps[1]!).slice(0, 2);
  const words = name.split(/[\s_-]+/).filter(Boolean);
  if (words.length >= 2) return (words[0]![0]! + words[1]![0]!).toUpperCase();
  return (name[0] ?? "?").toUpperCase();
}
