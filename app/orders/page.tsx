"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
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

  const statusColor: Record<string, string> = {
    pending: "#f59e0b",
    paid: "#3b82f6",
    delivered: "#22c55e",
  };

  const resolveOrderItems = (order: Order) => {
    if (Array.isArray(order.products) && order.products.length > 0) {
      return order.products;
    }

    if (order.productId) {
      return [{ productId: order.productId, quantity: order.quantity }];
    }

    return [];
  };

  return (
    <main style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Orders</h1>
      <p style={{ color: "#555" }}>All placed orders.</p>

      {loading && <p>Loading orders...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && orders.length === 0 && !error && (
        <p>No orders found.</p>
      )}

      <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
        {orders.map((order, index) => (
          <div
            key={order?._id || `order-${index}`}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              background: "#fff",
            }}
          >
            {(() => {
              const items = resolveOrderItems(order);
              const total = order.totalAmount ?? order.totalPrice;

              return (
                <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>
                {items.length > 1 ? `${items.length} items` : items[0]?.productId?.name ?? "Unknown Product"}
              </h2>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "12px",
                  background: statusColor[order.status] ?? "#ccc",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "13px",
                  textTransform: "capitalize",
                }}
              >
                {order.status}
              </span>
            </div>

            <p style={{ margin: "8px 0 0" }}>
              Buyer: <strong>{order.buyerId?.name}</strong> ({order.buyerId?.email})
            </p>
            <div style={{ margin: "10px 0" }}>
              {items.map((item, index) => (
                <div
                  key={`${order._id}-${item.productId?._id ?? index}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "8px 0",
                    borderTop: index === 0 ? "1px solid #eee" : "1px solid #f3f4f6",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.productId?.name ?? "Unknown Product"}</div>
                    <div style={{ color: "#666", fontSize: "13px" }}>{item.productId?.location ?? "No location"}</div>
                  </div>
                  <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <div>Qty: {item.quantity}</div>
                    <div style={{ color: "#666", fontSize: "13px" }}>
                      ₦{Number(item.productId?.price ?? 0).toLocaleString()} each
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ margin: "4px 0" }}>Total Quantity: {order.quantity}</p>
            <p style={{ margin: "4px 0" }}>
              Total: <strong>₦{Number(total).toLocaleString()}</strong>
            </p>
            <p style={{ margin: "4px 0", color: "#555" }}>
              Payment: <strong style={{ textTransform: "capitalize" }}>{order.paymentStatus ?? "pending"}</strong>
            </p>
            <p style={{ margin: "4px 0", color: "#888", fontSize: "13px" }}>
              Placed: {new Date(order.createdAt).toLocaleString()}
            </p>
                </>
              );
            })()}
          </div>
        ))}
      </div>
    </main>
  );
}
