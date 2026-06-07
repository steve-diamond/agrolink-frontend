"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ReferenceLine,
  LabelList,
} from "recharts";
import {
  FiDownload,
  FiFileText,
  FiBarChart2,
  FiMapPin,
  FiUsers,
  FiPackage,
  FiAlertTriangle,
  FiCalendar,
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";

// ─── Brand palette ────────────────────────────────────────────────────────────

const GREEN = "#16a34a";
const GREEN_LIGHT = "#86efac";
const ORANGE = "#ea580c";
const TEAL = "#0891b2";
const AMBER = "#d97706";
const RED = "#dc2626";
const SLATE = "#475569";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuickPeriod = "week" | "month" | "quarter";

interface SalesPoint {
  label: string;
  volumeCurrent: number;
  revenueCurrent: number;
  volumePrev: number;
  revenuePrev: number;
}

interface ProductItem {
  name: string;
  revenue: number;
  volume: number;
  growth: number;
}

interface GeoItem {
  state: string;
  buyers: number;
  revenue: number;
  pct: number;
}

interface BuyerTypeItem {
  name: string;
  value: number;
  color: string;
  dotClass: string;
}

interface InventoryItem {
  product: string;
  stock: number;
  capacity: number;
  unit: string;
  alert: boolean;
}

interface ForecastPoint {
  month: string;
  actual: number | null;
  forecast: number | null;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const SALES_DATA: SalesPoint[] = [
  { label: "Wk 1", volumeCurrent: 1200, revenueCurrent: 320000, volumePrev: 1000, revenuePrev: 280000 },
  { label: "Wk 2", volumeCurrent: 1850, revenueCurrent: 415000, volumePrev: 1600, revenuePrev: 360000 },
  { label: "Wk 3", volumeCurrent: 1400, revenueCurrent: 380000, volumePrev: 1300, revenuePrev: 340000 },
  { label: "Wk 4", volumeCurrent: 2200, revenueCurrent: 520000, volumePrev: 1900, revenuePrev: 460000 },
];

const TOP_PRODUCTS: ProductItem[] = [
  { name: "Organic Maize", revenue: 820000, volume: 3200, growth: 18.5 },
  { name: "Cassava Flour", revenue: 640000, volume: 2100, growth: 12.3 },
  { name: "Palm Oil", revenue: 580000, volume: 890, growth: -4.2 },
  { name: "Yam (Tubers)", revenue: 460000, volume: 1800, growth: 7.8 },
  { name: "Groundnuts", revenue: 340000, volume: 2400, growth: 22.1 },
];

const GEO_DATA: GeoItem[] = [
  { state: "Lagos", buyers: 124, revenue: 520000, pct: 28 },
  { state: "Abuja (FCT)", buyers: 98, revenue: 410000, pct: 22 },
  { state: "Kano", buyers: 87, revenue: 360000, pct: 19 },
  { state: "Ibadan", buyers: 65, revenue: 280000, pct: 14 },
  { state: "Port Harcourt", buyers: 54, revenue: 240000, pct: 12 },
  { state: "Enugu", buyers: 48, revenue: 210000, pct: 11 },
  { state: "Benin City", buyers: 42, revenue: 180000, pct: 9 },
  { state: "Kaduna", buyers: 38, revenue: 160000, pct: 8 },
];

const BUYER_TYPES: BuyerTypeItem[] = [
  { name: "Retail", value: 45, color: GREEN, dotClass: "bg-green-600" },
  { name: "Wholesale", value: 35, color: TEAL, dotClass: "bg-cyan-600" },
  { name: "Processors", value: 20, color: ORANGE, dotClass: "bg-orange-600" },
];

const INVENTORY_DATA: InventoryItem[] = [
  { product: "Organic Maize", stock: 78, capacity: 100, unit: "bags", alert: false },
  { product: "Cassava Flour", stock: 22, capacity: 100, unit: "kg", alert: true },
  { product: "Palm Oil", stock: 15, capacity: 100, unit: "jerry cans", alert: true },
  { product: "Yam (Tubers)", stock: 62, capacity: 100, unit: "tubers", alert: false },
  { product: "Groundnuts", stock: 8, capacity: 100, unit: "bags", alert: true },
];

const FORECAST_DATA: ForecastPoint[] = [
  { month: "Feb", actual: 1200, forecast: null },
  { month: "Mar", actual: 1450, forecast: null },
  { month: "Apr", actual: 1380, forecast: null },
  { month: "May", actual: 1640, forecast: 1640 },
  { month: "Jun", actual: null, forecast: 1760 },
  { month: "Jul", actual: null, forecast: 1920 },
  { month: "Aug", actual: null, forecast: 2080 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return `₦${n.toLocaleString("en-NG")}`;
}

function fmtShort(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${Math.round(n / 1_000)}K`;
  return `₦${n}`;
}

function gaugeColor(pct: number): string {
  if (pct <= 20) return RED;
  if (pct <= 40) return ORANGE;
  if (pct <= 65) return AMBER;
  return GREEN;
}

function buildCSV(sections: { title: string; headers: string[]; rows: (string | number)[][] }[]): string {
  return sections
    .map(({ title, headers, rows }) =>
      [title, headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    )
    .join("\n\n");
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** SVG semi-circle gauge — no recharts dependency needed */
function GaugeChart({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = gaugeColor(pct);
  const cx = 70;
  const cy = 70;
  const r = 52;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const angle = (pct / 100) * 180; // 0–180°

  // Background arc: 180→0 (left to right)
  const bgX1 = cx - r;
  const bgY1 = cy;
  const bgX2 = cx + r;
  const bgY2 = cy;

  // Foreground arc endpoint
  const fgDeg = 180 - angle;
  const fgX2 = cx + r * Math.cos(toRad(fgDeg));
  const fgY2 = cy - r * Math.sin(toRad(fgDeg));

  const largeArc = angle > 180 ? 1 : 0;
  const bgPath = `M ${bgX1} ${bgY1} A ${r} ${r} 0 0 1 ${bgX2} ${bgY2}`;
  const fgPath =
    pct > 0
      ? `M ${bgX1} ${bgY1} A ${r} ${r} 0 ${largeArc} 1 ${fgX2} ${fgY2}`
      : "";

  return (
    <svg viewBox="0 0 140 82" className="w-full max-w-35 mx-auto" aria-hidden="true">
      <path d={bgPath} fill="none" stroke="#e5e7eb" strokeWidth="13" strokeLinecap="round" />
      {fgPath && (
        <path
          d={fgPath}
          fill="none"
          stroke={color}
          strokeWidth="13"
          strokeLinecap="round"
        />
      )}
      <text
        x="70"
        y="68"
        textAnchor="middle"
        fontSize="17"
        fontWeight="700"
        fill="#111827"
        fontFamily="Inter, sans-serif"
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

interface SalesTipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  compareMode: boolean;
}

function SalesTooltip({ active, payload, label, compareMode }: SalesTipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3 text-sm min-w-44">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((e) => {
        const isRevenue = e.name.toLowerCase().includes("revenue");
        const isPrev = e.name.toLowerCase().includes("prev");
        return (
          <div key={e.name} className="flex justify-between gap-3 mb-1">
            <span className="text-gray-500 text-xs">
              {isRevenue ? "Revenue" : "Volume"}{" "}
              {compareMode ? (isPrev ? "(Prev)" : "(Cur)") : ""}
            </span>
            <span
              className={`font-semibold text-xs ${
                isPrev
                  ? isRevenue ? "text-slate-600" : "text-gray-400"
                  : isRevenue ? "text-green-700" : "text-green-500"
              }`}
            >
              {isRevenue ? fmtShort(e.value) : `${e.value.toLocaleString()} kg`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface ProductTipProps {
  active?: boolean;
  payload?: Array<{ payload: ProductItem }>;
}

function ProductTooltip({ active, payload }: ProductTipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3 text-sm min-w-44">
      <p className="font-semibold text-gray-800 mb-2">{d.name}</p>
      <div className="space-y-1">
        <Row label="Revenue" value={fmt(d.revenue)} />
        <Row label="Volume" value={`${d.volume.toLocaleString()} kg`} />
        <Row
          label="Growth"
          value={`${d.growth > 0 ? "+" : ""}${d.growth}%`}
          valueClass={d.growth >= 0 ? "text-green-600" : "text-red-500"}
        />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = "text-gray-900",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-400 text-xs">{label}</span>
      <span className={`text-xs font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

interface SectionCardProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}

function SectionCard({ id, title, subtitle, icon, children, action }: SectionCardProps) {
  return (
    <section
      id={id}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-green-50 rounded-xl text-green-700">{icon}</div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const dashboardRef = useRef<HTMLDivElement>(null);

  // ── State ────────────────────────────────────────────────────────────────
  const [quickPeriod, setQuickPeriod] = useState<QuickPeriod>("month");
  const [compareMode, setCompareMode] = useState(false);
  const [dateRange, setDateRange] = useState({ from: "2026-05-01", to: "2026-05-23" });
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // ── Derived ──────────────────────────────────────────────────────────────
  const salesSummary = useMemo(() => {
    const totRev = SALES_DATA.reduce((s, d) => s + d.revenueCurrent, 0);
    const prevRev = SALES_DATA.reduce((s, d) => s + d.revenuePrev, 0);
    const totVol = SALES_DATA.reduce((s, d) => s + d.volumeCurrent, 0);
    const prevVol = SALES_DATA.reduce((s, d) => s + d.volumePrev, 0);
    return {
      revenue: totRev,
      revenueChange: (((totRev - prevRev) / prevRev) * 100).toFixed(1),
      volume: totVol,
      volumeChange: (((totVol - prevVol) / prevVol) * 100).toFixed(1),
    };
  }, []);

  const totalBuyers = GEO_DATA.reduce((s, d) => s + d.buyers, 0);
  const lowStockItems = INVENTORY_DATA.filter((i) => i.alert);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleExportPDF = useCallback(() => {
    window.print();
  }, []);

  const handleExportCSV = useCallback(() => {
    const csv = buildCSV([
      {
        title: "Sales Performance",
        headers: ["Week", "Revenue (Current)", "Volume (Current)", "Revenue (Prev)", "Volume (Prev)"],
        rows: SALES_DATA.map((d) => [
          d.label,
          d.revenueCurrent,
          d.volumeCurrent,
          d.revenuePrev,
          d.volumePrev,
        ]),
      },
      {
        title: "Top Products",
        headers: ["Product", "Revenue (NGN)", "Volume (kg)", "Growth (%)"],
        rows: TOP_PRODUCTS.map((p) => [p.name, p.revenue, p.volume, p.growth]),
      },
      {
        title: "Geographic Distribution",
        headers: ["State", "Buyers", "Revenue (NGN)", "Share (%)"],
        rows: GEO_DATA.map((g) => [g.state, g.buyers, g.revenue, g.pct]),
      },
      {
        title: "Buyer Types",
        headers: ["Type", "Share (%)"],
        rows: BUYER_TYPES.map((b) => [b.name, b.value]),
      },
      {
        title: "Inventory Status",
        headers: ["Product", "Stock (%)", "Alert"],
        rows: INVENTORY_DATA.map((i) => [i.product, i.stock, i.alert ? "Low Stock" : "OK"]),
      },
      {
        title: "Demand Forecast",
        headers: ["Month", "Actual Units", "Forecast Units"],
        rows: FORECAST_DATA.map((f) => [f.month, f.actual ?? "", f.forecast ?? ""]),
      },
    ]);
    downloadBlob(csv, `agrolink-analytics-${dateRange.from}-to-${dateRange.to}.csv`, "text/csv");
  }, [dateRange]);

  const quickPeriodLabels: Record<QuickPeriod, string> = {
    week: "This Week",
    month: "This Month",
    quarter: "Last 3 Months",
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      ref={dashboardRef}
      className="min-h-screen bg-gray-50 print:bg-white"
    >
      {/* Print-only header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-xl font-bold">AgroLink — Analytics Report</h1>
        <p className="text-sm text-gray-500">
          {dateRange.from} to {dateRange.to}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ── Dashboard Header ──────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Insights into your farm performance</p>
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:border-green-400 text-gray-700 hover:text-green-700 rounded-xl text-sm font-medium transition-colors shadow-sm"
              title="Export all data as CSV (opens in Excel)"
            >
              <FiDownload size={14} />
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              title="Print / Save as PDF"
            >
              <FiFileText size={14} />
              Export PDF
            </button>
          </div>
        </header>

        {/* ── Date range & period controls ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 print:hidden">
          {/* Quick period pills */}
          <div className="flex gap-1.5">
            {(["week", "month", "quarter"] as QuickPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setQuickPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  quickPeriod === p
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {quickPeriodLabels[p]}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-gray-200" />

          {/* Custom date inputs */}
          <div className="flex items-center gap-2 flex-wrap">
            <FiCalendar size={14} className="text-gray-400 shrink-0" />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange((r) => ({ ...r, from: e.target.value }))
                }
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                aria-label="Start date"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange((r) => ({ ...r, to: e.target.value }))
                }
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                aria-label="End date"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-gray-200" />

          {/* Compare toggle */}
          <button
            onClick={() => setCompareMode((v) => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              compareMode
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
            data-active={compareMode}
          >
            {compareMode ? (
              <FiToggleRight size={16} className="text-green-600" />
            ) : (
              <FiToggleLeft size={16} />
            )}
            Compare periods
          </button>

          {/* Refresh hint */}
          <button
            className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            title="Data last updated: today"
            aria-label="Refresh data"
          >
            <FiRefreshCw size={13} />
            Refresh
          </button>
        </div>

        {/* ── Summary KPI strip ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total Revenue",
              value: fmtShort(salesSummary.revenue),
              change: Number(salesSummary.revenueChange),
              sub: "this period",
            },
            {
              label: "Total Volume",
              value: `${salesSummary.volume.toLocaleString()} kg`,
              change: Number(salesSummary.volumeChange),
              sub: "units sold",
            },
            {
              label: "Total Buyers",
              value: totalBuyers.toString(),
              change: 8.4,
              sub: "unique buyers",
            },
            {
              label: "Low Stock Alerts",
              value: lowStockItems.length.toString(),
              change: 0,
              sub: `${lowStockItems.map((i) => i.product.split(" ")[0]).join(", ")}`,
              warn: lowStockItems.length > 0,
            },
          ].map((k) => (
            <div
              key={k.label}
              className={`bg-white rounded-xl border shadow-sm px-4 py-3.5 ${
                k.warn ? "border-red-200 bg-red-50/40" : "border-gray-100"
              }`}
            >
              <p className="text-xs text-gray-400 mb-1">{k.label}</p>
              <p
                className={`text-xl font-bold ${k.warn ? "text-red-600" : "text-gray-900"}`}
              >
                {k.value}
              </p>
              {k.change !== 0 ? (
                <div
                  className={`flex items-center gap-0.5 mt-1 text-xs font-medium ${
                    k.change > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {k.change > 0 ? (
                    <FiTrendingUp size={11} />
                  ) : (
                    <FiTrendingDown size={11} />
                  )}
                  {Math.abs(k.change)}% vs last period
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-1 truncate">{k.sub}</p>
              )}
            </div>
          ))}
        </div>

        {/* ── 1. Sales Performance ──────────────────────────────────────────── */}
        <SectionCard
          id="section-sales"
          title="Sales Performance"
          subtitle={`${quickPeriodLabels[quickPeriod]}${compareMode ? " vs previous" : ""}`}
          icon={<FiBarChart2 size={17} />}
        >
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={SALES_DATA}
              margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              {/* Left axis: volume */}
              <YAxis
                yAxisId="vol"
                orientation="left"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}t`}
                width={40}
              />
              {/* Right axis: revenue */}
              <YAxis
                yAxisId="rev"
                orientation="right"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => fmtShort(v)}
                width={56}
              />
              <Tooltip
                content={
                  <SalesTooltip compareMode={compareMode} />
                }
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "14px" }}
                formatter={(value: string) => {
                  const map: Record<string, string> = {
                    volumeCurrent: "Volume (Current)",
                    revenueCurrent: "Revenue (Current)",
                    volumePrev: "Volume (Prev)",
                    revenuePrev: "Revenue (Prev)",
                  };
                  return map[value] ?? value;
                }}
              />

              {/* Current period bars */}
              <Bar
                yAxisId="vol"
                dataKey="volumeCurrent"
                fill={GREEN_LIGHT}
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
              {/* Previous period bars */}
              {compareMode && (
                <Bar
                  yAxisId="vol"
                  dataKey="volumePrev"
                  fill="#d1d5db"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              )}
              {/* Current revenue line */}
              <Line
                yAxisId="rev"
                type="monotone"
                dataKey="revenueCurrent"
                stroke={GREEN}
                strokeWidth={2.5}
                dot={{ r: 4, fill: GREEN, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              {/* Previous revenue line */}
              {compareMode && (
                <Line
                  yAxisId="rev"
                  type="monotone"
                  dataKey="revenuePrev"
                  stroke={SLATE}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{ r: 3, fill: SLATE, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>

          {/* Compare period summary */}
          {compareMode && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Revenue Δ",
                  value: `+${salesSummary.revenueChange}%`,
                  positive: true,
                },
                {
                  label: "Volume Δ",
                  value: `+${salesSummary.volumeChange}%`,
                  positive: true,
                },
                { label: "Best Week", value: "Week 4", positive: true },
                { label: "Peak Revenue", value: fmtShort(520000), positive: true },
              ].map((c) => (
                <div
                  key={c.label}
                  className="bg-green-50 rounded-xl px-3 py-2.5 text-center border border-green-100"
                >
                  <p className="text-xs text-gray-500">{c.label}</p>
                  <p className="text-base font-bold text-green-700 mt-0.5">
                    {c.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── 2. Product Performance ────────────────────────────────────────── */}
        <SectionCard
          id="section-products"
          title="Product Performance"
          subtitle="Top 5 products by revenue — hover for details"
          icon={<FiPackage size={17} />}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Horizontal bar chart */}
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  layout="vertical"
                  data={TOP_PRODUCTS}
                  margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => fmtShort(v)}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#374151" }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip content={<ProductTooltip />} />
                  <Bar
                    dataKey="revenue"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={22}
                  >
                    {TOP_PRODUCTS.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? GREEN : index === 1 ? TEAL : index === 2 ? AMBER : "#94a3b8"}
                      />
                    ))}
                    <LabelList
                      dataKey="revenue"
                      position="right"
                      formatter={(v) => fmtShort(Number(v))}
                      style={{ fontSize: "11px", fill: "#6b7280", fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Rank table */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Rankings
              </p>
              {TOP_PRODUCTS.map((p, i) => (
                <div
                  key={p.name}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 hover:bg-gray-100 transition-colors"
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                      i === 0
                        ? "bg-yellow-400"
                        : i === 1
                        ? "bg-gray-400"
                        : i === 2
                        ? "bg-orange-400"
                        : "bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400">{fmtShort(p.revenue)}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      p.growth >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {p.growth > 0 ? "+" : ""}
                    {p.growth}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ── 3. Geographic Distribution ────────────────────────────────────── */}
        <SectionCard
          id="section-geo"
          title="Geographic Distribution"
          subtitle="Where your buyers are located"
          icon={<FiMapPin size={17} />}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* State bar chart */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Buyers by State
              </p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  layout="vertical"
                  data={GEO_DATA}
                  margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="state"
                    tick={{ fontSize: 11, fill: "#374151" }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "buyers"
                        ? `${Number(value)} buyers`
                        : fmtShort(Number(value)),
                      name === "buyers" ? "Buyers" : "Revenue",
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="buyers" radius={[0, 6, 6, 0]} maxBarSize={18}>
                    {GEO_DATA.map((_, i) => (
                      <Cell
                        key={`geo-${i}`}
                        fill={`rgba(22, 163, 74, ${1 - i * 0.1})`}
                      />
                    ))}
                    <LabelList
                      dataKey="buyers"
                      position="right"
                      style={{ fontSize: "11px", fill: "#6b7280", fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Heat table */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                State Breakdown
              </p>
              <div className="space-y-2">
                {GEO_DATA.map((g) => (
                  <div key={g.state} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">{g.state}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{g.buyers} buyers</span>
                        <span className="text-xs font-semibold text-gray-700">
                          {fmtShort(g.revenue)}
                        </span>
                        <span className="text-xs text-green-700 font-semibold w-8 text-right">
                          {g.pct}%
                        </span>
                      </div>
                    </div>
                    {/* Heat bar — segmented to avoid inline styles */}
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: 10 }).map((_, seg) => (
                        <div
                          key={seg}
                          className={`h-1.5 flex-1 rounded-sm transition-colors ${
                            seg < Math.round(g.pct / 10)
                              ? seg < 2
                                ? "bg-green-700"
                                : seg < 5
                                ? "bg-green-500"
                                : "bg-green-300"
                              : "bg-gray-100"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-sm">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="font-bold text-gray-900">
                  {totalBuyers} buyers across {GEO_DATA.length} states
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 4. Customer Insights ──────────────────────────────────────────── */}
        <SectionCard
          id="section-customers"
          title="Customer Insights"
          subtitle="Buyer behaviour and satisfaction metrics"
          icon={<FiUsers size={17} />}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: KPI cards */}
            <div className="space-y-3">
              {/* Repeat buyer rate */}
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Repeat Buyer Rate
                  </span>
                  <FiTrendingUp className="text-green-600" size={14} />
                </div>
                <p className="text-3xl font-bold text-green-700">68%</p>
                <div className="h-2 bg-green-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full w-[68%] bg-green-500 rounded-full" />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">+5.3% vs last period</p>
              </div>

              {/* Avg order value */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Avg. Order Value
                  </span>
                  <span className="text-xs font-bold text-blue-600">AOV</span>
                </div>
                <p className="text-3xl font-bold text-blue-700">₦74,500</p>
                <p className="text-xs text-gray-400 mt-1.5">Across 537 orders this period</p>
              </div>

              {/* NPS */}
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Customer Satisfaction (NPS)
                  </span>
                  <span className="text-xs font-bold text-purple-600">NPS</span>
                </div>
                <div className="flex items-end gap-3">
                  <p className="text-3xl font-bold text-purple-700">72</p>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={`text-sm ${s <= 4 ? "text-yellow-400" : "text-gray-200"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Excellent · 78% promoters, 14% detractors
                </p>
              </div>
            </div>

            {/* Right: Pie chart */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Buyer Type Breakdown
              </p>
              <div className="flex flex-col items-center">
                <PieChart width={220} height={220}>
                  <Pie
                    data={BUYER_TYPES}
                    cx={105}
                    cy={105}
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                    onMouseLeave={() => setActivePieIndex(null)}
                    stroke="none"
                  >
                    {BUYER_TYPES.map((entry, index) => (
                      <Cell
                        key={`pie-${index}`}
                        fill={entry.color}
                        opacity={
                          activePieIndex === null || activePieIndex === index
                            ? 1
                            : 0.45
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${Number(value)}%`, "Share"]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>

                {/* Legend */}
                <div className="grid grid-cols-3 gap-3 w-full mt-2">
                  {BUYER_TYPES.map((b, i) => (
                    <div
                      key={b.name}
                      className="text-center cursor-pointer"
                      onMouseEnter={() => setActivePieIndex(i)}
                      onMouseLeave={() => setActivePieIndex(null)}
                    >
                      <div className={`w-8 h-2 rounded-full mx-auto mb-1.5 ${b.dotClass}`} />
                      <p className="text-xs font-semibold text-gray-800">{b.value}%</p>
                      <p className="text-xs text-gray-400">{b.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 5. Inventory Status ───────────────────────────────────────────── */}
        <SectionCard
          id="section-inventory"
          title="Inventory Status"
          subtitle="Stock levels and demand forecast"
          icon={<FiPackage size={17} />}
          action={
            lowStockItems.length > 0 ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                <FiAlertTriangle size={12} />
                {lowStockItems.length} low stock alert{lowStockItems.length > 1 ? "s" : ""}
              </span>
            ) : undefined
          }
        >
          <div className="space-y-6">
            {/* Gauge grid */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Stock Levels
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {INVENTORY_DATA.map((item) => (
                  <div
                    key={item.product}
                    className={`rounded-2xl border p-3 text-center ${
                      item.alert
                        ? "border-red-200 bg-red-50/50"
                        : "border-gray-100 bg-gray-50/50"
                    }`}
                  >
                    <GaugeChart value={item.stock} max={item.capacity} />
                    <p className="text-xs font-semibold text-gray-800 mt-1 leading-tight">
                      {item.product}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.stock} {item.unit}
                    </p>
                    {item.alert && (
                      <span className="inline-flex items-center gap-0.5 mt-1.5 text-[10px] font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        <FiAlertTriangle size={9} />
                        Low stock
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Low stock alerts */}
            {lowStockItems.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                  <FiAlertTriangle size={12} />
                  Restock Recommendations
                </p>
                <div className="space-y-2">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.product}
                      className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-red-100"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {item.product}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.stock} {item.unit} remaining ({item.stock}% capacity)
                        </p>
                      </div>
                      <button className="text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg transition-colors">
                        Restock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Demand forecast */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Demand Forecast (units)
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={FORECAST_DATA}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GREEN} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={TEAL} stopOpacity={0.12} />
                      <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                    }
                    width={38}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      value != null ? `${Number(value).toLocaleString()} units` : "—",
                      name === "actual" ? "Actual" : "Forecast",
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                    formatter={(v: string) =>
                      v === "actual" ? "Actual demand" : "Forecast demand"
                    }
                  />
                  {/* Divider between actual and forecast */}
                  <ReferenceLine
                    x="May"
                    stroke="#d1d5db"
                    strokeDasharray="4 3"
                    label={{
                      value: "Today",
                      position: "insideTopRight",
                      fontSize: 10,
                      fill: "#9ca3af",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke={GREEN}
                    strokeWidth={2.5}
                    fill="url(#actualGrad)"
                    dot={{ r: 4, fill: GREEN, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    connectNulls={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    stroke={TEAL}
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    fill="url(#forecastGrad)"
                    dot={{ r: 3, fill: TEAL, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    connectNulls={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── Print styles injected via a style tag ─────────────────────────── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #__next, #__next * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          @page { margin: 1.2cm; size: A4; }
        }
      `}</style>
    </div>
  );
}
