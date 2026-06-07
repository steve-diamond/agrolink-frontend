"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  FaUserFriends, FaUsers, FaShoppingCart, FaBoxOpen,
  FaChartBar, FaCog, FaBell
} from "react-icons/fa";
import axios from "axios";
import dynamic from "next/dynamic";
import type { AdminAnalyticsChartsProps } from "./AdminAnalyticsCharts";
import { SkeletonChart } from "@/components/ui/Skeleton";

const AdminAnalyticsCharts = dynamic<AdminAnalyticsChartsProps>(
  () => import("./AdminAnalyticsCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow p-6">
            <SkeletonChart bars={6} height="h-48" />
          </div>
        ))}
      </div>
    ),
  },
);

type User = { _id: string; role?: string; approved?: boolean; createdAt?: string };
type Product = { _id: string; approved?: boolean; category?: string; createdAt?: string };
type Order = { _id: string; status: string; totalAmount?: number; totalPrice?: number; createdAt?: string };
type FarmerApp = { _id: string; status: string; application?: { farmerCategory?: string } };

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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FARMER_CATEGORIES = ["Arable", "Livestock", "Horticultural", "Poultry", "Fish", "Organic", "Dairy", "Mixed"];

export default function AdminAnalyticsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [farmerApps, setFarmerApps] = useState<FarmerApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = getAuthHeader();
    if (!headers.Authorization) return;
    Promise.all([
      axios.get("/api/admin/users", { headers }),
      axios.get("/api/admin/products", { headers }),
      axios.get("/api/admin/orders", { headers }),
      axios.get("/api/admin/farmer-applications", { headers }),
    ])
      .then(([u, p, o, fa]) => {
        setUsers(normalizeArray<User>(u.data, "users", "data"));
        setProducts(normalizeArray<Product>(p.data, "products", "data"));
        setOrders(normalizeArray<Order>(o.data, "orders", "data"));
        setFarmerApps(normalizeArray<FarmerApp>(fa.data, "applications", "data"));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Orders per month (last 6 months)
  const now = new Date();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: MONTHS[d.getMonth()], year: d.getFullYear(), month: d.getMonth() };
  });
  const ordersPerMonth = last6Months.map(({ year, month }) =>
    orders.filter(o => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length
  );

  // Revenue per month
  const revenuePerMonth = last6Months.map(({ year, month }) =>
    orders
      .filter(o => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, o) => sum + (o.totalAmount ?? o.totalPrice ?? 0), 0)
  );

  // Order status breakdown
  const orderStatuses = ["pending", "shipped", "delivered", "cancelled"];
  const orderStatusData = orderStatuses.map(s => orders.filter(o => o.status?.toLowerCase() === s).length);

  // Farmer category breakdown
  const categoryData = FARMER_CATEGORIES.map(cat =>
    farmerApps.filter(a => {
      const c: string = (a.application?.farmerCategory ?? "");
      return c.toLowerCase().includes(cat.toLowerCase());
    }).length
  );

  // User role breakdown
  const farmers = users.filter(u => u.role === "farmer");
  const buyers = users.filter(u => u.role === "buyer");
  const admins = users.filter(u => u.role === "admin");

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount ?? o.totalPrice ?? 0), 0);

  return (
    <div className="flex min-h-screen bg-linear-to-br from-green-900 via-green-800 to-green-700">
      {/* Sidebar */}
      <aside className="w-64 bg-linear-to-b from-green-900 to-green-700 text-white flex flex-col py-6 px-4 shadow-lg">
        <div className="flex items-center gap-3 mb-10">
          <OptimizedImage
            src="/dos-agrolink-logo.jpg"
            alt="Dos Agrolink"
            width={40}
            height={40}
            priority
            sizesContext="logo"
            className="rounded-full object-cover border-2 border-white/50"
          />
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
            <h1 className="text-2xl font-bold text-green-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Platform performance overview</p>
          </div>
          <button className="bg-white p-2 rounded-full shadow hover:bg-green-100" aria-label="Notifications">
            <FaBell className="text-green-700 text-lg" />
          </button>
        </header>

        {/* KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: users.length, color: "text-green-600" },
            { label: "Total Orders", value: orders.length, color: "text-blue-600" },
            { label: "Total Products", value: products.length, color: "text-purple-600" },
            { label: "Total Revenue", value: `₦${totalRevenue.toLocaleString()}`, color: "text-amber-600" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6">
                <SkeletonChart bars={6} height="h-48" />
              </div>
            ))}
          </div>
        ) : (
          <AdminAnalyticsCharts
            monthLabels={last6Months.map((m) => m.label)}
            ordersPerMonth={ordersPerMonth}
            revenuePerMonth={revenuePerMonth}
            orderStatuses={orderStatuses}
            orderStatusData={orderStatusData}
            farmerCategories={FARMER_CATEGORIES}
            categoryData={categoryData}
            userBreakdown={{
              farmers: farmers.length,
              approvedFarmers: farmers.filter((f) => f.approved).length,
              buyers: buyers.length,
              approvedBuyers: buyers.filter((b) => b.approved).length,
              admins: admins.length,
              other: users.length - farmers.length - buyers.length - admins.length,
            }}
          />
        )}
      </main>
    </div>
  );
}
