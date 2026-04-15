// Migrated from agrolink/agrolink/src/app/market-hub/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import API from "@/lib/api";

type Product = {
  _id: string;
  name?: string;
  category?: string;
  location?: string;
  price?: number;
};

const FALLBACK = [
  { crop: "Maize", location: "Kaduna", price: 54500, trend: "up 2.8% this week" },
  { crop: "Rice", location: "Kano", price: 79000, trend: "stable for 5 days" },
  { crop: "Soybean", location: "Benue", price: 62000, trend: "up 1.4% this week" },
];

export default function MarketHubPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const response = await API.get("/api/products", { params: { approved: true, limit: 150 } });
        const data = response.data;
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.products)
          ? data.products
          : [];

        setProducts(items as Product[]);
      } catch {
        setError("Live market feed unavailable. Showing benchmark prices.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const cards = useMemo(() => {
    if (!products.length) {
      return FALLBACK;
    }

    const top = [...products]
      .filter((item) => Number(item.price) > 0)
      .sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
      .slice(0, 3)
      .map((item) => ({
        crop: item.category || item.name || "Produce",
        location: item.location || "Nigeria",
        price: Number(item.price || 0),
        trend: "live backend feed",
      }));

    return top.length ? top : FALLBACK;
  }, [products]);

  return (
    <main className="page">
      <header className="subHeader">
        <div>
          <p className="brandOverline">Market Intelligence</p>
          <h1>Market Hub</h1>
        </div>
        <Link href="/" className="homeLink">Back Home</Link>
      </header>

      {loading ? <p>Loading live market prices...</p> : null}
      {error ? <p className="card infoCard">{error}</p> : null}

      <section className="gridTwo">
        {cards.map((item) => (
          <article key={`${item.crop}-${item.location}`} className="card infoCard">
            <span>{item.crop} - {item.location}</span>
            <strong>NGN {item.price.toLocaleString()} / 100kg</strong>
            <p>Trend: {item.trend}</p>
          </article>
        ))}
      </section>

      <section className="card intention">
        <h2>Buyer Negotiation Desk</h2>
        <p>Connect to verified buyers quickly and negotiate at transparent benchmark prices.</p>
        <div className="ctaRow">
          <a className="btn btnPrimary" href="tel:+2348030001020">Call Agent for Negotiation</a>
          <a className="btn btnSecondary" href="tel:+2348055550112">Call Buyer Desk</a>
        </div>
      </section>
    </main>
  );
}
