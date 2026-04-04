"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import API from "@/services/api";

const AdminCharts = dynamic(() => import("./AdminCharts"), { ssr: false });

type DateRange = 30 | 90 | 365;

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  approved?: boolean;
};

type AdminProduct = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  approved?: boolean;
  category?: string;
  location?: string;
  description?: string;
};

type AdminOrder = {
  _id: string;
  totalPrice: number;
  totalAmount?: number;
  status: string;
  paymentStatus?: string;
  createdAt?: string;
  buyerId?: {
    name?: string;
    email?: string;
  };
  productId?: {
    _id?: string;
    name?: string;
    price?: number;
    location?: string;
  };
  products?: Array<{
    productId?: {
      _id?: string;
      name?: string;
      price?: number;
      location?: string;
    };
    quantity: number;
  }>;
  quantity?: number;
};

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
});

export default function AdminDashboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [rangeDays, setRangeDays] = useState<DateRange>(90);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token") ?? "";

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    Promise.all([
      API.get("/api/admin/users", { headers: getAuthHeaders() }),
      API.get("/api/admin/products", { headers: getAuthHeaders() }),
      API.get("/api/admin/orders", { headers: getAuthHeaders() }),
    ])
      .then(([usersRes, productsRes, ordersRes]) => {
        const usersPayload = usersRes.data as any;
        const productsPayload = productsRes.data as any;
        const ordersPayload = ordersRes.data as any;

        const usersData = Array.isArray(usersPayload)
          ? usersPayload
          : Array.isArray(usersPayload?.users)
          ? usersPayload.users
          : [];

        const productsData = Array.isArray(productsPayload)
          ? productsPayload
          : Array.isArray(productsPayload?.products)
          ? productsPayload.products
          : [];

        const ordersData = Array.isArray(ordersPayload)
          ? ordersPayload
          : Array.isArray(ordersPayload?.orders)
          ? ordersPayload.orders
          : [];

        setUsers(usersData);
        setProducts(productsData);
        setOrders(ordersData);
      })
      .catch((err: any) => {
        setError(err?.response?.data?.message || "Failed to load admin dashboard.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleDelete = async (type: "users" | "products" | "orders", id: string) => {
    if (!confirm(`Delete this ${type.slice(0, -1)}? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await API.delete(`/api/admin/${type}/${id}`, { headers: getAuthHeaders() });
      if (type === "users") setUsers((prev) => prev.filter((u) => u._id !== id));
      if (type === "products") setProducts((prev) => prev.filter((p) => p._id !== id));
      if (type === "orders") setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || `Failed to delete ${type.slice(0, -1)}.`);
    } finally {
      setDeleting(null);
    }
  };

  const deleteProduct = (id: string) => handleDelete("products", id);

  const approveProduct = async (id: string) => {
    try {
      await API.patch(`/api/admin/products/${id}/approve`, null, {
        headers: getAuthHeaders(),
      });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, approved: true } : p))
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to approve product.");
    }
  };

  const approveFarmer = async (id: string) => {
    try {
      await API.patch(`/api/admin/users/${id}/approve`, null, {
        headers: getAuthHeaders(),
      });
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? { ...user, approved: true } : user))
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to approve farmer.");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!order.createdAt) return false;
    const created = new Date(order.createdAt);
    if (Number.isNaN(created.getTime())) return false;
    const now = new Date();
    const ageMs = now.getTime() - created.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    return ageDays <= rangeDays;
  });

  const getOrderItems = (order: AdminOrder) => {
    if (Array.isArray(order.products) && order.products.length > 0) {
      return order.products;
    }

    if (order.productId) {
      return [{ productId: order.productId, quantity: order.quantity ?? 0 }];
    }

    return [];
  };

  const getOrderTotal = (order: AdminOrder) => Number(order.totalAmount ?? order.totalPrice ?? 0);

  const getOrderSummary = (order: AdminOrder) => {
    const items = getOrderItems(order);

    if (items.length === 0) {
      return "Unknown";
    }

    if (items.length === 1) {
      return items[0].productId?.name || "Unknown";
    }

    return `${items.length} items`;
  };

  const totalUsers = users.length;
  const totalProducts = products.length;
  const totalOrders = filteredOrders.length;

  const totalRevenue = filteredOrders.reduce(
    (sum: number, order: AdminOrder) => sum + getOrderTotal(order),
    0
  );
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const farmerCount = users.filter((user) => user.role === "farmer").length;
  const approvedFarmerCount = users.filter(
    (user) => user.role === "farmer" && user.approved
  ).length;

  const roleDistributionData = [
    { name: "Farmers", value: users.filter((user) => user.role === "farmer").length },
    { name: "Buyers", value: users.filter((user) => user.role === "buyer").length },
    { name: "Admins", value: users.filter((user) => user.role === "admin").length },
  ];

  const approvalData = [
    { name: "Approved", value: approvedFarmerCount },
    { name: "Pending", value: Math.max(0, farmerCount - approvedFarmerCount) },
  ];
  const approvalRate = farmerCount > 0 ? (approvedFarmerCount / farmerCount) * 100 : 0;

  const orderStatusData = Object.values(
    filteredOrders.reduce((acc: Record<string, { name: string; count: number }>, order) => {
      const key = (order.status || "unknown").toLowerCase();
      if (!acc[key]) {
        acc[key] = { name: key, count: 0 };
      }
      acc[key].count += 1;
      return acc;
    }, {})
  );

  const topProductPriceData = [...products]
    .sort((a, b) => b.price - a.price)
    .slice(0, 6)
    .map((product) => ({ name: product.name, price: product.price }));

  const revenueTrendData = (() => {
    const monthMap: Record<string, number> = {};

    filteredOrders.forEach((order) => {
      const date = order.createdAt ? new Date(order.createdAt) : null;
      if (!date || Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthMap[key] = (monthMap[key] || 0) + Number(order.totalPrice || 0);
    });

    return Object.entries(monthMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([key, revenue]) => ({
        month: key,
        revenue,
      }));
  })();

  const orderStatusTrendData = (() => {
    const bucketMap: Record<string, { label: string; pending: number; paid: number; delivered: number; unknown: number }> = {};

    filteredOrders.forEach((order) => {
      const date = order.createdAt ? new Date(order.createdAt) : null;
      if (!date || Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!bucketMap[key]) {
        bucketMap[key] = {
          label: key,
          pending: 0,
          paid: 0,
          delivered: 0,
          unknown: 0,
        };
      }

      const status = (order.status || "unknown").toLowerCase();
      if (status === "pending" || status === "paid" || status === "delivered") {
        bucketMap[key][status] += 1;
      } else {
        bucketMap[key].unknown += 1;
      }
    });

    return Object.values(bucketMap)
      .sort((a, b) => a.label.localeCompare(b.label))
      .slice(-6);
  })();

  const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  });

  const compactFormatter = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  const exportAnalyticsCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Date Range (days)", String(rangeDays)],
      ["Total Users", String(totalUsers)],
      ["Total Products", String(totalProducts)],
      ["Total Orders", String(totalOrders)],
      ["Total Revenue", String(totalRevenue)],
      ["Average Order Value", String(averageOrderValue)],
      ["Farmer Approval Rate", `${approvalRate.toFixed(1)}%`],
      [],
      ["Order ID", "Products", "Buyer", "Status", "Payment Status", "Total Price", "Created At"],
      ...filteredOrders.map((order) => [
        order._id,
        getOrderItems(order)
          .map((item) => `${item.productId?.name || "Unknown"} x${item.quantity}`)
          .join(" | "),
        order.buyerId?.email || "Unknown",
        order.status || "unknown",
        order.paymentStatus || "pending",
        String(getOrderTotal(order)),
        order.createdAt || "",
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `agrolink-investor-report-${rangeDays}d-${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printInvestorReport = () => {
    window.print();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/admin/login");
  };

  const pendingFarmerCount = Math.max(0, farmerCount - approvedFarmerCount);
  const pendingProductCount = products.filter((p) => !p.approved).length;
  const rangeLabel = `Last ${rangeDays} days`;
  const latestUpdateLabel = new Date().toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const searchableUsers = users.filter((u) => {
    if (!normalizedSearch) return true;
    return [u.name, u.email, u.role].join(" ").toLowerCase().includes(normalizedSearch);
  });

  const searchableProducts = products.filter((p) => {
    if (!normalizedSearch) return true;
    return [p.name, p.category, p.location].join(" ").toLowerCase().includes(normalizedSearch);
  });

  const searchableOrders = filteredOrders.filter((o) => {
    if (!normalizedSearch) return true;
    const summary = getOrderSummary(o);
    return [summary, o.status, o.paymentStatus, o.buyerId?.email].join(" ").toLowerCase().includes(normalizedSearch);
  });

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#0b1220_45%,_#060b14_100%)] p-4 text-slate-100 md:p-6">
      <section className="mb-4 rounded-3xl border border-emerald-400/20 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/80 p-5 shadow-[0_22px_40px_rgba(2,6,23,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="m-0 text-xs uppercase tracking-[0.13em] text-emerald-300">DOS AGROLINK Investor Control Room</p>
            <h1 className="mt-2 text-2xl font-semibold md:text-3xl">Executive Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Live market intelligence, operations, approvals, and commerce performance for the DOS AGROLINK ecosystem.
            </p>
          </div>

          <div className="no-print flex flex-wrap gap-2">
            <button
              onClick={exportAnalyticsCsv}
              className="cursor-pointer rounded-xl border border-cyan-400/70 bg-cyan-900/70 px-3 py-2 text-sm font-semibold text-cyan-100"
            >
              Export CSV
            </button>
            <button
              onClick={printInvestorReport}
              className="cursor-pointer rounded-xl border border-amber-400/80 bg-amber-900/70 px-3 py-2 text-sm font-semibold text-amber-100"
            >
              Print Report
            </button>
            <button
              onClick={handleLogout}
              className="cursor-pointer rounded-xl border border-rose-400/70 bg-rose-900/70 px-3 py-2 text-sm font-semibold text-rose-100"
            >
              Logout
            </button>
          </div>
        </div>
      </section>

      {loading ? <div className="mb-4 text-slate-300">Loading admin dashboard...</div> : null}

      {!loading && error ? (
        <div className="mb-4 rounded-xl border border-rose-400/40 bg-rose-900/30 px-4 py-3 text-rose-100">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
        <aside className="rounded-2xl border border-slate-700/80 bg-slate-900/75 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Overview</p>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2">
              <p className="m-0 text-xs text-slate-400">Active Range</p>
              <p className="m-0 mt-1 font-semibold text-emerald-200">{rangeLabel}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2">
              <p className="m-0 text-xs text-slate-400">Pending Approvals</p>
              <p className="m-0 mt-1 font-semibold text-amber-200">{pendingFarmerCount} farmers</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2">
              <p className="m-0 text-xs text-slate-400">Pending Products</p>
              <p className="m-0 mt-1 font-semibold text-sky-200">{pendingProductCount} listings</p>
            </div>
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.1em] text-slate-400">Quick Menu</p>
          <ul className="m-0 mt-2 grid list-none gap-1 p-0 text-sm text-slate-300">
            <li className="rounded-lg bg-emerald-700/20 px-3 py-2 text-emerald-200">Dashboard</li>
            <li className="rounded-lg px-3 py-2">Approvals</li>
            <li className="rounded-lg px-3 py-2">Commerce</li>
            <li className="rounded-lg px-3 py-2">Reports</li>
            <li className="rounded-lg px-3 py-2">Insights</li>
          </ul>
        </aside>

        <div className="grid gap-4">
          <section className="rounded-2xl border border-slate-700/80 bg-slate-900/75 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="relative min-w-[220px] flex-1">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users, products, orders..."
                  className="w-full rounded-xl border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                />
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                Live Updated: {latestUpdateLabel}
              </div>
            </div>

            <div className="no-print mb-3 flex flex-wrap gap-2">
              {[30, 90, 365].map((value) => (
                <button
                  key={value}
                  onClick={() => setRangeDays(value as DateRange)}
                  className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm ${
                    rangeDays === value
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-100"
                      : "border-slate-600 bg-slate-800 text-slate-200"
                  }`}
                >
                  Last {value} days
                </button>
              ))}
            </div>

            <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3">
                <p className="m-0 text-xs text-emerald-200/80">Total Revenue</p>
                <h3 className="mt-2 text-xl font-semibold text-emerald-100">{currencyFormatter.format(totalRevenue)}</h3>
              </div>
              <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3">
                <p className="m-0 text-xs text-cyan-200/80">Average Order Value</p>
                <h3 className="mt-2 text-xl font-semibold text-cyan-100">{currencyFormatter.format(averageOrderValue)}</h3>
              </div>
              <div className="rounded-xl border border-violet-400/30 bg-violet-500/10 p-3">
                <p className="m-0 text-xs text-violet-200/80">Farmer Approval Rate</p>
                <h3 className="mt-2 text-xl font-semibold text-violet-100">{approvalRate.toFixed(1)}%</h3>
              </div>
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3">
                <p className="m-0 text-xs text-amber-200/80">Approved Farmers</p>
                <h3 className="mt-2 text-xl font-semibold text-amber-100">{compactFormatter.format(approvedFarmerCount)} / {compactFormatter.format(farmerCount)}</h3>
              </div>
            </div>

            <AdminCharts
              roleDistributionData={roleDistributionData}
              approvalData={approvalData}
              orderStatusData={orderStatusData}
              topProductPriceData={topProductPriceData}
              revenueTrendData={revenueTrendData}
              orderStatusTrendData={orderStatusTrendData}
              currencyFormatter={currencyFormatter}
            />

            <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
              {topProductPriceData.slice(0, 3).map((product, index) => (
                <article key={product.name} className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
                  <p className="m-0 text-[11px] uppercase tracking-[0.08em] text-slate-400">Top Commodity {index + 1}</p>
                  <h3 className="m-0 mt-2 text-base font-semibold text-slate-100">{product.name}</h3>
                  <p className="m-0 mt-1 text-emerald-300">{currencyFormatter.format(Number(product.price || 0))}</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-700">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
                      style={{ width: `${Math.min(100, 30 + index * 20)}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700/80 bg-slate-900/75 p-4">
            <h2 className="m-0 text-lg font-semibold">Operations Feed</h2>
            <div className="mt-3 grid gap-4 lg:grid-cols-3">
              <article className="rounded-xl border border-slate-700 bg-slate-800/70 p-3">
                <h3 className="m-0 text-sm font-semibold text-slate-200">Users</h3>
                <div className="mt-2 grid gap-1 text-sm text-slate-300">
                  {searchableUsers.slice(0, 5).map((u) => (
                    <div key={u._id} className="rounded-lg border border-slate-700 bg-slate-900/70 px-2 py-1">
                      <div className="font-medium">{u.email}</div>
                      <div className="text-xs text-slate-400">
                        {u.role} {u.role === "farmer" ? `• ${u.approved ? "Approved" : "Pending"}` : ""}
                      </div>
                      {u.role === "farmer" && !u.approved ? (
                        <button
                          onClick={() => approveFarmer(u._id)}
                          className="mt-1 cursor-pointer rounded-md border border-emerald-400/60 bg-emerald-700/30 px-2 py-1 text-xs text-emerald-100"
                        >
                          Approve
                        </button>
                      ) : null}
                    </div>
                  ))}
                  {searchableUsers.length === 0 ? <p className="m-0 text-xs text-slate-500">No users match your search.</p> : null}
                </div>
              </article>

              <article className="rounded-xl border border-slate-700 bg-slate-800/70 p-3">
                <h3 className="m-0 text-sm font-semibold text-slate-200">Products</h3>
                <div className="mt-2 grid gap-1 text-sm text-slate-300">
                  {searchableProducts.slice(0, 5).map((p) => (
                    <div key={p._id} className="rounded-lg border border-slate-700 bg-slate-900/70 px-2 py-1">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-slate-400">{currencyFormatter.format(Number(p.price || 0))}</div>
                      <div className="mt-1 flex gap-1">
                        {!p.approved ? (
                          <button
                            onClick={() => approveProduct(p._id)}
                            disabled={deleting === p._id}
                            className="cursor-pointer rounded-md border border-emerald-400/60 bg-emerald-700/30 px-2 py-1 text-xs text-emerald-100 disabled:opacity-60"
                          >
                            Approve
                          </button>
                        ) : null}
                        <button
                          onClick={() => deleteProduct(p._id)}
                          disabled={deleting === p._id}
                          className="cursor-pointer rounded-md border border-rose-400/60 bg-rose-700/30 px-2 py-1 text-xs text-rose-100 disabled:opacity-60"
                        >
                          {deleting === p._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                  {searchableProducts.length === 0 ? <p className="m-0 text-xs text-slate-500">No products match your search.</p> : null}
                </div>
              </article>

              <article className="rounded-xl border border-slate-700 bg-slate-800/70 p-3">
                <h3 className="m-0 text-sm font-semibold text-slate-200">Orders</h3>
                <div className="mt-2 grid gap-1 text-sm text-slate-300">
                  {searchableOrders.slice(0, 5).map((o) => (
                    <div key={o._id} className="rounded-lg border border-slate-700 bg-slate-900/70 px-2 py-1">
                      <div className="font-medium">{getOrderSummary(o)}</div>
                      <div className="text-xs text-slate-400 capitalize">{o.status || "unknown"} / {o.paymentStatus || "pending"}</div>
                      <div className="text-xs text-emerald-200">{currencyFormatter.format(getOrderTotal(o))}</div>
                    </div>
                  ))}
                  {searchableOrders.length === 0 ? <p className="m-0 text-xs text-slate-500">No orders match your search.</p> : null}
                </div>
              </article>
            </div>
          </section>
        </div>

        <aside className="rounded-2xl border border-slate-700/80 bg-slate-900/75 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Plan</p>
          <div className="mt-2 rounded-2xl border border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/15 to-indigo-500/10 p-4">
            <p className="m-0 text-xs text-fuchsia-200">DOS AGROLINK Intelligence</p>
            <h3 className="m-0 mt-2 text-lg font-semibold text-white">Operational Analysis</h3>
            <p className="mt-2 text-sm text-slate-300">Track approvals, market activity, and revenue momentum from one executive panel.</p>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
            <h3 className="m-0 text-sm font-semibold text-slate-200">Live Snapshot</h3>
            <ul className="m-0 mt-3 grid list-none gap-2 p-0 text-sm">
              <li className="flex items-center justify-between"><span className="text-slate-400">Users</span><strong>{totalUsers}</strong></li>
              <li className="flex items-center justify-between"><span className="text-slate-400">Products</span><strong>{totalProducts}</strong></li>
              <li className="flex items-center justify-between"><span className="text-slate-400">Orders</span><strong>{totalOrders}</strong></li>
              <li className="flex items-center justify-between"><span className="text-slate-400">Pending Farmers</span><strong>{pendingFarmerCount}</strong></li>
            </ul>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
            <h3 className="m-0 text-sm font-semibold text-slate-200">Operational Alerts</h3>
            <ul className="m-0 mt-3 grid list-none gap-2 p-0 text-sm text-slate-300">
              <li className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2">
                {pendingFarmerCount} farmers pending approval review.
              </li>
              <li className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2">
                {pendingProductCount} product listings awaiting action.
              </li>
              <li className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2">
                Revenue window: {currencyFormatter.format(totalRevenue)} in {rangeLabel.toLowerCase()}.
              </li>
            </ul>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
            <h3 className="m-0 text-sm font-semibold text-slate-200">DOS Vision Assistant</h3>
            <p className="mt-2 text-sm text-slate-300">Ask operational questions and align daily actions with DOS AGROLINK vision outcomes.</p>
            <div className="mt-3 grid gap-2">
              <button className="cursor-pointer rounded-xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-left text-xs text-slate-200">
                Which approvals block marketplace growth this week?
              </button>
              <button className="cursor-pointer rounded-xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-left text-xs text-slate-200">
                Show top value-chain opportunities by order demand.
              </button>
            </div>
            <button className="mt-3 w-full cursor-pointer rounded-xl border border-emerald-400/70 bg-emerald-700/30 px-3 py-2 text-sm font-semibold text-emerald-100">
              Run Quick Review
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
