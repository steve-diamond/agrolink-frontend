"use client";


import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUserFriends, FaCheckCircle, FaHourglassHalf, FaShoppingCart, FaLeaf, FaBoxOpen, FaChartBar, FaCog, FaBell, FaSearch } from "react-icons/fa";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale
} from "chart.js";

// Type definitions
type Farmer = {
  _id: string;
  name: string;
  email?: string;
  role?: string;
  category?: string;
  approved?: boolean;
};

type Product = {
  _id: string;
  name: string;
  price: number;
  approved?: boolean;
  image?: string;
  imageUrl?: string;
  description?: string;
};

type Order = {
  _id: string;
  productId?: string | { name?: string };
  buyer?: string;
  user?: { name?: string; email?: string };
  quantity?: number;
  status: string;
};

type ApplicationAccount = {
  name: string;
  email: string;
  phone: string;
};

type FarmerApplication = {
  _id: string;
  applicationId: string;
  status: string;
  account: ApplicationAccount;
  createdAt?: string;
};

type BuyerApplication = {
  _id: string;
  applicationId: string;
  status: string;
  account: ApplicationAccount;
  createdAt?: string;
};

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale);

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

export default function AdminDashboard() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [farmerApplications, setFarmerApplications] = useState<FarmerApplication[]>([]);
  const [buyerApplications, setBuyerApplications] = useState<BuyerApplication[]>([]);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [approving, setApproving] = useState(false);
  const [approvingFarmerAppId, setApprovingFarmerAppId] = useState<string | null>(null);
  const [approvingBuyerAppId, setApprovingBuyerAppId] = useState<string | null>(null);
  const [orderPage, setOrderPage] = useState(1);
  const ORDERS_PER_PAGE = 8;

  useEffect(() => {
    const headers = getAuthHeader();
    if (!headers.Authorization) return;

    axios.get("/api/admin/users", { headers })
      .then(res => setFarmers(normalizeArray<Farmer>(res.data, "users", "data")))
      .catch(err => console.error("Failed to fetch users:", err));

    axios.get("/api/admin/products", { headers })
      .then(res => setProducts(normalizeArray<Product>(res.data, "products", "data")))
      .catch(err => console.error("Failed to fetch products:", err));

    axios.get("/api/admin/orders", { headers })
      .then(res => setOrders(normalizeArray<Order>(res.data, "orders", "data")))
      .catch(err => console.error("Failed to fetch orders:", err));

    axios.get("/api/admin/farmer-applications", { headers })
      .then(res => setFarmerApplications(normalizeArray<FarmerApplication>(res.data, "applications", "data")))
      .catch(err => console.error("Failed to fetch farmer applications:", err));

    axios.get("/api/admin/buyer-applications", { headers })
      .then(res => setBuyerApplications(normalizeArray<BuyerApplication>(res.data, "applications", "data")))
      .catch(err => console.error("Failed to fetch buyer applications:", err));
  }, []);

  const farmerUsers = farmers.filter(f => f.role === "farmer" || !f.role);

  // Farmer category analytics
  const farmerCategories = ["Arable", "Livestock", "Horticultural", "Poultry", "Fish", "Organic", "Dairy", "Mixed"];
  const categoryCounts = farmerCategories.map(cat =>
    farmerApplications.filter(a => {
      const appCat: string = (a as unknown as { application?: { farmerCategory?: string } }).application?.farmerCategory ?? "";
      return appCat.toLowerCase().includes(cat.toLowerCase());
    }).length
  );

  const farmerChartData = {
    labels: farmerCategories,
    datasets: [
      {
        label: "Farmer Applications by Category",
        data: categoryCounts,
        backgroundColor: [
          "#16a34a", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#10b981", "#6366f1", "#d97706"
        ]
      }
    ]
  };

  const orderStatusCounts = ["pending", "shipped", "delivered"].map(status =>
    orders.filter(o => o.status?.toLowerCase() === status).length
  );

  const orderChartData = {
    labels: ["Pending", "Shipped", "Delivered"],
    datasets: [
      {
        label: "Orders",
        data: orderStatusCounts,
        backgroundColor: ["#f59e0b", "#3b82f6", "#16a34a"]
      }
    ]
  };

  const pendingFarmerApps = farmerApplications.filter(a => a.status === "pending" || a.status === "submitted");
  const pendingBuyerApps = buyerApplications.filter(a => a.status === "pending" || a.status === "submitted");

  const handleApproveFarmerApp = async (applicationId: string) => {
    setApprovingFarmerAppId(applicationId);
    try {
      await axios.patch(
        `/api/admin/farmer-applications/${applicationId}/approve`,
        {},
        { headers: getAuthHeader() }
      );
      setFarmerApplications(prev =>
        prev.map(a => a.applicationId === applicationId ? { ...a, status: "approved" } : a)
      );
    } catch {
      alert("Failed to approve farmer application.");
    } finally {
      setApprovingFarmerAppId(null);
    }
  };

  const handleApproveBuyerApp = async (applicationId: string) => {
    setApprovingBuyerAppId(applicationId);
    try {
      await axios.patch(
        `/api/admin/buyer-applications/${applicationId}/approve`,
        {},
        { headers: getAuthHeader() }
      );
      setBuyerApplications(prev =>
        prev.map(a => a.applicationId === applicationId ? { ...a, status: "approved" } : a)
      );
    } catch {
      alert("Failed to approve buyer application.");
    } finally {
      setApprovingBuyerAppId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-linear-to-br from-green-900 via-green-800 to-green-700">
      {/* Sidebar */}
      <aside className="w-64 bg-linear-to-b from-green-900 to-green-700 text-white flex flex-col py-6 px-4 shadow-lg">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-white rounded-full p-1"><FaLeaf className="text-green-700 text-3xl" /></div>
          <span className="text-xl font-extrabold tracking-tight">Dos Agrolink</span>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem icon={<FaChartBar />} label="Dashboard" href="/admin" />
          <NavItem icon={<FaUserFriends />} label="Farmers" href="/admin/farmers" />
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

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-green-900">Welcome, Admin.</h1>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 w-40" />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <button className="relative bg-white p-2 rounded-full shadow hover:bg-green-100 focus:outline-none" aria-label="Notifications">
              <FaBell className="text-green-700 text-lg" />
              {(pendingFarmerApps.length + pendingBuyerApps.length) > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KpiCard icon={<FaUserFriends className="text-green-700 text-2xl" />} label="Total Users" value={farmers.length} />
          <KpiCard icon={<FaCheckCircle className="text-green-700 text-2xl" />} label="Approved Farmers" value={farmerUsers.filter(f => f.approved).length} />
          <KpiCard icon={<FaHourglassHalf className="text-amber-500 text-2xl" />} label="Pending Applications" value={pendingFarmerApps.length + pendingBuyerApps.length} />
          <KpiCard icon={<FaShoppingCart className="text-green-700 text-2xl" />} label="Total Orders" value={orders.length} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Farmer Applications by Category</h2>
            <Bar data={farmerChartData} />
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Orders by Status</h2>
            <Pie data={orderChartData} />
          </div>
        </div>

        {/* Pending Farmer Applications */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaUserFriends className="text-green-700" /> Pending Farmer Applications
            {pendingFarmerApps.length > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-2 py-0.5">{pendingFarmerApps.length}</span>
            )}
          </h2>
          {pendingFarmerApps.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending farmer applications.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingFarmerApps.map(app => (
                <div key={app._id} className="bg-white shadow rounded-lg p-4 border-l-4 border-green-500">
                  <p className="font-semibold text-gray-900">{app.account.name}</p>
                  <p className="text-sm text-gray-500">{app.account.email}</p>
                  <p className="text-sm text-gray-500">{app.account.phone}</p>
                  <p className="text-xs text-gray-400 mt-1">ID: {app.applicationId}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 capitalize">{app.status}</span>
                    <button
                      disabled={approvingFarmerAppId === app.applicationId}
                      onClick={() => handleApproveFarmerApp(app.applicationId)}
                      className="ml-auto bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 font-semibold disabled:opacity-60"
                    >
                      {approvingFarmerAppId === app.applicationId ? "Approving..." : "Approve"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending Buyer Applications */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaShoppingCart className="text-green-700" /> Pending Buyer Applications
            {pendingBuyerApps.length > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-2 py-0.5">{pendingBuyerApps.length}</span>
            )}
          </h2>
          {pendingBuyerApps.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending buyer applications.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingBuyerApps.map(app => (
                <div key={app._id} className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="font-semibold text-gray-900">{app.account.name}</p>
                  <p className="text-sm text-gray-500">{app.account.email}</p>
                  <p className="text-sm text-gray-500">{app.account.phone}</p>
                  <p className="text-xs text-gray-400 mt-1">ID: {app.applicationId}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 capitalize">{app.status}</span>
                    <button
                      disabled={approvingBuyerAppId === app.applicationId}
                      onClick={() => handleApproveBuyerApp(app.applicationId)}
                      className="ml-auto bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 font-semibold disabled:opacity-60"
                    >
                      {approvingBuyerAppId === app.applicationId ? "Approving..." : "Approve"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending Products */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaBoxOpen className="text-green-700" /> Pending Product Approvals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.filter(p => !p.approved).map(product => (
              <div key={product._id} className="bg-white shadow rounded-lg p-4 flex flex-col">
                <Image
                  src={product.image || product.imageUrl || "/placeholder.png"}
                  alt={product.name}
                  width={320}
                  height={128}
                  className="w-full h-32 object-cover rounded mb-3"
                />
                <h3 className="text-lg font-bold">{product.name}</h3>
                <p className="text-green-700 font-bold text-lg">₦{product.price.toLocaleString()}</p>
                <button
                  onClick={() => setModalProduct(product)}
                  className="bg-green-600 text-white px-4 py-2 rounded mt-auto hover:bg-green-700 font-semibold"
                >
                  Review & Approve
                </button>
              </div>
            ))}
            {products.filter(p => !p.approved).length === 0 && (
              <p className="text-gray-500 text-sm col-span-3">No products pending approval.</p>
            )}
          </div>

          {/* Product Approval Modal */}
          {modalProduct && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              tabIndex={-1}
              onKeyDown={e => { if (e.key === "Escape") setModalProduct(null); }}
            >
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative" tabIndex={0}>
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                  onClick={() => setModalProduct(null)}
                  aria-label="Close"
                >
                  ×
                </button>
                <Image
                  src={modalProduct.image || modalProduct.imageUrl || "/placeholder.png"}
                  alt={modalProduct.name}
                  width={400}
                  height={160}
                  className="w-full h-40 object-cover rounded mb-4"
                />
                <h3 id="modal-title" className="text-xl font-bold mb-2">{modalProduct.name}</h3>
                <p className="text-green-700 font-bold text-lg mb-2">₦{modalProduct.price.toLocaleString()}</p>
                <p className="text-gray-700 mb-2">{modalProduct.description}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold disabled:opacity-60"
                    disabled={approving}
                    onClick={async () => {
                      setApproving(true);
                      try {
                        await axios.patch(
                          `/api/admin/products/${modalProduct._id}/approve`,
                          {},
                          { headers: getAuthHeader() }
                        );
                        setProducts(prev => prev.map(p => p._id === modalProduct._id ? { ...p, approved: true } : p));
                        setModalProduct(null);
                      } catch {
                        alert("Failed to approve product.");
                      } finally {
                        setApproving(false);
                      }
                    }}
                  >
                    {approving ? "Approving..." : "Approve"}
                  </button>
                  <button
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 font-semibold"
                    onClick={() => setModalProduct(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Orders Table */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow rounded-lg">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="p-2 text-left">Order ID</th>
                  <th className="p-2 text-left">Product</th>
                  <th className="p-2 text-left">Buyer</th>
                  <th className="p-2 text-left">Quantity</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice((orderPage - 1) * ORDERS_PER_PAGE, orderPage * ORDERS_PER_PAGE).map(order => {
                  const productName = typeof order.productId === "object" ? order.productId?.name : order.productId;
                  const buyerName = order.user?.name || order.buyer || "—";
                  return (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="p-2 text-xs text-gray-600">{order._id.slice(-8)}</td>
                      <td className="p-2">{productName || "—"}</td>
                      <td className="p-2">{buyerName}</td>
                      <td className="p-2">{order.quantity ?? "—"}</td>
                      <td className="p-2">
                        <OrderStatusBadge status={order.status} />
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500 text-sm">No orders yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-end items-center gap-2 mt-4">
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => setOrderPage(p => Math.max(1, p - 1))}
              disabled={orderPage === 1}
            >
              Previous
            </button>
            <span className="text-sm font-semibold">
              Page {orderPage} of {Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE))}
            </span>
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => setOrderPage(p => Math.min(Math.ceil(orders.length / ORDERS_PER_PAGE), p + 1))}
              disabled={orderPage >= Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE))}
            >
              Next
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

// Sidebar Nav Item
function NavItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition ${active ? "bg-green-800/80 font-bold" : "hover:bg-green-800/40"}`}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

// KPI Card with animated counter
function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const raf = useRef<number>();

  React.useEffect(() => {
    const duration = 800;
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setDisplayValue(Math.floor(progress * value));
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value]);

  return (
    <div className="bg-white shadow rounded-lg p-5 flex flex-col items-center text-center">
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-bold text-green-900">{displayValue.toLocaleString()}</div>
      <div className="text-sm font-semibold text-gray-600 mt-1">{label}</div>
    </div>
  );
}

// Order Status Badge
function OrderStatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  let color = "bg-gray-300 text-gray-800";
  if (s === "pending") color = "bg-amber-400 text-amber-900";
  else if (s === "shipped") color = "bg-blue-400 text-blue-900";
  else if (s === "delivered") color = "bg-green-400 text-green-900";
  else if (s === "paid") color = "bg-purple-400 text-purple-900";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${color}`}>
      {status}
    </span>
  );
}

