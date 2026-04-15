"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import API from "@services/api";

type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: "farmer" | "buyer" | "admin";
};

type Product = {
  _id: string;
  name: string;
  quantity: number;
};

type Order = {
  _id: string;
  status: string;
  totalAmount?: number;
  totalPrice?: number;
  createdAt?: string;
  paymentStatus?: string;
};

function formatNaira(value: number) {
  return `N${Math.round(value).toLocaleString()}`;
}

function FarmerDashboard({ user }: { user: AuthUser }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get("/api/products"), API.get("/api/orders")])
      .then(([productsRes, ordersRes]) => {
        const allProducts = Array.isArray(productsRes.data)
          ? productsRes.data
          : Array.isArray(productsRes.data?.products)
          ? productsRes.data.products
          : [];

        const allOrders = Array.isArray(ordersRes.data)
          ? ordersRes.data
          : Array.isArray(ordersRes.data?.orders)
          ? ordersRes.data.orders
          : [];

        setProducts(allProducts.filter((item: any) => item?.farmer === user._id || item?.owner === user._id));
        setOrders(allOrders);
      })
      .catch(() => {
        setProducts([]);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, [user._id]);

  const walletBalance = useMemo(() => {
    const paidOrders = orders.filter((order) => String(order.paymentStatus || "").toLowerCase() === "paid");
    const total = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount ?? order.totalPrice ?? 0), 0);
    return total;
  }, [orders]);

  const activeLoans = 2;
  const pendingOrders = orders.filter((order) => !String(order.status || "").toLowerCase().includes("completed")).length;
  const storedKg = products.reduce((sum, product) => sum + Number(product.quantity || 0), 0) * 25;

  return (
    <main className="dash-page">
      <section className="dash-hero">
        <Image src="/agropro/images/banner.jpg" alt="Farmer dashboard" fill className="dash-hero-bg" sizes="100vw" />
        <div className="dash-hero-overlay" />
        <div className="dash-hero-content">
          <p className="dash-kicker">DosAgrolink</p>
          <h1>{user.name}&apos;s Dashboard</h1>
          <p>Track and manage your farm activities with ease.</p>
        </div>
      </section>

      <section className="dash-kpi-grid" aria-label="Key metrics">
        <article className="dash-kpi">
          <h2>Wallet Balance</h2>
          <strong>{formatNaira(walletBalance || 150500)}</strong>
        </article>
        <article className="dash-kpi">
          <h2>Active Loans</h2>
          <strong>{activeLoans}</strong>
        </article>
        <article className="dash-kpi">
          <h2>Pending Orders</h2>
          <strong>{pendingOrders || 3}</strong>
        </article>
      </section>

      <section className="dash-grid-two">
        <article className="dash-card">
          <h3>My Loan</h3>
          <p className="dash-amount">{formatNaira(100000)}</p>
          <p className="dash-muted">Due: May 15, 2026</p>
          <Link href="/loan-application" className="dash-btn-primary">Pay Now</Link>
        </article>

        <article className="dash-card">
          <h3>Logistics Tracker</h3>
          <p>In Transit: Abuja to Kano</p>
          <p className="dash-muted">Arrival: Apr 22</p>
          <Link href="/logistics" className="dash-btn-primary">Track Shipment</Link>
        </article>
      </section>

      <section className="dash-grid-two">
        <article className="dash-card">
          <h3>Warehouse Storage</h3>
          <p className="dash-amount">{storedKg.toLocaleString()} kg</p>
          <p className="dash-muted">Stored safely until next market cycle.</p>
          <Link href="/warehouse" className="dash-btn-secondary">Manage Storage</Link>
        </article>

        <article className="dash-card">
          <h3>Farming Tips</h3>
          <ul className="dash-tips">
            <li>Boost maize yield with split fertilizer timing.</li>
            <li>Use early harvest sorting for better pricing.</li>
            <li>Bundle logistics with nearby farmers.</li>
          </ul>
          <Link href="/vision" className="dash-btn-secondary">Read More</Link>
        </article>
      </section>

      <section className="dash-card">
        <div className="dash-card-head">
          <h3>Recent Transactions</h3>
          <Link href="/orders">View All</Link>
        </div>
        {loading ? <p className="dash-muted">Loading transactions...</p> : null}
        {!loading && orders.length === 0 ? <p className="dash-muted">No transactions yet.</p> : null}
        {!loading && orders.length > 0 ? (
          <div className="dash-table">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="dash-row">
                <span>{order.status}</span>
                <span>{formatNaira(Number(order.totalAmount ?? order.totalPrice ?? 0) || 0)}</span>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="dash-links" aria-label="Quick links">
        <Link href="/marketplace">Marketplace</Link>
        <Link href="/product-listing">My Listings</Link>
        <Link href="/investor">Investor Desk</Link>
        <Link href="/admin/login">Admin</Link>
      </section>
    </main>
  );
}

function BuyerDashboard({ user }: { user: AuthUser }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/api/orders")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.orders)
          ? res.data.orders
          : [];
        setOrders(data);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="dash-page">
      <section className="dash-card">
        <h1 className="dash-title">Welcome back, {user.name}</h1>
        <p className="dash-muted">Buyer dashboard connected to marketplace, logistics, and warehouse operations.</p>
      </section>

      <section className="dash-grid-two">
        <article className="dash-card">
          <h3>Open Orders</h3>
          <p className="dash-amount">{orders.length}</p>
          <Link href="/orders" className="dash-btn-primary">View Orders</Link>
        </article>

        <article className="dash-card">
          <h3>Sourcing Hub</h3>
          <p className="dash-muted">Find verified farmers and negotiate directly.</p>
          <Link href="/marketplace" className="dash-btn-primary">Open Marketplace</Link>
        </article>
      </section>

      <section className="dash-links">
        <Link href="/logistics">Logistics</Link>
        <Link href="/warehouse">Warehouse</Link>
        <Link href="/investor">Investor Desk</Link>
        <Link href="/admin/login">Admin</Link>
      </section>

      {loading ? <p className="dash-muted">Loading...</p> : null}
    </main>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    if (!token || !rawUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(rawUser) as AuthUser;
      if (parsed.role === "admin") {
        router.replace("/admin");
        return;
      }
      setUser(parsed);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (!user) {
    return <main className="p-8 text-center text-slate-600">Loading dashboard...</main>;
  }

  if (user.role === "buyer") {
    return <BuyerDashboard user={user} />;
  }

  return <FarmerDashboard user={user} />;
}
