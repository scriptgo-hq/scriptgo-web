"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Series } from "@/lib/contract";

const HEIGHT = 180;
const PAD = { top: 12, right: 12, bottom: 26, left: 44 };

function niceMax(v: number): number {
  if (v <= 4) return 4;
  const mag = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * mag >= v) return m * mag;
  return 10 * mag;
}

function tickLabel(v: number, max: number): string {
  if (max >= 10_000) return v >= 1000 ? `${Math.round(v / 100) / 10}K`.replace(".0K", "K") : String(v);
  return v.toLocaleString("en-GB");
}

function shortDate(d: string): string {
  const t = Date.parse(d.length === 10 ? `${d}T00:00:00Z` : d);
  if (Number.isNaN(t)) return d;
  return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

/**
 * One series over time: 2px line over a 10% wash, hairline grid, crosshair + tooltip that snaps to the
 * nearest day. Keyboard: focus the chart, then ← → Home End move the readout.
 */
export function SeriesChart({ series, label }: { series: Series; label: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);
  const tipId = useId();
  const pts = series.points;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(240, Math.round(e!.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geo = useMemo(() => {
    const max = niceMax(Math.max(0, ...pts.map((p) => p.value)));
    const iw = width - PAD.left - PAD.right;
    const ih = HEIGHT - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (pts.length <= 1 ? iw / 2 : (i / (pts.length - 1)) * iw);
    const y = (v: number) => PAD.top + ih - (v / max) * ih;
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join("");
    const area = pts.length ? `${line}L${x(pts.length - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z` : "";
    const ticks = [0, max / 2, max];
    return { max, x, y, line, area, ticks, iw };
  }, [pts, width]);

  function nearest(clientX: number) {
    const el = wrap.current;
    if (!el || pts.length === 0) return;
    const rel = clientX - el.getBoundingClientRect().left - PAD.left;
    const i = pts.length <= 1 ? 0 : Math.round((rel / geo.iw) * (pts.length - 1));
    setActive(Math.max(0, Math.min(pts.length - 1, i)));
  }

  function onKey(e: React.KeyboardEvent) {
    if (!pts.length) return;
    const cur = active ?? pts.length - 1;
    const next = e.key === "ArrowLeft" ? cur - 1 : e.key === "ArrowRight" ? cur + 1 : e.key === "Home" ? 0 : e.key === "End" ? pts.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    setActive(Math.max(0, Math.min(pts.length - 1, next)));
  }

  const a = active !== null ? pts[active] : undefined;
  const ax = active !== null ? geo.x(active) : 0;
  const xLabels = pts.length ? [0, Math.floor((pts.length - 1) / 2), pts.length - 1].filter((v, i, arr) => arr.indexOf(v) === i) : [];

  return (
    <div
      ref={wrap}
      className="relative select-none rounded-lg outline-offset-4"
      tabIndex={0}
      role="group"
      aria-label={`${label}, daily values. Use the left and right arrow keys to read each day.`}
      aria-describedby={tipId}
      onPointerMove={(e) => nearest(e.clientX)}
      onPointerLeave={() => setActive(null)}
      onFocus={() => setActive((v) => v ?? (pts.length ? pts.length - 1 : null))}
      onBlur={() => setActive(null)}
      onKeyDown={onKey}
    >
      <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} className="block h-auto max-w-full" aria-hidden="true">
        {geo.ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={geo.y(t)} y2={geo.y(t)} stroke="var(--line-soft)" strokeWidth={1} shapeRendering="crispEdges" />
            <text x={PAD.left - 8} y={geo.y(t)} dy="0.32em" textAnchor="end" className="tabular fill-[var(--ink-3)] text-[11px]">
              {tickLabel(t, geo.max)}
            </text>
          </g>
        ))}
        {xLabels.map((i, n) => (
          <text
            key={i}
            x={geo.x(i)}
            y={HEIGHT - 6}
            textAnchor={n === 0 ? "start" : n === xLabels.length - 1 ? "end" : "middle"}
            className="tabular fill-[var(--ink-3)] text-[11px]"
          >
            {shortDate(pts[i]!.date)}
          </text>
        ))}
        {pts.length ? (
          <>
            <path d={geo.area} fill="var(--cobalt)" fillOpacity={0.1} />
            <path d={geo.line} fill="none" stroke="var(--cobalt)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {a ? null : <circle cx={geo.x(pts.length - 1)} cy={geo.y(pts[pts.length - 1]!.value)} r={4} fill="var(--cobalt)" stroke="var(--surface)" strokeWidth={2} />}
          </>
        ) : null}
        {a ? (
          <>
            <line x1={ax} x2={ax} y1={PAD.top} y2={HEIGHT - PAD.bottom} stroke="var(--ink-3)" strokeWidth={1} shapeRendering="crispEdges" />
            <circle cx={ax} cy={geo.y(a.value)} r={4.5} fill="var(--cobalt)" stroke="var(--surface)" strokeWidth={2} />
          </>
        ) : null}
      </svg>
      <div
        id={tipId}
        aria-live="polite"
        className={a ? "pointer-events-none absolute top-0 rounded-lg border-2 border-line bg-surface px-2.5 py-1.5 shadow-[2px_2px_0_0_var(--shadow)]" : "sr-only"}
        style={a ? { left: Math.min(Math.max(ax - 60, 0), width - 128), width: 120 } : undefined}
      >
        {a ? (
          <>
            <span className="tabular block text-[15px] font-bold text-ink">{a.value.toLocaleString("en-GB")}</span>
            <span className="flex items-center gap-1.5 text-[12px] text-ink-3">
              <span aria-hidden="true" className="inline-block h-[2px] w-3 rounded bg-cobalt" />
              {shortDate(a.date)}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
