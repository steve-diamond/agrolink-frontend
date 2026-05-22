"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaUserFriends, FaUsers, FaShoppingCart, FaBoxOpen,
  FaChartBar, FaCog, FaBell, FaSearch, FaTruck, FaCheckCircle, FaHourglassHalf,
  FaBan, FaThumbsUp
} from "react-icons/fa";
import axios from "axios";

type Order = {
  _id: string;
  status: string;
  totalAmount?: number;
  totalPrice?: number;
  createdAt?: string;
  user?: { name?: string; email?: string } | string;
  products?: Array<{ productId?: { name?: string } | string; quantity?: number }>;
  quantity?: number;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-sky-100 text-sky-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const getAuthHeader = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeArray = <T,>(data: unknown, ...keys: string[]): T[] => {
  if (Array.isArray(data)) return data as T[];
  for (const key of keys) {
    const val = (data as Record<string, unknown>)?.[key];
    if (Array.isArray(val)) return val as T[];
  }
  return [];
};

function NavItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/admin" && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
        isActive ? "bg-white/20 text-white" : "text-green-100 hover:bg-white/10"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

const getBuyerName = (user: Order["user"]) => {
  if (!user) return "—";
  if (typeof user === "string") return user;
  return user.name || user.email || "—";
};

const getFirstProductName = (order: Order) => {
  const first = order.products?.[0];
  if (!first) return "—";
  if (typeof first.productId === "string") return first.productId;
  return first.productId?.name || "—";
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const headers = getAuthHeader();
    if (!headers.Authorization) return;
    axios.get("/api/admin/orders", { headers })
      .then(res => setOrders(normalizeArray<Order>(res.data, "orders", "data")))
      .catch(err => console.error("Failed to fetch orders:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === "all" || o.status?.toLowerCase() === statusFilter;
    const matchSearch = !search ||
      getBuyerName(o.user).toLowerCase().includes(search.toLowerCase()) ||
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      getFirstProductName(o).toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleOrderStatus = async (orderId: string, status: string) => {
    setActioningId(orderId);
    try {
      await axios.patch(
        `/api/admin/orders/${orderId}/status`,
        { status },
        { headers: getAuthHeader() }
      );
      setOrders(prev =>
        prev.map(o => o._id === orderId ? { ...o, status } : o)
      );
    } catch {
      alert(`Failed to update order status.`);
    } finally {
      setActioningId(null);
    }
  };

  const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  const statusCounts = statuses.reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders.filter(o => o.status?.toLowerCase() === s).length;
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-linear-to-br from-green-900 via-green-800 to-green-700">
      {/* Sidebar */}
      <aside className="w-64 bg-linear-to-b from-green-900 to-green-700 text-white flex flex-col py-6 px-4 shadow-lg">
        <div className="flex items-center gap-3 mb-10">
          <img src="/dos-agrolink-logo.jpg" alt="Dos Agrolink" className="w-10 h-10 rounded-full object-cover border-2 border-white/50" />
          <span className="text-xl font-extrabold tracking-tight">Dos Agrolink</span>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem icon={<FaChartBar />} label="Dashboard" href="/admin" />
          <NavItem icon={<FaUserFriends />} label="Farmers" href="/admin/farmers" />
          <NavItem icon={<FaUsers />} label="Buyers" href="/admin/buyers" />
          <NavItem icon={<FaBoxOpen />} label="Products" href="/admin/products" />
          <NavItem icon={<FaShoppingCart />} label="Orders" href="/admin/orders" />
          <NavItem icon={<FaChartBar />} label="Analytics" href="/admin/analytics" />
          <NavItem icon={<FaCog />} label="Settings" href="/admin/settings" />
        </nav>
        <div className="mt-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-green-300 bg-green-600 flex items-center justify-center text-white font-bold">A</div>
          <span className="font-semibold">Admin</span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-green-900">Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor all marketplace orders</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 w-52"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
            </div>
            <button className="bg-white p-2 rounded-full shadow hover:bg-green-100" aria-label="Notifications">
              <FaBell className="text-green-700 text-lg" />
            </button>
          </div>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
            <FaShoppingCart className="text-green-600 text-2xl" />
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold">{orders.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
            <FaHourglassHalf className="text-amber-500 text-2xl" />
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-xl font-bold">{statusCounts.pending ?? 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
            <FaTruck className="text-sky-500 text-2xl" />
            <div>
              <p className="text-xs text-gray-500">Shipped</p>
              <p className="text-xl font-bold">{statusCounts.shipped ?? 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
            <FaCheckCircle className="text-emerald-500 text-2xl" />
            <div>
              <p className="text-xs text-gray-500">Delivered</p>
              <p className="text-xl font-bold">{statusCounts.delivered ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["all", ...statuses].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-green-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-green-400"
              }`}
            >
              {s === "all" ? "All" : s}
              {s !== "all" && statusCounts[s] !== undefined && (
                <span className="ml-1 opacity-75">({statusCounts[s]})</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-sm">No orders found.</p>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-green-50 text-green-900 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Order ID</th>
                    <th className="px-4 py-3 text-left">Buyer</th>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{order._id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3 text-gray-800">{getBuyerName(order.user)}</td>
                      <td className="px-4 py-3 text-gray-600">{getFirstProductName(order)}</td>
                      <td className="px-4 py-3 text-gray-800 font-medium">
                        ₦{((order.totalAmount ?? order.totalPrice) || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs rounded-full px-2 py-0.5 capitalize font-medium ${STATUS_COLORS[order.status?.toLowerCase()] ?? "bg-gray-100 text-gray-700"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {(order.status === "pending" || order.status === "processing") && (
                            <button
                              disabled={actioningId === order._id}
                              onClick={() => handleOrderStatus(order._id, order.status === "pending" ? "processing" : "shipped")}
                              title="Approve order"
                              className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-2 py-1 rounded disabled:opacity-50"
                            >
                              <FaThumbsUp className="text-[10px]" />
                              {actioningId === order._id ? "..." : "Approve"}
                            </button>
                          )}
                          {order.status !== "cancelled" && order.status !== "delivered" && (
                            <button
                              disabled={actioningId === order._id}
                              onClick={() => handleOrderStatus(order._id, "cancelled")}
                              title="Cancel unlawful order"
                              className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-2 py-1 rounded disabled:opacity-50"
                            >
                              <FaBan className="text-[10px]" />
                              {actioningId === order._id ? "..." : "Cancel"}
                            </button>
                          )}
                          {(order.status === "cancelled" || order.status === "delivered") && (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:border-green-400"
                >
                  Prev
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:border-green-400"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
