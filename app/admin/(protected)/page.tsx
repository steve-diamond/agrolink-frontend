import AdminUnifiedCommandCenter from "./AdminUnifiedCommandCenter.client";

// TODO: Replace these with real data fetching logic


import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function fetchData(endpoint) {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      // Add auth headers if needed, e.g. Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return res.json();
}

export default async function AdminProtectedPage() {
  // Optionally get token from cookies if using JWT auth
  // const token = cookies().get("token")?.value;

  const [users, products, orders] = await Promise.all([
    fetchData("users"),
    fetchData("products"),
    fetchData("orders"),
  ]);

  return (
    <AdminUnifiedCommandCenter
      users={users}
      products={products}
      orders={orders}
      currencyFormatter={{ style: "currency", currency: "NGN", locales: "en-NG" }}
    />
  );
}

export default function AdminProtectedPage() {
  return (
    <AdminUnifiedCommandCenter
      users={mockUsers}
      products={mockProducts}
      orders={mockOrders}
      currencyFormatter={currencyFormatter}
      onApproveProduct={onApproveProduct}
    />
  );
}



