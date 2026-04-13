import AdminUnifiedCommandCenter from "./AdminUnifiedCommandCenter.client";

// TODO: Replace these with real data fetching logic


import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";


async function fetchData(endpoint: string) {
  // Try to get token from cookies (server-side) or localStorage (client-side fallback)
  let token = null;
  try {
      const cookieStore = await cookies();
      token = cookieStore.get("token")?.value;
  } catch {
    // Not in server context, try client
    if (typeof window !== "undefined") {
      token = localStorage.getItem("token");
    }
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/${endpoint}`, {
    headers,
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
      currencyFormatter={new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" })}
    />
  );
}





