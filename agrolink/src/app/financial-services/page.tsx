"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import API from "@/lib/api";
import { useAppShell } from "@/components/AppShell";

type Order = {
  _id: string;
  totalAmount?: number;
  totalPrice?: number;
  status?: string;
  createdAt?: string;
};

export default function FinancialServicesPage() {
  const { user, token } = useAppShell();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    const run = async () => {
      setLoading(true);
      try {
        const response = await API.get("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const items = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setOrders(items);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [user, token]);

  const totalValue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.totalAmount ?? order.totalPrice ?? 0), 0),
    [orders]
  );

  if (!user) {
    return (
      <main className="page">
        <section className="card intention">
          <h1>Financial Services</h1>
          <p>Login to unlock loan visibility, order value history, and contribution tools.</p>
          <div className="ctaRow">
            <Link href="/login" className="btn btnPrimary">Login</Link>
            <Link href="/register" className="btn btnSecondary">Register</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="subHeader">
        <div>
          <p className="brandOverline">Farmer Finance</p>
          <h1>Financial Services</h1>
        </div>
        <Link href="/" className="homeLink">Back Home</Link>
      </header>

      <section className="gridTwo">
        <article className="card infoCard">
          <span>Order Value</span>
          <strong>NGN {totalValue.toLocaleString()}</strong>
          <p>{loading ? "Refreshing your financial summary..." : "Based on live orders linked to your account"}</p>
        </article>
        <article className="card infoCard">
          <span>Order Count</span>
          <strong>{orders.length}</strong>
          <p>Use transaction history to support loan qualification.</p>
        </article>
        <article className="card infoCard">
          <span>Esusu Circle</span>
          <strong>Kafanchan Farmers Circle</strong>
          <p>Weekly contribution target: NGN 5,000.</p>
        </article>
      </section>

      <section className="card intention">
        <h2>Finance Actions</h2>
        <p>Secure cashflow and cooperative savings directly from your dashboard.</p>
        <div className="ctaRow">
          <button className="btn btnPrimary" type="button">Apply for Loan</button>
          <button className="btn btnSecondary" type="button">Pay Esusu Contribution</button>
        </div>
      </section>
    </main>
  );
}
