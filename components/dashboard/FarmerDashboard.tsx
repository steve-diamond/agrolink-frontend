"use client";

import React, { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FiDollarSign,
  FiShoppingBag,
  FiClock,
  FiStar,
  FiTrendingUp,
  FiTrendingDown,
  FiBell,
  FiX,
  FiPlus,
  FiPackage,
  FiTruck,
  FiMessageSquare,
  FiAlertCircle,
  FiCheck,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiTrash2,
} from "react-icons/fi";
import { MdHeadsetMic } from "react-icons/md";

// ─── Types ───────────────────────────────────────────────────────────────────

type ChartView = "daily" | "weekly" | "monthly";
type NotifCategory = "all" | "orders" | "payments" | "messages" | "system";
type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

interface ChartDataPoint {
  label: string;
  earnings: number;
  orders: number;
}

interface Order {
  id: string;
  product: string;
  quantity: number;
  buyer: string;
  status: OrderStatus;
  amount: number;
  date: string;
}

interface Notification {
  id: string;
  category: Exclude<NotifCategory, "all">;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface StatItem {
  label: string;
  value: string;
  trend: "up" | "down";
  change: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const CHART_DATA: Record<ChartView, ChartDataPoint[]> = {
  daily: [
    { label: "Mon", earnings: 45000, orders: 3 },
    { label: "Tue", earnings: 62000, orders: 5 },
    { label: "Wed", earnings: 38000, orders: 2 },
    { label: "Thu", earnings: 91000, orders: 7 },
    { label: "Fri", earnings: 74000, orders: 6 },
    { label: "Sat", earnings: 110000, orders: 9 },
    { label: "Sun", earnings: 55000, orders: 4 },
  ],
  weekly: [
    { label: "Week 1", earnings: 320000, orders: 24 },
    { label: "Week 2", earnings: 415000, orders: 31 },
    { label: "Week 3", earnings: 380000, orders: 28 },
    { label: "Week 4", earnings: 520000, orders: 39 },
  ],
  monthly: [
    { label: "Dec", earnings: 1200000, orders: 92 },
    { label: "Jan", earnings: 1450000, orders: 108 },
    { label: "Feb", earnings: 1320000, orders: 98 },
    { label: "Mar", earnings: 1680000, orders: 125 },
    { label: "Apr", earnings: 1540000, orders: 114 },
    { label: "May", earnings: 1920000, orders: 143 },
  ],
};

const MOCK_ORDERS: Order[] = [
  { id: "ORD-001", product: "Organic Maize", quantity: 500, buyer: "FoodCo Ltd", status: "delivered", amount: 125000, date: "2026-05-20" },
  { id: "ORD-002", product: "Cassava Flour", quantity: 200, buyer: "Mama's Kitchen", status: "shipped", amount: 48000, date: "2026-05-21" },
  { id: "ORD-003", product: "Tomatoes (Crate)", quantity: 30, buyer: "Fresh Mart", status: "pending", amount: 21000, date: "2026-05-22" },
  { id: "ORD-004", product: "Yam (Tubers)", quantity: 100, buyer: "Agro Buyers Inc", status: "confirmed", amount: 85000, date: "2026-05-22" },
  { id: "ORD-005", product: "Palm Oil (25L)", quantity: 10, buyer: "Gold Foods", status: "cancelled", amount: 60000, date: "2026-05-19" },
  { id: "ORD-006", product: "Groundnuts", quantity: 300, buyer: "Nut Masters", status: "delivered", amount: 72000, date: "2026-05-18" },
  { id: "ORD-007", product: "Sorghum", quantity: 400, buyer: "Grain Exchange", status: "pending", amount: 96000, date: "2026-05-23" },
  { id: "ORD-008", product: "Beans (Brown)", quantity: 150, buyer: "BeanCo", status: "confirmed", amount: 54000, date: "2026-05-21" },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", category: "orders", title: "New Order Received", message: "FoodCo Ltd placed an order for 500kg Maize", time: "2 min ago", read: false },
  { id: "n2", category: "payments", title: "Payment Received", message: "₦125,000 credited for ORD-001", time: "1 hr ago", read: false },
  { id: "n3", category: "messages", title: "New Message", message: "Mama's Kitchen: When will delivery arrive?", time: "3 hr ago", read: false },
  { id: "n4", category: "system", title: "Profile Verified", message: "Your farmer profile has been verified", time: "1 day ago", read: true },
  { id: "n5", category: "orders", title: "Order Shipped", message: "ORD-002 is on its way to the buyer", time: "5 hr ago", read: true },
  { id: "n6", category: "payments", title: "Withdrawal Processed", message: "₦80,000 transferred to your account", time: "2 days ago", read: true },
  { id: "n7", category: "messages", title: "Support Response", message: "Your ticket #4521 has been resolved", time: "3 days ago", read: true },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const ORDERS_PER_PAGE = 5;

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-800" },
  shipped: { label: "Shipped", className: "bg-purple-100 text-purple-800" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
};

const NOTIF_CATEGORY_ICON: Record<Exclude<NotifCategory, "all">, { icon: React.ReactNode; color: string }> = {
  orders: { icon: <FiPackage size={15} />, color: "text-blue-600" },
  payments: { icon: <FiDollarSign size={15} />, color: "text-green-600" },
  messages: { icon: <FiMessageSquare size={15} />, color: "text-purple-600" },
  system: { icon: <FiAlertCircle size={15} />, color: "text-orange-600" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(n: number): string {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatNairaShort(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${Math.round(n / 1_000)}K`;
  return `₦${n}`;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ stat }: { stat: StatItem }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${stat.bg}`}>
          <div className={stat.color}>{stat.icon}</div>
        </div>
        <div
          className={`flex items-center gap-0.5 text-xs font-semibold ${
            stat.trend === "up" ? "text-green-600" : "text-red-500"
          }`}
        >
          {stat.trend === "up" ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
          {stat.change}%
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
      <p className="text-xs text-gray-400 mt-1">vs last month</p>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3 text-sm min-w-40">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex justify-between gap-4 mb-1">
          <span className="text-gray-500 capitalize">{entry.name === "earnings" ? "Earnings" : "Orders"}</span>
          <span
            className={`font-semibold ${
              entry.name === "earnings" ? "text-green-700" : "text-orange-600"
            }`}
          >
            {entry.name === "earnings" ? formatNaira(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{order.id}</h3>
            <p className="text-sm text-gray-400">{order.date}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Close order details"
            title="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Details */}
        <div className="p-5 space-y-1">
          {(
            [
              ["Product", order.product],
              ["Quantity", `${order.quantity} kg`],
              ["Buyer", order.buyer],
              ["Amount", formatNaira(order.amount)],
            ] as [string, string][]
          ).map(([key, val]) => (
            <div key={key} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{key}</span>
              <span className="text-sm font-medium text-gray-900">{val}</span>
            </div>
          ))}
          <div className="flex justify-between py-2.5">
            <span className="text-sm text-gray-500">Status</span>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_CONFIG[order.status].className}`}
            >
              {STATUS_CONFIG[order.status].label}
            </span>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface FarmerDashboardProps {
  /** Optionally inject real user data from a parent auth context */
  userName?: string;
  userRole?: string;
  userLocation?: string;
  userAvatar?: string | null;
}

export default function FarmerDashboard({
  userName = "Emeka Okafor",
  userRole = "Verified Farmer",
  userLocation = "Enugu, Nigeria",
  userAvatar = null,
}: FarmerDashboardProps) {
  // ── State ────────────────────────────────────────────────────────────────
  const [chartView, setChartView] = useState<ChartView>("monthly");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [notifCategory, setNotifCategory] = useState<NotifCategory>("all");
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  // ── Derived ──────────────────────────────────────────────────────────────
  const chartData = CHART_DATA[chartView];

  const filteredNotifs = useMemo(
    () =>
      notifCategory === "all"
        ? notifications
        : notifications.filter((n) => n.category === notifCategory),
    [notifications, notifCategory]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const totalPages = Math.ceil(MOCK_ORDERS.length / ORDERS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PER_PAGE;
    return MOCK_ORDERS.slice(start, start + ORDERS_PER_PAGE);
  }, [currentPage]);

  // ── Notification handlers ─────────────────────────────────────────────────
  const toggleRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // ── CSV download ──────────────────────────────────────────────────────────
  const downloadCSV = useCallback(() => {
    const header = ["Period", "Earnings (NGN)", "Orders"];
    const rows = chartData.map((d) => [d.label, d.earnings, d.orders]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `earnings-${chartView}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [chartData, chartView]);

  // ── Stats config ─────────────────────────────────────────────────────────
  const stats: StatItem[] = [
    {
      label: "Total Earnings",
      value: "₦1.92M",
      trend: "up",
      change: 24.7,
      icon: <FiDollarSign size={20} />,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "Active Listings",
      value: "34",
      trend: "up",
      change: 5.9,
      icon: <FiShoppingBag size={20} />,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Pending Orders",
      value: "7",
      trend: "down",
      change: 12.5,
      icon: <FiClock size={20} />,
      color: "text-orange-700",
      bg: "bg-orange-50",
    },
    {
      label: "Average Rating",
      value: "4.8 ★",
      trend: "up",
      change: 2.1,
      icon: <FiStar size={20} />,
      color: "text-yellow-700",
      bg: "bg-yellow-50",
    },
  ];

  // ── Quick actions ─────────────────────────────────────────────────────────
  const quickActions = [
    { label: "Add Product", icon: <FiPlus size={17} />, className: "bg-green-600 hover:bg-green-700", href: "/farmer/upload" },
    { label: "Request Loan", icon: <FiDollarSign size={17} />, className: "bg-blue-600 hover:bg-blue-700", href: "/loan-application" },
    { label: "Track Delivery", icon: <FiTruck size={17} />, className: "bg-purple-600 hover:bg-purple-700", href: "/logistics" },
    { label: "Contact Support", icon: <MdHeadsetMic size={17} />, className: "bg-orange-600 hover:bg-orange-700", href: "/contact" },
  ];

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Notifications overlay ──────────────────────────────────────────── */}
      {notifOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setNotifOpen(false)}
        />
      )}

      {/* ── Notifications sidebar ──────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-90 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          notifOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Notifications panel"
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <FiBell className="text-green-600" size={19} />
            <span className="font-semibold text-gray-800">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setNotifOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Close notifications"
          >
            <FiX size={19} />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 px-4 pt-3 pb-2 overflow-x-auto scrollbar-hide">
          {(["all", "orders", "payments", "messages", "system"] as NotifCategory[]).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setNotifCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-colors shrink-0 ${
                  notifCategory === cat
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Action row */}
        <div className="flex justify-end gap-4 px-5 py-2 border-b">
          <button
            onClick={markAllRead}
            className="text-xs text-green-700 hover:text-green-900 flex items-center gap-1 font-medium"
          >
            <FiCheck size={12} />
            Mark all read
          </button>
          <button
            onClick={clearAll}
            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
          >
            <FiTrash2 size={12} />
            Clear all
          </button>
        </div>

        {/* Notification list */}
        <ul className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filteredNotifs.length === 0 && (
            <li className="text-center text-gray-400 py-16 text-sm">
              No notifications here
            </li>
          )}
          {filteredNotifs.map((notif) => {
            const cfg = NOTIF_CATEGORY_ICON[notif.category];
            return (
              <li
                key={notif.id}
                className={`flex gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notif.read ? "bg-green-50/60" : ""
                }`}
                onClick={() => toggleRead(notif.id)}
                title={notif.read ? "Mark as unread" : "Mark as read"}
              >
                <div className={`mt-0.5 shrink-0 ${cfg.color}`}>{cfg.icon}</div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-snug ${
                      !notif.read
                        ? "font-semibold text-gray-900"
                        : "text-gray-700"
                    }`}
                  >
                    {notif.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-1.5" />
                )}
              </li>
            );
          })}
        </ul>
      </aside>

      {/* ── Order detail modal ─────────────────────────────────────────────── */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* ── Page content ──────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 1. Welcome header ──────────────────────────────────────────────── */}
        <header className="bg-gradient-to-br from-green-700 via-green-600 to-green-500 rounded-2xl p-5 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: avatar + greeting */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-white/40 bg-white/20 flex items-center justify-center shrink-0 overflow-hidden">
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={userName}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-white text-xl font-bold">{initials}</span>
                )}
              </div>
              <div>
                <p className="text-green-100 text-sm">{getGreeting()},</p>
                <h1 className="text-white text-xl font-bold leading-tight">{userName}</h1>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    {userRole}
                  </span>
                  <span className="text-green-100 text-xs">{userLocation}</span>
                </div>
              </div>
            </div>

            {/* Right: notification bell */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative self-start sm:self-center bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-medium transition-colors"
              aria-label={`Open notifications (${unreadCount} unread)`}
            >
              <FiBell size={16} />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* 2. KPI stats grid ──────────────────────────────────────────────── */}
        <section aria-label="Key performance indicators">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>
        </section>

        {/* 3. Earnings chart ──────────────────────────────────────────────── */}
        <section
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6"
          aria-label="Earnings chart"
        >
          {/* Chart header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">Earnings Overview</h2>
              <p className="text-sm text-gray-400 mt-0.5">Revenue and orders over time</p>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                {(["daily", "weekly", "monthly"] as ChartView[]).map((view) => (
                  <button
                    key={view}
                    onClick={() => setChartView(view)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                      chartView === view
                        ? "bg-white text-green-700 shadow-sm font-semibold"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>

              {/* CSV download */}
              <button
                onClick={downloadCSV}
                title="Download CSV"
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                aria-label="Download chart data as CSV"
              >
                <FiDownload size={15} />
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart
              data={chartData}
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              {/* Left axis: earnings */}
              <YAxis
                yAxisId="earnings"
                orientation="left"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatNairaShort(v)}
                width={52}
              />
              {/* Right axis: orders */}
              <YAxis
                yAxisId="orders"
                orientation="right"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
                formatter={(value: string) =>
                  value === "earnings" ? "Earnings (₦)" : "Orders"
                }
              />
              {/* Earnings bars */}
              <Bar
                yAxisId="earnings"
                dataKey="earnings"
                fill="#dcfce7"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              {/* Earnings trend line */}
              <Line
                yAxisId="earnings"
                type="monotone"
                dataKey="earnings"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#16a34a", strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              {/* Orders line */}
              <Line
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                stroke="#ea580c"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={{ r: 3, fill: "#ea580c", strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </section>

        {/* 4. Recent orders table ─────────────────────────────────────────── */}
        <section
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          aria-label="Recent orders"
        >
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-400 mt-0.5">{MOCK_ORDERS.length} total orders</p>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-semibold">Order ID</th>
                  <th className="px-6 py-3 text-left font-semibold">Product</th>
                  <th className="px-6 py-3 text-left font-semibold">Qty (kg)</th>
                  <th className="px-6 py-3 text-left font-semibold">Buyer</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold sr-only">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                    onClick={() => setSelectedOrder(order)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedOrder(order)}
                    aria-label={`View details for ${order.id}`}
                  >
                    <td className="px-6 py-4 font-mono text-gray-600 text-xs">{order.id}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{order.product}</td>
                    <td className="px-6 py-4 text-gray-600">{order.quantity}</td>
                    <td className="px-6 py-4 text-gray-600">{order.buyer}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CONFIG[order.status].className}`}
                      >
                        {STATUS_CONFIG[order.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatNaira(order.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-green-600 transition-all p-1"
                        aria-label={`View ${order.id}`}
                      >
                        <FiEye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <ul className="sm:hidden divide-y divide-gray-100">
            {paginatedOrders.map((order) => (
              <li
                key={order.id}
                className="px-4 py-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span className="font-mono text-xs text-gray-500">{order.id}</span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CONFIG[order.status].className}`}
                  >
                    {STATUS_CONFIG[order.status].label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{order.product}</p>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-gray-500">{order.buyer} · {order.quantity} kg</span>
                  <span className="text-sm font-bold text-green-700">{formatNaira(order.amount)}</span>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {(currentPage - 1) * ORDERS_PER_PAGE + 1}–
                {Math.min(currentPage * ORDERS_PER_PAGE, MOCK_ORDERS.length)}
              </span>{" "}
              of <span className="font-semibold text-gray-700">{MOCK_ORDERS.length}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-green-500 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <FiChevronLeft size={15} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    currentPage === page
                      ? "bg-green-600 text-white"
                      : "border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600"
                  }`}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-green-500 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <FiChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Quick actions FAB ───────────────────────────────────────────────── */}
      <div
        className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2.5"
        aria-label="Quick actions"
      >
        {/* Action items — revealed when open */}
        {fabOpen && (
          <div className="flex flex-col gap-2 items-end">
            {quickActions.map((action, i) => (
              <a
                key={i}
                href={action.href}
                className={`flex items-center gap-2.5 ${action.className} text-white rounded-full pl-3.5 pr-4 py-2 text-sm font-semibold shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5`}
              >
                <span className="shrink-0">{action.icon}</span>
                <span className="whitespace-nowrap">{action.label}</span>
              </a>
            ))}
          </div>
        )}

        {/* Main FAB toggle */}
        <button
          onClick={() => setFabOpen((o) => !o)}
          className={`w-13 h-13 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 ${
            fabOpen
              ? "bg-gray-800 hover:bg-gray-700 rotate-45"
              : "bg-green-600 hover:bg-green-700"
          }`}
          aria-label={fabOpen ? "Close quick actions" : "Open quick actions"}
          aria-expanded={fabOpen}
        >
          <FiPlus size={22} className="text-white" />
        </button>
      </div>
    </div>
  );
}
