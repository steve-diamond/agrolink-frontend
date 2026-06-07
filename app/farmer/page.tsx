"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { getLoans, Loan, repayLoan } from "@services/loanService";
import { getShipments, Shipment } from "@services/logisticsService";
import { getStorage, Storage } from "@services/warehouseService";
import { getFarmingTips } from "@services/farmingTipsService";

type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
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
  return `₦${Math.round(value).toLocaleString()}`;
}

export default function FarmerPage() {
  const router = useRouter();
  const currentPath = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [storage, setStorage] = useState<Storage[]>([]);
  const [farmingTips, setFarmingTips] = useState<{ title: string; content: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [repayLoading, setRepayLoading] = useState(false);
  const [repayMessage, setRepayMessage] = useState<string | null>(null);

  // Auth guard
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
      if (parsed.role === "buyer") {
        router.replace("/dashboard");
        return;
      }
      setUser(parsed);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  // Fetch data once user is set
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      axios.get("/api/orders", { headers }),
      getLoans(user._id),
      getShipments(user._id),
      getStorage(user._id),
      getFarmingTips(),
    ])
      .then(([ordersRes, loansRes, shipmentsRes, storageRes, tipsRes]) => {
        const raw = ordersRes.data;
        const allOrders: Order[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.orders)
          ? raw.orders
          : [];
        setOrders(allOrders);
        setLoans(loansRes);
        setShipments(shipmentsRes);
        setStorage(storageRes);
        setFarmingTips(
          Array.isArray(tipsRes)
            ? tipsRes.map((tip: { _id: string; text: string }) => ({ title: tip._id, content: tip.text }))
            : []
        );
      })
      .catch(() => {
        setOrders([]);
        setLoans([]);
        setShipments([]);
        setStorage([]);
        setFarmingTips([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const walletBalance = useMemo(() => {
    const paid = orders.filter(o => String(o.paymentStatus || "").toLowerCase() === "paid");
    return paid.reduce((sum, o) => sum + Number(o.totalAmount ?? o.totalPrice ?? 0), 0);
  }, [orders]);

  const activeLoans = loans.filter(l => l.status === "active").length;
  const mostRecentActiveLoan = loans
    .filter(l => l.status === "active")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const pendingOrders = orders.filter(o => !String(o.status || "").toLowerCase().includes("completed")).length;
  const storedKg = storage.reduce((sum, s) => sum + Number(s.quantityKg || 0), 0);
  const mostRecentInTransit = shipments
    .filter(s => s.status === "in_transit")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  if (!user) {
    return <main className="p-8 text-center text-slate-600">Loading…</main>;
  }

  return (
    <main className="dash-page">
      {/* Hero */}
      <section className="dash-hero">
        <Image
          src="/agropro/images/banner.jpg"
          alt="Farmer dashboard"
          fill
          className="dash-hero-bg"
          sizes="100vw"
          priority
        />
        <div className="dash-hero-overlay" />
        <div className="dash-hero-content">
          <p className="dash-kicker">DosAgrolink</p>
          <h1>{user.name}&apos;s Dashboard</h1>
          <p>Track and manage your farm activities with ease.</p>
        </div>
      </section>

      {/* KPI Strip */}
      <section className="dash-kpi-grid" aria-label="Key metrics">
        <article className="dash-kpi">
          <h2>Wallet Balance</h2>
          <strong>{loading ? "—" : formatNaira(walletBalance)}</strong>
        </article>
        <article className="dash-kpi">
          <h2>Active Loans</h2>
          <strong>{loading ? "—" : activeLoans}</strong>
        </article>
        <article className="dash-kpi">
          <h2>Pending Orders</h2>
          <strong>{loading ? "—" : pendingOrders}</strong>
        </article>
      </section>

      {/* Loan + Logistics */}
      <section className="dash-grid-two">
        <article className="dash-card">
          <h3>My Loan</h3>
          {loading ? (
            <p className="dash-muted">Loading…</p>
          ) : mostRecentActiveLoan ? (
            <>
              <p className="dash-amount">{formatNaira(mostRecentActiveLoan.amount)}</p>
              <p className="dash-muted">Due: {new Date(mostRecentActiveLoan.dueDate).toLocaleDateString()}</p>
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
                      const updated = await getLoans(user._id);
                      setLoans(updated);
                    }
                  } catch {
                    setRepayMessage("Repayment failed. Please try again.");
                  } finally {
                    setRepayLoading(false);
                  }
                }}
              >
                {repayLoading ? "Processing…" : "Pay Now"}
              </button>
              {repayMessage && (
                <p
                  className="dash-muted mt-2"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {repayMessage}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="dash-muted">No active loans.</p>
              <Link href="/loan-application" className="dash-btn-secondary">Apply for Loan</Link>
            </>
          )}
        </article>

        <article className="dash-card">
          <h3>Logistics Tracker</h3>
          {loading ? (
            <p className="dash-muted">Loading…</p>
          ) : mostRecentInTransit ? (
            <>
              <p>In Transit: {mostRecentInTransit.from} → {mostRecentInTransit.to}</p>
              <p className="dash-muted">
                Arrival: {new Date(mostRecentInTransit.estimatedArrival).toLocaleDateString()}
              </p>
            </>
          ) : (
            <p className="dash-muted">No active shipments.</p>
          )}
          <Link href="/logistics" className="dash-btn-primary">Track Shipment</Link>
        </article>
      </section>

      {/* Warehouse + Tips */}
      <section className="dash-grid-two">
        <article className="dash-card">
          <h3>Warehouse Storage</h3>
          <p className="dash-amount">{loading ? "—" : `${storedKg.toLocaleString()} kg`}</p>
          <p className="dash-muted">Stored safely until next market cycle.</p>
          <Link href="/warehouse" className="dash-btn-secondary">Manage Storage</Link>
        </article>

        <article className="dash-card">
          <h3>Farming Tips</h3>
          <ul className="dash-tips">
            {farmingTips.length > 0 ? (
              farmingTips.slice(0, 3).map(tip => <li key={tip.title}>{tip.content}</li>)
            ) : (
              <li>No tips available.</li>
            )}
          </ul>
          <Link href="/vision" className="dash-btn-secondary">Read More</Link>
        </article>
      </section>

      {/* Recent Transactions */}
      <section className="dash-card">
        <div className="dash-card-head">
          <h3>Recent Transactions</h3>
          <Link href="/orders">View All</Link>
        </div>
        {loading ? (
          <p className="dash-muted" aria-busy="true">Loading transactions…</p>
        ) : orders.length === 0 ? (
          <p className="dash-muted">No transactions yet.</p>
        ) : (
          <table className="dash-table w-full text-sm" aria-label="Recent transactions">
            <caption className="sr-only">Your 5 most recent transactions</caption>
            <thead>
              <tr>
                <th scope="col" className="text-left py-1 pr-4">Status</th>
                <th scope="col" className="text-right py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(order => (
                <tr key={order._id} className="dash-row border-t">
                  <td className="py-1 pr-4">{order.status}</td>
                  <td className="py-1 text-right">{formatNaira(Number(order.totalAmount ?? order.totalPrice ?? 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Quick Links */}
      <nav aria-label="Quick links" className="dash-links">
        <ul className="contents">
          <li><Link href="/marketplace" aria-current={currentPath === "/marketplace" ? "page" : undefined} className={currentPath === "/marketplace" ? "active-link" : ""}>Marketplace</Link></li>
          <li><Link href="/product-listing" aria-current={currentPath === "/product-listing" ? "page" : undefined} className={currentPath === "/product-listing" ? "active-link" : ""}>My Listings</Link></li>
          <li><Link href="/farmer/upload" aria-current={currentPath === "/farmer/upload" ? "page" : undefined} className={currentPath === "/farmer/upload" ? "active-link" : ""}>Upload Product</Link></li>
          <li><Link href="/farmer/wallet" aria-current={currentPath === "/farmer/wallet" ? "page" : undefined} className={currentPath === "/farmer/wallet" ? "active-link" : ""}>Wallet</Link></li>
          <li><Link href="/loan-application" aria-current={currentPath === "/loan-application" ? "page" : undefined} className={currentPath === "/loan-application" ? "active-link" : ""}>Apply for Loan</Link></li>
          <li><Link href="/logistics" aria-current={currentPath === "/logistics" ? "page" : undefined} className={currentPath === "/logistics" ? "active-link" : ""}>Logistics</Link></li>
          <li><Link href="/warehouse" aria-current={currentPath === "/warehouse" ? "page" : undefined} className={currentPath === "/warehouse" ? "active-link" : ""}>Warehouse</Link></li>
          <li><Link href="/investor" aria-current={currentPath === "/investor" ? "page" : undefined} className={currentPath === "/investor" ? "active-link" : ""}>Investor Desk</Link></li>
        </ul>
      </nav>
    </main>
  );
}
