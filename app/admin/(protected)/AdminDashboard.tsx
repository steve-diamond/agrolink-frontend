"use client";


import React, { useState, useEffect } from "react";
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
  category: string;
  verified?: boolean;
  // add other properties as needed
};

type Product = {
  _id: string;
  name: string;
  price: number;
  approved?: boolean;
  image?: string;
  description?: string;
  // add other properties as needed
};

type Order = {
  _id: string;
  productId: string;
  buyer: string;
  quantity: number;
  status: string;
  // add other properties as needed
};

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale);


export default function AdminDashboard() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [approving, setApproving] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const ORDERS_PER_PAGE = 8;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    if (!token) return;
    axios.get("/api/farmers", { headers: { Authorization: token } })
      .then(res => setFarmers(res.data))
      .catch(err => console.error(err));

    axios.get("/api/products", { headers: { Authorization: token } })
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));

    axios.get("/api/orders", { headers: { Authorization: token } })
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  }, [token]);

  // Farmer category analytics
  const farmerCategories = ["Arable", "Livestock", "Horticultural", "Poultry", "Fish", "Organic", "Dairy", "Mixed"];
  const categoryCounts = farmerCategories.map(cat =>
    farmers.filter(f => f.category === cat).length
  );

  const farmerChartData = {
    labels: farmerCategories,
    datasets: [
      {
        label: "Farmers by Category",
        data: categoryCounts,
        backgroundColor: [
          "#16a34a", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#10b981", "#6366f1", "#d97706"
        ]
      }
    ]
  };

  const orderStatusCounts = ["Pending", "Shipped", "Delivered"].map(status =>
    orders.filter(o => o.status === status).length
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

  return (
    <div className="flex min-h-screen bg-linear-to-br from-green-900 via-green-800 to-green-700">
      {/* Sidebar */}
      <aside className="w-64 bg-linear-to-b from-green-900 to-green-700 text-white flex flex-col py-6 px-4 shadow-lg">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-white rounded-full p-1"><FaLeaf className="text-green-700 text-3xl" /></div>
          <span className="text-xl font-extrabold tracking-tight">Dos Agrolink</span>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem icon={<FaChartBar />} label="Dashboard" href="/admin/(protected)" />
          <NavItem icon={<FaUserFriends />} label="Farmers" href="/admin/(protected)/farmers" />
          <NavItem icon={<FaBoxOpen />} label="Products" href="/admin/(protected)/products" />
          <NavItem icon={<FaShoppingCart />} label="Orders" href="/admin/(protected)/orders" />
          <NavItem icon={<FaChartBar />} label="Analytics" href="/admin/(protected)/analytics" />
          <NavItem icon={<FaCog />} label="Settings" href="/admin/(protected)/settings" />
        </nav>
        <div className="mt-10 flex items-center gap-3">
          <Image src="/admin-avatar.png" alt="Admin" width={40} height={40} className="w-10 h-10 rounded-full border-2 border-green-300" />
          <span className="font-semibold">Admin</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-green-900">Welcome, Admin.</h1>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 group-focus-within:w-64 w-40" />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <div className="relative group">
              <button className="relative bg-white p-2 rounded-full shadow hover:bg-green-100 focus:outline-none" aria-label="Notifications">
                <FaBell className="text-green-700 text-lg" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {/* Notification Dropdown */}
              <div className="hidden group-focus-within:block absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-10">
                <div className="p-4 text-sm text-gray-700">No new notifications.</div>
              </div>
            </div>
            <div className="relative group">
              <Image src="/admin-avatar.png" alt="Admin" width={40} height={40} className="w-10 h-10 rounded-full border-2 border-green-300 cursor-pointer" tabIndex={0} />
              {/* User Dropdown */}
              <div className="hidden group-focus-within:block absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-10">
                <div className="p-4 text-sm text-gray-700">Signed in as <b>Admin</b></div>
                <div className="border-t"><button className="w-full text-left px-4 py-2 hover:bg-green-50">Profile</button></div>
                <div><button className="w-full text-left px-4 py-2 hover:bg-green-50">Logout</button></div>
              </div>
            </div>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KpiCard icon={<FaUserFriends className="text-green-700 text-2xl" />} label="Total Farmers" value={farmers.length.toLocaleString()} />
          <KpiCard icon={<FaCheckCircle className="text-green-700 text-2xl" />} label="Verified Farmers" value={farmers.filter(f => f.verified).length.toLocaleString()} />
          <KpiCard icon={<FaHourglassHalf className="text-amber-500 text-2xl" />} label="Pending Products" value={products.filter(p => !p.approved).length.toLocaleString()} />
          <KpiCard icon={<FaShoppingCart className="text-green-700 text-2xl" />} label="Active Orders" value={orders.length.toLocaleString()} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Farmers by Category</h2>
            <Bar data={farmerChartData} />
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Orders Status</h2>
            <Pie data={orderChartData} />
          </div>
        </div>

        {/* Pending Products */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Pending Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.filter(p => !p.approved).map(product => (
              <div key={product._id} className="bg-white shadow rounded-lg p-4 flex flex-col">
                <Image src={product.image || "/placeholder.png"} alt={product.name} width={320} height={128} className="w-full h-32 object-cover rounded mb-3" />
                <h3 className="text-lg font-bold">{product.name}</h3>
                <p className="text-green-700 font-bold text-lg">₦{product.price.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mb-2">Board name</p>
                <button
                  onClick={() => setModalProduct(product)}
                  className="bg-green-600 text-white px-4 py-2 rounded mt-auto hover:bg-green-700 font-semibold"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
          {/* Modal for product approval */}
          {modalProduct && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              tabIndex={-1}
              onKeyDown={e => {
                if (e.key === "Escape") setModalProduct(null);
              }}
            >
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative animate-fade-in" tabIndex={0}>
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                  onClick={() => setModalProduct(null)}
                  aria-label="Close"
                >
                  ×
                </button>
                <Image src={modalProduct.image || "/placeholder.png"} alt={modalProduct.name} width={400} height={160} className="w-full h-40 object-cover rounded mb-4" />
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
                        await axios.put(`/api/products/${modalProduct._id}/approve`, {}, { headers: { Authorization: token } });
                        setProducts(prev => prev.map(p => p._id === modalProduct._id ? { ...p, approved: true } : p));
                        setModalProduct(null);
                      } catch (e) {
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
          <h2 className="text-lg font-semibold mb-4">Orders</h2>
          <table className="w-full bg-white shadow rounded-lg">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="p-2">Order ID</th>
                <th className="p-2">Product</th>
                <th className="p-2">Buyer</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice((orderPage-1)*ORDERS_PER_PAGE, orderPage*ORDERS_PER_PAGE).map(order => (
                <tr key={order._id} className="border-b">
                  <td className="p-2">{order._id}</td>
                  <td className="p-2">{order.productId}</td>
                  <td className="p-2">{order.buyer}</td>
                  <td className="p-2">{order.quantity}</td>
                  <td className="p-2">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div className="flex justify-end items-center gap-2 mt-4">
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => setOrderPage(p => Math.max(1, p-1))}
              disabled={orderPage === 1}
            >
              Previous
            </button>
            <span className="text-sm font-semibold">Page {orderPage} of {Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE))}</span>
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => setOrderPage(p => Math.min(Math.ceil(orders.length / ORDERS_PER_PAGE), p+1))}
              disabled={orderPage === Math.ceil(orders.length / ORDERS_PER_PAGE) || orders.length === 0}
            >
              Next
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

// Sidebar Nav Item with Next.js Link, active state, and accessibility
function NavItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link href={href} legacyBehavior>
      <a
        className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition group relative ${active ? "bg-green-800/80 font-bold" : "hover:bg-green-800/40"}`}
        aria-current={active ? "page" : undefined}
        tabIndex={0}
        title={label}
        aria-label={label}
      >
        {icon}
        <span>{label}</span>
        <span className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 bg-green-900 text-white text-xs rounded px-2 py-1 pointer-events-none transition-opacity">
          {label}
        </span>
      </a>
    </Link>
  );
}

// KPI Card with animated number
import { useRef } from "react";
function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const target = typeof value === "string" ? parseInt(value.replace(/,/g, "")) : Number(value);
  const raf = useRef<number>();

  React.useEffect(() => {
    const start = 0;
    const duration = 800;
    const startTime = performance.now();
    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * (target - start) + start);
      setDisplayValue(current);
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(target);
      }
    }
    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
      }
    };
    // eslint-disable-next-line
  }, [target]);

  return (
    <div className="bg-white shadow rounded-lg p-5 flex flex-col items-center text-center">
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-bold text-green-900">{displayValue.toLocaleString()}</div>
      <div className="text-sm font-semibold text-gray-600 flex items-center gap-1 mt-1">{label}</div>
    </div>
  );
}

// Order Status Badge with tooltip and accessibility
function OrderStatusBadge({ status }: { status: string }) {
  let color = "bg-gray-300 text-gray-800";
  let tooltip = "Unknown status";
  if (status === "Pending") {
    color = "bg-amber-400 text-amber-900";
    tooltip = "Order is pending approval or shipment.";
  }
  if (status === "Shipped") {
    color = "bg-blue-400 text-blue-900";
    tooltip = "Order has been shipped.";
  }
  if (status === "Delivered") {
    color = "bg-green-400 text-green-900";
    tooltip = "Order delivered to customer.";
  }
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold relative group cursor-help ${color}`}
      tabIndex={0}
      aria-label={tooltip}
    >
      {status}
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-max max-w-xs bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none z-20 transition-opacity">
        {tooltip}
      </span>
    </span>
  );
}
