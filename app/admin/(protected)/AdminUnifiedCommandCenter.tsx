"use client";
import Image from "next/image";

import { useEffect, useMemo, useState, useCallback } from "react";




import { getUsers, User } from "@services/userService";
import { getProducts, Product } from "@services/productService";
import { getOrders, Order } from "@services/orderService";

import API from "@services/api";

// Real API call for approving a product
const approveProductAPI = async (id: string) => {
  await API.post(`/api/admin/products/${id}/approve`);
};


export default function AdminUnifiedCommandCenter() {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [pendingProductsState, setPendingProductsState] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Action state
  const [approvingProductId, setApprovingProductId] = useState<string | null>(null);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          getUsers(),
          getProducts({ approved: false }),
          getOrders(),
        ]);
        setUsers(usersRes);
        setPendingProductsState(productsRes);
        setOrders(ordersRes);
      } catch (error) {
        setUsers([]);
        setPendingProductsState([]);
        setOrders([]);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived state (memoized)
  const farmers = useMemo(() => users.filter((u) => u.role === "farmer"), [users]);
  const verifiedFarmersCount = useMemo(() => farmers.filter((f) => f.approved).length, [farmers]);
  const pendingProducts = useMemo(() => pendingProductsState, [pendingProductsState]);

  // Handlers
  const handleApproveProduct = useCallback(async (productId: string) => {
    try {
      setApprovingProductId(productId);
      await approveProductAPI(productId);
      // Refetch products after approval
      const productsRes = await getProducts({ approved: false });
      setPendingProductsState(productsRes);
    } catch (error) {
      console.error(error);
    } finally {
      setApprovingProductId(null);
    }
  }, []);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Brand Header & Vision */}
      <header className="flex items-center gap-4 mb-6">
        <Image src="/dos-agrolink-logo.png" alt="DOS Agrolink Logo" width={48} height={48} className="rounded-lg shadow" style={{ background: '#fff' }} />
        <div>
          <span className="text-2xl font-extrabold text-green-900 tracking-tight block">DOS AGROLINK</span>
          <p className="text-xs font-bold tracking-[0.18em] text-amber-700 mt-1">Empowering Farmers. Connecting Markets. Transforming Agriculture.</p>
          <p className="text-sm text-slate-700 max-w-xl mt-1">Our vision is to build a thriving, transparent, and inclusive agri-ecosystem where every farmer, buyer, and partner can prosper through innovation, trust, and collaboration.</p>
        </div>
      </header>
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gray-900 text-white">
          <h2 className="text-sm">Total Farmers</h2>
          <p className="text-2xl font-bold">{farmers.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-green-900 text-white">
          <h2 className="text-sm">Verified Farmers</h2>
          <p className="text-2xl font-bold">{verifiedFarmersCount}</p>
        </div>
      </div>

      {/* Pending Products */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Pending Products</h2>
        <div className="grid gap-3">
          {pendingProducts.map((product) => {
            const isApproving = approvingProductId === product._id;
            return (
              <div
                key={product._id}
                className="p-4 rounded-xl border border-gray-700"
              >
                <p className="font-medium">{product.name}</p>
                <button
                  type="button"
                  disabled={isApproving}
                  onClick={() => handleApproveProduct(product._id)}
                  className="mt-3 rounded-lg border border-emerald-400/70 bg-emerald-900/30 px-3 py-2 text-xs font-semibold text-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isApproving ? "Approving..." : "Approve"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Orders Table - Enhanced */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Orders</h2>
        <div className="grid gap-4">
          {orders.slice(0, 10).map((order, index) => {
            // Normalize product and buyer with safe defaults
            type NormalizedProduct = { name?: string; location?: string; price?: number };
            let product: NormalizedProduct = { name: undefined, location: undefined, price: undefined };
            if (order.productId && typeof order.productId === "object") {
              product = {
                name: (order.productId as any).name,
                location: (order.productId as any).location ?? undefined,
                price: (order.productId as any).price ?? undefined,
              };
            } else if (typeof order.productId === "string") {
              product = { name: order.productId, location: undefined, price: undefined };
            }
            // Always ensure product has all keys
            product = {
              name: product.name,
              location: product.location,
              price: product.price,
            };
            const buyer = order.buyerId || { name: order.buyer || "Unknown", email: "" };
            const total = (order as any).totalAmount ?? (order as any).totalPrice ?? 0;
            const paymentStatus = (order as any).paymentStatus ?? "pending";
            const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString() : "-";
            const quantity = order.quantity ?? (order.products ? order.products.reduce((sum, p) => sum + (p.quantity || 0), 0) : "-");
            return (
              <div key={order._id || index} className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 shadow">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-emerald-200">Order #{order._id}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${order.status === "delivered" ? "bg-emerald-900/40 text-emerald-200" : order.status === "paid" ? "bg-blue-900/40 text-blue-200" : "bg-amber-900/40 text-amber-200"}`}>{order.status}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <div className="font-semibold text-slate-100">Product: <span className="text-slate-300">{product.name}</span></div>
                    {product.location && (
                      <div className="text-xs text-slate-400">Location: {product.location}</div>
                    )}
                    {typeof product.price === "number" && !isNaN(product.price) && (
                      <div className="text-xs text-slate-400">Unit Price: ₦{Number(product.price).toLocaleString()}</div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100">Buyer: <span className="text-slate-300">{buyer.name}</span></div>
                    {buyer.email && <div className="text-xs text-slate-400">Email: {buyer.email}</div>}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-300">
                  <span>Quantity: <strong>{quantity}</strong></span>
                  <span>Total: <strong>₦{Number(total).toLocaleString()}</strong></span>
                  <span>Payment: <strong className="uppercase">{paymentStatus}</strong></span>
                  <span>Placed: <strong>{createdAt}</strong></span>
                </div>
              </div>
            );
          })}
          {orders.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-slate-500 border border-slate-700 rounded-xl bg-slate-900/70">
              No orders available for this period.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
