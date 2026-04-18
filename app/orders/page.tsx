    const [userRole, setUserRole] = useState<string>("user");
    useEffect(() => {
      if (typeof window !== "undefined") {
        setUserRole(localStorage.getItem("role") || "user");
      }
    }, []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelect = (orderId: string, checked: boolean) => {
    setSelectedIds((prev) => checked ? [...prev, orderId] : prev.filter(id => id !== orderId));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? paginatedOrders.map(o => o._id) : []);
  };

  const handleBulkCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel selected orders?")) return;
    for (const id of selectedIds) {
      await handleCancelOrder(id);
    }
    setSelectedIds([]);
  };
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveAs } from "file-saver";
import Image from "next/image";
import API from "@services/api";
import { useCallback } from "react";

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<{ quantity: number; buyerName: string; buyerEmail: string } | null>(null);

  // Start editing handler
  const handleEdit = (order: Order) => {
    setEditingId(order._id);
    setEditFields({
      quantity: order.quantity,
      buyerName: order.buyerId?.name || "",
      buyerEmail: order.buyerId?.email || "",
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFields(null);
  };

  // Save edit
  const handleSaveEdit = async (orderId: string) => {
    if (!editFields) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: editFields.quantity,
          buyerId: { name: editFields.buyerName, email: editFields.buyerEmail },
        }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, quantity: editFields.quantity, buyerId: { ...o.buyerId, name: editFields.buyerName, email: editFields.buyerEmail } } : o));
      setEditingId(null);
      setEditFields(null);
    } catch {
      alert("Failed to update order. Please try again.");
    }
  };
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

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Cancel order handler
  const handleCancelOrder = useCallback(async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancellingId(orderId);
    try {
      await API.post(`/api/orders/${orderId}/cancel`);
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: "cancelled" } : o));
    } catch (err) {
      alert("Failed to cancel order. Please try again.");
    } finally {
      setCancellingId(null);
    }
  }, []);
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

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

  // Filtering logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      search.trim() === "" ||
      order.productId.name.toLowerCase().includes(search.toLowerCase()) ||
      order.buyerId.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);
  const totalValue = filteredOrders.reduce((sum, order) => sum + Number(order.totalAmount ?? order.totalPrice ?? 0), 0);
  const deliveredCount = filteredOrders.filter((order) => order.status === "delivered").length;

  // Reset to page 1 if filters/search change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  return (
    <main className="mx-auto grid max-w-5xl gap-4 sm:gap-5 py-4 sm:py-6 px-2 sm:px-0">
      <header className="flex items-center gap-3 mb-4">
        <Image src="/dos-agrolink-logo.png" alt="DOS Agrolink Logo" width={40} height={40} className="rounded-lg shadow" priority />
        <span className="text-lg font-extrabold text-green-900 tracking-tight">DOS AGROLINK</span>
      </header>
      <section className="rounded-2xl border border-green-900/25 bg-linear-to-br from-green-950 via-green-900 to-green-700 p-5 text-green-50 shadow-xl shadow-green-900/25">
        <p className="m-0 text-xs uppercase tracking-[0.16em] text-green-100">Order Management</p>
        <h1 className="m-0 mt-1 text-3xl font-bold">My Orders</h1>
        <p className="mb-0 mt-2 text-sm text-green-100">Track placed orders, payment status, and delivery progress in one branded view.</p>
      </section>

      <section className="flex flex-wrap gap-3 items-center mb-2">
        <button
          className="border rounded px-3 py-2 text-sm bg-green-700 text-white hover:bg-green-800"
          onClick={() => {
            const csvRows = [
              ["Order ID","Product","Buyer","Quantity","Total","Status","Created"],
              ...filteredOrders.map(o => [
                o._id,
                o.productId?.name || "",
                o.buyerId?.name || "",
                o.quantity,
                o.totalAmount ?? o.totalPrice,
                o.status,
                o.createdAt
              ])
            ];
            const csv = csvRows.map(r => r.map(String).map(s => '"'+s.replace(/"/g,'""')+'"').join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            saveAs(blob, `orders-${Date.now()}.csv`);
          }}
        >
          Export CSV
        </button>
        <input
          type="text"
          placeholder="Search by product or buyer..."
          className="border rounded px-3 py-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="delivered">Delivered</option>
        </select>
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

      {!loading && !error && filteredOrders.length === 0 ? (
        <section className="card border-dashed p-5 text-center">
          <p className="m-0 text-slate-600">No orders found yet.</p>
          <Link href="/marketplace" className="mt-3 inline-block font-bold text-green-700 no-underline">Browse marketplace</Link>
        </section>
      ) : null}

      {userRole === "admin" && (
        <div className="flex items-center gap-3 mb-2">
          <input
            type="checkbox"
            checked={selectedIds.length === paginatedOrders.length && paginatedOrders.length > 0}
            onChange={e => handleSelectAll(e.target.checked)}
          />
          <span>Select All</span>
          <button
            className="border rounded px-3 py-1 text-sm bg-red-700 text-white disabled:opacity-50"
            disabled={selectedIds.length === 0}
            onClick={handleBulkCancel}
          >
            Cancel Selected
          </button>
        </div>
      )}
      <section className="grid gap-3">
        {paginatedOrders.map((order, index) => {
          const checked = selectedIds.includes(order._id);
          const items = resolveOrderItems(order);
          const total = order.totalAmount ?? order.totalPrice;
          const isEditing = editingId === order._id;
          return (
            <article key={order?._id || `order-${index}`} className="card p-4">
              <input
                type="checkbox"
                className="mr-2 align-middle"
                checked={checked}
                onChange={e => handleSelect(order._id, e.target.checked)}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="m-0 text-lg font-bold text-green-950">
                  {items.length > 1 ? `${items.length} items` : items[0]?.productId?.name ?? "Unknown Product"}
                </h2>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusBadgeClass[order.status] ?? "bg-slate-100 text-slate-700"}`}>
                  {order.status}
                </span>
              </div>

              <p className="m-0 mt-2 text-sm text-slate-700">
                Buyer: {isEditing ? (
                  <>
                    <input
                      type="text"
                      className="border rounded px-2 py-1 text-sm mr-2"
                      value={editFields?.buyerName ?? ""}
                      onChange={e => setEditFields(f => f ? { ...f, buyerName: e.target.value } : f)}
                      placeholder="Name"
                    />
                    <input
                      type="email"
                      className="border rounded px-2 py-1 text-sm"
                      value={editFields?.buyerEmail ?? ""}
                      onChange={e => setEditFields(f => f ? { ...f, buyerEmail: e.target.value } : f)}
                      placeholder="Email"
                    />
                  </>
                ) : <><strong>{order.buyerId?.name}</strong> ({order.buyerId?.email})</>}
              </p>

              <div className="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                {items.map((item, idx) => (
                  <div
                    key={`${order._id}-${item.productId?._id ?? idx}`}
                    className={`flex justify-between gap-3 rounded-md bg-white px-2 py-2 ${idx > 0 ? "border-t border-slate-100" : ""}`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{item.productId?.name ?? "Unknown Product"}</div>
                      <div className="text-xs text-slate-500">{item.productId?.location ?? "No location"}</div>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap">
                      <div>
                        Qty: {isEditing ? (
                          <input
                            type="number"
                            className="border rounded px-2 py-1 text-sm w-16"
                            value={editFields?.quantity ?? 0}
                            min={1}
                            onChange={e => setEditFields(f => f ? { ...f, quantity: Number(e.target.value) } : f)}
                          />
                        ) : item.quantity}
                      </div>
                      <div className="text-xs text-slate-500">
                        ₦{Number(item.productId?.price ?? 0).toLocaleString()} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700 items-center">
                <p className="m-0">Total Quantity: <strong>{isEditing ? editFields?.quantity : order.quantity}</strong></p>
                <p className="m-0">Total: <strong>₦{Number(total).toLocaleString()}</strong></p>
                <p className="m-0">Payment: <strong className="uppercase">{order.paymentStatus ?? "pending"}</strong></p>
                {order.status === "pending" && !isEditing && (userRole === "admin" || order.buyerId?.email === (typeof window !== "undefined" ? localStorage.getItem("email") : undefined)) && (
                  <button
                    className="ml-2 px-3 py-1 border border-blue-400 text-blue-700 rounded hover:bg-blue-50 disabled:opacity-50"
                    onClick={() => handleEdit(order)}
                  >
                    Edit
                  </button>
                )}
                {order.status === "pending" && isEditing && (userRole === "admin" || order.buyerId?.email === (typeof window !== "undefined" ? localStorage.getItem("email") : undefined)) && (
                  <>
                    <button
                      className="ml-2 px-3 py-1 border border-green-400 text-green-700 rounded hover:bg-green-50 disabled:opacity-50"
                      onClick={() => handleSaveEdit(order._id)}
                    >
                      Save
                    </button>
                    <button
                      className="ml-2 px-3 py-1 border border-gray-400 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </>
                )}
                {order.status === "pending" && !isEditing && (userRole === "admin" || order.buyerId?.email === (typeof window !== "undefined" ? localStorage.getItem("email") : undefined)) && (
                  <button
                    className="ml-2 px-3 py-1 border border-red-400 text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                    disabled={cancellingId === order._id}
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    {cancellingId === order._id ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}
              </div>

              <p className="m-0 mt-2 text-xs text-slate-500">Placed: {new Date(order.createdAt).toLocaleString()}</p>
            </article>
          );
        })}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 border rounded ${page === i + 1 ? "bg-green-700 text-white" : ""}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
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


                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700 items-center">
                    <p className="m-0">Total Quantity: <strong>{order.quantity}</strong></p>
                    <p className="m-0">Total: <strong>₦{Number(total).toLocaleString()}</strong></p>
                    <p className="m-0">Payment: <strong className="uppercase">{order.paymentStatus ?? "pending"}</strong></p>
                    {order.status === "pending" && (
                      <button
                        className="ml-2 px-3 py-1 border border-red-400 text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                        disabled={cancellingId === order._id}
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        {cancellingId === order._id ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
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
