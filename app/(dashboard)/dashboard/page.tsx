"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API from "@/services/api";
import { normalizeProductsResponse } from "@/services/productService";
import { useLocalizedCopy } from "@/services/useLocalizedCopy";

type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: "farmer" | "buyer" | "admin";
};

type Product = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  location?: string;
  approved?: boolean;
  farmer?: string;
};

type OrderLineItem = {
  productId?: { _id?: string; name?: string; price?: number };
  quantity: number;
};

type Order = {
  _id: string;
  products?: OrderLineItem[];
  productId?: { _id?: string; name?: string; price?: number };
  quantity?: number;
  totalAmount?: number;
  totalPrice?: number;
  status: string;
  paymentStatus?: string;
  createdAt?: string;
};

function FarmerDashboard({ user }: { user: AuthUser }) {
  const { copy } = useLocalizedCopy();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/api/products", { params: { farmer: user._id } })
      .then((res) => {
        const all = normalizeProductsResponse(res.data as unknown);
        setProducts(all.filter((p: Product) => p.farmer === user._id));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [user._id]);

  return (
    <main className="mx-auto grid max-w-5xl gap-4">
      <section className="card bg-gradient-to-br from-green-950 via-green-900 to-green-700 p-5 text-green-50">
        <p className="m-0 text-xs uppercase tracking-[0.16em] text-green-100">{copy.myFarm}</p>
        <h1 className="m-0 mt-1 text-3xl font-bold">{copy.welcome}, {user.name}</h1>
        <p className="mb-0 mt-2 text-sm text-green-100">Track crop listings and sync updates even with weak network.</p>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-xl font-bold text-green-950">{copy.myProducts}</h2>
        <Link href="/farmer/upload" className="btn-primary touch-target inline-flex items-center justify-center px-4 no-underline">
          + {copy.uploadNewProduct}
        </Link>
      </section>

      {loading ? <p className="m-0 text-sm text-slate-600">{copy.loadingProducts}</p> : null}

      {!loading && products.length === 0 ? (
        <section className="card border-dashed p-5 text-center">
          <p className="m-0 text-slate-600">{copy.noProductsYet}</p>
          <Link href="/farmer/upload" className="mt-3 inline-block font-bold text-green-700 no-underline">{copy.uploadFirstProduct}</Link>
        </section>
      ) : null}

      <section className="grid gap-3">
        {products.map((product) => (
          <article key={product._id} className={`card p-4 ${product.approved ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="m-0 text-lg font-bold text-green-950">{product.name}</h3>
                <p className="m-0 mt-1 text-sm text-slate-600">NGN {Number(product.price).toLocaleString()} · Qty {product.quantity}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${product.approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {product.approved ? copy.approved : copy.pending}
              </span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function BuyerDashboard({ user }: { user: AuthUser }) {
  const { copy } = useLocalizedCopy();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get<Order[]>("/api/orders")
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const getItems = (order: Order): OrderLineItem[] => {
    if (Array.isArray(order.products) && order.products.length) return order.products;
    if (order.productId) return [{ productId: order.productId, quantity: order.quantity ?? 0 }];
    return [];
  };

  return (
    <main className="mx-auto grid max-w-5xl gap-4">
      <section className="card bg-gradient-to-br from-green-950 via-green-900 to-green-700 p-5 text-green-50">
        <p className="m-0 text-xs uppercase tracking-[0.16em] text-green-100">{copy.marketHub}</p>
        <h1 className="m-0 mt-1 text-3xl font-bold">{copy.welcome}, {user.name}</h1>
        <p className="mb-0 mt-2 text-sm text-green-100">Check order status and negotiate with trusted farmers.</p>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-xl font-bold text-green-950">{copy.myOrders}</h2>
        <Link href="/marketplace" className="btn-primary touch-target inline-flex items-center justify-center px-4 no-underline">
          {copy.marketHub}
        </Link>
      </section>

      {loading ? <p className="m-0 text-sm text-slate-600">{copy.loadingOrders}</p> : null}
      {error ? <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

      {!loading && !error && orders.length === 0 ? (
        <section className="card border-dashed p-5 text-center">
          <p className="m-0 text-slate-600">{copy.noOrdersYet}</p>
          <Link href="/marketplace" className="mt-3 inline-block font-bold text-green-700 no-underline">{copy.browseMarketplace}</Link>
        </section>
      ) : null}

      <section className="grid gap-3">
        {orders.map((order) => {
          const items = getItems(order);
          const total = Number(order.totalAmount ?? order.totalPrice ?? 0);
          return (
            <article key={order._id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="m-0 text-base font-bold text-green-950">
                  {items.length > 1 ? `${items.length} items` : items[0]?.productId?.name || "Order"}
                </h3>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">{order.status}</span>
              </div>
              <p className="m-0 mt-2 text-sm text-slate-700">Total: NGN {total.toLocaleString()}</p>
              {order.createdAt ? <p className="m-0 mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p> : null}
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");

    if (!token || !raw) {
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as AuthUser;
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
    return <main className="p-8 text-center text-slate-600">Loading...</main>;
  }

  if (user.role === "farmer") return <FarmerDashboard user={user} />;
  if (user.role === "buyer") return <BuyerDashboard user={user} />;

  return null;
}