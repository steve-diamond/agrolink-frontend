"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API from "@/services/api";

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
  approved: boolean;
  farmer: string;
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

// ─── Farmer sub-dashboard ────────────────────────────────────────────────────
function FarmerDashboard({ user }: { user: AuthUser }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get<{ products: Product[] } | Product[]>("/api/products")
      .then((res) => {
        const all = Array.isArray(res.data)
          ? res.data
          : (res.data as any)?.products ?? [];
        setProducts(all.filter((p: Product) => p.farmer === user._id));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [user._id]);

  return (
    <main style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ margin: 0 }}>Farmer Dashboard</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0" }}>Welcome, {user.name}</p>
        </div>
        <Link
          href="/farmer/upload"
          style={{
            background: "#16a34a",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          + Upload New Product
        </Link>
      </div>

      <h2 style={{ color: "#1e293b" }}>My Products</h2>

      {loading && <p>Loading your products…</p>}

      {!loading && products.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
          <p style={{ color: "#64748b", fontSize: "16px" }}>You haven&apos;t listed any products yet.</p>
          <Link href="/farmer/upload" style={{ color: "#16a34a", fontWeight: 600 }}>Upload your first product →</Link>
        </div>
      )}

      <div style={{ display: "grid", gap: "12px" }}>
        {products.map((p) => (
          <div
            key={p._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
              padding: "14px 18px",
              background: p.approved ? "#f0fdf4" : "#fffbeb",
              border: `1px solid ${p.approved ? "#86efac" : "#fde68a"}`,
              borderRadius: "10px",
            }}
          >
            <div>
              <strong style={{ fontSize: "16px" }}>{p.name}</strong>
              <span style={{ marginLeft: "12px", color: "#475569" }}>₦{p.price}</span>
              {p.category && <span style={{ marginLeft: "8px", color: "#94a3b8", fontSize: "12px" }}>{p.category}</span>}
              {p.location && <span style={{ marginLeft: "8px", color: "#94a3b8", fontSize: "12px" }}>📍 {p.location}</span>}
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: p.approved ? "#16a34a" : "#854d0e",
                background: p.approved ? "#dcfce7" : "#fef9c3",
                padding: "3px 10px",
                borderRadius: "99px",
              }}
            >
              {p.approved ? "✓ Approved — visible in marketplace" : "⏳ Pending admin approval"}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}

// ─── Buyer sub-dashboard ─────────────────────────────────────────────────────
function BuyerDashboard({ user }: { user: AuthUser }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get<Order[]>("/api/orders")
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const getItems = (o: Order): OrderLineItem[] => {
    if (Array.isArray(o.products) && o.products.length) return o.products;
    if (o.productId) return [{ productId: o.productId, quantity: o.quantity ?? 0 }];
    return [];
  };

  const getTotal = (o: Order) => Number(o.totalAmount ?? o.totalPrice ?? 0);

  const statusColor: Record<string, string> = {
    pending: "#f59e0b",
    paid: "#3b82f6",
    delivered: "#22c55e",
  };

  return (
    <main style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ margin: 0 }}>Buyer Dashboard</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0" }}>Welcome, {user.name}</p>
        </div>
        <Link
          href="/marketplace"
          style={{
            background: "#2563eb",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Browse Marketplace
        </Link>
      </div>

      <h2 style={{ color: "#1e293b" }}>My Orders</h2>

      {loading && <p>Loading your orders…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
          <p style={{ color: "#64748b", fontSize: "16px" }}>No orders yet.</p>
          <Link href="/marketplace" style={{ color: "#2563eb", fontWeight: 600 }}>Shop the marketplace →</Link>
        </div>
      )}

      <div style={{ display: "grid", gap: "14px" }}>
        {orders.map((order) => {
          const items = getItems(order);
          const total = getTotal(order);
          const status = order.status || "pending";
          return (
            <div
              key={order._id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "16px",
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <strong>{items.length > 1 ? `${items.length} items` : items[0]?.productId?.name ?? "Order"}</strong>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: statusColor[status] ?? "#64748b",
                    background: "#f1f5f9",
                    padding: "2px 10px",
                    borderRadius: "99px",
                    textTransform: "capitalize",
                  }}
                >
                  {status}
                </span>
              </div>
              <p style={{ margin: "8px 0 0", color: "#475569", fontWeight: 600 }}>
                Total: ₦{total.toLocaleString()}
              </p>
              {order.createdAt && (
                <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

// ─── Main dashboard (role router) ────────────────────────────────────────────
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
      const parsed: AuthUser = JSON.parse(raw);
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
    return <main style={{ padding: "40px", textAlign: "center" }}><p>Loading…</p></main>;
  }

  if (user.role === "farmer") return <FarmerDashboard user={user} />;
  if (user.role === "buyer") return <BuyerDashboard user={user} />;

  return null;
}