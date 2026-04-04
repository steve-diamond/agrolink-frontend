"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API from "@/services/api";

type OrderProduct = {
  _id: string;
  name: string;
  price: number;
  location: string;
  farmer?: string;
};

type OrderLineItem = {
  productId: OrderProduct;
  quantity: number;
};

type OrderBuyer = {
  _id: string;
  name: string;
  email: string;
};

type Order = {
  _id: string;
  productId: OrderProduct;
  buyerId: OrderBuyer;
  products?: OrderLineItem[];
  quantity: number;
  totalPrice: number;
  totalAmount?: number;
  paymentStatus?: "pending" | "paid";
  status: "pending" | "paid" | "delivered";
  createdAt: string;
};

const normalizeProduct = (value: unknown): OrderProduct => {
  if (!value || typeof value !== "object") {
    return {
      _id: "unknown-product",
      name: "Unknown Product",
      price: 0,
      location: "No location",
    };
  }

  const raw = value as Partial<OrderProduct>;
  return {
    _id: String(raw._id ?? "unknown-product"),
    name: String(raw.name ?? "Unknown Product"),
    price: Number(raw.price ?? 0),
    location: String(raw.location ?? "No location"),
    farmer: raw.farmer ? String(raw.farmer) : undefined,
  };
};

const normalizeBuyer = (value: unknown): OrderBuyer => {
  if (!value || typeof value !== "object") {
    return {
      _id: "unknown-buyer",
      name: "Unknown Buyer",
      email: "Unknown email",
    };
  }

  const raw = value as Partial<OrderBuyer>;
  return {
    _id: String(raw._id ?? "unknown-buyer"),
    name: String(raw.name ?? "Unknown Buyer"),
    email: String(raw.email ?? "Unknown email"),
  };
};

const normalizeOrderLineItem = (value: unknown): OrderLineItem | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Partial<OrderLineItem>;
  return {
    productId: normalizeProduct(raw.productId),
    quantity: Number(raw.quantity ?? 0),
  };
};

const normalizeOrder = (value: unknown, index: number): Order | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Partial<Order>;
  const lineItems = Array.isArray(raw.products)
    ? raw.products
        .map((item) => normalizeOrderLineItem(item))
        .filter((item): item is OrderLineItem => Boolean(item))
    : undefined;

  const normalizedStatus: Order["status"] =
    raw.status === "paid" || raw.status === "delivered" || raw.status === "pending"
      ? raw.status
      : "pending";

  const normalizedPayment: Order["paymentStatus"] =
    raw.paymentStatus === "paid" || raw.paymentStatus === "pending" ? raw.paymentStatus : "pending";

  return {
    _id: String(raw._id ?? `order-${index}`),
    productId: normalizeProduct(raw.productId),
    buyerId: normalizeBuyer(raw.buyerId),
    products: lineItems,
    quantity: Number(raw.quantity ?? lineItems?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) ?? 0),
    totalPrice: Number(raw.totalPrice ?? raw.totalAmount ?? 0),
    totalAmount: raw.totalAmount == null ? undefined : Number(raw.totalAmount),
    paymentStatus: normalizedPayment,
    status: normalizedStatus,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
  };
};

const normalizeOrdersResponse = (data: unknown): Order[] => {
  const rawList = Array.isArray(data)
    ? data
    : Array.isArray((data as { orders?: unknown[] })?.orders)
    ? (data as { orders: unknown[] }).orders
    : Array.isArray((data as { data?: unknown[] })?.data)
    ? (data as { data: unknown[] }).data
    : [];

  return rawList
    .map((item, index) => normalizeOrder(item, index))
    .filter((item): item is Order => Boolean(item));
};

const statusBadgeClass: Record<Order["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/login");
      return;
    }

    API.get("/api/orders")
      .then((res) => {
        const normalized = normalizeOrdersResponse(res.data as unknown);
        setOrders(normalized);
      })
      .catch((err) => setError(err?.response?.data?.message || "Failed to load orders."))
      .finally(() => setLoading(false));
  }, [router]);

  const resolveOrderItems = (order: Order) => {
    if (Array.isArray(order.products) && order.products.length > 0) {
      return order.products;
    }

    if (order.productId) {
      return [{ productId: order.productId, quantity: order.quantity }];
    }

    return [];
  };

  const totalValue = orders.reduce((sum, order) => sum + Number(order.totalAmount ?? order.totalPrice ?? 0), 0);
  const deliveredCount = orders.filter((order) => order.status === "delivered").length;

  return (
    <main className="mx-auto grid max-w-5xl gap-4">
      <section className="rounded-2xl border border-green-900/25 bg-linear-to-br from-green-950 via-green-900 to-green-700 p-5 text-green-50 shadow-xl shadow-green-900/25">
        <p className="m-0 text-xs uppercase tracking-[0.16em] text-green-100">Order Management</p>
        <h1 className="m-0 mt-1 text-3xl font-bold">My Orders</h1>
        <p className="mb-0 mt-2 text-sm text-green-100">Track placed orders, payment status, and delivery progress in one branded view.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="card p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Total Orders</p>
          <p className="m-0 mt-1 text-2xl font-bold text-green-950">{orders.length}</p>
        </article>
        <article className="card p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Delivered</p>
          <p className="m-0 mt-1 text-2xl font-bold text-emerald-700">{deliveredCount}</p>
        </article>
        <article className="card p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Order Value</p>
          <p className="m-0 mt-1 text-2xl font-bold text-green-950">NGN {totalValue.toLocaleString()}</p>
        </article>
      </section>

      {loading ? <p className="m-0 text-sm text-slate-600">Loading orders...</p> : null}
      {error ? <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {!loading && !error && orders.length === 0 ? (
        <section className="card border-dashed p-5 text-center">
          <p className="m-0 text-slate-600">No orders found yet.</p>
          <Link href="/marketplace" className="mt-3 inline-block font-bold text-green-700 no-underline">Browse marketplace</Link>
        </section>
      ) : null}

      <section className="grid gap-3">
        {orders.map((order, index) => (
          <article key={order?._id || `order-${index}`} className="card p-4">
            {(() => {
              const items = resolveOrderItems(order);
              const total = order.totalAmount ?? order.totalPrice;

              return (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="m-0 text-lg font-bold text-green-950">
                      {items.length > 1 ? `${items.length} items` : items[0]?.productId?.name ?? "Unknown Product"}
                    </h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusBadgeClass[order.status] ?? "bg-slate-100 text-slate-700"}`}>
                      {order.status}
                    </span>
                  </div>

                  <p className="m-0 mt-2 text-sm text-slate-700">
                    Buyer: <strong>{order.buyerId?.name}</strong> ({order.buyerId?.email})
                  </p>

                  <div className="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
              {items.map((item, index) => (
                <div
                  key={`${order._id}-${item.productId?._id ?? index}`}
                  className={`flex justify-between gap-3 rounded-md bg-white px-2 py-2 ${index > 0 ? "border-t border-slate-100" : ""}`}
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{item.productId?.name ?? "Unknown Product"}</div>
                    <div className="text-xs text-slate-500">{item.productId?.location ?? "No location"}</div>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap">
                    <div>Qty: {item.quantity}</div>
                    <div className="text-xs text-slate-500">
                      ₦{Number(item.productId?.price ?? 0).toLocaleString()} each
                    </div>
                  </div>
                </div>
              ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700">
                    <p className="m-0">Total Quantity: <strong>{order.quantity}</strong></p>
                    <p className="m-0">Total: <strong>₦{Number(total).toLocaleString()}</strong></p>
                    <p className="m-0">Payment: <strong className="uppercase">{order.paymentStatus ?? "pending"}</strong></p>
                  </div>

                  <p className="m-0 mt-2 text-xs text-slate-500">Placed: {new Date(order.createdAt).toLocaleString()}</p>
                </>
              );
            })()}
          </article>
        ))}
      </section>
    </main>
  );
}
