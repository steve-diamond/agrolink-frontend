"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./ui/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CommodityPrice {
  id: string;
  commodity: string;
  state: string;
  price: number;
  currency: string;
  unit: string;
  trend: "up" | "down" | "stable";
  change_percentage: number;
  /** Simulated 30-day price history (oldest → newest) */
  history?: number[];
}

// ── Static seed data (replaced by live API when available) ────────────────────

function seedHistory(base: number, trend: "up" | "down" | "stable"): number[] {
  const pts: number[] = [];
  let v = base * (trend === "up" ? 0.88 : trend === "down" ? 1.12 : 1);
  for (let i = 0; i < 30; i++) {
    const drift = trend === "up" ? 0.004 : trend === "down" ? -0.004 : 0;
    v = v * (1 + drift + (Math.random() - 0.5) * 0.03);
    pts.push(Math.round(v));
  }
  return pts;
}

const RAW_DATA: Omit<CommodityPrice, "id" | "history">[] = [
  { commodity: "Maize",      state: "Kano",        price: 47500,  currency: "₦", unit: "bag",   trend: "up",     change_percentage: 3.2  },
  { commodity: "Rice",       state: "Kebbi",       price: 88000,  currency: "₦", unit: "bag",   trend: "up",     change_percentage: 1.8  },
  { commodity: "Soybean",    state: "Kaduna",      price: 118000, currency: "₦", unit: "bag",   trend: "down",   change_percentage: -2.4 },
  { commodity: "Cassava",    state: "Oyo",         price: 19500,  currency: "₦", unit: "bag",   trend: "stable", change_percentage: 0.1  },
  { commodity: "Yam",        state: "Benue",       price: 37000,  currency: "₦", unit: "tuber", trend: "up",     change_percentage: 5.7  },
  { commodity: "Tomato",     state: "Katsina",     price: 11500,  currency: "₦", unit: "crate", trend: "down",   change_percentage: -6.2 },
  { commodity: "Groundnut",  state: "Kano",        price: 97000,  currency: "₦", unit: "bag",   trend: "up",     change_percentage: 2.1  },
  { commodity: "Sorghum",    state: "Plateau",     price: 54000,  currency: "₦", unit: "bag",   trend: "stable", change_percentage: 0.0  },
  { commodity: "Millet",     state: "Sokoto",      price: 49000,  currency: "₦", unit: "bag",   trend: "down",   change_percentage: -1.3 },
  { commodity: "Palm Oil",   state: "Cross River", price: 185000, currency: "₦", unit: "drum",  trend: "up",     change_percentage: 4.4  },
  { commodity: "Cocoa",      state: "Ondo",        price: 328000, currency: "₦", unit: "bag",   trend: "up",     change_percentage: 7.1  },
  { commodity: "Cotton",     state: "Zamfara",     price: 71000,  currency: "₦", unit: "bag",   trend: "down",   change_percentage: -3.8 },
  { commodity: "Cowpea",     state: "Bauchi",      price: 145000, currency: "₦", unit: "bag",   trend: "up",     change_percentage: 2.9  },
  { commodity: "Pepper",     state: "Kwara",       price: 22000,  currency: "₦", unit: "crate", trend: "up",     change_percentage: 8.3  },
  { commodity: "Sesame",     state: "Nasarawa",    price: 210000, currency: "₦", unit: "bag",   trend: "stable", change_percentage: 0.4  },
  { commodity: "Plantain",   state: "Edo",         price: 14000,  currency: "₦", unit: "crate", trend: "down",   change_percentage: -2.0 },
];

const SEED_DATA: CommodityPrice[] = RAW_DATA.map((r, i) => ({
  ...r,
  id: `commodity-${i}`,
  history: seedHistory(r.price, r.trend),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPrice(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toLocaleString()}`;
}

const trendColor = {
  up:     { text: "text-emerald-400", bg: "bg-emerald-500/15", badge: "text-emerald-300" },
  down:   { text: "text-red-400",     bg: "bg-red-500/15",     badge: "text-red-300"     },
  stable: { text: "text-gray-400",    bg: "bg-gray-500/15",    badge: "text-gray-300"    },
};

const TrendIcon: React.FC<{ trend: CommodityPrice["trend"] }> = ({ trend }) => {
  if (trend === "up")     return <span aria-label="price up"   className="text-emerald-400 font-bold">↑</span>;
  if (trend === "down")   return <span aria-label="price down" className="text-red-400 font-bold">↓</span>;
  return                         <span aria-label="stable"     className="text-gray-400">→</span>;
};

// ── Sparkline SVG ─────────────────────────────────────────────────────────────

function buildPath(values: number[], w: number, h: number): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: h - ((v - min) / range) * (h * 0.8) - h * 0.1,
  }));
  return pts.reduce(
    (acc, p, i) =>
      i === 0
        ? `M ${p.x.toFixed(1)},${p.y.toFixed(1)}`
        : `${acc} L ${p.x.toFixed(1)},${p.y.toFixed(1)}`,
    ""
  );
}

const Sparkline: React.FC<{
  values: number[];
  trend: CommodityPrice["trend"];
  width?: number;
  height?: number;
}> = ({ values, trend, width = 120, height = 40 }) => {
  if (!values.length) return null;
  const strokeColor =
    trend === "up" ? "#34d399" : trend === "down" ? "#f87171" : "#9ca3af";
  const path = buildPath(values, width, height);

  // Area fill path (close below the line)
  const areaPath =
    path +
    ` L ${width},${height + 2} L 0,${height + 2} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden
    >
      <defs>
        <linearGradient id={`sg-${trend}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={strokeColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0"   />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sg-${trend})`} />
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ── Price detail modal ────────────────────────────────────────────────────────

const DetailModal: React.FC<{
  item: CommodityPrice | null;
  onClose: () => void;
}> = ({ item, onClose }) => {
  React.useEffect(() => {
    if (!item) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [item, onClose]);

  React.useEffect(() => {
    if (item) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [item]);

  return (
    <AnimatePresence>
      {item && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${item.commodity} price details`}
        >
          {/* Backdrop */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet / Card */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative w-full sm:max-w-lg bg-gray-900 border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-white">{item.commodity}</h2>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                      trendColor[item.trend].bg,
                      trendColor[item.trend].badge
                    )}
                  >
                    <TrendIcon trend={item.trend} />
                    {Math.abs(item.change_percentage).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  {item.state} · per {item.unit}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
                  <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-6">
              {/* Price callout */}
              <div className="flex items-end gap-3">
                <span className={cn("text-4xl font-extrabold", trendColor[item.trend].text)}>
                  {fmtPrice(item.price)}
                </span>
                <span className="text-gray-400 text-sm pb-1.5">/ {item.unit}</span>
              </div>

              {/* 30-day chart */}
              {item.history && item.history.length > 1 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">30-Day Price Trend</p>
                  <div className="rounded-xl bg-white/5 border border-white/8 p-4 overflow-hidden">
                    <Sparkline
                      values={item.history}
                      trend={item.trend}
                      width={420}
                      height={80}
                    />
                    {/* X-axis labels */}
                    <div className="flex justify-between mt-2 text-[10px] text-gray-600">
                      <span>30d ago</span>
                      <span>15d ago</span>
                      <span>Today</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Current Price", value: fmtPrice(item.price) },
                  { label: "Change",        value: `${item.change_percentage > 0 ? "+" : ""}${item.change_percentage.toFixed(1)}%` },
                  { label: "30d Low",       value: item.history ? fmtPrice(Math.min(...item.history)) : "—" },
                  { label: "30d High",      value: item.history ? fmtPrice(Math.max(...item.history)) : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl bg-white/5 px-4 py-3">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a
                href="/marketplace"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Buy / Sell {item.commodity}
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ── Ticker pill ───────────────────────────────────────────────────────────────

const TickerPill: React.FC<{
  item: CommodityPrice;
  onClick: () => void;
}> = ({ item, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`${item.commodity}, ${item.state}, ${fmtPrice(item.price)} per ${item.unit}, ${item.trend}`}
    className={cn(
      "inline-flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-lg cursor-pointer select-none",
      "border border-transparent hover:border-white/20 hover:bg-white/10",
      "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
      "group"
    )}
  >
    {/* Name + state */}
    <span className="text-xs font-semibold text-white whitespace-nowrap">
      {item.commodity}
    </span>
    <span className="text-[10px] text-white/50 whitespace-nowrap">
      {item.state}
    </span>

    {/* Divider */}
    <span aria-hidden className="w-px h-3 bg-white/20 mx-0.5" />

    {/* Price */}
    <span className={cn("text-xs font-bold whitespace-nowrap", trendColor[item.trend].text)}>
      {fmtPrice(item.price)}/{item.unit}
    </span>

    {/* Trend badge */}
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap",
        trendColor[item.trend].bg,
        trendColor[item.trend].badge
      )}
    >
      <TrendIcon trend={item.trend} />
      {Math.abs(item.change_percentage).toFixed(1)}%
    </span>
  </button>
);

// ── Main component ────────────────────────────────────────────────────────────

export interface CommodityTickerProps {
  /** Override seed data with live prices */
  prices?: CommodityPrice[];
  className?: string;
  /** Initially expanded (shows full scrolling ticker bar) */
  defaultExpanded?: boolean;
}

/**
 * Sticky commodity price ticker with infinite scroll, state filter,
 * collapsible panel, and click-to-detail modal.
 */
export const CommodityTicker: React.FC<CommodityTickerProps> = ({
  prices: propPrices,
  className,
  defaultExpanded = false,
}) => {
  const [allPrices, setAllPrices] = React.useState<CommodityPrice[]>(
    propPrices ?? SEED_DATA
  );
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [paused, setPaused] = React.useState(false);
  const [filterState, setFilterState] = React.useState<string>("all");
  const [selected, setSelected] = React.useState<CommodityPrice | null>(null);

  // Fetch live prices if available
  React.useEffect(() => {
    if (propPrices) return;
    fetch("/api/prices")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.prices) && data.prices.length) {
          const mapped: CommodityPrice[] = data.prices.slice(0, 20).map(
            (p: Record<string, unknown>, i: number) => ({
              id: `live-${i}`,
              commodity: String(p.commodity_name ?? p.commodity ?? ""),
              state: String(p.state ?? ""),
              price: Number(p.price ?? 0),
              currency: "₦",
              unit: String(p.unit ?? "bag"),
              trend: (["up", "down", "stable"].includes(String(p.trend))
                ? p.trend
                : "stable") as CommodityPrice["trend"],
              change_percentage: Number(p.change_percentage ?? 0),
              history: seedHistory(Number(p.price ?? 0), "stable"),
            })
          );
          setAllPrices(mapped);
        }
      })
      .catch(() => {});
  }, [propPrices]);

  // Derived lists
  const states = React.useMemo(() => {
    const s = new Set(allPrices.map((p) => p.state));
    return ["all", ...Array.from(s).sort()];
  }, [allPrices]);

  const filtered = React.useMemo(
    () =>
      filterState === "all"
        ? allPrices
        : allPrices.filter((p) => p.state === filterState),
    [allPrices, filterState]
  );

  // Duplicate list for seamless loop; need at least 2 copies
  const loopItems = React.useMemo(
    () => [...filtered, ...filtered],
    [filtered]
  );

  const upCount   = allPrices.filter((p) => p.trend === "up").length;
  const downCount = allPrices.filter((p) => p.trend === "down").length;

  // Animation duration scales with item count (≈ 4 s per item, min 20 s)
  const duration = Math.max(20, filtered.length * 4);

  return (
    <>
      <div
        className={cn(
          "sticky top-0 z-30 w-full",
          "bg-gray-900/95 backdrop-blur-md border-b border-white/10",
          "shadow-[0_2px_16px_rgba(0,0,0,0.4)]",
          className
        )}
      >
        {/* ── Control bar ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-3 py-1.5">
          {/* Label */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Live Prices
            </span>
          </div>

          {/* Up / Down summary */}
          <div className="hidden sm:flex items-center gap-1.5 ml-1 shrink-0">
            <span className="text-[10px] font-semibold text-emerald-400">▲ {upCount}</span>
            <span className="text-[10px] font-semibold text-red-400">▼ {downCount}</span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* State filter */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  aria-label="Filter by state"
                  className={cn(
                    "text-[11px] text-white bg-white/10 border border-white/20 rounded-md px-2 py-1",
                    "focus:outline-none focus:ring-1 focus:ring-emerald-500",
                    "cursor-pointer appearance-none pr-5",
                    "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%239ca3af%22><path fill-rule=%22evenodd%22 d=%22M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z%22 clip-rule=%22evenodd%22/></svg>')] bg-no-repeat bg-position-[right_6px_center] bg-size-[12px]"
                  )}
                >
                  {states.map((s) => (
                    <option key={s} value={s} className="bg-gray-900">
                      {s === "all" ? "All States" : s}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle button */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? "Minimize price ticker" : "Expand price ticker"}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
          >
            <motion.svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-3.5"
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              aria-hidden
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </motion.svg>
            <span className="hidden sm:inline">{expanded ? "Minimize" : "Expand"}</span>
          </button>
        </div>

        {/* ── Scrolling ticker ─────────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="ticker"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden border-t border-white/8"
            >
              <div
                className="relative overflow-hidden py-2 cursor-default"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
              >
                {/* Left / right fade masks */}
                <div aria-hidden className="absolute left-0 top-0 bottom-0 w-12 bg-linear-to-r from-gray-900/95 to-transparent z-10 pointer-events-none" />
                <div aria-hidden className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-gray-900/95 to-transparent z-10 pointer-events-none" />

                {/* The scrolling track — pure CSS transform for GPU compositing */}
                <div
                  className={cn(
                    "flex items-center gap-1 [animation-name:commodityScroll] [animation-timing-function:linear] [animation-iteration-count:infinite]",
                    paused
                      ? "[animation-play-state:paused]"
                      : "[animation-play-state:running]"
                  )}
                  // eslint-disable-next-line react/forbid-component-props
                  style={{ "--ticker-duration": `${duration}s` } as React.CSSProperties}
                  aria-label="Commodity prices"
                >
                  {loopItems.map((item, idx) => (
                    <React.Fragment key={`${item.id}-${idx}`}>
                      <TickerPill item={item} onClick={() => setSelected(item)} />
                      {/* Separator */}
                      <span aria-hidden className="text-white/15 text-lg select-none shrink-0">·</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyframes injected once */}
        <style>{`
          @keyframes commodityScroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          [style*="--ticker-duration"] {
            animation-duration: var(--ticker-duration, 40s);
          }
        `}</style>
      </div>

      {/* ── Detail modal ─────────────────────────────────────────────────────── */}
      <DetailModal item={selected} onClose={() => setSelected(null)} />
    </>
  );
};

export default CommodityTicker;
