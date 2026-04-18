"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import API from "@services/api";
import { getLoans, Loan, repayLoan } from "@services/loanService";
import { getShipments, Shipment } from "@services/logisticsService";
import { getStorage, Storage } from "@services/warehouseService";
import { getFarmingTips, FarmingTip } from "@services/farmingTipsService";

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


  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [storage, setStorage] = useState<Storage[]>([]);
  const [farmingTips, setFarmingTips] = useState<FarmingTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [repayLoading, setRepayLoading] = useState(false);
  const [repayMessage, setRepayMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      API.get("/api/products"),
      API.get("/api/orders"),
      getLoans(user._id),
      getShipments(user._id),
      getStorage(user._id),
      getFarmingTips(),
    ])
      .then(([productsRes, ordersRes, loansRes, shipmentsRes, storageRes, tipsRes]) => {
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
        setLoans(loansRes);
        setShipments(shipmentsRes);
        setStorage(storageRes);
        setFarmingTips(tipsRes);
      })
      .catch(() => {
        setProducts([]);
        setOrders([]);
        setLoans([]);
        setShipments([]);
        setStorage([]);
        setFarmingTips([]);
      })
      .finally(() => setLoading(false));
  }, [user._id]);

  const walletBalance = useMemo(() => {
    const paidOrders = orders.filter((order) => String(order.paymentStatus || "").toLowerCase() === "paid");
    const total = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount ?? order.totalPrice ?? 0), 0);
    return total;
  }, [orders]);

  const activeLoans = loans.filter((loan) => loan.status === "active").length;
  const mostRecentActiveLoan = loans.filter((loan) => loan.status === "active").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const pendingOrders = orders.filter((order) => !String(order.status || "").toLowerCase().includes("completed")).length;
  const storedKg = storage.reduce((sum, s) => sum + Number(s.quantityKg || 0), 0);
  const mostRecentInTransit = shipments.filter((s) => s.status === "in_transit").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

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
          {mostRecentActiveLoan ? (
            <>
              <p className="dash-amount">{formatNaira(mostRecentActiveLoan.amount)}</p>
              <p className="dash-muted">Due: {new Date(mostRecentActiveLoan.dueDate).toLocaleDateString()}</p>
            </>
          ) : (
            <p className="dash-muted">No active loans</p>
          )}
          {mostRecentActiveLoan && (
            <button
              className="dash-btn-primary"
              disabled={repayLoading}
              onClick={async () => {
                setRepayLoading(true);
                setRepayMessage(null);
                try {
                  const res = await repayLoan(mostRecentActiveLoan._id);
                  setRepayMessage(res.message);
                  if (res.success) {
                    // Refresh loans
                    const updatedLoans = await getLoans(user._id);
                    setLoans(updatedLoans);
                  }
                } catch (err) {
                  setRepayMessage("Repayment failed. Please try again.");
                } finally {
                  setRepayLoading(false);
                }
              }}
            >
              {repayLoading ? "Processing..." : "Pay Now"}
            </button>
          )}
          {repayMessage && <p className="dash-muted mt-2">{repayMessage}</p>}
        </article>

        <article className="dash-card">
          <h3>Logistics Tracker</h3>
          {mostRecentInTransit ? (
            <>
              <p>In Transit: {mostRecentInTransit.from} to {mostRecentInTransit.to}</p>
              <p className="dash-muted">Arrival: {new Date(mostRecentInTransit.estimatedArrival).toLocaleDateString()}</p>
            </>
          ) : (
            <p className="dash-muted">No active shipments</p>
          )}
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
            {farmingTips.length > 0 ? (
              farmingTips.slice(0, 3).map((tip) => <li key={tip._id}>{tip.text}</li>)
            ) : (
              <li>No tips available</li>
            )}
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
