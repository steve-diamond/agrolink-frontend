import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type InputUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  approved?: boolean;
  category?: string;
};

type InputProduct = {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  price: number;
  approved?: boolean;
  category?: string;
  farmer?: string | { _id?: string };
};

type InputOrder = {
  _id: string;
  status: string;
  quantity?: number;
  buyer?: string;
  buyerId?: {
    name?: string;
    email?: string;
  };
  productId?: string | { _id?: string; name?: string };
  products?: Array<{ quantity: number; productId?: { _id?: string; name?: string } | string }>;
};

type Props = {
  users: InputUser[];
  products: InputProduct[];
  orders: InputOrder[];
  currencyFormatter: Intl.NumberFormat;
  onApproveProduct: (id: string) => void;
};

const FARMER_CATEGORIES = ["Arable", "Livestock", "Horticultural", "Poultry", "Fish", "Organic", "Dairy", "Mixed"];
const ORDER_STATUSES = ["Pending", "Shipped", "Delivered"];

const cardClass = "rounded-2xl border border-slate-700/80 bg-slate-900/75 p-4";
const tooltipStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 10,
  color: "#e2e8f0",
} as const;

function normalizeFarmerCategory(raw?: string): (typeof FARMER_CATEGORIES)[number] | null {
  const value = String(raw || "").trim().toLowerCase();
  if (!value) return null;
  if (value.includes("mixed")) return "Mixed";
  if (value.includes("organic")) return "Organic";
  if (value.includes("dairy") || value.includes("milk")) return "Dairy";
  if (value.includes("fish") || value.includes("aquaculture")) return "Fish";
  if (value.includes("poultry") || value.includes("chicken") || value.includes("egg")) return "Poultry";
  if (
    value.includes("hort") ||
    value.includes("vegetable") ||
    value.includes("fruit") ||
    value.includes("tomato") ||
    value.includes("pepper")
  ) return "Horticultural";
  if (
    value.includes("livestock") ||
    value.includes("cattle") ||
    value.includes("goat") ||
    value.includes("sheep") ||
    value.includes("animal")
  ) return "Livestock";
  if (
    value.includes("arable") ||
    value.includes("maize") ||
    value.includes("rice") ||
    value.includes("yam") ||
    value.includes("cassava") ||
    value.includes("grain") ||
    value.includes("crop")
  ) return "Arable";
  return null;
}

function normalizeOrderStatus(raw?: string): (typeof ORDER_STATUSES)[number] | "Unknown" {
  const value = String(raw || "").trim().toLowerCase();
  if (value === "pending") return "Pending";
  if (value === "shipped") return "Shipped";
  if (value === "delivered") return "Delivered";
  return "Unknown";
}

export default function AdminUnifiedCommandCenter({ users, products, orders, currencyFormatter, onApproveProduct }: Props) {
  const farmers = useMemo(() => users.filter((u) => u.role === "farmer"), [users]);
  const verifiedFarmersCount = useMemo(() => farmers.filter((f) => f.approved).length, [farmers]);
  const pendingProducts = useMemo(() => products.filter((p) => !p.approved), [products]);

  function resolveOrderProduct(order: any) {
    if (order.productId && typeof order.productId === "object" && order.productId.name) return order.productId.name;
    if (order.productId && typeof order.productId === "string") {
      const prod = products.find((p) => p._id === order.productId);
      return prod ? prod.name : "Unknown";
    }
    if (order.products && Array.isArray(order.products) && order.products.length > 0) {
      const prod = order.products[0].productId;
      if (typeof prod === "object" && prod.name) return prod.name;
      if (typeof prod === "string") {
        const p = products.find((pp) => pp._id === prod);
        return p ? p.name : "Unknown";
      }
    }
    return "Unknown";
  }

  function resolveOrderBuyer(order: any) {
    if (order.buyerId && typeof order.buyerId === "object" && order.buyerId.name) return order.buyerId.name;
    if (order.buyer && typeof order.buyer === "string") return order.buyer;
    return "Unknown";
  }

  function resolveOrderQuantity(order: any) {
    if (typeof order.quantity === "number") return order.quantity;
    if (order.products && Array.isArray(order.products)) {
      return order.products.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0);
    }
    return "-";
  }

  function getOrderStatusBadgeClass(status: string) {
    const s = String(status || "").toLowerCase();
    if (s === "pending") return "bg-amber-900/40 text-amber-300";
    if (s === "shipped") return "bg-blue-900/40 text-blue-300";
    if (s === "delivered") return "bg-green-900/40 text-green-300";
    return "bg-slate-700 text-slate-300";
  }

  const [approvingProductId, setApprovingProductId] = useState<string | null>(null);
  const handleApproveProduct = async (id: string) => {
    setApprovingProductId(id);
    try {
      await onApproveProduct(id);
    } finally {
      setApprovingProductId(null);
    }
  };

  const farmerCategoryData = useMemo(() => {
    return FARMER_CATEGORIES.map((cat) => ({
      category: cat,
      count: farmers.filter((f) => normalizeFarmerCategory(f.category) === cat).length,
    }));
  }, [farmers]);

  const orderStatusData = useMemo(() => {
    return [
      { name: "Pending", value: orders.filter((o) => normalizeOrderStatus(o.status) === "Pending").length },
      { name: "Shipped", value: orders.filter((o) => normalizeOrderStatus(o.status) === "Shipped").length },
      { name: "Delivered", value: orders.filter((o) => normalizeOrderStatus(o.status) === "Delivered").length },
    ];
  }, [orders]);

  return (
    <section className="mt-4 rounded-2xl border border-slate-700/80 bg-slate-900/75 p-4 text-slate-100">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="m-0 text-xs uppercase tracking-[0.11em] text-emerald-300">Admin Insights</p>
          <h2 className="m-0 mt-1 text-xl font-semibold">DOS AGROLINK Admin Dashboard</h2>
          <p className="m-0 mt-1 text-sm text-slate-400">Unified view of farmers, approvals, and order operations.</p>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <article className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3">
          <p className="m-0 text-xs text-emerald-200/90">Total Farmers</p>
          <p className="m-0 mt-1 text-xl font-semibold text-emerald-100">{farmers.length}</p>
        </article>
        <article className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3">
          <p className="m-0 text-xs text-cyan-200/90">Verified Farmers</p>
          <p className="m-0 mt-1 text-xl font-semibold text-cyan-100">{verifiedFarmersCount}</p>
        </article>
        <article className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3">
          <p className="m-0 text-xs text-amber-200/90">Pending Products</p>
          <p className="m-0 mt-1 text-xl font-semibold text-amber-100">{pendingProducts.length}</p>
        </article>
        <article className="rounded-xl border border-violet-400/30 bg-violet-500/10 p-3">
          <p className="m-0 text-xs text-violet-200/90">Active Orders</p>
          <p className="m-0 mt-1 text-xl font-semibold text-violet-100">{orders.length}</p>
        </article>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className={cardClass}>
          <h3 className="m-0 text-sm font-semibold text-slate-200">Farmers by Category</h3>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={farmerCategoryData}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="category" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {farmerCategoryData.map((item, index) => (
                    <Cell
                      key={`${item.category}-${index}`}
                      fill={[
                        "#16a34a",
                        "#f59e0b",
                        "#3b82f6",
                        "#ef4444",
                        "#0ea5e9",
                        "#10b981",
                        "#6366f1",
                        "#d97706",
                      ][index % 8]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={cardClass}>
          <h3 className="m-0 text-sm font-semibold text-slate-200">Order Status</h3>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderStatusData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={[
                      "#f59e0b",
                      "#3b82f6",
                      "#16a34a"
                    ][index % 3]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="m-0 text-base font-semibold">Pending Products</h3>
          <p className="m-0 text-xs text-slate-400">Quick approval queue</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {pendingProducts.slice(0, 6).map((product) => (
            <article key={product._id} className="rounded-xl border border-slate-700 bg-slate-800/70 p-3">
              {product.image || product.imageUrl ? (
                <div className="relative h-36 w-full overflow-hidden rounded-lg">
                  <Image
                    src={product.image || product.imageUrl || ""}
                    alt={product.name}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-36 items-center justify-center rounded-lg border border-slate-600 bg-slate-900/60 text-xs text-slate-400">
                  No image
                </div>
              )}
              <h4 className="m-0 mt-3 text-base font-semibold text-slate-100">{product.name}</h4>
              <p className="m-0 mt-1 line-clamp-2 text-sm text-slate-400">{product.description || "No description provided."}</p>
              <p className="m-0 mt-2 text-sm font-semibold text-emerald-300">{currencyFormatter.format(Number(product.price || 0))}</p>
              <button
                type="button"
                disabled={approvingProductId === product._id}
                onClick={() => handleApproveProduct(product._id)}
                className="mt-3 rounded-lg border border-emerald-400/70 bg-emerald-900/30 px-3 py-2 text-xs font-semibold text-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {approvingProductId === product._id ? "Approving..." : "Approve"}
              </button>
            </article>
          ))}
        </div>

        {pendingProducts.length === 0 ? <p className="mt-3 text-sm text-slate-500">No pending products at the moment.</p> : null}
      </section>

      <section>
        <h3 className="m-0 text-base font-semibold">Orders</h3>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/70">
          <table className="w-full min-w-190 border-collapse text-sm">
            <thead>
              <tr className="bg-emerald-900/35 text-emerald-100">
                <th className="px-3 py-2 text-left">Order ID</th>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-left">Buyer</th>
                <th className="px-3 py-2 text-left">Quantity</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 14).map((order) => (
                <tr key={order._id} className="border-b border-slate-800 text-slate-300">
                  <td className="px-3 py-2">{order._id}</td>
                  <td className="px-3 py-2">{resolveOrderProduct(order)}</td>
                  <td className="px-3 py-2">{resolveOrderBuyer(order)}</td>
                  <td className="px-3 py-2">{resolveOrderQuantity(order)}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getOrderStatusBadgeClass(order.status)}`}>
                      {normalizeOrderStatus(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">
                    No orders available for this period.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
