"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
  type PaginationState,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiPrinter,
  FiEye,
  FiAlertTriangle,
  FiChevronUp,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiPackage,
  FiCalendar,
  FiX,
  FiCheck,
  FiMapPin,
  FiMoreVertical,
  FiFileText,
  FiTruck,
} from "react-icons/fi";

// ─── Types ─────────────────────────────────────────────────────────────────────

type DeliveryStatus =
  | "completed"
  | "in_transit"
  | "pending"
  | "cancelled";

interface DeliveryRecord {
  id: string;
  products: string[];
  pickupLocation: string;
  deliveryLocation: string;
  date: Date;
  status: DeliveryStatus;
  amountNGN: number;
  receiptUrl?: string;
}

type DatePreset = "today" | "last7" | "last30" | "custom";
type ExportFormat = "csv" | "pdf";

interface DateRange {
  from: Date | null;
  to: Date | null;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const MOCK_DELIVERIES: DeliveryRecord[] = [
  {
    id: "AGR-2026-4821",
    products: ["Organic Maize (Grade A)"],
    pickupLocation: "Mushin Market, Lagos",
    deliveryLocation: "Victoria Island, Lagos",
    date: daysAgo(0),
    status: "in_transit",
    amountNGN: 385000,
  },
  {
    id: "AGR-2026-4790",
    products: ["Cassava Flour", "Palm Oil (5L)"],
    pickupLocation: "Kano Central Market",
    deliveryLocation: "Wuse II, Abuja",
    date: daysAgo(2),
    status: "completed",
    amountNGN: 142500,
    receiptUrl: "#",
  },
  {
    id: "AGR-2026-4755",
    products: ["Yam (Tubers, 50kg)"],
    pickupLocation: "Mile 12 Market, Lagos",
    deliveryLocation: "Ikeja GRA, Lagos",
    date: daysAgo(4),
    status: "completed",
    amountNGN: 67800,
    receiptUrl: "#",
  },
  {
    id: "AGR-2026-4722",
    products: ["Groundnuts (bags x10)"],
    pickupLocation: "Ibadan Central, Oyo",
    deliveryLocation: "Sabo, Ibadan",
    date: daysAgo(5),
    status: "cancelled",
    amountNGN: 54000,
  },
  {
    id: "AGR-2026-4710",
    products: ["Soybean (Grade B)", "Millet (bags x5)"],
    pickupLocation: "Kebbi Farmers Co-op",
    deliveryLocation: "Kano Industrial Estate",
    date: daysAgo(7),
    status: "completed",
    amountNGN: 218000,
    receiptUrl: "#",
  },
  {
    id: "AGR-2026-4698",
    products: ["Palm Oil (25L)"],
    pickupLocation: "Enugu Mile 1",
    deliveryLocation: "GRA Enugu",
    date: daysAgo(9),
    status: "pending",
    amountNGN: 96500,
  },
  {
    id: "AGR-2026-4671",
    products: ["Dried Fish (crates x3)"],
    pickupLocation: "Onitsha Main Market",
    deliveryLocation: "Asaba, Delta",
    date: daysAgo(10),
    status: "completed",
    amountNGN: 182000,
    receiptUrl: "#",
  },
  {
    id: "AGR-2026-4650",
    products: ["Rice (50kg bags x20)"],
    pickupLocation: "Benue Farmers Hub",
    deliveryLocation: "Makurdi Central",
    date: daysAgo(12),
    status: "completed",
    amountNGN: 760000,
    receiptUrl: "#",
  },
  {
    id: "AGR-2026-4631",
    products: ["Tomatoes (crates x8)"],
    pickupLocation: "Sokoto Farm Gate",
    deliveryLocation: "Birnin Kebbi Market",
    date: daysAgo(14),
    status: "cancelled",
    amountNGN: 43200,
  },
  {
    id: "AGR-2026-4610",
    products: ["Cocoa Beans (bags x4)"],
    pickupLocation: "Ondo Farm Cooperative",
    deliveryLocation: "Apapa Port, Lagos",
    date: daysAgo(16),
    status: "completed",
    amountNGN: 524000,
    receiptUrl: "#",
  },
  {
    id: "AGR-2026-4588",
    products: ["Shea Butter (drums x2)"],
    pickupLocation: "Kaduna North",
    deliveryLocation: "Zaria, Kaduna",
    date: daysAgo(18),
    status: "completed",
    amountNGN: 310000,
    receiptUrl: "#",
  },
  {
    id: "AGR-2026-4562",
    products: ["Plantain (hands x50)"],
    pickupLocation: "Edo Farm Gate",
    deliveryLocation: "Benin City Market",
    date: daysAgo(21),
    status: "in_transit",
    amountNGN: 88000,
  },
  {
    id: "AGR-2026-4540",
    products: ["Sorghum (bags x15)", "Cowpeas (bags x10)"],
    pickupLocation: "Gombe Farmers Assoc.",
    deliveryLocation: "Jos Market, Plateau",
    date: daysAgo(23),
    status: "completed",
    amountNGN: 435000,
    receiptUrl: "#",
  },
  {
    id: "AGR-2026-4515",
    products: ["Sesame Seeds (bags x8)"],
    pickupLocation: "Nassarawa Cooperative",
    deliveryLocation: "Lafia Market",
    date: daysAgo(25),
    status: "pending",
    amountNGN: 194000,
  },
  {
    id: "AGR-2026-4490",
    products: ["Ginger (crates x6)"],
    pickupLocation: "Kaduna South Farm",
    deliveryLocation: "Kano Export Hub",
    date: daysAgo(28),
    status: "completed",
    amountNGN: 267000,
    receiptUrl: "#",
  },
];

// ─── Constants ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  DeliveryStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  completed: {
    label: "Completed",
    color: "text-green-700",
    bg: "bg-green-50 border border-green-200",
    dot: "bg-green-500",
  },
  in_transit: {
    label: "In Transit",
    color: "text-blue-700",
    bg: "bg-blue-50 border border-blue-200",
    dot: "bg-blue-500",
  },
  pending: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50 border border-amber-200",
    dot: "bg-amber-500",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    bg: "bg-red-50 border border-red-200",
    dot: "bg-red-400",
  },
};

const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "last7", label: "Last 7 days" },
  { key: "last30", label: "Last 30 days" },
  { key: "custom", label: "Custom" },
];

const STATUS_FILTERS: { value: DeliveryStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "in_transit", label: "In Transit" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

const PAGE_SIZES = [5, 10, 20];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtAmount(n: number): string {
  return `₦${n.toLocaleString("en-NG")}`;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPresetRange(preset: DatePreset): DateRange {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (preset === "today") return { from: startOfToday, to: now };
  if (preset === "last7") {
    const from = new Date(startOfToday);
    from.setDate(from.getDate() - 6);
    return { from, to: now };
  }
  if (preset === "last30") {
    const from = new Date(startOfToday);
    from.setDate(from.getDate() - 29);
    return { from, to: now };
  }
  return { from: null, to: null };
}

function buildCSV(rows: DeliveryRecord[]): string {
  const header = [
    "Order ID",
    "Products",
    "Pickup",
    "Delivery",
    "Date",
    "Status",
    "Amount (NGN)",
  ].join(",");
  const lines = rows.map((r) =>
    [
      r.id,
      `"${r.products.join("; ")}"`,
      `"${r.pickupLocation}"`,
      `"${r.deliveryLocation}"`,
      fmtDate(r.date),
      STATUS_CONFIG[r.status].label,
      r.amountNGN,
    ].join(",")
  );
  return [header, ...lines].join("\n");
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

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}
    >
      {status === "in_transit" ? (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-75`}
          />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${cfg.dot}`} />
        </span>
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      )}
      {cfg.label}
    </span>
  );
}

// ─── RowActionsMenu ───────────────────────────────────────────────────────────

function RowActionsMenu({
  row,
  onReport,
}: {
  row: DeliveryRecord;
  onReport: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Row actions"
      >
        <FiMoreVertical size={14} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-8 z-20 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden"
          >
            <ActionMenuItem
              icon={<FiEye size={13} />}
              label="View details"
              onClick={() => {
                setOpen(false);
                // Navigate to tracker or open drawer
                console.info("[DeliveryHistory] View:", row.id);
              }}
            />
            {row.receiptUrl && (
              <ActionMenuItem
                icon={<FiFileText size={13} />}
                label="Download receipt"
                onClick={() => {
                  setOpen(false);
                  downloadBlob(
                    `Receipt for ${row.id}\nAmount: ${fmtAmount(row.amountNGN)}\nDate: ${fmtDate(row.date)}`,
                    `receipt-${row.id}.txt`,
                    "text/plain"
                  );
                }}
              />
            )}
            <ActionMenuItem
              icon={<FiAlertTriangle size={13} />}
              label="Report issue"
              danger
              onClick={() => {
                setOpen(false);
                onReport(row.id);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionMenuItem({
  icon,
  label,
  danger = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── DateRangePicker ──────────────────────────────────────────────────────────

function DateRangePicker({
  preset,
  range,
  onPreset,
  onRange,
}: {
  preset: DatePreset;
  range: DateRange;
  onPreset: (p: DatePreset) => void;
  onRange: (r: DateRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const activeLabel =
    preset === "custom" && range.from && range.to
      ? `${fmtDate(range.from)} – ${fmtDate(range.to)}`
      : DATE_PRESETS.find((d) => d.key === preset)?.label ?? "Date range";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-9 px-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-gray-300 transition-colors"
      >
        <FiCalendar size={13} className="text-gray-400 shrink-0" />
        <span className="max-w-36 truncate">{activeLabel}</span>
        <FiChevronDown size={13} className="text-gray-400 shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.14 }}
            className="absolute top-11 left-0 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-72"
          >
            {/* Presets */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {DATE_PRESETS.filter((p) => p.key !== "custom").map((p) => (
                <button
                  key={p.key}
                  onClick={() => {
                    onPreset(p.key);
                    onRange(getPresetRange(p.key));
                    setOpen(false);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                    preset === p.key
                      ? "bg-green-600 text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Custom range
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 font-medium block mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    title="From date"
                    aria-label="Start date"
                    value={range.from ? range.from.toISOString().slice(0, 10) : ""}
                    max={range.to ? range.to.toISOString().slice(0, 10) : undefined}
                    onChange={(e) => {
                      const from = e.target.value ? new Date(e.target.value) : null;
                      onPreset("custom");
                      onRange({ from, to: range.to });
                    }}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-medium block mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    title="To date"
                    aria-label="End date"
                    value={range.to ? range.to.toISOString().slice(0, 10) : ""}
                    min={range.from ? range.from.toISOString().slice(0, 10) : undefined}
                    onChange={(e) => {
                      const to = e.target.value ? new Date(e.target.value) : null;
                      onPreset("custom");
                      onRange({ from: range.from, to });
                    }}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              {(range.from || range.to) && preset === "custom" && (
                <button
                  onClick={() => {
                    setOpen(false);
                  }}
                  className="mt-2 w-full py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Apply
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
          <FiTruck className="text-gray-300" size={36} />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center">
          <FiPackage className="text-green-400" size={14} />
        </div>
      </div>

      {hasFilters ? (
        <>
          <h3 className="text-base font-bold text-gray-700 mb-1">
            No deliveries match your filters
          </h3>
          <p className="text-sm text-gray-400 mb-5 max-w-xs">
            Try adjusting the date range, status filter, or search query.
          </p>
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl transition-colors"
          >
            <FiX size={14} />
            Clear filters
          </button>
        </>
      ) : (
        <>
          <h3 className="text-base font-bold text-gray-700 mb-1">
            No deliveries yet
          </h3>
          <p className="text-sm text-gray-400 mb-5 max-w-xs">
            Once you place your first order, your deliveries will appear here for
            tracking and history.
          </p>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
            <FiTruck size={14} />
            Schedule a Delivery
          </button>
        </>
      )}
    </div>
  );
}

// ─── ReportModal ──────────────────────────────────────────────────────────────

const ISSUE_TYPES = [
  "Package not delivered",
  "Wrong items delivered",
  "Package damaged",
  "Driver issue",
  "Billing discrepancy",
  "Other",
];

function ReportModal({
  orderId,
  onClose,
}: {
  orderId: string;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    console.info("[DeliveryHistory] Issue reported:", { orderId, type: selected, notes });
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="text-red-500" size={16} />
            <h3 className="font-bold text-gray-800 text-sm">
              Report Issue · <span className="font-mono text-gray-500">{orderId}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center"
            aria-label="Close"
          >
            <FiX size={14} />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center py-10 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <FiCheck className="text-green-600" size={24} />
            </div>
            <h4 className="text-sm font-bold text-gray-800 mb-1">Issue Reported</h4>
            <p className="text-xs text-gray-400 mb-5">
              Our team will review and contact you shortly.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {ISSUE_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelected(t)}
                  className={`text-left text-xs px-3 py-2.5 rounded-xl border font-medium transition-colors ${
                    selected === t
                      ? "bg-red-50 border-red-300 text-red-700"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Additional details (optional)…"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-300"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selected}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ─── Column definition ────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<DeliveryRecord>();

// ─── Main component ────────────────────────────────────────────────────────────

export interface DeliveryHistoryProps {
  /** Override mock data with real records. */
  data?: DeliveryRecord[];
}

export default function DeliveryHistory({ data = MOCK_DELIVERIES }: DeliveryHistoryProps) {
  // ── filter state ──
  const [globalSearch, setGlobalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "all">("all");
  const [datePreset, setDatePreset] = useState<DatePreset>("last30");
  const [dateRange, setDateRange] = useState<DateRange>(getPresetRange("last30"));

  // ── table state ──
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // ── modal ──
  const [reportOrderId, setReportOrderId] = useState<string | null>(null);

  // ── derived: client-side filtering (date + status + search) ──
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Date range
      if (dateRange.from && row.date < dateRange.from) return false;
      if (dateRange.to) {
        const endOfDay = new Date(dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);
        if (row.date > endOfDay) return false;
      }
      // Status
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      // Global search (order ID or product name)
      if (globalSearch.trim()) {
        const q = globalSearch.trim().toLowerCase();
        const inId = row.id.toLowerCase().includes(q);
        const inProducts = row.products.some((p) =>
          p.toLowerCase().includes(q)
        );
        if (!inId && !inProducts) return false;
      }
      return true;
    });
  }, [data, dateRange, statusFilter, globalSearch]);

  const hasFilters =
    statusFilter !== "all" ||
    !!globalSearch.trim() ||
    datePreset !== "last30";

  const clearFilters = useCallback(() => {
    setGlobalSearch("");
    setStatusFilter("all");
    setDatePreset("last30");
    setDateRange(getPresetRange("last30"));
    setRowSelection({});
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, []);

  // ── columns ──
  const columns = useMemo(
    () => [
      // Checkbox column
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (el)
                el.indeterminate = table.getIsSomePageRowsSelected();
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="w-3.5 h-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
            aria-label="Select all on page"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-3.5 h-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
            aria-label={`Select order ${row.original.id}`}
          />
        ),
        size: 36,
      }),

      // Order ID
      columnHelper.accessor("id", {
        header: "Order ID",
        cell: (info) => (
          <span className="font-mono text-xs font-semibold text-green-700 hover:underline cursor-pointer">
            {info.getValue()}
          </span>
        ),
        size: 130,
      }),

      // Products
      columnHelper.accessor("products", {
        header: "Product(s)",
        cell: (info) => {
          const prods = info.getValue();
          return (
            <div className="max-w-44">
              <p className="text-xs font-medium text-gray-800 truncate">{prods[0]}</p>
              {prods.length > 1 && (
                <p className="text-[11px] text-gray-400">
                  +{prods.length - 1} more
                </p>
              )}
            </div>
          );
        },
        enableSorting: false,
        size: 180,
      }),

      // Pickup → Delivery
      columnHelper.display({
        id: "route",
        header: "Route",
        cell: ({ row }) => (
          <div className="max-w-52 space-y-0.5">
            <div className="flex items-start gap-1">
              <FiMapPin size={10} className="text-green-600 mt-0.5 shrink-0" />
              <p className="text-[11px] text-gray-600 truncate">{row.original.pickupLocation}</p>
            </div>
            <div className="flex items-start gap-1">
              <FiMapPin size={10} className="text-orange-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-gray-600 truncate">{row.original.deliveryLocation}</p>
            </div>
          </div>
        ),
        enableSorting: false,
        size: 210,
      }),

      // Date
      columnHelper.accessor("date", {
        header: "Date",
        cell: (info) => (
          <span className="text-xs text-gray-600 whitespace-nowrap">
            {fmtDate(info.getValue())}
          </span>
        ),
        sortingFn: "datetime",
        size: 110,
      }),

      // Status
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
        enableSorting: true,
        size: 120,
      }),

      // Amount
      columnHelper.accessor("amountNGN", {
        header: "Amount",
        cell: (info) => (
          <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
            {fmtAmount(info.getValue())}
          </span>
        ),
        size: 110,
      }),

      // Actions
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RowActionsMenu row={row.original} onReport={setReportOrderId} />
        ),
        size: 48,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters, rowSelection, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    autoResetPageIndex: true,
  });

  // ── selected rows for bulk actions ──
  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((r) => r.original);

  // ── export handlers ──
  const handleExport = useCallback(
    (format: ExportFormat) => {
      const rows = selectedRows.length > 0 ? selectedRows : filteredData;
      if (format === "csv") {
        downloadBlob(
          buildCSV(rows),
          `deliveries-${Date.now()}.csv`,
          "text/csv"
        );
        return;
      }
      // PDF: for production integrate jsPDF / pdfmake; for now download as plain text
      const lines = rows.map(
        (r) =>
          `${r.id} | ${r.products.join(", ")} | ${fmtDate(r.date)} | ${STATUS_CONFIG[r.status].label} | ${fmtAmount(r.amountNGN)}`
      );
      downloadBlob(
        ["DELIVERY HISTORY REPORT", "=".repeat(60), ...lines].join("\n"),
        `deliveries-${Date.now()}.txt`,
        "text/plain"
      );
    },
    [selectedRows, filteredData]
  );

  const handlePrintLabels = useCallback(() => {
    const rows = selectedRows.length > 0 ? selectedRows : filteredData.slice(0, 10);
    const content = rows
      .map(
        (r) =>
          `ORDER: ${r.id}\nFROM: ${r.pickupLocation}\nTO: ${r.deliveryLocation}\nPRODUCT: ${r.products.join(", ")}\nAMOUNT: ${fmtAmount(r.amountNGN)}\n${"─".repeat(40)}`
      )
      .join("\n\n");

    const win = window.open("", "_blank", "width=600,height=800");
    if (!win) return;
    win.document.write(
      `<html><head><title>Shipping Labels</title><style>body{font-family:monospace;font-size:13px;padding:24px;white-space:pre}</style></head><body>${content}</body></html>`
    );
    win.document.close();
    win.print();
  }, [selectedRows, filteredData]);

  const selectionCount = selectedRows.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Delivery History</h2>
          <p className="text-xs text-gray-400">
            {filteredData.length} record{filteredData.length !== 1 ? "s" : ""}
            {hasFilters ? " matching filters" : ""}
          </p>
        </div>

        {/* Export actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-1.5 h-8 px-3 bg-white border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-600 rounded-xl transition-colors"
            title="Export CSV"
          >
            <FiDownload size={13} />
            CSV
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-1.5 h-8 px-3 bg-white border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-600 rounded-xl transition-colors"
            title="Export PDF"
          >
            <FiFileText size={13} />
            PDF
          </button>
          <button
            onClick={handlePrintLabels}
            className="flex items-center gap-1.5 h-8 px-3 bg-white border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-600 rounded-xl transition-colors"
            title="Print shipping labels"
          >
            <FiPrinter size={13} />
            Labels
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <FiSearch
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="search"
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            placeholder="Search order ID or product…"
            className="w-full h-9 pl-8 pr-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Date picker */}
        <DateRangePicker
          preset={datePreset}
          range={dateRange}
          onPreset={(p) => {
            setDatePreset(p);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
          onRange={(r) => {
            setDateRange(r);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
        />

        {/* Status filter */}
        <div className="relative">
          <FiFilter
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <select
            value={statusFilter}
            title="Filter by status"
            aria-label="Filter by delivery status"
            onChange={(e) => {
              setStatusFilter(e.target.value as DeliveryStatus | "all");
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            className="h-9 pl-8 pr-7 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <FiChevronDown
            size={12}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 h-9 px-3 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FiX size={12} />
            Clear
          </button>
        )}
      </div>

      {/* Bulk actions bar */}
      <AnimatePresence>
        {selectionCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
              <span className="text-xs font-semibold text-green-700">
                {selectionCount} selected
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => handleExport("csv")}
                  className="flex items-center gap-1.5 h-7 px-3 bg-white border border-green-200 text-xs font-semibold text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <FiDownload size={12} />
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="flex items-center gap-1.5 h-7 px-3 bg-white border border-green-200 text-xs font-semibold text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <FiFileText size={12} />
                  Export PDF
                </button>
                <button
                  onClick={handlePrintLabels}
                  className="flex items-center gap-1.5 h-7 px-3 bg-white border border-green-200 text-xs font-semibold text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <FiPrinter size={12} />
                  Print Labels
                </button>
                <button
                  onClick={() => setRowSelection({})}
                  className="w-6 h-6 rounded-full hover:bg-green-100 flex items-center justify-center text-green-600 transition-colors"
                  aria-label="Deselect all"
                >
                  <FiX size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredData.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr
                      key={hg.id}
                      className="border-b border-gray-100 bg-gray-50/60"
                    >
                      {hg.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap"
                        >
                          {header.isPlaceholder ? null : header.column.getCanSort() ? (
                            <button
                              onClick={header.column.getToggleSortingHandler()}
                              className="flex items-center gap-1 hover:text-gray-600 transition-colors"
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              <span className="ml-1 flex flex-col leading-none">
                                <FiChevronUp
                                  size={9}
                                  className={
                                    header.column.getIsSorted() === "asc"
                                      ? "text-green-600"
                                      : "text-gray-300"
                                  }
                                />
                                <FiChevronDown
                                  size={9}
                                  className={
                                    header.column.getIsSorted() === "desc"
                                      ? "text-green-600"
                                      : "text-gray-300"
                                  }
                                />
                              </span>
                            </button>
                          ) : (
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-b border-gray-50 last:border-0 transition-colors ${
                        row.getIsSelected()
                          ? "bg-green-50/60"
                          : "hover:bg-gray-50/50"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-3 align-middle"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
              {/* Page size */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Show</span>
                <select
                  value={pagination.pageSize}
                  title="Rows per page"
                  aria-label="Rows per page"
                  onChange={(e) =>
                    setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })
                  }
                  className="h-7 px-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span>per page</span>
                <span className="text-gray-300">·</span>
                <span>
                  {table.getFilteredRowModel().rows.length} total
                </span>
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-1">
                <PagButton
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="First page"
                >
                  <FiChevronsLeft size={13} />
                </PagButton>
                <PagButton
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Previous page"
                >
                  <FiChevronLeft size={13} />
                </PagButton>

                <span className="text-xs text-gray-600 px-2 font-medium">
                  {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
                </span>

                <PagButton
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Next page"
                >
                  <FiChevronRight size={13} />
                </PagButton>
                <PagButton
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Last page"
                >
                  <FiChevronsRight size={13} />
                </PagButton>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Report issue modal */}
      <AnimatePresence>
        {reportOrderId && (
          <ReportModal
            key="report-modal"
            orderId={reportOrderId}
            onClose={() => setReportOrderId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PagButton({
  children,
  onClick,
  disabled,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  "aria-label"?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}
