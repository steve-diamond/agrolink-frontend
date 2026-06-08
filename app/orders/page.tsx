"use client";

import PullToRefresh from "../../components/PullToRefresh";
import { useOrders } from "../../lib/hooks/useOrders";

export default function OrdersPage() {
  const { data: orders = [], isPending, refetch } = useOrders();

  const handleRefresh = async (): Promise<void> => {
    await refetch();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} successMessage="Orders refreshed">
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      {isPending ? (
        <p role="status" aria-busy="true">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="min-w-full border" aria-label="Your orders">
          <caption className="sr-only">List of your orders with status, amount, date, and payment information</caption>
          <thead>
            <tr>
              <th scope="col" className="border px-4 py-2">Status</th>
              <th scope="col" className="border px-4 py-2">Amount</th>
              <th scope="col" className="border px-4 py-2">Created At</th>
              <th scope="col" className="border px-4 py-2">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="border px-4 py-2">{order.status}</td>
                <td className="border px-4 py-2">N{Number((order as { totalAmount?: number; totalPrice?: number }).totalAmount ?? (order as { totalAmount?: number; totalPrice?: number }).totalPrice ?? 0).toLocaleString()}</td>
                <td className="border px-4 py-2">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</td>
                <td className="border px-4 py-2">{(order as { paymentStatus?: string }).paymentStatus || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
    </PullToRefresh>
  );
}
