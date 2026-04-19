"use client";

import { useEffect, useState } from "react";
import API from "@services/api";

type Order = {
  _id: string;
  status: string;
  totalAmount?: number;
  totalPrice?: number;
  createdAt?: string;
  paymentStatus?: string;
};

export default function OrdersPage() {
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
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Amount</th>
              <th className="border px-4 py-2">Created At</th>
              <th className="border px-4 py-2">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="border px-4 py-2">{order.status}</td>
                <td className="border px-4 py-2">N{Number(order.totalAmount ?? order.totalPrice ?? 0).toLocaleString()}</td>
                <td className="border px-4 py-2">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</td>
                <td className="border px-4 py-2">{order.paymentStatus || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
