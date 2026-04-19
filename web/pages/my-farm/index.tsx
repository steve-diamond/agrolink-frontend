// Migrated from agrolink/agrolink/src/app/my-farm/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import API from "@/lib/api";
import { useAppShell } from "../../components/shared/AppShell";

type Product = {
  _id: string;
  name: string;
  category?: string;
  quantity?: number;
  price?: number;
  approved?: boolean;
};

export default function MyFarmPage() {
  const { user, token } = useAppShell();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "farmer") {
      return;
    }

    const run = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ farmer: user._id, limit: "50" });
        const response = await fetch(`/api/products?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await response.json();
        let items: Product[] = [];
        if (data && data.data && Array.isArray(data.data.items)) {
          items = data.data.items;
        }
        setProducts(items);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [user, token]);

  if (!user) {
    return (
      <main className="page">
        <section className="card intention">
          <h1>My Farm</h1>
          <p>Login to see your products, crop records, and field guidance.</p>
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
          <p className="brandOverline">Field Operations</p>
          <h1>My Farm</h1>
        </div>
        <Link href="/" className="homeLink">Back Home</Link>
      </header>

      <section className="gridTwo">
        <article className="card infoCard">
          <span>Farmer</span>
          <strong>{user.name}</strong>
          <p>{user.email}</p>
        </article>
        <article className="card infoCard">
          <span>Listed Products</span>
          <strong>{products.length}</strong>
          <p>{loading ? "Refreshing farm records..." : "Products currently linked to your account"}</p>
        </article>
        <article className="card infoCard">
          <span>Crop Calendar</span>
          <strong>Apr 12: Plant Maize</strong>
          <p>Apr 24: First fertilizer application reminder.</p>
        </article>
      </section>

      <section className="card intention">
        <h2>Your Live Listings</h2>
        <div className="gridTwo">
          {products.map((product) => (
            <article key={product._id} className="card infoCard">
              <span>{product.category || "Produce"}</span>
              <strong>{product.name}</strong>
              <p>NGN {(typeof product.price === "number" ? product.price : 0).toLocaleString()} · Qty {(typeof product.quantity === "number" ? product.quantity : 0)} · {product.approved ? "Approved" : "Pending"}</p>
            </article>
          ))}
          {!loading && products.length === 0 ? (
            <article className="card infoCard">
              <span>No Listings Yet</span>
              <strong>Start selling produce</strong>
              <p>Create your first product listing from the main AgroLink marketplace app.</p>
            </article>
          ) : null}
        </div>
      </section>
    </main>
  );
}
