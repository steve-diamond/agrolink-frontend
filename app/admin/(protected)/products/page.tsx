"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaUserFriends, FaUsers, FaShoppingCart, FaBoxOpen,
  FaChartBar, FaCog, FaBell, FaSearch, FaCheckCircle, FaHourglassHalf
} from "react-icons/fa";
import axios from "axios";

type Product = {
  _id: string;
  name: string;
  price: number;
  approved?: boolean;
  image?: string;
  imageUrl?: string;
  description?: string;
  category?: string;
  seller?: { name?: string; email?: string } | string;
  createdAt?: string;
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const headers = getAuthHeader();
    if (!headers.Authorization) return;
    axios.get("/api/admin/products", { headers })
      .then(res => setProducts(normalizeArray<Product>(res.data, "products", "data")))
      .catch(err => console.error("Failed to fetch products:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (productId: string) => {
    setApproving(true);
    try {
      await axios.patch(`/api/admin/products/${productId}/approve`, {}, { headers: getAuthHeader() });
      setProducts(prev => prev.map(p => p._id === productId ? { ...p, approved: true } : p));
      setModalProduct(null);
    } catch {
      alert("Failed to approve product.");
    } finally {
      setApproving(false);
    }
  };

  const filtered = products
    .filter(p => tab === "pending" ? !p.approved : true)
    .filter(p =>
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
    );

  const pendingCount = products.filter(p => !p.approved).length;

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
            <h1 className="text-2xl font-bold text-green-900">Products</h1>
            <p className="text-sm text-gray-500 mt-1">Review and approve product listings</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 w-52"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
            </div>
            <button className="relative bg-white p-2 rounded-full shadow hover:bg-green-100" aria-label="Notifications">
              <FaBell className="text-green-700 text-lg" />
              {pendingCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            <FaBoxOpen className="text-green-600 text-3xl" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Products</p>
              <p className="text-2xl font-bold text-gray-800">{products.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            <FaCheckCircle className="text-emerald-500 text-3xl" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Approved</p>
              <p className="text-2xl font-bold text-gray-800">{products.filter(p => p.approved).length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            <FaHourglassHalf className="text-amber-500 text-3xl" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setTab("pending")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === "pending" ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Pending
            {pendingCount > 0 && <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingCount}</span>}
          </button>
          <button
            onClick={() => setTab("all")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === "all" ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            All Products
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-sm">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(product => (
              <div key={product._id} className="bg-white shadow rounded-xl overflow-hidden flex flex-col">
                <div className="relative h-40 w-full bg-gray-100">
                  <Image
                    src={product.image || product.imageUrl || "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <span className={`absolute top-2 right-2 text-xs rounded-full px-2 py-0.5 font-semibold ${product.approved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                    {product.approved ? "Approved" : "Pending"}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                  {product.category && <p className="text-xs text-gray-400 mb-2">{product.category}</p>}
                  <p className="text-green-700 font-bold text-lg mb-3">₦{product.price.toLocaleString()}</p>
                  {!product.approved && (
                    <button
                      onClick={() => setModalProduct(product)}
                      className="mt-auto bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
                    >
                      Review & Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Approval Modal */}
      {modalProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          onClick={e => { if (e.target === e.currentTarget) setModalProduct(null); }}
        >
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl leading-none"
              onClick={() => setModalProduct(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="relative h-44 w-full rounded-lg overflow-hidden mb-4 bg-gray-100">
              <Image
                src={modalProduct.image || modalProduct.imageUrl || "/placeholder.png"}
                alt={modalProduct.name}
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-xl font-bold mb-1">{modalProduct.name}</h3>
            {modalProduct.category && <p className="text-xs text-gray-400 mb-2">{modalProduct.category}</p>}
            <p className="text-green-700 font-bold text-lg mb-2">₦{modalProduct.price.toLocaleString()}</p>
            {modalProduct.description && <p className="text-gray-600 text-sm mb-4">{modalProduct.description}</p>}
            <div className="flex gap-3">
              <button
                disabled={approving}
                onClick={() => handleApprove(modalProduct._id)}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60"
              >
                {approving ? "Approving..." : "Approve"}
              </button>
              <button
                onClick={() => setModalProduct(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
