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

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/login");
      return;
    }

    API.get<Order[]>("/api/orders")
      .then((res) => setOrders(res.data))
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
        {orders.map((order) => (
          <div
            key={order._id}
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
